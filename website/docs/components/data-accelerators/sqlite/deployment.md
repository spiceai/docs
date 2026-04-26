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
| `busy_timeout` | `5000`   | Milliseconds SQLite will wait for a table lock before returning `SQLITE_BUSY`.              |

Raise this when you observe `database is locked` errors under sustained concurrent refresh + read load.

### Journal Mode

The SQLite accelerator leans on SQLite's default durability settings. The Spice-level accelerator does not override `journal_mode`, `synchronous`, or `checkpoint` pragmas; for custom durability tuning, set pragmas via a custom connection string or post-startup SQL.

### Federation Across Files

File-mode SQLite datasets on the same runtime can be federated using SQLite's `ATTACH DATABASE` mechanism; the accelerator wires up peer attachments automatically for co-located file-mode accelerators.

## Capacity & Sizing

- **Single writer**: SQLite serializes writes globally per file. High-concurrency write workloads (e.g., very short refresh intervals on many datasets) hit the write mutex — prefer [DuckDB](../duckdb/deployment) or [PostgreSQL](../postgres/deployment) for those cases.
- **Memory**: SQLite's page cache defaults are modest; set `PRAGMA cache_size = -<KB>` via the connection string for read-heavy workloads on large databases.
- **Disk**: Plan for 1.2–1.5× the raw data size (SQLite uses row-oriented storage with no strong compression by default).

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
| Slow reads on a large file-mode database  | Default page cache is small for the working set.          | Raise `PRAGMA cache_size` via connection string; consider DuckDB for large-scan workloads.        |
| Acceleration rejects `partition_by`       | Feature not supported.                                    | Remove `partition_by` or switch engines.                                                          |
| Queries return stale data after refresh   | Readers using long-lived transactions hold an old snapshot. | Ensure read paths do not keep connections open across refresh boundaries (runtime handles this, but custom SQL in pre/post refresh hooks can affect it). |
