---
title: 'MySQL Data Connector'
sidebar_label: 'MySQL Data Connector'
description: 'MySQL Data Connector Documentation'
---

MySQL is an open-source relational database management system that uses structured query language (SQL) for managing and manipulating databases.

The MySQL Data Connector enables federated/accelerated SQL queries on data stored in MySQL databases.

```yaml
datasets:
  - from: mysql:mytable
    name: my_dataset
    params:
      mysql_host: localhost
      mysql_tcp_port: 3306
      mysql_db: my_database
      mysql_user: my_user
      mysql_pass: ${secrets:mysql_pass}
```

## Configuration

### `from`

The `from` field takes the form `mysql:database_name.table_name` where `database_name` is the fully-qualified table name in the SQL server.

If the `database_name` is omitted in the `from` field, the connector will use the database specified in the `mysql_db` parameter. If the `mysql_db` parameter is not provided, it will default to the user's default database.

These two examples are identical:

```yaml
datasets:
  - from: mysql:mytable
    name: my_dataset
    params:
      mysql_db: my_database
      ...
```

```yaml
datasets:
  - from: mysql:my_database.mytable
    name: my_dataset
    params:
      ...
```

### `name`

The dataset name. This will be used as the table name within Spice.

Example:
```yaml
datasets:
  - from: mysql:path.to.my_dataset
    name: cool_dataset
    params:
      ...
```

```sql
SELECT COUNT(*) FROM cool_dataset;
```

```shell
+----------+
| count(*) |
+----------+
| 6001215  |
+----------+
```

### `params`

The MySQL data connector can be configured by providing the following `params`. Use the [secret replacement syntax](../secret-stores/index.md) to load the secret from a secret store, e.g. `${secrets:my_mysql_conn_string}`.

| Parameter Name            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mysql_connection_string` | The connection string to use to connect to the MySQL server. This can be used instead of providing individual connection parameters.                                                                                                                                                                                                                                                                                                                                                                         |
| `mysql_host`              | The hostname of the MySQL server.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `mysql_tcp_port`          | The port of the MySQL server.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `mysql_db`                | The name of the database to connect to.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `mysql_user`              | The MySQL username.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `mysql_pass`              | The password to connect with.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `mysql_sslmode`           | Optional. Specifies the SSL/TLS behavior for the connection, supported values:<br /> <ul><li>`required`: (default) This mode requires an SSL connection. If a secure connection cannot be established, server will not connect.</li><li>`preferred`: This mode will try to establish a secure SSL connection if possible, but will connect insecurely if the server does not support SSL.</li><li>`disabled`: This mode will not attempt to use an SSL connection, even if the server supports it.</li></ul> |
| `mysql_sslrootcert`       | Optional parameter specifying the path to a custom PEM certificate that the connector will trust.                                                                                                                                                                                                                                                                                                                                                                                                            |

## Types

The table below shows the MySQL data types supported, along with the type mapping to Apache Arrow types in Spice.

| MySQL Type   | Arrow Type                     |
| ------------ | ------------------------------ |
| `TINYINT`    | `Int8`                         |
| `SMALLINT`   | `Int16`                        |
| `INT`        | `Int32`                        |
| `MEDIUMINT`  | `Int32`                        |
| `BIGINT`     | `Int64`                        |
| `DECIMAL`    | `Decimal128` / `Decimal256`    |
| `FLOAT`      | `Float32`                      |
| `DOUBLE`     | `Float64`                      |
| `DATETIME`   | `Timestamp(Microsecond, None)` |
| `TIMESTAMP`  | `Timestamp(Microsecond, None)` |
| `YEAR`       | `Int16`                        |
| `TIME`       | `Time64(Nanosecond)`           |
| `DATE`       | `Date32`                       |
| `CHAR`       | `Utf8`                         |
| `BINARY`     | `Binary`                       |
| `VARCHAR`    | `Utf8`                         |
| `VARBINARY`  | `Binary`                       |
| `TINYBLOB`   | `Binary`                       |
| `TINYTEXT`   | `Utf8`                         |
| `BLOB`       | `Binary`                       |
| `TEXT`       | `Utf8`                         |
| `MEDIUMBLOB` | `Binary`                       |
| `MEDIUMTEXT` | `Utf8`                         |
| `LONGBLOB`   | `LargeBinary`                  |
| `LONGTEXT`   | `LargeUtf8`                    |
| `SET`        | `Utf8`                         |
| `ENUM`       | `Dictionary(UInt16, Utf8)`     |
| `BIT`        | `UInt64`                       |

:::note

- MySQL `TIMESTAMP` value is the local time to the MySQL server timezone, the corresponding arrow `Timestamp(Microsecond, None)` type has the same local time value as MySQL `TIMESTAMP` value.

:::

## Examples

### Connecting using username and password

```yaml
datasets:
  - from: mysql:path.to.my_dataset
    name: my_dataset
    params:
      mysql_host: localhost
      mysql_tcp_port: 3306
      mysql_db: my_database
      mysql_user: my_user
      mysql_pass: ${secrets:mysql_pass}
```

### Connecting using SSL

```yaml
datasets:
  - from: mysql:path.to.my_dataset
    name: my_dataset
    params:
      mysql_host: localhost
      mysql_tcp_port: 3306
      mysql_db: my_database
      mysql_user: my_user
      mysql_pass: ${secrets:mysql_pass}
      mysql_sslmode: preferred
      mysql_sslrootcert: ./custom_cert.pem
```

### Connecting using a Connection String

```yaml
datasets:
  - from: mysql:path.to.my_dataset
    name: my_dataset
    params:
      mysql_connection_string: mysql://${secrets:my_user}:${secrets:my_password}@localhost:3306/my_db
```

### Connecting to the default database

```yaml
datasets:
  - from: mysql:mytable
    name: my_dataset
    params:
      mysql_host: localhost
      mysql_tcp_port: 3306
      mysql_user: my_user
      mysql_pass: ${secrets:mysql_pass}
```

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](/components/secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](/components/secret-stores#using-secrets).
