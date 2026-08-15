---
title: 'Spice Cayenne Performance Tuning'
sidebar_label: 'Performance Tuning'
description: 'Tuning Spice Cayenne: self-tuning and goal-driven SLOs, cache sizing, compression strategy, and file-size tuning.'
sidebar_position: 5
pagination_prev: null
pagination_next: null
tags:
  - data-accelerators
  - cayenne
  - performance
---

Spice Cayenne performance can be optimized through cache configuration, compression strategy selection, and resource allocation. By default Cayenne is self-tuning — see [Self-Tuning](#self-tuning) — so manual tuning is only needed to override a specific knob.

## Self-Tuning

Cayenne sizes its memory-, CPU-, and storage-sensitive knobs automatically so it runs well on any host without hand-tuning, from a small container to a large multi-core box across different storage classes. Every numeric `cayenne_*` knob also accepts the literal `auto`, which lets the runtime derive that knob's value while leaving the rest of the configuration untouched.

The mode is controlled by the `cayenne_tuning` acceleration parameter:

- **`auto`** — derive the correct configuration values statically from the detected environment (cgroup-aware cores and memory, storage class) and the inferred schema (cardinality, row width, primary key). No feedback loop runs.
- **`adaptive`** (preview) — in addition to the static derivation, run a per-table closed-feedback controller that measures the live CDC ingest rate and the runtime's response (apply latency vs. offered load, read amplification, memory pressure) and adjusts the inline-memtable flush caps, compaction cadence/trigger, and write concurrency over time. Adjustments are bounded by the same environment-derived `[floor, ceiling]` the static tier uses, so the loop can only ever pick a value the static tier could have picked.

Environment detection feeds both modes. On AWS EC2, the runtime additionally probes the [Instance Metadata Service (IMDSv2)](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html) once at first table registration to detect T-family burstable CPU and the instance's EBS baseline bandwidth, and measures real storage write throughput with a cloud-agnostic calibration probe — both refine the environment-derived `[floor, ceiling]` bounds. The IMDS probe is non-blocking and fail-open: it uses a tight timeout and a single attempt, so off-AWS (or when the metadata service is unreachable) it is a fast no-op and detection falls back to the calibration probe alone. To skip the IMDS probe entirely, set `SPICE_DISABLE_IMDS=1` (the standard AWS `AWS_EC2_METADATA_DISABLED` environment variable is also honored).

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

Goal-seeking runs only where the closed loop runs, so it needs `cayenne_tuning: adaptive` on the dataset and — like `adaptive` itself — a non-zero `cayenne_compaction_background_interval_ms`.

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

## File Size Tuning

The `cayenne_target_file_size_mb` parameter controls when new Vortex files are created during writes:

- **Smaller files (32-64 MB)**: Better parallelism, finer-grained statistics, faster ingestion
- **Larger files (128-256 MB)**: Fewer files to manage, reduced metadata overhead

```yaml
params:
  cayenne_target_file_size_mb: 64  # More parallelism for high-concurrency workloads
```

