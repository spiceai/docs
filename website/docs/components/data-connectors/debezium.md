---
title: 'Debezium Data Connector'
sidebar_label: 'Debezium Data Connector'
description: 'Debezium Data Connector Documentation'
tags:
  - data-connectors
  - debezium
  - component-metrics
---

[Debezium](https://debezium.io/) is an open-source platform that enables [Change Data Capture (CDC)](../../features/cdc) for efficient real-time updates of locally accelerated datasets. Spice supports connecting to a Kafka topic managed by Debezium to keep datasets up-to-date with the source data.

```yaml
datasets:
  - from: debezium:my_kafka_topic_with_debezium_changes
    name: my_dataset
    params:
      debezium_transport: kafka # Optional. Only `kafka` is currently supported.
      debezium_message_format: json # Optional. Only `json` is currently supported.
      kafka_bootstrap_servers: broker1:9092,broker2:9092,broker3:9092 # Required. A comma separated list of Kafka broker servers.
      kafka_security_protocol: SASL_SSL # Default is `SASL_SSL`. Valid values are `PLAINTEXT`, `SSL`, `SASL_PLAINTEXT`, `SASL_SSL`.
      kafka_sasl_mechanism: SCRAM-SHA-512 # Default is `SCRAM-SHA-512`. Valid values are `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`.
      kafka_sasl_username: kafka # Required if `kafka_security_protocol` is `SASL_PLAINTEXT` or `SASL_SSL`.
      kafka_sasl_password: ${secrets:kafka_sasl_password} # Required if `kafka_security_protocol` is `SASL_PLAINTEXT` or `SASL_SSL`.
      kafka_ssl_ca_location: ./certs/kafka_ca_cert.pem # Optional. Used to verify the SSL/TLS certificate of the Kafka broker.
      kafka_enable_ssl_certificate_verification: true # Default is `true`. Set to `false` to disable SSL/TLS certificate verification.
      kafka_ssl_endpoint_identification_algorithm: https # Default is `https`. Valid values are `none` and `https`.
      batch_max_size: 10000 # Default is `10000`. Maximum number of change events to batch together before processing.
      batch_max_duration: 1s # Default is `1s`. Maximum time to wait for a batch to fill before processing.

    acceleration:
      enabled: true # Acceleration is required for the debezium connector.
      engine: duckdb # `duckdb`, `sqlite` and `postgres` are supported acceleration engines for Debezium.
      refresh_mode: changes # Optional. If specified, this is required to be set to `changes` - any other value is an error.
      mode: file # Persistence is recommended to not have to rebuild the table each time Spice starts.
```

## Overview

Upon startup, Spice subscribes to the specified Debezium-managed Kafka topic using either a uniquely generated consumer group or a custom one specified via `kafka_consumer_group_id`. If a persistent acceleration engine is used (with `mode: file`), data is fetched starting from the last processed record, allowing Spice to resume without reprocessing all historical change events.

## Consumer Group Management

The Debezium connector manages consumer groups to ensure data consistency across restarts. Offsets are committed to Kafka, allowing Spice to track consumption progress.

**Default behavior:** When no `kafka_consumer_group_id` is specified, Spice automatically generates a unique consumer group ID and stores it in the acceleration metadata. On subsequent restarts, Spice retrieves and reuses this stored consumer group ID to maintain offset tracking and resume consumption from where it left off.

**Custom consumer group:** If you specify a custom `kafka_consumer_group_id`, Spice stores this ID in the acceleration metadata. The same consumer group must be used on subsequent restarts. If no acceleration data exists and a custom consumer group is provided, Spice will reset its position to the oldest available offset and begin consuming from the start of the topic.

**Consumer group mismatch error:** Spice will return an error if a restart is attempted with a different consumer group than what is stored in the acceleration metadata. This applies to both auto-generated and custom consumer group IDs. This safeguard prevents data inconsistency that could occur from mixing offsets between different consumer groups.

To resolve a consumer group mismatch, either:
- Use the same consumer group ID as stored in the acceleration
- Reset the acceleration data to start fresh with a new consumer group

## Configuration

### `from`

The `from` field takes the form of `debezium:kafka_topic` where `kafka_topic` is the name of the Kafka topic where Debezium is notifying consumers about any upstream changes. In the example above it would listen to the `my_kafka_topic_with_debezium_changes` topic.

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

The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords).

### `params`

| Parameter Name                                | Description                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `debezium_transport`                          | Optional. The message broker transport to use. The default is `kafka`. Possible values:<ul><li>`kafka`: Use Kafka as the message broker transport. Spice may support additional transports in the future.</li></ul>                                                                                                             |
| `debezium_message_format`                     | Optional. The message format to use. The default is `json`. Possible values: <ul><li>`json`: Use JSON as the message format. Spice is expected to support additional message formats in the future, like `avro`.</li></ul>                                                                                                      |
| `kafka_bootstrap_servers`                     | **Required**. A list of host/port pairs for establishing the initial Kafka cluster connection. The client will use all servers, regardless of the bootstrapping servers specified here. This list only affects the initial hosts used to discover the full server set and should be formatted as `host1:port1,host2:port2,...`. |
| `kafka_security_protocol`                     | Security protocol for Kafka connections. Default: `SASL_SSL`. Options: <ul><li>`PLAINTEXT`</li><li>`SSL`</li><li>`SASL_PLAINTEXT`</li><li>`SASL_SSL`</li></ul>                                                                                                                                                                  |
| `kafka_sasl_mechanism`                        | SASL (Simple Authentication and Security Layer) authentication mechanism. Default: `SCRAM-SHA-512`. Options: <ul><li>`PLAIN`</li><li>`SCRAM-SHA-256`</li><li>`SCRAM-SHA-512`</li></ul>                                                                                                                                          |
| `kafka_sasl_username`                         | SASL username.                                                                                                                                                                                                                                                                                                                  |
| `kafka_sasl_password`                         | SASL password.                                                                                                                                                                                                                                                                                                                  |
| `kafka_ssl_ca_location`                       | Path to the SSL/TLS CA certificate file for server verification.                                                                                                                                                                                                                                                                |
| `kafka_enable_ssl_certificate_verification`   | Enable SSL/TLS certificate verification. Default: `true`.                                                                                                                                                                                                                                                                       |
| `kafka_ssl_endpoint_identification_algorithm` | SSL/TLS endpoint identification algorithm. Default: `https`. Options: <ul><li>`none`</li><li>`https`</li></ul>                                                                                                                                                                                                                  |
| `kafka_consumer_group_id`                     | Kafka consumer group ID to use. If not set, a unique ID will be generated automatically. The consumer group ID (whether auto-generated or custom) is stored in the acceleration metadata and must remain consistent across restarts. See [Consumer Group Management](#consumer-group-management) for details.                   |

### `metrics`

The connector supports the following optional [component metrics](../../features/observability/component_metrics):

| Metric Name              | Type    | Description                                                                          |
| ------------------------ | ------- | ------------------------------------------------------------------------------------ |
| `bytes_consumed_total`   | Counter | Total number of bytes consumed from the Kafka topic                                  |
| `records_consumed_total` | Counter | Total number of records (messages) consumed from Kafka topics                        |
| `records_lag`            | Gauge   | Total consumer lag across all topic partitions (number of messages not yet consumed) |

These metrics are not enabled by default, enable them by setting the `metrics` parameter:

```yaml
datasets:
  - from: debezium:my_kafka_topic_with_debezium_changes
    name: cool_dataset
    metrics:
      - name: records_lag
      - name: records_consumed_total
      - name: bytes_consumed_total
    params: 
    ...

```

### Acceleration Settings

:::warning

Using the Debezium connector **requires** [acceleration](../data-accelerators) to be enabled.

:::

The following settings are required:

| Parameter Name | Description                                                                                                                                                                                                                                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`      | Required. Must be set to `true` to enable acceleration.                                                                                                                                                                                                                                                                                                    |
| `engine`       | Required. The acceleration engine to use. Possible valid values: <ul><li>`duckdb`: Use [DuckDB](../data-accelerators/duckdb) as the acceleration engine.</li><li>`sqlite`: Use [SQLite](../data-accelerators/sqlite) as the acceleration engine.</li><li>`postgres`: Use [PostgreSQL](../data-accelerators/postgres) as the acceleration engine.</li></ul> |
| `refresh_mode` | Optional. The refresh mode to use. If specified, this must be set to `changes`. Any other value is an error.                                                                                                                                                                                                                                               |
| `mode`         | Optional. The persistence mode to use. When using the `duckdb` and `sqlite` engines, it is recommended to set this to `file` to persist the data across restarts. Spice also persists metadata about the dataset, so it can resume from the last known state of the dataset instead of re-fetching the entire dataset.                                     |

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores#using-secrets).

## Cookbook

- See an example of configuring a dataset to use CDC with Debezium by following the sample [Streaming changes in real-time with Debezium CDC](https://github.com/spiceai/cookbook/tree/trunk/cdc-debezium#readme).

- An example of [Streaming changes in real-time with Debezium CDC and SASL/SCRAM authentication](https://github.com/spiceai/cookbook/tree/trunk/cdc-debezium/sasl-scram#readme) is available as well.
