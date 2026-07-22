---
title: 'Change Data Capture (CDC)'
sidebar_label: 'Change Data Capture'
description: 'Learn how to use Change Data Capture (CDC) in Spice.'
sidebar_position: 5
pagination_prev: null
pagination_next: null
---

Change Data Capture (CDC) captures insert, update, and delete events from a database's transaction log and delivers them to consumers with low latency. This technique enables Spice to keep [locally accelerated](data-acceleration) datasets synchronized with the source data in near real-time. CDC is efficient because it transfers only changed rows instead of re-fetching the entire dataset.

## Benefits

Using locally accelerated datasets configured with CDC enables Spice to provide high-performance accelerated queries and efficient real-time updates.

## Example Use Case

Consider a fraud detection application that needs to determine whether a pending transaction is likely fraudulent. The application queries a Spice-accelerated, real-time updated table of recent transactions to check if a pending transaction resembles known fraudulent ones. With CDC, the table is kept up-to-date, so the application can quickly identify potential fraud.

## Considerations

When configuring datasets to be accelerated with CDC, ensure that the [data connector](../components/data-connectors) supports CDC and can return a stream of row-level changes. See the [Supported Data Connectors](#supported-data-connectors) section for more information.

The startup time for CDC-accelerated datasets may be longer than for non-CDC-accelerated datasets due to the initial synchronization.

:::tip

It is recommended to use CDC-accelerated datasets with persistent data accelerator configurations (i.e., `file` mode for [`DuckDB`](../components/data-accelerators/duckdb)/[`SQLite`](../components/data-accelerators/sqlite) or [`PostgreSQL`](../components/data-accelerators/postgres)). This ensures that when Spice restarts, it can resume from the last known state of the dataset instead of re-fetching the entire dataset.

:::

## Tuning ingestion

Spice applies CDC events through a single apply loop that coalesces a contiguous run of buffered change events ("envelopes") into one accelerator write. The coalescing behavior is controlled by the following `runtime.params`, set once under the top-level `runtime.params` and applied to every CDC-accelerated dataset in the instance. Each parameter also accepts a `SPICE_`-prefixed environment variable; the `runtime.params` value takes precedence, falling back to the environment variable, then the default. Cayenne-accelerated datasets can additionally override any of these values per-dataset — see [Per-dataset overrides](#per-dataset-overrides) below.

| Parameter                     | Description                                                                                                                                                                                                                                                                                                                              | Default               |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `cdc_prefetch_buffer`         | Number of source change events buffered ahead of the apply loop. Range `1`–`16384`.                                                                                                                                                                                                                                                     | `128`                 |
| `cdc_max_coalesced_envelopes` | Maximum number of change events combined into a single accelerator write. Range `1`–`16384`.                                                                                                                                                                                                                                            | `256`                 |
| `cdc_max_coalesced_bytes`     | Maximum in-memory Arrow size (bytes) of a single coalesced write. Range `1`–`1073741824` (1 GiB).                                                                                                                                                                                                                                       | `134217728` (128 MiB) |
| `cdc_max_coalesce_age_ms`     | Apply-loop linger window in milliseconds. When `> 0`, the loop keeps accumulating change events into one write until the envelope cap, the byte budget, or this window elapses — whichever comes first. The window is measured from the start of the previous apply. `0` disables lingering, so each buffered event is applied as soon as it arrives. | `0` (no linger)       |
| `cdc_commit_timeout_ms`       | Maximum time to wait for the previous source-side commit before surfacing ingestion as stalled. Range `1`–`3600000` (1 hour).                                                                                                                                                                                                           | `30000` (30s)         |

```yaml
runtime:
  params:
    cdc_max_coalesce_age_ms: 250 # linger up to 250ms to coalesce slowly-arriving events into fewer writes
```

Out-of-range or unparseable values are rejected with a warning and fall back to the default.

### Per-dataset overrides

For [Cayenne](../../components/data-accelerators/cayenne/index.md)-accelerated datasets, any of the five parameters above can also be set per-dataset under the dataset's `acceleration.params` to override the instance-wide value for that dataset only. A per-dataset value layers on top of the resolved global configuration (`runtime.params` → environment variable → default): a dataset overrides only the parameters it sets and inherits the global value for the rest. Out-of-range or unparseable per-dataset values are rejected with a warning and keep the global value.

```yaml
runtime:
  params:
    cdc_max_coalesce_age_ms: 250 # global default for every CDC-accelerated dataset

datasets:
  - from: postgres:public.orders
    name: orders
    acceleration:
      engine: cayenne
      refresh_mode: changes
      params:
        cdc_max_coalesce_age_ms: 1000 # this dataset lingers longer than the global 250ms
        cdc_prefetch_buffer: 1024 # ...and buffers more aggressively
```

## Supported Data Connectors

Enabling CDC by setting `refresh_mode: changes` in the acceleration settings requires support from the data connector to provide a stream of row-level changes.

Spice currently supports streaming ingestion via:

- **[PostgreSQL Logical Replication](./postgres-replication.md)** — **recommended** for PostgreSQL sources. Spice connects directly to the source using Postgres' native logical replication protocol (`wal_level=logical` + pgoutput) and streams `INSERT`/`UPDATE`/`DELETE` events into the accelerator. No Kafka, no Debezium, no external services.
- **[MySQL Binlog Replication](./mysql-replication.md)** — **recommended** for MySQL sources. Spice subscribes to the source's binary log (`binlog_format=ROW`) as a replica and streams `INSERT`/`UPDATE`/`DELETE` events into the accelerator. No Kafka, no Debezium, no external services.
- **[DynamoDB Streams](./dynamodb-streams.md)** — for Amazon DynamoDB sources. Spice consumes the table's DynamoDB Streams directly and applies `INSERT`/`UPDATE`/`DELETE` events to the accelerator.
- **[MongoDB Change Streams](./mongodb-streams.md)** — for MongoDB replica sets and sharded clusters. Spice opens a native Change Stream on the source collection and applies inserts, updates, replaces, and deletes to the accelerator.
- **[Apache Kafka](../../components/data-connectors/kafka.md)** — for event-streaming topics. Spice consumes records directly with `refresh_mode: append` for real-time, append-only acceleration (no separate CDC connector required).
- **[Debezium](./debezium.md)** (over Kafka) — for sources where Debezium + Kafka is already deployed, or for databases without a native Spice CDC path (SQL Server, etc.).

## Example

See an example of configuring a dataset to use CDC with Debezium by following the recipe at [Streaming changes in real-time with Debezium CDC](https://github.com/spiceai/cookbook/tree/trunk/cdc-debezium#readme).

```yaml
version: v1
kind: Spicepod
name: cdc-debezium
datasets:
  - from: debezium:cdc.public.customer_addresses
    name: cdc
    params:
      debezium_transport: kafka
      debezium_message_format: json
      kafka_bootstrap_servers: localhost:19092
      kafka_security_protocol: PLAINTEXT
    acceleration:
      enabled: true
      engine: sqlite
      mode: file
      refresh_mode: changes
```
