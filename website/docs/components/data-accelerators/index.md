---
title: 'Data Accelerators'
sidebar_label: 'Data Accelerators'
description: 'Data acceleration engines for local materialization and query acceleration in Spice'
image: /img/og/data-accelerators.png
sidebar_position: 2
pagination_prev: null
pagination_next: null
---

Data sourced by Data Connectors can be locally materialized and accelerated using a Data Accelerator.

A Data Accelerator queries/fetches data from a connected data source and stores/updates it locally in an embedded acceleration engine, such as Spice Cayenne, DuckDB, or SQLite. To set data refresh behavior, such as refreshing data on an interval, see [Data Refresh](/features/data-acceleration/data-refresh.md).

Dataset acceleration is enabled by setting the acceleration configuration:

```yaml
datasets:
  - name: accelerated_dataset
    acceleration:
      enabled: true
```

For the complete reference specification, see [datasets](/docs/reference/spicepod/datasets.md).

By default, datasets are locally materialized using in-memory Arrow records.

## Supported Data Accelerators

| Name       | Description                     | Status               | Engine Modes     |
| ---------- | ------------------------------- | -------------------- | ---------------- |
| `arrow`    | In-Memory Arrow Records         | Stable               | `memory`         |
| `cayenne`  | [Spice Cayenne][cayenne]        | Alpha (v1.9.0-rc.1+) | `file`           |
| `duckdb`   | Embedded [DuckDB][duckdb]       | Stable               | `memory`, `file` |
| `postgres` | Attached [PostgreSQL][postgres] | Release Candidate    | N/A              |
| `sqlite`   | Embedded [SQLite][sqlite]       | Release Candidate    | `memory`, `file` |
| `turso`    | Embedded [Turso][turso]         | Beta                 | `memory`, `file` |

[cayenne]: /docs/components/data-accelerators/cayenne.md
[duckdb]: /docs/components/data-accelerators/duckdb.md
[postgres]: /docs/components/data-accelerators/postgres/index.md
[sqlite]: /docs/components/data-accelerators/sqlite.md
[turso]: /docs/components/data-accelerators/turso.md

## Choosing an Accelerator

Select the appropriate accelerator based on dataset size, query patterns, and resource constraints:

| Use Case                                            | Recommended Accelerator | Rationale                                               |
| --------------------------------------------------- | ----------------------- | ------------------------------------------------------- |
| Small datasets (under 1 GB), maximum speed          | `arrow`                 | In-memory storage provides lowest latency               |
| Medium datasets (1-100 GB), complex SQL             | `duckdb`                | Mature SQL support with memory management               |
| Large datasets (100 GB - 1+ TB), scalable analytics | `cayenne`               | Vortex columnar format scales beyond single-file limits |
| Point lookups on large datasets                     | `cayenne`               | Vortex provides 100x faster random access vs Parquet    |
| Simple queries, low resource usage                  | `sqlite`                | Lightweight, minimal overhead                           |
| Async operations, concurrent workloads              | `turso`                 | Native async support, modern connection pooling         |
| External database integration                       | `postgres`              | Leverage existing PostgreSQL infrastructure             |

### Spice Cayenne vs DuckDB

Both [Spice Cayenne](/docs/components/data-accelerators/cayenne.md) and [DuckDB](/docs/components/data-accelerators/duckdb.md) support file-based acceleration, but differ in architecture and performance characteristics:

**Choose Spice Cayenne when:**

- Datasets exceed ~1 TB
- Multi-file data ingestion is required (e.g., partitioned S3 data)
- Lower memory overhead is preferred
- Workloads benefit from Vortex's [10-20x faster scans](https://bench.vortex.dev)
- Point lookups and random access patterns are common ([100x faster than Parquet](https://bench.vortex.dev))

**Choose DuckDB when:**

- Datasets are under ~1 TB
- Complex SQL features are required (window functions, CTEs)
- Existing DuckDB tooling integration is beneficial
- Explicit index control is required

## Data Types

Data Accelerators may not support all possible Apache Arrow data types. For complete compatibility, see [specifications](../../reference/datatypes/accelerators.md).

:::warning[Memory Considerations]

When accelerating a dataset using `mode: memory` (the default), some or all of the dataset is loaded into memory. Ensure sufficient memory is available, including overhead for queries and the runtime, especially with concurrent queries.

In-memory limitations can be mitigated by storing acceleration data on disk, which is supported by [`duckdb`](./duckdb.md), [`sqlite`](./sqlite.md), and [`turso`](./turso.md) accelerators by specifying `mode: file`.

:::

## Data Accelerator Docs

import DocCardList from '@theme/DocCardList';

<DocCardList />

## Related Documentation

- [Performance Tuning](/docs/reference/performance-tuning.md) - Comprehensive optimization guide
- [Managing Memory Usage](/docs/reference/memory.md) - Memory configuration reference
- [Data Refresh](/docs/features/data-acceleration/data-refresh.md) - Refresh mode configuration
- [Indexes](/docs/features/data-acceleration/indexes.md) - Index configuration for DuckDB, SQLite, and Turso
