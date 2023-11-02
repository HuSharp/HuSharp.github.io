---
layout: blog
title:  "Flashback TiKV"
date:   2023-10-25 19:43:28 +0800
category: distributed
---

* content
{:toc}

This is an article originally intended as a product introduction, but was shelved for various reasons. Recently, as we have been improving related features, we decided to refine it and release it. Very excited to implement this with [JmPotato](https://ipotato.me/)~

For the code, please see: [roadmap](https://github.com/pingcap/tidb/issues/37197) & [TiKV tracking issue](https://github.com/tikv/tikv/issues/13303)

## Background Introduction

Flashback (usually referring to Oracle Flashback) is a feature used to quickly revert to a previous version in case of user errors, to avoid significant losses.

In the gaming industry, issues like version errors occur from time to time, and regular backups can only revert to the backup point in time, which is also a waste of resources. [TiDB v6.4.0](https://docs.pingcap.com/tidb/stable/release-6.4.0) introduced the `FLASHBACK CLUSTER TO TIMESTAMP` syntax, which allows the data of a cluster, database, or data table to be restored to a specific point in time.

In TiDB, there are some related features:

- MVCC & GC: Data updates or deletions are adding new versions, and the historical versions are cleared through the GC mechanism. The storage engine maintains historical records for a certain period, which makes various data recovery functions possible later.
- Reading historical data through the system variable tidb_snapshot: Specify a ts (cannot be earlier than the GC safepoint) to read the data at that time point, and ensure the data is consistent.
- FLASHBACK TABLE: Restores tables and data that have been dropped or truncated.
Ultimately, we adopted the approach of using Multiversion Concurrency Control (MVCC) to take the latest timestamp data before TIMESTAMP and overwrite the current data.

### Execution and effect

「For details, please refer to [User documentation](https://docs.pingcap.com/zh/tidb/dev/sql-statement-flashback-to-timestamp).」

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

### Specific Implementation

#### Adopting Region Lock to Halt Read/Write Scheduling

In Flashback, we use Region locks to block all read/write operations and scheduling during the Flashback process to avoid any external factors that might cause data inconsistencies.

**By locking the Region before performing Flashback, we can gain the following benefits:**

- Blocking any read/write operations and scheduling during the Flashback process, avoiding any potential external factors that could cause data inconsistencies;
- Since locked Regions will not produce additional data writes, it is convenient for Flashback to freely write and retry;
- Since locked Regions will not produce additional data writes, there is no need to maintain the Flashback success or failure status of different Stores and Regions within the cluster, simply retrying until successful is sufficient;
- Region-level operations are more in line with the granularity of TiKV's internal data management.

#### General Process

First, TiDB will determine:

- FlashbackTS: Whether it is a future time point, whether it is greater than minSafeTS, and whether it is within the GC Safe time
- Whether any non-Flashback ddl jobs have been executed within the time range
- Whether any DDL tasks are currently being executed
- Close GC, PD scheduling, and auto analyze, then start calling TiKV's two-phase process
- **First Phase (Region Locking)**
    1. TiDB determines the key range for the Flashback request;
    2. TiDB sends a kv_prepare_flashback_to_version request to different regions on a per-region basis, blocking reads, writes, and scheduling;
    3. Call the PD interface to get the latest TSO as the startTS for executing Flashback. TiDB will persist this startTS to ensure that it can use the same TS after a failure and restart;
    4. Use Region locks to independently handle each Region's Flashback progress
        - Scan all MVCC Locks and perform rollbacks;
        - TiKV will select the latest user key in CF_WRITE and prewrite a previous lock with the aforementioned startTS to halt the advancement of resolved_ts, which will be committed in the second phase;
    5. TiDB checks if all requests have returned successfully and retries failed requests until the entire locking phase is completed.
- **Second Phase (Executing Flashback)**
    1. TiDB takes the aforementioned startTS and obtains the latest TSO from PD as the commitTS. TiDB will also persist this commitTS and send kv_flashback_to_version requests to different regions;
    2. Each Region independently processes its own Flashback progress
        - Scan for keys that have had version changes after the point in time to which you want to Flashback and write the old MVCC version for the scanned keys;
        - Commit the locks written in the prewrite phase of the first stage and remove the Region locks after completion;
    3. TiDB checks if all requests have been successfully returned and retries the failed requests with the same startTS and commitTS until the entire Flashback execution is completed.


## Code Analysis

Let's start from the beginning of TiKV startup. :)

Beginning with cmd/tikv-server/main.rs, after TiKV finishes configuring a series of parameters, the main function culminates with server::run_tikv(config) to run the TiKV server. The main function selects the corresponding Engine based on the configured parameters and calls the run_impl function. Inside run_server, it performs binding and initiates the grpc_server.start(); service. You can view the specific binding and startup process in this [document](https://cn.pingcap.com/blog/tikv-source-code-reading-7).

The focus of this article, Flashback, is located at the following place in kvproto:

```protobuf
rpc KvPrepareFlashbackToVersion(kvrpcpb.PrepareFlashbackToVersionRequest) returns (kvrpcpb.PrepareFlashbackToVersionResponse) {}
rpc KvFlashbackToVersion(kvrpcpb.FlashbackToVersionRequest) returns (kvrpcpb.FlashbackToVersionResponse) {}
```

Returning to the TiKV code, TiKV includes multiple gRPC services. One of the most important is the KvService, located in the src/server/service/kv.rs file. It includes the APIs for transaction operations in TiKV, such as kv_get, kv_scan, kv_prewrite, kv_commit, etc. The Flashback feature in this article, since it uses the transaction model, is quite naturally placed in this file.


### Overview of the Process
Before we delve deeper into the specific code, let's take a broad look at the overall Flashback process. We can distill it into four main steps based on the key code components:

1. Preparation: Before starting the actual overwrite operations, an Admin PrepareFlashback command is sent via the raft_router. This step accomplishes the persistence of region metadata.
2. Locking: After a region is marked for Flashback, the first prewrite is done on a user_key to prevent the advancement of resolved_ts.
3. Execution: Perform the Flashback and commit the key that was written in step 2.
4. Completion: After the execution of Flashback, a FinishFlashback command is sent through the raft_router to clean up the data.

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

Entering the first phase of Flashback operation, the preparation module is critical.

### Phase 1-1: Prepare

The primary goal of the Prepare function is to halt reads and writes, prevent scheduling, and persist the Flashback state, as well as stop the advancement of resolved_ts.

In the "Preparation" phase, the necessity of stopping all reads, writes, and scheduling operations has already been explained in the Background Introduction section. To achieve this, one would intuitively block these operations at the point of execution. With TiKV using the Raft consensus protocol, the operations eventually go through a Propose, Commit, then Apply process, so it makes sense to intercept reads and writes before Propose.

> Spoiler Alert for Flashback Implementation: The interception is done quickly at the Propose to block other reads and writes during the Flashback process, with the Apply step acting as a safety net.

To understand the process of handling a proposal in TiKV, you can refer to this [article](https://cn.pingcap.com/blog/tikv-source-code-reading-18).

In short, TiKV utilizes two thread pools to handle proposals, and a Raft peer is divided into two parts: PeerFsm and ApplyFsm. During the proposal processing, PeerFsm fetches logs and drives the internal state machine of Raft, while ApplyFsm updates the state machine according to the committed logs, which includes both region information and user data.

> For more details on PeerFsm and ApplyFsm, you can refer to this [article](https://cn.pingcap.com/blog/tikv-source-code-reading-17)

During the process where "PeerFsm fetches logs and drives the internal state machine of Raft" it encounters the following function:

```rust
fn propose_raft_command_internal() {
 match self.pre_propose_raft_command(&msg) { .. }

 if self.fsm.peer.propose(self.ctx, cb, msg, resp, diskfullopt) {
     self.fsm.has_ready = true;
 }
}
```

Upon examining the codebase, we find that the PeerFsmDelegate::pre_propose_raft_command function is indeed the checkpoint where a request is examined before a propose is allowed to proceed.

It's logical to place the check to determine if the current request is related to Flashback right at this stage.

**Key Consideration:**

However, we cannot block all operations indiscriminately. Flashback operations themselves need to pass through the Raft process without hindrance. Thus, we should issue a sort of 'pass' for them.

Utilizing flags in RaftCmdRequest Header:

We then notice that the RaftCmdRequest structure has a header field that includes flags. This is a suitable place to set flags that can be used as a 'pass' for Flashback-related commands, allowing them to be distinguished from regular operations.

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

After implementing the "block points" to prevent non-Flashback operations, to ensure that Flashback-related operations proceed smoothly and are not blocked, we add a flag to the header.

```rust
// First Phase
fn future_prepare_flashback_to_version{
 // 1. prepare the raftstore for the later flashback. 
 send_flashback_msg(.., AdminCmdType::PrepareFlashback);
}
```

The functions start_flashback/end_flashback that are invoked will send an admin request after the flag is added.

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

The Admin request is formed into a RaftCommand via the RaftStoreRouter and sent along. It goes through the proposing process, passing through the pre_propose check, and arrives at PeerFsmDelegate.fsm.peer.propose to complete the proposal of a Raft log.

Subsequently, the PeerFsm will send the Proposal and committed logs to the corresponding ApplyFsm for the apply process.

The ApplyFsm will, for these logs (see ApplyFsm::handle_apply):

1. Ensure the data is durably stored.
2. Communicate ApplyRes to PeerFsm, which is necessary for updating the Region's status within PeerFsm.
    In the execution of exec_raft_cmd, a check_flashback_state is incorporated to verify the persistence of the Flashback state. Here, the region is configured in the subsequent exec function, and due to the serial nature of apply operations, the region's details are established before the arrival of the following command.

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

After the checks are passed, the process executes ApplyDelegate::exec_admin_cmd, which ultimately recognizes the Flashback identifier and reaches our target function exec_flashback.

```rust
AdminCmdType::PrepareFlashback | AdminCmdType::FinishFlashback => 
    self.exec_flashback(ctx, request),
```

When the exec_flashback function is invoked, it performs the necessary operations to alter the Region's metadata to reflect the state of the system as it should be after the Flashback process. This usually involves the following steps:

```rust
fn exec_flashback() -> Result<> {
    let is_in_flashback = req.get_cmd_type() == AdminCmdType::PrepareFlashback;
    let mut region = self.region.clone();
    region.set_is_in_flashback(is_in_flashback);


    put_msg_cf(CF_RAFT, &keys::region_state_key(region_id), &old_state)
    Ok(ApplyResult::Res(ExecResult::SetFlashbackState { region } )
}
```

After the ApplyFsm applies a series of Raft logs, it generates an ApplyRes message that encapsulates the outcomes of this apply process. This message is dispatched to the corresponding PeerFsm.

Once received, the PeerFsm processes the message through the PeerFsmDelegate::handle_msgs function, specifically within the PeerMsg::ApplyRes { res } case. It is here that PeerFsmDelegate::on_apply_res is invoked, thereby updating the durable state to reflect the effects of the Flashback operation, ensuring that the persistent view of the region's state is consistent with the Flashback's target historical state.

```rust
    fn on_set_flashback_state(&mut self, is_in_flashback: bool) {
        // update flashback state
        self.update_region();
        // 此行代码在做的事将在「停读 - ReadLocal & StaleRead 」小节解释
        self.fsm.peer.leader_lease_mut().expire_remote_lease();
    }
```

After a comprehensive analysis, we observe that there are two critical blocks that act as barriers to non-Flashback operations, located at the propose and apply stages, respectively.

This leads to the ensuing inquiry: where should we integrate the 'pass' that permits Flashback requests to proceed unhindered?

Considering that Flashback is conceptually an operation built upon Multi-Version Concurrency Control (MVCC) mechanisms, it inherently requires traversal through the established read-write interfaces of MVCC. By retracing the MVCC read-write process, we can better ascertain the strategic location to embed this 'pass', ensuring that Flashback requests are granted seamless continuity through the system.

#### Halting Reads

Firstly, let's comb through the read process, which can be studied in detail in conjunction with [TiKV Source Code Reading Part Two: The Read Process](https://cn.pingcap.com/blog/tikv-source-code-reading-read).

When LocalReader::propose_raft_command is invoked, it's discerned that the request is judged through LocalReader::pre_propose_raft_command.

Specific logic is applied to ReadLocal and StaleRead, while other requests are forwarded to RaftStore for execution. This forwarding is done via ProposalRouter::send, after which the process enters the Propose flow we previously mentioned.

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

Thus, for requests other than ReadLocal and StaleRead, the following interruption can be naturally implemented:

Before entering the read process, check whether the request contains the Flashback flag. This achieves the goal that after Flashback is initiated, only read commands related to Flashback are allowed to pass through.

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

When Flashback is executed, the exec_snapshot is set with ctx.for_flashback, where for_flashback is obtained will be explained in the following section 「Phase2-1: Exec - Read Stage」.

#### ReadLocal & StaleRead

As mentioned in the previous section, ReadLocal and StaleRead have specific logic that can be understood further through the reading materials about [TiKV's Lease Read feature](https://cn.pingcap.com/blog/lease-read) && [use cases for Stale Read functionality](https://docs.pingcap.com/zh/tidb/dev/stale-read).

The special handling for ReadLocal involves checking the leader_lease in the Peer. If it is found to be outside of the lease period, it will be forwarded to the regular Propose process.

Therefore, our approach is: during the preparation of Flashback, to manually set the lease to expire to ensure that local reads will not execute.

This is what is done simultaneously with the lease update after completing the apply res and updating the region.

```rust
    fn on_set_flashback_state(&mut self, is_in_flashback: bool) {
        // Update the region meta.
        self.update_region()
        // Let the leader lease to None to ensure that local reads are not executed.
        self.fsm.peer.leader_lease_mut().expire_remote_lease();
    }
```

Regarding StaleRead, its prerequisite for operation is the continuous advancement of safe ts (also known as resolved_ts). This check is performed in TiDB to ensure that the version used by Flashback will not exceed resolved_ts, therefore providing a cutoff.

With this, the explanation for the interruption of read operations during Flashback is complete.

#### Halting Write

For further details on the execution process of write requests in TiKV, one can refer to [TiKV Source Code Reading (Part III) Write Process](https://cn.pingcap.com/blog/tikv-source-code-reading-write).

During the write process, the RaftKv::exec_write_requests internally moves towards the router to initiate the Propose process. Therefore, similar to the "read request" discussed previously, a checkpoint is added at this stage to only allow Flashback-related write commands to pass through.

This ensures that during the execution of Flashback, only write operations associated with it can proceed, and all other write requests are effectively halted, preserving the integrity of the Flashback operation.

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

After halting read and write operations, we are faced with a new issue: the continuously advancing resolved timestamp (resolved_ts) could cause a panic in Change Data Capture (CDC).

### Halting the Advancement of resolved_ts

In short, resolved_ts is an internal mechanism of TiKV (TODO: introduce resolved_ts). It's maintained due to the following reasons:

- The Resolved TS component maintains a minimum heap of StartTS by observing changes in the LockCF, with the rule ResolvedTS = max(ResolvedTS, min(StartTS)).

- Flashback will remove all locks at the granularity of a Region.

- For a Region undergoing Flashback, there will no longer be any locks, meaning the ResolvedTS will continue to advance as normal, regardless of whether data is being written.

This would lead to a scenario where the CommitTS of the changes is less than the ResolvedTS (since Flashback uses the same CommitTS for all changes, and eventually, the ResolvedTS would surpass it).

To prevent resolved_ts from advancing before we execute Flashback, we employ the following strategy: TiDB includes a start_ts with its requests, and TiKV selects the latest user key in the CF_WRITE. A lock is prewritten with this start_ts, which will be committed and cleared after Flashback execution is complete.

#### Introduction to the Read and Write Phase

Returning to the initial future_prepare_flashback_to_version function, it begins by internally converting the request using req.into.

```rust
// First Phase
fn future_prepare_flashback_to_version{
    ...
    let res = storage_clone.sched_txn_command(req.into(), cb);
    ... 
}
```

The from of PrepareFlashbackToVersionRequest to FlashbackToVersionReadPhase is implemented here.

```rust
impl From<PrepareFlashbackToVersionRequest> for TypedCommand<()> {
    fn from(mut req: PrepareFlashbackToVersionRequest) -> Self {
        FlashbackToVersionReadPhase { .. }
    }
}
```

Therefore, what is actually being scheduled here is FlashbackToVersionReadPhase, which means that for sched_txn_command, the process will proceed to the process_read provided by FlashbackToVersionReadPhase. After this function is executed, it will trigger the process_write of FlashbackToVersion.

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

The general process follows a repetitive read-write-read-write sequence until there are no more reads to perform.

Since all these operations are part of the Flashback process, they must be marked with a "pass" to be executed by raftstore.

Therefore, it is also quite reasonable to add a Write "pass" during the process_write.

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

For process_read, since it is reading from a snapshot, a Read pass is added when reading the snapshot.

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

This also ensures that after the "read and write suspension," Flashback-related operations can be smoothly executed.

Specifically, the process of repetitive reading and writing's code is here. To make the process clearer, we have marked the current status:

1. **RollbackLock**: It is necessary to delete all lock records where the start_ts is greater than the Flashback version;
    - Since Flashback will clear pessimistic locks, but the transaction commit will still succeed after that, one way to prevent this is to write a Rollback at the same place where the lock is deleted during Flashback;
    - Rollback lock: Use the lock's start_ts to write a Rollback record, ensuring the timestamp is before Flashback.
2. **Prewrite**:
    - The TiDB request will carry a start_ts, and TiKV will choose the first key that needs Flashback, writing a lock with this start_ts to prevent the resolved_ts from being advanced before we perform Flashback.
3. **FlashbackWrite**:
    - The method of accumulating a whole batch to scan a batch(256) of CF_WRITE;
    - To Flashback the data, we need to scan each latest and unique key from CF_WRITE to obtain the old MVCC write record corresponding to the Flashback timestamp. The specific code is here;
    - It is necessary to overwrite a copy of the MvccTxn object's Modify record, taking out the data from the reading stage for judgment:
        - If the key does not have a corresponding version, a Delete flag will be placed;
        - If the key has a corresponding version, and if "it does not use short_val, and is of LockType::Put", then it will:
            - Obtain the old version value through load_data, build Modify with start_ts, and place it in CF_DEFAULT;
            - Build Modify with commit_ts, and place it in CF_WRITE.
4. **Commit**:
    - When it is found that all Writes have been written, enter the Commit phase, commit the first user key through commit_flashback_key.

### Phase2-1: Exec & Commit

Just as described in the section 「Halting the Advancement of resolved_ts」 the general process is as follows:

1. During Flashback Preparation:
    1. Scan & Rollback all locks.
    2. A start_ts is included in the TiDB request, and TiKV selects the first key that needs Flashback, writing a lock with this start_ts to prevent the advancement of resolved_ts before Flashback is performed.

2. During Flashback Execution:
    1. Scan & Flashback the writes.
        - Modifications in this part will carry a 1PC flag, making tools such as CDC treat it as a modification of a one-phase commit transaction.
    2. Commit the lock written in 1.b to complete the Flashback.

Returning to the initial future_flashback_to_version, the process also internally goes through req.into and proceeds to FlashbackToVersionReadPhase and FlashbackToVersion for reading and writing. The detailed process has been introduced in the section 「Introduction to the Read and Write Phase」 so it is not repeated here.

### Phase2-2: Finish

After the Flashback is executed, the last thing we need to do is to unset all the configurations for the Flashback service. This brings us back to the classic future_flashback_to_version function.

```rust
fn future_flashback_to_version() -> impl Future<Output = ServerResult<FlashbackToVersionResponse>> {
    ...
    // 3. notify raftstore the flashback has been finished
    raft_router_clone.significant_send(region_id, SignificantMsg::FinishFlashback)?;
}
```

The process is similar to that of Prepare, and the Admin command is sent to complete the persistence takedown.

At this point, the entire Flashback is complete!

## Appendix

### Some potholes

`TODO`

### Improvement points

The existing mechanism has some shortcomings in terms of usability and ease of use:

- The operations are limited to the time before the data is recovered by GC, which may be a small window, and once the safepoint has been updated, it will not be usable.
- If the GC lifetime is extended, historical data will take up a lot of storage space.
- GC lifetime is a global configuration and cannot be adjusted for certain database or table.

### Reference

[TiKV Source Code reading](https://cn.pingcap.com/blog/tikv-source-code-reading-read)

[TiKV Source Code writing](https://cn.pingcap.com/blog/tikv-source-code-reading-write)

[TiKV Source Code startup grpc](https://cn.pingcap.com/blog/tikv-source-code-reading-7)

[TiKV Source Code distributed transaction](https://cn.pingcap.com/blog/tikv-source-code-reading-12/)

[TiKV Source Code MVCC](https://cn.pingcap.com/blog/tikv-source-code-reading-13)

[TiKV Source Code raftstore](https://cn.pingcap.com/blog/tikv-source-code-reading-17)

[TiKV Source Code raft propose apply&commit](https://cn.pingcap.com/blog/tikv-source-code-reading-18)
