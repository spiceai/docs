---
title: 'Managing Memory Usage'
sidebar_label: 'Memory'
sidebar_position: 31
description: 'Guidelines and best practices for managing memory usage and optimizing performance in Spice.ai Open Source deployments.'
keywords:
  - memory
pagination_prev: null
pagination_next: null
---

Effective memory management is critical for optimal performance and stability in Spice.ai Open Source deployments. This guide provides clear recommendations and best practices for managing memory usage.

## General Memory Recommendations

Memory requirements depend on workload characteristics, dataset sizes, query complexity, and refresh modes. Recommended allocations:

- Typical workloads: at least 8 GB RAM.
- Larger datasets:
  - `refresh_mode: full`: 2.5x dataset size.
  - `refresh_mode: append`: 1.5x dataset size.
  - `refresh_mode: changes`: Primarily influenced by CDC event volume and frequency; 1.5x dataset size is a reasonable estimate.

## Refresh Modes and Memory Implications

Refresh modes directly impact memory usage:

- **Full Refresh**: Loads data into a temporary table, then atomically swaps it with the existing table. Requires memory for both tables simultaneously, resulting in higher usage.
- **Append Refresh**: Incrementally inserts or upserts data, using memory only for incremental data, significantly reducing memory usage.
- **Changes Refresh**: Applies CDC events incrementally, with memory usage primarily influenced by incoming event volume and frequency, typically resulting in lower and predictable usage.

## DataFusion Memory Management

Spice.ai uses DataFusion as its query execution engine. DataFusion does not enforce strict memory limits by default, potentially causing unbounded memory usage. Spice.ai mitigates this through:

- **Memory Budgeting**: Limits memory per query execution. Queries exceeding this budget return an error. See [Spicepod Configuration](spicepod/index.md).
- **Spill-to-Disk**: Operators such as Sort, Join, and GroupByHash spill intermediate results to disk when memory limits are exceeded, preventing out-of-memory errors.

## Embedded Data Accelerators

Spice.ai supports embedded accelerators like [SQLite](/website/docs/components/data-accelerators/sqlite.md) and [DuckDB](/website/docs/components/data-accelerators/duckdb.md), each with distinct memory considerations:

- **SQLite**: Lightweight and memory-efficient, suitable for smaller datasets. Does not support intermediate spilling; datasets should fit comfortably in memory or use application-level paging.
- **DuckDB**: Optimized for larger datasets and complex queries. Manages memory through streaming execution, intermediate spilling, and buffer management. By default, DuckDB instances use up to 80% of available system memory. Consolidate multiple datasets into a single DuckDB instance to avoid excessive cumulative memory usage:

```yaml
acceleration:
  engine: duckdb
  params:
    duckdb_file: '/data/shared_duckdb_instance.db'
    duckdb_memory_limit: '4G'
```

Configure DuckDB temporary directories and limits as follows:

```sql
SET temp_directory = '/tmp/duckdb_swap';
SET max_temp_directory_size = '100GB';
```

For detailed DuckDB memory management, refer to the [DuckDB Memory Management Guide](https://duckdb.org/docs/operations_manual/limits.html).

## Kubernetes Memory Configuration

Set appropriate memory requests and limits in Kubernetes pod specifications:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: spice-ai-pod
spec:
  containers:
    - name: spice-ai-container
      image: spiceai/spiceai:latest-models
      resources:
        requests:
          memory: '8Gi'
          cpu: '4'
```

## Monitoring and Profiling

Regularly monitor and profile memory usage with observability tools to identify and address potential memory bottlenecks promptly.

Following these recommendations helps developers effectively manage memory resources, ensuring Spice.ai deployments remain performant, stable, and reliable.
