---
title: 'Data Accelerators'
sidebar_label: 'Data Accelerators'
description: 'Data acceleration engines for local materialization and query acceleration in Spice'
image: /img/og/data-accelerators.png
sidebar_position: 2
pagination_prev: null
pagination_next: null
---

Data sourced by Data Connectors can be locally materialized and accelerated using a Data Accelerator.

A Data Accelerator queries/fetches data from a connected data source and stores/updates it locally in an embedded acceleration engine, such as Spice Cayenne. To set data refresh behavior, such as refreshing data on an interval, see [Data Refresh](../features/data-acceleration/data-refresh).

Dataset acceleration is enabled by setting the acceleration configuration:

```yaml
datasets:
  - name: accelerated_dataset
    acceleration:
      enabled: true
```

For the complete reference specification, see [datasets](../reference/spicepod/datasets).

## Default Engine

An acceleration that sets no `engine` uses [Spice Cayenne][cayenne]. With no `mode`, the acceleration is in `mode: memory`: Cayenne holds the data in RAM and reloads it from the source on restart. Spice v2.3 and earlier use `arrow` as the default.

Some configurations load on Arrow but not on Cayenne. With no `engine`, each of these fails to load until the acceleration sets `engine: arrow` or the configuration changes:

- [`partition_by`](../features/data-acceleration/partitioning) in `mode: memory`, the default mode. Cayenne partitions only in a file mode, such as `mode: file`.
- A column of a type that Cayenne does not store, such as `Interval` or `Duration`. Set [`unsupported_type_action`](./cayenne/index.md#unsupported-types) to convert or skip it.
- A [Debezium](../data-connectors/debezium.md) source without Kafka message keys, or a [Debezium push ingest](../../features/cdc/debezium-ingest.md) dataset without `primary_key`.
- [`retention_period`](../features/data-acceleration/data-refresh#time-based-retention) on a numeric `time_column`. Cayenne retention needs a `Timestamp`, `Date`, or ISO 8601 string column.
- [`maintained_aggregates`](./cayenne/index.md#maintained-aggregates) with `MIN` or `MAX` and no primary key.

## Supported Data Accelerators

| Name       | Description                     | Status            | Engine Modes     |
| ---------- | ------------------------------- | ----------------- | ---------------- |
| `cayenne`  | [Spice Cayenne][cayenne]        | Stable            | `memory`, `file`, `file_create`, `file_update` |
| `arrow`    | In-Memory Arrow Records         | Deprecated        | `memory`         |
| `postgres` | Attached [PostgreSQL][postgres] (Spice.ai Enterprise) | Deprecated | N/A              |
| `sqlite`   | Embedded [SQLite][sqlite]       | Deprecated        | `memory`, `file`, `file_create`, `file_update` |

Every engine other than `cayenne` is deprecated in v2.4 and will be removed in v2.5. The `turso` and `duckdb` engines are already removed: a dataset or view that sets `acceleration.engine: turso` or `acceleration.engine: duckdb` fails to load. See [Migrating to Spice Cayenne](./cayenne/migration.md).

[cayenne]: ./cayenne/index.md
[postgres]: data-accelerators/postgres
[sqlite]: ./sqlite/index.md

## Choosing an Accelerator

Select the appropriate accelerator based on dataset size, query patterns, and resource constraints:

| Use Case                                            | Recommended Accelerator | Rationale                                               |
| --------------------------------------------------- | ----------------------- | ------------------------------------------------------- |
| Small datasets (under 1 GB), maximum speed          | `arrow`                 | In-memory storage provides lowest latency               |
| Datasets 10 GB and above (up to 1+ TB)              | `cayenne`               | Vortex columnar format scales beyond single-file limits |
| Point lookups on large datasets                     | `cayenne`               | Vortex provides 100x faster random access vs Parquet    |
| Simple queries, low resource usage                  | `sqlite`                | Lightweight, minimal overhead                           |
| External database integration                       | `postgres`              | Use existing PostgreSQL infrastructure                  |

### Moving a dataset from DuckDB to Cayenne

The `duckdb` engine is removed in v2.5, and a dataset that still sets it fails to load. Set `acceleration.engine` to `cayenne` and remove the DuckDB-only parameters, which Cayenne does not read: `duckdb_file`, `duckdb_memory_limit`, `duckdb_preserve_insertion_order`, `on_refresh_sort_columns`, and `on_full_refresh`. To keep the data clustered, replace `on_refresh_sort_columns` with Cayenne [`sort_columns`](data-accelerators/cayenne/performance#sorted-data-and-segment-pruning):

```yaml
datasets:
  - from: s3://my-bucket/orders/
    name: orders
    params:
      file_format: parquet
    acceleration:
      enabled: true
      engine: cayenne # was: duckdb
      mode: file
      refresh_mode: full
      params:
        sort_columns: created_at # was: on_refresh_sort_columns
```

Unlike `on_refresh_sort_columns`, which drops `primary_key`, indexes, and `on_conflict`, `sort_columns` works with a primary key. For CDC datasets with a `primary_key`, the default [`cayenne_deletion_mode: auto`](data-accelerators/cayenne#deletion-strategies) applies deletes by key.

Leave [`cayenne_file_path`](data-accelerators/cayenne#parameters) and [`cayenne_metadata_dir`](data-accelerators/cayenne#metastore-location) unset so every Cayenne dataset shares the default data root and catalog. If a deployment sets `cayenne_file_path`, use the same path on every Cayenne dataset; see [Metastore location](data-accelerators/cayenne#metastore-location) for why. [Migrating to Spice Cayenne](./cayenne/migration.md) covers which DuckDB files and snapshots to delete, and how to check that the source still holds the acceleration's data.

## Data Types

Data Accelerators may not support all possible Apache Arrow data types. For complete compatibility, see [specifications](../reference/datatypes/accelerators).

:::warning[Memory Considerations]

When accelerating a dataset using `mode: memory` (the default), some or all of the dataset is loaded into memory. Ensure sufficient memory is available, including overhead for queries and the runtime, especially with concurrent queries.

In-memory limitations can be mitigated by storing acceleration data on disk, which is supported by the [`cayenne`](data-accelerators/cayenne) and [`sqlite`](data-accelerators/sqlite) accelerators by specifying `mode: file`.

:::

## Schema Handling

Data accelerators store the schema that Spice infers from the data source at startup. This schema is fixed for the lifetime of the runtime process and defines the column names, data types, and nullability of the accelerated table.

If the source schema changes while the runtime is running (for example, new columns are added or data types change), subsequent data refreshes into the accelerator will fail because the incoming data no longer matches the schema of the accelerated table. Restart the runtime to re-infer the schema and re-initialize the accelerated table.

For details on how schema inference works per connector and recommendations for managing schema drift, see [Schema Inference](data-connectors#schema-inference).

## Data Accelerator Docs

import DocCardList from '@theme/DocCardList';

<DocCardList />

## Related Documentation

- [Performance Tuning](../reference/performance-tuning) - Comprehensive optimization guide
- [Managing Memory Usage](../reference/memory) - Memory configuration reference
- [Data Refresh](../features/data-acceleration/data-refresh) - Refresh mode configuration
- [Indexes](../features/data-acceleration/indexes) - Index configuration for Spice Cayenne, SQLite, and PostgreSQL
