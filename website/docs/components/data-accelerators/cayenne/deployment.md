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

Cayenne's metastore (table list, segment index, delete vectors) is backed by SQLite (default) or Turso. With the default **SQLite** backend, the metastore configures:

- `journal_mode=WAL` for crash-safe writes.
- `busy_timeout` to handle concurrent access.
- `synchronous=NORMAL` for WAL-safe durability with acceptable write latency.

The **Turso** backend (opt-in, requires the `turso` feature flag) uses its MVCC journal mode (`journal_mode='mvcc'`) instead of WAL.

On shutdown, Cayenne performs a WAL checkpoint (SQLite) and runs `PRAGMA optimize` to minimize restart overhead. Graceful shutdown via `SIGTERM` is important — abrupt kills leave the WAL un-checkpointed (still recoverable, but restart is slower).

### Append WAL Crash Safety

Staged appends use a crash-safe WAL. On startup Cayenne verifies each staged segment's checksum; corrupted or partially-uploaded segments are rejected and re-materialized from the source connector.

### Single-Writer Concurrency

Cayenne enforces single-writer-per-table concurrency via the metastore. Multiple Spice instances backed by the same Cayenne storage + metastore must not be configured as writers simultaneously; reader-only replicas are supported.

## Capacity & Sizing

### Cache Tuning

Two in-memory caches tune the random-read vs memory tradeoff:

| Parameter                    | Scope                 | Description                                                                       |
| ---------------------------- | --------------------- | --------------------------------------------------------------------------------- |
| `cayenne_footer_cache_mb`    | `runtime.params`      | Engine-global footer cache (Vortex file footers), shared by all Cayenne datasets. Low memory cost; enables fast plan-time decisions. |
| `cayenne_segment_cache_mb`   | `acceleration.params` | Per-dataset segment (data page) cache. Set proportional to your hot working set.  |

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

Generic acceleration metrics are available with the `dataset_acceleration_` prefix. Cayenne also registers the following OpenTelemetry instruments for CDC ingestion, write/compaction, scan-path, and segment-cache observability, all tagged by `dataset`:

### CDC Apply Metrics

| Metric | Type | Unit | Description |
| ------ | ---- | ---- | ----------- |
| `dataset_acceleration_cdc_apply_burst_duration_ms` | Histogram | ms | Duration to apply one coalesced CDC burst. |
| `dataset_acceleration_cdc_apply_burst_bytes` | Histogram | By | Arrow in-memory bytes in one coalesced CDC apply burst. |
| `dataset_acceleration_cdc_apply_burst_envelopes` | Histogram | envelopes | Number of source envelopes in one coalesced CDC apply burst. |
| `dataset_acceleration_cdc_apply_fixed_cost_ms` | Histogram | ms | Duration for fixed-cost phases of CDC apply (with `phase` label: `finalize_wait`, `commit_wait`, etc.). |
| `dataset_acceleration_cdc_source_recv_wait_ms` | Histogram | ms | Duration the CDC apply loop waited to receive the next batch from the source-reader channel. High values indicate the apply loop is source-bound (slot read / WAL decode can't keep up); near-zero indicates it is apply-bound. |

### Scan-Path Metrics

| Metric | Type | Unit | Description |
| ------ | ---- | ---- | ----------- |
| `cayenne_scan_listing_table_cache_entries` | Gauge | entries | Number of entries in the scan `ListingTable` cache. Cleared on snapshot change (compaction/sort/overwrite). |
| `cayenne_listing_fence_wait_duration_ms` | Histogram | ms | Time spent waiting on listing-fence reads during scans. |
| `cayenne_listing_scan_duration_ms` | Histogram | ms | Duration of listing-table scans. |

### Write & Compaction Metrics

| Metric | Type | Unit | Description |
| ------ | ---- | ---- | ----------- |
| `cayenne_write_phase_duration_ms` | Histogram | ms | Time spent in Cayenne write-path phases. Labelled by `table` and `phase` (see [Write-phase labels](#write-phase-labels)). |
| `cayenne_compaction_duration_ms` | Histogram | ms | Wall-clock time of Cayenne background compaction passes. The histogram's count doubles as the compaction-pass counter. |
| `cayenne_compaction_memory_pool_bytes` | Gauge | By | Size of the dedicated compaction memory pool carved from the query memory limit (see `cayenne_compaction_memory_fraction`). |
| `cayenne_compaction_memory_exhausted_total` | Counter | passes | Compaction passes that hit `ResourcesExhausted` on the dedicated compaction memory pool. |

#### Write-phase labels

`cayenne_write_phase_duration_ms` carries a `table` label (the accelerated dataset) and a `phase` label that attributes time across the write path. The `phase` values are:

| `phase` | Description |
| ------- | ----------- |
| `cdc_path_synchronous` | Total latency of a synchronous CDC write, from slot-apply through publish completion. Also covers a staged inline-bearing upsert that could not be represented as a staged commit and fell back to the synchronous write path. |
| `cdc_path_inlined` | A pipelined CDC append that completed as a small inlined write. |
| `cdc_path_staged` | A staged (pipelined) CDC write: time to durable WAL and return. Publish/finalize is backgrounded, so this **excludes** publish. |
| `cdc_path_inmemory` | An in-memory CDC append (`cayenne_cdc_durability: memory`, serial path): end-to-end latency from slot-apply through the RAM-tier append under the listing fence. The deferred source-slot acknowledgement is checkpointed separately. |
| `cdc_path_inmemory_sharded` | An in-memory CDC append applied across PK-hash shards (intra-apply sharding) rather than the single serial index. |
| `cdc_path_inmemory_fallback` | An in-memory CDC append that could not be admitted to the RAM tier (the process-global mem-tier byte budget was exhausted after waiting and spilling) and fell back to the durable write path. |
| `cdc_path_inmemory_sharded_fallback` | A sharded in-memory apply that bailed under sustained overload before any tier mutation and re-streamed through the durable serial path. |
| `inmemory_stream_drain` | Draining the prepared CDC stream into RAM and running deferred primary-key conflict validation — the upstream-bound produce-and-validate slice of `cdc_path_inmemory`. |
| `inmemory_spill` | A synchronous RAM-tier checkpoint (spill) triggered when the per-table byte cap (`cayenne_cdc_mem_tier_max_bytes`) is breached, before the batch is appended. |
| `inmemory_budget_wait` | Time spent waiting (bounded) for the process-global mem-tier byte budget to admit the batch, released by another table's checkpoint. |
| `vortex_write` | Encoding and writing Vortex data files. |
| `stage_wal_prepare` | Preparing the staged-append write-ahead log. |
| `apply_on_conflict_deletions` | Applying merge-on-read deletions for on-conflict (upsert) writes. |
| `publish` | Total publish/finalization of a new snapshot. |
| `publish_lock_wait` | Waiting to acquire the visibility and listing-fence locks before publishing. |
| `publish_seq` | Durably recording the new snapshot's sequence number before it becomes visible. |
| `publish_cas` | The compare-and-swap that makes the new protected snapshot visible. |
| `publish_wal_write` | Writing the staging WAL during backgrounded finalize. |
| `publish_move_files` | Moving staged files into place during finalize. |
| `publish_commit` | Committing the new snapshot during finalize. |

The `cdc_path_*` phases are the mutually-exclusive terminal phase of a write — exactly one is recorded per write. The `cdc_path_inmemory*` phases and the `inmemory_*` sub-phases are emitted only under `cayenne_cdc_durability: memory`. The remaining phases (`vortex_write`, `stage_wal_prepare`, `apply_on_conflict_deletions`, `inmemory_*`, and `publish*`) are sub-components useful for attributing where write time is spent.

### Segment Cache Metrics

The segment cache is the per-dataset Vortex decompressed-segment cache (`cayenne_segment_cache_mb`). The `accesses` and `hits` instruments are cumulative.

| Metric | Type | Unit | Description |
| ------ | ---- | ---- | ----------- |
| `cayenne_segment_cache_accesses` | Gauge | accesses | Cumulative Vortex segment cache `get()` calls. |
| `cayenne_segment_cache_hits` | Gauge | hits | Cumulative Vortex segment cache hits. (Hit rate = `hits / accesses`.) |
| `cayenne_segment_cache_entries` | Gauge | entries | Live Vortex segment cache entry count. |
| `cayenne_segment_cache_weighted_bytes` | Gauge | By | Live Vortex segment cache size in bytes. |
| `cayenne_segment_cache_capacity_bytes` | Gauge | By | Configured Vortex segment cache capacity in bytes. |

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
