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

While [DuckDB](/docs/components/data-accelerators/duckdb) excels for datasets up to approximately 1TB, Cayenne with Vortex is designed to scale beyond these limits.

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

#### `params`

| Parameter name                 | Description     |
| ------------------------------ | ------ |
| `cayenne_compression_strategy` | Determines the type of compression to use when accelerating datasets. Defaults to [`btrblocks`](https://www.cs.cit.tum.de/fileadmin/w00cfj/dis/papers/btrblocks.pdf). Supports `btrblocks` or [`zstd`](https://github.com/facebook/zstd). |
| `cayenne_unsupported_type_action` | Determines what action to take when a data type that is not supported is encountered. See [`unsupported_type_action` for more information](../../reference/spicepod/datasets.md#unsupported_type_action). |
| `cayenne_footer_cache_mb` | Size of the in-memory Vortex footer cache in megabytes. Larger values improve query performance for repeated scans. Defaults to `128MiB`. |
| `cayenne_segment_cache_mb` | Size of the in-memory Vortex segment cache in megabytes, to cache decompressed data segments for improved query performance in repeated scans. Defaults to `256MiB`. |

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
- **No `on_conflict` Support**: Cayenne does not yet support the [`on_conflict`](/docs/reference/spicepod/datasets#accelerationon_conflict) configuration for handling duplicate keys during data refresh.
- **Data Cleanup Requires `retention_sql`**: Data deletion and cleanup operations require configuring [`retention_sql`](/docs/reference/spicepod/datasets#accelerationretention_sql) to define retention policies. Manual `DELETE` statements can also be executed directly.
- **No Snapshot Support**: Cayenne does not yet support [acceleration snapshots](/docs/features/data-acceleration/snapshots) for bootstrapping from object storage.
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

- Acceleration storage
- Temporary files during query execution
- Metadata and catalog information

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
