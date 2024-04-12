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
```

## Configuration

The MySQL data connector can be configured by providing the following `params`:

- `mysql_connection_string`: The connection string to use to connect to the MySQL server. This can be used instead of providing individual connection parameters.
- `mysql_connection_string_key`: The secret key containing the connection string to use to connect to the MySQL server. This can be used instead of providing individual connection parameters.
- `mysql_host`: The hostname of the MySQL server.
- `mysql_port`: The port of the MySQL server.
- `mysql_db`: The name of the database to connect to.
- `mysql_user`: The username to connect with.
- `mysql_pass_key`: The secret key containing the password to connect with.
- `mysql_pass`: The raw password to connect with, ignored if `mysql_pass_key` is provided.
- `mysql_sslmode`: Optional parameter, specifies the SSL/TLS behavior for the connection, supported values:
  - `required`: (default) This mode requires an SSL connection. If a secure connection cannot be established, server will not connect.
  - `preferred`: This mode will try to establish a secure SSL connection if possible, but will connect insecurely if the server does not support SSL.
  - `disabled`: This mode will not attempt to use an SSL connection, even if the server supports it.
-  `mysql_sslrootcert`: Optional parameter specifying the path to a custom PEM certificate that the connector will trust.

Configuration `params` are provided either in the top level `dataset` for a dataset source and federated SQL query.

```yaml
datasets:
  - from: mysql:path.to.my_dataset
    name: my_dataset
    params:
      mysql_host: localhost
      mysql_port: '3306'
      mysql_db: my_database
      mysql_user: my_user
      mysql_pass_key: my_secret
```

```yaml
datasets:
  - from: mysql:path.to.my_dataset
    name: my_dataset
    params:
      mysql_host: localhost
      mysql_port: '3306'
      mysql_db: my_database
      mysql_user: my_user
      mysql_pass_key: my_secret
      mysql_sslmode: preferred
      mysql_sslrootcert: ./custom_cert.pem
```
