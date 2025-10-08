---
title: 'Acceleration Snapshots'
sidebar_label: 'Acceleration Snapshots'
description: 'Bootstrap file-mode accelerations from managed snapshots to eliminate cold starts.'
sidebar_position: 3
---

## Example

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
- After each refresh, Spice writes a new snapshot unless the dataset is configured in `bootstrap_only` mode.

Snapshots are organized with Hive-style partitioning so they are easy to retain and prune. For a dataset named `my_dataset`, Spice writes files such as:

```bash
s3://some_bucket/some_folder/month=2025-09/day=2025-09-30/dataset=my_dataset/my_dataset_20250919T134522Z.db
```

The timestamp is recorded in UTC using ISO 8601 without punctuation.

:::warning Dedicated files only
Every accelerated dataset must write to its own file (for example, `/nvme/my_dataset.db`). Sharing a single file across multiple datasets is not supported.
:::

## Configure snapshot storage

Snapshots are controlled with a new top-level `snapshots` block in the Spicepod. The location must point to a folder on S3 or the local filesystem. When the location is an S3 bucket, the configuration accepts any S3 dataset parameters under `params`.

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

Example Spicepod configuration:

```yaml
snapshots:
  enabled: true
  location: s3://some_bucket/some_folder/
  bootstrap_on_failure_behavior: warn
  params:
    s3_auth: iam_role

datasets:
  - from: s3://some_bucket/some_table/
    name: some_table
    params:
      file_format: parquet
      s3_auth: iam_role
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      snapshots: enabled
      params:
        duckdb_file: /nvme/some_table.db
```

:::info Readiness with append refreshes
Append-mode accelerations that define a `time_column` wait to report ready until the first append refresh completes after snapshot bootstrap. This keeps the dataset out of rotation until the freshest data is available while still benefiting from the snapshot-assisted startup. See [Fast Cold Starts](./data-refresh.md#fast-cold-starts-with-snapshots) for additional context.
:::

## Best practices

- **Pair with ephemeral storage:** Deployments commonly place the acceleration file on fast ephemeral disks (such as NVMe instance storage) while relying on snapshots for persistence across restarts.
- **Align retention policies:** Apply an object storage lifecycle rule that mirrors the desired snapshot retention policy.
- **Monitor bootstraps:** Track warning logs emitted when Spice falls back to an empty acceleration so operators can respond quickly if snapshot loading fails.

For the full reference, see [`snapshots` in the Spicepod specification](/docs/reference/spicepod/index.md#snapshots) and [`acceleration.snapshots`](/docs/reference/spicepod/datasets.md#accelerationsnapshots).
