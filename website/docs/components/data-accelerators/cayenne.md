---
title: 'Spice Cayenne Data Accelerator'
sidebar_label: 'Spice Cayenne Data Accelerator'
description: 'Spice Cayenne Data Accelerator (Vortex) Documentation'
sidebar_position: 1
tags:
  - cayenne
  - vortex
  - data-accelerators
  - performance
---

:::info Alpha
The Spice Cayenne Data Accelerator is in Alpha. Features and configuration may change. Available in Spice v1.9.0-rc.1 and later.
:::

Spice Cayenne is a data acceleration engine designed for high-performance, scalable query on large-scale datasets. Built on [Vortex](https://github.com/vortex-data/vortex), a next-generation columnar file format, Spice Cayenne combines columnar storage with in-process metadata management to provide fast query performance to scale to datasets beyond 1TB.

## Why Vortex?

Spice Cayenne uses Vortex as its storage format, providing significant performance advantages:

- **100x faster random access reads** compared to modern Apache Parquet
- **10-20x faster scans** for analytical queries
- **5x faster writes** with similar compression ratios
- **Zero-copy compatibility** with Apache Arrow for efficient data processing
- **Extensible architecture** with pluggable encoding, compression, and layout strategies

Vortex is a Linux Foundation (LF AI & Data) project under Apache-2.0 license with neutral governance. For performance benchmarks, see [bench.vortex.dev](https://bench.vortex.dev).

While [DuckDB](/docs/components/data-accelerators/duckdb) excels for datasets up to approximately 1TB, Spice Cayenne with Vortex is designed to scale beyond these limits.

## Configuration

To use Spice Cayenne as the data accelerator, specify `cayenne` as the `engine` for acceleration. Spice Cayenne only supports `mode: file` and stores data on disk.

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: cayenne
      mode: file
```

### `params`

| Parameter name                    | Description                                                                                                                                                                                                     |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cayenne_compression_strategy`    | Compression algorithm for accelerated data. Defaults to [`btrblocks`](https://www.cs.cit.tum.de/fileadmin/w00cfj/dis/papers/btrblocks.pdf). Supports `btrblocks` or [`zstd`](https://github.com/facebook/zstd). |
| `cayenne_unsupported_type_action` | Action when an unsupported data type is encountered. See [`unsupported_type_action`](../../reference/spicepod/datasets.md#unsupported_type_action).                                                             |
| `cayenne_footer_cache_mb`         | Size of the in-memory Vortex footer cache in megabytes. Larger values improve query performance for repeated scans. Defaults to `128`.                                                                          |
| `cayenne_segment_cache_mb`        | Size of the in-memory Vortex segment cache in megabytes, caching decompressed data segments for improved query performance. Defaults to `256`.                                                                  |

## Performance Tuning

Spice Cayenne performance can be optimized through cache configuration, compression strategy selection, and resource allocation.

### Cache Tuning

Spice Cayenne uses two in-memory caches to accelerate query performance:

**Footer Cache (`cayenne_footer_cache_mb`):**

The footer cache stores Vortex file metadata, including schemas, statistics, and encoding information. Larger cache sizes benefit workloads with many files.

- Default: 128 MB
- Increase for datasets with many small files
- Each file requires approximately 1-10 KB of footer cache

**Segment Cache (`cayenne_segment_cache_mb`):**

The segment cache stores decompressed data segments. Larger cache sizes benefit workloads with repeated queries on the same data.

- Default: 256 MB
- Increase for workloads with hot data patterns
- Size based on frequently accessed data volume

**Example - High-throughput configuration:**

```yaml
datasets:
  - from: s3://analytics-bucket/events/
    name: events
    acceleration:
      engine: cayenne
      mode: file
      params:
        cayenne_footer_cache_mb: 512
        cayenne_segment_cache_mb: 1024
```

### Compression Strategy

Spice Cayenne supports two compression strategies, each with different performance characteristics. The [BtrBlocks](https://www.cs.cit.tum.de/fileadmin/w00cfj/dis/papers/btrblocks.pdf) compression algorithm is designed for fast analytical queries, while [zstd](https://facebook.github.io/zstd/) provides fast write performance:

| Strategy    | Compression Ratio | Scan Speed | Write Speed | Best For                          |
| ----------- | ----------------- | ---------- | ----------- | --------------------------------- |
| `btrblocks` | Higher            | Faster     | Moderate    | Read-heavy analytics (default)    |
| `zstd`      | High              | Moderate   | Faster      | Write-heavy or balanced workloads |

**Example - Write-optimized configuration:**

```yaml
datasets:
  - from: kafka:events
    name: realtime_events
    acceleration:
      engine: cayenne
      mode: file
      refresh_mode: append
      params:
        cayenne_compression_strategy: zstd
```

## Features

### DataFusion Query-Native Execution

Spice Cayenne is DataFusion query-native, meaning all query execution uses [Apache DataFusion](https://datafusion.apache.org/) and adheres to the `runtime.query.memory_limit` setting. This provides:

- **Vectorized execution**: Multi-threaded, SIMD-optimized query processing
- **Automatic memory management**: Query memory is tracked and spilled to disk when limits are exceeded
- **Dynamic filter pushdown**: Filters from TopK, Join, and Aggregate operators push down to file scans

DataFusion's [FairSpillPool](https://docs.rs/datafusion/latest/datafusion/execution/memory_pool/struct.FairSpillPool.html) divides memory evenly among partitions, providing predictable memory usage under concurrent query load.

### High-Performance Columnar Storage

Spice Cayenne uses Vortex's advanced columnar format, which provides:

- **Efficient Compression**: Cascading compression with nested encoding schemes including RLE, dictionary encoding, FastLanes, FSST, and ALP
- **Rich Statistics**: Lazy-loaded summary statistics for query optimization
- **Extensible Encodings**: Pluggable physical layouts optimized for different data patterns
- **Wide Table Support**: Efficient handling of tables with many columns through zero-copy metadata access

### Point Lookups and Random Access

Vortex delivers [100x faster random access reads](https://bench.vortex.dev) compared to Apache Parquet through several architectural features:

**Segment Statistics (Zone-Map Equivalent):**

Vortex's [ChunkedLayout](https://github.com/vortex-data/vortex) maintains per-segment statistics for each column, enabling segment pruning during query execution. Statistics include:

| Statistic     | Description                      | Query Optimization               |
| ------------- | -------------------------------- | -------------------------------- |
| `min`         | Minimum value in segment         | Range predicate pruning          |
| `max`         | Maximum value in segment         | Range predicate pruning          |
| `null_count`  | Count of null values             | IS NULL/IS NOT NULL optimization |
| `is_sorted`   | Whether segment is sorted        | Binary search for point lookups  |
| `is_constant` | Whether all values are identical | Immediate value return           |

When a query includes a `WHERE` clause, Spice Cayenne evaluates whether each segment could contain matching rows. Segments that cannot match based on min/max statistics are skipped entirely, similar to DuckDB's [zone-maps](https://duckdb.org/docs/stable/guides/performance/indexing#zonemaps) without requiring explicit index creation.

**Example - Segment Pruning:**

For a table with segments containing timestamp ranges `[2024-01-01, 2024-01-15]`, `[2024-01-16, 2024-01-31]`, `[2024-02-01, 2024-02-15]`, a query:

```sql
SELECT * FROM events WHERE timestamp > '2024-01-20'
```

Prunes the first segment (max < 2024-01-20) and reads only the second and third segments.

**Fast Random Access Encodings:**

Vortex encodings support direct random access to compressed data:

- [FSST](https://www.vldb.org/pvldb/vol13/p2649-boncz.pdf) (Fast Static Symbol Table): String compression with O(1) random access
- [FastLanes](https://www.vldb.org/pvldb/vol16/p2132-afroozeh.pdf): High-performance integer encoding with vectorized decoding
- [ALP](https://ir.cwi.nl/pub/33334/33334.pdf): Adaptive lossless floating-point compression with random access

**Compute Push-Down:**

Vortex supports executing filter and compute operations directly on compressed data, avoiding full decompression for predicate evaluation. This compute push-down reduces CPU and memory overhead by processing data in its compressed form:

| Encoding                                                         | Data Type | Push-Down Capability                              |
| ---------------------------------------------------------------- | --------- | ------------------------------------------------- |
| [FSST](https://www.vldb.org/pvldb/vol13/p2649-boncz.pdf)         | Strings   | Equality, prefix matching on compressed symbols   |
| [FastLanes](https://www.vldb.org/pvldb/vol16/p2132-afroozeh.pdf) | Integers  | SIMD-accelerated comparison on bit-packed data    |
| [ALP](https://ir.cwi.nl/pub/33334/33334.pdf)                     | Floats    | Range comparisons with minimal decompression      |
| Dictionary                                                       | Any       | Lookup predicates evaluated on dictionary indices |
| RLE                                                              | Any       | Constant runs evaluated once per run              |

Array-level statistics (`is_sorted`, `is_constant`, `min`, `max`) enable additional optimizations beyond filtering. For example, `is_sorted` enables binary search for point lookups, and `is_constant` returns values immediately without scanning.

**Performance Characteristics:**

For point lookups and selective queries, Spice Cayenne with Vortex often matches or exceeds the performance of traditional B-tree indexes while consuming no additional memory for index structures. Performance scales with:

- Data sorting (sorted columns benefit most from segment pruning)
- Segment cache hit rate (hot data patterns)
- Compression encoding match to data characteristics

## Limitations

Consider the following limitations when using Spice Cayenne acceleration:

- **Alpha Status**: Spice Cayenne is in active development. Configuration options may change between releases.
- **File Mode Only**: Spice Cayenne only supports `mode: file` and does not support in-memory (`mode: memory`) acceleration.
- **No Snapshot Support**: Spice Cayenne does not yet support [acceleration snapshots](/docs/features/data-acceleration/snapshots) for bootstrapping from object storage.
- **Data Types**: Some advanced data types may have limited support. Test your specific schema requirements.
- **No Traditional Indexes**: Spice Cayenne does not support explicit index creation via the `indexes` configuration. However, Vortex's segment statistics and fast random access encodings provide equivalent or better performance for most point lookup workloads. See [Point Lookups and Random Access](#point-lookups-and-random-access).

:::warning[Alpha Software]

As an Alpha feature, Spice Cayenne should be thoroughly tested in development environments before production deployment. Monitor release notes for updates, breaking changes, and new capabilities.

:::

## Resource Considerations

Resource requirements for Spice Cayenne depend on dataset size, query patterns, and cache configuration.

### Memory

Spice Cayenne manages memory efficiently through columnar storage and selective caching. Memory allocation should account for:

| Component        | Default  | Sizing Guidance                                          |
| ---------------- | -------- | -------------------------------------------------------- |
| Runtime overhead | ~500 MB  | Fixed baseline for the Spice runtime                     |
| Footer cache     | 128 MB   | Increase for datasets with many files (1-10 KB per file) |
| Segment cache    | 256 MB   | Increase based on hot data volume                        |
| Query execution  | Variable | Depends on query complexity and concurrency              |

**Example - Memory-constrained environment:**

```yaml
datasets:
  - from: s3://my-bucket/data/
    name: constrained_data
    acceleration:
      engine: cayenne
      mode: file
      params:
        cayenne_footer_cache_mb: 64
        cayenne_segment_cache_mb: 128
```

### Storage

Spice Cayenne stores data in a columnar format optimized for analytical queries. Storage requirements include:

- **Acceleration data**: Compressed Vortex files (typically 30-50% of raw data size with btrblocks)
- **Metadata**: SQLite database for catalog and statistics (~10 MB per 1000 files)
- **Temporary files**: Query spill files during complex operations

### CPU

Query performance scales with available CPU cores. Vortex's columnar format supports parallel decompression and scanning across multiple threads. Allocate sufficient CPU for:

- Query execution parallelism
- Data refresh and compression operations
- Concurrent query workloads

## Example Spicepod

Complete example configuration using Spice Cayenne with performance tuning:

```yaml
version: v1
kind: Spicepod
name: cayenne-example

runtime:
  query:
    memory_limit: 4GiB
    temp_directory: /tmp/spice

datasets:
  - from: s3://my-bucket/data/
    name: analytics_data
    params:
      file_format: parquet
    time_column: created_at
    acceleration:
      engine: cayenne
      enabled: true
      mode: file
      refresh_mode: append
      refresh_check_interval: 1h
      params:
        cayenne_compression_strategy: btrblocks
        cayenne_footer_cache_mb: 256
        cayenne_segment_cache_mb: 512
      retention_sql: DELETE FROM analytics_data WHERE created_at < NOW() - INTERVAL '30 days'
```

## Related Documentation

**Spice Documentation:**

- [Performance Tuning](/docs/reference/performance-tuning.md) - Comprehensive performance optimization guide
- [Managing Memory Usage](/docs/reference/memory.md) - Memory configuration reference
- [Data Acceleration](/docs/features/data-acceleration) - Data acceleration overview

**External References:**

- [Apache DataFusion](https://datafusion.apache.org/) - Query execution engine
- [DataFusion Configuration](https://datafusion.apache.org/user-guide/configs.html) - DataFusion settings and tuning
- [Vortex Project](https://github.com/vortex-data/vortex) - Columnar file format
- [Vortex Benchmarks](https://bench.vortex.dev) - Performance benchmarks
- [FSST Paper](https://www.vldb.org/pvldb/vol13/p2649-boncz.pdf) - Fast Static Symbol Table compression
- [FastLanes Paper](https://www.vldb.org/pvldb/vol16/p2132-afroozeh.pdf) - High-performance integer encoding
- [ALP Paper](https://ir.cwi.nl/pub/33334/33334.pdf) - Adaptive floating-point compression
- [BtrBlocks Paper](https://www.cs.cit.tum.de/fileadmin/w00cfj/dis/papers/btrblocks.pdf) - Compression algorithm
