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

A Data Accelerator queries/fetches data from a connected data source and stores/updates it locally in an embedded acceleration engine, such as Spice Cayenne, DuckDB, or SQLite. To set data refresh behavior, such as refreshing data on an interval, see [Data Refresh](../features/data-acceleration/data-refresh).

Dataset acceleration is enabled by setting the acceleration configuration:

```yaml
datasets:
  - name: accelerated_dataset
    acceleration:
      enabled: true
```

For the complete reference specification, see [datasets](../reference/spicepod/datasets).

By default, datasets are locally materialized using in-memory Arrow records.

## Supported Data Accelerators

| Name       | Description                     | Status            | Engine Modes     |
| ---------- | ------------------------------- | ----------------- | ---------------- |
| `cayenne`  | [Spice Cayenne][cayenne]        | Release Candidate | `file`, `file_create`, `file_update` |
| `arrow`    | In-Memory Arrow Records         | Stable            | `memory`         |
| `duckdb`   | Embedded [DuckDB][duckdb]       | Stable            | `memory`, `file`, `file_create`, `file_update` |
| `postgres` | Attached [PostgreSQL][postgres] (Spice.ai Enterprise) | Release Candidate | N/A              |
| `sqlite`   | Embedded [SQLite][sqlite]       | Release Candidate | `memory`, `file`, `file_create`, `file_update` |
| `turso`    | Embedded [Turso][turso]         | Beta              | `memory`, `file`, `file_create`, `file_update` |

[cayenne]: ./cayenne/index.md
[duckdb]: ./duckdb/index.md
[postgres]: data-accelerators/postgres
[sqlite]: ./sqlite/index.md
[turso]: ./turso.md

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
| External database integration                       | `postgres`              | Use existing PostgreSQL infrastructure                  |

### Spice Cayenne vs DuckDB

Both [Spice Cayenne](data-accelerators/cayenne) and [DuckDB](data-accelerators/duckdb) support file-based acceleration, but differ in architecture and performance characteristics:

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

Data Accelerators may not support all possible Apache Arrow data types. For complete compatibility, see [specifications](../reference/datatypes/accelerators).

:::warning[Memory Considerations]

When accelerating a dataset using `mode: memory` (the default), some or all of the dataset is loaded into memory. Ensure sufficient memory is available, including overhead for queries and the runtime, especially with concurrent queries.

In-memory limitations can be mitigated by storing acceleration data on disk, which is supported by [`duckdb`](data-accelerators/duckdb), [`sqlite`](data-accelerators/sqlite), and [`turso`](data-accelerators/turso) accelerators by specifying `mode: file`.

:::

## Schema Handling

Data accelerators store the schema that Spice infers from the data source at startup. This schema is fixed for the lifetime of the runtime process and defines the column names, data types, and nullability of the accelerated table.

If the source schema changes while the runtime is running (for example, new columns are added or data types change), subsequent data refreshes into the accelerator will fail because the incoming data no longer matches the schema of the accelerated table. Restart the runtime to re-infer the schema and re-initialize the accelerated table.

For details on how schema inference works per connector and recommendations for managing schema drift, see [Schema Inference](data-connectors#schema-inference).

## Data Accelerator Docs

import DocCardList from '@theme/DocCardList';

<DocCardList />

## Related Documentation

- [Performance Tuning](../reference/performance-tuning) - Comprehensive optimization guide
- [Managing Memory Usage](../reference/memory) - Memory configuration reference
- [Data Refresh](../features/data-acceleration/data-refresh) - Refresh mode configuration
- [Indexes](../features/data-acceleration/indexes) - Index configuration for DuckDB, SQLite, and Turso
