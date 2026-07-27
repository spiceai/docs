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

## General Memory Recommendations

Memory requirements vary based on workload characteristics, dataset sizes, query complexity, and refresh modes.

| Workload Type                            | Minimum RAM       | Notes                                                          |
| ---------------------------------------- | ----------------- | -------------------------------------------------------------- |
| Typical workloads                        | 8 GB              | Suitable for most development and small production deployments |
| Large datasets (`refresh_mode: full`)    | 2.5x dataset size | Requires memory for both old and new tables during refresh     |
| Large datasets (`refresh_mode: append`)  | 1.5x dataset size | Memory for incremental data only                               |
| Large datasets (`refresh_mode: changes`) | 1.5x dataset size | Depends on CDC event volume and frequency                      |

Memory requirements can be reduced by using file-based acceleration with [DuckDB](../components/data-accelerators/duckdb), [SQLite](../components/data-accelerators/sqlite), [Turso](../components/data-accelerators/turso), or [Spice Cayenne](../components/data-accelerators/cayenne), which store data on disk and support spilling.

:::tip[Datasets 10 GB or larger]

For any dataset of **10 GB or larger**, [Spice Cayenne](../components/data-accelerators/cayenne) is recommended over [DuckDB](../components/data-accelerators/duckdb), because of DuckDB's memory requirements. Cayenne typically needs **one-third to one-half** the memory of the DuckDB accelerator for the same dataset.

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
| `cayenne_segment_cache_mb` | `acceleration.params`  | `256`   | Per-dataset size of the in-memory Vortex segment cache in megabytes. Caches decompressed data segments for improved query performance.        |

**Memory Usage Guidelines:**

- Base memory: ~500 MB for runtime overhead
- Footer cache: unset by default (DataFusion's 50 MB file-metadata-cache limit applies); increase for datasets with many files
- Segment cache: 256 MB default, increase for workloads with repeated scans on the same data
- Query execution memory: Depends on query complexity and concurrency

**Example Configuration:**

```yaml
runtime:
  params:
    # Engine-global footer cache (shared by all Cayenne datasets)
    cayenne_footer_cache_mb: 256

datasets:
  - from: s3://my-bucket/large-dataset/
    name: large_dataset
    acceleration:
      engine: cayenne
      mode: file
      params:
        # Per-dataset segment cache
        cayenne_segment_cache_mb: 512
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

Spice uses DataFusion as its query execution engine. By default, Spice limits query engine memory to **90% of total system memory** (container-aware; reduced to **70%** when Cayenne acceleration is active, to leave headroom for Cayenne's compaction memory pool and in-memory CDC tier). This can be tuned through the `runtime.query.memory_limit` configuration.

### Memory Limit Configuration

The `runtime.query.memory_limit` parameter defines the maximum memory available for query execution. If not specified, it defaults to 90% of total system memory (70% when Cayenne acceleration is active). Once the memory limit is reached, supported query operations spill data to disk.

```yaml
runtime:
  query:
    memory_limit: 4GiB
    temp_directory: /tmp/spice  # Directory for spill files
```

Spice uses [Apache DataFusion](https://datafusion.apache.org/) as its query execution engine, which provides vectorized, multi-threaded query execution with automatic memory management. DataFusion's [GreedyMemoryPool](https://docs.rs/datafusion/latest/datafusion/execution/memory_pool/struct.GreedyMemoryPool.html) allows memory reservations on a first-come, first-served basis up to the configured limit, improving throughput for high-concurrency queries with many partitions.

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
Total Memory = Runtime Overhead + Accelerator Memory + Query Memory Limit + Cache Memory
```

**Example calculation:**

- Runtime overhead: 500 MB
- Spice Cayenne caches: 306 MB (50 MB footer + 256 MB segment)
- Query memory limit: 4 GB
- Results caches: 1 GB (512 MB SQL + 256 MB search + 256 MB embeddings)
- **Total: ~6 GB minimum**

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

- Set memory requests to at least 1.3x the configured `runtime.query.memory_limit` plus accelerator cache sizes
- Set memory limits higher than requests to handle temporary spikes
- Avoid setting CPU limits, as they can cause [throttling](https://home.robusta.dev/blog/stop-using-cpu-limits) even when CPU is available
- Monitor actual usage with observability tools and adjust accordingly

## Monitoring and Profiling

Use observability tools to monitor and profile memory usage regularly. Spice exposes metrics for:

- Query execution memory usage
- Accelerator cache hit rates
- Data refresh memory consumption

See [Observability](../features/observability) for configuration details.

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
