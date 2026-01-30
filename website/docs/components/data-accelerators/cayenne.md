---
title: 'Cayenne Data Accelerator'
sidebar_label: 'Cayenne Data Accelerator'
description: 'Cayenne Data Accelerator (Vortex) Documentation'
sidebar_position: 1
tags:
  - cayenne
  - vortex
  - data-accelerators
  - performance
---

:::info Alpha
The Cayenne Data Accelerator is in Alpha. Features and configuration may change. Available in Spice v1.9.0-rc.1 and later.
:::

Cayenne is a Spice data acceleration engine designed for high-performance, scalable query on large-scale datasets. Built on [Vortex](https://github.com/vortex-data/vortex), a next-generation columnar file format, Cayenne combines columnar storage with in-process metadata management to provide fast query performance to scale to datasets beyond 1TB.

## Why Vortex?

Cayenne uses Vortex as its storage format, providing significant performance advantages:

- **100x faster random access reads** compared to modern Apache Parquet
- **10-20x faster scans** for analytical queries
- **5x faster writes** with similar compression ratios
- **Zero-copy compatibility** with Apache Arrow for efficient data processing
- **Extensible architecture** with pluggable encoding, compression, and layout strategies

Vortex is a Linux Foundation (LF AI & Data) project under Apache-2.0 license with neutral governance.

While [DuckDB](./duckdb) excels for datasets up to approximately 1TB, Spice Cayenne with Vortex is designed to scale beyond these limits.

For detailed Vortex performance benchmarks, visit [bench.vortex.dev](https://bench.vortex.dev).

## Configuration

To use Cayenne as the data accelerator, specify `cayenne` as the `engine` for acceleration. Cayenne only supports `mode: file` and stores data on disk.

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: cayenne
      mode: file
```

## Features

### High-Performance Columnar Storage

Cayenne uses Vortex's advanced columnar format, which provides:

- **Efficient Compression**: Cascading compression with nested encoding schemes including RLE, dictionary encoding, FastLanes, FSST, and ALP
- **Rich Statistics**: Lazy-loaded summary statistics for query optimization
- **Extensible Encodings**: Pluggable physical layouts optimized for different data patterns
- **Wide Table Support**: Efficient handling of tables with many columns through zero-copy metadata access

## Limitations

Consider the following limitations when using Cayenne acceleration:

- **Alpha Status**: Cayenne is in active development. Configuration options may change between releases.
- **File Mode Only**: Cayenne only supports `mode: file` and does not support in-memory (`mode: memory`) acceleration.
- **No `on_conflict` Support**: Cayenne does not yet support the [`on_conflict`](../../reference/spicepod/datasets#accelerationon_conflict) configuration for handling duplicate keys during data refresh.
- **Data Cleanup Requires `retention_sql`**: Data deletion and cleanup operations require configuring [`retention_sql`](../../reference/spicepod/datasets#accelerationretention_sql) to define retention policies. Manual `DELETE` statements can also be executed directly.
- **No Snapshot Support**: Cayenne does not yet support [acceleration snapshots](../../features/data-acceleration/snapshots) for bootstrapping from object storage.
- **Data Types**: Some advanced data types may have limited support. Test your specific schema requirements.
- **Index Support**: Index capabilities are still being developed. Check release notes for the latest supported features.

:::warning[Alpha Software]

As an Alpha feature, Cayenne should be thoroughly tested in development environments before production deployment. Monitor release notes for updates, breaking changes, and new capabilities.

:::

## Resource Considerations

Resource requirements for Cayenne depend on dataset size, query patterns, and metastore configuration.

### Memory

Cayenne manages memory efficiently through columnar storage and selective caching. Allocate sufficient memory based on:

- Dataset size and schema complexity
- Query concurrency requirements
- Caching configuration

### Storage

Cayenne stores data in a columnar format optimized for analytical queries. Ensure adequate disk space for:

- **Acceleration data**: Compressed Vortex files (typically 30-50% of raw data size with btrblocks)
- **Metadata**: SQLite database for catalog and statistics (~10 MB per 1000 files)
- **Temporary files**: Query spill files during complex operations

### CPU

Query performance scales with available CPU cores. Vortex's columnar format supports parallel decompression and scanning across multiple threads. Allocate sufficient CPU for:

- Query execution parallelism
- Data refresh and compression operations
- Concurrent query workloads

## Limitations

Consider the following limitations when using Spice Cayenne acceleration:

- **Alpha Status**: Spice Cayenne is in active development. Configuration options may change between releases.
- **File Mode Only**: Spice Cayenne only supports `mode: file` and does not support in-memory (`mode: memory`) acceleration.
- **No Snapshot Support**: Spice Cayenne does not yet support [acceleration snapshots](../../features/data-acceleration/snapshots) for bootstrapping from object storage.
- **S3 Express Only**: Standard S3 buckets are not supported for remote storage. Only S3 Express One Zone directory buckets are supported.
- **Unsupported Data Types**: `Interval`, `Duration`, `Map`, and `FixedSizeBinary` types require `unsupported_type_action` configuration.
- **No Traditional Indexes**: Spice Cayenne does not support explicit index creation via the `indexes` configuration. Vortex's segment statistics and fast random access encodings provide equivalent or better performance for most point lookup workloads.
- **No MVCC**: Multi-version concurrency control is not yet implemented. Snapshots and time-travel queries are planned for future releases.
- **No File Compaction**: Automatic file compaction to reclaim space from deleted rows is not yet available.

:::warning ALPHA SOFTWARE
As an Alpha feature, Spice Cayenne should be thoroughly tested in development environments before production deployment. Monitor release notes for updates, breaking changes, and new capabilities.
:::

## Example Spicepod

Complete example configuration using Cayenne:

```yaml
version: v1
kind: Spicepod
name: cayenne-example

datasets:
  - from: s3://my-bucket/data/
    name: analytics_data
    params:
      file_format: parquet
    acceleration:
      engine: cayenne
      enabled: true
      refresh_mode: full
      refresh_check_interval: 1h
```

## Related Documentation

**Spice Documentation:**

- [Managing Memory Usage](../../reference/memory) - Memory configuration reference
- [Data Acceleration](../../features/data-acceleration/) - Data acceleration overview

**External References:**

- [Apache DataFusion](https://datafusion.apache.org/) - Query execution engine
- [DataFusion Configuration](https://datafusion.apache.org/user-guide/configs.html) - DataFusion settings and tuning
- [Vortex Project](https://github.com/vortex-data/vortex) - Columnar file format
- [Vortex Benchmarks](https://bench.vortex.dev/) - Performance benchmarks
- [FSST Paper](https://www.vldb.org/pvldb/vol13/p2649-boncz.pdf) - Fast Static Symbol Table compression
- [FastLanes Paper](https://www.vldb.org/pvldb/vol16/p2132-afroozeh.pdf) - High-performance integer encoding
- [ALP Paper](https://ir.cwi.nl/pub/33334/33334.pdf) - Adaptive floating-point compression
- [BtrBlocks Paper](https://www.cs.cit.tum.de/fileadmin/w00cfj/dis/papers/btrblocks.pdf) - Compression algorithm
- [AWS S3 Express One Zone](https://aws.amazon.com/s3/storage-classes/express-one-zone/) - Low-latency object storage
