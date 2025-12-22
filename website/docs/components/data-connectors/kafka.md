---
title: 'Kafka Data Connector'
sidebar_label: 'Kafka Data Connector'
description: 'Kafka Data Connector Documentation'
tags:
  - data-connectors
  - kafka
  - component-metrics
---

The Kafka Data Connector enables direct acceleration of data from [Apache Kafka](https://kafka.apache.org/) topics using `refresh_mode: append` [acceleration](/docs/components/data-accelerators/index.md). This allows seamless integration with existing Kafka-based event streaming infrastructure for real-time data acceleration and analytics.

```yaml
datasets:
  - from: kafka:my_kafka_topic
    name: my_dataset
    params:
      kafka_bootstrap_servers: broker1:9092,broker2:9092,broker3:9092 # Required. A comma separated list of Kafka broker servers.
      kafka_security_protocol: SASL_SSL # Default is `SASL_SSL`. Valid values are `PLAINTEXT`, `SSL`, `SASL_PLAINTEXT`, `SASL_SSL`.
      kafka_sasl_mechanism: SCRAM-SHA-512 # Default is `SCRAM-SHA-512`. Valid values are `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`.
      kafka_sasl_username: kafka # Required if `kafka_security_protocol` is `SASL_PLAINTEXT` or `SASL_SSL`.
      kafka_sasl_password: ${secrets:kafka_sasl_password} # Required if `kafka_security_protocol` is `SASL_PLAINTEXT` or `SASL_SSL`.
      kafka_ssl_ca_location: ./certs/kafka_ca_cert.pem # Optional. Used to verify the SSL/TLS certificate of the Kafka broker.
      kafka_enable_ssl_certificate_verification: true # Default is `true`. Set to `false` to disable SSL/TLS certificate verification.
      kafka_ssl_endpoint_identification_algorithm: https # Default is `https`. Valid values are `none` and `https`.
      batch_max_size: 100000 # Default is `10000`. Maximum number of change events to batch together before processing.
      batch_max_duration: 1s # Default is `1s`. Maximum number of change events to batch together before processing.

    acceleration:
      enabled: true # Acceleration is required for the kafka connector.
      engine: duckdb # `duckdb`, `sqlite` and `postgres` are supported acceleration engines for Kafka.
      refresh_mode: append # Required. Must be set to `append` for the Kafka connector.
      mode: file # Persistence is recommended to not have to fully rebuild the table each time Spice starts.
```

## Overview

Upon startup, Spice fetches all messages for the specified topic using a uniquely generated consumer group. If a persistent acceleration engine is used (with `mode: file`), data is fetched starting from the last processed record, allowing Spice to resume without reprocessing all historical data.

Schema is automatically inferred from the first available topic message in JSON format. The connector creates the appropriate table schema for acceleration based on the detected data structure.

## Configuration

### `from`

The `from` field takes the form of `kafka:kafka_topic` where `kafka_topic` is the name of the Kafka topic to consume from.

```yaml
datasets:
  - from: kafka:user_events
    name: events
    ...
```

### `name`

The dataset name. This will be used as the table name within Spice.

```yaml
datasets:
  - from: kafka:orders_events
    name: orders
    ...
```

```sql
SELECT COUNT(*) FROM orders;
```

```shell
+----------+
| count(*) |
+----------+
| 6001215  |
+----------+
```

The dataset name cannot be a [reserved keyword](/docs/reference/spicepod/keywords.md).

### `params`

| Parameter Name                                | Description                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kafka_bootstrap_servers`                     | **Required**. A list of host/port pairs for establishing the initial Kafka cluster connection. The client will use all servers, regardless of the bootstrapping servers specified here. This list only affects the initial hosts used to discover the full server set and should be formatted as `host1:port1,host2:port2,...`. |
| `kafka_security_protocol`                     | Security protocol for Kafka connections. Default: `SASL_SSL`. Options: <ul><li>`PLAINTEXT`</li><li>`SSL`</li><li>`SASL_PLAINTEXT`</li><li>`SASL_SSL`</li></ul>                                                                                                                                                                  |
| `kafka_sasl_mechanism`                        | SASL (Simple Authentication and Security Layer) authentication mechanism. Default: `SCRAM-SHA-512`. Options: <ul><li>`PLAIN`</li><li>`SCRAM-SHA-256`</li><li>`SCRAM-SHA-512`</li></ul>                                                                                                                                          |
| `kafka_sasl_username`                         | SASL username. Required if `kafka_security_protocol` is `SASL_PLAINTEXT` or `SASL_SSL`.                                                                                                                                                                                                                                        |
| `kafka_sasl_password`                         | SASL password. Required if `kafka_security_protocol` is `SASL_PLAINTEXT` or `SASL_SSL`.                                                                                                                                                                                                                                        |
| `kafka_ssl_ca_location`                       | Path to the SSL/TLS CA certificate file for server verification.                                                                                                                                                                                                                                                                |
| `kafka_enable_ssl_certificate_verification`   | Enable SSL/TLS certificate verification. Default: `true`.                                                                                                                                                                                                                                                                       |
| `kafka_ssl_endpoint_identification_algorithm` | SSL/TLS endpoint identification algorithm. Default: `https`. Options: <ul><li>`none`</li><li>`https`</li></ul>                                                                                                                                                                                                                  |
| `kafka_consumer_group_id`                     | Kafka consumer group id to use. If not set, a unique id will be generated.                                                                                                                                                                                                                                            |
| `schema_infer_max_records`                    | Number of Kafka messages to sample for schema inference. Default: `1`. Increase if your data has optional fields or varying structure.                                                                                                                                                                                          |
| `flatten_json`                                | Set `true` to flatten nested structs in JSON as separate columns.                                                                                                                                                                                                                                                               |

### `metrics`

The connector supports the following optional [component metrics](/docs/features/observability/component_metrics):

| Metric Name              | Type    | Description                                                                                       |
|--------------------------|---------|---------------------------------------------------------------------------------------------------|
| `bytes_consumed_total`   | Counter | Total number of bytes consumed from the Kafka topic                                               |
| `records_consumed_total` | Counter | Total number of records (messages) consumed from Kafka topics                                     |
| `records_lag`            | Gauge   | Total consumer lag across all topic partitions (number of messages not yet consumed)              |

These metrics are not enabled by default, enable them by setting the `metrics` parameter:

```yaml
datasets:
  - from: kafka:user_events
    name: events
    metrics:
      - name: records_lag
      - name: records_consumed_total
      - name: bytes_consumed_total
    params: 
    ...

```

### Acceleration Settings

:::warning

Using the Kafka connector **requires** [acceleration](/docs/components/data-accelerators/index.md) with `refresh_mode: append` enabled.

:::

The following settings are required:

| Parameter Name | Description                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`      | Required. Must be set to `true` to enable acceleration.                                                                                                                                                                                                                                                                                                                                              |
| `engine`       | Required. The acceleration engine to use. Possible valid values: <ul><li>`duckdb`: Use [DuckDB](/docs/components/data-accelerators/duckdb.md) as the acceleration engine.</li><li>`sqlite`: Use [SQLite](/docs/components/data-accelerators/sqlite.md) as the acceleration engine.</li><li>`postgres`: Use [PostgreSQL](/docs/components/data-accelerators/postgres/index.md) as the acceleration engine.</li></ul> |
| `refresh_mode` | Required. The refresh mode to use. Must be set to `append` for the Kafka connector.                                                                                                                                                                                                                                                                                                                 |
| `mode`         | Optional. The persistence mode to use. When using the `duckdb` and `sqlite` engines, it is recommended to set this to `file` to persist the data across restarts. Spice persists metadata about the dataset, allowing it to resume from the last known state instead of re-processing all messages.                                                                                                |

## Data Format Support

The Kafka connector currently supports JSON-formatted messages. Schema is automatically inferred from the first available message in the topic, and all subsequent messages are expected to follow a compatible structure.

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](/docs/components/secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](/docs/components/secret-stores#using-secrets).

## Cookbook

- See how to query Kafka real-time data with other datasets using federated queries in [Live Orders Analytics example](https://github.com/spiceai/cookbook/blob/trunk/kafka/README.md).
