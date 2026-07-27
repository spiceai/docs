---
title: 'DuckDB Data Accelerator'
sidebar_label: 'DuckDB Data Accelerator'
description: 'DuckDB Data Accelerator Documentation'
sidebar_position: 3
---

The DuckDB Data Accelerator helps improve query performance by using [DuckDB](https://duckdb.org/), an embedded analytical database engine optimized for efficient data processing.

It supports in-memory and file-based operation modes, enabling workloads that exceed available memory and optionally providing persistent storage for datasets.

To enable DuckDB acceleration, set the dataset's `acceleration.engine` to `duckdb`:

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: duckdb
      mode: file
```

## Modes

### Memory Mode

By default, DuckDB acceleration uses `mode: memory`, loading datasets into memory.

### File Mode

When using `mode: file`, datasets are stored by default in a DuckDB file on disk in the `.spice/data` directory relative to the spicepod.yaml. Specify the `duckdb_file` parameter to store the DuckDB file in a different location. For datasets intended to be joined, set the same `duckdb_file` path for all related datasets.

## Configuration Parameters

DuckDB acceleration supports the following optional parameters under `acceleration.params`:

- `duckdb_file` (string, default:`.spice/data/accelerated_duckdb.db`): Path to the DuckDB database file. Applies if `mode` is set to `file`. If the file does not exist, Spice creates it automatically.
- `duckdb_data_dir` (string, default:`.spice/data/`): Path to the directory the DuckDB database file(s) will be placed in. If both `duckdb_data_dir` and `duckdb_file` are specified, `duckdb_file` will be used and `duckdb_data_dir` will be ignored.
- `duckdb_memory_limit` (string, default: none — the runtime computes a [coordinated memory budget](#coordinated-memory-budget) when this is unset): Limits DuckDB's memory usage for instance. Acceptable units are KB, MB, GB, TB (decimal: 1000^i) or KiB, MiB, GiB, TiB (binary: 1024^i). See [DuckDB memory limit documentation](https://duckdb.org/docs/stable/configuration/overview).
- `duckdb_preserve_insertion_order` (boolean, default: `true`): Controls whether DuckDB preserves the insertion order of rows in tables. When set to `true`, rows are returned in the order they were inserted. See [DuckDB preserve insertion order documentation](https://duckdb.org/docs/stable/guides/performance/how_to_tune_workloads#the-preserve_insertion_order-option) and [order preservation documentation](https://duckdb.org/docs/stable/sql/dialect/order_preservation).
- `connection_pool_size` (integer, default: `10` for local SSD / tmpfs / unspecified storage profiles, or `4` for `ebs`; whichever is larger between that floor and the number of datasets sharing the same DuckDB file): Controls the maximum number of connections to keep open in the connection pool for concurrent query execution. See [`acceleration.storage_profile`](../../reference/spicepod/datasets#accelerationstorage_profile) for how the storage profile is selected.
- `on_refresh_recompute_statistics` (string, default: `enabled`, `disabled` when `refresh_mode` is `changes`): Triggers automatic `ANALYZE` execution after data refreshes. This keeps DuckDB optimizer statistics up-to-date for efficient query plans and performance. Set to `disabled` to turn automatic statistics recomputation off. See [DuckDB ANALYZE statement documentation](https://duckdb.org/docs/stable/sql/statements/analyze).
- `duckdb_index_scan_percentage` (float, default: `0.001`): Sets the threshold percentage for performing an index scan instead of a table scan. An index scan is used when the number of matching rows is less than the maximum of `duckdb_index_scan_max_count` and `duckdb_index_scan_percentage` multiplied by total row count. Must be between `0.0` and `1.0`.
- `duckdb_index_scan_max_count` (integer, default: `2048`): Sets the maximum row count threshold for performing an index scan instead of a table scan. An index scan is used when the number of matching rows is less than the maximum of `duckdb_index_scan_max_count` and `duckdb_index_scan_percentage` multiplied by total row count. Must be a non-negative integer.
- `on_refresh_sort_columns` (string, default: none): Sorts data after each refresh by the specified columns, improving DuckDB [zone map](https://duckdb.org/2025/05/14/sorting-for-fast-selective-queries) (min/max) statistics for query pruning and significantly faster lookup queries. Format: `column1 ASC, column2 DESC` or `column1, column2` (defaults to ASC). Specified columns must exist in the dataset schema, and sort direction must be `ASC` or `DESC`.
- `optimizer_duckdb_aggregate_pushdown` (string, default: `disabled`): Enables aggregate pushdown optimization to execute supported aggregate queries directly in DuckDB. Set to `enabled` to push down aggregations for improved query performance on supported functions like `count`, `sum`, `avg`, `min`, and `max`. Requires `query_federation` to be `disabled`.

Refer to the [datasets configuration reference](../../reference/spicepod/datasets#acceleration) for additional supported fields.

### Example Configuration

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: duckdb
      mode: file
      params:
        duckdb_file: /my/chosen/location/duckdb.db
        duckdb_memory_limit: '2GB'
```

## Limitations

Consider the following limitations when using DuckDB acceleration:

- DuckDB does not support [enum and dictionary field types](https://duckdb.org/docs/sql/data_types/overview).
- DuckDB's maximum decimal precision is 38 digits. `Decimal256` (76 digits) is unsupported.
- Timezone-aware timestamp columns (e.g. a PostgreSQL `timestamptz` source) are stored at microsecond precision. DuckDB's `TIMESTAMP WITH TIME ZONE` type has no nanosecond variant, so a nanosecond-precision timezone-aware column is normalized to microsecond when accelerated, and sub-microsecond precision is not preserved. Timezone-naive timestamp columns are unaffected (DuckDB has a native nanosecond `TIMESTAMP_NS` type).
- Queries using `on_zero_results: use_source` cannot filter binary columns directly (e.g., `WHERE col_blob <> ''`). Instead, cast binary columns to another type (e.g., `WHERE CAST(col_blob AS TEXT) <> ''`).
- DuckDB indexes currently do not support spilling to disk.
- Hot-reloading dataset configurations while the Spice Runtime is active disables DuckDB query federation until the runtime restarts.
- `on_refresh_sort_columns` is not currently supported with primary keys or indexes.
- DuckDB acceleration does not support [`partition_by`](../../../features/data-acceleration/partitioning). Configuring it is rejected at load time. Use the `arrow` or `cayenne` engine for partitioned acceleration.

## Resource Considerations

Resource requirements depend on workload, dataset size, query complexity, and refresh modes.

### Memory

DuckDB manages memory through streaming execution, intermediate spilling, and buffer management. Left to itself, each DuckDB instance (one per distinct DuckDB file, plus one shared instance for all `mode: memory` datasets) sizes its own `memory_limit` at roughly 80% of **host** RAM — independently of every other instance and of the Spice query engine. To control memory usage explicitly, set the `duckdb_memory_limit` parameter:

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: duckdb
      mode: file
      params:
        duckdb_file: '/data/shared_duckdb_instance.db'
        duckdb_memory_limit: '4GB'
```

Note that `duckdb_memory_limit` only limits the DuckDB instance it is set on, not the entire runtime process. Additionally, it does not cover all DuckDB operations, such as some insert operations. Index creation and scans are limited by the `duckdb_memory_limit` so ensure adequate memory is provisioned.

Allocate at least 30% more container/machine memory for the runtime process.

#### Coordinated memory budget

Because those per-instance ceilings do not know about each other, a Spicepod with several DuckDB files declares several independent 80%-of-RAM ceilings, stacked on top of the [`runtime.query.memory_limit`](../../reference/spicepod/runtime#runtimequerymemory_limit) pool (90% of RAM by default, 70% when Cayenne acceleration is also active) — an over-commit that risks an OOM kill under load.

At startup, and again on hot-reload, Spice computes a coordinated budget so the **sum** of those ceilings fits within the memory the process can actually use (the cgroup limit in a container). It is always on and has no configuration parameter:

- Each distinct DuckDB instance with **no** `duckdb_memory_limit` is capped at an equal share of what the query pool and any explicit ceilings leave, with a floor of 128 MiB per instance.
- The query pool is reduced by the same amount, taking roughly half of the contested region and never dropping below a quarter of its uncoordinated default (or 256 MiB when every instance has an explicit ceiling).
- An explicit `runtime.query.memory_limit` is honored verbatim, and an explicit `duckdb_memory_limit` remains that instance's ceiling — the coordination only sizes what you have not.
- If the floors above cannot fit the projection, the ceilings are still applied and the residual over-commit is reported.

Coordination is skipped entirely when no DuckDB accelerator is configured, or when the uncoordinated ceilings already fit. Whenever it engages, the runtime logs a warning naming the un-limited instances, the projected uncoordinated ceiling, and the caps it applied — set `duckdb_memory_limit` (and, if needed, `runtime.query.memory_limit`) to replace the automatic split with a deliberate one.

:::note
Because `memory_limit` is a per-instance DuckDB setting, an automatic cap is not applied to an instance where any dataset sharing the same DuckDB file sets `duckdb_memory_limit` explicitly — that would clobber the explicit value.
:::

### Indexes and Memory

DuckDB indexes currently do not support spilling to disk. While index memory usage is registered through the buffer manager, index buffers are not managed by the buffer eviction mechanism. As a result, indexes may consume significant memory, impacting memory-intensive query performance.

Indexes are serialized to disk and loaded lazily upon database reopening, ensuring they do not affect database opening performance. Also consider index serialization when allocating disk storage.

For more details, see DuckDB's [Indexes and Memory documentation](https://duckdb.org/docs/stable/guides/performance/indexing.html#indexes-and-memory).

### CPU

Query performance, data load, and refresh operations scale with available CPU resources. Allocate sufficient CPU cores based on query complexity and concurrency.

### Storage

Ensure adequate disk space for temporary files, swap files, WAL files, and intermediate spilling. Monitor disk usage regularly and adjust storage capacity based on dataset growth and query patterns.

## Temporary Directory

The Spice runtime supports configuring a temporary directory for query and acceleration operations that spill to disk. By default, this is the directory of the `duckdb_file`.

Set the `runtime.query.temp_directory` parameter to specify a custom temporary directory. This can help distribute I/O operations across multiple volumes for improved throughput. For example, setting `runtime.query.temp_directory` to a high-IOPS volume separate from the DuckDB data file can improve performance for workloads exceeding available memory.

Example configuration:

```yaml
runtime:
  query:
    temp_directory: /tmp/spice
```

Use this parameter when:

- Handling workloads that frequently spill to disk.
- Distributing swap and data I/O operations across multiple storage volumes.

For more details, refer to the [runtime parameters documentation](../../reference/spicepod/runtime#runtimequerytemp_directory).

For detailed DuckDB limits, see the [DuckDB Memory Management Guide](https://duckdb.org/docs/operations_manual/limits.html).

## Cookbook

For practical examples, see the [DuckDB Data Accelerator Cookbook Recipe](https://github.com/spiceai/cookbook/tree/trunk/duckdb/accelerator#readme).

## Related Documentation

- [Performance Tuning](../../reference/performance-tuning) - Zone-maps, indexes, and optimization patterns
- [Managing Memory Usage](../../reference/memory) - Memory configuration reference
- [Data Refresh](../../features/data-acceleration/data-refresh) - Refresh mode configuration
