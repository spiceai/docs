---
title: 'Clickhouse Data Connector'
sidebar_label: 'Clickhouse Data Connector'
description: 'Clickhouse Data Connector Documentation'
---

ClickHouse is a fast, open-source columnar database management system designed for online analytical processing (OLAP) and real-time analytics. This connector enables federated SQL queries on top of data from a Clickhouse server.

```yaml
datasets:
  - from: clickhouse:path.to.my_dataset
    name: my_dataset
```

## Configuration

### `from`

The `from` field for the Clickhouse connector takes the form of `from:path_to_my_dataset` where `path_to_my_dataset` is the path to the Dataset within Clickhouse. In the example above it would be `path.to.my_dataset`.

### `name`

The dataset name. This will be used as the table name within Spice.

```yaml
datasets:
  - from: clickhouse:path.to.my_dataset
    name: cool_dataset
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

The Clickhouse data connector can be configured by providing the following `params`:

| Parameter Name                 | Definition                                                                                                                                                                                                                                                                                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clickhouse_connection_string` | The connection string to use to connect to the Clickhouse server. This can be used instead of providing individual connection parameters.                                                                                                                                                                               |
| `clickhouse_host`              | The hostname of the Clickhouse server.                                                                                                                                                                                                                                                                                  |
| `clickhouse_tcp_port`          | The port of the Clickhouse server.                                                                                                                                                                                                                                                                                      |
| `clickhouse_db`                | The name of the database to connect to.                                                                                                                                                                                                                                                                                 |
| `clickhouse_user`              | The username to connect with.                                                                                                                                                                                                                                                                                           |
| `clickhouse_pass`              | The password to connect with.                                                                                                                                                                                                                                                                                           |
| `clickhouse_secure`            | Optional. Specifies the SSL/TLS behavior for the connection, supported values:<br /> <ul><li>`true`: (default) This mode requires an SSL connection. If a secure connection cannot be established, server will not connect.</li><li>`false`: This mode will not attempt to use an SSL connection, even if the server supports it.</li></ul> |
| `connection_timeout`           | Optional. Specifies the connection timeout in milliseconds.                                                                                                                                                                                                                                                             |

## Examples

### Connecting to localhost

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
      clickhouse_secure: false
```

### Specifying a connection timeout

```yaml
datasets:
  - from: clickhouse:path.to.my_dataset
    name: my_dataset
    params:
      clickhouse_connection_string: tcp://my_user:${secrets:my_clickhouse_pass}@localhost:9000/my_database
      connection_timeout: 10000
      clickhouse_secure: true
```

### Using a connection string

```yaml
datasets:
  - from: clickhouse:path.to.my_dataset
    name: my_dataset
    params:
      clickhouse_connection_string: tcp://my_user:${secrets:my_clickhouse_pass}@localhost:9000/my_database?connection_timeout=10000&secure=true
```

## Using secrets

There are currently three supported [secret stores](/components/secret-stores/index.md):

* [Environment variables](/components/secret-stores/env)
* [Kubernetes Secret Store](/components/secret-stores/kubernetes)
* [Keyring Secret Store](/components/secret-stores/keyring)