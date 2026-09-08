---
title: 'Managing Memory Usage'
sidebar_label: 'Memory'
sidebar_position: 32
description: 'Guidelines and best practices for managing memory usage and optimizing performance in Spice deployments.'
keywords:
  - memory
  - performance
  - cayenne
  - duckdb
  - tuning
pagination_prev: null
pagination_next: null
---

Effective memory management is essential for maintaining optimal performance and stability in Spice deployments. This guide outlines recommendations and best practices for managing memory usage across different [Data Accelerators](../components/data-accelerators).

## How Spice Uses Memory

Spice's memory footprint has two parts, and they behave differently:

```text
Total Memory = Baseline + Working Set
```

- **Baseline** — memory the runtime needs to operate at all: process overhead, per-dataset accelerator caches, results caches, task history, serialization buffers, and allocator arenas. It is driven by **how the deployment is configured** — dataset count above all — and by how much traffic it has served, rather than by how much data the datasets hold. It does not shrink when the data does.
- **Working Set** — memory that scales with the work: query execution, refreshes, and concurrency. This is the part bounded by [`runtime.query.memory_limit`](#memory-limit-configuration).

Two refinements matter when reading a memory graph or sizing from a measurement:

- **The baseline is mostly bounded buffers that grow toward their bounds with use, not memory claimed up front.** The SQLite metastore's page cache, gRPC and HTTP serialization buffers, and the accelerator caches all have ceilings, but they reach them only as traffic drives them there. The baseline is therefore the **converged** footprint under sustained load, not what the process holds at first startup — a freshly started runtime under-reports it, sometimes by a lot.
- **The working set scales with the data each query touches, not just with dataset size.** `SELECT 1` costs almost nothing, `SELECT *` materializes a result set, and a multi-way join with a sort can exceed the size of the data it reads. Whatever a single query costs is then multiplied by how many run concurrently.

Almost every surprising memory result comes from treating the total as a single quantity that scales with data volume. It does not. Sizing rules expressed as a multiple of dataset size — including the ones below — describe the **working set**, and apply on top of the baseline:

```text
Total Memory ≈ Baseline + (multiple × dataset size)
```

At production data volumes the working set dominates and the baseline is a rounding error. At small data volumes the reverse is true, which is why a deployment holding a few hundred megabytes of data can still need several gigabytes of RAM, and why cutting the data volume by 100x does not let you cut memory by 100x. See [Sizing a Non-Production Environment](#sizing-a-non-production-environment).

Because both terms understate themselves early — buffers have not yet grown, and a light query mix has not yet hit its peak — sizing from a short observation biases low in both directions at once. Size from a sustained run, and see [Validating a Memory Configuration](#validating-a-memory-configuration).

## General Memory Recommendations

Memory requirements vary based on workload characteristics, dataset sizes, query complexity, and refresh modes.

| Workload Type                            | Minimum RAM       | Notes                                                          |
| ---------------------------------------- | ----------------- | -------------------------------------------------------------- |
| Typical workloads                        | 8 GB              | Suitable for most development and small production deployments |
| Large datasets (`refresh_mode: full`)    | 2.5x dataset size | Requires memory for both old and new tables during refresh     |
| Large datasets (`refresh_mode: append`)  | 1.5x dataset size | Memory for incremental data only                               |
| Large datasets (`refresh_mode: changes`) | 1.5x dataset size | Depends on CDC event volume and frequency                      |

The multiples are working-set figures. Add them to the baseline rather than using them as the total, and treat the 8 GB row as a floor that applies regardless of how small the data is.

Memory requirements can be reduced by using file-based acceleration with [DuckDB](../components/data-accelerators/duckdb), [SQLite](../components/data-accelerators/sqlite), [Turso](../components/data-accelerators/turso), or [Spice Cayenne](../components/data-accelerators/cayenne), which store data on disk and support spilling.

:::tip[Datasets 10 GB or larger]

For any dataset of **10 GB or larger**, [Spice Cayenne](../components/data-accelerators/cayenne) is recommended over [DuckDB](../components/data-accelerators/duckdb), because of DuckDB's memory requirements. Cayenne typically needs **one-third to one-half** the memory of the DuckDB accelerator for the same dataset.

:::

### What Makes Up the Baseline

The baseline is the sum of a fixed process cost and a per-dataset cost. The per-dataset allocations are sized as a fraction of total memory but **clamped to a floor**, so they stop shrinking once the environment is small:

| Allocation                    | Applies to                                  | Default size                                              |
| ----------------------------- | ------------------------------------------- | --------------------------------------------------------- |
| Runtime process overhead      | Always                                      | ~500 MB                                                    |
| Cayenne segment cache         | The process, once, when any Cayenne table exists | 1/64 of total memory, clamped to 256 MB–2 GB          |
| Cayenne PK keyset cache       | Each Cayenne CDC/upsert dataset             | 1/32 of total memory, clamped to 256 MiB–8 GiB, and additionally bounded by a process-wide ceiling across all datasets |
| CDC coalesce buffer           | Each CDC dataset                            | 128 MiB (`cdc_max_coalesced_bytes`)                        |
| Results caches                | Runtime                                     | 128 MiB each for SQL, search, and embedding results        |
| Task history                  | Runtime (enabled by default)                | No byte cap — bounded by time instead; scales with task rate × `retention_period` (8h) |
| Metastore and protocol buffers | Runtime                                    | Bounded, but reached only under sustained traffic          |

The last two rows are the ones that make a short measurement misleading. **Task history is an in-memory accelerated table**, so its footprint is a product of how many tasks the deployment completes and how long records are kept, rather than a fixed allocation — a high-throughput deployment accumulates far more than a quiet one at the same configuration. Setting `captured_plan` or `captured_output` increases the size of every record substantially.

```yaml
runtime:
  task_history:
    retention_period: 1h # default 8h; the main lever on its footprint
    captured_plan: none  # capturing plans materially increases per-record size
```

Prefer shortening `retention_period` to disabling task history outright — it backs `runtime.task_history`, which is the primary tool for diagnosing the very problems this page describes. Disable it only if the deployment is memory-critical and its diagnostics are served another way.

Two consequences follow:

- **The baseline scales with dataset count — through the write path, not the read path.** Ten CDC-accelerated Cayenne datasets reserve 1.25 GB of CDC coalesce buffer between them, plus a PK keyset cache each, whether each dataset holds a gigabyte or a megabyte. The segment cache is the exception: it is one process-wide budget counted once, so an eleventh dataset divides the pool rather than adding to it.
- **The baseline is a larger share of a smaller container.** The per-dataset floors are absolute, so halving the container's memory does not halve the baseline — it raises the baseline's share of the total.

The runtime accounts for this when deriving its own defaults: the query memory limit is reduced by the per-dataset reservations so the pools plus the caches fit within the memory the process may use. Explicitly configured limits are honored as-is and are **not** reduced, so a hand-set `runtime.query.memory_limit` is the one case where the total can be over-committed. Per-dataset caps sized in isolation still add up, and the aggregate is what the kernel makes its OOM decision on.

#### Accelerated catalogs

An [accelerated catalog](./spicepod/catalogs#acceleration) creates a Cayenne table for every table it discovers, so each of those tables carries the same per-table allocations as one configured by hand. Two properties follow from the catalog being configuration rather than an enumeration:

- **The projected reservation counts one table's worth per catalog, not one per discovered table.** How many tables a catalog will accelerate is not knowable before the connector connects, so the projection the runtime derives its defaults from is a **floor** — it leaves the query pool larger than the discovered tables warrant. Size a catalog-backed deployment from the table count you expect it to discover rather than from the projection.
- **A catalog always reaches the in-memory CDC tier.** `changes` is the only refresh mode catalog acceleration accepts, so a Spicepod whose only Cayenne acceleration is a catalog gets the reduced query pool and the compaction carve described in [How the Runtime Partitions Memory](#how-the-runtime-partitions-memory), exactly as a CDC-accelerated dataset does.

## Sizing a Non-Production Environment

A common approach to staging is to take the production configuration and scale every number down by the ratio of data volume — a tenth of the data, a tenth of the memory. Because the baseline does not scale down with it, this does not produce a smaller model of production. It produces a **different regime**, in which the baseline dominates, the working set is squeezed into whatever is left, and behavior no longer predicts what production will do.

Consider a Spicepod with five CDC-accelerated Cayenne datasets, deployed at two container sizes. Shrinking the container by 8× does not shrink the baseline by 8×: the allocations that are already at their floor in the small container — the PK keyset cache, the flat CDC coalesce buffer, and the process-wide segment cache — cannot get any smaller, so the baseline's *share* is what moves:

| Container memory | Baseline (overhead + 5 datasets) | Baseline share | Left for the working set |
| ---------------- | -------------------------------- | -------------- | ------------------------ |
| 4 GiB            | ~2.6 GB                          | ~65%           | ~1.4 GB                  |
| 32 GiB           | ~6.9 GB                          | ~22%           | ~25 GB                   |

The same Spicepod is memory-bound in the first row and comfortable in the second. Nothing about the first row's behavior — its headroom, its spill frequency, its latency profile — carries over to the second.

**Guidance for lower environments:**

- **Scale the working set, not the baseline.** Reduce data volume and concurrency; keep the dataset count and the accelerator configuration the same.
- **Do not copy limit ratios between environments.** Whatever fraction of the container `runtime.query.memory_limit` occupies in a small environment, the correct production value is a *larger* fraction, not the same one — the baseline it has to leave room for stays roughly constant while the container grows around it. Derive each environment's limit from its own baseline rather than carrying a percentage across.
- **Reduce dataset count if you must run small.** Removing datasets lowers the baseline; shrinking their contents does not.
- **Treat a configuration tuned to fit an undersized environment as disposable.** Lowering per-dataset caches and buffers to fit a container that is smaller than the runtime's floors will make it run, but it tunes for a regime you will not operate in, and the values do not transfer to production.

:::warning[Costs of tuning below the defaults]

The default cache and buffer sizes are the sizes the rest of the system is tuned against. Lowering them to fit a constrained environment is supported, but expect higher and less predictable query latency, more frequent spilling, and performance characteristics that will not match production. Prefer validating at a representative size — see [Validating a Memory Configuration](#validating-a-memory-configuration).

:::

## Accelerator-Specific Memory Management

Different acceleration engines have distinct memory characteristics and tuning options.

### Arrow (In-Memory)

The default Arrow accelerator stores all data in memory uncompressed. Datasets must fit entirely in available RAM.

- Data is stored uncompressed in Apache Arrow format
- No configuration options for memory limits
- Best for smaller datasets requiring maximum query speed
- Consider switching to file-based accelerators for datasets exceeding available memory

**Hash Index Memory (Experimental, v1.11.0-rc.2+):**

When using the optional [hash index](../features/data-acceleration/hash-index), additional memory is required:

| Component    | Memory per Row |
| ------------ | -------------- |
| Hash slot    | 16 bytes       |
| Bloom filter | ~1.25 bytes    |
| **Total**    | ~17.25 bytes   |

For a 10 million row dataset with hash index enabled, expect ~165 MB additional memory overhead.

### Spice Cayenne

[Spice Cayenne](../components/data-accelerators/cayenne) stores data on disk using the [Vortex](https://github.com/vortex-data/vortex) columnar format, with configurable caches for metadata and frequently accessed data segments. The caches can be configured to reside either in memory or on disk, which impacts overall memory behavior.

Spice Cayenne is DataFusion query-native, meaning all query execution adheres to the `runtime.query.memory_limit` setting. When query memory is exhausted, DataFusion spills intermediate results to disk. This architecture provides predictable memory usage while maintaining high query performance.

**Memory Configuration Parameters:**

| Parameter                  | Scope                  | Default | Description                                                                                                                                  |
| -------------------------- | ---------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `cayenne_footer_cache_mb`  | `runtime.params`       | `50` (unset) | Size of the engine-global in-memory Vortex footer cache in megabytes, shared by all Cayenne datasets. Larger values improve query performance for repeated scans by caching file metadata. Optional; when unset, DataFusion's default file-metadata-cache limit of 50 MB applies. |
| `cayenne_segment_cache_mb` | `runtime.params`       | derived | Total size of the process-wide in-memory Vortex segment cache in megabytes, shared by every Cayenne table. Caches decompressed data segments for improved query performance. When unset, derived as 1/64 of total memory, clamped to 256 MB–2 GB; `0` disables it. A value set under a dataset's `acceleration.params` is reported at startup and otherwise ignored. |

**Memory Usage Guidelines:**

- Base memory: ~500 MB for runtime overhead
- Footer cache: unset by default (DataFusion's 50 MB file-metadata-cache limit applies); increase for datasets with many files
- Segment cache: auto-derived once for the process with a 256 MB floor; increase for workloads with repeated scans on the same data
- Query execution memory: Depends on query complexity and concurrency

The segment cache is allocated **once for the whole process**, not per dataset: one cache serves every Cayenne table, keyed by store, file, and segment, so adding a table divides the budget rather than reserving another cache of its own. Count it once when sizing — see [What Makes Up the Baseline](#what-makes-up-the-baseline). Its floor does not scale down with the container, and it is reserved only when the pod has at least one Cayenne table to read through it.

**Example Configuration:**

```yaml
runtime:
  params:
    # Engine-global caches (shared by all Cayenne datasets)
    cayenne_footer_cache_mb: 256
    cayenne_segment_cache_mb: 512

datasets:
  - from: s3://my-bucket/large-dataset/
    name: large_dataset
    acceleration:
      engine: cayenne
      mode: file
```

### DuckDB

[DuckDB](../components/data-accelerators/duckdb) manages memory through streaming execution, intermediate spilling, and buffer management. Left to itself, each DuckDB instance sizes its own limit at roughly 80% of host memory.

**Memory Configuration Parameters:**

| Parameter             | Default                                       | Description                            |
| --------------------- | --------------------------------------------- | -------------------------------------- |
| `duckdb_memory_limit` | A coordinated share of the query memory budget | Maximum memory for the DuckDB instance |

When `duckdb_memory_limit` is not set, Spice does not leave the instance on DuckDB's own ~80%-of-host-RAM default. At startup it computes a [coordinated memory budget](../components/data-accelerators/duckdb#coordinated-memory-budget) across the query pool and every DuckDB instance so their combined ceilings fit within the memory the process can use, capping each un-limited instance at an equal share and reducing the query pool to match. Explicit `duckdb_memory_limit` and `runtime.query.memory_limit` values are always honored as-is.

**Memory Usage Guidelines:**

- For datasets of **10 GB or larger**, prefer [Spice Cayenne](#spice-cayenne), which typically needs one-third to one-half the memory of DuckDB for the same dataset
- Set `duckdb_memory_limit` to control memory per DuckDB instance, rather than relying on the automatic split
- DuckDB indexes do not support spilling and may consume significant memory
- Allocate at least 30% additional container/machine memory for the runtime process

**Example Configuration:**

```yaml
datasets:
  - from: postgres:analytics.orders
    name: orders
    acceleration:
      engine: duckdb
      mode: file
      params:
        duckdb_memory_limit: 4GB
```

### SQLite

[SQLite](../components/data-accelerators/sqlite) is lightweight and efficient for smaller datasets but does not support intermediate spilling. Datasets must fit in memory or use application-level paging.

## Refresh Modes and Memory Implications

Refresh modes affect memory usage as follows:

| Refresh Mode | Memory Behavior                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `full`       | Temporarily loads data into a new table before replacing the existing table (atomic swap). Requires memory for both tables simultaneously. |
| `append`     | Incrementally inserts or upserts data, using memory only for the incremental batch.                                                        |
| `changes`    | Applies CDC events incrementally. Memory usage depends on event volume and frequency.                                                      |
| `caching`    | Caches query results on disk. Memory usage is limited to active queries and cache metadata.                                                |

## DataFusion Query Memory Management

Spice uses DataFusion as its query execution engine. By default, Spice limits query engine memory to **90% of the memory the process may use** (its cgroup memory limit when one binds — a container, a `systemd` unit's `MemoryMax=`, a capped parent slice, or a Kubernetes pod cgroup — otherwise total system memory; reduced to **70%** when Cayenne's in-memory CDC tier is reachable, to leave headroom for Cayenne's compaction memory pool and that tier). Either base is then reduced by the per-dataset cache reservations and floored at 50% — see [How the Runtime Partitions Memory](#how-the-runtime-partitions-memory). This can be tuned through the `runtime.query.memory_limit` configuration.

### Memory Limit Configuration

The `runtime.query.memory_limit` parameter defines the maximum memory available for query execution. If not specified, it defaults to 90% of the memory the process may use — its cgroup memory limit when one binds, otherwise total system memory (70% when Cayenne's in-memory CDC tier is reachable), less the per-dataset cache reservations and floored at 50%. Once the memory limit is reached, supported query operations spill data to disk.

```yaml
runtime:
  query:
    memory_limit: 4GiB
    temp_directory: /tmp/spice  # Directory for spill files
```

Spice uses [Apache DataFusion](https://datafusion.apache.org/) as its query execution engine, which provides vectorized, multi-threaded query execution with automatic memory management. DataFusion's [GreedyMemoryPool](https://docs.rs/datafusion/latest/datafusion/execution/memory_pool/struct.GreedyMemoryPool.html) allows memory reservations on a first-come, first-served basis up to the configured limit, improving throughput for high-concurrency queries with many partitions.

### How the Runtime Partitions Memory

When the limit is left unset, the runtime divides the memory the process may use into a partition that is designed to sum to 100%. Which partition applies depends on whether Cayenne's in-memory CDC tier is reachable — which the runtime decides from every Cayenne acceleration the Spicepod declares, on a dataset, a view, or a [catalog](./spicepod/catalogs#acceleration):

| Slice                             | Standard deployment | Cayenne CDC active |
| --------------------------------- | ------------------- | ------------------ |
| Query memory pool                 | 90%                 | 70% base, less the compaction carve |
| Compaction memory pool            | —                   | Carved from the query pool (20% of it by default) |
| In-memory CDC tier                | —                   | 20%, clamped to between 1/32 and 1/5 of memory |
| Headroom for off-pool allocations | 10%                 | 10%                |

The headroom slice is what covers the per-dataset caches, encode buffers, and allocator overhead described below. When the projected per-dataset reservations exceed that headroom, the excess is carved out of the query pool so the total still fits — which is why the effective query pool on a dataset-heavy Spicepod is smaller than the headline percentage. The query pool is never reduced below **50%** of available memory; when that floor binds and the caches still do not fit, the runtime warns at startup that the configuration is unfittable (see [Check the Startup Budget Warnings First](#check-the-startup-budget-warnings-first)).

### Tuning the Memory Limit Safely

`runtime.query.memory_limit` is bounded on both sides when Cayenne CDC ingestion is active, and both failure modes are counterintuitive:

- **Setting it too low does not necessarily reduce resident memory.** The in-memory CDC tier is sized from the memory left over after the pools, so lowering the query pool hands that memory to the tier, which may float up to a quarter of total memory to reclaim it. The memory moves rather than being released. On a deployment being throttled to reduce its footprint, this is the most common reason the graph does not come down.
- **Setting it too high starves CDC ingestion.** A greedy explicit limit can squeeze the tier's remainder below its floor, at which point the tier degrades to a refuse-all state and ingestion falls back to its disk-based path. The runtime warns when this happens.

Both are consequences of the partition being coordinated. The practical guidance is to **leave `runtime.query.memory_limit` unset and size the container instead**, which lets the runtime derive every slice together. Set it explicitly only when a co-resident accelerator manages its own pool, and treat the value as one input to a partition rather than as a ceiling on the process.

### What the Memory Limit Does Not Cover

`runtime.query.memory_limit` bounds the query execution pool. It is not a ceiling on the process. Memory allocated outside that pool includes:

- Per-dataset accelerator caches (see [What Makes Up the Baseline](#what-makes-up-the-baseline))
- Serialization and encode buffers for query results, Arrow IPC, and Flight responses
- Embedded engine internals that manage their own memory, such as DuckDB's pool and SQLite's page cache
- Results, search, and embedding caches
- Allocator retention — pages the process has freed but not returned to the operating system

The gap between the query limit and the container's memory limit is the headroom that absorbs all of the above. The defaults reserve 10% of the memory the process may use, or 30% when Cayenne acceleration is active. **That reservation is a percentage, but what it has to cover is largely fixed**, so it gets tighter as the container gets smaller: 10% of a 4 GiB container is roughly 400 MB of headroom for buffers and caches whose own floors do not shrink with it.

This is the usual reason a container is OOM-killed despite having a memory limit configured. Two corollaries:

- **Lowering `runtime.query.memory_limit` does not reduce off-pool memory.** It shrinks the part that was already bounded and was probably not the cause. If the process is killed while the pool gauges show plenty of unused reservation, the memory is off-pool and a lower limit will not recover it.
- **Explicit limits are not reduced for you.** When the limit is left unset the runtime derives it with the per-dataset reservations already subtracted. Setting it explicitly opts out of that arithmetic, so an explicit value must leave room for the baseline itself. When an explicit limit is set alongside Cayenne acceleration, the runtime logs the projected off-pool reservation at startup (`Explicit query memory limit set; the projected per-table Cayenne cache reservation is OFF-pool and unaffected by this limit`) — check it against the container's memory limit.

### Spill-to-Disk

Operators such as Sort, Join, and GroupByHash spill intermediate results to disk when memory limits are exceeded, preventing out-of-memory errors. DataFusion writes spill files using the [Arrow IPC Stream format](https://arrow.apache.org/docs/format/Columnar.html#ipc-streaming-format).

**Spill Compression:**

The `runtime.query.spill_compression` parameter controls how spill files are compressed:

| Value            | Description                                    |
| ---------------- | ---------------------------------------------- |
| `zstd` (default) | High compression ratio, reduces disk usage     |
| `lz4_frame`      | Faster compression/decompression, larger files |
| `uncompressed`   | No compression overhead, largest files         |

```yaml
runtime:
  query:
    memory_limit: 4GiB
    spill_compression: lz4_frame
```

### Spill Limitations

DataFusion supports spilling for several operators, but the following operations do not currently support spilling:

- HashJoin ([tracking issue](https://github.com/apache/datafusion/issues/12952))
- ExternalSorterMerge
- RepartitionMerge

Queries using these operators that exceed memory limits may fail. Monitor query patterns and allocate sufficient memory for workloads that rely on these operators.

### How a Memory Refusal Surfaces

When the query memory pool cannot satisfy a reservation, the query is refused rather than the process being allowed to grow past `runtime.query.memory_limit`. The refusal is reported as a capacity condition, not a client error, so retry middleware and load balancers can treat it as retriable:

| Surface | Reported as |
| ------- | ----------- |
| HTTP (`/v1/sql`) | `503 Service Unavailable`, with the pool's message (including its top memory consumers) as the response body. Earlier releases answered this condition with `400 Bad Request`. |
| Flight and Flight SQL | gRPC status `RESOURCE_EXHAUSTED` |
| `query_failures` metric | `err_code="ResourcesExhausted"` |
| Runtime log | Logged at `warn` level (`Query refused, out of memory: …`), so a runtime refusing queries is visible at the default `INFO` verbosity |

A sustained rate of these means the deployment needs more memory, fewer concurrent queries, or fewer partitions — not that the client's SQL is malformed. Note that `/health` is served by a separate Tokio runtime and stays green while queries are being refused, so alert on `query_failures{err_code="ResourcesExhausted"}` rather than relying on health checks.

### Bounding Peak Memory with Concurrency

Concurrency is the multiplier on the working set: each executing plan holds its own reservations, so peak memory scales with how many run at once. Two settings control this, and **both derive their defaults from the CPU entitlement rather than from memory**:

| Setting                                | Default                                     | Effect on memory                                          |
| -------------------------------------- | ------------------------------------------- | ---------------------------------------------------------- |
| `runtime.query.max_concurrent_queries` | 4 × the CPU entitlement's cores             | Caps how many plans execute at once; excess queries wait   |
| `runtime.query.target_partitions`      | The CPU entitlement's cores                 | Caps per-plan fan-out and its per-partition reservations   |

Because the defaults follow CPU, a pod that is CPU-rich and memory-poor admits far more concurrent work than its memory can support. A pod sized for 8 cores admits 32 concurrent queries by default; one running [`runtime.cpu.cores: all`](./spicepod/runtime#runtimecpucores) on a large node admits proportionally more. Neither default consults `runtime.query.memory_limit`.

```yaml
runtime:
  query:
    max_concurrent_queries: 8 # bound admission by memory, not by core count
```

Lowering `max_concurrent_queries` reduces peak **memory** and converts what would have been capacity refusals into queueing. The trade-off is that peak **query time** rises: excess queries now wait for admission, and that wait counts toward end-to-end duration. Measure total query duration rather than execution time alone when tuning it.

It is still usually the better first move than lowering `runtime.query.memory_limit`, which shrinks the pool available to each query without reducing how many run — and which, on a CDC deployment, may not reduce resident memory at all (see [Tuning the Memory Limit Safely](#tuning-the-memory-limit-safely)).

When load testing, note that **peak concurrency, not average throughput, sets the peak memory** — a test that averages the target rate but never bursts will under-report the peak.

### Client-Side Resiliency

No memory configuration produces a zero-failure system, and sizing for one is not the goal. In any distributed deployment a query can fail for reasons unrelated to how Spice is tuned — an instance is evicted or preempted, a node is reclaimed, a rolling upgrade replaces a pod, a network path drops. Clients need an error budget and a retry path regardless of memory sizing.

Recommended client behavior:

- **Retry a failed query against the cluster before treating it as an outage.** With more than one instance behind a load balancer, a retry usually lands on a healthy instance. Capacity refusals (`503` / `RESOURCE_EXHAUSTED`) and connection failures are both retriable.
- **Bound the retry.** One or two attempts with a short backoff is normally enough; unbounded retries turn a capacity problem into an outage by adding load to a runtime that is already refusing work.
- **Set an explicit client timeout** so a slow query cannot consume the caller's own request budget.
- **Fall back to the underlying data source last, not first.** Where a fallback path to the source of truth exists, place it after the in-cluster retry, so a single unhealthy instance does not divert all traffic away from the accelerated path.
- **Consider a circuit breaker for sustained failure.** Retries handle isolated failures; they make a sustained one worse. After a threshold of consecutive failures, stop sending traffic for a cooldown, then probe with a fraction of it and restore full load only once the probes succeed. This is usually best implemented at the load balancer or service mesh rather than in each client, so the decision is shared across callers instead of being re-learned by each one.

Distinguish the two cases when alerting: an isolated failure that a retry resolves is expected operational noise, while a sustained rate of capacity refusals is a sizing signal — see the metric guidance above.

## Predicate Pushdown and Memory Reduction

Predicate pushdown reduces memory consumption by filtering data early in the query execution pipeline. Rather than reading all data and filtering afterward, Spice pushes filter predicates to the data source, reducing the volume of data materialized in memory.

### How Pushdown Reduces Memory

| Stage            | Without Pushdown | With Pushdown      |
| ---------------- | ---------------- | ------------------ |
| Read from source | All rows         | Matching rows only |
| Decompress       | Full row groups  | Pruned row groups  |
| Materialize      | Entire dataset   | Filtered subset    |
| Process          | Full scan        | Reduced scan       |

For a query selecting 1% of rows from a 100 GB dataset, pushdown can reduce peak memory from tens of gigabytes to hundreds of megabytes.

### Pushdown Techniques by Format

**Parquet and Parquet-backed sources (Iceberg, Delta Lake):**

- **Row group pruning**: Skips entire row groups (typically 128 MB) based on min/max statistics
- **Page Index**: Skips individual pages (typically 8 KB) within row groups
- **Bloom filters**: Skips row groups for equality predicates
- **Late materialization**: Filters during decoding, reducing columns materialized

**Vortex (Spice Cayenne):**

- **Segment pruning**: Skips segments based on per-segment min/max statistics
- **Compute push-down**: Evaluates predicates on compressed data, reducing decompression overhead

### Configuration for Memory Efficiency

For memory-constrained environments, set an appropriate memory limit and use file-based acceleration:

```yaml
runtime:
  query:
    memory_limit: 2GiB

datasets:
  - from: s3://bucket/data/
    name: filtered_data
    acceleration:
      engine: cayenne  # Segment pruning + compute push-down
      mode: file
```

Sorting data by frequently filtered columns maximizes pushdown effectiveness. When data is sorted, entire segments or row groups have non-overlapping value ranges, enabling efficient pruning.

### Memory Impact of Data Layout

| Data Layout             | Pushdown Effectiveness | Memory Impact      |
| ----------------------- | ---------------------- | ------------------ |
| Sorted by filter column | Excellent              | Minimal data read  |
| Clustered (Z-ordered)   | Good                   | Moderate data read |
| Random                  | Limited                | Most data read     |

For time-series data, sort by timestamp. For multi-tenant data, consider sorting by tenant_id or clustering by (tenant_id, timestamp).

## Embedded Data Accelerator Comparison

| Accelerator   | Storage        | Query Memory Control         | Memory Spilling | Best For                                  |
| ------------- | -------------- | ---------------------------- | --------------- | ----------------------------------------- |
| Arrow         | Memory only    | `runtime.query.memory_limit` | Yes             | Small datasets, maximum speed             |
| Spice Cayenne | Disk (Vortex)  | `runtime.query.memory_limit` | Yes             | Datasets 10 GB and above, scalable analytics; lowest memory footprint |
| DuckDB        | Memory or Disk | `duckdb_memory_limit`        | Yes             | Datasets under 10 GB, complex queries     |
| SQLite        | Memory or Disk | None                         | No              | Small-medium datasets, simple queries     |

Spice Cayenne and Arrow both use DataFusion as the query execution engine and share the same `runtime.query.memory_limit` configuration. DuckDB manages its own memory pool separately via the `duckdb_memory_limit` parameter — though when that parameter is unset, the runtime sizes the two together rather than independently (see [Coordinated memory budget](../components/data-accelerators/duckdb#coordinated-memory-budget)).

## Memory Allocators

The Spice runtime supports multiple memory allocators that affect how the process allocates and frees memory at the system level. The choice of allocator can significantly impact performance depending on workload characteristics such as concurrency, allocation size distribution, and fragmentation behavior.

| Allocator             | Description                                                  | Best For                                      |
| --------------------- | ------------------------------------------------------------ | --------------------------------------------- |
| snmalloc (default)    | Optimized for concurrent workloads with low fragmentation    | General-purpose, high-concurrency deployments |
| jemalloc              | Mature allocator with strong profiling support               | Workloads with varied allocation patterns     |
| mimalloc              | Microsoft's allocator, designed for performance and security | Performance-sensitive deployments             |
| System (glibc malloc) | Uses the OS default allocator                                | Compatibility testing, debugging              |

The default distribution uses snmalloc. Alternative allocators are available as separate [distribution variants](./distributions#allocator-variants), each published as a distinct Docker image tag.

:::note
Allocator variants are available with the [Spice Cloud Platform and Spice.ai Enterprise](https://spice.ai/pricing). Open source users can build locally for development and testing.
:::

The memory allocator operates independently from the query memory management described above. `runtime.query.memory_limit` controls DataFusion's query execution memory pool, while the allocator determines how the runtime process itself requests and releases memory from the operating system.

## Results Cache Memory

Spice maintains in-memory caches for SQL query results, search results, and embeddings. These caches consume memory in addition to accelerator and query execution memory.

### Cache Memory Configuration

| Cache Type       | Default Max Size | Description                                |
| ---------------- | ---------------- | ------------------------------------------ |
| `sql_results`    | 128 MiB          | Caches SQL query results                   |
| `search_results` | 128 MiB          | Caches vector and full-text search results |
| `embeddings`     | 128 MiB          | Caches embedding model responses           |

**Example Configuration:**

```yaml
runtime:
  caching:
    sql_results:
      enabled: true
      max_size: 512MiB
      item_ttl: 5m
      eviction_policy: tiny_lfu
    search_results:
      enabled: true
      max_size: 256MiB
      item_ttl: 1m
    embeddings:
      enabled: true
      max_size: 256MiB
      item_ttl: 10m
```

### Cache Eviction Policies

| Policy          | Description              | Performance                                 |
| --------------- | ------------------------ | ------------------------------------------- |
| `lru` (default) | Least Recently Used      | Good general-purpose hit rates              |
| `tiny_lfu`      | TinyLFU admission policy | Higher hit rates for skewed access patterns |

TinyLFU maintains frequency information to admit only items likely to be accessed again, resulting in higher hit rates for workloads with varying query frequency patterns.

### Cache Memory Impact

When sizing memory, account for cache allocations:

```text
Total Memory = Runtime Overhead + (Per-Dataset Accelerator Caches × dataset count) + Query Memory Limit + Cache Memory
```

**Example calculation** — four Cayenne-accelerated datasets, none using CDC:

- Runtime overhead: 500 MB
- Footer cache: 50 MB (engine-global, shared by all Cayenne datasets)
- Segment caches: 1 GB (256 MB × 4 datasets — per-dataset, not shared)
- Results caches: 1 GB (512 MB SQL + 256 MB search + 256 MB embeddings)
- Query memory limit: 4 GB
- **Total: ~6.5 GB minimum**

Everything above the query memory limit in that list is baseline, and it grows with the dataset count. Adding four more datasets adds roughly another 1 GB before a single query runs. Datasets using `refresh_mode: changes` add a PK keyset cache and a coalesce buffer on top of this — see [What Makes Up the Baseline](#what-makes-up-the-baseline).

:::warning[This is a planning floor, not a prediction]

A calculation like this sums the allocations that can be named and sized in advance, so it **under-estimates actual usage** and should never be used as the container's memory limit. It omits the buffers that grow with traffic, task history's throughput-dependent growth, allocator retention and fragmentation, and any transient peak above the steady state. The query memory limit in particular is a *ceiling* on the pool, not a reservation — actual usage moves within it.

Treat the result as the minimum below which the deployment certainly will not fit, add headroom, and then replace the estimate with a measurement from a sustained representative run. See [Validating a Memory Configuration](#validating-a-memory-configuration).

:::

### Cache Performance Considerations

- Larger `max_size` values improve hit rates but consume more memory
- Shorter `item_ttl` values reduce memory usage but may decrease hit rates
- Use `stale_while_revalidate_ttl` to serve stale results while refreshing in the background
- Monitor cache hit rates via [observability metrics](../features/observability) to tune configuration

See [Caching](../features/caching) for complete cache configuration options.

## Kubernetes Memory Configuration

Configure memory requests and limits in Kubernetes pod specifications based on expected workload:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: spice-pod
spec:
  containers:
    - name: spice
      image: spiceai/spiceai:latest
      resources:
        requests:
          memory: '8Gi'
          cpu: '4'
        limits:
          memory: '16Gi'  # Set higher than request for burst capacity
          # Do not set CPU limits - can cause throttling
```

**Recommendations:**

- Set memory requests to at least 1.3x the configured `runtime.query.memory_limit` plus accelerator cache sizes, counting the per-dataset caches once **per dataset**
- Set memory limits higher than requests to handle temporary spikes
- Avoid setting CPU limits, as they can cause [throttling](https://home.robusta.dev/blog/stop-using-cpu-limits) even when CPU is available
- Monitor actual usage with observability tools and adjust accordingly
- Prefer leaving `runtime.query.memory_limit` unset so the runtime derives it from the pod's cgroup limit with the per-dataset reservations subtracted; set it explicitly only when co-locating accelerators that manage their own pools

The pod's memory limit is what the kernel enforces, so it must cover the baseline and the query pool together. A pod whose `runtime.query.memory_limit` was chosen without accounting for the per-dataset baseline will be OOM-killed while the query pool still reports unused capacity.

## Monitoring and Profiling

Use observability tools to monitor and profile memory usage regularly. Spice exposes metrics for:

- Query execution memory usage
- Accelerator cache hit rates
- Data refresh memory consumption

The following gauges are sampled every 2 seconds and can be read together to reconcile the memory budgets against actual process memory:

| Metric | Description |
| ------ | ----------- |
| `query_memory_pool_used_bytes` | Live bytes reserved in the query memory pool (`runtime.query.memory_limit`), excluding the in-memory CDC tier's mirror account. |
| `cayenne_compaction_memory_pool_used_bytes` | Live bytes reserved in the dedicated [Spice Cayenne](../components/data-accelerators/cayenne) compaction memory pool. |
| `process_resident_memory_bytes` | Total resident set size of the `spiced` process. |
| `process_resident_anon_bytes` | The anonymous half: heap and stacks, which the kernel cannot reclaim. |
| `process_resident_file_bytes` | The file-backed half: mapped files and page cache the kernel evicts on demand. |

The pool gauges describe what the memory accounting believes is reserved; the resident gauges describe what the process actually holds. Take the gap against `process_resident_anon_bytes`, since the total also counts reclaimable page cache. A large and growing gap is off-pool memory that `runtime.query.memory_limit` does not bound — lowering the query memory limit will not shrink it.

For container capacity planning use the kubelet's `container_memory_working_set_bytes`. For per-structure attribution within Cayenne, see [Memory Reconciliation Metrics](../components/data-accelerators/cayenne/deployment#memory-reconciliation-metrics).

See [Observability](../features/observability) for configuration details.

### Reading a Memory Graph

Resident memory that climbs and then stays high is the expected shape, not a leak. Caches fill toward their configured ceilings and are not evicted until they are full, buffers are retained rather than reallocated because reallocation is expensive, and memory allocators keep freed pages mapped instead of returning them to the operating system. **Memory returning to its startup value is not a goal, and a flat high plateau is not evidence of a problem.**

The last of those is a documented property of the allocators themselves, not a Spice-specific behavior. [jemalloc](https://jemalloc.net/jemalloc.3.html) retains freed pages and returns them only on a decay schedule (`dirty_decay_ms`, `muzzy_decay_ms`). glibc's allocator returns memory to the OS only when the free block at the top of the heap exceeds [`M_TRIM_THRESHOLD`](https://man7.org/linux/man-pages/man3/mallopt.3.html), so freed memory in the middle of the heap stays resident by design. Resident set size is consequently an upper bound on what the process is actively using — and, per the [cgroup v2 documentation](https://docs.kernel.org/admin-guide/cgroup-v2.html#memory-interface-files), it is nonetheless what the kernel charges against `memory.max` when deciding whether to OOM-kill.

What matters is *where* it plateaus and *whether* it plateaus:

| Observed shape                                                     | Interpretation                                                                                        |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Rises, then flat well below the container limit                     | Healthy. Caches are warm and the deployment has headroom.                                              |
| Rises, then flat just under the container limit                     | Sized too tightly. Working normally, but with no margin for a spike — the next burst is an OOM kill.    |
| Rises steadily under constant load and never flattens               | Investigate. Compare against the pool gauges to determine whether the growth is inside or outside the pools. |
| Flat, then a sharp step on a specific operation                     | A refresh, compaction, or large query. Size for the peak, not the steady state.                        |

To tell a plateau from slow growth, hold the load constant and run long enough for the steady state to establish itself: caches full, at least one full refresh cycle per dataset, and any background compaction having run. Reaching that point can take hours to days depending on refresh cadence, and reading the graph before then will show a rise that has not yet finished.

When growth does not flatten, the gauges separate the causes: growth in `query_memory_pool_used_bytes` is query work inside the bounded pool, while growth in `process_resident_anon_bytes` with the pool gauges flat is off-pool memory, which `runtime.query.memory_limit` does not govern. Growth confined to `process_resident_file_bytes` is page cache filling, not a leak.

## Validating a Memory Configuration

Memory behavior cannot be extrapolated from an environment that is not representative. Because the baseline is fixed and the working set is not, a deployment that is healthy on small data tells you very little about the same deployment on production data — and a deployment that is unhealthy on small data may be revealing only that the environment is below the runtime's floors.

Start with the startup check below — it is free and immediate — then validate under load.

### Check the Startup Budget Warnings First

The runtime computes its memory partition at startup, before any data is loaded, and warns when the configuration cannot fit. These warnings are emitted at `warn` level, so they appear at the default `INFO` verbosity, and they are the cheapest possible sizing check: **an unfittable configuration is detectable in the first seconds of a run rather than after days of load.**

| Startup warning (leading phrase)                                            | Meaning                                                                                                                       | Action                                                                                     |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `Cayenne CDC cache reservation exceeds what the query pool can yield`          | The per-dataset caches do not fit beside the query pool even after the pool has been reduced to its floor. The startup commitment already exceeds available memory. | Add memory, reduce dataset count, or lower per-dataset cache parameters. Expect resident memory above the budgets until then. |
| `Cayenne in-memory CDC ingestion has limited memory available`                | The query pool, compaction pool, and any co-resident DuckDB reservations leave little room for CDC ingestion.                     | Lower `runtime.query.memory_limit` or per-dataset `duckdb_memory_limit`. Ingestion will spill to disk more often until then. |
| `Detected potential memory over-commit from DuckDB accelerators`              | Un-limited DuckDB instances would each default to ~80% of host RAM. The runtime capped them automatically.                       | Set explicit `duckdb_memory_limit` values rather than relying on the automatic split.       |
| `The explicit DuckDB accelerator memory limits plus the query memory limit exceed the coordinated memory budget` | Explicitly configured limits over-commit memory. These are honored as-is and **not** reduced.                                    | Lower the explicit `duckdb_memory_limit` and/or `runtime.query.memory_limit` values.        |

The first warning is the important one for a constrained environment: it fires precisely in the situation described in [Sizing a Non-Production Environment](#sizing-a-non-production-environment) — an environment small enough that the per-dataset floors no longer fit beside a working query pool. Treat it as a statement that the environment is undersized for the dataset count, not as a tuning prompt.

Also check the derived limit itself. At `DEBUG` verbosity the runtime logs the arithmetic it used (`No query memory limit specified; ...`), including the reservation it subtracted, which is the fastest way to see what the baseline actually costs for a given Spicepod.

### Representative Load Testing

A load test predicts production only if it reproduces all four of these. Missing any one of them makes the result unreliable:

| Property               | Why it matters                                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data volume**        | Determines the working set and the scan sizes. Generate synthetic data to production scale if real data cannot be copied into the environment. |
| **Concurrency**        | Simultaneous in-flight queries multiply per-query memory. Peak concurrency, not average throughput, sets the peak.                             |
| **Duration**           | Caches, refresh cycles, and compaction only reach steady state after a sustained run. Short runs measure the warm-up, not the plateau.         |
| **Query diversity**    | Varied predicates and filter values exercise real scan and cache behavior. A test that replays one query measures the results cache.           |

Generating production-scale data into a dedicated source is usually less effort than it appears, and is the piece most often skipped — it is also the piece that makes the other three meaningful.

### Shadow or Canary Deployment

Where a load test is impractical, mirror production traffic to a canary instance that serves no user-facing responses. This gives genuine query distribution, concurrency, and data volume without exposing users to the result. Confirm that the shadow path cannot write to production systems or double-count downstream side effects before enabling it.

### What Not to Do

- **Do not size production by scaling a small environment's numbers up proportionally.** The baseline does not scale, so the ratios do not transfer. See [Sizing a Non-Production Environment](#sizing-a-non-production-environment).
- **Do not tune caches and buffers downward to make an undersized environment stop failing, and then ship that configuration.** It validates a regime you will not run in, at the cost of latency and predictability.
- **Do not draw conclusions from a run that has not reached steady state**, in either direction.

## Related Documentation

**Spice Documentation:**

- [Performance Tuning](./performance-tuning) - Comprehensive guide to optimizing Spice performance
- [Data Accelerators](../components/data-accelerators) - Accelerator configuration reference
- [Runtime Configuration](./spicepod/runtime) - Runtime parameter reference

**External References:**

- [Apache DataFusion](https://datafusion.apache.org/) - Query execution engine used by Spice
- [DataFusion Memory Usage](https://datafusion.apache.org/user-guide/configs.html#runtime-configuration-settings) - DataFusion runtime memory configuration
- [DataFusion Tuning Guide](https://datafusion.apache.org/user-guide/configs.html#tuning-guide) - Memory-limited query optimization
- [DuckDB Memory Management](https://duckdb.org/docs/operations_manual/limits.html) - DuckDB memory limits documentation
- [jemalloc](https://jemalloc.net/jemalloc.3.html) - Page retention and the `dirty_decay_ms` / `muzzy_decay_ms` decay schedule
- [`mallopt`](https://man7.org/linux/man-pages/man3/mallopt.3.html) - glibc's `M_TRIM_THRESHOLD` and when freed memory is returned to the OS
- [cgroup v2 memory interface](https://docs.kernel.org/admin-guide/cgroup-v2.html#memory-interface-files) - What `memory.max` accounts for and how the OOM decision is made
