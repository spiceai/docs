---
title: 'Refresh Modes'
sidebar_label: 'Refresh Modes'
description: 'Refresh modes for accelerated datasets in Spice.'
sidebar_position: 2
pagination_prev: null
pagination_next: null
---

Spice supports five modes to refresh accelerated datasets. `full` is the default.

| Mode                          | Description                                          | Example                                                          |
| ----------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| [`full`](./full.md)           | Replace/overwrite the entire dataset on each refresh | A table of users                                                 |
| [`append`](./append.md)       | Append/add data to the dataset on each refresh       | Append-only, immutable datasets, such as time-series or log data |
| [`changes`](./changes.md)     | Apply incremental inserts, updates, and deletes      | Customer order lifecycle table                                   |
| [`caching`](./caching.md)     | Read-through caching for HTTP-based datasets         | API search results or dynamic content endpoints                  |
| [`snapshot`](./snapshot.md)   | Reload exclusively from the snapshot store           | Read-only replicas bootstrapped from centralized snapshots       |

For cross-cutting refresh behavior — refresh intervals, on-demand refresh, retries, retention, and behavior on zero results — see [Data Refresh](../data-refresh.md).
