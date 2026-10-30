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

`append` mode requires a [`time_column`](../../../reference/spicepod/datasets#time_column) that identifies new rows by comparing the local maximum value to the source. Data is incrementally refreshed where `time_column` in the source is greater than `max(time_column)` in the acceleration — see [Day-Granular Time Columns](#day-granular-time-columns) for the one case where that comparison is inclusive instead.

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

To account for clock skew or late-arriving rows, configure an overlap window with [`acceleration.refresh_append_overlap`](../../../reference/spicepod/datasets#accelerationrefresh_append_overlap). Rows within the overlap are re-read on each refresh. A row that arrives later than the overlap, with a `time_column` value older than the window, is not loaded by any later `append` refresh; a `full` refresh loads it.

[Iceberg sources](#iceberg-sources-follow-table-snapshots) do not depend on the overlap for late rows: their append refresh reads what each new snapshot added. The exception is a keyed acceleration on an engine other than Cayenne whose `primary_key` does not include the `time_column`, which [reads by time](#keyed-accelerations-on-other-engines-read-by-time).

## Iceberg Sources Follow Table Snapshots

An `append` refresh of an [Iceberg](../../../components/data-connectors/iceberg.md) dataset, or of an Iceberg table read through the [Glue](../../../components/data-connectors/glue.md) connector, follows the table's snapshots instead of a time window. Spice saves the snapshot it last loaded. The next refresh reads the data files that the snapshots committed since then added, whatever their `time_column` values, so rows that a writer commits out of time order are loaded. A refresh of a table with no new snapshot scans no data.

### Keyed accelerations on other engines read by time

An acceleration on an engine other than Cayenne, with a `primary_key` that does not include the `time_column`, resolves a repeated key by arrival order under its [`on_conflict`](../constraints.md#handling-conflicts) setting, not by `time_column`. Its `append` refresh of an Iceberg source does not follow snapshots. It reads rows newer than the latest stored `time_column` value, less `refresh_append_overlap`. A late row with a `time_column` value older than that window is not loaded, so it cannot replace the newer row already stored. A late row inside the window is loaded, and with `on_conflict: upsert` it can replace a newer stored row with the same key. Cayenne keeps the newest row for each key by `time_column`, so it follows snapshots and loads every new row.

Such a dataset with no `refresh_append_overlap` logs this warning when it loads:

```text
Dataset '<name>' (`engine: <engine>`) has no `refresh_append_overlap`, so a row that arrives after a newer one is never loaded. Use `engine: cayenne` to load every new row, or set `refresh_append_overlap` to how late rows can arrive. See: https://spiceai.org/docs/features/data-acceleration/data-refresh
```

The first refresh, which has no saved snapshot, reads by time as described in [Configuration](#configuration). Each kind of snapshot since the saved one is handled as follows:

| Snapshot operation | What the refresh reads |
| --- | --- |
| `append` | The data files the snapshot added, as of that snapshot, so a compaction committed before the refresh does not hide them. |
| `replace` (compaction) | Nothing. The rows are already loaded. |
| `delete`, or any snapshot adding no data file | Nothing. An `append` refresh never removes a row; see [Iceberg delete files](#iceberg-delete-files). |
| `overwrite` | On [Spice Cayenne](../../../components/data-accelerators/cayenne/index.md) with a `primary_key` that does not include the `time_column`, the files the snapshot added, keeping the newest version of each key. Otherwise this refresh reads by time. |

Some table histories cannot be followed. For these, that one refresh reads by time, as an `append` refresh of any other source does, and later refreshes follow snapshots again from the snapshot it loaded:

- The table was dropped and recreated under the same name.
- A snapshot between the saved snapshot and the current one expired, the table was rolled back, or the current snapshot is on another branch. Expiring only the saved snapshot itself does not cause this.
- An `overwrite` snapshot rewrote rows, and the acceleration does not keep the newest version of each key as described above.

A refresh that falls back for one of these reasons logs a warning naming the reason, and repeats it only when the reason changes. Rows that arrived later than `refresh_append_overlap` before such a refresh are not loaded by it; run a `full` refresh to reload them. The [`dataset_acceleration_refresh_fallbacks`](../../observability/index.md#available-metrics) counter counts each fallback by `reason`: `table_replaced`, `snapshot_not_ancestor`, `table_has_no_snapshot`, or `rows_rewritten_without_primary_key`.

A file-mode acceleration keeps the saved snapshot with its data, so following continues across restarts. Other accelerations keep it in memory, and the first refresh after a restart reads by time. The saved snapshot is discarded when a schema change recreates the accelerated table or the acceleration is restored from a [snapshot](../snapshots), so the next refresh reads by time. A `full` refresh saves the snapshot it read, and later `append` refreshes continue from there.

A dataset that computes columns over the Iceberg table, such as [embedding columns](../../../components/embeddings/index.md), and a one-off refresh with its own `refresh_sql`, read by time. These reads, like the first refresh, are not fallbacks: they log no fallback warning and are not counted in `dataset_acceleration_refresh_fallbacks`.

## Day-Granular Time Columns

A date-typed `time_column` (Arrow `Date32` or `Date64`, configured as [`time_format: date`](../../../reference/spicepod/datasets#time_format)) carries no time of day, so every row of a given day shares one value. A strictly-greater comparison against the accelerated maximum would exclude every row that arrives later for the day already loaded, on that refresh and on every one after it.

For a day-granular time column the comparison is therefore **inclusive**, against the start of the high-water mark's day, and Spice's exact-row de-duplication drops the already-loaded rows that come back so nothing is appended twice. A `time_partition_column` of the same type is floored to that same day boundary, so the partition predicate does not exclude the day the new rows are in.

The trade-off is that each refresh re-reads the boundary day from the source rather than nothing — the minimum needed to see that day's new rows at all. Sub-day time columns are unaffected and keep the strict comparison; if a single day is large, bound the re-read by using a sub-day `time_column`.

`refresh_append_overlap` still subtracts its duration from the high-water mark, but on a day-granular column the resulting window is quantized to the day boundary, so an overlap shorter than a day re-reads the whole boundary day.

## Floating-Point Unix Time Columns

A floating-point `time_column` configured as `unix_seconds`, `unix_millis`, or `unix_nanos`, such as `1700000000.25` seconds, is read as Unix time, the same as an integer column. The high-water mark is the accelerated maximum rounded down to a whole unit, so each refresh reads only rows after that unit and may read again rows from the unit that holds the maximum. A maximum that is negative, `NaN`, or infinite fails the refresh with an error that names the value.

In v2.4.1 and earlier, the maximum of a floating-point time column was converted to a timestamp as nanoseconds, so a value such as `1.7e9` seconds became a mark about 1.7 seconds after 1970, and every append refresh read the whole source table.

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

An append-mode acceleration that defines a `time_column` and meets the conditions in [Serving an Existing Acceleration While the Source Is Unavailable](../data-refresh#serving-an-existing-acceleration-while-the-source-is-unavailable) is served as soon as its existing acceleration is available, whether it was reopened from disk or restored by [snapshot bootstrap](../snapshots), including while the source is unavailable. The first append refresh then catches up from the newest `time_column` value in the acceleration. In v2.4.0-rc.3 and earlier, such a dataset with snapshots enabled waited to report ready until its first append refresh completed.

## Combining with Upserts

Pair `refresh_mode: append` with a `primary_key` to handle source rows that are occasionally updated. On [Spice Cayenne](../../../components/data-accelerators/cayenne/index.md#duplicate-primary-keys-in-one-write), the default engine on Linux and macOS (Windows defaults to Arrow), a `primary_key` alone keeps one row per key: with a `time_column` that is not part of the `primary_key`, the newest version by `time_column`, including when one poll holds several versions of a key. Set [`refresh_append_overlap`](../../../reference/spicepod/datasets.md#accelerationrefresh_append_overlap) to how late rows can arrive so that a late update is re-read:

```yaml
datasets:
  - from: s3://my-bucket/events/
    name: events
    time_column: updated_at
    params:
      file_format: parquet
    acceleration:
      enabled: true
      engine: cayenne
      mode: file
      refresh_mode: append
      refresh_check_interval: 10m
      refresh_append_overlap: 1h
      primary_key: id
```

Other accelerators do not order a key's versions by `time_column`; see [Handling conflicts](../constraints#handling-conflicts). The [End-to-End Incremental Ingestion Example](../data-refresh#end-to-end-incremental-ingestion-example) combines this with retention.

## Iceberg delete files

Iceberg v2 position and equality delete files are applied on federated scans and on [`refresh_mode: full`](./full). They are **not** applied by `append`: once a row is in the acceleration, a later delete file does not retract it. Prefer soft deletes plus a filtering [view](../../views) until Iceberg snapshot-diff into [`changes`](./changes) exists. See [Delete files on federated reads](../../../components/data-connectors/iceberg#delete-files-on-federated-reads).

## Iceberg table layout

An append poll of an Iceberg source that reads by time skips files and Parquet row groups from partition values and column statistics. How much it skips depends on whether the table is partitioned or sorted by the time column, or compacted so that old and new rows share a file. See [Append refresh and table layout](../../../components/data-connectors/iceberg.md#append-refresh-and-table-layout).

## Related Topics

- [Refresh Interval](../data-refresh#refresh-interval)
- [Refresh on Startup](../data-refresh#refresh-on-startup)
- [Refresh Retries](../data-refresh#refresh-retries)
- [Retention Policy](../data-refresh#retention-policy)
- [Refresh Data Window](../data-refresh#refresh-data-window)
