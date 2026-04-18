---
title: 'Kafka Data Connector'
sidebar_label: 'Kafka Data Connector'
description: 'Kafka Data Connector Documentation'
tags:
  - data-connectors
  - kafka
  - component-metrics
---

The Kafka Data Connector enables direct acceleration of data from [Apache Kafka](https://kafka.apache.org/) topics using `refresh_mode: append` [acceleration](../data-accelerators/). This provides direct integration with existing Kafka-based event streaming infrastructure for real-time data acceleration and analytics.

```yaml
datasets:
  - from: kafka:my_kafka_topic
    name: my_dataset
    params:
      kafka_bootstrap_servers: broker1:9092,broker2:9092,broker3:9092 # Required. A comma separated list of Kafka broker servers.
      kafka_security_protocol: sasl_ssl # Default is `sasl_ssl`. Valid values are `plaintext`, `ssl`, `sasl_plaintext`, `sasl_ssl`.
      kafka_sasl_mechanism: SCRAM-SHA-512 # Default is `SCRAM-SHA-512`. Valid values are `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`.
      kafka_sasl_username: kafka # Required if `kafka_security_protocol` is `sasl_plaintext` or `sasl_ssl`.
      kafka_sasl_password: ${secrets:kafka_sasl_password} # Required if `kafka_security_protocol` is `sasl_plaintext` or `sasl_ssl`.
      kafka_ssl_ca_location: ./certs/kafka_ca_cert.pem # Optional. Used to verify the SSL/TLS certificate of the Kafka broker.
      kafka_enable_ssl_certificate_verification: true # Default is `true`. Set to `false` to disable SSL/TLS certificate verification.
      kafka_ssl_endpoint_identification_algorithm: https # Default is `https`. Valid values are `none` and `https`.
      batch_max_size: 100000 # Default is `10000`. Maximum number of change events to batch together before processing.
      batch_max_duration: 1s # Default is `1s`. Maximum time to wait for a batch to fill before processing.

    acceleration:
      enabled: true # Acceleration is required for the kafka connector.
      engine: duckdb # `duckdb`, `sqlite` and `postgres` are supported acceleration engines for Kafka.
      refresh_mode: append # Required. Must be set to `append` for the Kafka connector.
      mode: file # Persistence is recommended to not have to fully rebuild the table each time Spice starts.
```

## Overview

Upon startup, Spice subscribes to the specified topic using either a uniquely generated consumer group or a custom one specified via `kafka_consumer_group_id`. If a persistent acceleration engine is used (with `mode: file`), data is fetched starting from the last processed record, so Spice can resume without reprocessing all historical data.

Schema is automatically inferred from the first available topic message in JSON format. The connector creates the appropriate table schema for acceleration based on the detected data structure.

## Consumer Group Management

The Kafka connector manages consumer groups to ensure data consistency across restarts. Offsets are committed to Kafka, so Spice can track consumption progress.

**Default behavior:** When no `kafka_consumer_group_id` is specified, Spice automatically generates a unique consumer group ID and stores it in the acceleration metadata. On subsequent restarts, Spice retrieves and reuses this stored consumer group ID to maintain offset tracking and resume consumption from where it left off.

**Custom consumer group:** If you specify a custom `kafka_consumer_group_id`, Spice stores this ID in the acceleration metadata. The same consumer group must be used on subsequent restarts. If no acceleration data exists and a custom consumer group is provided, Spice will reset its position to the oldest available offset and begin consuming from the start of the topic.

**Consumer group mismatch error:** Spice will return an error if a restart is attempted with a different consumer group than what is stored in the acceleration metadata. This applies to both auto-generated and custom consumer group IDs. This safeguard prevents data inconsistency that could occur from mixing offsets between different consumer groups.

To resolve a consumer group mismatch, either:
- Use the same consumer group ID as stored in the acceleration
- Reset the acceleration data to start fresh with a new consumer group

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

The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords).

### `params`

| Parameter Name                                | Description                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kafka_bootstrap_servers`                     | **Required**. A list of host/port pairs for establishing the initial Kafka cluster connection. The client will use all servers, regardless of the bootstrapping servers specified here. This list only affects the initial hosts used to discover the full server set and should be formatted as `host1:port1,host2:port2,...`. |
| `kafka_security_protocol`                     | Security protocol for Kafka connections. Default: `sasl_ssl`. Options: <ul><li>`plaintext`</li><li>`ssl`</li><li>`sasl_plaintext`</li><li>`sasl_ssl`</li></ul>                                                                                                                                                                  |
| `kafka_sasl_mechanism`                        | SASL (Simple Authentication and Security Layer) authentication mechanism. Default: `SCRAM-SHA-512`. Options: <ul><li>`PLAIN`</li><li>`SCRAM-SHA-256`</li><li>`SCRAM-SHA-512`</li></ul>                                                                                                                                          |
| `kafka_sasl_username`                         | SASL username. Required if `kafka_security_protocol` is `sasl_plaintext` or `sasl_ssl`.                                                                                                                                                                                                                                         |
| `kafka_sasl_password`                         | SASL password. Required if `kafka_security_protocol` is `sasl_plaintext` or `sasl_ssl`.                                                                                                                                                                                                                                         |
| `kafka_ssl_ca_location`                       | Path to the SSL/TLS CA certificate file for server verification.                                                                                                                                                                                                                                                                |
| `kafka_enable_ssl_certificate_verification`   | Enable SSL/TLS certificate verification. Default: `true`.                                                                                                                                                                                                                                                                       |
| `kafka_ssl_endpoint_identification_algorithm` | SSL/TLS endpoint identification algorithm. Default: `https`. Options: <ul><li>`none`</li><li>`https`</li></ul>                                                                                                                                                                                                                  |
| `kafka_consumer_group_id`                     | Kafka consumer group id to use. If not set, a unique id will be generated.                                                                                                                                                                                                                                                      |
| `schema_infer_max_records`                    | Number of Kafka messages to sample for schema inference. Default: `1`. Increase if your data has optional fields or varying structure.                                                                                                                                                                                          |
| `flatten_json`                                | Set `true` to flatten nested structs in JSON as separate columns.                                                                                                                                                                                                                                                               |

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

Using the Kafka connector **requires** [acceleration](../data-accelerators/) with `refresh_mode: append` enabled.

:::

The following settings are required:

| Parameter Name | Description                                                                                                                                                                                                                                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`      | Required. Must be set to `true` to enable acceleration.                                                                                                                                                                                                                                                                                                    |
| `engine`       | Required. The acceleration engine to use. Possible valid values: <ul><li>`duckdb`: Use [DuckDB](../data-accelerators/duckdb) as the acceleration engine.</li><li>`sqlite`: Use [SQLite](../data-accelerators/sqlite) as the acceleration engine.</li><li>`postgres`: Use [PostgreSQL](../data-accelerators/postgres) as the acceleration engine.</li></ul> |
| `refresh_mode` | Required. The refresh mode to use. Must be set to `append` for the Kafka connector.                                                                                                                                                                                                                                                                        |
| `mode`         | Optional. The persistence mode to use. When using the `duckdb` and `sqlite` engines, it is recommended to set this to `file` to persist the data across restarts. Spice persists metadata about the dataset, so it can resume from the last known state instead of re-processing all messages.                                                        |

## Data Format Support

The Kafka connector currently supports JSON-formatted messages. Schema is automatically inferred from the first available message in the topic, and all subsequent messages are expected to follow a compatible structure.

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores/). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores/#using-secrets).

## Cookbook

- See how to query Kafka real-time data with other datasets using federated queries in [Live Orders Analytics example](https://github.com/spiceai/cookbook/blob/trunk/kafka/README.md).
