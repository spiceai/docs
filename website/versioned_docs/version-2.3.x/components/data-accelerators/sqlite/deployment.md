---
title: 'SQLite Data Accelerator Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the SQLite data accelerator in production: file mode, busy timeout, pool, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-accelerators
  - observability
---

Production operating guide for the SQLite data accelerator covering file vs memory mode, busy-timeout handling, and observability.

## Authentication & Secrets

SQLite is an embedded, in-process engine. No external authentication is required. For file-mode, protect the SQLite database file with filesystem permissions and encrypt at rest if the data is sensitive.

## Resilience & Durability

### Memory vs File Mode

| Mode      | Durability                                       | Restart behavior            |
| --------- | ------------------------------------------------ | --------------------------- |
| `memory`  | None — lost on restart.                          | Full refresh on startup.    |
| `file`    | Durable; persisted to the configured path.       | Incremental refresh resumes. |

Use `mode: file` for any dataset larger than a few hundred MB or where restart speed matters.

### Busy Timeout

| Parameter         | Default  | Description                                                                                 |
| ----------------- | -------- | ------------------------------------------------------------------------------------------- |
| `busy_timeout` | `5000`   | Milliseconds SQLite will wait for a table lock before returning `SQLITE_BUSY`. Defaults to `15000` when the acceleration `storage_profile` resolves to EBS-class network storage. |

Raise this when you observe `database is locked` errors under sustained concurrent refresh + read load.

### Journal Mode

For file-mode databases, the connection pool automatically sets the following pragmas on each connection:

| Pragma           | Value    | Purpose                                            |
| ---------------- | -------- | -------------------------------------------------- |
| `journal_mode`   | `WAL`    | Enables concurrent readers during writes.          |
| `synchronous`    | `NORMAL` | Balances durability with write performance.        |
| `cache_size`     | `-20000` | Sets the page cache to ~20 MB. Raised to `-200000` (~200 MB) when the acceleration `storage_profile` resolves to EBS-class network storage. |
| `foreign_keys`   | `true`   | Enables foreign key constraint enforcement.        |
| `temp_store`     | `memory` | Stores temporary tables and indices in memory.     |
| `mmap_size`      | `0`      | Memory-mapped I/O is off by default. Set to `268435456` (256 MiB) when the `storage_profile` resolves to EBS-class network storage. |

These are no-ops for in-memory databases and are set by the runtime; the SQLite accelerator does not expose a connection string for overriding them. Two of them — `cache_size` and `mmap_size` — are re-applied after pool setup with larger values when the acceleration [`storage_profile`](../../../reference/spicepod/datasets#accelerationstorage_profile) resolves to EBS-class network storage, to absorb its per-I/O latency. Use the `busy_timeout` parameter to tune concurrent-writer handling.

### Federation Across Files

File-mode SQLite datasets on the same runtime can be federated using SQLite's `ATTACH DATABASE` mechanism; the accelerator wires up peer attachments automatically for co-located file-mode accelerators.

## Capacity & Sizing

- **Single writer**: SQLite serializes writes globally per file. High-concurrency write workloads (e.g., very short refresh intervals on many datasets) hit the write mutex — prefer [DuckDB](../duckdb/deployment) or [PostgreSQL](../postgres/deployment) for those cases.
- **Memory**: The page cache is managed by the runtime and is not directly configurable: ~20 MB (`cache_size = -20000`) on local/tmpfs storage, and ~200 MB (`cache_size = -200000`) when the acceleration `storage_profile` resolves to EBS-class network storage. Size for the page cache: that is the anonymous memory the accelerator asks for. The 256 MiB `mmap_size` set under the same profile is a ceiling on how much of the database file may be memory-mapped at once, not a further 256 MiB to provision — mapped pages are file-backed, become resident on demand, and are reclaimable under pressure. For large read-heavy workloads, prefer [DuckDB](../duckdb/deployment).
- **Disk**: Plan for 1.2–1.5× the raw data size (SQLite uses row-oriented storage with no strong compression by default).
- **Storage medium**: Keep `sqlite_file` on local NVMe or SSD — every page-cache miss is a synchronous read and every commit an `fsync`, so the device's per-I/O latency lands directly on query and refresh time. SQLite depends on the file system for locking, and its documentation warns that lock implementations on network file systems — NFS in particular — are unreliable and that concurrent access on one can corrupt the database ([How To Corrupt An SQLite Database File](https://www.sqlite.org/howtocorrupt.html)), so never place the file on NFS, SMB, EFS, or Azure Files. Network block storage (EBS, Azure Managed Disks) is a durable alternative; the runtime resolves it to the `ebs` storage profile and applies the larger page cache, memory-mapped I/O, and longer busy timeout above. See [Storage](../../../reference/performance-tuning#storage).

## Metrics

Generic acceleration metrics are available with the `dataset_acceleration_` prefix. SQLite-specific OpenTelemetry instruments are not currently registered at the runtime layer.

See [Component Metrics](../../../features/observability/component_metrics) for enabling and exporting metrics.

## Task History

SQLite acceleration operations participate in [task history](../../../reference/task_history) through the shared acceleration spans (`accelerated_table_refresh`, `sql_query`).

## Known Limitations

- **`partition_by` is rejected**: SQLite accelerator does not support partitioning; use [DuckDB](../duckdb/deployment), [PostgreSQL](../postgres/deployment), or [Cayenne](../cayenne/deployment) when partitioning is required.
- **Single writer**: Only one write transaction at a time per file.
- **Column store advantages absent**: For wide analytical scans, DuckDB and Cayenne will outperform SQLite materially.
- **No built-in remote replication**: Cross-host replication is not provided; use file-level replication, `VACUUM INTO`, or a cloud block-store snapshot.

## Troubleshooting

| Symptom                                   | Likely cause                                              | Resolution                                                                                        |
| ----------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `database is locked`                      | Concurrent writer contention exceeds `busy_timeout`.   | Raise `busy_timeout`; reduce concurrent refreshes; or switch to DuckDB/Postgres.               |
| Intermittent lock errors or corruption on a network share | SQLite locking is unreliable on NFS/SMB.        | Move `sqlite_file` to local NVMe or a network block volume; see [Storage](../../../reference/performance-tuning#storage). |
| Slow reads on a large file-mode database  | Page cache is small for the working set.                  | The page cache is managed by the runtime and is not directly configurable; on network-attached storage the larger EBS-profile cache applies automatically. Consider DuckDB for large-scan workloads. |
| Acceleration rejects `partition_by`       | Feature not supported.                                    | Remove `partition_by` or switch engines.                                                          |
| Queries return stale data after refresh   | Readers using long-lived transactions hold an old snapshot. | Ensure read paths do not keep connections open across refresh boundaries (runtime handles this, but custom SQL in pre/post refresh hooks can affect it). |
