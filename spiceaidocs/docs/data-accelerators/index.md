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

## Filtered Refresh

Often only a subset of the data in a federated table is used in applications or dashboards. Use the following options to filter the data Spice will accelerate to a working subset and reduce the amount of data that needs to be transferred and stored locally.

- [Refresh SQL](#refresh-sql) - Specify the filter as arbitrary SQL to be pushed down to the remote source.
- [Refresh Data Window](#refresh-data-window) - Filters out data from the federated source outside the specified window.

### Refresh SQL

Specify filters for the data accelerated from the federated source via arbitrary SQL. Only supported for datasets configured with a `full` refresh mode (the default).

Filters will be pushed down to the remote source, and only the requested data will be transferred over the network.

Example:

```yaml
datasets:
  - from: databricks:my_dataset
    name: accelerated_dataset
    acceleration:
      enabled: true
      refresh_mode: full
      refresh_check_interval: 10m
      refresh_sql: |
        SELECT * FROM accelerated_dataset WHERE city = 'Seattle'
```

`refresh_sql` can be updated on-demand via `PATCH /v1/datasets/:name/acceleration` API endpoint. This modification is non-persistent and will revert to the original value at the next runtime restart. An example query using cURL:

```bash
curl -i -X PATCH \
     -H "Content-Type: application/json" \
     -d '{
           "refresh_sql": "SELECT * FROM accelerated_dataset WHERE city = 'Bellevue'"
         }' \
     127.0.0.1:3000/v1/datasets/accelerated_dataset/acceleration
```

For the complete reference, view the `refresh_sql` section of [datasets](../reference/spicepod/datasets.md#accelerationrefresh_sql).

:::warning[Limitations]
- The refresh SQL only supports filtering data from the current dataset - joining across other datasets is not supported.
- Selecting a subset of columns isn't supported - the refresh SQL needs to start with `SELECT * FROM {name}`.
- Queries for data that have been filtered out will not fall back to querying against the federated table.
:::

### Refresh Data Window

Filters data from the federated source outside than the specified window. The only supported window is a lookback starting from `now() - refresh_data_window` to `now()`. This flag is only supported for datasets configured with a `full` refresh mode (the default).

Used in combination with the [`time_column`](../reference/spicepod/datasets.md#time_column) to identify the column that contains the timestamps to filter on. The [`time_format`](../reference/spicepod/datasets.md#time_format) column (optional) can be used to instruct the Spice runtime how to interpret the timestamps in the `time_column`.

Can also be combined with `refresh_sql` to further filter the data based on the temporal dimension.

Example:

```yaml
datasets:
  - from: databricks:my_dataset
    name: accelerated_dataset
    time_column: created_at
    acceleration:
      enabled: true
      refresh_mode: full
      refresh_check_interval: 10m
      refresh_sql: |
        SELECT * FROM accelerated_dataset WHERE city = 'Seattle'
      refresh_data_window: 1d
```

This configuration will only accelerate data from the federated source that matches the filter `city = 'Seattle'` and is less than 1 day old.

## Behavior on Zero Results

By default, accelerated datasets will only return results that have been accelerated locally. If the locally accelerated data is a subset of the full dataset in the federated source, i.e. through setting `refresh_sql`, `refresh_data_window` or configuring retention policies, queries against the accelerated dataset may return zero results, where the federated table would return results.

Control this behavior by setting `on_zero_results` in the acceleration configuration.

`on_zero_results`:
- `return_empty` (Default) - Return an empty result set when no data is found in the accelerated dataset.
- `use_source` - Fall back to querying the federated table when no data is found in the accelerated dataset.

Example:

```yaml
datasets:
  - from: databricks:my_dataset
    name: accelerated_dataset
    acceleration:
      enabled: true
      refresh_sql: SELECT * FROM accelerated_dataset where city = 'Seattle'
      on_zero_results: use_source
```

In this example a query against `accelerated_dataset` within Spice like `SELECT * FROM accelerated_dataset WHERE city = 'Portland'` would initially query against the accelerated data, see that it returns zero results and then fallback to querying against the federated table in Databricks.

:::warning
It is possible that even though the accelerated table returns some results, it may not contain all the data that would be returned by the federated table. `on_zero_results` only controls the behavior in the simple case where no data is returned by the acceleration for a given query.
:::

## Data Accelerator Docs

import DocCardList from '@theme/DocCardList';

<DocCardList />