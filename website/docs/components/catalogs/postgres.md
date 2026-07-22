---
title: 'PostgreSQL Catalog Connector'
sidebar_label: 'PostgreSQL'
description: 'Connect to a PostgreSQL database as a catalog provider for federated SQL query.'
sidebar_position: 8
pagination_prev: null
pagination_next: null
tags:
  - catalogs
  - postgres
  - data-connectors
---

Connect to a [PostgreSQL](https://www.postgresql.org/) database as a catalog provider for federated SQL query. The PostgreSQL Catalog Connector automatically discovers schemas and tables within a PostgreSQL database and makes them available for querying in Spice. This connector also works with PostgreSQL-compatible databases such as [Amazon Redshift](https://aws.amazon.com/redshift/).

For connecting to individual PostgreSQL tables, see the [PostgreSQL Data Connector documentation](../data-connectors/postgres).

## Configuration

```yaml
catalogs:
  - from: pg
    name: my_pg
    include:
      - 'public.*' # include all tables from the public schema
    params:
      pg_connection_string: postgresql://${secrets:PG_USER}:${secrets:PG_PASS}@localhost:5432/my_database
```

## `from`

The `from` field specifies the catalog provider. For PostgreSQL, use `pg`.

## `name`

The `name` field specifies the name of the catalog in Spice. Tables from the PostgreSQL database will be available under this catalog name. The schema hierarchy of the PostgreSQL database is preserved in Spice.

## `include`

Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables. For example, `*.my_table_name` would include all tables with the name `my_table_name` from any schema. Multiple `include` patterns are OR'ed together.

## `params`

Connection can be configured using a connection string or individual parameters.

### Connection string

| Parameter Name         | Description                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pg_connection_string` | A [PostgreSQL connection string](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING). E.g. `postgresql://user:password@host:port/dbname`. |

### Individual parameters

| Parameter Name   | Description                                                            |
| ---------------- | ---------------------------------------------------------------------- |
| `pg_host`        | The PostgreSQL host address.                                           |
| `pg_port`        | The PostgreSQL port number.                                            |
| `pg_db`          | The PostgreSQL database name.                                          |
| `pg_user`        | The PostgreSQL username for authentication.                            |
| `pg_pass`        | The PostgreSQL password for authentication.                            |
| `pg_sslmode`     | The SSL mode for the connection (e.g. `require`, `prefer`, `disable`). |
| `pg_sslrootcert` | Path to the SSL root certificate file, or inline PEM content.          |

## `dataset_params`

Optional. Parameters applied to every table discovered through the catalog.

| Parameter Name            | Description                                                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `unsupported_type_action` | Action to take when a discovered table contains a column of a type that cannot be mapped. One of `string` (default), `error`, `warn`, `ignore`. |

The supported `unsupported_type_action` values are:

- `string` — Default. Attempt to convert the unsupported type to a string (e.g. PostgreSQL `JSONB`). This matches the default of the [PostgreSQL Data Connector](../data-connectors/postgres).
- `error` — Fail catalog registration when an unsupported type is encountered.
- `warn` — Log a warning and drop the column containing the unsupported type.
- `ignore` — Drop the column containing the unsupported type without logging.

An invalid value returns a configuration error rather than being silently ignored.

```yaml
catalogs:
  - from: pg
    name: my_pg
    dataset_params:
      unsupported_type_action: warn # string (default) | error | warn | ignore
```

## Authentication

### Connection string

```yaml
catalogs:
  - from: pg
    name: my_pg
    params:
      pg_connection_string: postgresql://${secrets:PG_USER}:${secrets:PG_PASS}@localhost:5432/my_database
```

### Individual parameters

```yaml
catalogs:
  - from: pg
    name: my_pg
    params:
      pg_host: localhost
      pg_port: '5432'
      pg_db: my_database
      pg_user: ${secrets:PG_USER}
      pg_pass: ${secrets:PG_PASS}
      pg_sslmode: require
```

### Amazon Redshift

The PostgreSQL Catalog Connector can also be used with Amazon Redshift:

```yaml
catalogs:
  - from: pg
    name: my_redshift
    params:
      pg_connection_string: postgresql://${secrets:REDSHIFT_USER}:${secrets:REDSHIFT_PASS}@my-cluster.abc123.us-east-1.redshift.amazonaws.com:5439/my_database?sslmode=require
```

## Discovered Relations

The connector discovers the following PostgreSQL relation types from each included schema:

- Base tables
- Standard views
- Materialized views
- Foreign tables

Relations are read directly from `pg_catalog.pg_class`. Only relations the connecting role holds `SELECT` privilege on (checked via `has_table_privilege`) are registered, so the catalog does not surface relations that cannot be read.

For declaratively-partitioned tables (and legacy table inheritance), only the partitioned parent is registered — child partitions are not registered as separate tables. Querying the parent returns rows from every partition.

## Foreign Key Discovery

The PostgreSQL Catalog Connector automatically discovers foreign key relationships by querying `information_schema.referential_constraints` and `key_column_usage` during catalog refresh. Discovered FK metadata is attached to each table's Arrow schema and surfaces through:

- The `table_schema` tool — agents can use FK relationships to infer join paths between tables
- FlightSQL `GetTables` — programmatic clients receive FK metadata in the schema response

No configuration is required. If FK discovery fails for a schema (e.g., due to insufficient permissions on `information_schema`), tables are still registered without FK metadata and a warning is logged.

## Catalog-Level CDC Acceleration

A PostgreSQL catalog can be accelerated as a whole. Adding an `acceleration` block bootstraps and CDC-accelerates every discovered table (subject to `include`/`exclude`) with no per-table dataset configuration. All accelerated tables share a single replication slot and publication — derived once from the catalog `name` — so the source's write-ahead log (WAL) is decoded once for the entire catalog instead of once per table.

```yaml
catalogs:
  - from: pg
    name: my_pg
    include:
      - 'public.*'
    acceleration:
      engine: cayenne # optional; cayenne is the only supported engine
      refresh_mode: changes # required
    params:
      pg_connection_string: postgresql://${secrets:PG_USER}:${secrets:PG_PASS}@localhost:5432/my_database
```

### `acceleration.engine`

Optional. The accelerator engine used for every table. Defaults to `cayenne`, which is currently the only supported value.

### `acceleration.refresh_mode`

Required — there is no catalog-level default. The only supported value is `changes` (CDC); there is no catalog-level `full` mode. An `acceleration` block without a `refresh_mode` is a configuration error.

### Requirements

- **Logical replication must be enabled.** Before accelerating any table, Spice validates the PostgreSQL prerequisites CDC requires — `wal_level = logical` and the replication privilege — and fails fast with a specific, actionable error if either is missing.
- **Every included table must have a primary key.** Catalog setup fails and names the offending table if any included table lacks a primary key — tables are never silently skipped or downgraded to a heavier access pattern. Use `include`/`exclude` to keep primary-key-less tables out of an accelerated catalog's scope.

### Behavior

- Per-table-only acceleration concepts (`primary_key`, `on_conflict`, `indexes`, and other per-dataset overrides) are intentionally not configurable at the catalog level — they remain exclusively on an individual dataset's own `acceleration` block.
- While a table's acceleration is still bootstrapping, that table is reported as not-yet-present rather than being served through the source, so queries do not transparently fall back to the un-accelerated PostgreSQL table.

## Limitations

:::warning

- **`include` filters tables, not schemas.** The `include` patterns are matched against `schema.table`. All non-system schemas are still enumerated as (possibly empty) schemas even when no tables match.
- **Partial discovery failures.** If discovery of a schema's tables fails, that schema is skipped with a warning rather than aborting the whole catalog load. On refresh, a transient per-schema failure falls back to the last-known-good state for that schema, so intermittent errors do not cause catalog flapping; a schema is only dropped for a cycle if it has never refreshed successfully. Total connectivity loss (a failed `list_schemas`) still fails hard.
- **Amazon Redshift.** Redshift is supported over the PostgreSQL wire protocol, but its `pg_catalog` coverage is partial and it does not enforce foreign keys, so table/column comment and foreign-key metadata are often unavailable. Discovery degrades gracefully (tables are still registered).
- **Read-only; per-table acceleration not configurable.** Catalog tables are read-only, and per-table `acceleration` blocks cannot be set on individually discovered tables. Catalog-wide CDC acceleration _is_ available for PostgreSQL — see [Catalog-Level CDC Acceleration](#catalog-level-cdc-acceleration).

:::

## Cookbook

There is a [cookbook recipe](https://github.com/spiceai/cookbook/tree/trunk/catalogs/postgres) demonstrating the PostgreSQL Catalog Connector with the TPC-H dataset.

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores#using-secrets).
