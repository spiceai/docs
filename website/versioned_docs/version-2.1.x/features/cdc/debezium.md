---
title: 'Debezium (CDC over Kafka)'
sidebar_label: 'Debezium'
description: 'Consume Debezium change events from Kafka into a Spice-accelerated dataset for sources without a native Spice CDC path.'
sidebar_position: 5
pagination_prev: null
pagination_next: null
---

Consume [Debezium](https://debezium.io/) change events from a Kafka topic and apply them to a Spice-accelerated dataset.

Use Debezium when:

- You already operate Debezium + Kafka for change data capture; or
- The source database does not have a native Spice CDC path (e.g. MySQL, SQL Server, Oracle).

For sources with a native CDC path, prefer the dedicated connector — [PostgreSQL Logical Replication](./postgres-replication.md), [DynamoDB Streams](./dynamodb-streams.md), or [MongoDB Change Streams](./mongodb-streams.md) — to avoid the extra Kafka + Debezium hop.

## How it works

```
┌────────────────┐  Debezium connector   ┌───────────┐    Spice consumes      ┌───────────────────┐    ChangeBatch     ┌───────────────┐
│   Source DB    │ ────────────────────▶│   Kafka   │ ────────────────────▶│   Spice runtime   │──────────────────▶│  Accelerator  │
│   (MySQL,      │  WAL → JSON events    │   topic   │   one consumer group   │  (debezium        │  (INSERT/         │  DuckDB /     │
│    SQL Server, │                       │           │   per Spice replica    │   connector)      │   UPDATE /        │  SQLite /     │
│    Oracle, …)  │                       │           │                        │                   │   DELETE)         │  Postgres     │
└────────────────┘                       └───────────┘                        └───────────────────┘                   └───────────────┘
```

On startup, Spice subscribes to the configured Debezium-managed Kafka topic using either a uniquely generated consumer group or one specified via `kafka_consumer_group_id`. With a persistent acceleration engine (`mode: file`), data is fetched starting from the **last committed offset**, so restarts resume without reprocessing historical events.

## Prerequisites

- A running **Debezium connector** publishing change events to a **Kafka topic** for the source table.
- A reachable Kafka cluster (one or more `bootstrap.servers`).
- A Spice acceleration engine that supports CDC: `duckdb`, `sqlite`, or `postgres`.

## Minimal configuration

```yaml
datasets:
  - from: debezium:my_kafka_topic_with_debezium_changes
    name: customer_addresses
    params:
      debezium_transport: kafka         # Optional. Only `kafka` is currently supported.
      debezium_message_format: json     # Optional. Only `json` is currently supported.
      kafka_bootstrap_servers: localhost:9092
      kafka_security_protocol: PLAINTEXT
    acceleration:
      enabled: true                     # Required.
      engine: duckdb                    # duckdb / sqlite / postgres
      mode: file                        # Persist Kafka offsets so restarts resume.
      refresh_mode: changes             # Required.
```

The `from` field takes the form `debezium:<kafka_topic>`. The topic must contain Debezium-formatted change events for a single source table.

## SASL/SSL authentication

For Kafka clusters with SASL/SSL enabled:

```yaml
datasets:
  - from: debezium:my_kafka_topic_with_debezium_changes
    name: orders
    params:
      kafka_bootstrap_servers: broker1:9092,broker2:9092,broker3:9092
      kafka_security_protocol: sasl_ssl          # Default
      kafka_sasl_mechanism: SCRAM-SHA-512        # PLAIN / SCRAM-SHA-256 / SCRAM-SHA-512
      kafka_sasl_username: kafka_user
      kafka_sasl_password: ${secrets:kafka_sasl_password}
      kafka_ssl_ca_location: ./certs/kafka_ca_cert.pem
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      refresh_mode: changes
```

The full set of `kafka_*` parameters is documented in the [Debezium connector reference](../../components/data-connectors/debezium.md#params).

## Consumer-group management

The connector manages Kafka consumer groups so offsets persist across restarts:

- **Default** — Spice auto-generates a unique consumer group ID, stores it in the acceleration metadata, and reuses it on subsequent restarts.
- **Custom** — Pass `kafka_consumer_group_id` to use your own group ID. The same ID must be used on every restart; if Spice detects a mismatch against the stored ID, it returns an error to prevent data inconsistency.

To recover from a deliberate consumer-group change, reset the acceleration data so Spice starts fresh.

See the full description in the [Debezium connector reference](../../components/data-connectors/debezium.md#consumer-group-management).

## Schema evolution

Debezium emits change events whose schema may evolve as the upstream table is altered. Set `schema_evolution: true` to have Spice peek at the latest Kafka message on reload and detect schema changes:

```yaml
params:
  schema_evolution: true   # Default: false
```

## Batching

Two parameters control how many events Spice groups into a single CDC batch before applying it to the accelerator:

| Parameter            | Default  | Description                                                       |
| -------------------- | -------- | ----------------------------------------------------------------- |
| `batch_max_size`     | `10000`  | Max number of change events to batch together before processing.  |
| `batch_max_duration` | `1s`     | Max time to wait for a batch to fill before processing.           |

Larger batches improve throughput at the cost of higher per-batch latency.

## Metrics

The connector exposes the following [component metrics](../observability/component_metrics.md):

| Metric Name              | Type    | Description                                                                          |
| ------------------------ | ------- | ------------------------------------------------------------------------------------ |
| `bytes_consumed_total`   | Counter | Total number of bytes consumed from the Kafka topic                                  |
| `records_consumed_total` | Counter | Total number of records (messages) consumed from Kafka topics                        |
| `records_lag`            | Gauge   | Total consumer lag across all topic partitions (number of messages not yet consumed) |

These metrics are opt-in; see the [Debezium connector reference](../../components/data-connectors/debezium.md#metrics) for an example `metrics:` block.

## Limitations

- Only `kafka` is supported as the Debezium transport.
- Only `json` is supported as the message format.
- Acceleration is required — Debezium cannot be used as a federated, non-accelerated dataset.

## See also

- [Debezium Data Connector](../../components/data-connectors/debezium.md) — complete parameter reference.
- [Streaming changes in real-time with Debezium CDC](https://github.com/spiceai/cookbook/tree/trunk/cdc-debezium#readme) — cookbook recipe.
- [Streaming changes with Debezium and SASL/SCRAM authentication](https://github.com/spiceai/cookbook/tree/trunk/cdc-debezium/sasl-scram#readme) — authenticated-Kafka recipe.
- [`refresh_mode: changes`](../data-acceleration/refresh-modes/changes.md) — refresh-mode reference.
