---
title: 'Change Data Capture (CDC)'
sidebar_label: 'Change Data Capture'
description: 'Learn how to use Change Data Capture (CDC) in Spice.'
sidebar_position: 6
pagination_prev: null
pagination_next: null
---

Change Data Capture (CDC) is a technique to capture changed rows from a database's transaction log and deliver to consumers with low latency. Leveraging this technique allows Spice to keep [locally accelerated](../local-acceleration/index.md) datasets up-to-date in real-time with the source data, and is highly efficient by only transferring the changed rows instead of re-fetching the entire dataset on refresh.

## Benefits

Leveraging locally-accelerated datasets configured with CDC allows Spice to provide a no compromises solution that combines both high-performance accelerated queries with highly efficient real-time delta updates.

## Example Use Case

Consider a fraud-detection application that needs to determine if a pending transaction is likely fraudulent. The application queries a Spice-accelerated real-time updated table of recent transactions to check if a pending transaction resembles known fraudulent ones. Using CDC, the table is kept up-to-date, allowing the application to quickly identify potential fraud.

## Considerations

When configuring datasets to be accelerated with CDC, ensure that the data connector supports CDC and can return a stream of row-level changes. See the [Supported Data Connectors](#supported-data-connectors) section for more information.

Startup time for CDC-accelerated datasets may be longer than non-CDC-accelerated datasets due to the initial synchronization of the dataset.

It's recommended to use CDC-accelerated datasets with persistent data accelerator configurations (i.e. `file` mode for [`DuckDB`](../../data-accelerators/duckdb.md)/[`Sqlite`](../../data-accelerators/sqlite.md) or [`PostgreSQL`](../../data-accelerators/postgres/index.md)). This ensures that when Spice restarts, it can resume from the last known state of the dataset instead of re-fetching the entire dataset.

## Supported Data Connectors

Enabling CDC via setting `refresh_mode: changes` in the acceleration settings requires support from the data connector to provide a stream of row-level changes.

Currently, the only supported data connector is [Debezium](../../data-connectors/debezium.md).

## Example

See an example of configuring a dataset to use CDC with Debezium by following the sample at [CDC with Debezium Sample](https://github.com/spiceai/samples).