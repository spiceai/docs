---
title: 'Distributed Query'
sidebar_label: 'Distributed Query'
description: 'Learn how to run Spice in distributed mode for larger scale queries.'
sidebar_position: 4
pagination_prev: null
pagination_next: null
---

Learn how to configure and run Spice in distributed mode to handle larger scale queries across multiple nodes.

:::info Preview
Multi-node distributed query execution based on Apache Ballista is available as a preview feature in Spice `v1.9.0`.
:::

## Overview

Spice integrates [Apache Ballista](https://github.com/apache/datafusion-ballista) to schedule and coordinate distributed queries across multiple executor nodes. This integration enables distributed execution when running large queries over partitioned data lake formats such as Parquet, Delta Lake, or Iceberg.

## Architecture

A distributed Spice cluster consists of two components:

- **Scheduler** – Plans distributed queries and manages the work queue for the executor fleet. Single instance per cluster.
- **Executors** – One or more nodes responsible for executing physical query plans.

The scheduler holds the cluster-wide configuration for a Spicepod, while executors connect to the scheduler to receive work.

## Getting Started

Cluster deployment typically starts with a scheduler instance, followed by one or more executors that register with the scheduler.

### Start the Scheduler

The scheduler is the only `spiced` process that needs to be configured (i.e. have a `spicepod.yaml` in the current dir). Override the Flight bind address when it must be reachable outside of `localhost`:

```bash
# Start scheduler
spiced --cluster-mode scheduler --flight 0.0.0.0:50051
```

### Start Executors

Executors need the scheduler's Flight URI to register and pull work. The executors do not require a `spicepod.yaml` to be present, it will fetch the configuration from the coordinator. Each executor automatically selects a free port if the default is unavailable:

```bash
# Start executor
spiced --cluster-mode executor --scheduler-url spiced://localhost:50051
```

## Query Execution

Queries run against the scheduler endpoint. The `EXPLAIN` output confirms that distributed planning is active—Spice includes a `distributed_plan` section showing how stages are split across executors:

```sql
EXPLAIN SELECT count(id) FROM my_dataset;
```

:::warning[Limitations]

- Accelerated datasets are not yet supported; distributed query currently targets partitioned data lake sources.
- As a preview feature, clusters may encounter stability or performance issues.
- Accelerator support is planned for future releases; follow release notes for updates.

:::
