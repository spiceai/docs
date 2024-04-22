---
title: 'Datasets'
sidebar_label: 'Datasets'
description: 'Datasets YAML reference'
---

A Spicepod can contain one or more datasets referenced by relative path, or defined inline.

# `datasets`

Inline example:

`spicepod.yaml`

```yaml
datasets:
  - from: spice.ai/eth.beacon.eigenlayer
    name: strategy_manager_deposits
    acceleration:
      enabled: true
      mode: memory # / file
      engine: arrow # / duckdb / sqlite / postgres
      refresh_interval: 1h
      refresh_mode: full / append # update / incremental
```

`spicepod.yaml`

```yaml
datasets:
  - from: databricks:spiceai.datasets.specific_table
    name: uniswap_eth_usd
    params:
      environment: prod
    acceleration:
      enabled: true
      mode: memory # / file
      engine: arrow # / duckdb
      refresh_interval: 1h
      refresh_mode: full / append # update / incremental
```

Relative path example:

`spicepod.yaml`

```yaml
datasets:
  - ref: datasets/eth_recent_transactions
```

`datasets/eth_recent_transactions/dataset.yaml`

```yaml
from: spice.ai/eth.recent_transactions
name: eth_recent_transactions
type: overwrite
acceleration:
  enabled: true
  refresh: 1h
```

## `from`

The `from` field is a string that represents the Uniform Resource Identifier (URI) for the dataset. This URI is composed of two parts: a prefix indicating the Data Connector to use to connect to the dataset, and the path to the dataset within the source.

The syntax for the `from` field is as follows:

```yaml
from: <data_connector>:<path>
```

Where:

- `<data_connector>`: The Data Connector to use to connect to the dataset

  Currently supported data connectors:

  - [`spiceai`](../../data-connectors/spiceai.md)
  - [`dremio`](../../data-connectors/dremio.md)
  - [`databricks`](../../data-connectors/databricks.md)
  - [`s3`](../../data-connectors/s3.md)
  - [`postgres`](../../data-connectors/postgres/index.md)
  - [`mysql`](../../data-connectors/mysql.md)

  If the Data Connector is not explicitly specified, it defaults to `spiceai`.

- `<path>`: The path to the dataset within the source.

## `name`

The name of the dataset. This is used to reference the dataset in the pod manifest, as well as in external data sources.

## `time_column`

Optional. The name of the column that represents the temporal(time) ordering of the dataset.

It is required to enable retention policy on the acceleration.

## `time_format`

Optional. The format of the `time_column`. The following values are supported:
- `unix_seconds` - Default. Unix timestamp in seconds.
- `unix_millis` - Unix timestamp in milliseconds.
- `ISO8601` - [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format. 

:::warning[Current Limitations]
- any string-based column is assumed to be ISO8601 format.
:::

## `acceleration`

Optional. Accelerate queries to the dataset by caching data locally.

## `acceleration.enabled`

Enable or disable acceleration, defaults to `true`.

## `acceleration.engine`

The acceleration engine to use, defaults to `arrow`. The following engines are supported:

- `arrow` - Accelerated in-memory backed by Apache Arrow DataTables.
- [`duckdb`](../../data-accelerators/duckdb.md) - Accelerated by an embedded DuckDB database.
- [`postgres`](../../data-accelerators/postgres/index.md) - Accelerated by a Postgres database.
- [`sqlite`](../../data-accelerators/sqlite.md) - Accelerated by an embedded Sqlite database.

## `acceleration.mode`

Optional. The mode of acceleration. The following values are supported:

- `memory` - Store acceleration data in-memory.
- `file` - Store acceleration data in a file. Only supported for `duckdb` and `sqlite` acceleration engines.

`mode` is currently only supported for the `duckdb` engine.

## `acceleration.refresh_mode`

Optional. How to refresh the dataset. The following values are supported:

- `full` - Refresh the entire dataset.
- `append` - Append new data to the dataset.

## `acceleration.refresh_interval`

Optional. How often data should be refreshed. Only supported for `full` refresh_mode datasets. For `append` datasets, the refresh interval not used.

See [Duration](../duration/index.md)

## `acceleration.refresh_sql`

Optional. Filters the data fetched from the source to be stored in the accelerator engine. Only supported for `full` refresh_mode datasets.

Must be of the form `SELECT * FROM {name} WHERE {refresh_filter}`. `{name}` is the dataset name declared above, `{refresh_filter}` is any SQL expression that can be used to filter the data, i.e. `WHERE city = 'Seattle'` to reduce the working set of data that is accelerated within Spice from the data source.

:::warning[Current Limitations]
- The refresh SQL only supports filtering data from the current dataset - joining across other datasets is not supported.
- Selecting a subset of columns isn't supported - the refresh SQL needs to start with `SELECT * FROM {name}`.
- Queries for data that have been filtered out will not fall back to querying against the federated table.
:::

## `acceleration.params`

Optional. Parameters to pass to the acceleration engine. The parameters are specific to the acceleration engine used.

## `acceleration.engine_secret`

Optional. The secret store key to use the acceleration engine connection credential. For supported data connectors, use `spice login` to store the secret.

## `acceleration.retention_enabled`

Optional. Enable or disable retention policy, defaults to `false`.

## `acceleration.retention_period`

Optional. The retention period for the dataset. Combine with `time_column` and `time_format` to determine if the data should be retained or not.

See [Duration](../duration/index.md)

## `acceleration.retention_check_interval`

Optional. How often the retention policy should be checked.

See [Duration](../duration/index.md)
