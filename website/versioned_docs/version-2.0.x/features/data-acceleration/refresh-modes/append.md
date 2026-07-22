---
title: 'Append Refresh Mode'
sidebar_label: 'Append'
description: 'Incrementally append new rows to an accelerated dataset.'
sidebar_position: 2
pagination_prev: null
pagination_next: null
---

The `append` refresh mode incrementally adds new rows to the acceleration on each refresh. It is designed for append-only or immutable datasets such as time-series, event, and log data.

Use `append` when:

- New rows are continuously added to the source and existing rows are not modified or deleted.
- A monotonic time or sequence column is available to identify new rows.
- The full dataset is too large to refresh in `full` mode on each interval.

## Configuration

`append` mode requires a [`time_column`](../../../reference/spicepod/datasets#time_column) that identifies new rows by comparing the local maximum value to the source. Data is incrementally refreshed where `time_column` in the source is greater than `max(time_column)` in the acceleration.

```yaml
datasets:
  - from: databricks:my_dataset
    name: accelerated_dataset
    time_column: created_at
    acceleration:
      enabled: true
      refresh_mode: append
      refresh_check_interval: 10m
```

## Late-Arriving Data

To account for clock skew or late-arriving rows, configure an overlap window with [`acceleration.refresh_append_overlap`](../../../reference/spicepod/datasets#accelerationrefresh_append_overlap). Rows within the overlap are re-read on each refresh.

## Partition Pruning with `time_partition_column`

Datasets partitioned by a less-granular time column (day, month, year) can specify [`time_partition_column`](../../../reference/spicepod/datasets#time_partition_column) in addition to `time_column` for efficient partition pruning at the source.

```yaml
datasets:
  - from: databricks:my_dataset
    name: accelerated_dataset
    time_column: created_at
    time_format: iso8601
    time_partition_column: created_at_day
    time_partition_format: date
```

## Append Only Modified Files

For object-store sources, set `time_column` or `time_partition_column` to the special value `last_modified` to append only newly created or updated files. Spice uses file metadata to determine which files are new, dramatically reducing scan time for large datasets.

```yaml
datasets:
  - from: s3://my_bucket/my_dataset
    name: accelerated_dataset
    time_column: last_modified
    params:
      file_format: parquet
    acceleration:
      refresh_mode: append
      refresh_check_interval: 10m
```

If `last_modified` exists as a column in the data, the column value takes precedence over file metadata.

This is supported for connectors that accept the [file format parameter](../../../reference/file_format), such as `s3://`, `abfs://`, and `file://`.

## Readiness with Snapshots

Append-mode accelerations that define a `time_column` wait to report ready until the first append refresh completes after [snapshot bootstrap](../snapshots). This keeps the dataset out of rotation until the freshest data is available while still benefiting from snapshot-assisted startup.

## Combining with Upserts

Pair `refresh_mode: append` with a `primary_key` and `on_conflict: upsert` to handle source rows that are occasionally updated. See [End-to-End Incremental Ingestion Example](../data-refresh#end-to-end-incremental-ingestion-example).

## Related Topics

- [Refresh Interval](../data-refresh#refresh-interval)
- [Refresh on Startup](../data-refresh#refresh-on-startup)
- [Refresh Retries](../data-refresh#refresh-retries)
- [Retention Policy](../data-refresh#retention-policy)
- [Refresh Data Window](../data-refresh#refresh-data-window)
