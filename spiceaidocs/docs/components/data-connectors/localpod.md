---
title: 'Localpod Data Connector'
sidebar_label: 'Localpod Data Connector'
description: 'Localpod Data Connector Documentation'
pagination_prev: null
---

The Localpod Data Connector enables setting up a parent/child relationship between datasets in the current Spicepod. This can be used for configuring multiple/tiered accelerations for a single dataset, and ensuring that the data is only downloaded once from the remote source. For example, you can use the `localpod` connector to create a child dataset that is accelerated in-memory, while the parent dataset is accelerated to a file.

The dataset created by the `localpod` connector will logically have the same data as the parent dataset.

## Synchronized Refreshes

The `localpod` connector supports synchronized refreshes, which ensures that the child dataset is refreshed from the same data as the parent dataset. Synchronized refreshes require that both the parent and child datasets are accelerated with `refresh_mode: full` (which is the default).

When synchronization is enabled, the following logs will be emitted:

```bash
2024-10-28T15:45:24.220665Z  INFO runtime::datafusion: Localpod dataset test_local synchronizing refreshes with parent table test
```

### Examples

```yaml
datasets:
- from: postgres:cleaned_sales_data
  name: test
  params:
    ...
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
