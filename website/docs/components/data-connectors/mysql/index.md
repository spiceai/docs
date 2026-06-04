---
title: 'MySQL Data Connector'
sidebar_label: 'MySQL Data Connector'
description: 'MySQL Data Connector Documentation'
tags:
  - data-connectors
  - mysql
  - relational
  - component-metrics
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
      mysql_pool_min: 1
      mysql_pool_max: 5
```

## Configuration

### `from`

The `from` field takes the form `mysql:database_name.table_name` where `database_name` is the fully-qualified table name in the SQL server.

If the `database_name` is omitted in the `from` field, the connector will use the database specified in the `mysql_db` parameter. If the `mysql_db` parameter is not provided, it will default to the user's default database.

:::info
Unquoted identifiers are normalized to lowercase. To reference a table or database with mixed-case characters, wrap each case-sensitive part in double quotes: `mysql:my_database."MixedCaseTable"`. See [Identifier Case Sensitivity](../index.md#identifier-case-sensitivity-and-quoting).
:::

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
    params: ...
```

### `name`

The dataset name. This will be used as the table name within Spice.

Example:

```yaml
datasets:
  - from: mysql:path.to.my_dataset
    name: cool_dataset
    params: ...
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

The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords) or any of the following keywords that are reserved by MySQL:

- `PARTITION`

### `params`

The MySQL data connector can be configured by providing the following `params`. Use the [secret replacement syntax](../secret-stores/) to load the secret from a secret store, e.g. `${secrets:my_mysql_conn_string}`.

| Parameter Name            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mysql_connection_string` | The connection string to use to connect to the MySQL server. This can be used instead of providing individual connection parameters.                                                                                                                                                                                                                                                                                                                                                                         |
| `mysql_host`              | The hostname of the MySQL server.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `mysql_tcp_port`          | The port of the MySQL server.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `mysql_db`                | The name of the database to connect to.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `mysql_user`              | The MySQL username.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `mysql_pass`              | The password to connect with.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `mysql_sslmode`           | Optional. Specifies the SSL/TLS behavior for the connection, supported values:<br /> <ul><li>`required`: (default) Require TLS and verify the server certificate against system root CAs and domain name (equivalent to `verify_identity`). Set `mysql_sslrootcert` to verify against a specific CA bundle instead of the system trust store.</li><li>`preferred`: Attempt a TLS connection but skip certificate and hostname verification (invalid or self-signed certificates are accepted). The connection is still encrypted and does **not** fall back to plaintext — if the server does not support TLS, the connection fails. Not recommended for production, as it does not protect against man-in-the-middle attacks.</li><li>`disabled`: Do not attempt to use an SSL connection, even if the server supports it.</li></ul> |
| `mysql_sslrootcert`       | Optional parameter specifying the path to a custom PEM certificate that the connector will trust.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `mysql_time_zone`         | Optional. Specifies connection time zone. Default is `+00:00` (UTC). Accepts: <br /><ul><li>Fixed offsets (e.g., `+02:00`).</li><li>IANA time zone names (e.g., `America/Los_Angeles`), if supported by the MySQL server.</li><li>`system`: The MySQL server host’s OS time zone.</li><li>`local_system`: The local runtime OS time zone.</li></ul>                                                                                                                                                                   |
| `mysql_pool_min`          | The minimum number of connections to keep open in the pool, lazily created when requested.  Default: `1`                                                                                                                                                                                                                                                                                                                                                                                                    |
| `mysql_pool_max`          | The maximum number of connections created in the connection pool. Default: `5`                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `mysql_zero_date_behavior` | Optional. How to handle the MySQL `0000-00-00` / `0000-00-00 00:00:00` zero-date sentinel for DATE/DATETIME/TIMESTAMP columns. Supported values:<br /> <ul><li>`null`: (default) Coerces zero dates to NULL and reports such columns as nullable in the Arrow schema.</li><li>`error`: Fails the scan when a zero date is encountered and honors the source NOT NULL constraint exactly.</li></ul> |

### `metrics`

The MySQL data connector supports the following optional [component metrics](../../features/observability/component_metrics):

| Metric Name                          | Type    | Description                                                                                                        |
| ------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------ |
| `connection_count`                   | Gauge   | Gauge of active connections to the database server                                                                 |
| `connections_in_pool`                | Gauge   | Gauge of active connections that are idling in the pool                                                            |
| `active_wait_requests`               | Gauge   | Gauge of requests that are waiting for a connection to be returned to the pool                                     |
| `create_failed`                      | Counter | Counter of connections that failed to be created                                                                   |
| `discarded_superfluous_connection`   | Counter | Counter of connections that were closed because there were already enough idle connections in the pool             |
| `discarded_unestablished_connection` | Counter | Counter of connections that were closed because they could not be established                                      |
| `dirty_connection_return`            | Counter | Counter of connections that were returned to the pool but were dirty (ie. open transactions, pending queries, etc) |
| `discarded_expired_connection`       | Counter | Counter of connections that were discarded because they were expired by the pool constraints (i.e. TTL expired)    |
| `resetting_connection`               | Counter | Counter of connections that were reset                                                                             |
| `discarded_error_during_cleanup`     | Counter | Counter of connections that were discarded because they returned an error during cleanup                           |
| `connection_returned_to_pool`        | Counter | Counter of connections that were returned to the pool                                                              |

These metrics are not enabled by default, enable them by setting the `metrics` parameter:

```yaml
datasets:
  - from: mysql:mytable
    name: my_dataset
    metrics:
      - name: connection_count
      - name: connections_in_pool
      - name: active_wait_requests
      - name: create_failed
      - name: discarded_superfluous_connection
      - name: discarded_unestablished_connection
      - name: dirty_connection_return
      - name: discarded_expired_connection
      - name: resetting_connection
      - name: discarded_error_during_cleanup
      - name: connection_returned_to_pool
    params: &params
      mysql_host: localhost
      mysql_tcp_port: 3306
      mysql_user: my_user
      mysql_pass: ${secrets:mysql_pass}
```

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
| `JSON`       | `LargeUtf8`                    |
| `SET`        | `Utf8`                         |
| `ENUM`       | `Dictionary(UInt16, Utf8)`     |
| `BIT`        | `UInt64`                       |

:::note

- The MySQL `TIMESTAMP` value is [retrieved as a UTC time value](https://dev.mysql.com/doc/refman/8.4/en/datetime.html) by default. Use the `mysql_time_zone` configuration parameter to specify the desired time zone for interpreting `TIMESTAMP` values during data retrieval.

:::

## Limitations

- MySQL has no native nested or array column types (see the [MySQL data types reference](https://dev.mysql.com/doc/refman/8.4/en/data-types.html)), so columns containing Arrow `Struct`, `List`, or `LargeList` values are not supported by this connector.
- [MySQL spatial types](https://dev.mysql.com/doc/refman/8.4/en/spatial-types.html) (`GEOMETRY`, `POINT`, `LINESTRING`, `POLYGON`, `MULTIPOINT`, `MULTILINESTRING`, `MULTIPOLYGON`, `GEOMETRYCOLLECTION`) are not currently supported — only the types listed in the [Types](#types) table are mapped to Arrow.
- Nested or array-valued data should be stored in a `JSON` column, which is read as `LargeUtf8` and can be decoded with SQL JSON functions.

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

### With custom connection pool settings

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
      mysql_pool_min: 5
      mysql_pool_max: 10
```

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores/). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores/#using-secrets).

## Cookbook

- A cookbook recipe to configure MySQL as a data connector in Spice. [MySQL Data Connector](https://github.com/spiceai/cookbook/tree/trunk/mysql/connector#readme)
- A cookbook recipe to configure AWS RDS Aurora (MySQL Compatible) as a data connector in Spice. [AWS RDS Aurora (MySQL Data Connector)](https://github.com/spiceai/cookbook/tree/trunk/mysql/rds-aurora#readme)
- A cookbook recipe to configure Planetscale as a data connector in Spice. [Planetscale (MySQL Data Connector)](https://github.com/spiceai/cookbook/tree/trunk/mysql/planetscale#readme)
