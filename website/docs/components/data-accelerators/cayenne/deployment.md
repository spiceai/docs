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

### Storage Modes

Cayenne supports two storage modes. In **`mode: file`** (durable, the recommended production mode), segments are written as Vortex files on local disk or S3 / S3 Express One Zone and the acceleration survives restarts — this guide is oriented to operating it. In **`mode: memory`** (ephemeral), all data lives fully in RAM with an in-memory metastore, nothing is written to disk, and the dataset reloads from its source on restart; it does not support partitioned tables and enforces a hard per-table RAM bound (no disk spill). Use `mode: file` when persistence across restarts is required.

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
| `cayenne_segment_cache_mb`   | `runtime.params`      | Process-wide segment (data page) cache, shared by every Cayenne table. Set proportional to your hot working set. |

Both caches are engine-global: one segment cache serves every Cayenne table in the process, so adding a table divides this budget rather than reserving another cache of its own. Set it under `runtime.params` — a `cayenne_segment_cache_mb` under a dataset's `acceleration.params` (or a catalog's `params`) is reported at startup and otherwise ignored. When unset, the budget is derived as ~1/64 of the process's memory entitlement, clamped to 256 MB–2 GB; `0` disables segment caching.

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

Generic acceleration metrics are available with the `dataset_acceleration_` prefix. Cayenne also registers OpenTelemetry instruments for CDC ingestion, write/compaction, scan-path, segment-cache, maintenance, storage-footprint, and memory observability. Per-table series carry a `table` label (the accelerated dataset); metastore-wide series carry `catalog` (the metastore path).

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

### Memory Reconciliation Metrics

The process gauges are sampled on a fixed 2-second timer; the per-table `cayenne_*` gauges refresh on the maintenance tick — every `cayenne_compaction_background_interval_ms` (10–30 s by default), or only on writes when the background compactor is disabled — so a flat per-table value can be a stale sample. Read them together: the pool gauges report what the memory accounting believes is reserved, the `process_resident_*` gauges what the process actually holds, and the gap against `process_resident_anon_bytes` is off-pool memory (encode buffers, caches, allocator retention) that no budget covers.

| Metric | Type | Unit | Description |
| ------ | ---- | ---- | ----------- |
| `query_memory_pool_used_bytes` | Gauge | By | Live bytes reserved in the query memory pool (`runtime.query.memory_limit`), excluding the in-memory CDC tier's mirror account so the off-pool tier is not double-counted as query usage. |
| `cayenne_compaction_memory_pool_used_bytes` | Gauge | By | Live bytes reserved in the dedicated compaction memory pool (whose size is reported by `cayenne_compaction_memory_pool_bytes`). |
| `process_resident_memory_bytes` | Gauge | By | Total resident set size of the `spiced` process. |
| `process_resident_anon_bytes` | Gauge | By | Anonymous resident bytes: heap and stacks, which the kernel cannot reclaim. Take the gap against this figure rather than the total. |
| `process_resident_file_bytes` | Gauge | By | File-backed resident bytes: mapped files and page cache the kernel evicts on demand. |
| `cayenne_memory_account_bytes` | Gauge | By | Memory Cayenne computed for one table and registered against the DataFusion query pool, by `kind` (`keyset`, `deletion_index`, `cold_existence`). |
| `cayenne_memory_account_reserved_bytes` | Gauge | By | Bytes the table's reservation actually holds on that pool. Components far above reserved means the accounting is not reaching it. |
| `cayenne_inline_cache_bytes` | Gauge | By | Resident Arrow bytes of the table's decoded inline (level-0) view cache. |
| `cayenne_inline_cache_batches` | Gauge | batches | Record batches held in that cache. |
| `cayenne_mem_tier_bytes` | Gauge | By | Resident bytes of one table's in-memory CDC tier. |
| `cayenne_scan_file_statistics_entries` | Gauge | entries | Cached scan statistics, one entry per data file. |

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

### Maintenance Decision Metrics

Maintenance passes often decline to run. Each decline is a correct decision that still leaves the table slightly larger, so these counters name which pass declined and why.

| Metric | Type | Unit | Description |
| ------ | ---- | ---- | ----------- |
| `cayenne_compaction_outcome_total` | Counter | passes | One compaction-family attempt and how it ended. Labelled by `table`, `kind`, and `outcome`. Every exit records exactly one outcome, so `sum by (outcome)` over a `kind` is that pass's complete decision history. |
| `cayenne_compaction_trigger_total` | Counter | passes | Compaction passes attempted, by the threshold that asked for the pass. Labelled by `table`, `kind`, and `trigger`. |
| `cayenne_maintenance_outcome_total` | Counter | passes | The same grammar for the non-compaction passes. Labelled by `table`, `op` (`orphan_dv_sweep`, `retention`, `retired_dir_sweep`), and `outcome`. |

`kind` uses the same vocabulary as `cayenne_compaction_duration_ms`, so an outcome joins to the duration of the pass that produced it:

| `kind` | Pass |
| ------ | ---- |
| `full` | Full current-snapshot re-encode (also folds the protected set). |
| `subset_current` | Current-snapshot small-file rewrite (hard-links the unpicked files). Also carries the declines of the current-snapshot pass as a whole, which fire before the subset/full choice. |
| `subset` | Size-tiered merge over the protected-snapshot set. |
| `bake` | Seq-prefix bake — consolidate the clean older prefix and prune the deletion index. |
| `datalake` | Cold-tier graduation. |

`outcome` falls into four classes:

- **Work happened** — `committed`, or `no_op` (the pass ran its selection and found nothing to merge).
- **Work was paid and thrown away** — `aborted_concurrent_change` (the merge finished, then a concurrent append, compaction, or overwrite invalidated its inputs at commit).
- **The pass errored** — `failed`. Distinct from every decline: a decline is a decision, this is a fault, and it is the class that warrants an alert rather than a dashboard.
- **The pass never ran** — a `declined_<reason>`.

`trigger` names which threshold asked for a pass — `small_file_count`, `protected_snapshot_count`, `protected_snapshot_age`, `deletion_index`, `deletion_index_memory_ceiling`. Read against the outcome counter, it separates "the trigger never fired" from "it fired and the pass was declined".

### Reclamation Metrics

What each maintenance pass reclaimed. A footprint gauge that climbs while its reclaim counter stays flat means reclamation is running but freeing nothing.

| Metric | Type | Unit | Description |
| ------ | ---- | ---- | ----------- |
| `cayenne_maintenance_reclaimed_files_total` | Counter | files | Files physically unlinked, labelled by `table` and `op`. |
| `cayenne_maintenance_reclaimed_bytes_total` | Counter | By | On-disk bytes of the files it unlinked, labelled by `table` and `op`. |
| `cayenne_maintenance_reclaimed_rows_total` | Counter | rows | Tombstones a deletion-vector sweep retired from the metastore, labelled by `table` and `op`. |
| `cayenne_maintenance_tombstoned_rows_total` | Counter | rows | Rows a pass **marked** deleted without freeing anything, labelled by `table` and `op`. Retention is the only producer today. |

### Storage Footprint Metrics

`cayenne_storage_*` is derived from the metastore manifest and split by the layer that produced it, which makes growth attributable: rising `protected` files are read amplification, rising `delete_vector` bytes a deletion set outgrowing the data it shadows.

These ride a background tick, at most every 30 s per table and every 5 min for `cayenne_data_dir_*`, so a flat value can be a stale sample rather than a stable table. Tables with the compactor disabled (`cayenne_compaction_background_interval_ms: 0`) are sampled too.

| Metric | Type | Unit | Description |
| ------ | ---- | ---- | ----------- |
| `cayenne_storage_files` | Gauge | files | Data-file **paths** the table holds, by `tier` (`current`, `protected`, `cold`, `delete_vector`; the `inline` tier reports bytes and rows only). |
| `cayenne_storage_bytes` | Gauge | By | On-disk bytes the table holds, by `tier`. |
| `cayenne_storage_rows` | Gauge | rows | Rows the table holds, by `tier`, before deletions are applied. On the `delete_vector` tier this is the tombstone count. |
| `cayenne_snapshot_manifest_rows` | Gauge | rows | `cayenne_snapshot_file` manifest rows, split by `reachable` — whether the snapshot they name is still live. |
| `cayenne_data_dir_files` | Gauge | files | Files in the table's data directory by `kind` (`data`, `deletion_vector`, `staging`, `other`), measured by walking the directory rather than reading the manifest. Local filesystem only. |
| `cayenne_data_dir_bytes` | Gauge | By | Bytes present in the table's data directory by `kind`. |
| `cayenne_data_dir_snapshot_dirs` | Gauge | directories | Snapshot directories present on disk. A count far above the live snapshot count is retired directories the sweep has not reclaimed. |

### Metastore Metrics

| Metric | Type | Unit | Description |
| ------ | ---- | ---- | ----------- |
| `cayenne_metastore_db_bytes` | Gauge | By | Current size of the metastore SQLite database file, labelled by `catalog`. |
| `cayenne_metastore_wal_bytes` | Gauge | By | Current size of the metastore `-wal` file, labelled by `catalog`. |
| `cayenne_metastore_table_rows` | Gauge | rows | Metastore rows attributable to one dataset table, labelled by `table` and `metastore_table`. |

The database file plus its `-wal` is the whole metadata footprint. Both carry a `catalog` label — the metastore path — because one metastore is shared by the pod's Cayenne tables, and a deployment can hold more than one.

### Segment Cache Metrics

The segment cache is the process-wide Vortex decompressed-segment cache (`cayenne_segment_cache_mb`). All five instruments are observable — sampled on every collection — and each series carries a `cache` label naming which cache it describes rather than a dataset: `shared` is the process-wide cache every Cayenne table reads through, which is what a spiced deployment reports. `accesses` and `hits` are monotonic counters and keep counting across a cache being recreated, so query them with counter operations such as `rate()` or `increase()` (hit rate over a window = `rate(cayenne_segment_cache_hits[5m]) / rate(cayenne_segment_cache_accesses[5m])`).

| Metric | Type | Unit | Description |
| ------ | ---- | ---- | ----------- |
| `cayenne_segment_cache_accesses` | Counter | accesses | Cumulative Vortex segment cache `get()` calls. |
| `cayenne_segment_cache_hits` | Counter | hits | Cumulative Vortex segment cache hits. |
| `cayenne_segment_cache_entries` | Gauge | entries | Live Vortex segment cache entry count. |
| `cayenne_segment_cache_weighted_bytes` | Gauge | By | Live Vortex segment cache size in bytes. |
| `cayenne_segment_cache_capacity_bytes` | Gauge | By | Configured Vortex segment cache capacity in bytes. |

See [Component Metrics](../../../features/observability/component_metrics) for enabling and exporting metrics.

## Task History

Cayenne refresh, append, and query operations participate in [task history](../../../reference/task_history) through the shared acceleration spans (`accelerated_table_refresh`, `sql_query`) plus Cayenne's own internal spans for segment uploads and metastore commits.

## Known Limitations

- **Memory mode is ephemeral**: `mode: memory` keeps all data in RAM with no durable storage — the dataset reloads from its source on restart and enforces a hard RAM bound (no disk spill). Use `mode: file` when persistence across restarts is required; for a non-Cayenne pure in-memory accelerator, see [Arrow](../arrow/deployment).
- **Single-writer per table**: Two Spice instances cannot write the same Cayenne table concurrently.
- **Vortex version compatibility**: Cayenne files are tied to the Vortex binary version shipped with Spice. Cross-version reads may be supported but not cross-version writes.
- **Object-store write atomicity**: Standard S3 is eventually consistent for multipart uploads. S3 Express One Zone provides strong read-after-write consistency and is recommended for latency-sensitive workloads.

## Troubleshooting

| Symptom                                          | Likely cause                                             | Resolution                                                                                              |
| ------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Slow restart after a crash                       | WAL not checkpointed due to ungraceful shutdown.         | Use graceful shutdown (`SIGTERM`); first restart will catch up the WAL automatically.                   |
| `database is locked` metastore errors            | Two writers sharing one metastore path.                  | Ensure only one writer; use distinct metastore paths per instance.                                      |
| Dataset fails to load naming a data directory that contains the metastore directory | The resolved metastore sits inside the dataset's data directory — commonly a dataset named `metadata` under the stock defaults. | Set `cayenne_metadata_dir` outside the data directory, or rename the dataset. See [Metastore location](./index.md#metastore-location). |
| Query slower than expected for cold data         | Segment cache too small for the working set of every table sharing it. | Increase `runtime.params.cayenne_segment_cache_mb`.                                       |
| High S3 request cost                             | Segment cache misses on every query.                     | Increase `runtime.params.cayenne_segment_cache_mb`; consider `partition_by` aligned with query filters. |
| Upload throughput does not scale with concurrency | Network or S3 Express One Zone TPS limit.                | Use S3 Express One Zone in the same AZ; benchmark with `upload_concurrency` to find the right setting.  |
| Corrupted segment refused on startup             | Crash mid-upload; checksum mismatch.                     | Segments are re-materialized on refresh. Check storage for partial uploads and remove if orphaned.      |
