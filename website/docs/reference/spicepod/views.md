---
title: 'Views'
sidebar_label: 'Views'
description: 'Views YAML reference'
tags:
  - reference
  - views
  - spicepod
---

A Spicepod can contain one or more `views` referenced by relative path or defined inline.

Inline example:

`spicepod.yaml`

```yaml
views:
  - name: votes
    sql_ref: ./a/file/path.sql
  - name: rankings
    sql: |
      WITH a AS (
        SELECT products.id, SUM(count) AS count
        FROM orders
        INNER JOIN products ON orders.product_id = products.id
        GROUP BY products.id
      )
      SELECT name, count
      FROM products
      LEFT JOIN a ON products.id = a.id
      ORDER BY count DESC
      LIMIT 5
    acceleration:
      enabled: true
```

## `name`

The name of the view. Used to reference the view in the pod manifest, as well as in external data sources. The name cannot be a [reserved keyword](../../reference/spicepod/keywords.md).

## `description`

The description of the view. Used as part of the [Semantic Data Model](../../features/semantic-model/index.md).

## `ready_state`

Supports one of two values:

- `on_registration`: Mark the view as ready immediately, and queries on this table will fall back to the underlying source directly until the initial acceleration is complete
- `on_load`: Mark the view as ready only after the initial acceleration. Queries against the view will return an error before the load has been completed.

```yaml
views:
  - name: my_view
    sql_ref: ./my_view.sql
    ready_state: on_registration # or on_load
    acceleration:
      enabled: true
```

## `acceleration`

Optional. Accelerate queries to the view by caching data locally.

## `acceleration.enabled`

Enable or disable acceleration, defaults to `true`.

## `acceleration.engine`

The acceleration engine to use, defaults to `arrow`. The following engines are supported:

- `arrow` - Accelerated in-memory backed by Apache Arrow DataTables.
- [`duckdb`](../../components/data-accelerators/duckdb.md) - Accelerated by an embedded DuckDB database.
- [`postgres`](../../components/data-accelerators/postgres/index.md) - Accelerated by a Postgres database.
- [`sqlite`](../../components/data-accelerators/duckdb.md) - Accelerated by an embedded SQLite database.

## `acceleration.mode`

Optional. The mode of acceleration. The following values are supported:

- `memory` - Store acceleration data in-memory.
- `file` - Store acceleration data in a file. Only supported for `duckdb` and `sqlite` acceleration engines.

`mode` is currently only supported for the `duckdb` engine.

## `acceleration.snapshots`

Optional. Controls how this view participates in managed acceleration snapshots. Requires the Spicepod to configure the top-level [`snapshots` block](./index.md#snapshots), the acceleration engine to be `duckdb` or `sqlite`, and `mode: file` with a view-specific file path (for example `acceleration.params.duckdb_file: /nvme/my_view.db`).

Supported values:

- `enabled` – Download the newest snapshot on startup when the acceleration file is missing and write a fresh snapshot after each refresh.
- `bootstrap_only` – Download snapshots on startup but never write new ones.
- `create_only` – Write snapshots after refreshes but never download them on startup.
- `disabled` (default) – Do not use snapshots for this view.

Snapshots are written beneath the configured snapshot location using Hive-style partitioning (`month=YYYY-MM/day=YYYY-MM-DD/view=<view>`). For more background, see [Acceleration snapshots](../../features/data-acceleration/snapshots.md).

## `acceleration.refresh_mode`

Optional. How to refresh the view. The following values are supported:

- `full` - Refresh the entire view.
- `append` - Append new data to the view. When `time_column` is specified, new records are fetched from the latest timestamp in the accelerated data at the `acceleration.refresh_check_interval`.

## `acceleration.refresh_check_interval`

Optional. How often data should be refreshed. For `append` views without a specific `time_column`, this config is not used. If not defined, the accelerator will not refresh after it initially loads data. Cannot be specified in conjunction with a `refresh_cron`.

See [Duration](../duration/index.md)

## `acceleration.refresh_cron`

Optional. Specifies a cron schedule which controls how often data is refreshed. For `append` views without a specific `time_column`, this config is not used. If not defined, the accelerator will not refresh after it initially loads data.

See the [cron schedule reference](../../reference/cron.md).

## `acceleration.refresh_sql`

Optional. Filters the data fetched from the source to be stored in the accelerator engine. Only supported for `full` refresh_mode views.

Must be of the form `SELECT * FROM {name} WHERE {refresh_filter}`. `{name}` is the view name declared above, `{refresh_filter}` is any SQL expression that can be used to filter the data, i.e. `WHERE city = 'Seattle'` to reduce the working set of data that is accelerated within Spice from the data source.

:::warning[Limitations]

- The refresh SQL only supports filtering data from the current view - joining across other views is not supported.
- Queries for data that have been filtered out will not fall back to querying against the federated table.

:::

## `acceleration.refresh_data_window`

Optional. A duration to filter view refresh source queries to recent data (duration into past from now). Requires `time_column` and `time_format` to also be configured. Only supported for `full` refresh mode views.

For example, `refresh_data_window: 24h` will include only records with a timestamp within the last 24 hours.

See [Duration](../duration/index.md)

## `acceleration.refresh_append_overlap`

Optional. A duration to specify how far back to include records based on the most recent timestamp found in the accelerated data. Requires `time_column` to also be configured. Only supported for `append` refresh mode views.

This setting can help mitigate missing data issues caused by late arriving data.

Example: If the latest timestamp in the accelerated data table is `2020-01-01T02:00:00Z`, setting `refresh_append_overlap: 1h` will include records starting from `2020-01-01T01:00:00Z`.

See [Duration](../duration/index.md)

## `acceleration.refresh_retry_enabled`

Optional. Specifies whether an accelerated view should retry data refresh in the event of transient errors. The default setting is true.

Retries utilize a [Fibonacci backoff strategy](https://en.wikipedia.org/wiki/Fibonacci_sequence). To disable refresh retries, set `refresh_retry_enabled: false`.

## `acceleration.refresh_retry_max_attempts`

Optional. Defines the maximum number of retry attempts when refresh retries are enabled. The default is undefined, allowing for unlimited attempts.

## `acceleration.refresh_on_startup`

Optional. Controls the refresh behavior of an accelerated view across restarts. Defaults to `auto`.

### Supported Values

- **`auto` (Default)** – Maintains refresh state across restarts:
  - With `refresh_check_interval`: Schedules next refresh based on last successful refresh time, triggering immediately if interval has already elapsed
  - Without `refresh_check_interval`: No refresh (on-demand only)
- **`always`** – Forces a view refresh on every startup, regardless of the existing acceleration state.

Setting `refresh_on_startup: always` ensures that accelerated data is always refreshed to match the source when the service restarts. This is useful in **development environments** or when **data consistency is critical** after deployment.

## `acceleration.params`

Optional. Parameters to pass to the acceleration engine. The parameters are specific to the acceleration engine used.

## `acceleration.engine_secret`

Optional. The secret store key to use the acceleration engine connection credential. For supported data connectors, use `spice login` to store the secret.

## `acceleration.retention_check_enabled`

Optional. Enable or disable retention policy check, defaults to `false`.

## `acceleration.retention_period`

Optional. The retention period for the view. Combine with `time_column` and `time_format` to determine if the data should be retained or not.

`retention_period` or `retention_sql` must be specified when `acceleration.retention_check_enabled` is `true`. When both `retention_period` and `retention_sql` are configured, both retention policies will be applied during each retention check.

See [Duration](../duration/index.md)

## `acceleration.retention_sql`

Optional. Custom SQL statement to define data retention logic. Takes the form of a `DELETE FROM <table> WHERE <predicates>` statement.

This parameter is useful for scenarios like soft-deleting rows in append-only views or removing data based on complex business logic that goes beyond simple time-based retention.

`retention_period` or `retention_sql` must be specified when `acceleration.retention_check_enabled` is `true`. When both `retention_period` and `retention_sql` are configured, both retention policies will be applied during each retention check.

## `acceleration.retention_check_interval`

Optional. How often the retention policy should be checked.

Required when `acceleration.retention_check_enabled` is `true`.

See [Duration](../duration/index.md)

## `acceleration.refresh_jitter_enabled`

Optional. Enable or disable refresh jitter, defaults to `false`. The refresh jitter adds/subtracts a randomized time period from the `refresh_check_interval`.

## `acceleration.refresh_jitter_max`

Optional. The maximum amount of jitter to add to the refresh interval. The jitter is a random value between 0 and `refresh_jitter_max`. Defaults to 10% of `refresh_check_interval`.

## `acceleration.indexes`

Optional. Specify which indexes should be applied to the locally accelerated table. Not supported for in-memory Arrow acceleration engine.

The `indexes` field is a map where the key is the column reference and the value is the index type.

A column reference can be a single column name or a multicolumn key. The column reference must be enclosed in parentheses if it is a multicolumn key.

See [Indexes](../../features/data-acceleration/indexes.md)

```yaml
views:
  - name: my_view
    sql_ref: ./my_view.sql
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

See [Constraints](../../features/data-acceleration/constraints.md)

```yaml
views:
  - name: my_view
    sql_ref: ./my_view.sql
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
- `upsert_dedup` - Same as `upsert`, but also deduplicates the data if there are duplicate rows that trigger a constraint violation within a single update. See [Advanced upsert behavior](../../features/data-acceleration/constraints#advanced-upsert-options).
- `upsert_dedup_by_row_id` - Same as `upsert`, but resolves any violations by arbitrarily choosing the row with the highest row id. See [Advanced upsert behavior](../../features/data-acceleration/constraints#advanced-upsert-options).
- `drop` - Drop the data when the primary key constraint is violated.

See [Constraints](../../features/data-acceleration/constraints.md)

```yaml
views:
  - name: my_view
    sql_ref: ./my_view.sql
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

Optional. Define metadata, semantic details and features (e.g. embeddings, or table indexes) for specific columns in the view.

```yaml
views:
  - name: my_view
    sql_ref: ./my_view.sql
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

Optional. A description of the column's contents and purpose. Used as part of the [Semantic Data Model](../../features/semantic-model/index.md).

## `columns[*].embeddings`

Optional. Create vector embeddings for this column.

## `columns[*].embeddings[*].from`

The embedding model to use, specify the component name.

## `columns[*].embeddings[*].row_id`

Optional. For views without a primary key, used to explicitly specify column(s) that uniquely identify a row.

Specifying a `row_id` enables unique identifier lookups for views from external systems that may not have a primary key.

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

See [`embeddings[*].chunking`](#columns-embeddings-chunking) for details.

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

Optional. Enable or disable full text search support for specific column in the view. Default `false`.

## `columns[*].full_text_search.row_id`

Optional. For views without a primary key, used to explicitly specify column(s) that uniquely identify a row.

Specifying a `row_id` enables unique identifier lookups for views from external systems that may not have a primary key.

## `columns[*].metadata`

Optional. Specific metadata associated to the column.

## `columns[*].metadata.vectors`

Optional. If provided, a vector engine (see [below](#vectors)) should store this column for a particular use, determined by the value, which is one of:

- `non-filterable`: Store the column in the vector engine.
- `filterable`: Store the column in the vector engine, and ensure the engine can filter on the column (if possible in the engine).

Only applicable if `vectors.enabled` is both defined and `true`.

## `metadata` {#metadata}

Optional. Additional key-value metadata for the view. Used as part of the [Semantic Data Model](../../features/semantic-model/index.md).

```yaml
views:
  - name: my_view
    sql_ref: ./my_view.sql
    metadata:
      instructions: The last 128 blocks.
```

## `vectors`

## `vectors.enabled`

Enable or disable vector storage, defaults to `true`.

## `vectors.engine`

The vector engine to use. The following engines are supported:

- [`s3_vectors`](../../components/vectors/s3_vectors.md) - Vectors are created and indexed into [Amazon S3 Vectors](https://aws.amazon.com/s3/features/vectors/).

## `vectors.params`

Optional. Parameters to pass to the vector engine. The parameters are specific to the vector engine used.
