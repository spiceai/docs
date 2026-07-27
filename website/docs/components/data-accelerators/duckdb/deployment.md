---
title: 'DuckDB Data Accelerator Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the DuckDB data accelerator in production: memory vs file mode, checkpointing, spill, pool sizing, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-accelerators
  - duckdb
  - observability
---

Production operating guide for the DuckDB data accelerator covering memory vs file mode, checkpointing, spill, and observability.

## Authentication & Secrets

DuckDB is an embedded, in-process engine. No external authentication is required. For file-mode, protect the DuckDB database file with filesystem permissions and encrypt at rest (LUKS/dm-crypt, EBS encryption, etc.).

## Resilience & Durability

### Memory vs File Mode

| Mode      | Durability                 | Spill-to-disk                                  | Restart behavior            |
| --------- | -------------------------- | ---------------------------------------------- | --------------------------- |
| `memory`  | None — lost on restart.    | Via configured `temp_directory`.               | Full refresh on startup.    |
| `file`    | Crash-safe via DuckDB WAL. | Via configured `temp_directory`.               | Incremental refresh resumes. |

Use `mode: file` for any dataset larger than a few hundred MB or where restart speed matters.

### Checkpointing

The DuckDB accelerator enables `PRAGMA enable_checkpoint_on_shutdown` at connection setup. Graceful shutdown writes a clean checkpoint, making restart near-instantaneous. Ungraceful shutdowns leave a WAL to replay, slowing the first subsequent startup.

### Spill Directory

Large queries (sort, aggregate, join) can spill to disk. The spill directory is controlled by `runtime.query.temp_directory`. Point this at a fast local volume (NVMe SSD) and ensure adequate free space (2-4× the largest join input is a safe starting point).

### Vacuum

DuckDB does not require explicit `VACUUM`; its storage layout compacts on checkpoint. No Spice-level vacuum automation is provided.

## Capacity & Sizing

### Connection Pool

| Parameter               | Default                                                                                          | Description                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| `connection_pool_size`  | `max(floor, number of datasets on the same instance)`, where `floor` is `4` for `ebs` and `10` otherwise | Maximum connections in the shared DuckDB pool. Floor depends on the resolved [`acceleration.storage_profile`](../../../reference/spicepod/datasets#accelerationstorage_profile). |
| *(pool min idle)*       | Same as the `floor` above (`4` for `ebs`, `10` otherwise), capped at `connection_pool_size`      | Minimum idle connections.                        |

Datasets sharing a DuckDB instance share the pool. For write-heavy refresh plus read-heavy query workloads, size the pool to cover expected concurrency plus a small headroom; DuckDB's serializable concurrency model limits benefit beyond the point of write contention.

### Memory

:::tip[Datasets 10 GB or larger]

For any dataset of **10 GB or larger**, deploy [Spice Cayenne](../cayenne/index.md) instead of DuckDB, because of DuckDB's memory requirements. Cayenne typically needs **one-third to one-half** the memory of the DuckDB accelerator for the same dataset, which lowers the memory request a container needs to run the workload safely.

:::

DuckDB self-tunes its memory limit from **host** memory, not the cgroup limit, so in a container each instance's own default over-states what the process may use. When `duckdb_memory_limit` is unset, Spice caps each un-limited DuckDB instance from a cgroup-aware [coordinated memory budget](./index.md#coordinated-memory-budget) shared with the query pool, and warns when it does so.

Set the `duckdb_memory_limit` acceleration parameter to replace that automatic split with a deliberate ceiling. Plan for the DuckDB working set plus ~2× for query execution headroom.

### Index Parameters

| Parameter                    | Description                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| `duckdb_index_scan_percentage`      | Optimizer hint: fraction of rows below which index scan is preferred over table scan.                   |
| `duckdb_index_scan_max_count`       | Optimizer hint: maximum rows for which index scan is preferred.                                         |
| `on_refresh_sort_columns`    | Columns to sort by during refresh. **Caution**: current implementation uses `CREATE OR REPLACE`, which drops constraints and indexes. |

DuckDB supports traditional B-tree / ART indexes via SQL `CREATE INDEX` against the accelerated table. Define them once the dataset schema is stable.

## Metrics

Generic acceleration metrics are available with the `dataset_acceleration_` prefix. DuckDB-specific OpenTelemetry instruments are not currently registered at the runtime layer. For DuckDB-internal telemetry, query DuckDB directly via Spice:

```sql
SELECT * FROM duckdb_memory();
PRAGMA database_size;
```

See [Component Metrics](../../../features/observability/component_metrics) for enabling and exporting runtime metrics.

## Task History

DuckDB acceleration operations participate in [task history](../../../reference/task_history) through the shared acceleration spans (`accelerated_table_refresh`, `sql_query`) plus DuckDB's SQL execution wrapped in DataFusion plan nodes.

## Known Limitations

- **`on_refresh_sort_columns` drops indexes**: The current implementation issues `CREATE OR REPLACE TABLE ... ORDER BY ...`, which drops pre-existing indexes and constraints. Re-run `CREATE INDEX` statements after sort-column refreshes or pin DDL changes via startup scripts.
- **Single writer**: A DuckDB file has one writer at a time. Two Spice instances must not share the same file in write mode.
- **Version pinning**: DuckDB database files are tied to the DuckDB binary version. Upgrading Spice to a version with a newer embedded DuckDB may require re-materialization.
- **No built-in remote replication**: Cross-host replication is not provided; use file-level replication or a cloud block-store snapshot.

## Troubleshooting

| Symptom                                                | Likely cause                                                  | Resolution                                                                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Slow first startup after restart                       | WAL replay due to ungraceful shutdown.                        | Use graceful shutdown (`SIGTERM`). Subsequent starts will be fast once the checkpoint is clean.             |
| OOM on refresh                                         | DuckDB memory limit too high for container cgroup.            | Set the `duckdb_memory_limit` acceleration parameter. Check the startup log for the coordinated-budget warning to see what the runtime capped each un-limited instance to. |
| Disk fills during large queries                        | Spill directory on undersized volume.                         | Point `runtime.query.temp_directory` at a larger volume; monitor free space.                                |
| Query uses table scan when an index exists             | `duckdb_index_scan_percentage` / `duckdb_index_scan_max_count` too low.     | Tune thresholds; `EXPLAIN` to confirm.                                                                       |
| Indexes disappear after refresh                        | `on_refresh_sort_columns` triggers `CREATE OR REPLACE`.       | Re-create indexes post-refresh, or avoid sort-column refreshes until the underlying behavior is updated.    |
| `IO Error: Could not set lock on file`                 | Another process holds a write lock.                           | Ensure single-writer semantics; verify no other Spice instance is using the same file.                      |
