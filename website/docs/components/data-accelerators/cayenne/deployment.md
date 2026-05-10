---
title: 'Cayenne Data Accelerator Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for Spice Cayenne in production: footer and segment caches, S3 Express, metastore durability, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-accelerators
  - cayenne
  - observability
---

Production operating guide for [Spice Cayenne](https://spice.ai/cayenne) — a high-performance [Vortex](https://github.com/vortex-data/vortex)-based accelerator with file-mode storage. Covers storage layout, metastore durability, cache sizing, and observability.

## Authentication & Secrets

When Cayenne stores segments on S3 / S3 Express One Zone, authentication follows the same model as the [S3 connector](../../data-connectors/s3/deployment#authentication--secrets): the AWS credential chain with `iam_role_source` for explicit scoping. For local-disk Cayenne, no auth is required — the runtime process needs read/write on the storage path.

## Resilience & Durability

### File-Mode Only

Cayenne is file-mode only. Segments are written as Vortex files on local disk or S3 / S3 Express One Zone.

### Metastore Durability

Cayenne's metastore (table list, segment index, delete vectors) is backed by SQLite or Turso. The metastore configures:

- `journal_mode=WAL` for crash-safe writes.
- `busy_timeout` to handle concurrent access.
- `synchronous=NORMAL` for WAL-safe durability with acceptable write latency.

On shutdown, Cayenne performs a WAL checkpoint and runs `PRAGMA optimize` to minimize restart overhead. Graceful shutdown via `SIGTERM` is important — abrupt kills leave the WAL un-checkpointed (still recoverable, but restart is slower).

### Append WAL Crash Safety

Staged appends use a crash-safe WAL. On startup Cayenne verifies each staged segment's checksum; corrupted or partially-uploaded segments are rejected and re-materialized from the source connector.

### Single-Writer Concurrency

Cayenne enforces single-writer-per-table concurrency via the metastore. Multiple Spice instances backed by the same Cayenne storage + metastore must not be configured as writers simultaneously; reader-only replicas are supported.

## Capacity & Sizing

### Cache Tuning

Two in-memory caches tune the random-read vs memory tradeoff:

| Parameter                    | Description                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------- |
| `cayenne_footer_cache_mb`    | Footer cache (Vortex file footers). Low memory cost; enables fast plan-time decisions. |
| `cayenne_segment_cache_mb`   | Segment (data page) cache. Set proportional to your hot working set.              |

For point-lookup-heavy workloads, size `cayenne_segment_cache_mb` generously — Vortex random-access reads are ~100× faster for cached segments than cold S3 reads.

### Upload Concurrency

| Parameter             | Description                                               |
| --------------------- | --------------------------------------------------------- |
| `cayenne_upload_concurrency` | Parallel segment uploads during refresh / append commits. |

For S3 Express One Zone, 8–16 parallel uploads typically maximize throughput. For standard S3 across regions, higher concurrency helps hide per-request latency.

### Partitioning

Cayenne supports `partition_by` (single and multi-expression). Partition on the column(s) that dominate query filters; this prunes segments at plan time.

### Storage Footprint

Vortex compression typically delivers 2–4× better compression than Parquet Snappy for analytical datasets. Plan storage for 0.25–0.5× the raw data size as a starting estimate.

## Metrics

Generic acceleration metrics are available with the `dataset_acceleration_` prefix. Cayenne-specific OpenTelemetry instruments are not currently registered at the runtime layer; use Cayenne's footer/segment cache hit rates surfaced via query plan explain and the generic acceleration counters.

See [Component Metrics](../../../features/observability/component_metrics) for enabling and exporting metrics.

## Task History

Cayenne refresh, append, and query operations participate in [task history](../../../reference/task_history) through the shared acceleration spans (`accelerated_table_refresh`, `sql_query`) plus Cayenne's own internal spans for segment uploads and metastore commits.

## Known Limitations

- **File-mode only**: In-memory mode is not supported; use [Arrow](../arrow/deployment) for pure in-memory acceleration.
- **Single-writer per table**: Two Spice instances cannot write the same Cayenne table concurrently.
- **Vortex version compatibility**: Cayenne files are tied to the Vortex binary version shipped with Spice. Cross-version reads may be supported but not cross-version writes.
- **Object-store write atomicity**: Standard S3 is eventually consistent for multipart uploads. S3 Express One Zone provides strong read-after-write consistency and is recommended for latency-sensitive workloads.

## Troubleshooting

| Symptom                                          | Likely cause                                             | Resolution                                                                                              |
| ------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Slow restart after a crash                       | WAL not checkpointed due to ungraceful shutdown.         | Use graceful shutdown (`SIGTERM`); first restart will catch up the WAL automatically.                   |
| `database is locked` metastore errors            | Two writers sharing one metastore path.                  | Ensure only one writer; use distinct metastore paths per instance.                                      |
| Query slower than expected for cold data         | Segment cache too small for working set.                 | Increase `cayenne_segment_cache_mb`.                                                                    |
| High S3 request cost                             | Segment cache misses on every query.                     | Increase segment cache; consider `partition_by` aligned with query filters.                             |
| Upload throughput does not scale with concurrency | Network or S3 Express One Zone TPS limit.                | Use S3 Express One Zone in the same AZ; benchmark with `upload_concurrency` to find the right setting.  |
| Corrupted segment refused on startup             | Crash mid-upload; checksum mismatch.                     | Segments are re-materialized on refresh. Check storage for partial uploads and remove if orphaned.      |
