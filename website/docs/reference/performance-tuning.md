---
title: 'Performance Tuning'
sidebar_label: 'Performance Tuning'
sidebar_position: 32
description: 'Comprehensive guide to optimizing query performance, acceleration, and resource utilization in Spice deployments.'
keywords:
  - performance
  - tuning
  - optimization
  - cayenne
  - duckdb
  - acceleration
pagination_prev: null
pagination_next: null
---

This guide provides recommendations for optimizing Spice performance across data acceleration, query execution, caching, and resource allocation.

## Accelerator Selection

Choose the appropriate [Data Accelerator](../components/data-accelerators) based on dataset characteristics and query patterns.

| Scenario                                 | Recommended Accelerator    | Key Configuration                                                     |
| ---------------------------------------- | -------------------------- | --------------------------------------------------------------------- |
| Small datasets (under 1 GB), low latency | `arrow`                    | Default in-memory                                                     |
| Medium datasets (1-100 GB), complex SQL  | `duckdb` with `mode: file` | Set `duckdb_memory_limit`                                             |
| Large datasets (100 GB - 1+ TB)          | `cayenne`                  | Tune cache parameters                                                 |
| Write-heavy workloads                    | `cayenne` with `zstd`      | Set `cayenne_compression_strategy: zstd`                              |
| Point lookups, large datasets            | `cayenne`                  | Vortex provides [100x faster random access](https://bench.vortex.dev) |
| Point lookups, small-medium datasets     | `arrow` with hash index    | Set `hash_index: enabled` (experimental, v1.11.0-rc.2+)               |
| Point lookups with explicit indexes      | `duckdb` or `sqlite`       | Configure indexes                                                     |

## Spice Cayenne Performance Optimization

[Spice Cayenne](../components/data-accelerators/cayenne) uses the [Vortex](https://github.com/vortex-data/vortex) columnar format for high-performance analytics on large datasets.

### Point Lookups and Random Access

Vortex provides [100x faster random access](https://bench.vortex.dev) compared to Apache Parquet through:

- **Segment statistics**: Per-segment min/max/null_count for predicate pushdown (zone-map equivalent)
- **Fast random access encodings**: [FSST](https://www.vldb.org/pvldb/vol13/p2649-boncz.pdf), [FastLanes](https://www.vldb.org/pvldb/vol16/p2132-afroozeh.pdf), and [ALP](https://ir.cwi.nl/pub/33334/33334.pdf) support O(1) or near-O(1) random access
- **Compute push-down**: Filter execution on compressed data without full decompression
- **Array statistics**: `is_sorted`, `is_constant`, `min`, `max` for query optimization

For point lookups on large datasets, Spice Cayenne often matches or exceeds the performance of traditional B-tree indexes while consuming no additional memory for index structures.

### Cache Configuration

Spice Cayenne maintains two in-memory caches that significantly impact query performance:

```yaml
datasets:
  - from: s3://bucket/data/
    name: analytics
    acceleration:
      engine: cayenne
      mode: file
      params:
        cayenne_footer_cache_mb: 256   # Increase for many files
        cayenne_segment_cache_mb: 512  # Increase for hot data patterns
```

**Footer Cache Sizing:**

The footer cache stores file metadata. Size based on file count:

- 1-10 KB per file
- Default 128 MB supports ~10,000-100,000 files
- Increase for datasets with more files

**Segment Cache Sizing:**

The segment cache stores decompressed data. Size based on working set:

- Estimate the volume of frequently accessed data
- Cache hits avoid decompression overhead
- Monitor cache hit rates via [observability metrics](../features/observability)

### Compression Strategy

| Strategy              | Read Performance | Write Performance | Compression Ratio |
| --------------------- | ---------------- | ----------------- | ----------------- |
| `btrblocks` (default) | Fastest          | Moderate          | Higher            |
| `zstd`                | Moderate         | Faster            | High              |

Choose `btrblocks` for read-heavy analytics workloads. Use `zstd` only when size on disk is the primary concern—setting `zstd` trades query performance for reduced storage size.

## DuckDB Performance Optimization

[DuckDB](../components/data-accelerators/duckdb) provides mature SQL support with sophisticated query optimization.

### Memory Configuration

```yaml
datasets:
  - from: postgres:schema.table
    name: orders
    acceleration:
      engine: duckdb
      mode: file
      params:
        duckdb_memory_limit: 4GB
        duckdb_file: /data/orders.duckdb
```

**Guidelines:**

- Set `duckdb_memory_limit` to control memory per instance
- DuckDB defaults to 80% of system memory per instance
- Reserve 30% of container memory for the runtime
- Multiple datasets using the same `duckdb_file` share a connection pool

### Connection Pool Tuning

```yaml
acceleration:
  engine: duckdb
  params:
    connection_pool_size: 20  # Default: 10
```

Increase `connection_pool_size` for high-concurrency workloads. Each connection consumes memory.

### Index Configuration

DuckDB supports [ART (Adaptive Radix Tree) indexes](https://duckdb.org/docs/stable/guides/performance/indexing) for faster point lookups:

```yaml
datasets:
  - from: postgres:schema.orders
    name: orders
    acceleration:
      engine: duckdb
      mode: file
      indexes:
        order_id: enabled
        '(customer_id, created_at)': enabled
```

Indexes consume memory and [do not spill to disk](https://duckdb.org/docs/stable/guides/performance/indexing#indexes-and-memory). Creating an index requires the entire dataset to be loaded into memory. Monitor memory usage when adding indexes. For more details on ART index performance, see the [ART paper](https://db.in.tum.de/~leis/papers/ART.pdf).

### Zone-Maps and Sorted Data

DuckDB automatically creates [zone-maps](https://duckdb.org/docs/stable/guides/performance/indexing#zonemaps) (min/max statistics) for each row group, enabling efficient predicate pushdown. In practice, zone-maps on sorted data often outperform ART indexes for range and equality queries while consuming no additional memory.

**Why Zone-Maps Outperform Indexes:**

- Zero memory overhead (statistics stored with data)
- No index maintenance during writes
- Automatic predicate pushdown during scans
- Effective when data is sorted by query filter columns

**Optimization Pattern: Sorted Views**

Accelerate a view with `ORDER BY` to create sorted physical data, then set `duckdb_preserve_insertion_order: true` to maintain sort order:

```yaml
datasets:
  - from: iceberg:catalog/namespace/table
    name: raw_data_by_arrival
    time_column: processed_time
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      refresh_mode: append
      primary_key: id
      on_conflict:
        id: upsert
      params:
        duckdb_memory_limit: 12GiB
        duckdb_preserve_insertion_order: false  # Raw data doesn't need order

views:
  - name: data_sorted
    sql: |
      SELECT id, account_id, pool_id, value, created_at
      FROM raw_data_by_arrival
      WHERE __deleted = 'false'
      ORDER BY account_id, pool_id
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      refresh_check_interval: 210s
      params:
        duckdb_file: data_sorted.duckdb
        duckdb_memory_limit: 6GiB
        duckdb_preserve_insertion_order: true  # Maintains ORDER BY sort
```

**Key Configuration:**

| Parameter                         | Value                   | Purpose                                       |
| --------------------------------- | ----------------------- | --------------------------------------------- |
| `duckdb_preserve_insertion_order` | `true` on sorted view   | Maintains physical sort order from `ORDER BY` |
| `duckdb_preserve_insertion_order` | `false` on source table | Faster writes without order guarantees        |
| Separate `duckdb_file`            | Per view                | Isolates sorted data from source tables       |

Queries filtering on `account_id` or `(account_id, pool_id)` benefit from zone-map pruning, skipping entire row groups that don't match the filter predicates.

### Aggregate Pushdown

Enable aggregate pushdown for improved performance on supported aggregate queries:

```yaml
acceleration:
  engine: duckdb
  params:
    optimizer_duckdb_aggregate_pushdown: enabled
```

Requires `query_federation` to be disabled. Supports `count`, `sum`, `avg`, `min`, and `max` functions.

## DataFusion Query Engine

Spice uses [Apache DataFusion](https://datafusion.apache.org/) as its query execution engine for Arrow and Spice Cayenne accelerators. DataFusion provides vectorized, multi-threaded query execution with automatic memory management and spilling.

### Query Parallelism

DataFusion automatically parallelizes queries across available CPU cores. By default, the number of partitions equals the number of CPU cores, providing maximum parallelism.

DataFusion's [GreedyMemoryPool](https://docs.rs/datafusion/latest/datafusion/execution/memory_pool/struct.GreedyMemoryPool.html) allows memory reservations on a first-come, first-served basis up to the configured `memory_limit`. This approach improves throughput for high-concurrency queries with many partitions compared to dividing memory evenly.

### Join Algorithm Selection

DataFusion supports multiple join algorithms and automatically selects the best one based on query statistics:

| Algorithm        | Memory Usage | Best For                                         |
| ---------------- | ------------ | ------------------------------------------------ |
| Hash Join        | Higher       | Fast execution with sufficient memory (default)  |
| Sort-Merge Join  | Lower        | Memory-constrained environments, pre-sorted data |
| Nested Loop Join | Variable     | Cross joins, non-equi joins                      |

DataFusion prefers hash joins by default for equi-joins. Hash joins do not currently support spilling, so memory-constrained environments may benefit from sort-merge joins for large datasets.

### Dynamic Filter Pushdown

DataFusion pushes filters from operators (TopK, Join, Aggregate) into file scans to prune data early. This optimization is enabled by default and can skip entire row groups or files based on statistics. For example, a `SELECT * FROM t ORDER BY timestamp DESC LIMIT 10` query pushes timestamp filters down to file scans, pruning files that cannot contain top-10 candidates.

### Parquet Read Optimizations

Spice uses DataFusion's Parquet reader, which applies several optimizations automatically when reading Parquet files from S3, file, Iceberg, and Delta Lake connectors:

- **Row group pruning**: Skips entire row groups (typically 128 MB) based on min/max statistics in Parquet metadata
- **Page Index filtering**: Uses page-level min/max statistics (typically 8 KB chunks) for finer-grained pruning
- **Bloom filter evaluation**: Checks bloom filters for equality predicates when available in Parquet files
- **Projection pushdown**: Reads only the columns referenced in the query

These optimizations are applied automatically and require no configuration. The effectiveness depends on data layout—sorting data by frequently filtered columns maximizes row group pruning.

## File Format Filtering and Optimization

Spice connects to various file formats (Parquet, Iceberg, Delta Lake) and uses DataFusion's query execution engine to push down predicates and prune data at the file, row group, and page level. Understanding these optimizations helps when designing data layouts for optimal query performance.

### Parquet

Apache Parquet stores data in row groups with per-column statistics. DataFusion uses these statistics to skip row groups that cannot contain matching rows.

**Row Group Pruning:**

Each Parquet row group contains min/max statistics for each column. When a query includes a `WHERE` clause, DataFusion evaluates whether each row group could contain matching rows based on these statistics. Row groups that cannot match are skipped entirely.

For example, with a predicate `WHERE timestamp > '2024-01-01'`, DataFusion skips row groups where the maximum timestamp is before 2024-01-01.

**Page Index:**

Parquet's [Page Index](https://parquet.apache.org/docs/file-format/data-pages/) provides finer-grained statistics at the page level within row groups. DataFusion uses the Page Index to skip individual pages, reducing I/O for selective queries.

**Bloom Filters:**

Parquet files can include bloom filters for membership testing. For equality predicates like `WHERE user_id = 'abc123'`, DataFusion checks the bloom filter before reading column data. If the bloom filter indicates the value is not present, the row group is skipped.

**Late Materialization (Filter Pushdown):**

DataFusion supports applying filters during Parquet decoding rather than after. This optimization, called late materialization, filters rows before materializing all columns, reducing memory usage for selective queries.

### Iceberg

[Apache Iceberg](https://iceberg.apache.org/) provides hidden partitioning and multi-level metadata filtering that simplifies query optimization.

**Hidden Partitioning:**

Iceberg automatically derives partition values from source columns using transforms like `day(timestamp)`, `month(timestamp)`, or `bucket(user_id, 16)`. Queries filter on the source column directly (e.g., `WHERE timestamp > '2024-01-01'`), and Iceberg automatically prunes partitions without requiring users to specify partition columns in predicates.

**Two-Level Metadata Filtering:**

Iceberg uses a hierarchical metadata structure that enables filtering at multiple levels:

1. **Manifest list filtering**: The manifest list contains partition value ranges for each manifest file. Manifests that cannot contain matching rows are skipped entirely.
2. **Manifest filtering**: Each manifest file contains per-file column statistics (min/max, null counts, value counts). Data files that cannot contain matching rows are skipped.

This two-level approach can eliminate entire groups of files before reading any data, providing significant performance benefits for large tables.

**Column-Level Statistics:**

Iceberg manifests store column-level statistics including:

- `lower_bound` and `upper_bound` for min/max filtering
- `null_count` for null handling optimization
- `value_count` for cardinality estimation

**Partition Evolution:**

Iceberg supports changing partition schemes without rewriting existing data. Historical data retains its original partitioning while new data uses the updated scheme. Queries automatically account for both partition layouts.

### Delta Lake

[Delta Lake](https://delta.io/) provides data skipping and Z-ordering for query optimization.

**Data Skipping:**

Delta Lake collects column statistics (min, max, null counts) during writes. The `delta.dataSkippingNumIndexedCols` table property controls how many columns have statistics collected (counted from the first column in the schema). Queries filter using these statistics to skip files that cannot contain matching rows.

**Generated Columns:**

Delta Lake supports generated columns that derive values from other columns. When partitioned by a generated column (e.g., `eventDate` generated from `CAST(eventTime AS DATE)`), queries filtering on the source column automatically benefit from partition pruning.

**Z-Ordering:**

[Z-ordering](https://docs.delta.io/latest/optimizations-oss.html#z-ordering-multi-dimensional-clustering) colocates related data in the same files by clustering on specified columns. After running `OPTIMIZE ... ZORDER BY (column)`, queries filtering on the Z-ordered columns benefit from improved data skipping.

**Compaction:**

Delta Lake's `OPTIMIZE` command compacts small files into larger ones, reducing the number of files to scan and improving query performance through better I/O patterns.

### Vortex (Spice Cayenne)

Spice Cayenne uses [Vortex](https://github.com/vortex-data/vortex), which provides segment-level statistics and compute push-down on compressed data.

**Segment Statistics:**

Vortex's ChunkedLayout maintains per-segment statistics including `min`, `max`, `null_count`, `is_sorted`, and `is_constant` for each column. These statistics function similarly to DuckDB's zone-maps, enabling segment pruning during query execution.

**Compute Push-Down:**

Vortex supports executing filter operations directly on compressed data. For encodings like FSST (strings), FastLanes (integers), and ALP (floats), predicates can be evaluated without full decompression, reducing CPU and memory usage.

**Encoding-Aware Optimization:**

Vortex tracks encoding metadata that enables additional optimizations:

- `is_sorted`: Enables binary search for point lookups
- `is_constant`: Returns values immediately without scanning
- Encoding-specific optimizations based on data characteristics

See [Spice Cayenne Performance Optimization](#spice-cayenne-performance-optimization) for cache tuning and other Cayenne-specific settings.

### Performance Implications

| Optimization               | Parquet | Iceberg         | Delta Lake      | Vortex            |
| -------------------------- | ------- | --------------- | --------------- | ----------------- |
| Row group/file pruning     | ✅       | ✅               | ✅               | ✅                 |
| Page-level filtering       | ✅       | ✅ (via Parquet) | ✅ (via Parquet) | ✅ (segment-level) |
| Bloom filters              | ✅       | ✅ (via Parquet) | ❌               | ❌                 |
| Hidden partitioning        | ❌       | ✅               | ❌               | ❌                 |
| Manifest-level filtering   | ❌       | ✅               | ❌               | ❌                 |
| Compute on compressed data | ❌       | ❌               | ❌               | ✅                 |
| Z-ordering                 | ❌       | ✅               | ✅               | ❌                 |

**Optimization Recommendations:**

- **Sort data by filter columns**: Row group and segment statistics are most effective when data is sorted by commonly filtered columns
- **Use appropriate file sizes**: Larger row groups (128 MB+) provide better compression but reduce pruning granularity
- **Collect statistics on filter columns**: Ensure filter columns are within the statistics collection limit (e.g., `delta.dataSkippingNumIndexedCols`)
- **Consider Z-ordering for multi-column filters**: When queries filter on multiple columns, Z-ordering colocates related data

## Query Memory Management

Configure DataFusion query memory limits to prevent out-of-memory errors:

```yaml
runtime:
  query:
    memory_limit: 8GiB
    temp_directory: /tmp/spice
    spill_compression: zstd
```

### Memory Limit

If not specified, `memory_limit` defaults to 90% of total system memory (container-aware). For deployments with co-located accelerators, set an explicit limit based on available memory:

```text
runtime memory_limit = Total Memory - Accelerator Memory - OS/Runtime Overhead (30%)
```

### Spill Compression

| Compression      | Disk Usage | CPU Overhead |
| ---------------- | ---------- | ------------ |
| `zstd` (default) | Lowest     | Moderate     |
| `lz4_frame`      | Medium     | Lowest       |
| `uncompressed`   | Highest    | None         |

Choose `lz4_frame` when CPU is limited and disk is abundant. Choose `uncompressed` for debugging or when spill files are rare. DataFusion uses [Arrow IPC Stream format](https://arrow.apache.org/docs/format/Columnar.html#ipc-streaming-format) for spill files.

### Batch Processing

DataFusion processes data in batches of 8192 rows by default. This batch size balances memory usage with vectorized execution efficiency. Larger batches improve CPU cache utilization and SIMD operations but consume more memory per partition.

### Temporary Directory

Place spill files on fast storage (SSD/NVMe) separate from data files:

```yaml
runtime:
  query:
    temp_directory: /fast-ssd/spice-temp
```

The `max_temp_directory_size` setting limits the total size of temporary files (default: 100 GB).

## Caching Configuration

Spice supports multiple caching layers for query acceleration.

### SQL Results Cache

Cache query results for repeated queries:

```yaml
runtime:
  caching:
    sql_results:
      enabled: true
      max_size: 512MiB
      item_ttl: 5m
      eviction_policy: tiny_lfu  # Higher hit rate than lru
      cache_key_type: plan       # Matches semantically equivalent queries
```

**Cache Key Types:**

| Type             | Behavior                | Use Case                   |
| ---------------- | ----------------------- | -------------------------- |
| `plan` (default) | Uses query logical plan | Varied query formatting    |
| `sql`            | Uses exact SQL string   | Identical repeated queries |

Use `sql` for lowest latency with identical queries. Use `plan` for semantic query matching.

### Stale-While-Revalidate

Serve stale cached results while refreshing in the background:

```yaml
runtime:
  caching:
    sql_results:
      enabled: true
      item_ttl: 1m
      stale_while_revalidate_ttl: 5m  # Serve stale for 5m while refreshing
```

This pattern reduces query latency spikes during cache refresh.

## Data Refresh Optimization

### Refresh Mode Selection

| Mode      | Memory Impact | Use Case                                |
| --------- | ------------- | --------------------------------------- |
| `full`    | 2.5x dataset  | Small-medium datasets, complete updates |
| `append`  | Minimal       | Time-series, logs, immutable data       |
| `changes` | Minimal       | CDC-enabled sources                     |
| `caching` | Minimal       | Dynamic content, API data               |

### Append Mode Optimization

Use `time_column` for efficient incremental updates:

```yaml
datasets:
  - from: s3://bucket/events/
    name: events
    time_column: event_time
    acceleration:
      engine: cayenne
      mode: file
      refresh_mode: append
      refresh_check_interval: 5m
```

### Partitioned Data

For data that has a granular time column and a separate column for partitioning (i.e. day buckets), set `time_partition_column` to the partitioning column based on time:

```yaml
datasets:
  - from: s3://bucket/events/
    name: events
    time_column: event_time
    time_partition_column: event_date  # Physical partition column
    acceleration:
      refresh_mode: append
```

In this scenario, `event_date` is the day bucket used for physical partitioning (e.g., s3://bucket/events/event_date=2025-10-01/), while event_time provides the granular timestamp for precise filtering.

| event_id | event_time (time_column) | event_date (time_partition_column) | event_type | user_id |
| -------- | ------------------------ | ---------------------------------- | ---------- | ------- |
| 8f2a-1   | 2025-10-01 08:14:22.123  | 2025-10-01                         | page_view  | u_442   |
| 8f2a-2   | 2025-10-01 22:01:05.884  | 2025-10-01                         | click      | u_901   |
| 9c11-a   | 2025-10-02 01:12:44.001  | 2025-10-02                         | purchase   | u_442   |
| 9c11-b   | 2025-10-02 14:30:12.550  | 2025-10-02                         | page_view  | u_118   |

### Last-Modified Optimization

For object storage with append-only files, use `last_modified` to skip unchanged files:

```yaml
datasets:
  - from: s3://bucket/logs/
    name: logs
    time_column: last_modified  # Special value using file metadata
    acceleration:
      refresh_mode: append
```

## Resource Allocation

### Kubernetes

Configure resource requests and limits based on workload:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: spice
spec:
  containers:
    - name: spice
      image: spiceai/spiceai:latest
      resources:
        requests:
          memory: '8Gi'
          cpu: '4'
        limits:
          memory: '12Gi'
          # Do not set CPU limits - can cause throttling
      volumeMounts:
        - name: data
          mountPath: /data
        - name: temp
          mountPath: /tmp/spice
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: spice-data
    - name: temp
      emptyDir:
        medium: Memory  # Use RAM for temp files if available
```

:::tip[CPU Limits]

Avoid setting CPU limits. CPU limits can cause [throttling](https://home.robusta.dev/blog/stop-using-cpu-limits) even when CPU is available, degrading query performance. Set CPU requests to guarantee scheduling.

:::

### Storage Recommendations

| Storage Type | Use Case                                       |
| ------------ | ---------------------------------------------- |
| SSD/NVMe     | Acceleration data files, query spill files     |
| HDD          | Cold data archival, infrequent access          |
| RAM (tmpfs)  | Temporary files for high-performance workloads |

## Monitoring and Profiling

### Task History

Enable query plan capture for slow query analysis:

```yaml
runtime:
  task_history:
    enabled: true
    captured_plan: explain analyze
    min_sql_duration: 1s  # Only capture plans for queries >1s
```

### Metrics

Monitor key performance metrics:

- `query_duration_ms` - Query execution time
- `query_executions` - Query throughput
- `dataset_load_state` - Acceleration status
- Cache hit rates

See [Observability](../features/observability) for metric configuration.

## Performance Checklist

Use this checklist when optimizing Spice deployments:

- [ ] Select appropriate accelerator based on dataset size and query patterns
- [ ] Configure memory limits for DuckDB and/or Spice Cayenne caches
- [ ] Set `runtime.query.memory_limit` with spill directory on fast storage
- [ ] Enable caching for repeated queries
- [ ] Use `refresh_mode: append` for time-series data
- [ ] Configure indexes for point lookup queries (DuckDB/SQLite)
- [ ] Set resource limits in Kubernetes
- [ ] Enable observability for monitoring

## Related Documentation

**Spice Documentation:**

- [Managing Memory Usage](./memory) - Memory configuration reference
- [Data Accelerators](../components/data-accelerators) - Accelerator documentation
- [Spice Cayenne Data Accelerator](../components/data-accelerators/cayenne) - Spice Cayenne-specific tuning
- [DuckDB Data Accelerator](../components/data-accelerators/duckdb) - DuckDB-specific tuning
- [Caching](../features/caching) - Cache configuration
- [Observability](../features/observability) - Metrics and monitoring

**External References:**

- [Apache DataFusion](https://datafusion.apache.org/) - Query execution engine for Arrow and Spice Cayenne
- [DataFusion Configuration](https://datafusion.apache.org/user-guide/configs.html) - DataFusion configuration settings
- [DataFusion Tuning Guide](https://datafusion.apache.org/user-guide/configs.html#tuning-guide) - Performance tuning for DataFusion
- [DuckDB Indexing](https://duckdb.org/docs/stable/guides/performance/indexing) - Zone-maps and ART index documentation
- [Vortex](https://github.com/vortex-data/vortex) - Columnar format used by Spice Cayenne
- [Vortex Benchmarks](https://bench.vortex.dev) - Performance benchmarks for Vortex
- [Apache Parquet File Format](https://parquet.apache.org/docs/file-format/) - Row groups, statistics, and Page Index
- [Iceberg Partitioning](https://iceberg.apache.org/docs/latest/partitioning/) - Hidden partitioning and partition evolution
- [Iceberg Performance](https://iceberg.apache.org/docs/latest/performance/) - Metadata filtering and column statistics
- [Delta Lake Optimizations](https://docs.delta.io/latest/optimizations-oss.html) - Data skipping, Z-ordering, and compaction
