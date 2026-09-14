---
title: 'Full Refresh Mode'
sidebar_label: 'Full'
description: 'Replace the entire accelerated dataset on each refresh.'
sidebar_position: 1
pagination_prev: null
pagination_next: null
---

The `full` refresh mode replaces the entire accelerated dataset on every refresh. It is the default refresh mode and the simplest way to keep an acceleration in sync with its source.

Use `full` when:

- The dataset is small enough to be re-read on each refresh.
- Source rows can be inserted, updated, or deleted, and incremental tracking is not available.
- Strong consistency with the source is preferred over minimizing source load.

## Configuration

```yaml
datasets:
  - from: databricks:my_dataset
    name: accelerated_dataset
    acceleration:
      enabled: true
      refresh_mode: full
      refresh_check_interval: 10m
```

On each refresh, the runtime issues a single `SELECT` against the source, materializes the result into the acceleration engine, and atomically swaps the new data in.

## Behavior

- Each refresh fully scans the source. Any [`refresh_sql`](../data-refresh#refresh-sql) and [`refresh_data_window`](../data-refresh#refresh-data-window) filters are pushed down to limit data transferred.
- Queries continue to be served from the previous result set until the new refresh completes.
- Supported with all data connectors and all acceleration engines.

## Related Topics

For cross-cutting refresh behavior that applies to `full` mode, see:

- [Refresh Interval](../data-refresh#refresh-interval)
- [Refresh on Startup](../data-refresh#refresh-on-startup)
- [Refresh Retries](../data-refresh#refresh-retries)
- [Retention Policy](../data-refresh#retention-policy)
- [Behavior on Zero Results](../data-refresh#behavior-on-zero-results)
