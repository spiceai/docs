---
title: 'MySQL Catalog Connector'
sidebar_label: 'MySQL'
description: 'Connect to a MySQL database as a catalog provider for federated SQL query.'
sidebar_position: 9
pagination_prev: null
pagination_next: null
tags:
  - catalogs
  - mysql
  - data-connectors
---

Connect to a [MySQL](https://www.mysql.com/) database as a catalog provider for federated SQL query. The MySQL Catalog Connector automatically discovers schemas and tables within a MySQL server and makes them available for querying in Spice.

For connecting to individual MySQL tables, see the [MySQL Data Connector documentation](../data-connectors/mysql).

## Configuration

```yaml
catalogs:
  - from: mysql
    name: my_mysql
    include:
      - 'my_database.*' # include all tables from my_database
    params:
      mysql_connection_string: mysql://${secrets:MYSQL_USER}:${secrets:MYSQL_PASS}@localhost:3306/my_database
```

## `from`

The `from` field specifies the catalog provider. For MySQL, use `mysql`.

## `name`

The `name` field specifies the name of the catalog in Spice. Tables from the MySQL server will be available under this catalog name. The schema hierarchy of the MySQL server is preserved in Spice.

## `include`

Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables. For example, `*.my_table_name` would include all tables with the name `my_table_name` from any schema. Multiple `include` patterns are OR'ed together.

## `exclude`

Optional. Use the `exclude` field to omit tables that would otherwise be included. It is matched against the same table name as `include`, using the same glob syntax, and multiple `exclude` patterns are OR'ed together. `exclude` takes precedence over `include`: a table is registered only when it matches `include` (or no `include` is set) **and** matches no `exclude` pattern.

## `params`

Connection can be configured using a connection string or individual parameters.

### Connection string

| Parameter Name            | Description                                                               |
| ------------------------- | ------------------------------------------------------------------------- |
| `mysql_connection_string` | A MySQL connection string. E.g. `mysql://user:password@host:port/dbname`. |

### Individual parameters

| Parameter Name      | Description                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `mysql_host`        | The MySQL host address. Default: `localhost`.                                                  |
| `mysql_tcp_port`    | The MySQL port number. Default: `3306`.                                                        |
| `mysql_db`          | The MySQL database name.                                                                       |
| `mysql_user`        | The MySQL username for authentication.                                                         |
| `mysql_pass`        | The MySQL password for authentication.                                                         |
| `mysql_sslmode`     | The SSL mode for the connection (`disabled`, `required`, or `preferred`). Default: `required`. |
| `mysql_sslrootcert` | Path to the SSL root certificate file.                                                         |

## Authentication

### Connection string

```yaml
catalogs:
  - from: mysql
    name: my_mysql
    params:
      mysql_connection_string: mysql://${secrets:MYSQL_USER}:${secrets:MYSQL_PASS}@localhost:3306/my_database
```

### Individual parameters

```yaml
catalogs:
  - from: mysql
    name: my_mysql
    params:
      mysql_host: localhost
      mysql_tcp_port: '3306'
      mysql_db: my_database
      mysql_user: ${secrets:MYSQL_USER}
      mysql_pass: ${secrets:MYSQL_PASS}
      mysql_sslmode: required
```

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores#using-secrets).
