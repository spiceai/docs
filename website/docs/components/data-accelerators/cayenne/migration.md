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

For an append or change-fed acceleration, check the data itself rather than its configuration. Compare what the acceleration holds with what the source still has, for example the row count and the oldest value of the dataset's `time_column`, queried through Spice for the acceleration and directly against the source:

```sql
SELECT count(*), min(created_at) FROM orders;
```

[Retention settings](../../../features/data-acceleration/data-refresh#retention-policy) explain the difference but do not bound it. Retention runs only with `retention_check_enabled: true`, and only every `retention_check_interval`, so the acceleration can hold rows older than `retention_period` between checks; `retention_sql` deletes whatever rows its condition matches, which need not be an age limit; and with retention off, the acceleration keeps everything appended since it was created. On the source side, a Kafka topic's retention, a table TTL, or a purged change log limits what a rebuild can read, and so does the dataset's own `refresh_data_window`. If the acceleration holds rows the source no longer has, a rebuild loses them.

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

An `arrow` acceleration is in memory, which is Cayenne's default `mode`, so setting `engine: cayenne` is usually the whole change. Two configurations need one more change before the dataset loads on Cayenne:

- **`partition_by` with `mode: memory`.** Cayenne partitions only in file mode, and rejects `partition_by` on an in-memory acceleration. On a single Spice instance, remove `partition_by`. In a cluster, where `partition_by` is what spreads a dataset across executors, set `mode: file` instead.
- **A Debezium topic without message keys.** Cayenne applies Debezium updates and deletes by key, and rejects a topic whose messages carry no Kafka key; only `arrow` accepted keyless messages. Give the source table a primary key, or set `message.key.columns` in the Debezium connector (see the [PostgreSQL connector's property](https://debezium.io/documentation/reference/stable/connectors/postgresql.html#postgresql-property-message-key-columns); other Debezium connectors have the same property) so each message carries one. Declaring `primary_key` in the Spicepod does not help, because the key must be in the messages.

Datasets that load from [snapshots](../../../features/data-acceleration/snapshots) need an order. A dataset with [`refresh_mode: snapshot`](../../../features/data-acceleration/refresh-modes/snapshot), or one that reads another instance's snapshots, never loads from the source, and Cayenne skips snapshots written by another engine. A reader switched to Cayenne therefore has nothing to load until a Cayenne snapshot exists. Migrate the instance that writes the snapshots first, wait until it has published a `.cayenne` snapshot, and then migrate its readers.

Restart Spice, then confirm that Cayenne finished its first load before comparing or deleting anything. With the default [`ready_state: on_load`](../../../reference/spicepod/datasets#ready_state), a migrated dataset reports ready only after that load. With `on_registration` or `on_schema_resolved`, it reports ready earlier and answers queries from the source until the load finishes, so a query run then checks the source, not Cayenne. Use `on_load` for the migration, or wait for the dataset's load line in the log:

```text
INFO runtime_table::accelerated::refresh_task: Loaded 4 rows (92.00 B) for dataset orders in 16ms
```

Then run the query from step 1 against the migrated dataset and check that the row count and oldest value match what the old acceleration held. See the [Cayenne reference](./index.md) for Cayenne's own parameters.

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

Delete the files ending in `.duckdb`, `.sqlite`, or `.turso` under each migrated dataset's `dataset=<name>/` folders, but only once every instance that reads those snapshots has moved to Cayenne: a reader still on the old engine needs them to load. Do not delete the folders themselves, because Cayenne writes its own `.cayenne` snapshots into the same place.

## Removing the Turso metastore

Spice v2.4.1 and earlier offered an experimental Turso backend for Cayenne's own metastore, selected with `acceleration.params.cayenne_metastore: turso`. The backend is removed, and SQLite is Cayenne's only metastore. This is separate from the `turso` acceleration engine described above.

A dataset that still sets `cayenne_metastore: turso` over a SQLite metastore loads normally, because the parameter has no effect. Spice logs a warning once per dataset:

```text
Dataset 'orders' sets `cayenne_metastore: turso`, which is no longer supported and has no effect: the dataset uses the built-in metastore. Remove `cayenne_metastore` from this dataset. See: https://spiceai.org/docs/components/data-accelerators/cayenne/migration
```

A metastore that the Turso backend wrote cannot be opened, whether or not the parameter is still set, and there is no in-place conversion. The dataset fails to load with an error that names the metastore file and its directory:

```text
Failed to load dataset 'orders' (cayenne): the Cayenne metastore '<metadata dir>/cayenne.db' was written by the Turso metastore, which is no longer supported, so it cannot be opened. Stop Spice, remove `cayenne_metastore` from every dataset that sets it, delete the Cayenne metastore directory '<metadata dir>', then start Spice to reload the datasets from their sources. Every Cayenne dataset that uses this metastore also reloads from its source. See: https://spiceai.org/docs/components/data-accelerators/cayenne/migration
```

One Spice instance keeps a single Cayenne metastore, shared by every file-mode Cayenne dataset, so deleting it rebuilds all of them from their sources. Check each of them with [Step 1](#step-1-check-whether-the-acceleration-can-be-rebuilt) before you delete it.

Back up the directory the error names, then list what it holds before you delete anything. The Cayenne metastore is `cayenne.db` and the files beside it whose names start with `cayenne.db`, such as `cayenne.db-log`. A directory set with [`cayenne_metadata_dir`](./index.md) can also hold other files, such as a source file or the default DuckDB and SQLite acceleration files in `.spice/data` that [Step 3](#step-3-delete-the-old-acceleration-data) lists. In that case, delete only the metastore files and leave every other file where it is, so the datasets that read or write those files keep working.

## Migrating the DuckDB vector engine

The [DuckDB vector engine](../../vectors/duckdb) (`vectors.engine: duckdb`) is deprecated in v2.4 and will be removed in v2.5 along with the DuckDB accelerator it depends on. A Cayenne acceleration does not need a vector engine: Cayenne indexes every embedding column itself, so `vector_search` and `/v1/search` work on a Cayenne dataset or view as soon as its embeddings are configured.

To migrate, set `acceleration.engine: cayenne` and remove the `vectors` block entirely. Removing only `engine` is not enough, because an enabled `vectors` block with no `engine` is an error. The `duckdb_*` parameters under `vectors.params` (`duckdb_distance_metric` and the HNSW settings) have no Cayenne equivalent and go with the block. For example:

```yaml
datasets:
  - from: file:products.parquet
    name: products
    acceleration:
      enabled: true
      engine: duckdb
    vectors:
      enabled: true
      engine: duckdb
      params:
        duckdb_distance_metric: cosine
    columns:
      - name: description
        embeddings:
          - from: local_embedding_model
```

becomes:

```yaml
datasets:
  - from: file:products.parquet
    name: products
    acceleration:
      enabled: true
      engine: cayenne
    columns:
      - name: description
        embeddings:
          - from: local_embedding_model
```

Cayenne's vector index is exact: it scores every candidate row, using cosine distance by default, instead of searching an approximate HNSW graph. It returns the true nearest rows, and its query time grows with the number of rows searched. For approximate search over very large datasets, use the [S3 Vectors engine](../../vectors/s3_vectors) instead.

The DuckDB vector engine sets its distance metric in configuration (`duckdb_distance_metric`); Cayenne takes it per query, as the `distance_metric` argument of [`vector_search`](../../../reference/sql/search#vector-search-vector_search), and defaults to cosine. If a dataset used `duckdb_distance_metric: l2` or `inner_product`, pass the matching metric in each query, `'l2'` or `'dot'`, for example `vector_search(products, 'query', distance_metric => 'l2')`; otherwise results can rank differently.

With the default cosine metric, the two engines rank results the same way but report `_score` on different scales. The DuckDB vector engine reports cosine similarity, from -1 to 1; Cayenne reports `(1 + cosine similarity) / 2`, from 0 to 1, so a DuckDB score of `0.76` is `0.88` on Cayenne. Queries or alerts that compare `_score` with a fixed threshold, such as `WHERE _score > 0.7`, need the threshold converted: a DuckDB threshold `t` becomes `(1 + t) / 2`. That conversion holds only for cosine; for `l2` or `inner_product`, check any `_score` threshold against Cayenne's results before relying on it.

The DuckDB vector engine stores its embeddings in the DuckDB acceleration file, so deleting that file in [step 3](#step-3-delete-the-old-acceleration-data) removes them too. Cayenne computes the embeddings again as it loads the dataset from the source.
