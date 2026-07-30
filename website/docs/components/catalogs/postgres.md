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

## `exclude`

Optional. Use the `exclude` field to omit tables that would otherwise be included. It is matched against `schema.table` using the same glob syntax as `include`, and multiple `exclude` patterns are OR'ed together.

`exclude` takes precedence over `include`: a table is registered only when it matches `include` (or no `include` is set) **and** matches no `exclude` pattern.

```yaml
catalogs:
  - from: pg
    name: my_pg
    include:
      - 'public.*' # Consider every table in the "public" schema...
    exclude:
      - 'public.*_audit' # ...except the audit tables.
    params:
      pg_connection_string: postgresql://${secrets:PG_USER}:${secrets:PG_PASS}@localhost:5432/my_database
```

Excluded tables are filtered out before their schema is read, so narrow patterns also reduce the metadata load each refresh places on the source — see [Catalog Refresh](#catalog-refresh). A common use is to keep tables that cannot be CDC-accelerated out of an accelerated catalog's scope, which also suppresses their skip warnings — see [Table eligibility](#table-eligibility).

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

## Catalog Refresh

The catalog is discovered once when the runtime starts, and then re-discovered every **60 seconds**. This interval is not currently configurable.

Each cycle re-runs discovery from scratch, so schema changes at the source are picked up without restarting Spice: newly created tables and schemas appear, dropped ones disappear, and column additions, removals, and type changes are reflected when the table's schema is re-read. A source DDL change therefore becomes visible in Spice within roughly one refresh interval — up to about 60 seconds, plus the time the refresh itself takes.

### Source metadata load

Because every cycle re-discovers the catalog, the metadata load on the source database scales with catalog size rather than with query volume. Each refresh issues:

- One query to enumerate non-system schemas.
- Per schema: one query for its relations (`pg_catalog.pg_class`), one for foreign-key constraints, and one for table and column comments.
- Per selected table: one lookup to read its columns and build its Arrow schema.

Use `include`/`exclude` to narrow the catalog on large databases. Filtered-out tables are skipped before their per-table schema lookup, so tighter patterns directly reduce the per-cycle query count. Note that `include`/`exclude` filter tables, not schemas — every non-system schema is still enumerated, so the per-schema queries are unaffected.

### Refresh failures

Failure is handled differently at initial load than on a later refresh cycle:

- **Initial discovery** — the catalog does not register, its status is set to `Error`, and the load is retried with a fibonacci backoff until it succeeds. Two problems are treated as permanent misconfiguration and are _not_ retried: no eligible tables for an accelerated catalog, and a replication slot already actively held by another consumer.
- **Later refresh cycles** — a failure is logged at `ERROR` and the catalog keeps serving its last-known-good state until a subsequent cycle succeeds. The schema map is replaced atomically at the end of a cycle, so queries never observe a partially-refreshed catalog.

Failures isolated to a single schema are handled per-schema rather than failing the whole cycle — see [Limitations](#limitations).

## Catalog-Level CDC Acceleration

A PostgreSQL catalog can be accelerated as a whole. Adding an `acceleration` block bootstraps and CDC-accelerates every discovered table (subject to `include`/`exclude`) with no per-table dataset configuration. All accelerated tables share a single replication slot and publication — derived deterministically from the catalog `name`, see [Shared replication slot](#shared-replication-slot) — so the source's write-ahead log (WAL) is decoded once for the entire catalog instead of once per table.

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

### Shared replication slot

The catalog's slot name is `spice_catalog_{catalog_name}_{hash}` — the sanitized catalog `name`, followed by a short hash of the full name so two long names that share a truncated prefix stay distinct, all within PostgreSQL's 63-byte identifier limit. The `spice_catalog_` prefix distinguishes it from the per-dataset `spice_` slots, so a catalog slot and a same-named dataset slot can never collide.

The name is a pure function of the catalog `name`: it carries no instance, host, or process component, and Spice persists no slot identity of its own — the durable state is the PostgreSQL slot itself. Two consequences follow:

- **Restarts and reschedules reuse the slot.** Restarting the runtime, or rescheduling the catalog onto a different node, recomputes the identical name and resumes from the existing slot instead of orphaning it and re-snapshotting the catalog from scratch.
- **Two Spice instances cannot accelerate the same catalog.** PostgreSQL permits one consumer per replication slot, so before it starts streaming Spice checks whether the slot is already **actively** held. An absent slot is created by the per-table replication path; a present-but-inactive slot is reused; an actively-held slot fails the catalog to load with an error naming the slot and the consumer holding it.

Because a slot can also read as active immediately after the runtime's *own* ungraceful exit — PostgreSQL keeps the walsender marked active until `wal_sender_timeout` elapses — Spice waits for it to free before concluding another consumer owns it. The wait is the server's `wal_sender_timeout` plus a 5-second grace, polled once a second, capped at 3 minutes; when `wal_sender_timeout` is `0` (disabled) a 90-second budget is used instead, because the server will not time out the dropped consumer on its own.

:::warning
Run only one Spice instance per accelerated PostgreSQL catalog. Because the slot name is instance-independent, a second instance configured with the same catalog `name` competes for the same slot and fails to load rather than silently splitting the change stream.
:::

### Table eligibility

Each discovered table is accelerated according to its PostgreSQL [`REPLICA IDENTITY`](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY), which determines the row identity available for change data capture:

- **`DEFAULT` with a primary key** — accelerated, keyed by the primary key.
- **`USING INDEX`** — accelerated, keyed by the nominated unique index.
- **`FULL`** — accelerated, but heavier: PostgreSQL logs the full old-row image on every `UPDATE`/`DELETE`, so a warning is logged. Prefer a primary key or `USING INDEX` where possible.
- **No usable CDC key** (`NOTHING`, a keyless `DEFAULT` or `FULL`, or an unusable identity index) — **skipped with an actionable warning** and left out of the catalog's namespace. The rest of the catalog still replicates; a single ineligible table never fails the whole catalog.

Use `include`/`exclude` to narrow scope and suppress the skip warning for tables you will handle another way (federation, or a per-dataset `refresh_mode: full`).

Views, materialized views, and foreign tables are **not replicated**. They have no `REPLICA IDENTITY`, so they cannot be CDC-accelerated at all — unlike a table with an unusable replica identity, which is at least reported as skipped. Each one is named in a warning at load and is absent from the accelerated catalog's namespace. Query them through a non-accelerated catalog or an individual dataset instead, or exclude them via the catalog's `include`/`exclude` patterns to suppress the warning. This is the one way an accelerated PostgreSQL catalog's namespace differs from the [relation types discovered](#discovered-relations) by an un-accelerated one.

The startup summary reports the accelerated tables broken down by the CDC key each one resolved to — primary key, `USING INDEX`, or `FULL` — alongside the skipped and excluded counts, and names the shared replication slot in use.

If **no** table is eligible, the catalog fails to load with an `ERROR` status rather than registering an empty catalog. The error names the excluded and skipped counts and the fix. Because discovery happens at startup, an empty result is treated as a configuration problem: either every table lacks a usable CDC key, or the `include`/`exclude` patterns matched nothing.

### Acceleration metrics

Each catalog refresh records the current table dispositions as gauges — see [Available Metrics](../../features/observability/index.md#available-metrics):

| Metric                                    | Dimensions           | Meaning                                                                                     |
| ----------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------- |
| `catalog_acceleration_tables`             | `catalog`, `category` | Relations resolved into each disposition: `accelerated`, `skipped`, `excluded`, or `views_not_replicated`. |
| `catalog_acceleration_accelerated_tables` | `catalog`, `kind`     | Accelerated tables by the CDC key accelerating them: `primary_key`, `unique_index`, or `full`. |

They are gauges rather than counters because each refresh re-plans the whole namespace, so a value can rise or fall.

### Behavior

- Per-table-only acceleration concepts (`primary_key`, `on_conflict`, `indexes`, and other per-dataset overrides) are intentionally not configurable at the catalog level — they remain exclusively on an individual dataset's own `acceleration` block.
- While a table's acceleration is still bootstrapping, that table is reported as not-yet-present rather than being served through the source, so queries do not transparently fall back to the un-accelerated PostgreSQL table.

## Limitations

:::warning

- **`include`/`exclude` filter tables, not schemas.** Both are matched against `schema.table`. All non-system schemas are still enumerated as (possibly empty) schemas even when no tables match.
- **Partial discovery failures.** If discovery of a schema's tables fails, that schema is skipped with a warning rather than aborting the whole catalog load. On refresh, a transient per-schema failure falls back to the last-known-good state for that schema, so intermittent errors do not cause catalog flapping; a schema is only dropped for a cycle if it has never refreshed successfully. Total connectivity loss (a failed `list_schemas`) still fails hard.
- **Amazon Redshift — datashare and external tables are not discovered.** Discovery reads Redshift's _local_ catalog only (`information_schema.schemata` and `pg_catalog.pg_class`). Schemas and tables consumed from a datashare, and external schemas and tables (Redshift Spectrum), are absent from the local `pg_catalog` — Redshift exposes them only through its `svv_all_schemas` / `svv_all_tables` views, which the Catalog Connector does not query. Those relations do not appear in the catalog; register them as individual datasets with the [Redshift Data Connector](../data-connectors/redshift) instead ([#12109](https://github.com/spiceai/spiceai/issues/12109)).
- **Amazon Redshift — metadata coverage.** Redshift is supported over the PostgreSQL wire protocol, but its `pg_catalog` coverage is partial and it does not enforce foreign keys, so table/column comment and foreign-key metadata are often unavailable. Tables present in the local catalog are still registered.
- **Read-only; per-table acceleration not configurable.** Catalog tables are read-only, and per-table `acceleration` blocks cannot be set on individually discovered tables. Catalog-wide CDC acceleration _is_ available for PostgreSQL — see [Catalog-Level CDC Acceleration](#catalog-level-cdc-acceleration).

:::

## Cookbook

There is a [cookbook recipe](https://github.com/spiceai/cookbook/tree/trunk/catalogs/postgres) demonstrating the PostgreSQL Catalog Connector with the TPC-H dataset.

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores#using-secrets).
