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
| `pg_sslrootcert` | Path to the SSL root certificate file.                                 |

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

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores#using-secrets).
