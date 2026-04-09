---
title: 'Datasets'
sidebar_label: 'Datasets'
description: 'Datasets YAML reference'
tags:
  - reference
  - datasets
  - spicepod
---

A Spicepod can contain one or more `datasets` referenced by relative path or defined inline.

Inline example:

`spicepod.yaml`

```yaml
datasets:
  - from: spice.ai/spiceai/quickstart/datasets/taxi_trips
    name: taxi_trips
    acceleration:
      enabled: true
      mode: memory # / file
      engine: arrow # / cayenne / duckdb / sqlite / postgres
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
  - ref: datasets/taxi_trips
```

`datasets/taxi_trips/dataset.yaml`

```yaml
from: spice.ai/spiceai/quickstart/datasets/taxi_trips
name: taxi_trips
type: overwrite
acceleration:
  enabled: true
  refresh: 1h
```

## `from`

The `from` field is a string that represents the Uniform Resource Identifier (URI) for the dataset. This URI is composed of two parts: a prefix indicating the Data Connector to use to connect to the dataset, a delimiter, and the path to the dataset within the source.

The syntax for the `from` field is as follows:

```yaml
from: <data_connector>:<path>
# OR
from: <data_connector>/<path>
# OR
from: <data_connector>://<path>
```

Where:

- `<data_connector>`: The Data Connector to use to connect to the dataset

  Currently supported data connectors:
  - [`spiceai`](../../components/data-connectors/spiceai)
  - [`dremio`](../../components/data-connectors/dremio)
  - [`spark`](../../components/data-connectors/spark)
  - [`databricks`](../../components/data-connectors/databricks)
  - [`s3`](../../components/data-connectors/s3)
  - [`postgres`](../../components/data-connectors/postgres)
  - [`mysql`](../../components/data-connectors/mysql)
  - [`flightsql`](../../components/data-connectors/flightsql)
  - [`snowflake`](../../components/data-connectors/snowflake)
  - [`ftp`, `sftp`](../../components/data-connectors/ftp)
  - [`http`, `https`](../../components/data-connectors/https)
  - [`clickhouse`](../../components/data-connectors/clickhouse)
  - [`graphql`](../../components/data-connectors/graphql)

  If the Data Connector is not explicitly specified, it defaults to `spiceai`.

- `<delimiter>`: The delimiter between the Data Connector and the path. Currently supported delimiters are `:`, `/`, and `://`. Some connectors place additional restrictions on the allowed delimiters to better conform to the expected syntax of the underlying data source, i.e. `s3://` is the only supported delimiter for the `s3` connector.

- `<path>`: The path to the dataset within the source.

:::info[Identifier Case Sensitivity]
Unquoted identifiers in the `<path>` are normalized to lowercase. To reference a table or schema with mixed-case or uppercase characters, wrap each case-sensitive part in double quotes:

```yaml
datasets:
  # Case is preserved for "ActionExecutions"
  - from: postgres:my_schema."ActionExecutions"
    name: action_executions

  # Quote each part individually as needed
  - from: databricks:my_catalog."MySchema"."MyTable"
    name: my_table
```

This applies to all federated database connectors where `<path>` references a table identifier. Connectors that interpret `<path>` as a file path (e.g. `s3`, `delta_lake`, `ftp`) do not apply identifier normalization. See [Identifier Case Sensitivity and Quoting](../../components/data-connectors/index.md#identifier-case-sensitivity-and-quoting) for details.
:::

## `ref`

An alternative to adding the dataset definition inline in the `spicepod.yaml` file. `ref` can be use to point to a directory with a dataset defined in a `dataset.yaml` file. For example, a dataset configured in a dataset.yaml in the "datasets/sample" directory can be referenced with the following:

**dataset.yaml**

```yaml
from: spice.ai/spiceai/quickstart/datasets/taxi_trips
name: taxi_trips
type: overwrite
acceleration:
  enabled: true
  refresh: 1h
```

**ref used in spicepod.yaml**

```yaml
version: v1
kind: Spicepod
name: duckdb
datasets:
  - ref: datasets/sample
```

## `name`

The name of the dataset. Used to reference the dataset in the pod manifest, as well as in external data sources. The name cannot be a [reserved keyword](./keywords).

Spice follows PostgreSQL SQL syntax conventions, which normalize unquoted identifiers to lowercase. A dataset named `LINEITEM` is accessible in queries as `lineitem`.

To preserve uppercase or mixed-case names, wrap the name in double quotes. In YAML, this requires an extra layer of quoting:

```yaml
datasets:
  - from: snowflake:SNOWFLAKE_SAMPLE_DATA.TPCH_SF100.LINEITEM
    name: '"LINEITEM"'
    params:
      snowflake_account: JYFGIWYEFBW
      snowflake_warehouse: snowflake_wh
      snowflake_password: ${secrets:SNOWFLAKE_PASSWORD}
      snowflake_username: ${secrets:SNOWFLAKE_USERNAME}
```

```sql
-- Query using the preserved uppercase name
SELECT * FROM "LINEITEM";
```

Without the double quotes, the same dataset would be queryable only as `lineitem`.

See [Identifier Case Sensitivity and Quoting](../../components/data-connectors/index.md#identifier-case-sensitivity-and-quoting) for full details on quoting in both the `from` and `name` fields.

## `description`

The description of the dataset. Used as part of the [Semantic Data Model](../../features/semantic-model).

## `access`

Optional. Specifies the access level for the dataset. Supported values are:

- `read` (default): Read-only access.
- `read_write`: Enables both read and write operations. Only supported for [write-capable connectors](../../tags/write).

To enable write operations, configure your dataset with `read_write` access:

```yaml
datasets:
  - from: glue:my_catalog.my_schema.my_table
    name: my_table
    access: read_write
    params:
      # ... connector-specific parameters
```

## `time_column`

Optional. The name of the column that represents the temporal (time) ordering of the dataset.

Required to enable a retention policy on the dataset.

## `time_format`

Optional. The format of the `time_column`. The following values are supported:

- `timestamp` - Default. Timestamp without a timezone. E.g. `2016-06-22 19:10:25` with data type `timestamp`.
- `timestamptz` - Timestamp with a timezone. E.g. `2016-06-22 19:10:25-07` with data type `timestamptz`.
- `unix_seconds` - Unix timestamp in seconds. E.g. `1718756687`.
- `unix_millis` - Unix timestamp in milliseconds. E.g. `1718756687000`.
- `ISO8601` - [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
- `date` - Date in YYYY-MM-DD format. E.g. `2024-01-01`.

Spice emits a warning if the `time_column` from the data source is incompatible with the `time_format` config.

:::warning[Limitations]

- String-based columns are assumed to be ISO8601 format.

:::

## `time_partition_column`

(Optional) Specify the column that represents the physical partitioning of the dataset when using append-based acceleration. When the defined `time_column` is a fine-grained timestamp and the dataset is physically partitioned by a coarser granularity (for example, by date), setting `time_partition_column` to the partition column (e.g. date_col) improves partition pruning, excludes irrelevant partitions during refreshes, and optimizes scan efficiency.

## `time_partition_format`

(Optional) Define the format of the `time_partition_column`. For instance, if the physical partitions follow a date format (YYYY-MM-DD), set this value to `date`. The same format options as `time_format` are supported for `time_partition_column`.

## Schema Inference and Evolution

Spice infers the dataset schema from the data source at startup. The inferred schema defines the column names, data types, and nullability used for the lifetime of that runtime process. Schema changes at the source are not applied at runtime — data refreshes will fail if the source schema drifts. Restart the runtime to re-infer the schema.

For connector-specific inference parameters, runtime schema change behavior, and recommendations, see [Schema Inference](../../components/data-connectors#schema-inference).

## `unsupported_type_action`

Optional. Specifies the action to take when a data type that is not supported by the data connector is encountered.

The following values are supported:

- `error` - Default. Return an error when an unsupported data type is encountered.
- `warn` - Log a warning and ignore the column containing the unsupported data type.
- `ignore` - Log nothing and ignore the column containing the unsupported data type.
- `string` - Attempt to convert the unsupported data type to a string. Currently only supports converting the PostgreSQL JSONB type.

:::warning[Limitations]

Not all connectors support specifying an `unsupported_type_action`. When specified on a connector that does not support the option, the connector will fail to register. The following connectors support `unsupported_type_action`:

- [DuckDB](../../components/data-connectors/duckdb)
- [PostgreSQL](../../components/data-connectors/postgres)

:::

## `ready_state`

Supports one of two values:

- `on_registration`: Mark the dataset as ready immediately, and queries on this table will fall back to the underlying source directly until the initial acceleration is complete
- `on_load`: Mark the dataset as ready only after the initial acceleration. Queries against the dataset will return an error before the load has been completed.

```yaml
datasets:
  - from: s3://my_bucket/my_dataset/
    name: my_dataset
    ready_state: on_registration # or on_load
    params: ...
    acceleration:
      enabled: true
```

## `check_availability`

Spice monitors the availability of non-accelerated datasets and emits metrics if a dataset becomes unavailable. Note that this monitoring process may trigger the startup of compute resources (for example, Databricks or Snowflake), potentially incurring additional costs. To disable availability monitoring, configure the `check_availability` parameter to `disabled`.

- `auto`: Automatically check the availability monitor of the dataset. This is the default value. Accelerated datasets are not monitored.
- `disabled`: Disable the availability monitor for the dataset.

```yaml
datasets:
  - from: databricks:catalog.schema.table
    name: my_dataset
    check_availability: disabled
    params: ...
```

The monitoring works by executing a query that selects one row and all columns from the dataset. i.e.:

```sql
SELECT
  "p_partkey",
  "p_name",
  "p_mfgr",
  "p_brand",
  "p_type",
  "p_size",
  "p_container",
  "p_retailprice",
  "p_comment"
FROM
  spiceai_sandbox.tpch.part
LIMIT 1
```

If the monitoring query fails a warning is emitted in the logs, an error is propagated to the `task_history` table and the `dataset_unavailable_time_ms` metric is incremented for the failing dataset.

## `acceleration`

Optional. Accelerate queries to the dataset by caching data locally.

## `acceleration.enabled`

Enable or disable acceleration, defaults to `true`.

## `acceleration.engine`

The acceleration engine to use, defaults to `arrow`. The following engines are supported:

- `arrow` - Accelerated in-memory backed by Apache Arrow DataTables.
- [`cayenne`](../../components/data-accelerators/cayenne) - Accelerated by Spice Cayenne (Vortex) engine (Alpha, v1.9.0-rc.1+).
- [`duckdb`](../../components/data-accelerators/duckdb) - Accelerated by an embedded DuckDB database.
- [`postgres`](../../components/data-accelerators/postgres) - Accelerated by a Postgres database.
- [`sqlite`](../../components/data-accelerators/sqlite) - Accelerated by an embedded SQLite database.
- [`turso`](../../components/data-accelerators/turso) - Accelerated by an embedded Turso (libSQL) database (Beta).

## `acceleration.mode`

Optional. The mode of acceleration. The following values are supported:

- `memory` - Store acceleration data in-memory. Not supported for Spice Cayenne (`cayenne`).
- `file` - Store acceleration data in a file. Reuses any existing file on startup. Supported for Spice Cayenne (`cayenne`), `duckdb` and `sqlite` acceleration engines.
- `file_create` - Always create a new acceleration file on startup, removing any existing file. When [snapshots](../../features/data-acceleration/snapshots) are enabled, the existing file is snapshotted before deletion. Supported for Spice Cayenne (`cayenne`), `duckdb` and `sqlite` acceleration engines.
- `file_update` - Open an existing acceleration file if it exists, then check schema compatibility on refresh. If the source schema change is additive (new columns only), the existing file is kept. If the schema change is incompatible (columns removed, renamed, or type changed), the file is snapshotted (if [snapshots](../../features/data-acceleration/snapshots) are enabled) and recreated from scratch. Supported for Spice Cayenne (`cayenne`), `duckdb` and `sqlite` acceleration engines.

## `acceleration.snapshots`

Optional. Controls how this dataset participates in managed acceleration snapshots. Requires the Spicepod to configure the top-level [`snapshots` block](.#snapshots), the acceleration engine to be `duckdb` or `sqlite`, and `mode: file` with a dataset-specific file path (for example `acceleration.params.duckdb_file: /nvme/my_dataset.db`).

Supported values:

- `enabled` – Download the newest snapshot on startup when the acceleration file is missing and write a fresh snapshot after each refresh.
- `bootstrap_only` – Download snapshots on startup but never write new ones.
- `create_only` – Write snapshots after refreshes but never download them on startup.
- `disabled` (default) – Do not use snapshots for this dataset.

Snapshots are written beneath the configured snapshot location using Hive-style partitioning (`month=YYYY-MM/day=YYYY-MM-DD/dataset=<dataset>`). For more background, see [Acceleration snapshots](../../features/data-acceleration/snapshots).

## `acceleration.snapshots_trigger`

Optional. Controls when Spice creates new snapshots. The available triggers depend on the dataset's refresh mode.

**For batch-based datasets** (`refresh_mode: full`, `refresh_mode: caching`, or `refresh_mode: append` with `time_column`):

- `refresh_complete` (default) – Create a snapshot after each data refresh completes.
- `time_interval` – Create snapshots at a fixed time interval specified by `snapshots_trigger_threshold`.

**For stream-based datasets** (`refresh_mode: changes`, or `refresh_mode: append` without `time_column`):

- `time_interval` (default) – Create snapshots at a fixed time interval. Defaults to `10m` if `snapshots_trigger_threshold` is not specified.
- `stream_batches` – Create a snapshot after a specified number of batches are processed.

See [Acceleration snapshots](../../features/data-acceleration/snapshots) for more details.

## `acceleration.snapshots_trigger_threshold`

Optional. The threshold value for snapshot creation, interpreted based on the configured `snapshots_trigger`:

- When `snapshots_trigger: time_interval` – A duration specifying how often to create snapshots (e.g., `10m`, `1h`). Defaults to `10m` for stream-based datasets.
- When `snapshots_trigger: stream_batches` – An integer specifying the number of batch updates after which to create a snapshot.

Not applicable when `snapshots_trigger: refresh_complete`.

## `acceleration.snapshots_compaction`

Optional. Enable database compaction before uploading snapshots. Only supported for the `duckdb` acceleration engine. Defaults to `disabled`.

When enabled, Spice uses DuckDB's internal compaction mechanism (`COPY DATABASE`) to optimize the database file before uploading, reducing snapshot size and improving bootstrap performance.

Supported values:

- `enabled` – Compact the database before creating each snapshot.
- `disabled` (default) – Upload snapshots without compaction.

## `acceleration.refresh_mode`

Optional. How to refresh the dataset. The following values are supported:

- `full` - Refresh the entire dataset.
- `append` - Append new data to the dataset. When `time_column` is specified, new records are fetched from the latest timestamp in the accelerated data at the `acceleration.refresh_check_interval`.
- `changes` - Apply change data capture (CDC) events to incrementally update the dataset.
- `caching` - Cache data based on request metadata (HTTP requests). Uses row-level replacement based on cache keys. See [Caching Mode](../../features/data-acceleration/refresh-modes/caching) for details.

## `acceleration.refresh_check_interval`

Optional. How often data should be refreshed. For `append` datasets without a specific `time_column`, this config is not used. If not defined, the accelerator will not refresh after it initially loads data. Cannot be specified in conjunction with a `refresh_cron`.

See [Duration](../duration)

## `acceleration.refresh_cron`

Optional. Specifies a cron schedule which controls how often data is refreshed. For `append` datasets without a specific `time_column`, this config is not used. If not defined, the accelerator will not refresh after it initially loads data.

See the [cron schedule reference](../cron).

## `acceleration.params.caching_ttl`

Optional. The time-to-live (TTL) for cached data before it is considered stale. Only applicable when `refresh_mode: caching`. Defaults to `30s`.

When cached data exceeds this age (measured from the `fetched_at` timestamp), it becomes stale. If `caching_stale_while_revalidate_ttl` is also configured, stale data is immediately served to queries (no delay) while a background refresh is triggered to update the cache, implementing the Stale-While-Revalidate (SWR) pattern. If `caching_stale_while_revalidate_ttl` is not set, queries wait for fresh data once the TTL expires.

**Example**:

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: tv_shows
    acceleration:
      enabled: true
      refresh_mode: caching
      engine: duckdb
      mode: file # Persist cache to disk
      params:
        caching_ttl: 15s # Cache data is fresh for 15 seconds
      refresh_check_interval: 30s # Periodic background refresh
```

See [Caching Mode](../../features/data-acceleration/refresh-modes/caching#cache-ttl-time-to-live) for detailed TTL configuration and behavior.

See [Duration](../duration)

## `acceleration.params.caching_stale_while_revalidate_ttl`

Optional. The duration after `caching_ttl` expires during which stale data is served while refreshing in the background. Only applicable when `refresh_mode: caching`. Defaults to none (stale data is not served).

When `caching_ttl` expires and data becomes stale, this parameter controls how long stale data continues to be served immediately while a background refresh occurs. After the combined `caching_ttl + caching_stale_while_revalidate_ttl` period, queries wait for fresh data instead of returning stale results.

If omitted, cached data becomes "rotten" immediately after `caching_ttl` expires, and queries will wait for fresh data rather than returning stale results.

**Example**:

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: tv_shows
    acceleration:
      enabled: true
      refresh_mode: caching
      engine: duckdb
      mode: file
      params:
        caching_ttl: 15s # Cache data is fresh for 15 seconds
        caching_stale_while_revalidate_ttl: 30s # Serve stale data for 30 seconds while refreshing
      refresh_check_interval: 60s
```

See [Caching Mode](../../features/data-acceleration/refresh-modes/caching#cache-ttl-time-to-live) for detailed TTL configuration and behavior.

See [Duration](../duration)

## `acceleration.params.caching_stale_if_error`

Optional. Controls whether expired cached data is served when the upstream data source returns an error. Only applicable when `refresh_mode: caching`. Defaults to `disabled`.

When set to `enabled`, queries return expired cached data instead of failing if the upstream source returns an error during a refresh attempt. This provides fault tolerance for APIs with intermittent availability or rate limits.

Valid values:

- `enabled` - Serve expired cached data when upstream errors occur
- `disabled` (default) - Propagate upstream errors to queries

**Example**:

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: tv_shows
    acceleration:
      enabled: true
      refresh_mode: caching
      engine: duckdb
      mode: file
      params:
        caching_ttl: 15s
        caching_stale_while_revalidate_ttl: 30s
        caching_stale_if_error: enabled # Serve stale data on upstream errors
      refresh_check_interval: 60s
```

See [Caching Mode](../../features/data-acceleration/refresh-modes/caching#stale-if-error-behavior) for detailed behavior.

## `acceleration.refresh_sql`

Optional. Filters the data fetched from the source to be stored in the accelerator engine. Supported for `full` and `append` refresh mode datasets.

Must be of the form `SELECT * FROM {name} WHERE {refresh_filter}`. `{name}` is the dataset name declared above, `{refresh_filter}` is any SQL expression that can be used to filter the data, i.e. `WHERE city = 'Seattle'` to reduce the working set of data that is accelerated within Spice from the data source.

:::warning[Limitations]

- The refresh SQL only supports filtering data from the current dataset - joining across other datasets is not supported.
- Queries for data that have been filtered out will not fall back to querying against the federated table.

:::

## `acceleration.refresh_data_window`

Optional. A duration to filter dataset refresh source queries to recent data (duration into past from now). Requires `time_column` and `time_format` to also be configured. Supported for `full` and `append` refresh mode datasets.

For example, `refresh_data_window: 24h` will include only records with a timestamp within the last 24 hours.

See [Duration](../duration)

## `acceleration.refresh_append_overlap`

Optional. A duration to specify how far back to include records based on the most recent timestamp found in the accelerated data. Requires `time_column` to also be configured. Only supported for `append` refresh mode datasets.

This setting can help mitigate missing data issues caused by late arriving data.

Example: If the latest timestamp in the accelerated data table is `2020-01-01T02:00:00Z`, setting `refresh_append_overlap: 1h` will include records starting from `2020-01-01T01:00:00Z`.

See [Duration](../duration)

## `acceleration.refresh_retry_enabled`

Optional. Specifies whether an accelerated dataset should retry data refresh in the event of transient errors. The default setting is true.

Retries follow a [Fibonacci backoff strategy](https://en.wikipedia.org/wiki/Fibonacci_sequence). To disable refresh retries, set `refresh_retry_enabled: false`.

## `acceleration.refresh_retry_max_attempts`

Optional. Defines the maximum number of retry attempts when refresh retries are enabled. The default is undefined, with no upper limit on attempts.

## `acceleration.refresh_on_startup`

Optional. Controls the refresh behavior of an accelerated dataset across restarts. Defaults to `auto`.

### Supported Values

- **`auto` (Default)** – Maintains refresh state across restarts:
  - With `refresh_check_interval`: Schedules next refresh based on last successful refresh time, triggering immediately if interval has already elapsed
  - Without `refresh_check_interval`: No refresh (on-demand only)
- **`always`** – Forces a dataset refresh on every startup, regardless of the existing acceleration state.

Setting `refresh_on_startup: always` ensures that accelerated data is always refreshed to match the source when the service restarts. This is useful in **development environments** or when **data consistency is critical** after deployment.

## `acceleration.params`

Optional. Parameters to pass to the acceleration engine. The parameters are specific to the acceleration engine used.

## `acceleration.retention_check_enabled`

Optional. Enable or disable retention policy check, defaults to `false`.

## `acceleration.retention_period`

Optional. The retention period for the dataset. Combine with `time_column` and `time_format` to determine if the data should be retained or not.

`retention_period` or `retention_sql` must be specified when `acceleration.retention_check_enabled` is `true`. When both `retention_period` and `retention_sql` are configured, both retention policies will be applied during each retention check.

See [Duration](../duration)

## `acceleration.retention_sql`

Optional. Custom SQL statement to define data retention logic. Takes the form of a `DELETE FROM <table> WHERE <predicates>` statement.

This parameter is useful for scenarios like soft-deleting rows in append-only datasets or removing data based on complex business logic that goes beyond simple time-based retention.

`retention_period` or `retention_sql` must be specified when `acceleration.retention_check_enabled` is `true`. When both `retention_period` and `retention_sql` are configured, both retention policies will be applied during each retention check.

## `acceleration.retention_check_interval`

Optional. How often the retention policy should be checked.

Required when `acceleration.retention_check_enabled` is `true`.

See [Duration](../duration)

## `acceleration.refresh_jitter_enabled`

Optional. Enable or disable refresh jitter, defaults to `false`. The refresh jitter adds/substracts a randomized time period from the `refresh_check_interval`.

## `acceleration.refresh_jitter_max`

Optional. The maximum amount of jitter to add to the refresh interval. The jitter is a random value between 0 and `refresh_jitter_max`. Defaults to 10% of `refresh_check_interval`.

## `metrics`

Optional. Enable component-specific metrics for the dataset. Each component can expose its own set of metrics that can be enabled selectively to monitor specific aspects of its operation.

Component metrics are disabled by default and can be enabled by adding a `metrics` section to the dataset configuration. Each metric can be enabled individually by specifying its name in the metrics list.

### Example Configuration

```yaml
datasets:
  - from: mysql:my_table
    name: my_dataset
    metrics:
      - name: connection_count
        enabled: true
      - name: connections_in_pool
        enabled: true
      - name: active_wait_requests
        enabled: true
    params:
      mysql_host: localhost
      mysql_tcp_port: 3306
      mysql_user: root
      mysql_pass: ${secrets:MYSQL_PASS}
```

For detailed information about metrics available for specific components, see the [component metrics documentation](../../features/observability/component_metrics).

## `acceleration.indexes`

Optional. Specify which indexes should be applied to the locally accelerated table. Not supported for in-memory Arrow acceleration engine.

The `indexes` field is a map where the key is the column reference and the value is the index type.

A column reference can be a single column name or a multicolumn key. The column reference must be enclosed in parentheses if it is a multicolumn key.

See [Indexes](../../features/data-acceleration/indexes)

```yaml
datasets:
  - from: spice.ai/eth.recent_blocks
    name: eth.recent_blocks
    acceleration:
      enabled: true
      engine: sqlite
      indexes:
        number: enabled # Index the `number` column
        '(hash, timestamp)': unique # Add a unique index with a multicolumn key comprised of the `hash` and `timestamp` columns
```

## `acceleration.primary_key`

Optional. Specify the primary key constraint on the locally accelerated table. Not supported for in-memory Arrow acceleration engine.

The `primary_key` field is a string that represents the column reference that should be used as the primary key. The column reference can be a single column name or a multicolumn key. The column reference must be enclosed in parentheses if it is a multicolumn key.

See [Constraints](../../features/data-acceleration/constraints)

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
- `upsert_dedup` - Same as `upsert`, but also deduplicates the data if there are duplicate rows that trigger a violation constraint within a single update. See [Advanced upsert behavior](../../features/data-acceleration/constraints#advanced-upsert-options).
- `upsert_dedup_by_row_id` - Same as `upsert`, but resolves any violations by arbitrarily choosing the row with the highest row id. See [Advanced upsert behavior](../../features/data-acceleration/constraints#advanced-upsert-options).
- `drop` - Drop the data when the primary key constraint is violated.

See [Constraints](../../features/data-acceleration/constraints)

```yaml
datasets:
  - from: spice.ai/eth.recent_blocks
    name: eth.recent_blocks
    acceleration:
      enabled: true
      engine: sqlite
      primary_key: hash
      indexes:
        '(number, timestamp)': unique
      on_conflict:
        # Upsert the incoming data when the primary key constraint on "hash" is violated,
        # alternatively "drop" can be used instead of "upsert" to drop the data update.
        hash: upsert
```

## `columns`

Optional. Define metadata, semantic details and features (e.g. embeddings, or table indexes) for specific columns in the dataset.

```yaml
datasets:
  - from: file:sales_data.parquet
    name: sales
    columns:
      - name: address_line1
        description: The first line of the address.
        embeddings:
          - from: hf_minilm
            row_id: order_number
            chunking:
              enabled: true
              target_chunk_size: 256
              overlap_size: 32
        full_text_search:
          enabled: true
```

## `columns[*].name`

The name of the column in the table schema.

## `columns[*].description`

Optional. A description of the column's contents and purpose. Used as part of the [Semantic Data Model](../../features/semantic-model).

## `columns[*].embeddings`

Optional. Create vector embeddings for this column.

## `columns[*].embeddings[*].from`

The embedding model to use, specify the component name.

## `columns[*].embeddings[*].row_id`

Optional. For datasets without a primary key, used to explicitly specify column(s) that uniquely identify a row.

Specifying a `row_id` enables unique identifier lookups for datasets from external systems that may not have a primary key.

## `columns[*].embeddings[*].chunking` {#columns-embeddings-chunking}

Optional. The configuration to enable and define the chunking strategy for the embedding column.

```yaml
columns:
  - name: description
    embeddings:
      - from: hf_minilm
        chunking:
          enabled: true
          target_chunk_size: 512
          overlap_size: 128
          trim_whitespace: false
```

See [`embeddings[*].chunking`](#embeddingschunking) for details.

## `columns[*].embeddings[*].vector_size`

Optional. Specifies the size (number of dimensions) of the embedding vector for use in federated queries to databases that do not support arrays with fixed lengths.

```yaml
columns:
  - name: review_body
    embeddings:
      - from: embed-static-retrieval
        vector_size: 1024
```

## `columns[*].full_text_search` {#columns-search-full-text}

## `columns[*].full_text_search.enabled`

Optional. Enable or disable full text search support for specific column in the dataset. Default `false`.

## `columns[*].full_text_search.row_id`

Optional. For datasets without a primary key, used to explicitly specify column(s) that uniquely identify a row.

Specifying a `row_id` enables unique identifier lookups for datasets from external systems that may not have a primary key.

## `columns[*].metadata`

Optional. Specific metadata associated to the column.

## `columns[*].metadata.vectors`

Optional. If provided, a vector engine (see [below](#vectors)) should store this column for a particular use, determined by the value, which is one of:

- `non-filterable`: Store the column in the vector engine.
- `filterable`: Store the column in the vector engine, and ensure the engine can filter on the column (if possible in the engine).

Only applicable if `vectors.enabled` is both defined and `true`.

## `embeddings`

Optional. Create vector embeddings for specific columns of the dataset.

```yaml
datasets:
  - from: spice.ai/eth.recent_blocks
    name: eth.recent_blocks
    embeddings:
      - column: extra_data
        use: hf_minilm
```

## `embeddings[*].column`

The column name to create an embedding for.

## `embeddings[*].use`

The embedding model to use, specific the component name `embeddings[*].name`.

## `embeddings[*].column_pk`

Optional. For datasets without a primary key, explicitly specify column(s) that uniquely identify a row.

## `embeddings[*].chunking`

Optional. The configuration to enable and define the chunking strategy for the embedding column.

```yaml
datasets:
  - from: spice.ai/eth.recent_blocks
    name: eth.recent_blocks
    embeddings:
      - column: extra_data
        use: hf_minilm
        chunking:
          enabled: true
          target_chunk_size: 512
          overlap_size: 128
          trim_whitespace: false
```

## `embeddings[*].chunking.enabled`

Optional. Enable or disable chunking for the embedding column. Defaults to `false`.

## `embeddings[*].chunking.target_chunk_size`

The desired size of each chunk, in tokens.

If the desired chunk size is larger than the maximum size of the embedding model, the maximum size will be used.

## `embeddings[*].chunking.overlap_size`

Optional. The number of tokens to overlap between chunks. Defaults to `0`.

## `embeddings[*].chunking.trim_whitespace`

Optional. If enabled, the content of each chunk will be trimmed to remove leading and trailing whitespace. Defaults to `true`.

## `metadata` {#metadata}

Optional. Additional key-value metadata for the dataset.

The `metadata` field serves two purposes:

1. **Semantic metadata** — Arbitrary key-value pairs used as part of the [Semantic Data Model](../../features/semantic-model).

    ```yaml
    datasets:
      - from: spice.ai/eth.recent_blocks
        name: eth.recent_blocks
        metadata:
          instructions: The last 128 blocks.
    ```

2. **File metadata columns** — For [file-based connectors](../../components/data-connectors/#metadata-columns) (S3, ABFS, File, FTP, SFTP, SMB, NFS, HTTP/HTTPS), the following reserved keys enable virtual columns that expose per-file object store metadata in query results:

    | Key              | Value       | Column Type            | Description                        |
    | ---------------- | ----------- | ---------------------- | ---------------------------------- |
    | `_location`      | `enabled`   | `Utf8`                 | Full URI of the source file        |
    | `_last_modified` | `enabled`   | `Timestamp(µs, "UTC")` | When the file was last modified    |
    | `_size`          | `enabled`   | `UInt64`               | File size in bytes                 |

    ```yaml
    datasets:
      - from: s3://bucket/data/
        name: my_data
        params:
          file_format: parquet
        metadata:
          _location: enabled
          _last_modified: enabled
          _size: enabled
    ```

    If a data file already contains a column with the same name as a metadata column, the metadata column is not added.

## `vectors`

## `vectors.enabled`

Enable or disable vector storage, defaults to `true`.

## `vectors.engine`

The vector engine to use. The following engines are supported:

- [`s3_vectors`](../../components/vectors/s3_vectors) - Vectors are created and indexed into [Amazon S3 Vectors](https://aws.amazon.com/s3/features/vectors/).

## `vectors.params`

Optional. Parameters to pass to the vector engine. The parameters are specific to the vector engine used.
