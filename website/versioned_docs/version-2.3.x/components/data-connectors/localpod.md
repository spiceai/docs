---
title: 'Localpod Data Connector'
sidebar_label: 'Localpod Data Connector'
description: 'Localpod Data Connector Documentation'
pagination_prev: null
---

The Localpod Data Connector enables setting up a parent/child relationship between datasets in the current Spicepod. This can be used for configuring multiple/tiered accelerations for a single dataset, and ensuring that the data is only downloaded once from the remote source. For example, you can use the `localpod` connector to create a child dataset that is accelerated in-memory, while the parent dataset is accelerated to a file.

The dataset created by the `localpod` connector will logically have the same data as the parent dataset.

## Synchronized Refreshes

The `localpod` connector supports synchronized refreshes, which ensures that the child dataset is refreshed from the same data as the parent dataset. Synchronized refreshes require the parent and child accelerations to use the **same** refresh mode, and only two pairings qualify: both `refresh_mode: full` (which is the default), or both `refresh_mode: caching`. A mismatched pair — a `caching` child under a `full` parent, for example — is not synchronized.

Synchronization is best-effort. When it cannot be established — mismatched refresh modes, a parent that is not accelerated, or a parent dataset that is not registered — the child silently falls back to refreshing on its own schedule, and the reason is logged only at `DEBUG`. At default log levels the `INFO` line below is the sole confirmation that synchronization took effect; its absence means the two datasets refresh independently.

When synchronization is enabled, the following logs will be emitted:

```bash
2024-10-28T15:45:24.220665Z  INFO runtime::datafusion: Localpod dataset test_local synchronizing refreshes with parent table test
```

### Examples

```yaml
datasets:
  - from: postgres:cleaned_sales_data
    name: test
    params: ...
    acceleration:
      enabled: true # This dataset will be accelerated into a DuckDB file
      engine: duckdb
      mode: file
      refresh_check_interval: 10s
  - from: localpod:test
    name: test_local
    acceleration:
      enabled: true # This dataset accelerates the parent `test` dataset into in-memory Arrow records and is synchronized with the parent
```

## Hot Reload

A `localpod` child binds to the table its parent has registered at the moment the child loads. When a [hot reload](../../cli/reference/spiced.md) changes the parent — an edited `acceleration`, a new `refresh_sql`, or the parent being removed and added back — the runtime reloads every `localpod` dataset that reads through it as well, parents first, so each child rebinds to the parent's new table. Chains follow the same rule transitively: a child whose parent is queued behind a load of its own waits for it, and the chain is loaded from its root down.

:::warning[Behavior change in v2.3.2]

Before v2.3.2 only the dataset whose own spicepod entry changed was reloaded. A `localpod` child therefore went on answering from the parent's retired table — returning rows the parent no longer had — and that retired table kept refreshing from the source alongside the new one, so the source saw two loads per interval.

:::

## Cookbook

- A cookbook recipe to configure Localpod as a data connector in Spice. [Local dataset replication (Localpod)](https://github.com/spiceai/cookbook/tree/trunk/localpod#readme)
