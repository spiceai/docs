---
title: 'Spice Cayenne Performance Tuning'
sidebar_label: 'Performance Tuning'
description: 'Tuning Spice Cayenne: storage tier and NVMe placement, self-tuning and goal-driven SLOs, cache sizing, compression strategy, sorted data, write-path and compaction tuning, and file-size tuning.'
sidebar_position: 5
pagination_prev: null
pagination_next: null
tags:
  - data-accelerators
  - cayenne
  - performance
---

Spice Cayenne performance depends on where its files live, how its caches are sized, and how its write path and compaction are configured. By default Cayenne is self-tuning — see [Self-Tuning](#self-tuning) — and adapts to the storage medium it detects, so manual tuning is only needed to override a specific knob. The one decision that cannot be automated is the storage itself, which is why this page starts there.

## Storage

Cayenne keeps two kinds of state on disk, and both sit on the query path:

- **Data files** — immutable [Vortex](https://github.com/vortex-data/vortex) files under the dataset's data directory (`cayenne_file_path`, defaulting to `.spice/data/{dataset_name}/` under the working directory). Vortex is built for random access: a selective query reads the segments it needs rather than scanning the file, so a cold query is a chain of dependent small reads, each of which waits for the device. Compaction rewrites sets of these files in the background.
- **The metastore** — a SQLite database (`cayenne_metadata_dir`, defaulting to `.spice/data/metadata`) holding manifests, snapshot pointers, statistics, and deletion vectors. Every write commits to it with `fsync`, and every query plan reads it.

Queries that outgrow `runtime.query.memory_limit` additionally spill through DataFusion to `runtime.query.temp_directory`, and the in-memory CDC tier checkpoints to the data directory under memory pressure.

### Recommendation: local NVMe

**Store Cayenne data files, the metastore, and the spill directory on local NVMe or SSD.** What matters most is per-I/O latency, not IOPS: Vortex's dependent segment reads, the metastore's synchronous commits, and each spilled batch all wait for the device before the query can continue, so the tens of microseconds an NVMe read takes — against a millisecond or more on network storage — is multiplied along every query's critical path. IOPS and bandwidth only decide how much can proceed at once before requests queue behind each other. Local NVMe is also the tier on which the self-tuner applies no write-amortization bias, so ingest runs at full concurrency.

```text
/nvme/spice/
├── data/orders/     # cayenne_file_path
├── metadata/        # cayenne_metadata_dir — must resolve outside every data directory
└── tmp/             # runtime.query.temp_directory
```

```yaml
runtime:
  query:
    temp_directory: /nvme/spice/tmp

datasets:
  - from: postgres:public.orders
    name: orders
    acceleration:
      engine: cayenne
      mode: file
      refresh_mode: changes
      primary_key: id
      params:
        cayenne_file_path: /nvme/spice/data/orders/
        cayenne_metadata_dir: /nvme/spice/metadata
```

Local NVMe on cloud instances is ephemeral — instance store is erased when the instance stops or is replaced — so pair it with [acceleration snapshots](../../../features/data-acceleration/snapshots.md) for fast cold starts, with [S3 Express One Zone](./index.md#aws-s3-express-one-zone-storage) when the data files themselves must survive the instance, or with the [cold object-store tier](./index.md#cold-object-store-tier) when the table outgrows the device. The cross-engine guidance — storage tiers and their latencies, cloud specifics, Kubernetes volumes, and capacity planning — is in [Storage](../../../reference/performance-tuning.md#storage) in the Performance Tuning guide.

### Storage tier detection

At registration Cayenne resolves the storage class behind the data directory and the metastore directory separately, using the acceleration's [`storage_profile`](../../../reference/spicepod/datasets.md#accelerationstorage_profile) (`auto` by default). Auto-detection on Linux reads `/proc/self/mountinfo` and the block device behind the mount: EBS and Azure managed disks resolve to the network-attached tier, NFS and SMB/CIFS mounts resolve to the same tier, `tmpfs`/`ramfs` to the RAM tier, NVMe and other non-rotational devices to local SSD, and everything else — object-store paths, rotating disks, non-Linux hosts — to `unknown`.

The tier drives the self-tuner's storage-sensitive defaults:

| Resolved tier                                                      | `cayenne_target_file_size_mb: auto` | Tuner bias                                                                                                                                                                                                            | Compaction output writer                                                                                    | Encode-concurrency cap                                                                    |
| ------------------------------------------------------------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `local_ssd` — local NVMe/SSD, including EC2 NVMe instance storage  | 256 MB                              | None                                                                                                                                                                                                                  | Buffered, with page-cache eviction hints after each file                                                    | None — local devices parallelize well                                                     |
| `tmpfs` — RAM-backed mount                                         | 64 MB                               | None                                                                                                                                                                                                                  | Buffered                                                                                                    | None                                                                                      |
| `ebs` — EBS, Azure managed disks, NFS, SMB                         | 256 MB                              | Slow tier: larger inline-memtable flushes so fewer, bigger files are written and fewer metastore commits are made; the table counts as I/O- or publish-bound at half the per-batch latency; memory buffers drain earlier; write shards are withheld sooner | `O_DIRECT` with up-front preallocation, rate-smoothed writeback every 8 MiB, and a final `fsync` before the publishing rename (`F_NOCACHE` on macOS; falls back to buffered where the file system rejects direct I/O) | Ceiling from the instance's EBS baseline bandwidth (EC2) or the measured write throughput, divided by a per-stream estimate, never below 4 streams |
| `unknown` — S3 Express One Zone, undetected                        | 512 MB on S3 Express, 256 MB otherwise | Slow tier (class-based; no measured throughput on object stores)                                                                                                                                                       | Buffered (object stores use their own writer)                                                               | Only when an EC2 EBS baseline is known                                                    |

Within the network-attached tier Cayenne measures the medium rather than treating every volume alike. It writes an 8 MiB probe file to the data directory and to the metastore directory, syncs it, and records the sequential write throughput — once per distinct volume, skipped for object-store paths, and fail-open. A volume that measures at or below about 125 MiB/s (a baseline `gp3` volume) receives the full slow-tier bias; one at or above about 1 GiB/s (a heavily provisioned `io2` volume) receives none; between them the bias is scaled linearly. On AWS EC2 the runtime also queries the [Instance Metadata Service](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html) once, at first table registration, to learn whether the instance is a burstable T-family type (the controller then stops adding CPU-hungry work well before CPU credits run out) and what its baseline EBS bandwidth is (the source of the encode-concurrency cap). The IMDS probe uses a tight timeout and a single attempt, so off AWS it is a fast no-op; set `SPICE_DISABLE_IMDS=1` (or the standard `AWS_EC2_METADATA_DISABLED`) to skip it.

**Override detection when it cannot see the device.** GCP Persistent Disk and Hyperdisk, Ceph RBD, SAN LUNs, and other network block devices that are not EBS or Azure disks present as ordinary NVMe or non-rotational devices and resolve to `local_ssd`, so the slow-tier protections do not engage. Set `storage_profile: ebs` on those datasets. Set `local_ssd` when a container runtime hides the block device metadata from a host you know has local NVMe.

```yaml
datasets:
  - from: postgres:public.events
    name: events
    acceleration:
      engine: cayenne
      mode: file
      storage_profile: ebs # GCP Hyperdisk: not recognized by device identity
      params:
        cayenne_file_path: /mnt/hyperdisk/spice/data/events/
```

**Observe what was detected.** At startup each table logs a `Cayenne auto-tuned config` line naming the resolved storage classes and every derived knob, and reports them as gauges labelled by `table`:

| Metric                                  | Description                                                                                        |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `cayenne_data_storage_class`            | Detected tier of the data directory: `0` local SSD, `1` network-attached, `2` tmpfs, `3` unknown  |
| `cayenne_metastore_storage_class`       | Detected tier of the metastore directory, same codes                                               |
| `cayenne_data_storage_write_mibps`      | Measured sequential write throughput of the data volume (absent when unprobed)                     |
| `cayenne_metastore_storage_write_mibps` | Measured sequential write throughput of the metastore volume (absent when unprobed)                |
| `cayenne_autotune_target_file_size_mb`  | The target file size in force                                                                      |
| `cayenne_autotune_write_concurrency`    | The write concurrency in force                                                                     |

A table reporting `1` on a host that has local NVMe, or `0` on a host you know is on network storage, is the signal to set `storage_profile` explicitly.

### Network block storage: EBS, Azure Managed Disks, Persistent Disk

Cayenne runs well on network block storage, and it is the right choice when the acceleration must survive instance replacement without a snapshot round trip. The cost is latency first: every cache miss and every metastore commit is a network round trip, so a cold, selective query — a chain of dependent segment reads — runs an order of magnitude slower per miss than on NVMe however many IOPS the volume is provisioned for. Plan accordingly:

- **Choose the tier for its latency, then provision IOPS.** `io2` Block Express, Azure Premium SSD v2, and GCP Hyperdisk Extreme are the sub-millisecond tiers and the right default for a Cayenne data volume; `gp3` (single-digit-millisecond latency, 3,000 IOPS and 125 MiB/s baseline) is the economical fallback for tables that are mostly served from the segment cache. Provisioned IOPS and throughput stop queueing from adding to the latency, and continuous ingest needs them; they do not reduce the latency itself. Choose an instance whose EBS bandwidth sustains the provisioned throughput — many smaller instance sizes burst to their maximum EBS bandwidth for only 30 minutes a day. See [Amazon EBS and network block storage](../../../reference/performance-tuning.md#amazon-ebs-and-network-block-storage).
- **Size the segment cache to the hot working set.** Every segment cache hit avoids a round trip, which on network storage is the whole cost. Raise `runtime.params.cayenne_segment_cache_mb` above the derived default (1/64 of memory, 256 MB–2 GB) and watch the hit rate — see [Cache Tuning](#cache-tuning).
- **Keep the metastore local where possible.** The metastore is the more latency-sensitive of the two; when the instance has any local disk, point `cayenne_metadata_dir` at it and leave only the data files on the network volume. The two directories are classified and probed separately.
- **Keep spill on the volume with room, ideally local.** `runtime.query.temp_directory` defaults to the OS temporary directory, which on a cloud instance is the small root volume; the runtime logs a reminder at startup when Cayenne is active and the setting is unset. Spill has no durability requirement, so if the instance has any local NVMe, spill belongs there even when the data does not.
- **Let the tuner amortize.** The slow-tier bias, the `O_DIRECT` compaction writer, and the encode-concurrency cap all engage automatically on the `ebs` tier; the startup log reports `Capping global encode-concurrency budget to the instance EBS write-bandwidth ceiling` when the instance's bandwidth binds. Pinning `cayenne_write_concurrency` or `cayenne_target_file_size_mb` on a network volume removes these protections for that knob.
- **Watch the volume.** Rising `vortex_write` and `publish_commit` phases in `cayenne_write_phase_duration_ms` on an unchanged workload, and a growing EBS `VolumeQueueLength` or a falling `EBSIOBalance%`, mean the storage — not Cayenne — is the bottleneck.

### Network file systems: NFS, SMB, EFS, Azure Files

Network file systems are **not recommended** for Cayenne. Auto-detection classifies `nfs`, `nfs4`, `cifs`, `smbfs`, and `smb3` mounts as the network-attached tier, so the same amortizing behaviors apply, but two problems remain:

- **The metastore is a SQLite database.** SQLite's documentation warns that lock implementations on network file systems — NFS in particular — are unreliable and that concurrent access can corrupt the database ([How To Corrupt An SQLite Database File](https://www.sqlite.org/howtocorrupt.html), section 2.1). Always keep `cayenne_metadata_dir` on local disk.
- **Every segment read and every rename is a protocol round trip.** Latency on managed offerings (EFS, Azure Files, Filestore) is measured in milliseconds with wide variance, and throughput is metered per file system, so cold scans and compaction run many times slower than on a block device.

Cayenne tolerates a share better than the other file-mode engines because its data files are immutable once written — the share sees whole-file writes and atomic renames rather than in-place page updates — so if a share is the only durable storage available, put only the data files on it, run a single writer, and load-test the cold-cache case. See [Network file systems](../../../reference/performance-tuning.md#network-file-systems-nas-nfs-smb-efs-azure-files) for mount guidance.

### RAM-backed storage

On a `tmpfs` mount Cayenne switches to 64 MB files and applies no bias. The data still occupies RAM — on Kubernetes an `emptyDir` with `medium: Memory` counts against the container's memory limit — so this is only sensible for a small table that must be read at memory speed; for anything else, use `mode: memory`, which keeps the data in RAM with an in-memory metastore and no file overhead, or local NVMe. Never place `runtime.query.temp_directory` on `tmpfs`.

### Disk space

Plan the data volume for:

| Item                                       | Planning figure                                                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Data files                                 | 0.25–0.5× raw data size with `btrblocks` (see [Storage Footprint](./deployment.md#storage-footprint))                                  |
| Compaction headroom                        | A pass holds the old and the new copy of the files it rewrites until the new snapshot is published; budget for the largest file set that a full-snapshot rewrite can touch |
| Protected snapshots and deletion vectors   | Bounded by the compaction triggers below and by retention; `cayenne_storage_bytes` by `tier` shows the split                            |
| Metastore                                  | ~10 MB per 1,000 files plus its WAL (`cayenne_metastore_db_bytes`, `cayenne_metastore_wal_bytes`)                                       |
| In-memory CDC tier checkpoints             | Written to the data directory under memory pressure                                                                                     |
| Spill                                      | On `runtime.query.temp_directory`: 2–4× the largest spillable input, under DataFusion's 100 GB total cap                                |

The runtime warns at startup when the data or metastore volume has under 10% or under 2 GiB free (`Cayenne data volume is low on free space` / `Cayenne metastore volume is low on free space`), because a full data volume fails CDC ingestion. Alert on the volume's free bytes in production.

## Self-Tuning

Cayenne sizes its memory-, CPU-, and storage-sensitive knobs automatically so it runs well on any host without hand-tuning, from a small container to a large multi-core box across different storage classes. Every numeric `cayenne_*` knob also accepts the literal `auto`, which lets the runtime derive that knob's value while leaving the rest of the configuration untouched.

The mode is controlled by the `cayenne_tuning` acceleration parameter:

- **`auto`** — derive the correct configuration values statically from the detected environment (cgroup-aware cores and memory, storage class) and the inferred schema (cardinality, row width, primary key). No feedback loop runs.
- **`adaptive`** (preview) — in addition to the static derivation, run a per-table closed-feedback controller that measures the live CDC ingest rate and the runtime's response (apply latency vs. offered load, read amplification, memory pressure) and adjusts the inline-memtable flush caps, compaction cadence/trigger, and write concurrency over time. Adjustments are bounded by the same environment-derived `[floor, ceiling]` the static tier uses, so the loop can only ever pick a value the static tier could have picked.

Environment detection feeds both modes: the storage classes and measured throughput of the data and metastore volumes, and on AWS EC2 the instance's burstable-CPU status and EBS baseline bandwidth — see [Storage tier detection](#storage-tier-detection). A slow storage tier biases both the static warm-start (per-tier file-size pre-sizing) and the closed loop (which then amortizes commits and withholds write shards sooner, and reacts to an I/O latency cliff such as an EBS burst-credit exhaustion with one decisive backoff rather than an additive crawl).

`adaptive` is reached **only** by setting `cayenne_tuning: adaptive` on the dataset — nothing else turns the closed loop on. An unset value, an unrecognized value (logged as a warning, then treated as `auto`), schema inference, and a configured `cayenne_goal_*` SLO all resolve to `auto`. Schema inference is always attempted and seeds the controller's warm-start, but is not what selects the mode.

```yaml
acceleration:
  engine: cayenne
  params:
    cayenne_tuning: adaptive
```

:::warning[Preview]

`cayenne_tuning: adaptive` is in preview. Cayenne logs a startup warning when it is enabled; verify query correctness and performance before using it for production workloads. The static `auto` mode is recommended for production.

:::

`adaptive` needs a non-zero `cayenne_compaction_background_interval_ms`, since the controller runs on the background compaction tick; if it is `0`, Cayenne logs a warning and falls back to `auto`. A `refresh_mode: full` dataset defaults that interval to `0` — a whole-table replace has nothing for background compaction to consolidate — so `adaptive` falls back to `auto` on such a table unless you also set `cayenne_compaction_background_interval_ms` explicitly. Schema inference (always on) sharpens the `adaptive` warm-start — the loop's data-aware warm-start uses the inferred cardinality and size — but is not required for an explicit `cayenne_tuning: adaptive`; without inferred metadata the controller relearns the observed row width from live ingest and converges from the hardware-derived warm-start.

In both modes, setting any `cayenne_*` knob to an explicit value overrides the derived value. Under `adaptive`, an explicitly-set knob is **pinned** — the controller will not move it.

### Goal-driven tuning

Under `adaptive`, you can give the controller high-level service-level objectives (SLOs) instead of leaving it to optimize from its built-in signals alone. Set one or more `cayenne_goal_*` SLOs — **globally under `runtime.params`**, where they apply to every Cayenne-accelerated dataset — and the closed loop converges toward each target in small, bounded steps:

:::info A goal does not enable the loop

A goal declares a target, not a choice of controller. `cayenne_goal_*` is read on every Cayenne dataset, but it steers the loop only where the loop is already running — set on a dataset left at the `auto` default it is **ignored**, and Cayenne logs a warning naming the dataset once at registration. Because the SLOs are designed to be set once under `runtime.params`, enable the loop per dataset with `cayenne_tuning: adaptive` on each table you want it to steer.

:::

| Goal | Parameter | Example |
| --- | --- | --- |
| End-to-end CDC replication lag | `cayenne_goal_replication_lag` | `5s` |
| Data freshness (age of the newest queryable data) | `cayenne_goal_freshness` | `30s` |
| p99 query latency | `cayenne_goal_query_latency` | `250ms` |
| Query throughput (queries per hour, higher is better) | `cayenne_goal_qph` | `5000` |

The time-based goals accept a duration string (e.g. `5s`, `1m`, `250ms`); `cayenne_goal_qph` is a positive number.

Scope each goal where the runtime reads it:

- **Time-based goals** (`cayenne_goal_replication_lag`, `cayenne_goal_freshness`, `cayenne_goal_query_latency`) are set globally under `runtime.params` and may be overridden per-dataset under a dataset's `acceleration.params`.
- **`cayenne_goal_qph`** is **global-only**: query throughput is measured system-wide — a query spanning multiple datasets (such as a join) is counted once — so it is read only from `runtime.params`, and a value set under `acceleration.params` is ignored.
- **`cayenne_goal_convergence_window`** (duration, default `60s`) sets the time budget the controller targets for convergence. It is a per-dataset control-cadence knob (set under `acceleration.params`) and is not part of the global SLO surface.

Goal-seeking runs only where the closed loop runs, so it needs `cayenne_tuning: adaptive` on the dataset and — like `adaptive` itself — a non-zero `cayenne_compaction_background_interval_ms`. A goal the environment cannot meet is reported rather than chased indefinitely: `cayenne_goal_slo_infeasible` is `1` for a table whose configured SLO is out of reach within the tuner's bounds.

```yaml
runtime:
  params:
    # Global SLOs — apply to every Cayenne dataset that runs the closed loop
    cayenne_goal_replication_lag: 5s
    cayenne_goal_query_latency: 250ms
    cayenne_goal_qph: 5000 # global-only — no per-dataset form

datasets:
  - from: postgres:public.orders
    name: orders
    acceleration:
      engine: cayenne
      params:
        # Required — without it this table runs static `auto` and the goals are ignored
        cayenne_tuning: adaptive
        # Per-dataset override of the global query-latency SLO
        cayenne_goal_query_latency: 100ms
        cayenne_goal_convergence_window: 1m
```

## Cache Tuning

Spice Cayenne uses two in-memory caches to accelerate query performance:

**Footer Cache (`cayenne_footer_cache_mb`) — runtime parameter:**

The footer cache stores Vortex file metadata, including schemas, statistics, and encoding information. It is engine-global and shared across every Cayenne-accelerated dataset, so it is set under `runtime.params`, not per dataset. Larger cache sizes benefit workloads with many files.

- Default: unset — when omitted, DataFusion's default file-metadata-cache limit of 50 MB applies
- Increase for datasets with many small files
- Each file requires approximately 1-10 KB of footer cache

**Segment Cache (`cayenne_segment_cache_mb`) — runtime parameter:**

The segment cache stores decompressed data segments. One cache serves every Cayenne table in the process — dataset accelerations and `from: cayenne` catalogs alike — so it is set under `runtime.params`, not per dataset, and adding a table divides this budget instead of reserving another cache. A value set under a dataset's `acceleration.params` is reported at startup and otherwise ignored. Larger cache sizes benefit workloads with repeated queries on the same data.

- Default: unset — derived as ~1/64 of the process's memory entitlement, clamped to 256 MB–2 GB
- Takes a whole number of megabytes; `0` disables segment caching
- Increase for workloads with hot data patterns
- Size against the frequently accessed data volume across every Cayenne table, not one of them

The value of the segment cache scales with the latency of the storage beneath it. On local NVMe a miss costs a decompression and a fast read; on EBS or S3 Express it also costs a network round trip, so size the cache to the hot working set there. Measure the hit rate as `rate(cayenne_segment_cache_hits[5m]) / rate(cayenne_segment_cache_accesses[5m])` — see [Segment Cache Metrics](./deployment.md#segment-cache-metrics) — and grow the cache while the hit rate is low and the working set would fit.

**Example - High-throughput configuration:**

```yaml
runtime:
  params:
    # Engine-global caches, shared by all Cayenne datasets
    cayenne_footer_cache_mb: 512
    cayenne_segment_cache_mb: 1024

datasets:
  - from: s3://analytics-bucket/events/
    name: events
    acceleration:
      engine: cayenne
      mode: file
```

## Compression Strategy

Spice Cayenne supports two compression strategies, each with different performance characteristics. The [BtrBlocks](https://www.cs.cit.tum.de/fileadmin/w00cfj/dis/papers/btrblocks.pdf) compression algorithm is designed for fast analytical queries, while [zstd](https://facebook.github.io/zstd/) provides fast write performance. Additionally, `zstd` achieves better compression ratios when data contains large chunks of binary or text.

| Strategy    | Compression | Read Speed | Write Speed | Best For                                         |
| ----------- | ----------- | ---------- | ----------- | ------------------------------------------------ |
| `btrblocks` | Higher      | Faster     | Moderate    | Read-heavy analytics (default)                   |
| `zstd`      | High        | Moderate   | Faster      | Write-heavy workloads, large binary or text data |

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

Compression also decides how much the storage has to deliver: a `btrblocks` file is smaller on disk and, because Vortex evaluates predicates on compressed data, a selective query reads fewer bytes from it. On bandwidth-limited storage the default strategy is therefore also the faster one to read.

## Sorted Data and Segment Pruning

Cayenne needs no explicit indexes. Each Vortex segment carries `min`, `max`, `null_count`, `is_sorted`, and `is_constant` statistics per column, and a query prunes every segment whose range cannot match its predicate before reading it. How much a query prunes depends on the physical order of the data:

- **Set `sort_columns`** to the columns most queries filter on (a comma-separated list, e.g. `sort_columns: tenant_id,created_at`). Sorted data gives each segment a tight `min`/`max` range, so a selective predicate skips most of the table, and `is_sorted` lets a point lookup binary-search within a segment instead of scanning it. Fewer segments read also means fewer dependent I/Os, which is the cost that dominates on every tier slower than NVMe.
- **Provenance matters for CDC tables.** A sort order that [schema inference](../../data-connectors/index.md#schema-inference) filled in — the primary key, for most CDC datasets — is tagged `cayenne_sort_columns_origin: inferred` and ranks below the filter columns Cayenne observes on scans, so the adaptive layout clusters compacted and cold-tier files for the queries the table actually receives. An explicit `sort_columns` is authoritative and outranks the observations.
- **Partition where queries filter.** `partition_by` on the column(s) that dominate query filters prunes whole partitions at plan time (not supported in `mode: memory`).
- **Enable filter propagation** (`runtime.params.cayenne_filter_propagation: enabled`) when joins between Cayenne tables are common; the optimizer rules it gates propagate a filter on one side of a join to the other, so both scans prune.

```yaml
datasets:
  - from: s3://bucket/events/
    name: events
    time_column: created_at
    acceleration:
      engine: cayenne
      mode: file
      refresh_mode: append
      params:
        sort_columns: tenant_id,created_at
```

Sorting has a cost at write time — sorted refreshes and the sort-and-rewrite compaction path write serially — so it pays back on tables that are read far more often than they are written.

## Write Path Tuning

The write path is sized from the CPU entitlement and the storage tier and rarely needs adjusting. The knobs, and when they are worth setting:

| Parameter                         | Default                                                                                   | When to change it                                                                                                                                                             |
| --------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cayenne_write_concurrency`       | `auto` — up to `min(4, target_partitions)` files encoded in parallel per write             | Raise for a single large table that owns the host's cores and local NVMe; leave alone when many tables ingest concurrently, since a process-global encode budget bounds the aggregate anyway |
| `cayenne_upload_concurrency`      | `auto` — the CPU entitlement in whole cores                                               | Tune against S3 Express throughput; 8–16 parallel uploads usually saturate a same-AZ bucket                                                                                    |
| `cayenne_delta_encoding`          | `auto` — a light encoding level for every delta write                                     | Set `7` to encode deltas with the full cascade when deltas are long-lived on disk and storage is the constraint; deltas are otherwise re-encoded by compaction                  |
| `cayenne_compression_strategy`    | `btrblocks`                                                                               | `zstd` for write-heavy streams or large text/binary columns                                                                                                                    |
| `cayenne_pk_conflict_detection`   | `auto` — detect existing keys and resolve them as upserts                                 | `none` for append-only CDC streams whose source guarantees key uniqueness, to skip the per-batch keyset probe                                                                   |
| `cayenne_cdc_durability`          | `memory` — batches land in an in-RAM tier and are checkpointed periodically                | `file` to persist every CDC batch before acknowledging the source slot, at the cost of per-batch durability latency                                                             |
| `cayenne_cdc_mem_tier_max_bytes`  | ~1/64 of RAM, clamped to 256 MiB–1 GiB                                                     | Raise on a memory-rich host to absorb larger bursts before a checkpoint; lower when the data volume is slow, since the checkpoint writes there                                   |

On the slow storage tier the tuner already flushes larger inline batches and withholds write shards; explicitly pinning `cayenne_write_concurrency` there removes the encode-concurrency cap for that table. Watch `cayenne_write_phase_duration_ms` by `phase`: time in `vortex_write` is encoding and storage, time in `publish_*` is the metastore, and a growing `inmemory_budget_wait` means the process-wide in-memory tier budget is the constraint. See [Write & Compaction Metrics](./deployment.md#write--compaction-metrics).

## Compaction Tuning

Compaction consolidates the small files that appends and CDC produce into files near `cayenne_target_file_size_mb`, folds protected snapshots, and prunes deletion vectors. It runs inline on writes and, for tables that accumulate files, on a background task:

| Parameter                                         | Default                                                                                   | Effect                                                                                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `cayenne_compaction_background_interval_ms`       | `10000` for CDC-shaped tables (`changes`, `caching`, or `append` at ≤ 5m); `0` for `full`; `30000` otherwise | How often the background task checks the triggers; `0` disables it (inline compaction still runs)                              |
| `cayenne_compaction_trigger_files`                | `4` for CDC-shaped tables, `8` otherwise                                                   | Small files (below a quarter of the target size) in the current snapshot before tiered compaction runs                        |
| `cayenne_compaction_trigger_protected_snapshots`  | `4` / `8`                                                                                 | Protected snapshots before snapshot-maintenance compaction runs                                                              |
| `cayenne_compaction_trigger_snapshot_age_ms`      | `60000` / `300000`                                                                        | Age of the oldest protected snapshot before maintenance runs; `0` disables the age trigger                                    |
| `cayenne_compaction_max_levels`                   | `3`                                                                                       | Consecutive passes per trigger, bounding write amplification                                                                 |
| `cayenne_compaction_max_files_per_pick`           | `32`                                                                                      | Files rewritten per pass on tables eligible for subset compaction; the rest are carried forward by hardlink                  |
| `runtime.params.cayenne_compaction_memory_fraction` | `0.2`                                                                                     | Share of the query memory pool carved out for the dedicated compaction pool                                                  |

Compaction is where the storage tier shows most clearly. A pass reads a file set and writes a new one, so on a network volume it consumes the same bandwidth ingest and queries need; on the `ebs` tier Cayenne writes the output with `O_DIRECT` so the rewritten bytes do not evict hot query data from the page cache, and the tuner lengthens the compaction interval when the table is I/O-bound. Guidance:

- **Do not tighten the triggers on slow storage.** Fewer, larger passes amortize better than frequent small ones; if read amplification is the concern, raise `cayenne_target_file_size_mb` instead so each pass produces fewer files.
- **Keep the background task on** for `append` and `changes` tables. Disabling it leaves inline compaction only, and read amplification grows with the small-file count.
- **Watch the outcome counters.** `cayenne_compaction_trigger_total` says which threshold fired, `cayenne_compaction_outcome_total` says what happened, and `cayenne_compaction_memory_exhausted_total` says the compaction pool is too small — see [Maintenance Decision Metrics](./deployment.md#maintenance-decision-metrics).
- **Plan disk for the transient double copy.** A pass holds the old and the new copies of the files it rewrites until the new snapshot is published.

## File Size Tuning

The `cayenne_target_file_size_mb` parameter controls when new Vortex files are created during writes. It defaults to `auto`, which is storage-aware — 256 MB on local SSD and on EBS-class network storage, 64 MB on RAM-backed mounts, and 512 MB on S3 Express One Zone, where fewer, larger objects cut object count and per-request cost — and it also sets the size below which a file counts as "small" for the compaction trigger (a quarter of the target).

- **Smaller files (32-64 MB)**: Better parallelism, finer-grained statistics, faster ingestion
- **Larger files (128-512 MB)**: Fewer files to manage, reduced metadata and footer-cache overhead, fewer compaction passes

```yaml
params:
  cayenne_target_file_size_mb: 64  # More parallelism for high-concurrency workloads on local NVMe
```

Prefer the derived default on network storage: a smaller explicit value there multiplies both the metastore commits and the compaction passes the slow tier is trying to amortize.

## Memory

Cayenne query execution is DataFusion-native and bounded by `runtime.query.memory_limit`, with spill to `runtime.query.temp_directory`. Compaction runs on its own memory pool carved from the query pool, and CDC ingest stages batches in an in-memory tier sized from the memory left over after the pools. The interactions between these budgets — and why lowering the query limit on a CDC deployment can leave resident memory unchanged — are covered in [Managing Memory Usage](../../../reference/memory.md#spice-cayenne). The [Memory Reconciliation Metrics](./deployment.md#memory-reconciliation-metrics) attribute resident memory to each of them.

## Related Documentation

- [Spice Cayenne Data Accelerator](./index.md) - Parameter reference, S3 Express One Zone, cold tier, and deletion vectors
- [Cayenne Deployment Guide](./deployment.md) - Metastore durability, metrics, and troubleshooting
- [Performance Tuning](../../../reference/performance-tuning.md) - Cross-engine tuning, including the [Storage](../../../reference/performance-tuning.md#storage) guide
- [Managing Memory Usage](../../../reference/memory.md) - Memory partitioning and validation
- [Acceleration Snapshots](../../../features/data-acceleration/snapshots.md) - Fast cold starts on ephemeral NVMe
