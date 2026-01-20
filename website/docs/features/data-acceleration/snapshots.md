---
title: 'Snapshots'
sidebar_label: 'Snapshots'
description: 'Bootstrap file-mode accelerations from managed snapshots to eliminate cold starts.'
sidebar_position: 3
---

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

Acceleration snapshots let Spice reuse a pre-built acceleration file on startup instead of waiting for a full refresh. When a dataset uses a file-mode acceleration engine (DuckDB or SQLite) and the local file is missing (for example on first boot or when using ephemeral NVMe storage), Spice downloads the most recent snapshot from object storage and moves the dataset straight to a ready state.

:::info Preview
Acceleration snapshots are available in preview.
:::

## How it works

- On startup, Spice checks whether the file supplied in `acceleration.params` (for example `duckdb_file`) exists.
- If the file is missing and snapshots are enabled, Spice looks under the configured snapshot location and downloads the newest snapshot for that dataset.
- If no snapshot is available, the acceleration boots empty and refreshes from the source.
- Spice creates new snapshots based on the configured `snapshots_trigger` mode.

Snapshots are organized with Hive-style partitioning so they are easy to retain and prune. For a dataset named `my_dataset`, Spice writes files such as:

```bash
s3://some_bucket/some_folder/month=2025-09/day=2025-09-30/dataset=my_dataset/my_dataset_20250919T134522Z.db
```

The timestamp is recorded in UTC using ISO 8601 without punctuation.

:::warning Dedicated files only
Every accelerated dataset must write to its own file (for example, `/nvme/my_dataset.db`). Sharing a single file across multiple datasets is not supported.
:::

## Configure snapshot storage

Snapshots are controlled with a top-level `snapshots` block in the Spicepod. The location must point to a folder on S3 or the local filesystem. When the location is an S3 bucket, the configuration accepts any S3 dataset parameters under `params`.

```yaml
snapshots:
  enabled: true
  location: s3://some_bucket/some_folder/ # Folder where snapshots are written
  bootstrap_on_failure_behavior: warn     # retry | fallback | warn
  params:
    s3_auth: iam_role                     # Defaults to iam_role for snapshots
```

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
  snapshots: enabled | disabled          # default: disabled
  snapshots_trigger: <trigger_mode>      # see trigger modes below
  snapshots_trigger_threshold: <value>   # threshold for time_interval or stream_batches
  snapshots_compaction: enabled | disabled  # default: disabled (DuckDB only)
  snapshots_reset_expiry_on_load: enabled | disabled  # default: disabled (DuckDB only with Caching refresh mode)
  snapshots_creation_policy: always | on_change  # default: on_change
```

### Snapshot triggers

The `snapshots_trigger` setting controls when Spice creates new snapshots. The available triggers depend on the dataset's refresh mode.

#### Batch-based datasets

Datasets using `refresh_mode: full`, `refresh_mode: caching`, or `refresh_mode: append` with a `time_column` support the following triggers:

| Trigger | Description |
|---------|-------------|
| `refresh_complete` | Create a snapshot after each data refresh completes. (Default.) |
| `time_interval` | Create snapshots at a fixed time interval. |

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

#### Stream-based datasets

Datasets using `refresh_mode: changes`, or `refresh_mode: append` without a `time_column`, support the following triggers:

| Trigger | Description |
|---------|-------------|
| `time_interval` | Create snapshots at a fixed time interval. (Default: 10m.) |
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

### Snapshot Creation Policy

By default, snapshots are only created if there was a change since the last snapshot. You can change this behavior to always create a snapshot by setting `snapshots_creation_policy` to `always`.

```yaml
acceleration:
  enabled: true
  engine: duckdb
  mode: file
  refresh_mode: caching
  snapshots: enabled
  snapshots_creation_policy: always
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
Append-mode accelerations that define a `time_column` wait to report ready until the first append refresh completes after snapshot bootstrap. This keeps the dataset out of rotation until the freshest data is available while still benefiting from the snapshot-assisted startup. See [Fast Cold Starts](./data-refresh.md#fast-cold-starts-with-snapshots) for additional context.
:::

## Best practices

- **Pair with ephemeral storage:** Deployments commonly place the acceleration file on fast ephemeral disks (such as NVMe instance storage) while relying on snapshots for persistence across restarts.
- **Enable compaction for large datasets:** Use `snapshots_compaction: enabled` for DuckDB accelerations to reduce snapshot size and improve bootstrap performance.
- **Tune trigger thresholds for stream datasets:** For high-throughput streaming datasets, balance snapshot frequency against I/O overhead by adjusting `snapshots_trigger_threshold`.
- **Align retention policies:** Apply an object storage lifecycle rule that mirrors the desired snapshot retention policy.
- **Monitor bootstraps:** Track warning logs emitted when Spice falls back to an empty acceleration so operators can respond quickly if snapshot loading fails.

For the full reference, see [`snapshots` in the Spicepod specification](/docs/reference/spicepod/index.md#snapshots) and [`acceleration.snapshots`](/docs/reference/spicepod/datasets.md#accelerationsnapshots).    