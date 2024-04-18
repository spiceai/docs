---
title: 'Data Accelerators'
sidebar_label: 'Data Accelerators'
description: ''
sidebar_position: 5
pagination_prev: null
pagination_next: null
---

Data sourced by Data Connectors can be locally materialized and accelerated using a Data Accelerator.

Acceleration is enabled on a dataset by setting the acceleration configuration. E.g.

```yaml
datasets:
  - name: accelerated_dataset
    acceleration:
      enabled: true
```

For the complete reference specification see [datasets](../reference/spicepod/datasets.md).

By default, datasets will be locally materialized using in-memory Arrow records.

Data Accelerators using DuckDB, SQLite, or PostgreSQL engines can be used to materialize data in files or attached databases.

Currently supported Data Accelerators include:

| Engine Name                       | Description             | Status | Engine Modes     |
| --------------------------------- | ----------------------- | ------ | ---------------- |
| `arrow`                           | In-Memory Arrow Records | Alpha  | `memory`         |
| [`duckdb`](./duckdb.md)           | Embedded DuckDB         | Alpha  | `memory`, `file` |
| [`sqlite`](./sqlite.md)           | Embedded SQLite         | Alpha  | `memory`, `file` |
| [`postgres`](./postgres/index.md) | Attached PostgreSQL     | Alpha  |                  |

## Data types
Data accelerators may not support all possible Apache Arrow data types. For complete compatibility, see [specifications](../reference/datatypes.md).

## Refresh SQL

For datasets configured with a `full` refresh mode, this is an optional setting that filters the locally accelerated data to a smaller working set. This can be useful if your application/dashboard only ever uses a subset of the data stored in the federated table.

Filters will be pushed down to the remote source, and only the requested data will be transferred over the network.

```yaml
datasets:
  - name: accelerated_dataset
    acceleration:
      enabled: true
      refresh_mode: full
      refresh_interval: 10m
      refresh_sql: |
        SELECT * FROM accelerated_dataset WHERE city = 'Seattle'
```

For the complete reference, view the `refresh_sql` section of [datasets](../reference/spicepod/datasets.md#accelerationrefresh_sql).

:::warning[Limitations]
- The refresh SQL only supports filtering data from the current dataset - joining across other datasets is not supported.
- Selecting a subset of columns isn't supported - the refresh SQL needs to start with `SELECT * FROM {name}`.
- Queries for data that have been filtered out will not fall back to querying against the federated table.
:::

## Data Accelerator Docs

import DocCardList from '@theme/DocCardList';

<DocCardList />