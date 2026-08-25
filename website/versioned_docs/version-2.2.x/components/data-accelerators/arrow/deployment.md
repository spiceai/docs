---
title: 'Arrow Data Accelerator Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the Arrow (in-memory) data accelerator in production: memory sizing, indexes, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-accelerators
  - arrow
  - observability
---

Production operating guide for the Arrow in-memory data accelerator covering memory sizing, optional hash indexes, and observability.

## Authentication & Secrets

The Arrow accelerator is an in-process, in-memory engine. There is no external storage and no authentication or secret management required.

## Resilience & Durability

The Arrow accelerator is **not durable**. Data is held in RAM and is lost on process restart; every restart re-materializes the dataset from the source connector.

- **Crash recovery**: None — on restart, the dataset is refreshed from scratch.
- **File modes**: File-mode acceleration is rejected at startup; Arrow is memory-only. Use [DuckDB](../duckdb/deployment), [SQLite](../sqlite/deployment), [PostgreSQL](../postgres/deployment), or [Cayenne](../cayenne/deployment) when durability or spill is required.
- **Concurrency**: Arrow reads are lock-free. Refresh cadence is controlled by the runtime refresh semaphore, not by the accelerator itself.

## Capacity & Sizing

- **Memory**: Plan for 1.0–1.5× the raw row-oriented size of the source data, plus overhead for string dictionaries. Use the source connector's schema and row count to estimate.
- **Hash index**: Optional. Activated automatically when a `primary_key` (or secondary `indexes` entry) is configured, building a hash map over the indexed columns. Build time scales linearly with rows. The index stores no key bytes — only a 16-byte slot per entry (8-byte hash + packed 8-byte row location) plus roughly 1.25 bytes of bloom filter — so budget from the entry count, not the key width. Reported usage tracks allocated slot capacity, which exceeds the live entry count, so plan above the ~17 bytes/row floor.
- **Startup cost**: Full-dataset materialization happens on startup. For tables larger than ~1 GB, consider a durable accelerator to avoid repeated full refresh on every restart.

## Metrics

Generic acceleration metrics are available with the `dataset_acceleration_` prefix. Hash-index operations emit dedicated metrics when the index is enabled:

| Metric                             | Type      | Description                                               |
| ---------------------------------- | --------- | --------------------------------------------------------- |
| `hash_index_builds`                | Counter   | Total hash-index builds (one per refresh).                |
| `hash_index_build_duration_ms`     | Histogram | Time to build the hash index.                             |
| `hash_index_entries`               | Histogram | Number of entries in the index.                           |
| `hash_index_memory_bytes`          | Histogram | Approximate memory footprint of the index.                |
| `hash_index_lookups`               | Counter   | Total hash-index lookups performed by queries.            |
| `hash_index_lookup_rows`           | Counter   | Total rows returned via hash-index lookups.               |

See [Component Metrics](../../../features/observability/component_metrics) for enabling and exporting metrics. Refresh metrics are described in [Acceleration](../../../features/data-acceleration/).

## Task History

Arrow acceleration operations (refresh, query) participate in [task history](../../../reference/task_history) through the shared acceleration spans (`accelerated_table_refresh`, `sql_query`). No Arrow-specific spans are emitted — the accelerator is a thin wrapper over Arrow memory.

## Known Limitations

- **No persistence**: Every restart refreshes from the source.
- **No traditional indexes**: Arrow does not support B-tree indexes. Hash index provides point-lookup acceleration but not range or sort-order optimization.
- **Only primary-key hash index**: The hash index requires a `primary_key` constraint; `unique` constraints alone do not enable the index.
- **Memory pressure**: If the dataset exceeds available RAM, the runtime will OOM; no spill-to-disk mechanism exists in the Arrow accelerator itself.
- **`partition_by`**: Not applicable — Arrow accelerator holds a single in-memory representation.

## Troubleshooting

| Symptom                                          | Likely cause                                            | Resolution                                                                                     |
| ------------------------------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| OOM on refresh                                   | Source dataset larger than RAM.                         | Switch to a durable accelerator (DuckDB / SQLite / Cayenne) that supports spill to disk.       |
| Long startup time                                | Full-dataset refresh runs on boot.                      | Switch to a durable accelerator so refresh is incremental, not full, on restart.               |
| `hash_index` ignored                             | No primary-key constraint on the dataset.               | Add `primary_key:` to the dataset definition; hash index activates automatically.              |
| Query slow for point lookups                     | No primary key/index, or wrong key column.              | Add a `primary_key:` (or secondary `indexes:` entry); ensure the query filter matches the indexed columns. |
| Accelerator refuses to start with file mode      | Arrow rejects file-mode acceleration.                   | Switch `engine:` to `duckdb`, `sqlite`, `postgres`, or `cayenne`.                              |
