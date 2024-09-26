---
title: 'MySQL Data Connector'
sidebar_label: 'MySQL Data Connector'
description: 'MySQL Data Connector Documentation'
---

## Federated SQL query

To connect to any MySQL database as connector for federated SQL query, specify `mysql` as the selector in the `from` value for the dataset.

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

## Configuration

The MySQL data connector can be configured by providing the following `params`. Use the [secret replacement syntax](../secret-stores/index.md) to load the secret from a secret store, e.g. `${secrets:my_mysql_conn_string}`.

- `mysql_connection_string`: The connection string to use to connect to the MySQL server. This can be used instead of providing individual connection parameters.
- `mysql_host`: The hostname of the MySQL server.
- `mysql_tcp_port`: The port of the MySQL server.
- `mysql_db`: The name of the database to connect to.
- `mysql_user`: The MySQL username.
- `mysql_pass`: The password to connect with.
- `mysql_sslmode`: Optional. Specifies the SSL/TLS behavior for the connection, supported values:
  - `required`: (default) This mode requires an SSL connection. If a secure connection cannot be established, server will not connect.
  - `preferred`: This mode will try to establish a secure SSL connection if possible, but will connect insecurely if the server does not support SSL.
  - `disabled`: This mode will not attempt to use an SSL connection, even if the server supports it.
- `mysql_sslrootcert`: Optional parameter specifying the path to a custom PEM certificate that the connector will trust.

Configuration `params` are provided either in the top level `dataset` for a dataset source and federated SQL query.

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

```yaml
datasets:
  - from: mysql:path.to.my_dataset
    name: my_dataset
    params:
      mysql_connection_string: mysql://${secrets:my_user}:${secrets:my_password}@localhost:3306/my_db
```

## Types

The table below shows the MySQL data types supported, along with the type mapping to Apache Arrow types in Spice.

| MySQL Type | Arrow Type                   |
| ---------- | ---------------------------- |
| TINYINT    | Int8                         |
| SMALLINT   | Int16                        |
| INT        | Int32                        |
| MEDIUMINT  | Int32                        |
| BIGINT     | Int64                        |
| DECIMAL    | Decimal128 / Decimal256      |
| FLOAT      | Float32                      |
| DOUBLE     | Float64                      |
| DATETIME   | Timestamp(Microsecond, None) |
| TIMESTAMP  | Timestamp(Microsecond, None) |
| YEAR       | Int16                        |
| TIME       | Time64(Nanosecond)           |
| DATE       | Date32                       |
| CHAR       | Utf8                         |
| BINARY     | Binary                       |
| VARCHAR    | Utf8                         |
| VARBINARY  | Binary                       |
| TINYBLOB   | Binary                       |
| TINYTEXT   | Utf8                         |
| BLOB       | Binary                       |
| TEXT       | Utf8                         |
| MEDIUMBLOB | Binary                       |
| MEDIUMTEXT | Utf8                         |
| LONGBLOB   | LargeBinary                  |
| LONGTEXT   | LargeUtf8                    |
| SET        | Utf8                         |
| ENUM       | Dictionary(UInt16, Utf8)     |
| BIT        | UInt64                       |
