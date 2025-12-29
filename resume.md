---
layout: blog
title: Résumé
override_title: true
---

# Jinhao Hu (`胡锦浩`)

## Experience

**MPI-SWS** (Doctoral Researcher; Sept, 2024 ~ till now)

I am a second year PhD student at [MPI-SWS](https://mpi-sws.org/) under the supervision of [Prof. Laurent Bindschaedler](https://binds.ch/).

**PingCAP – Storage Team** (Database Engineer; Jul, 2022 ~ Sept, 2024)

- [Resource Control](https://docs.pingcap.com/tidb/stable/tidb-resource-control). Achieved isolation of multiple applications deployed on a shared cluster. Incorporated Quota Control Layer and Scheduling Control Layer for flow control and priority scheduling.
- [Microservices](https://docs.pingcap.com/tidb/stable/pd-microservices). Supporting [depolying](https://github.com/tikv/pd/issues/7519) PD microservice mode, which splits the timestamp allocation and cluster scheduling functions of PD into the following two independently deployed microservices.
- [Test Improvement](https://github.com/tikv/pd/issues/7969). Achieving a 3-6x speedup across different machine environments.
- [Support 10M regions simulation](https://github.com/tikv/pd/issues/8135). Providing pd the same specification machine to deploy the real pd under the big cluster, simulate the request number of TiDB/TiKV + TiKV heartbeat heartbeat report + all kinds of scheduling for the region and so on.
- [Flashback Cluster](https://github.com/tikv/tikv/issues/13303). Developed a fast rollback feature to revert cluster data to a specific timestamp in cases of user errors. Based on Multi-version Concurrency Control (MVCC) to retrieve timestamped data and overwrite current data using the Two-phase Commit protocol (2PC).

**ByteDance Inc.** (Developer Intern; Mar, 2021 ~ Sept, 2021)

- Release Platform Development. Contributed to the build of a Release Platform for the company's applications, including TikTok. Implemented a message queue with priority scheduling support to facilitate uploads to various stores, minimizing cross-platform operational overhead for users and refining status visualization.
- RPC Service Construction: Used the KiteX service framework and the Thrift cross-language protocol to develop RPC services for the Lark application. Delivered RESTful interfaces encompassing: Package uploads, Publishing policies, User group management.

## Skills

- *Programming Language*: Golang, Rust, C&C++, Java and Python.
- *Tech Skills*: Distributed Systems, Database Systems, Key-Value Storage, Cloud Computing, Kubernetes, etc.
- *Developing Tool*: Experienced with Linux-based development and team collaboration tools, including Git.

## Projects

detailed in [HuSharp's toy projects](https://github.com/ihusharp)

## Education

**Central South University - Computer Science** (Bachelor; 2018 ~ 2022)

- National Scholarship 2019 (Top 0.2% national-wide)
