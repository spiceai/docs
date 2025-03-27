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

Effective memory management is essential for maintaining optimal performance and stability in Spice.ai Open Source deployments. This guide outlines recommendations and best practices for managing memory usage.

## General Memory Recommendations

Memory requirements vary based on workload characteristics, dataset sizes, query complexity, and refresh modes. Recommended allocations include:

- **Typical workloads**: At least 8 GB RAM.
- **Larger datasets**:
  - `refresh_mode: full`: 2.5x dataset size.
  - `refresh_mode: append`: 1.5x dataset size.
  - `refresh_mode: changes`: Primarily influenced by CDC event volume and frequency; 1.5x dataset size is a reasonable estimate.

When using DuckDB persistent storage and disk-spilling memory requirements can be reduced. See [DuckDB Data Accelerator](/docs/components/data-accelerators/duckdb.md).

## Refresh Modes and Memory Implications

Refresh modes affect memory usage as follows:

- **Full Refresh**: Temporarily loads data into a new table before replacing the existing table so that it can be atomically swapped and maintain consistency. This requires memory for both tables simultaneously, resulting in higher usage.
- **Append Refresh**: Incrementally inserts or upserts data, using memory only for the incremental data, which reduces usage.
- **Changes Refresh**: Applies CDC events incrementally. Memory usage depends on event volume and frequency, typically resulting in lower and predictable usage.

## DataFusion Memory Management

Spice.ai uses DataFusion as its query execution engine. By default, DataFusion does not enforce strict memory limits, which can lead to unbounded usage. Spice.ai addresses this through:

- **Memory Budgeting**: Limits memory per query execution. Queries exceeding the limit return an error. See [Spicepod Configuration](spicepod/index.md) for details.
- **Spill-to-Disk**: Operators such as Sort, Join, and GroupByHash spill intermediate results to disk when memory limits are exceeded, preventing out-of-memory errors.

## Embedded Data Accelerators

Spice.ai integrates with embedded accelerators like [SQLite](/docs/components/data-accelerators/sqlite.md) and [DuckDB](/docs/components/data-accelerators/duckdb.md), each with unique memory considerations:

- **SQLite**: Lightweight and efficient for smaller datasets. Does not support intermediate spilling; datasets must fit in memory or use application-level paging.
- **DuckDB**: Designed for larger datasets and complex queries. Manages memory through streaming execution, intermediate spilling, and buffer management. See [DuckDB Data Accelerator](/docs/components/data-accelerators/duckdb.md) for more details.

## Kubernetes Memory Configuration

Configure appropriate memory requests and limits in Kubernetes pod specifications to ensure resource availability:

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

Use observability tools to monitor and profile memory usage regularly. This helps identify and resolve potential bottlenecks promptly.

By following these guidelines, developers can manage memory resources effectively, ensuring Spice.ai deployments remain performant, stable, and reliable.
