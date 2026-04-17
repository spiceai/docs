---
title: 'S3 Cache'
sidebar_label: 'S3 Cache'
sidebar_position: 4
description: 'Use Spice.ai to cache S3 and object store data locally for fast, repeatable SQL queries without re-reading from remote storage.'
pagination_prev: null
pagination_next: null
---

Spice.ai caches S3 and object store data by accelerating remote datasets into a local engine. Instead of scanning remote Parquet, CSV, or JSON files on every query, Spice materializes the data locally and refreshes it on a configurable schedule. For single-file datasets, Spice tracks the object's metadata (size, last modified, ETag) and skips refresh when the file has not changed, reducing S3 API costs.

This pattern is useful for analytics workloads over object store data — for example, querying a Parquet dataset in S3 repeatedly throughout the day without incurring the latency and cost of a full scan on each query.

```mermaid
graph LR
    App[Application] -->|Query| Acc[Local Accelerator]
    Acc -->|Periodic Refresh| S3[S3 / Object Store]
    S3 -->|Metadata Check| Acc
```

## Why Spice.ai?

- **Local Acceleration**: Materializes S3 data into a fast local engine (Cayenne, DuckDB, SQLite, Arrow) so queries run at local speed instead of scanning remote storage.
- **Smart Refresh Skip**: For single-file S3 datasets, Spice checks the object's metadata before refreshing. If the file has not changed (same size, last modified timestamp, and version/ETag), the refresh is skipped entirely.
- **Multiple File Formats**: Supports Parquet, CSV, JSON, and other formats stored in S3 or S3-compatible systems (MinIO, Cloudflare R2).
- **Folder-Level Datasets**: Point a dataset at an S3 folder to load all files within it as a single table, with periodic refresh to pick up new files.

## Example

### Accelerated S3 Dataset

Cache a Parquet dataset from S3 with periodic refresh:

```yaml
datasets:
  - from: s3://spiceai-demo-datasets/taxi_trips/2024/
    name: taxi_trips
    params:
      file_format: parquet
    acceleration:
      enabled: true
      engine: cayenne
      refresh_check_interval: 10m
```

Queries against `taxi_trips` run against the local accelerator. Every 10 minutes, Spice checks S3 for changes and refreshes the accelerated copy if the data has changed.

### Private Bucket with Authentication

```yaml
datasets:
  - from: s3://my-private-bucket/events/
    name: events
    params:
      file_format: parquet
      s3_auth: key
      s3_key: ${secrets:AWS_ACCESS_KEY_ID}
      s3_secret: ${secrets:AWS_SECRET_ACCESS_KEY}
      s3_region: us-west-2
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      refresh_check_interval: 5m
```

Using `mode: file` persists the accelerated data to disk, so the cache survives Spice restarts without re-reading from S3.

## Query Results Cache

For analytics workloads that run the same queries repeatedly against S3 data — such as dashboards or scheduled reports — the SQL results cache stores query output in memory. Identical queries within the TTL window return instantly without re-executing against the accelerator.

```yaml
datasets:
  - from: s3://spiceai-demo-datasets/taxi_trips/2024/
    name: taxi_trips
    params:
      file_format: parquet
    acceleration:
      enabled: true
      engine: cayenne
      refresh_check_interval: 10m

runtime:
  caching:
    sql_results:
      enabled: true
      item_ttl: 30s
      stale_while_revalidate_ttl: 5m
      eviction_policy: lru
```

With this configuration, the first execution of a query runs against the accelerated S3 data and the result is cached in memory. Identical queries within 30 seconds are served from the cache. Between 30 seconds and 5 minutes 30 seconds, stale results are served immediately while Spice re-executes the query in the background.

The `Results-Cache-Status` response header indicates cache state: `HIT`, `MISS`, `BYPASS`, or `STALE`. Clients can use `Cache-Control: no-cache` to bypass the cache and force a fresh query execution.

## Benefits

- **Reduced S3 Costs**: Fewer GET requests and less data transfer. Smart refresh skip avoids unnecessary reads for unchanged files.
- **Fast Queries**: Local acceleration delivers sub-millisecond to low-millisecond query times instead of seconds-long remote scans. The results cache eliminates accelerator query overhead for repeated queries.
- **Cold Start Resilience**: File-backed accelerators persist cached data across restarts.

### Learn More

- **S3 Data Connector**: [Documentation](../../components/data-connectors/s3) for authentication, configuration, and supported formats.
- **Data Acceleration**: [Documentation](../../features/data-acceleration) and [Data Refresh](../../features/data-acceleration/data-refresh).
- **Caching**: [Documentation](../../features/caching) for SQL results cache configuration, Cache-Control directives, and response headers.
- **DuckDB Data Accelerator**: [Recipe](https://github.com/spiceai/cookbook/blob/trunk/duckdb/accelerator/README) for file-backed acceleration.
