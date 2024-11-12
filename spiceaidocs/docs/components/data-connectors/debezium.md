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
      kafka_security_protocol: SASL_SSL # Default is `SASL_SSL`. Valid values are `PLAINTEXT`, `SSL`, `SASL_PLAINTEXT`, `SASL_SSL`.
      kafka_sasl_mechanism: SCRAM-SHA-512 # Default is `SCRAM-SHA-512`. Valid values are `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`.
      kafka_sasl_username: kafka # Required if `kafka_security_protocol` is `SASL_PLAINTEXT` or `SASL_SSL`.
      kafka_sasl_password: ${secrets:kafka_sasl_password} # Required if `kafka_security_protocol` is `SASL_PLAINTEXT` or `SASL_SSL`.
      kafka_ssl_ca_location: ./certs/kafka_ca_cert.pem # Optional. Used to verify the SSL/TLS certificate of the Kafka broker.
      kafka_enable_ssl_certificate_verification: true # Default is `true`. Set to `false` to disable SSL/TLS certificate verification.

    acceleration:
      enabled: true # Acceleration is required for the debezium connector.
      engine: duckdb # `duckdb`, `sqlite` and `postgres` are supported acceleration engines for Debezium.
      refresh_mode: changes # Optional. If specified, this is required to be set to `changes` - any other value is an error.
      mode: file # Persistence is recommended to not have to rebuild the table each time Spice starts.
```

## Configuration

### Parameters

- `debezium_transport`: Optional. The message broker transport to use. The default is `kafka`. Possible values:
  - `kafka`: Use Kafka as the message broker transport. Spice may support additional transports in the future.
- `debezium_message_format`: Optional. The message format to use. The default is `json`. Possible values:
  - `json`: Use JSON as the message format. Spice is expected to support additional message formats in the future, like `arvo`.
- `kafka_bootstrap_servers`: Required. A list of host/port pairs for establishing the initial Kafka cluster connection. The client will use all servers, regardless of the bootstrapping servers specified here. This list only affects the initial hosts used to discover the full server set and should be formatted as `host1:port1,host2:port2,...`.
- `kafka_security_protocol`: Security protocol for Kafka connections. Default: `sasl_ssl`. Options:
  - `PLAINTEXT`: Plaintext communication; no encryption or authentication.
  - `SSL`: Encrypted communication via TLS; no authentication.
  - `SASL_PLAINTEXT`: Plaintext communication; SASL (Simple Authentication and Security Layer) authentication.
  - `SASL_SSL`: Encrypted communication via TLS; SASL authentication.
- `kafka_sasl_mechanism`: SASL authentication mechanism. Default: `SCRAM-SHA-512`. Options:
  - `PLAIN`: Usernames and passwords transmitted in plaintext.
  - `SCRAM-SHA-256`: Salted Challenge Response Authentication Mechanism (SCRAM) using SHA-256 hashing.
  - `SCRAM-SHA-512`: Salted Challenge Response Authentication Mechanism (SCRAM) using SHA-512 hashing.
- `kafka_sasl_username`: SASL username.
- `kafka_sasl_password`: SASL password.
- `kafka_ssl_ca_location`: Path to the SSL/TLS CA certificate file for server verification.
- `kafka_enable_ssl_certificate_verification`: Enable SSL/TLS certificate verification. Default: `true`.

### Acceleration Settings

Using the Debezium connector requires acceleration to be enabled. The following settings are required:

- `enabled`: Required. Must be set to `true` to enable acceleration.
- `engine`: Required. The acceleration engine to use. Possible valid values:
  - `duckdb`: Use [DuckDB](/components/data-accelerators/duckdb.md) as the acceleration engine.
  - `sqlite`: Use [SQLite](/components/data-accelerators/sqlite.md) as the acceleration engine.
  - `postgres`: Use [PostgreSQL](/components/data-accelerators/postgres/index.md) as the acceleration engine.
- `refresh_mode`: Optional. The refresh mode to use. If specified, this must be set to `changes`. Any other value is an error.
- `mode`: Optional. The persistence mode to use. When using the `duckdb` and `sqlite` engines, it is recommended to set this to `file` to persist the data across restarts. Spice also persists metadata about the dataset, so it can resume from the last known state of the dataset instead of re-fetching the entire dataset.

### Example

See an example of configuring a dataset to use CDC with Debezium by following the sample [Streaming changes in real-time with Debezium CDC](https://github.com/spiceai/samples/tree/trunk/cdc-debezium).

An example of configuring [SASL authentication over SSL](https://github.com/spiceai/samples/tree/trunk/cdc-debezium/sasl-scram) is available as well.
