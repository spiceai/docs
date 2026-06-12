---
title: 'DuckDB Data Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the DuckDB data connector in production: file vs memory mode, durability, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - duckdb
  - observability
---

Production operating guide for the DuckDB data connector (used to federate queries against an existing DuckDB database file).

## Authentication & Secrets

DuckDB is an embedded engine; the connector reads a local DuckDB database file. No network authentication is involved.

| Parameter          | Description                                                            |
| ------------------ | ---------------------------------------------------------------------- |
| `duckdb_open`      | Path to the DuckDB database file. Required when reading from a table reference (`from: duckdb:database.schema.table`); it may be omitted only when the dataset's `from:` uses a DuckDB table function (e.g. `duckdb:read_csv(...)`), which runs against an in-memory database. Omitting it for a table-reference dataset fails with a `MissingDuckDBFile` error. |

Protect the DuckDB file with filesystem permissions. Store it on encrypted storage (LUKS/dm-crypt, EBS encryption, etc.) for data-at-rest protection. For data loaded from cloud object stores inside DuckDB, configure AWS/Azure/GCS credentials via DuckDB extensions rather than Spice parameters.

## Resilience Controls

### File Concurrency

DuckDB supports a single writer with many readers per database file. The Spice DuckDB data connector always opens the database in read-only mode, so it will not conflict with other readers. However, if another process holds a write lock, the connector may return an I/O error on open. Co-locate the writer and the Spice reader on the same host and ensure the writer releases its lock before the connector opens the file.

### Crash Recovery

DuckDB's WAL provides crash recovery for any process that wrote to the file. The Spice connector does not itself write (the data connector is read-only; the DuckDB _accelerator_ is distinct and handles write paths).

## Capacity & Sizing

- **Memory**: DuckDB's default memory limit is self-managed based on system memory. For constrained environments, set a `memory_limit` pragma via the connection string.
- **Disk**: Plan for 1.5–2× the raw data size to accommodate DuckDB's internal compression, WAL, and temporary spill files during query execution.
- **Temporary spill**: Large queries spill to DuckDB's temp directory; ensure adequate disk and set `temp_directory` to a fast local volume if the default (same as the database file) is on slow storage.

## Metrics

The DuckDB connector does not register connector-specific instruments. Monitor via Spice's query metrics (`query_duration_ms`, `query_processed_rows`). See [Component Metrics](../../../features/observability/component_metrics) for general configuration.

For DuckDB-internal metrics, use DuckDB's `duckdb_memory()` and `pragma database_size` via a SQL query against the connector.

## Task History

DuckDB queries participate in [task history](../../../reference/task_history) through DataFusion's execution-plan spans.

## Known Limitations

- **Read-only via the data connector**: For a writable, Spice-managed DuckDB, use the [DuckDB accelerator](../../data-accelerators/duckdb) instead.
- **Single-writer**: A DuckDB file cannot be written by two processes concurrently. Coordinate writers out-of-band.
- **Version compatibility**: DuckDB files are tied to the DuckDB binary version. Upgrading DuckDB in Spice may require regenerating older database files.

## Troubleshooting

| Symptom                                       | Likely cause                                           | Resolution                                                                               |
| --------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `IO Error: Could not set lock on file`        | Another process holds the DuckDB write lock.           | Ensure only one writer; open in read-only mode if Spice should not hold a write lock.    |
| `Catalog Error: Table ... does not exist`     | Table name mismatch or database not at the expected path. | Query `SELECT * FROM information_schema.tables` via the connector to list tables.      |
| Queries spill aggressively, slow performance  | Working set exceeds memory.                            | Increase system memory or set a smaller batch size; direct temp to faster storage.       |
| `Serialization Error: Failed to deserialize ... database ... not a valid database` | DuckDB version mismatch. | Upgrade/downgrade Spice's DuckDB version to match the file producer.                     |
