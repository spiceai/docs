---
title: 'Clickhouse Data Connector'
sidebar_label: 'Clickhouse Data Connector'
description: 'Clickhouse Data Connector Documentation'
---

## Federated SQL query

To connect to any Clickhouse database as connector for federated SQL query, specify `clickhouse` as the selector in the `from` value for the dataset.

```yaml
datasets:
  - from: clickhouse:path.to.my_dataset
    name: my_dataset
```

## Configuration

The Clickhouse data connector can be configured by providing the following `params`:

- `clickhouse_connection_string`: The connection string to use to connect to the Clickhouse server. This can be used instead of providing individual connection parameters. Use the [secret replacement syntax](../secret-stores/index.md) to load the password from a secret store, e.g. `${secrets:my_clickhouse_conn_string}`.
- `clickhouse_host`: The hostname of the Clickhouse server.
- `clickhouse_tcp_port`: The port of the Clickhouse server.
- `clickhouse_db`: The name of the database to connect to.
- `clickhouse_user`: The username to connect with.
- `clickhouse_pass`: The password to connect with. Use the [secret replacement syntax](../secret-stores/index.md) to load the password from a secret store, e.g. `${secrets:my_clickhouse_pass}`.
- `clickhouse_secure`: Optional. Specifies the SSL/TLS behavior for the connection, supported values:
  - `true`: (default) This mode requires an SSL connection. If a secure connection cannot be established, server will not connect.
  - `false`: This mode will not attempt to use an SSL connection, even if the server supports it.
- `connection_timeout`: Optional. Specifies the connection timeout in milliseconds.

Configuration `params` are provided in the top level `dataset` for a dataset source and federated SQL query.

```yaml
datasets:
  - from: clickhouse:path.to.my_dataset
    name: my_dataset
    params:
      clickhouse_host: localhost
      clickhouse_tcp_port: 9000
      clickhouse_db: my_database
      clickhouse_user: my_user
      clickhouse_pass: ${secrets:my_clickhouse_pass}
      connection_timeout: 10000
      clickhouse_secure: true
```

```yaml
datasets:
  - from: clickhouse:path.to.my_dataset
    name: my_dataset
    params:
      clickhouse_connection_string: tcp://my_user:${secrets:my_clickhouse_pass}@localhost:9000/my_database
      connection_timeout: 10000
      clickhouse_secure: true
```

```yaml
datasets:
  - from: clickhouse:path.to.my_dataset
    name: my_dataset
    params:
      clickhouse_connection_string: tcp://my_user:${secrets:my_clickhouse_pass}@localhost:9000/my_database?connection_timeout=10000&secure=true
```
