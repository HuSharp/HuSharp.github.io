---
layout: blog
title:  "Flashback TiKV Chinese"
date:   2023-05-20 17:43:28 +0800
category: distributed
---

* content
{:toc}

这是一篇原本要作为产品介绍的文章，但种种原因搁置了，最近又在完善相关功能，索性就完善一下发出来。感恩 [JmPotato](https://ipotato.me/) 哥哥的带飞~

代码请见：[roadmap](https://github.com/pingcap/tidb/issues/37197) & [TiKV tracking issue](https://github.com/tikv/tikv/issues/13303)

## 背景介绍

Flashback（通常指 Oracle Flashback）是用于在用户发生误操作的时候，快速回滚至原先版本，避免产生重大损失的特性。

游戏行业中会不时出现版本错误等问题，定期的备份只能回滚到备份时间点，且浪费资源。TiDB v6.4.0 引入了 FLASHBACK CLUSTER TO TIMESTAMP 语法，其功能是将集群、数据库、数据表的数据恢复到特定的时间点。

在 TiDB 中，存在一些相关的功能：

- MVCC & GC：数据更新或删除都是增加新版本，历史版本通过 GC 机制进行清理。存储引擎中保存有一定时间内的历史记录，这为之后的各种恢复数据功能提供了可能。
- 通过系统变量 tidb_snapshot 读取历史数据：指定一个 ts（不能早于 GC safepoint），读取对应时间点的数据，并且保证数据是一致的。
- FLASHBACK TABLE：恢复被 DROP 或 TRUNCATE 删除的表以及数据。

我们最终采用在多版本并发控制（MVCC）的基础上，取出 TIMESTAMP 之前的最新时间戳数据来覆盖当前的数据。

### 执行与效果

『详细操作请参考 [用户文档](https://docs.pingcap.com/zh/tidb/dev/sql-statement-flashback-to-timestamp)』

```sql
mysql> CREATE TABLE t(a INT);
Query OK, 0 rows affected (0.09 sec)

mysql> SELECT * FROM t;
Empty set (0.01 sec)

mysql> SELECT now();
+---------------------+
| now()               |
+---------------------+
| 2022-09-28 17:24:16 |
+---------------------+
1 row in set (0.02 sec)

mysql> INSERT INTO t VALUES (1);
Query OK, 1 row affected (0.02 sec)

mysql> SELECT * FROM t;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.01 sec)

mysql> FLASHBACK CLUSTER TO TIMESTAMP '2022-09-28 17:24:16';
Query OK, 0 rows affected (0.20 sec)

mysql> SELECT * FROM t;
Empty set (0.00 sec)
```

### 具体实现

#### 采用 Region 锁停读写调度

我们在 Flashback 中采用 Region 锁来阻断 Flashback 过程中的所有读写以及调度，避免产生任何可能导致数据不一致的外部因素。

**通过给 Region 先上锁再 Flashback，我们可以获得以下好处：**

- 阻断任何 Flashback 过程中的读写以及调度，避免产生任何可能导致数据不一致的外部因素；
- 由于上锁后的 Region 不会产生额外的数据写入，便于 Flashback 自由地写入和重试；
- 由于上锁后的 Region 不会产生额外的数据写入，不再需要额外维护集群内不同 Store 和不同 Region 当前的 Flashback 成功失败状态，只需要无脑重试直到成功即可；
- Region 级别更符合 TiKV 内部数据管理的粒度。

#### 大致流程

TiDB 首先会去判断：

- FlashbackTS：是否是未来时间点，是否大于 minSafeTS，是否在 GC Safe time 内 
- 是否有非 Flashback ddl job 在时间范围内执行过
- 是否有 DDL 任务正在执行
- 关闭 GC，PD 调度和 auto analyze 然后开始调用 TiKV 的两阶段
- **第一阶段（Region 锁定）**
    1. TiDB 来确定执行 Flashback 请求的 key range；
    2. TiDB 以 region 为单位，向不同 region 发送 kv_prepare_flashback_to_version 请求，阻止读、写和调度；
    3. 调用 PD 接口去拿最新的 TSO，作为执行 Flashback 的 startTS。TiDB 会持久化该 startTS，来保证 TiDB 在失败重启后也能使用相同 TS；
    4. 用 Region 锁来让每个 Region 独立处理自己的 Flashback 进度
        - 扫描所有的 MVCC Lock 并进行 rollback；
        - TiKV 会在 CF_WRITE 中选择最新的 user key，并以上面提到的 startTS 先 Prewrite 上一个锁，停止 resolved_ts 的推进，将在第二阶段 Commit 上；
    5. TiDB 检查所有请求是否成功返回，并重试失败请求，直到整个锁定阶段完成。
- **第二阶段（执行 Flashback）**
    1. TiDB 取上面提到的 startTS，以及去 PD 拿最新的 TSO 作为 commitTS，TiDB 同样会持久化该 startTS，并向不同 region 发送 kv_flashback_to_version 请求 ；
    2. 每个 Region 独立处理自己的 Flashback 进度
        - 扫描出需要 Flashback 到的时间点以后有版本变化的键，为扫描出的键写上旧的 MVCC 版本；
        - Commit 第一阶段中 Prewrite 写入的锁，并在完成后摘掉 Region 锁；
    3. TiDB 检查所有请求是否成功返回，并以相同的 startTS 和 commitTS 重试那些失败的请求，直到整个 Flashback 执行完成。

## 代码分析

让我们从 TiKV 启动开始说起 :)

从 cmd/tikv-server/main.rs 开始，TiKV 完成配置一系列参数后，main 函数末尾走到 server::run_tikv(config) 运行 TiKV server，通过 main 中所配置的参数选择对应 Engine，调用 run_impl 函数，在 run_server 中进行绑定，并启动 grpc_server.start(); 服务。具体的绑定启动流程可以查看[此文档](https://cn.pingcap.com/blog/tikv-source-code-reading-7)。

本文关注的 Flashback 位于 [kvproto](https://github.com/pingcap/kvproto/blob/master/proto/tikvpb.proto#L20) 对应的此处

```protobuf
rpc KvPrepareFlashbackToVersion(kvrpcpb.PrepareFlashbackToVersionRequest) returns (kvrpcpb.PrepareFlashbackToVersionResponse) {}
rpc KvFlashbackToVersion(kvrpcpb.FlashbackToVersionRequest) returns (kvrpcpb.FlashbackToVersionResponse) {}
```

回到 TiKV 代码，TiKV 包含多个 gRPC service。其中最重要的一个是 KvService，位于 src/server/service/kv.rs 文件中。包括 TiKV 的 kv_get，kv_scan，kv_prewrite，kv_commit 等事务操作的 API。本文 Flashback 由于采用事务模型，很自然地放在此文件中。

### 流程概览

让我们先来纵览一下 Flashback 整体流程，抽出主要代码大致可以看出主要就是四步：

1. 在开始正式的覆盖写等操作之前，先通过 raft_router 发送一个 Admin 的 PrepareFlashback 指令，完成 region meta 的持久化；
2. 在 region 被标识为 Flashback 状态后，prewrite 第一个 user_key 来阻止 resolved_ts 的推进；
3. 执行 Flashback并 commit 第 2 步写入的 key；
4. Flashback 执行结束后通过 raft_router 发送一个 FinishFlashback 指令，进行数据清理。

```rust
// First Phase
fn future_prepare_flashback_to_version() {
 // 1. prepare the raftstore for the later flashback.
 send_flashback_msg(.., AdminCmdType::PrepareFlashback);
 // 2.prewrite the first user key to prevent `resolved_ts` from advancing.
 let (cb, f) = paired_future_callback();
 res = storage.sched_txn_command(req.clone().into(), cb);
}
// Second Phase
fn future_flashback_to_version() {
 // 3. execute overwrite and commit the first user key.
 let (cb, f) = paired_future_callback();
 let res = storage_clone.sched_txn_command(req.into(), cb);
 // 4. notify raftstore flashback has been finished.
 send_flashback_msg(.., AdminCmdType::FinishFlashback);
}
```

那就让我们首先进入第一阶段：prepare 模块！

### Phase1-1: Prepare

Prepare 函数的目的可以概况为：停读停写停调度，持久化 Flashback 状态，停止 resolved_ts 的推进。

首先介绍“停读写停调度”，具体原因已经在背景介绍小节中解释过。为了实现这个目的，直觉上是在所有读写调度任务执行处进行隔断。由于 TiKV 底层采用 Raft 协议，最终会进行 Propose，Commit 然后 Apply 的流程，那么很自然地在进行 Propose 前隔断掉读写调度。

> 此处剧透 Flashback 实现为：在 Propose 处快速隔断掉 Flashback 过程中的其他读写，在 Apply 处隔断进行兜底。

通过此文章可以了解到在 TiKV 处理 Proposal 的大致流程 [TiKV 源码解析系列文章（十八）Raft Propose 的 Commit 和 Apply 情景分析](https://cn.pingcap.com/blog/tikv-source-code-reading-18)

一言以蔽之：TiKV 使用了两个线程池来处理 Proposal，并且将一个 Raft Peer 分成了两部分：PeerFsm和 ApplyFsm。在处理 Proposal 的过程中，首先由 PeerFsm获取日志并驱动 Raft 内部的状态机，由 ApplyFsm根据已提交日志修改对应数据的状态机（region 信息和用户数据）。

> 可通过此文章了解 PeerFsm 和  ApplyFsm [TiKV 源码解析系列文章（十七）raftstore 概览](https://cn.pingcap.com/blog/tikv-source-code-reading-17)

在 “PeerFsm获取日志并驱动 Raft 内部的状态机”时，会走到下面函数：

```rust
fn propose_raft_command_internal() {
 match self.pre_propose_raft_command(&msg) { .. }

 if self.fsm.peer.propose(self.ctx, cb, msg, resp, diskfullopt) {
     self.fsm.has_ready = true;
 }
}
```

我们发现 PeerFsmDelegate::pre_propose_raft_command 函数会在 propose request 前进行检查。

那么很自然地将判断当前 request 是否为 Flashback 的检查放在此处。

需要关注的一个地方是：

当然不能全盘隔断，Flashback 也需要走 raft 流程，应当给予通行证。

随之我们发现在 RaftCmdRequest 中的 header 里面有个 flags，可以将通行证放在此处。

```rust
 fn pre_propose_raft_command(
     &mut self,
     req: &RaftCmdRequest,
 ) -> Result<Option<RaftCmdResponse>> {
     // When in the flashback state, we should not allow any other request to be proposed.
     if self.region().is_in_flashback {
         let flags = req.get_header().get_flags();
         if !flags.contains(FLASHBACK) {
             return Err;
         }
     }
 }
```

#### Prepare Flashback

在完成“隔断点”的安插后，为了让 Flashback 相关操作不受隔断顺利通行，我们会在 header 处加上 flag。

```rust
// First Phase
fn future_prepare_flashback_to_version{
 // 1. prepare the raftstore for the later flashback. 
 send_flashback_msg(.., AdminCmdType::PrepareFlashback);
}
```

所调用的 start_flashback/end_flashback 函数在加上 flag 后发送 admin req.

```rust
async fn start_flashback/end_flashback {
 ...
 req.mut_header()
     .set_flags(WriteBatchFlags::FLASHBACK.bits());
 // call admin request directly
 let raft_router = raft_router.lock().await;
 raft_router.send_command(req, cb, ...)
 ...
}
```

Admin request 通过 RaftStoreRouter 构成一条 RaftCommand 发送，会按照 Propose 流程，通过 pre_propose 的检查后到 PeerFsmDelegate.fsm.peer.propose 完成 Propose 一条 Raft Log。

之后 PeerFsm 会将 Proposal 以及已提交日志发送给对应的 ApplyFsm 来到 apply 流程。

ApplyFsm 会针对这些日志进行（见 ApplyFsm::handle_apply）：

1. 完成数据的持久化。
2. 向 PeerFsm发送 ApplyRes，用于更新 PeerFsm中的 Region 状态。
    在 exec_raft_cmd 会加上 check_flashback_state，进行 Flashback 持久态的判断。此处 region 将在下面的 exec 函数中设置上，由于为串行 apply，因此在下条 cmd 来之前，便会设置好 region 信息。

```rust
check_flashback_state(self.region.get_is_in_flashback());

pub fn check_flashback_state() -> Result<()> {
    // The admin flashback cmd could be proposed/applied under any state.
    if AdminCmdType::PrepareFlashback || AdminCmdType::FinishFlashback {
        return Ok(());
    }
    let is_flashback_request = req.get_header().get_flags()
                            .contains(FLASHBACK);
    ...
}
```

完成 check 后执行 ApplyDelegate::exec_admin_cmd ，最终识别 Flashback 标识，到达我们的目的地 exec_flashback 函数。

```rust
AdminCmdType::PrepareFlashback | AdminCmdType::FinishFlashback => 
    self.exec_flashback(ctx, request),
```

exec_flashback 放入 region 的元信息中，并完成持久态 RegionLocalState 的更新。

```rust
fn exec_flashback() -> Result<> {
    let is_in_flashback = req.get_cmd_type() == AdminCmdType::PrepareFlashback;
    let mut region = self.region.clone();
    region.set_is_in_flashback(is_in_flashback);


    put_msg_cf(CF_RAFT, &keys::region_state_key(region_id), &old_state)
    Ok(ApplyResult::Res(ExecResult::SetFlashbackState { region } )
}
```

ApplyFSM 在应用一批日志之后会发送一条 ApplyRes 的消息到 PeerFsm。

最终又回到 PeerFsm 的PeerFsmDelegate::handle_msgs 函数，走到 PeerMsg::ApplyRes { res } 分支，调用 PeerFsmDelegate::on_apply_res 完成对 Flashback 的持久态更新。

```rust
    fn on_set_flashback_state(&mut self, is_in_flashback: bool) {
        // update flashback state
        self.update_region();
        // 此行代码在做的事将在「停读 - ReadLocal & StaleRead 」小节解释
        self.fsm.peer.leader_lease_mut().expire_remote_lease();
    }
```

梳理完后，很清晰的看到存在两个对非 Flashback 操作的隔断位置，分别位于 propose 和 apply 处。

那么随之而来的问题便是：在何处加入对 Flashback req 的“通行证”呢？

Flashback 既然可以理解为基于 MVCC 进行实现，那么便也需要通过 MVCC 的读写接口流程。因此溯源一下 MVCC 的读写流程，便能更好地找到“通行证”的放置位置。

#### 停读

让我们首先来梳理一下读流程，可结合 [TiKV 源码阅读三部曲（二）读流程 来阅读详细读过程](https://cn.pingcap.com/blog/tikv-source-code-reading-read)。

在调用到 LocalReader::propose_raft_command 时，发现是通过 LocalReader::pre_propose_raft_command 进行判断 req。

会对 ReadLocal 和 StaleRead 进行特定逻辑处理，其余信息将转发给 RaftStore 来执行，即由 ProposalRouter::send 转发后走到我们之前所提到的 Propose 流程。

```rust
fn propose_raft_command() {
    match self.pre_propose_raft_command(&req) { 
        RequestPolicy::ReadLocal => ..
        RequestPolicy::StaleRead => ..
        // Forward to raftstore.
        _ => self.redirect(RaftCommand::new(req, cb)),     
    }
}
```

这样很自然地对于除 ReadLocal 和 StaleRead 外的 req，都可以做出以下隔断：

在进入 read 之前，判断一下 req 中是否有 Flashback flag，便实现了在开启 Flashback 之后，只能让 Flashback 相关的读指令通行。

```rust
fn exec_snapshot() {
    ...
    if ctx.for_flashback {
        flags |= WriteBatchFlags::FLASHBACK.bits();
    }
    header.set_flags(flags);
    ...
    self.router.read(...)
}
```

Flashback 执行时将对 exec_snapshot 进行 ctx.for_flashback 的设置，其中 for_flashback 从哪获取的将在下文 「Phase2-1: Exec - 读取阶段」 解释。

#### ReadLocal & StaleRead

正如上小节提到会对 ReadLocal 和 StaleRead 存在着特定逻辑处理，可以作为扩展阅读资料了解 [TiKV 功能介绍 - Lease Read](https://cn.pingcap.com/blog/lease-read) && [Stale Read 功能的使用场景](https://docs.pingcap.com/zh/tidb/dev/stale-read)。

首先看看ReadLocal 的特殊处理即对 Peer 中的 leader_lease 进行检查。当发现不在租期内时，便会转发到正常 Propose 流程中。

因此我们采取：在 prepare Flashback 时，对 lease 手动设置超时，来确保 local read 不会执行。

这便是对之前完成 apply res 之后与更新 region 同时所做的事。

```rust
    fn on_set_flashback_state(&mut self, is_in_flashback: bool) {
        // Update the region meta.
        self.update_region()
        // Let the leader lease to None to ensure that local reads are not executed.
        self.fsm.peer.leader_lease_mut().expire_remote_lease();
    }
```

而对于 StaleRead 的运行前提是需要不停推进 safe ts（即 resolved_ts）。会在 TiDB 检查 resolved_ts，保证 Flashback 的版本不会超过 resolved_ts，因此也完成隔断。

至此对于读的隔断介绍完毕。

#### 停写

可参考 [TiKV 源码阅读三部曲（三）写流程](https://cn.pingcap.com/blog/tikv-source-code-reading-write) 阅读写请求全链路的执行流程。

在写的过程中 RaftKv::exec_write_requests 内部将会走向 router 进行 Propose 流程，因此在此处加上类似上文「读请求」的判断，只能让 Flashback 相关的写指令通行。

```rust
fn exec_write_requests() {
    ...
    if txn_extra.for_flashback {
        flags |= WriteBatchFlags::FLASHBACK.bits();
    }
    header.set_flags(flags);
    ...
    self.router.send_command(cmd, cb, extra_opts)?;
}
```

### Phase1-2: Prewrite

完成停读写调度后，我们遇到了一个新的问题，那就是持续推进的 resolved ts 会导致 CDC 的 Panic.

#### 停止 resolved _ts 的推进

一言蔽之 Resolved TS（TODO: 介绍 Resolved TS），由于以下原因：

- Resolved TS 组件通过观察 LockCF 的修改，维护一个 StartTS 的最小堆，有 ResolvedTS = max(ResolvedTS, min(StartTS))；

- Flashback 将以 Region 为单位移除掉所有的锁；

- 正在进行 Flashback 的 Region 上将不再存在任何的锁，此时 ResolvedTS 将会正常向前推进，无论是否有数据写入。

那么将会带来：改动的 CommitTS <  ResolvedTS 的情况（Flashback 的改动自始至终都使用同一个 CommitTS，ResolvedTS 随着推进迟早会超过它）。

为防止 resolved_ts 在我们后续执行 Flashback 前被推进，我们采用：TiDB 请求中带上一个 start_ts，TiKV 会在 CF_WRITE 中选择最新的 user key，以此 start_ts prewrite 上一个锁，将在执行完 Flashback 后 commit 清除掉。

#### 读写阶段介绍

回到最开始的 future_prepare_flashback_to_version 中，首先内部将 req.into。

```rust
// First Phase
fn future_prepare_flashback_to_version{
    ...
    let res = storage_clone.sched_txn_command(req.into(), cb);
    ... 
}
```

在此文件中实现了 PrepareFlashbackToVersionRequest 到 FlashbackToVersionReadPhase 的 from。

```rust
impl From<PrepareFlashbackToVersionRequest> for TypedCommand<()> {
    fn from(mut req: PrepareFlashbackToVersionRequest) -> Self {
        FlashbackToVersionReadPhase { .. }
    }
}
```

因此此处调度的实则是 FlashbackToVersionReadPhase，也即对于 sched_txn_command 将会走到由 FlashbackToVersionReadPhase 提供的 process_read 处，在执行完该函数后会触发 FlashbackToVersion 的 process_write。

```rust
fn process_read(self, snapshot: S, statistics: &mut Statistics) -> Result<ProcessResult> {
    ...
    let next_cmd = FlashbackToVersion {
        ...
    }
    Ok(ProcessResult::NextCommand {
        cmd: Command::FlashbackToVersion(next_cmd),
    })
}
```

大致流程按照如此往复读写读写，直到没有读为止。

由于都是属于 Flashback 操作，需要加上「通行证」后才能被 raftstore 执行。

因此也很合理地在 process_write 加上 Write 的通行证。

```rust
fn process_write(mut self, snapshot: S, context: WriteContext<'_, L>) -> Result<WriteResult> {
    ...
    write_data.extra.for_flashback = true;
    ...
    if next_lock_key.is_none() && next_write_key.is_none() {    
        ...
    } else {
        let next_cmd = FlashbackToVersionReadPhase {
            ...
        }
    }
}
```

而对于 process_read，由于是从 snapshot 中读取，因此会在读取 snapshot 时加上 Read 的通行证。

```rust
fn exec_snapshot() {
    ...
    if ctx.for_flashback {
        flags |= WriteBatchFlags::FLASHBACK.bits();
    }
    ...
    self.router.read( ... )
}
```

这也便实现了在「停读停写」后能顺利执行 flashback 相关操作。

具体到往复读写的过程，代码位于此处。为了流程更加清晰，我们标识出当前状态：

1. **RollbackLock**：需要删除所有 start_ts 大于 Flashback version 的锁记录；
  - 由于 Flashback 会把悲观锁清掉，但是清掉之后事务 commit 还是会成功的，阻止的方法是在 Flashback 删掉锁的时候，原地写 Rollback ；
  - Rollback lock ：采用 lock 的 start_ts 写 Rollback 记录，确保时间戳会在 Flashback 之前。
2. **Prewrite**：
  - TiDB 请求中会带上一个 start_ts， TiKV 会在需要 Flashback 的 key 中选择第一个 key，以此 start_ts 写入一个锁，以防止 resolved_ts 在我们后续进行 Flashback 前被推进。
3. **FlashbackWrite**：
  - 采用攒够一整个 batch 的方式扫描一批（256个）的 CF_WRITE；
  - 为了 Flashback 数据，我们需要从 CF_WRITE 中扫描每一个最新且独特的 key，来获得 Flashback timestamp 所对应的旧 MVCC 写记录。具体代码在此处；
  - 需要覆写一份 MvccTxn 对象的 Modify 记录，取出读取阶段的数据进行判断：
    - 如果 key 不存在对应的 version，将放置一个 Delete 标识；
    - 如果 key 存在对应的 version，且如果「不是采用 short_val，并为 LockType::Put」 ，那么将：
      - 通过 load_data 获取 old version value，以 start_ts 构建 Modify，放在 CF_DEFAULT 中；
      - 通过 commit_ts 构建 Modify，放在 CF_WRITE 中。
4. **Commit**：
  - 当发现已经完成所有 Write 的写入后，进入 Commit 阶段，通过 commit_flashback_key Commit first user key。

### Phase2-1: Exec & Commit

正如 「停止 resolved _ts 的推进」小节中描述的一样，大致流程如下：

1. Prepare Flashback 时：
    1. Scan & Rollback all locks.
    2. TiDB 请求中会带上一个 start_ts， TiKV 会在需要 Flashback 的 key 中选择第一个 key，以此 start_ts 写入一个锁，以防止 resolved_ts 在我们后续进行 Flashback 前被推进。
2. 执行 Flashback 时：
    1. Scan & flashback the writes.
        - 这部分的改动会带上 1PC 的 flag，让 CDC 等工具将其视为一阶段事务的修改
    2. commit 在 1.b 中写入的锁，完成 Flashback

回到最开始的 future_flashback_to_version 中，也会内部进行 req.into 后走到 FlashbackToVersionReadPhase 和 FlashbackToVersion 进行读写，大致流程在「读写阶段介绍」小节已经详细介绍，就不再赘述。

### Phase2-2: Finish

在执行完成 Flashback 后，最后需要做的便是 unset 掉所有为 Flashback 服务的配置。那么便回到了经典 future_flashback_to_version 函数。

```rust
fn future_flashback_to_version() -> impl Future<Output = ServerResult<FlashbackToVersionResponse>> {
    ...
    // 3. notify raftstore the flashback has been finished
    raft_router_clone.significant_send(region_id, SignificantMsg::FinishFlashback)?;
}
```

流程与 Prepare 大致相同，发送 Admin 指令，完成持久态的取缔。

至此，完成整个 Flashback！

## Appendix

### 一些踩过的坑

`TODO`

### 改进点

现有机制在可用性和易用性上有一些不足：

- 相关操作仅限于数据被 GC 回收之前，这个窗口期可能比较小，一旦 safepoint 更新过了之后就不能用了；
- 如果把 GC lifetime 调长，历史数据将占用大量的存储空间；
- GC lifetime 是全局配置，不能针对某些 database 或 table 调整；

### 参考文档

[TiKV 源码阅读三部曲（二）读流程 来阅读详细读过程](https://cn.pingcap.com/blog/tikv-source-code-reading-read)

[TiKV 源码阅读三部曲（三）写流程](https://cn.pingcap.com/blog/tikv-source-code-reading-write)

[TiKV 源码解析系列文章（七）gRPC Server 的初始化和启动流程](https://cn.pingcap.com/blog/tikv-source-code-reading-7)

[TiKV 源码解析系列文章（十二）分布式事务](https://cn.pingcap.com/blog/tikv-source-code-reading-12/)

[TiKV 源码解析系列文章（十三）MVCC 数据读取](https://cn.pingcap.com/blog/tikv-source-code-reading-13)

[TiKV 源码解析系列文章（十七）raftstore 概览](https://cn.pingcap.com/blog/tikv-source-code-reading-17)

[TiKV 源码解析系列文章（十八）Raft Propose 的 Commit 和 Apply 情景分析](https://cn.pingcap.com/blog/tikv-source-code-reading-18)
