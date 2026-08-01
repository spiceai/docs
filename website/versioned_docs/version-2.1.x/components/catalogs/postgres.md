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

## Foreign Key Discovery

The PostgreSQL Catalog Connector automatically discovers foreign key relationships by querying `information_schema.referential_constraints` and `key_column_usage` during catalog refresh. Discovered FK metadata is attached to each table's Arrow schema and surfaces through:

- The `table_schema` tool — agents can use FK relationships to infer join paths between tables
- FlightSQL `GetTables` — programmatic clients receive FK metadata in the schema response

No configuration is required. If FK discovery fails for a schema (e.g., due to insufficient permissions on `information_schema`), tables are still registered without FK metadata and a warning is logged.

## Limitations

:::warning

- **Base tables and standard views only.** The connector discovers `BASE TABLE` and `VIEW` relations. Materialized views and foreign tables are not currently discovered and will not appear in the catalog ([#11725](https://github.com/spiceai/spiceai/issues/11725)).
- **Partitioned tables.** For declaratively-partitioned tables, both the partitioned parent and each child partition are registered as separate tables ([#11726](https://github.com/spiceai/spiceai/issues/11726)).
- **`include` filters tables, not schemas.** The `include` patterns are matched against `schema.table`. All non-system schemas are still enumerated as (possibly empty) schemas even when no tables match.
- **Unsupported column types.** Tables containing a column of a type that cannot be mapped are skipped entirely and a warning is logged. The `unsupported_type_action` behavior available on individual PostgreSQL datasets is not applied on the catalog path ([#11728](https://github.com/spiceai/spiceai/issues/11728)).
- **Partial discovery failures.** If discovery of a schema's tables fails during the initial load, the catalog fails to register rather than loading the reachable schemas ([#11724](https://github.com/spiceai/spiceai/issues/11724)).
- **Amazon Redshift — datashare and external tables are not discovered.** Discovery reads Redshift's _local_ catalog only (`information_schema.tables` and `information_schema.schemata`). Schemas and tables consumed from a datashare, and external schemas and tables (Redshift Spectrum), are absent from the local catalog — Redshift exposes them only through its `svv_all_schemas` / `svv_all_tables` views, which the Catalog Connector does not query. Those relations do not appear in the catalog; register them as individual datasets with the [Redshift Data Connector](../data-connectors/redshift) instead ([#12109](https://github.com/spiceai/spiceai/issues/12109)).
- **Amazon Redshift — metadata coverage.** Redshift is supported over the PostgreSQL wire protocol, but its `pg_catalog` coverage is partial and it does not enforce foreign keys, so table/column comment and foreign-key metadata are often unavailable. Tables present in the local catalog are still registered.
- **Read-only.** Catalog tables are read-only. Accelerations cannot be configured on tables discovered through an external catalog.

:::

## Cookbook

There is a [cookbook recipe](https://github.com/spiceai/cookbook/tree/trunk/catalogs/postgres) demonstrating the PostgreSQL Catalog Connector with the TPC-H dataset.

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores#using-secrets).
