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

- **Memory**: DuckDB manages its own memory based on available system memory when executing queries against the file. The connector opens the database read-only and exposes no memory-limit or connection-string setting — its only parameter is `duckdb_open`. For a Spice-configurable memory limit, use the [DuckDB accelerator](../../data-accelerators/duckdb), which supports the `duckdb_memory_limit` acceleration parameter.
- **Disk**: Plan for 1.5–2× the raw data size to accommodate DuckDB's internal compression, WAL, and temporary spill files during query execution.
- **Temporary spill**: Large queries can spill to DuckDB's temp directory (by default, alongside the database file). The connector exposes no spill-directory setting, so ensure the volume holding the database file has adequate free space.

## Metrics

The DuckDB connector does not register connector-specific instruments. Monitor via Spice's query metrics (`query_duration_ms`, `query_returned_rows`). See [Component Metrics](../../../features/observability/component_metrics) for general configuration.

For DuckDB-internal metrics, use DuckDB's `duckdb_memory()` and `pragma database_size` via a SQL query against the connector.

## Task History

DuckDB queries participate in [task history](../../../reference/task_history) through DataFusion's execution-plan spans.

## Known Limitations

- **Read-only via the data connector**: For a writable, Spice-managed DuckDB, use the [DuckDB accelerator](../../data-accelerators/duckdb) instead.
- **Single-writer**: A DuckDB file cannot be written by two processes concurrently. Coordinate writers out-of-band.
- **`HUGEINT` values beyond 38 digits**: DuckDB exports `HUGEINT` as `Decimal128(38, 0)`, so a value with more than 38 digits is returned with a digit missing ([spiceai/spiceai#15869](https://github.com/spiceai/spiceai/issues/15869)).
- **`octet_length` on strings**: `octet_length` over a `VARCHAR` column is pushed down to DuckDB, which has no `octet_length(VARCHAR)`, so the query fails ([spiceai/spiceai#15865](https://github.com/spiceai/spiceai/issues/15865)).
- **Version compatibility**: Spice opens DuckDB files with the DuckDB library installed on the host, which must be 1.5.2 or later (see [Requirements](./index.md#requirements)). A file must be readable by that library's version, so upgrading or downgrading the installed DuckDB can require regenerating older database files.

## Troubleshooting

| Symptom                                       | Likely cause                                           | Resolution                                                                               |
| --------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `IO Error: Could not set lock on file`        | Another process holds the DuckDB write lock.           | Ensure only one writer; open in read-only mode if Spice should not hold a write lock.    |
| `Catalog Error: Table ... does not exist`     | Table name mismatch or database not at the expected path. | Query `SELECT * FROM information_schema.tables` via the connector to list tables.      |
| Queries spill aggressively, slow performance  | Working set exceeds memory.                            | Increase system memory or set a smaller batch size; direct temp to faster storage.       |
| `Serialization Error: Failed to deserialize ... database ... not a valid database` | DuckDB version mismatch. | Install a DuckDB library on the Spice host that can read the file producer's version.   |
| `Failed to load the installed DuckDB library. Install libduckdb on the system library path or register the 'duckdb' ADBC driver manifest.` | `libduckdb` is not installed where the ADBC driver manager looks. | Install DuckDB 1.5.2 or later as described in [Requirements](./index.md#requirements). |
| `Failed to load the installed DuckDB library: version ... is older than the minimum supported version 1.5.2.` | The installed `libduckdb` is older than 1.5.2. | Upgrade the installed DuckDB library to 1.5.2 or later. |
