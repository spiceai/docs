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
- `duckdb_data_dir` (string, default:`.spice/data/`): Path to the directory the DuckDB database file(s) will be placed in. This is useful when using the `partition_by` acceleration parameter. If both `duckdb_data_dir` and `duckdb_file` are specified, `duckdb_file` will be used and `duckdb_data_dir` will be ignored.
- `duckdb_memory_limit` (string, default: none): Limits DuckDB's memory usage for instance. Acceptable units are KB, MB, GB, TB (decimal: 1000^i) or KiB, MiB, GiB, TiB (binary: 1024^i). See [DuckDB memory limit documentation](https://duckdb.org/docs/stable/configuration/overview).
- `duckdb_preserve_insertion_order` (boolean, default: `true`): Controls whether DuckDB preserves the insertion order of rows in tables. When set to `true`, rows are returned in the order they were inserted. See [DuckDB preserve insertion order documentation](https://duckdb.org/docs/stable/guides/performance/how_to_tune_workloads#the-preserve_insertion_order-option) and [order preservation documentation](https://duckdb.org/docs/stable/sql/dialect/order_preservation).
- `connection_pool_size` (integer, default: `10`): Controls the maximum number of connections to keep open in the connection pool for concurrent query execution.
- `on_refresh_recompute_statistics` (string, default: `enabled`): Triggers automatic `ANALYZE` execution after data refreshes. This keeps DuckDB optimizer statistics up-to-date for efficient query plans and performance. Set to `disabled` to turn automatic statistics recomputation off. See [DuckDB ANALYZE statement documentation](https://duckdb.org/docs/stable/sql/statements/analyze).
- `partition_mode` (string, default: `files`): Controls how partitioned data is stored. Can only be used with `partition_by`. Set to `tables` to store partitions as separate tables within a single DuckDB database, improving resource usage through single shared connection pool for all partitions. Default `files` mode creates separate database files per partition with individual connection pools and generally faster query performance.
- `duckdb_partitioned_write_flush_threshold` (integer, default: `122880`): The number of rows buffered per partition before flushing data to acceleration storage. Only applicable when using `partition_mode: tables`. Using a larger value can improve write performance but requires more memory.
- `optimizer_duckdb_aggregate_pushdown` (string, default: `disabled`): Enables aggregate pushdown optimization to execute supported aggregate queries directly in DuckDB. Set to `enabled` to push down aggregations for improved query performance on supported functions like `count`, `sum`, `avg`, `min`, and `max`. Requires `query_federation` to be `disabled`.

Refer to the [datasets configuration reference](/docs/reference/spicepod/datasets.md#acceleration) for additional supported fields.

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
- Queries using `on_zero_results: use_source` cannot filter binary columns directly (e.g., `WHERE col_blob <> ''`). Instead, cast binary columns to another type (e.g., `WHERE CAST(col_blob AS TEXT) <> ''`).
- DuckDB indexes currently do not support spilling to disk.
- Hot-reloading dataset configurations while the Spice Runtime is active disables DuckDB query federation until the runtime restarts.

## Resource Considerations

Resource requirements depend on workload, dataset size, query complexity, and refresh modes.

### Memory

DuckDB manages memory through streaming execution, intermediate spilling, and buffer management. By default, each DuckDB instance (one per DuckDB file) uses up to 80% of available system memory. To control memory usage, set the `duckdb_memory_limit` parameter:

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

Note that `duckdb_memory_limit` only limits the DuckDB instance it is set on, not the entire runtime process. Additionally, it does not cover all DuckDB operations, such as some insert operations. Index creation and scans are limited by the `duck_memory_limit` so ensure adequate memory is provisioned.

Allocate at least 30% more container/machine memory for the runtime process.

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

Set the `runtime.query.temp_directory` parameter to specify a custom temporary directory. This can help distribute I/O operations across multiple volumes for improved throughput. For example, setting `runtime.temp_directory` to a high-IOPS volume separate from the DuckDB data file can improve performance for workloads exceeding available memory.

Example configuration:

```yaml
runtime:
  query:
    temp_directory: /tmp/spice
```

Use this parameter when:

- Handling workloads that frequently spill to disk.
- Distributing swap and data I/O operations across multiple storage volumes.

For more details, refer to the [runtime parameters documentation](/docs/reference/spicepod/runtime.md#runtimequerytemp_directory).

For detailed DuckDB limits, see the [DuckDB Memory Management Guide](https://duckdb.org/docs/operations_manual/limits.html).

## Cookbook

For practical examples, see the [DuckDB Data Accelerator Cookbook Recipe](https://github.com/spiceai/cookbook/tree/trunk/duckdb/accelerator#readme).
