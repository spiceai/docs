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
      refresh_check_interval: 1h
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
      refresh_check_interval: 1h
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
  - [`spark`](../../data-connectors/spark.md)
  - [`databricks`](../../data-connectors/databricks.md)
  - [`s3`](../../data-connectors/s3.md)
  - [`postgres`](../../data-connectors/postgres/index.md)
  - [`mysql`](../../data-connectors/mysql.md)
  - [`flightsql`](../../data-connectors/flightsql.md)
  - [`snowflake`](../../data-connectors/snowflake.md)
  - [`ftp`, `sftp`](../../data-connectors/ftp.md)
  - [`http`, `https`](../../data-connectors/https.md)
  - [`clickhouse`](../../data-connectors/clickhouse.md)
  - [`graphql`](../../data-connectors/graphql.md)

  If the Data Connector is not explicitly specified, it defaults to `spiceai`.

- `<path>`: The path to the dataset within the source.

## `ref`

An alternative to adding the dataset definition inline in the `spicepod.yaml` file.  `ref` can be use to point to a directory with a dataset defined in a `dataset.yaml` file.  For example, a dataset configured in a dataset.yaml in the "datasets/sample" directory can be referenced with the following:

**dataset.yaml**
```yaml
from: spice.ai/eth.recent_transactions
name: eth_recent_transactions
type: overwrite
acceleration:
  enabled: true
  refresh: 1h
```

**ref used in spicepod.yaml**
```yaml
version: v1beta1
kind: Spicepod
name: duckdb
datasets:
- ref: datasets/sample
```

## `name`

The name of the dataset. This is used to reference the dataset in the pod manifest, as well as in external data sources.

## `time_column`

Optional. The name of the column that represents the temporal (time) ordering of the dataset.

Required to enable a retention policy on the dataset.

## `time_format`

Optional. The format of the `time_column`. The following values are supported:
- `unix_seconds` - Default. Unix timestamp in seconds.
- `unix_millis` - Unix timestamp in milliseconds.
- `ISO8601` - [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.

:::warning[Limitations]
- String-based columns are assumed to be ISO8601 format.
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
- `append` - Append new data to the dataset. When `time_column` is specified, new records are fetched from the latest timestamp in the accelerated data at the `acceleration.refresh_check_interval`.

## `acceleration.refresh_check_interval`

Optional. How often data should be refreshed. For `append` datasets without a specific `time_column`, this config is not used.

See [Duration](../duration/index.md)

## `acceleration.refresh_sql`

Optional. Filters the data fetched from the source to be stored in the accelerator engine. Only supported for `full` refresh_mode datasets.

Must be of the form `SELECT * FROM {name} WHERE {refresh_filter}`. `{name}` is the dataset name declared above, `{refresh_filter}` is any SQL expression that can be used to filter the data, i.e. `WHERE city = 'Seattle'` to reduce the working set of data that is accelerated within Spice from the data source.

:::warning[Limitations]
- The refresh SQL only supports filtering data from the current dataset - joining across other datasets is not supported.
- Selecting a subset of columns isn't supported - the refresh SQL needs to start with `SELECT * FROM {name}`.
- Queries for data that have been filtered out will not fall back to querying against the federated table.
:::

## `acceleration.refresh_data_window`

Optional. A duration to filter dataset refresh source queries to recent data (duration into past from now). Requires `time_column` and `time_format` to also be configured. Only supported for `full` refresh mode datasets.

For example, `refresh_data_window: 24h` will include only records with a timestamp within the last 24 hours.

See [Duration](../duration/index.md)

## `acceleration.refresh_append_overlap`

Optional. A duration to specify how far back to include records based on the most recent timestamp found in the accelerated data. Requires `time_column` to also be configured. Only supported for `append` refresh mode datasets.

This setting can help mitigate missing data issues caused by late arriving data.

Example: If the latest timestamp in the accelerated data table is `2020-01-01T02:00:00Z`, setting `refresh_append_overlap: 1h` will include records starting from `2020-01-01T01:00:00Z`.

See [Duration](../duration/index.md)

## `acceleration.refresh_retry_enabled`

Optional. Specifies whether an accelerated dataset should retry data refresh in the event of transient errors. The default setting is true.

Retries utilize a [Fibonacci backoff strategy](https://en.wikipedia.org/wiki/Fibonacci_sequence). To disable refresh retries, set `refresh_retry_enabled: false`.

## `acceleration.refresh_retry_max_attempts`

Optional. Defines the maximum number of retry attempts when refresh retries are enabled. The default is undefined, allowing for unlimited attempts.

## `acceleration.params`

Optional. Parameters to pass to the acceleration engine. The parameters are specific to the acceleration engine used.

## `acceleration.engine_secret`

Optional. The secret store key to use the acceleration engine connection credential. For supported data connectors, use `spice login` to store the secret.

## `acceleration.retention_check_enabled`

Optional. Enable or disable retention policy check, defaults to `false`.

## `acceleration.retention_period`

Optional. The retention period for the dataset. Combine with `time_column` and `time_format` to determine if the data should be retained or not.

Required when `acceleration.retention_check_enabled` is `true`.

See [Duration](../duration/index.md)

## `acceleration.retention_check_interval`

Optional. How often the retention policy should be checked.

Required when `acceleration.retention_check_enabled` is `true`.

See [Duration](../duration/index.md)

## `acceleration.indexes`

Optional. Specify which indexes should be applied to the locally accelerated table. Not supported for in-memory Arrow acceleration engine.

The `indexes` field is a map where the key is the column reference and the value is the index type.

A column reference can be a single column name or a multicolumn key. The column reference must be enclosed in parentheses if it is a multicolumn key.

See [Indexes](../../features/local-acceleration/indexes.md)

```yaml
datasets:
  - from: spice.ai/eth.recent_blocks
    name: eth.recent_blocks
    acceleration:
      enabled: true
      engine: sqlite
      indexes:
        number: enabled # Index the `number` column
        "(hash, timestamp)": unique # Add a unique index with a multicolumn key comprised of the `hash` and `timestamp` columns
```

## `acceleration.primary_key`

Optional. Specify the primary key constraint on the locally accelerated table. Not supported for in-memory Arrow acceleration engine.

The `primary_key` field is a string that represents the column reference that should be used as the primary key. The column reference can be a single column name or a multicolumn key. The column reference must be enclosed in parentheses if it is a multicolumn key.

See [Constraints](../../features/local-acceleration/constraints.md)

```yaml
datasets:
  - from: spice.ai/eth.recent_blocks
    name: eth.recent_blocks
    acceleration:
      enabled: true
      engine: sqlite
      primary_key: hash # Define a primary key on the `hash` column
```

## `acceleration.on_conflict`

Optional. Specify what should happen when a constraint is violated. Not supported for in-memory Arrow acceleration engine.

The `on_conflict` field is a map where the key is the column reference and the value is the conflict resolution strategy.

A column reference can be a single column name or a multicolumn key. The column reference must be enclosed in parentheses if it is a multicolumn key.

Only a single `on_conflict` target can be specified, unless all `on_conflict` targets are specified with `drop`.

The possible conflict resolution strategies are:
- `upsert` - Upsert the incoming data when the primary key constraint is violated.
- `drop` - Drop the data when the primary key constraint is violated.

See [Constraints](../../features/local-acceleration/constraints.md)

```yaml
datasets:
  - from: spice.ai/eth.recent_blocks
    name: eth.recent_blocks
    acceleration:
      enabled: true
      engine: sqlite
      primary_key: hash
      indexes:
        "(number, timestamp)": unique
      on_conflict:
        # Upsert the incoming data when the primary key constraint on "hash" is violated, 
        # alternatively "drop" can be used instead of "upsert" to drop the data update.
        hash: upsert
```
