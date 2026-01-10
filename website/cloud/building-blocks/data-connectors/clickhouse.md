---
description: 'ClickHouse Data Connector Documentation'
---

# ClickHouse Data Connector

ClickHouse is a fast, open-source columnar database management system designed for online analytical processing (OLAP) and real-time analytics. This connector enables federated SQL queries from a ClickHouse server.

```yaml
datasets:
  - from: clickhouse:my.dataset
    name: my_dataset
```

## Configuration

### `from`

The `from` field for the ClickHouse connector takes the form of `from:db.dataset` where `db.dataset` is the path to the Dataset within ClickHouse. In the example above it would be `my.dataset`.

If `db` is not specified in either the `from` field or the `clickhouse_db` parameter, it will default to the `default` database.

### `name`

The dataset name. This will be used as the table name within Spice.

```yaml
datasets:
  - from: clickhouse:my.dataset
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

The ClickHouse data connector can be configured by providing the following `params`:

| Parameter Name                 | Definition                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clickhouse_connection_string` | The connection string to use to connect to the ClickHouse server. This can be used instead of providing individual connection parameters.                                                                                                                                                                                                   |
| `clickhouse_host`              | The hostname of the ClickHouse server.                                                                                                                                                                                                                                                                                                      |
| `clickhouse_tcp_port`          | The port of the ClickHouse server.                                                                                                                                                                                                                                                                                                          |
| `clickhouse_db`                | The name of the database to connect to.                                                                                                                                                                                                                                                                                                     |
| `clickhouse_user`              | The username to connect with.                                                                                                                                                                                                                                                                                                               |
| `clickhouse_pass`              | The password to connect with.                                                                                                                                                                                                                                                                                                               |
| `clickhouse_secure`            | Optional. Specifies the SSL/TLS behavior for the connection, supported values:<br /> <ul><li>`true`: (default) This mode requires an SSL connection. If a secure connection cannot be established, server will not connect.</li><li>`false`: This mode will not attempt to use an SSL connection, even if the server supports it.</li></ul> |
| `connection_timeout`           | Optional. Specifies the connection timeout in milliseconds.                                                                                                                                                                                                                                                                                 |

## Examples

### Specifying a connection timeout

```yaml
datasets:
  - from: clickhouse:my.dataset
    name: my_dataset
    params:
      clickhouse_connection_string: tcp://my_user:${secrets:my_clickhouse_pass}@host/my_database
      connection_timeout: 10000
      clickhouse_secure: true
```

### Using a connection string

```yaml
datasets:
  - from: clickhouse:my.dataset
    name: my_dataset
    params:
      clickhouse_connection_string: tcp://my_user:${secrets:my_clickhouse_pass}@host/my_database?connection_timeout=10000&secure=true
```
