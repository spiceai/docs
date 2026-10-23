---
title: 'Migrating to Spice Cayenne'
sidebar_label: 'Migrating to Cayenne'
description: 'Move accelerations from the deprecated arrow, duckdb, sqlite, turso, and postgres engines to Spice Cayenne, and delete the old acceleration files and snapshots.'
sidebar_position: 2
pagination_prev: null
pagination_next: null
tags:
  - data-accelerators
  - cayenne
  - migration
---

Every acceleration engine other than Cayenne (`arrow`, `duckdb`, `sqlite`, `turso`, and `postgres`) is deprecated in Spice v2.4 and will be removed in v2.5. This guide explains how to move an acceleration to Cayenne, how to tell whether an acceleration is safe to rebuild, and which files and snapshots to delete afterwards.

## What Spice reports

In v2.4, a Spicepod that uses a deprecated engine logs one warning at startup, naming the datasets and views that use it, and one more on each hot reload for the components the reload added or changed:

```text
WARN runtime::init::dataset: Acceleration engines other than `cayenne` are deprecated and will be removed in v2.5, so these accelerations must move to `cayenne` before upgrading: `duckdb` (dataset 'orders', view 'daily'), `sqlite` (dataset 'customers'). Set `acceleration.engine: cayenne`, or remove `engine` to use the default, which is `cayenne`, then delete the old engine's acceleration files and snapshots. See: https://spiceai.org/docs/components/data-accelerators/cayenne/migration
```

In v2.5, a dataset or view that still names a removed engine fails to load, and the other components load normally. Spice never switches such an acceleration to Cayenne on its own, because a silent rebuild would discard any data the source does not have.

## Step 1: Check whether the acceleration can be rebuilt

Cayenne does not read another engine's files. A migrated acceleration starts empty and loads its data from the source, so the migration is only safe when the source still holds everything the acceleration holds.

That is not the case for three kinds of acceleration. A dataset with `write_mode: acceleration` keeps its writes only in the acceleration; they never reach the source. A dataset with `write_mode: write_back` may hold writes that have not yet been delivered, which the `dataset_acceleration_write_back_pending_keys` metric reports while it is above zero. A dataset with `refresh_mode: append` or `refresh_mode: changes` may hold history the source no longer keeps.

To judge how much history an append or change-fed acceleration holds, compare its retention settings with the source's own retention, such as a Kafka topic's retention, a table TTL, or a purged change log. With `retention_check_enabled: true`, the acceleration evicts rows past `retention_period` or matching `retention_sql`, so it holds at most that much history; with retention off, it holds everything appended since it was created. `refresh_data_window` bounds what a rebuild reads from the source, so a window shorter than the history the acceleration holds also rebuilds with less. If the acceleration holds more history than the source still keeps, a rebuild loses the difference.

Keep an acceleration that holds data its source does not on Spice v2.4, the long-term support release, until that data has been moved, and keep its files until the move is verified.

## Step 2: Switch the engine

Set `acceleration.engine: cayenne`, or remove `engine`, since Cayenne is the default. Engine-specific parameters (`duckdb_*`, `sqlite_*`, `turso_*`, and `pg_*` under `acceleration.params`) no longer apply, so remove them. For example, a file-mode DuckDB acceleration:

```yaml
datasets:
  - from: postgres:public.orders
    name: orders
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      params:
        duckdb_file: /data/orders.db
```

becomes:

```yaml
datasets:
  - from: postgres:public.orders
    name: orders
    acceleration:
      enabled: true
      engine: cayenne
      mode: file
```

An `arrow` acceleration is in memory, which is Cayenne's default `mode`, so setting `engine: cayenne` is the whole change. Restart Spice and wait for the dataset to report ready before deleting anything. See the [Cayenne reference](./index.md) for Cayenne's own parameters.

Cayenne is not available on native Windows, where `arrow` is the default engine. On Windows, run Spice in Docker or WSL to use Cayenne.

## Step 3: Delete the old acceleration data

Cayenne neither reads nor removes the previous engine's data. Once every acceleration that used a file has moved, delete it as described below. In-memory (`mode: memory`) accelerations of any engine leave nothing behind.

| Engine     | Where the data is                                                    | Default when unset                                                                                   |
| ---------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `arrow`    | In memory                                                            | Nothing to delete.                                                                                   |
| `duckdb`   | The file named by `params.duckdb_file`                               | `accelerated_duckdb.db` in `params.duckdb_data_dir`, which defaults to `.spice/data` in the working directory |
| `sqlite`   | The file named by `params.sqlite_file`                               | `.spice/data/accelerated_sqlite.db` in the working directory                                          |
| `turso`    | The file named by `params.turso_file`                                | `.spice/data/<dataset>.turso` in the working directory, with any `/` in the dataset name replaced by `_` |
| `postgres` | The dataset's table in the PostgreSQL database named by its `pg_*` parameters | Spice does not drop the table; drop it in PostgreSQL.                                          |

The default `duckdb` and `sqlite` files are shared by every dataset on that engine that does not set its own file, so delete a default file only after all of those datasets have moved. When a dataset sets both `duckdb_file` and `duckdb_data_dir`, `duckdb_file` is the one in use. Delete any companion files with the same name beside a database file as well, such as a DuckDB `.wal` file or SQLite `-wal` and `-shm` files.

Do not delete the `.spice/data` folder itself: it also holds Cayenne's data.

## Step 4: Delete the old snapshots

A dataset with [snapshots](../../../features/data-acceleration/snapshots) enabled keeps its snapshot files under its snapshot location. That location is `acceleration.snapshots_location` when set, otherwise the top-level `snapshots.location`, otherwise the `snapshots/` folder of `runtime.state.location`. Each snapshot file is stored at:

```text
<location>/month=YYYY-MM/day=YYYY-MM-DD/dataset=<name>/<name>_<timestamp>_<id>.<ext>
```

Delete the files ending in `.duckdb`, `.sqlite`, or `.turso` under each migrated dataset's `dataset=<name>/` folders. Do not delete the folders themselves, because Cayenne writes its own `.cayenne` snapshots into the same place.
