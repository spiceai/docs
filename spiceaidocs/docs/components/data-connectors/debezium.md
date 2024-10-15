---
title: 'Debezium Data Connector'
sidebar_label: 'Debezium Data Connector'
description: 'Debezium Data Connector Documentation'
pagination_prev: null
---

[Debezium](https://debezium.io/) is an open-source platform that enables [Change Data Capture (CDC)](/features/cdc/index.md) for efficient real-time updates of locally accelerated datasets. Spice supports connecting to a Kafka topic managed by Debezium to keep datasets up-to-date with the source data.

```yaml
datasets:
  - from: debezium:my_kafka_topic_with_debezium_changes
    name: my_dataset
    params:
      debezium_transport: kafka # Optional. Only `kafka` is currently supported.
      debezium_message_format: json # Optional. Only `json` is currently supported.
      kafka_bootstrap_servers: broker1:9092,broker2:9092,broker3:9092 # Required. A comma separated list of Kafka broker servers.
    acceleration:
      enabled: true # Acceleration is required for the debezium connector.
      engine: duckdb # `duckdb`, `sqlite` and `postgres` are supported acceleration engines for Debezium.
      refresh_mode: changes # Optional. If specified, this is required to be set to `changes` - any other value is an error.
      mode: file # Persistence is recommended to not have to rebuild the table each time Spice starts.
```

:::warning[Limitations]
Currently, only the `PLAINTEXT` protocol is supported for connecting to Kafka. SSL and SASL are not yet supported.
:::

## Configuration

### `from`

The `from` field takes the form of `debezium:kafka_topic` where `kafka_topic` is the name of the Kafka topic where Debezium is notifying consumers about any upstream changes. In the example above it would listen to the `my_kafka_topic_with_debeziu_changes` topic.

### `name`

The dataset name. This will be used as the table name within Spice.

```yaml
datasets:
  - from: debezium:my_kafka_topic_with_debezium_changes
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

| Parameter Name            | Description                                                                                                                                                                                                                                                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `debezium_transport`      | Optional. The message broker transport to use. The default is `kafka`. Possible values: <ul><li>`kafka`: Use Kafka as the message broker transport. Spice may support additional transports in the future.</li></ul>                                                                                                        |
| `debezium_message_format` | Optional. The message format to use. The default is `json`. Possible values: <ul><li>`json`: Use JSON as the message format. Spice is expected to support additional message formats in the future, like `avro`.</li></ul>                                                                                                  |
| `kafka_bootstrap_servers` | Required. A list of host/port pairs for establishing the initial Kafka cluster connection. The client will use all servers, regardless of the bootstrapping servers specified here. This list only affects the initial hosts used to discover the full server set and should be formatted as `host1:port1,host2:port2,...`. |

### Acceleration Settings

:::warning

Using the Debezium connector **requires** [acceleration](/components/data-accelerators/index.md) to be enabled.

:::

The following settings are required:

| Parameter Name | Description                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`      | Required. Must be set to `true` to enable acceleration.                                                                                                                                                                                                                                                                                                                                              |
| `engine`       | Required. The acceleration engine to use. Possible valid values: <ul><li>`duckdb`: Use [DuckDB](/components/data-accelerators/duckdb.md) as the acceleration engine.</li><li>`sqlite`: Use [SQLite](/components/data-accelerators/sqlite.md) as the acceleration engine.</li><li>`postgres`: Use [PostgreSQL](/components/data-accelerators/postgres/index.md) as the acceleration engine.</li></ul> |
| `refresh_mode` | Optional. The refresh mode to use. If specified, this must be set to `changes`. Any other value is an error.                                                                                                                                                                                                                                                                                         |
| `mode`         | Optional. The persistence mode to use. When using the `duckdb` and `sqlite` engines, it is recommended to set this to `file` to persist the data across restarts. Spice also persists metadata about the dataset, so it can resume from the last known state of the dataset instead of re-fetching the entire dataset.                                                                               |

### Example

See an example of configuring a dataset to use CDC with Debezium by following the sample [Streaming changes in real-time with Debezium CDC](https://github.com/spiceai/samples/tree/trunk/cdc-debezium).

## Using secrets

There are currently three supported [secret stores](/components/secret-stores/index.md):

* [Environment variables](/components/secret-stores/env)
* [Kubernetes Secret Store](/components/secret-stores/kubernetes)
* [Keyring Secret Store](/components/secret-stores/keyring)
