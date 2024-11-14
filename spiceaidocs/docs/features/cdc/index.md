---
title: 'Change Data Capture (CDC)'
sidebar_label: 'Change Data Capture'
description: 'Learn how to use Change Data Capture (CDC) in Spice.'
sidebar_position: 4
pagination_prev: null
pagination_next: null
---

Change Data Capture (CDC) is a technique that captures changed rows from a database's transaction log and delivers them to consumers with low latency. Leveraging this technique enables Spice to keep [locally accelerated](../data-acceleration/index.md) datasets up-to-date in real time with the source data, and it is highly efficient as it only transfers the changed rows instead of re-fetching the entire dataset on refresh.

## Benefits

Leveraging locally accelerated datasets configured with CDC enables Spice to provide a solution that combines high-performance accelerated queries and efficient real-time delta updates.

## Example Use Case

Consider a fraud detection application that needs to determine whether a pending transaction is likely fraudulent. The application queries a Spice-accelerated real-time updated table of recent transactions to check if a pending transaction resembles known fraudulent ones. Using CDC, the table is kept up-to-date, allowing the application to quickly identify potential fraud.

## Considerations

When configuring datasets to be accelerated with CDC, ensure that the [data connector](/components/data-connectors) supports CDC and can return a stream of row-level changes. See the [Supported Data Connectors](#supported-data-connectors) section for more information.

The startup time for CDC-accelerated datasets may be longer than that for non-CDC-accelerated datasets due to the initial synchronization of the dataset.

:::tip

It's recommended to use CDC-accelerated datasets with persistent data accelerator configurations (i.e. `file` mode for [`DuckDB`](/components/data-accelerators/duckdb.md)/[`SQLite`](/components/data-accelerators/sqlite.md) or [`PostgreSQL`](/components/data-accelerators/postgres/index.md)). This ensures that when Spice restarts, it can resume from the last known state of the dataset instead of re-fetching the entire dataset.

:::

## Supported Data Connectors

Enabling CDC via setting `refresh_mode: changes` in the acceleration settings requires support from the data connector to provide a stream of row-level changes.

At present, the only supported data connector is [Debezium](/components/data-connectors/debezium.md)..

## Example

See an example of configuring a dataset to use CDC with Debezium by following the sample at [Streaming changes in real-time with Debezium CDC](https://github.com/spiceai/samples/tree/trunk/cdc-debezium).

```yaml
version: v1beta1
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
