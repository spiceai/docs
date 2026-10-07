---
title: 'Snapshots'
sidebar_label: 'Snapshots'
description: 'Bootstrap file-mode accelerations from managed snapshots to eliminate cold starts.'
sidebar_position: 3
---

:::note[Enterprise edition]
Acceleration Snapshots are available in the Spice [Enterprise edition](https://docs.spice.ai/docs/enterprise/getting-started/distributions).
:::

## Spicepod Example

```yaml
snapshots:
  enabled: true
  location: s3://some_bucket/some_folder/
  bootstrap_on_failure_behavior: warn
  params:
    s3_auth: iam_role

datasets:
  - name: some_table
    acceleration:
      engine: duckdb
      mode: file
      snapshots: enabled
      snapshots_trigger: refresh_complete
      params:
        duckdb_file: /nvme/some_table.db
```

## Overview

Acceleration snapshots let Spice reuse a pre-built acceleration file on startup instead of waiting for a full refresh. When a dataset uses a file-mode acceleration engine (DuckDB, SQLite, Cayenne, or Turso) and the local file is missing (for example on first boot or when using ephemeral NVMe storage), Spice downloads the most recent snapshot from object storage and moves the dataset straight to a ready state.

## How it works

- On startup, Spice checks whether the file supplied in `acceleration.params` (for example `duckdb_file`) exists.
- If the file is missing and snapshots are enabled, Spice looks under the configured snapshot location and downloads the newest snapshot for that dataset.
- If no snapshot is available, the acceleration boots empty and refreshes from the source.
- Spice creates new snapshots based on the configured `snapshots_trigger` mode.

Snapshots are organized with Hive-style partitioning so they are easy to retain and prune. For a dataset named `my_dataset` accelerated with DuckDB, Spice writes files such as:

```bash
s3://some_bucket/some_folder/month=2025-09/day=2025-09-30/dataset=my_dataset/my_dataset_20250919T134522Z.duckdb
```

The timestamp is recorded in UTC using ISO 8601 without punctuation. The file extension names the acceleration engine that wrote the snapshot: `.duckdb`, `.sqlite`, `.cayenne`, or `.turso`. The engine is also recorded in the snapshot metadata, and a snapshot whose engine differs from the dataset's current engine is rejected at bootstrap rather than restored.

:::warning Dedicated files only
Every accelerated dataset must write to its own file (for example, `/nvme/my_dataset.db`). Sharing a single file across multiple datasets is not supported.
:::

## What each snapshot contains

Each snapshot is a complete copy of that dataset's acceleration file at the time Spice writes it. The object under the snapshot location is the whole accelerated dataset — DuckDB, SQLite, Cayenne, or Turso — ready for a reader to download and open. Spice writes that full file on every snapshot. It does not publish an incremental delta of the rows or objects that changed since the previous snapshot.

A bootstrap, and a [`refresh_mode: snapshot`](./data-refresh#snapshot) reload, replaces the local acceleration file with that copy. Every upload moves the full file, and bucket or object replication of the snapshot prefix moves the full file again. Storage grows with the size of the accelerated dataset times how often snapshots are written, until a lifecycle rule expires older objects. DuckDB [`snapshots_compaction`](#snapshot-compaction) can shrink each copy. The uploaded object is still a full file.

When the workload needs incremental replication of changed data between regions or storage tiers, use a path that publishes the changed objects:

- **Cayenne cold / datalake tier.** [`cayenne_datalake_location`](../../components/data-accelerators/cayenne#cold-object-store-tier) graduates data onto standard object storage (a general-purpose S3 or S3-compatible bucket). Promotion carries unchanged cold files forward and rewrites the cold files a change can touch. The tier requires `refresh_mode: changes` or `append` and a primary key. It is a data tier, separate from `snapshots.location`.
- **Iceberg batched writes with merge-on-read.** [Iceberg writes](../../components/data-connectors/iceberg#write-support) append new data files, and [deletes](../../components/data-connectors/iceberg#deleting-rows) are equality delete files that readers merge on scan. A catalog commit publishes those objects. Use this path when the dataset lives in Iceberg and readers apply delete files during scan.

Neither path bootstraps a file-mode accelerator. Keep snapshots for that.

## Configure snapshot storage

Snapshots are controlled with a top-level `snapshots` block in the Spicepod. The location can point to S3, Azure ADLS Gen2, Google Cloud Storage, or the local filesystem.

```yaml
snapshots:
  enabled: true
  location: s3://some_bucket/some_folder/ # Folder where snapshots are written
  bootstrap_on_failure_behavior: warn # retry | fallback | warn
  params:
    s3_auth: iam_role # Defaults to iam_role for snapshots
```

### Supported storage backends

| Backend              | URL scheme                | Environment variables                                                                                                       |
| -------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Amazon S3            | `s3://`                   | Standard AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, etc.)                                               |
| Azure ADLS Gen2      | `abfss://`, `abfs://`     | `AZURE_STORAGE_ACCOUNT_NAME`, `AZURE_STORAGE_ACCOUNT_KEY`, `AZURE_CLIENT_ID`/`AZURE_TENANT_ID`/`AZURE_FEDERATED_TOKEN_FILE` |
| Google Cloud Storage | `gs://`                   | `GOOGLE_APPLICATION_CREDENTIALS`, Workload Identity                                                                         |
| Local filesystem     | `file://`                 | N/A                                                                                                                         |

`location` must be a URI with a scheme — a bare filesystem path such as `/nvme/snapshots` is not a valid URI, so it fails to parse and snapshots are disabled with an error logged. Use `file:///nvme/snapshots/` for a local folder.

When the location is an S3 bucket, the configuration accepts any [S3 dataset parameters](../../components/data-connectors/s3) under `params`. Azure and GCS locations also accept their respective connector parameters under `params` for explicit credential overrides. When no explicit credentials are supplied, Spice reads standard environment variables for each cloud provider.

### Snapshot location and the Cayenne data tier

Keep `location` on standard object storage: Amazon S3 (`s3://`), Google Cloud Storage (`gs://`), or Azure ADLS Gen2 (`abfss://`, `abfs://`). A local `file://` folder is valid on a single machine. Standard cloud storage is what bucket and object replication, and readers in another region, use.

`location` is independent of Cayenne's S3 Express One Zone data tier. `cayenne_file_path` and the `cayenne_s3_*` parameters (`cayenne_s3_region`, `cayenne_s3_zone_ids`, `cayenne_s3_auth`, and the related keys) store Cayenne Vortex files on an Express One Zone directory bucket. That bucket is single-zone storage for the accelerator's data files. It does not substitute for the snapshot bucket, and it does not provide the replication or multi-region reads a standard snapshot location does. See [S3 Express One Zone storage](../../components/data-accelerators/cayenne#aws-s3-express-one-zone-storage).

The Cayenne [cold tier](../../components/data-accelerators/cayenne#cold-object-store-tier) uses a general-purpose S3 or S3-compatible bucket, set by `cayenne_datalake_location`, not GCS or ADLS. That prefix is the cold data tier, separate from `snapshots.location`.

### Failure behavior

`bootstrap_on_failure_behavior` controls what Spice does when it cannot load the most recent snapshot.

- `retry` – keep retrying the newest snapshot until it succeeds.
- `fallback` – try older snapshot files until one loads successfully.
- `warn` – log a warning and continue with an empty acceleration. (Default.)

## Enable snapshots per dataset

Each dataset opts into snapshotting through the `acceleration.snapshots` field. Four modes are available:

- `enabled` – download snapshots on startup and write a new snapshot after each refresh.
- `bootstrap_only` – only download snapshots; never write new ones.
- `create_only` – write new snapshots after refreshes, but never download them on startup.
- `disabled` – disable snapshot usage for this dataset. (Default.)

Complete configuration:

```yaml
acceleration:
  snapshots: enabled | disabled # default: disabled
  snapshots_trigger: <trigger_mode> # see trigger modes below
  snapshots_trigger_threshold: <value> # threshold for time_interval or stream_batches
  snapshots_compaction: enabled | disabled # default: disabled (DuckDB only)
  snapshots_reset_expiry_on_load: enabled | disabled # default: disabled (DuckDB only with Caching refresh mode)
```

### Snapshot triggers

The `snapshots_trigger` setting controls when Spice creates new snapshots. The available triggers depend on the dataset's refresh mode.

#### Batch-based datasets

Datasets using `refresh_mode: full`, or `refresh_mode: append` with a `time_column`, support the following triggers:

| Trigger            | Description                                                     |
| ------------------ | --------------------------------------------------------------- |
| `refresh_complete` | Create a snapshot after each data refresh completes. (Default.) |
| `time_interval`    | Create snapshots at a fixed time interval.                      |

Example with default trigger:

```yaml
datasets:
  - from: s3://some_bucket/some_table/
    name: some_table
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      snapshots: enabled
      # snapshots_trigger defaults to refresh_complete
      params:
        duckdb_file: /nvme/some_table.db
```

Example with time-based trigger:

```yaml
datasets:
  - from: s3://some_bucket/some_table/
    name: some_table
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      snapshots: enabled
      snapshots_trigger: time_interval
      snapshots_trigger_threshold: 30m
      params:
        duckdb_file: /nvme/some_table.db
```

#### Caching datasets

Datasets using `refresh_mode: caching` support a single trigger:

| Trigger         | Description                                                                           |
| --------------- | ------------------------------------------------------------------------------------- |
| `time_interval` | Create snapshots at a fixed time interval. (Default, and the only supported trigger.) |

The interval is set with `snapshots_trigger_threshold` and defaults to `10m`. Setting `snapshots_trigger` to `refresh_complete` or `stream_batches` on a caching dataset is a configuration error.

#### Stream-based datasets

Datasets using `refresh_mode: changes`, or `refresh_mode: append` without a `time_column`, support the following triggers:

| Trigger          | Description                                                          |
| ---------------- | -------------------------------------------------------------------- |
| `time_interval`  | Create snapshots at a fixed time interval. (Default: 10m.)           |
| `stream_batches` | Create a snapshot after a specified number of batches are processed. |

Example with time-based trigger (default):

```yaml
datasets:
  - from: debezium:cdc_source
    name: cdc_table
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      refresh_mode: changes
      snapshots: enabled
      # snapshots_trigger defaults to time_interval
      # snapshots_trigger_threshold defaults to 10m
      params:
        duckdb_file: /nvme/cdc_table.db
```

Example with batch-based trigger:

```yaml
datasets:
  - from: debezium:cdc_source
    name: cdc_table
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      refresh_mode: changes
      snapshots: enabled
      snapshots_trigger: stream_batches
      snapshots_trigger_threshold: 300
      params:
        duckdb_file: /nvme/cdc_table.db
```

### Snapshot compaction

For DuckDB-based accelerations, enable `snapshots_compaction` to compact the database before uploading. This uses DuckDB's internal mechanism (`COPY DATABASE`) to reduce file size and improve read performance.

```yaml
acceleration:
  enabled: true
  engine: duckdb
  mode: file
  snapshots: enabled
  snapshots_compaction: enabled
  params:
    duckdb_file: /nvme/some_table.db
```

:::info
Compaction is only available for the DuckDB acceleration engine.
:::

### Snapshot Resetting Expiry on Load

When using `Caching` refresh mode with DuckDB-based acceleration, you can enable `snapshots_reset_expiry_on_load` to extend the data's expiry to `now() + TTL` each time a snapshot is loaded.

```yaml
acceleration:
  enabled: true
  engine: duckdb
  mode: file
  refresh_mode: caching
  snapshots: enabled
  snapshots_reset_expiry_on_load: enabled
  params:
    caching_ttl: 1m
    caching_stale_while_revalidate_ttl: 1m
```

## Complete example

```yaml
snapshots:
  enabled: true
  location: s3://some_bucket/some_folder/
  bootstrap_on_failure_behavior: warn
  params:
    s3_auth: iam_role

datasets:
  # Batch dataset with refresh-triggered snapshots
  - from: s3://some_bucket/batch_table/
    name: batch_table
    params:
      file_format: parquet
      s3_auth: iam_role
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      snapshots: enabled
      snapshots_trigger: refresh_complete
      snapshots_compaction: enabled
      params:
        duckdb_file: /nvme/batch_table.db

  # Stream dataset with time-interval snapshots
  - from: debezium:cdc_source
    name: stream_table
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      refresh_mode: changes
      snapshots: enabled
      snapshots_trigger: time_interval
      snapshots_trigger_threshold: 5m
      params:
        duckdb_file: /nvme/stream_table.db
```

:::info Readiness with append refreshes
Append-mode accelerations that define a `time_column` wait to report ready until the first append refresh completes after snapshot bootstrap. This keeps the dataset out of rotation until the freshest data is available while still benefiting from the snapshot-assisted startup. See [Fast Cold Starts](./data-refresh#fast-cold-starts-with-snapshots) for additional context.
:::

## Serve a dataset from published snapshots

A Spice instance can serve the snapshots another instance publishes without any connection to the original source. Set `from` to the S3 prefix that holds the snapshots' `metadata.json` and set `file_format: snapshot`:

```yaml
datasets:
  - from: s3://some_bucket/some_folder/ # The prefix that holds metadata.json
    name: some_table # Selects the some_table entry in metadata.json
    params:
      file_format: snapshot
      s3_region: us-east-1
      s3_auth: iam_role
```

The dataset name selects the entry in `metadata.json`, so it must match the name of the dataset that publishes the snapshots. Spice reads `metadata.json`, detects the engine that created the dataset's current snapshot (Cayenne, DuckDB, SQLite, or Turso), restores that snapshot into the same engine, and serves queries from it. It then checks for newer snapshots and swaps each one in, as the [`snapshot` refresh mode](./refresh-modes/snapshot) does.

A snapshot dataset needs no `acceleration` block, no `refresh_mode`, no `acceleration.snapshots` setting, and no top-level `snapshots` section. The snapshot location comes from the dataset's own `from` and `s3_*` params. An optional `acceleration` block can set `refresh_check_interval` (default `1m`) and engine params.

### Loading and readiness

The dataset reports Ready only after the current process has restored a snapshot. A local copy left from an earlier run is never served as current. Until the first snapshot is published, the dataset reports an error status and Spice logs a warning such as `Dataset 'some_table' has no snapshot to load yet, so it cannot be queried until one is published`. Spice keeps checking, with a backoff capped at `refresh_check_interval`. A query that reaches the dataset before a snapshot loads returns an error, not an empty result.

Spice keeps the local copy under `.spice/data/`. DuckDB, SQLite, and Turso copies are named for the dataset and a hash of the `from` location, so a dataset pointed at a new location never reopens the previous location's copy. Cayenne keeps its own layout: a data directory per dataset and one shared catalog, both under `.spice/data/` by default. Each parameter moves its own part. `cayenne_file_path` moves the data directory, and when it is a local path the catalog follows it to `{cayenne_file_path}/metadata`. `cayenne_metadata_dir` moves the catalog alone, and the data directory keeps its default. Setting both lets a reader keep its copy on a chosen volume, in the same layout as the writer:

```yaml
datasets:
  - from: s3://some_bucket/some_folder/
    name: some_table
    params:
      file_format: snapshot
      s3_region: us-east-1
      s3_auth: iam_role
    acceleration:
      params:
        cayenne_file_path: /data/some_table/
        cayenne_metadata_dir: /data/metadata/
```

Snapshot datasets follow the same [metastore location](../../components/data-accelerators/cayenne/index.md#metastore-location) rule as other Cayenne datasets: datasets that set different `cayenne_file_path` values must all set the same `cayenne_metadata_dir`, or the Spicepod is rejected at startup.

### Configuration constraints

The dataset is read-only. Spice rejects a configuration that contradicts reading snapshots, with an error that names the setting to remove:

- `from` must be an `s3://` location. Other connectors are not supported.
- `params` accepts only `file_format`, `s3_region`, `s3_endpoint`, `s3_auth`, `s3_key`, `s3_secret`, `s3_session_token`, `client_timeout`, and `allow_http`. `s3_auth` must be `iam_role` or `key`.
- `access` must be `read` (the default).
- `embeddings`, `vectors`, and `full_text_search` are not supported. Configure them on the dataset that publishes the snapshots.
- In the `acceleration` block, Spice rejects `enabled: false`, any `refresh_mode` other than `snapshot`, `mode: file_create` or `mode: file_update`, `snapshots: enabled` or `snapshots: create_only`, `refresh_sql`, the `retention_*` settings, `on_zero_results: use_source`, and an `engine` other than the one that created the snapshots.
- Engine path params (`duckdb_file`, `duckdb_data_dir`, `sqlite_file`, `turso_file`, and `cayenne_s3_zone_ids`) are rejected, because Spice chooses where the local copy lives. `cayenne_file_path` and `cayenne_metadata_dir` are accepted when the snapshots were created by Cayenne, and rejected by name when another engine created them.

### HTTP API behavior

`GET /v1/datasets/{name}/acceleration/snapshots` lists the snapshots at the dataset's own location. `POST /v1/datasets/{name}/acceleration/snapshots/current` returns `400 Bad Request`, because a reader never changes the metadata it reads; set the current snapshot on the instance that publishes the snapshots. `POST /v1/datasets/{name}/acceleration/refresh` checks for a newer snapshot.

## Best practices

- **Budget storage for a full file on every write.** Each snapshot is a complete copy of the accelerated dataset. See [What each snapshot contains](#what-each-snapshot-contains) and [Snapshot location and the Cayenne data tier](#snapshot-location-and-the-cayenne-data-tier).
- **Treat the snapshot interval as a freshness gap.** A reader that bootstraps from object storage serves the last successful snapshot until its own next refresh. `refresh_complete` is as fresh as the writer's last refresh; `time_interval` can be older still. Size the trigger against the freshness the readers are allowed to serve, and keep a durable volume when that gap is too wide. See [Read/Write Separation](../../deployment/read-write-separation).
- **Pair with ephemeral storage:** Deployments commonly place the acceleration file on fast ephemeral disks (such as NVMe instance storage) while relying on snapshots for persistence across restarts. Local NVMe is the recommended medium for accelerations — see [Storage](../../reference/performance-tuning#storage) for the tiers, the instance-store lifetime, and the capacity figures.
- **Enable compaction for large datasets:** Use `snapshots_compaction: enabled` for DuckDB accelerations to reduce snapshot size and improve bootstrap performance.
- **Tune trigger thresholds for stream datasets:** For high-throughput streaming datasets, balance snapshot frequency against I/O overhead by adjusting `snapshots_trigger_threshold`.
- **Align retention policies:** Apply an object storage lifecycle rule that mirrors the desired snapshot retention policy.
- **Monitor bootstraps:** Track warning logs emitted when Spice falls back to an empty acceleration so operators can respond quickly if snapshot loading fails.
- **Search indexes are not all inside the accelerator file.** A DuckDB HNSW index lives in the DuckDB file, so it is part of that dataset's snapshot. A built-in full-text index does not: the default in-memory Tantivy index is rebuilt on every start, and `index_store: file` writes a separate directory (`.spice/data/fts/...` unless `index_directory` is set) that acceleration snapshots do not upload. For restart parity of full-text search, keep that directory on the same durable volume as the acceleration file, or build the index once on a central tier and serve sidecars from the [search results cache](../caching). See [Where indexes are built](../search#where-indexes-are-built).

For the full reference, see [`snapshots` in the Spicepod specification](../../reference/spicepod#snapshots) and [`acceleration.snapshots`](../../reference/spicepod/datasets#accelerationsnapshots).

For the production deployment pattern that uses snapshots to separate ingest from read workloads, see [Read/Write Separation](../../deployment/read-write-separation).

:::warning[Limitations]

- Only datasets are supported for snapshots. Views are not supported.
- **Partitioned Cayenne** accelerations (`engine: cayenne` with `partition_by`) skip periodic and pre-recreate snapshots, with a warning naming the dataset.
- **Cayenne with a cold tier** (`cayenne_datalake_location` set) neither creates nor bootstraps from snapshots. The dataset loads from its source, with a warning naming the dataset. See [Cold Object-Store Tier](../../components/data-accelerators/cayenne/index.md#requirements-and-v1-constraints).

:::

## Cookbook

- A cookbook recipe to configure snapshots for file-mode accelerations so datasets avoid cold starts and recover quickly after restarts. [Accelerated Snapshots](https://github.com/spiceai/cookbook/tree/trunk/acceleration/snapshots#readme)
