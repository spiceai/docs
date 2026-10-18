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
runtime:
  state:
    location: s3://some_bucket/some_folder/
    params:
      s3_region: us-east-1

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
- If the file is missing and snapshots are enabled, Spice looks under the configured snapshot location and downloads the newest snapshot for that dataset. The download runs as consecutive 8 MiB range requests, four at a time, each with its own retries, so a slow connection does not restart the whole download. Each download holds at most 32 MiB in memory.
- If no snapshot is available, the acceleration boots empty and refreshes from the source. A [`refresh_mode: snapshot`](./refresh-modes/snapshot) reader instead waits for the first snapshot.
- Spice creates new snapshots based on the configured `snapshots_trigger` mode. A snapshot that fails for a transient reason, such as a network or object store error, is retried up to three times with backoff. A permanent failure, such as a schema mismatch, an unreadable `metadata.json`, or a store that does not enforce [conditional writes](#conditional-writes-on-the-snapshot-location), is not retried.

Snapshots are organized with Hive-style partitioning so they are easy to retain and prune. For a dataset named `my_dataset` accelerated with DuckDB, Spice writes files such as:

```bash
s3://some_bucket/some_folder/snapshots/month=2025-09/day=2025-09-19/dataset=my_dataset/my_dataset_20250919T134522Z_01996238f1157a59ae4d69b4f18b22a4.duckdb
```

The timestamp is recorded in UTC using ISO 8601 without punctuation. The UUIDv7 after the timestamp gives each snapshot its own object name, so two snapshots written in the same second do not overwrite each other. The file extension names the acceleration engine that wrote the snapshot: `.duckdb`, `.sqlite`, `.cayenne`, or `.turso`. The engine is also recorded in the snapshot metadata, and a snapshot whose engine differs from the dataset's current engine is rejected at bootstrap rather than restored.

:::warning Dedicated files only
Every accelerated dataset must write to its own file (for example, `/nvme/my_dataset.db`). Sharing a single file across multiple datasets is not supported.
:::

## What each snapshot contains

Each snapshot is a complete copy of that dataset's acceleration file at the time Spice writes it. The object under the snapshot location is the whole accelerated dataset — DuckDB, SQLite, Cayenne, or Turso — ready for a reader to download and open. Spice writes that full file on every snapshot. It does not publish an incremental delta of the rows or objects that changed since the previous snapshot.

A bootstrap, and a [`refresh_mode: snapshot`](./data-refresh#snapshot) reload, replaces the local acceleration file with that copy. Every upload moves the full file, and bucket or object replication of the snapshot prefix moves the full file again. Storage grows with the size of the accelerated dataset times the number of snapshots kept. The [28-day retention period](#snapshot-retention) applies to the entries in `metadata.json`; dropped files stay at least 24 more hours, until a later publish deletes them, so budget for about 29 days of snapshot files, plus the current and newest snapshot when they are older. DuckDB [`snapshots_compaction`](#snapshot-compaction) can shrink each copy. The uploaded object is still a full file.

When the workload needs incremental replication of changed data between regions or storage tiers, use a path that publishes the changed objects:

- **Cayenne cold / datalake tier.** [`cayenne_datalake_location`](../../components/data-accelerators/cayenne#cold-object-store-tier) graduates data onto standard object storage (a general-purpose S3 or S3-compatible bucket). Promotion carries unchanged cold files forward and rewrites the cold files a change can touch. The tier requires `refresh_mode: changes` or `append` and a primary key. It is a data tier, separate from the snapshot location.
- **Iceberg batched writes with merge-on-read.** [Iceberg writes](../../components/data-connectors/iceberg#write-support) append new data files, and [deletes](../../components/data-connectors/iceberg#deleting-rows) are equality delete files that readers merge on scan. A catalog commit publishes those objects. Use this path when the dataset lives in Iceberg and readers apply delete files during scan.

Neither path bootstraps a file-mode accelerator. Keep snapshots for that.

## Snapshot retention

Each dataset keeps the snapshots it published in the last 28 days. Its current snapshot and its newest snapshot are kept at any age, so the location always holds a snapshot to bootstrap from, however long ago it was published. The retention period is not configurable.

The instance that creates a dataset's snapshots applies retention each time it publishes one. In the same [conditional write](#conditional-writes-on-the-snapshot-location) of `metadata.json` that records the new snapshot, it drops the entries that are older than 28 days. It deletes a dropped snapshot's file 24 hours after the drop, so a reader that is still downloading the file can finish. About once an hour, the publishing instance also lists the dataset's snapshot files and deletes the files that no entry names and that are at least 24 hours old, such as the upload of a publish that failed. A publish that drops entries or deletes files logs a message such as:

```text
Snapshot cleanup of dataset 'orders' dropped 2 snapshots older than 28d and deleted 2 snapshot files.
```

Retention runs only when a snapshot is published, so the snapshots of a dataset that no longer publishes stay at the location. Spice v2.4.0-rc.2 and earlier keep every snapshot. After an upgrade, the first publish of each dataset drops its entries older than 28 days, and their files are deleted at a publish 24 hours or more later.

A dropped snapshot is no longer listed by `GET /v1/datasets/{name}/acceleration/snapshots`, and `POST /v1/datasets/{name}/acceleration/snapshots/current` cannot make it current: the request returns `404 Not Found`. To roll back further than 28 days, keep a copy of the snapshot outside the location.

A bucket lifecycle rule on the snapshot location can still delete files that `metadata.json` lists. Spice treats a snapshot whose file is gone as a failed download, and [`bootstrap_on_failure_behavior`](#failure-behavior) applies: `fallback` tries the next older snapshot, `warn` continues with an empty acceleration, and `retry` keeps retrying. When the file of an entry at least 24 hours old is gone, the publishing instance drops the entry and logs a warning that names the snapshot. The current and newest entries are never dropped this way, so a current or newest snapshot whose file is gone stays listed until a newer snapshot is published.

## Configure snapshot storage

Snapshots are stored in the `snapshots/` folder of [`runtime.state.location`](../../reference/spicepod/runtime#runtimestate), the object store that holds the Spicepod's shared runtime state, and use `runtime.state.params` (see [Store snapshots under `runtime.state`](#store-snapshots-under-runtimestate)). A dataset can store its snapshots elsewhere, with other params, by [setting its own snapshot location](#override-the-snapshot-location-per-dataset). The location can point to S3, Azure ADLS Gen2, Google Cloud Storage, or the local filesystem.

### Supported storage backends

| Backend              | URL scheme                | Environment variables                                                                                                       |
| -------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Amazon S3            | `s3://`                   | Standard AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, etc.)                                               |
| Azure ADLS Gen2      | `abfss://`, `abfs://`     | `AZURE_STORAGE_ACCOUNT_NAME`, `AZURE_STORAGE_ACCOUNT_KEY`, `AZURE_CLIENT_ID`/`AZURE_TENANT_ID`/`AZURE_FEDERATED_TOKEN_FILE` |
| Google Cloud Storage | `gs://`                   | `GOOGLE_APPLICATION_CREDENTIALS`, Workload Identity                                                                         |
| Local filesystem     | `file://`                 | N/A                                                                                                                         |

A snapshot location must be a URI with a scheme — a bare filesystem path such as `/nvme/snapshots` is not a valid URI, so it fails to parse and snapshots are disabled with an error logged. Use `file:///nvme/snapshots/` for a local folder.

When the location is an S3 bucket, its params accept these [S3 parameters](../../components/data-connectors/s3): `s3_region`, `s3_endpoint`, `s3_auth` (`iam_role` or `key`; default `iam_role`), `s3_key`, `s3_secret`, `s3_session_token`, `s3_queue_url` (an SQS queue that receives the location's S3 event notifications, so [`refresh_mode: snapshot` readers reload on publication](./refresh-modes/snapshot#reload-on-s3-event-notifications)), `client_timeout`, and `allow_http`. Spice ignores other keys and logs a warning for each. With `s3_auth: key`, both `s3_key` and `s3_secret` must be set; without them, Spice logs an error and does not use the snapshot location, rather than connecting with credentials from the environment. Azure locations also accept the Azure connector parameters under `params` for explicit credential overrides. GCS locations accept the [GCS data connector](../../components/data-connectors/gcs#authentication-parameters) parameter names, such as `gcs_service_account_key` and `gcs_skip_signature`, and validate them as a [`runtime.state` location](../../reference/spicepod/runtime#state-location-parameters) does. Spice v2.4.0-rc.1 and earlier ignored these names on a snapshot location. When no explicit credentials are supplied, Spice reads standard environment variables for each cloud provider. Values in `params` can reference [secrets](../../components/secret-stores) with `${secrets:<name>}` for S3, Azure, and GCS locations.

An invalid S3 parameter value, such as `s3_auth: public`, disables snapshots for the dataset. Spice logs an error that names the dataset, the location, and the parameter, and does not fall back to default parameters. Those defaults would drop every other configured parameter, including `s3_endpoint`, `s3_region`, and the credentials, so snapshots could be written to a different store or with a different identity than the one configured. When `s3_queue_url` is set, the dataset fails to register with the parameter error instead. Fix the parameter and restart Spice.

### Store snapshots under `runtime.state`

When the Spicepod sets [`runtime.state`](../../reference/spicepod/runtime#runtimestate), datasets that enable snapshots store them in the `snapshots/` folder of `runtime.state.location`:

```yaml
runtime:
  state:
    location: s3://my-bucket/spice/

datasets:
  - from: postgres:orders
    name: orders
    acceleration:
      enabled: true
      engine: cayenne
      mode: file
      snapshots: enabled
```

This fragment omits the PostgreSQL connection settings that the `orders` dataset needs; see the [PostgreSQL connector `params`](../../components/data-connectors/postgres/index.md#params). With them, this Spicepod publishes the `orders` snapshots under `s3://my-bucket/spice/snapshots/`, next to the other [runtime state folders](../../reference/spicepod/runtime#runtime-state-layout), in the same layout as any other snapshot location.

In v2.4.0-rc.1 and earlier, a dataset with `snapshots: enabled` and no `snapshots.location` created and restored no snapshots, and Spice logged `Snapshots enabled but no location configured` when the Spicepod had a `snapshots` section. With `runtime.state` set, such a dataset now publishes snapshots to `<runtime.state.location>/snapshots/` and bootstraps from them. Set `acceleration.snapshots: disabled` on a dataset that should not.

### Override the snapshot location per dataset

A dataset that needs another snapshot location, other params, or another failure behavior sets them in its own `acceleration` block:

```yaml
runtime:
  state:
    location: s3://my-bucket/spice/
    params:
      s3_region: us-east-1

datasets:
  - from: postgres:events
    name: events
    acceleration:
      enabled: true
      engine: cayenne
      mode: file
      snapshots: enabled
      snapshots_location: s3://archive-bucket/snapshots/
      snapshots_params:
        s3_region: eu-west-1
      snapshots_bootstrap_on_failure_behavior: fallback
```

| Field | Default |
| ----- | ------- |
| `snapshots_location` | The `snapshots/` folder of `runtime.state.location`. |
| `snapshots_params` | The params of the location the dataset uses: none for a `snapshots_location`, and `runtime.state.params` for the `runtime.state` folder. |
| `snapshots_bootstrap_on_failure_behavior` | `warn`. See [Failure behavior](#failure-behavior). |

`snapshots_params`, when set, are the only params the dataset's snapshots use. A dataset that sets `snapshots_location` without `snapshots_params` uses no params, so `runtime.state.params`, such as an `s3_endpoint` or credentials, never apply to a location they were not written for. When the dataset's location needs credentials or a region that the environment does not supply, set them in `snapshots_params`.

These fields require a Spice version newer than v2.4.0-rc.2. Spice v2.4.0-rc.2 and earlier reject a Spicepod that sets them.

### Migrate from the top-level `snapshots` section

The top-level `snapshots` section is deprecated and will be removed in a future release. Spicepods that set it still load, and each of its settings applies to every dataset that does not set the matching `acceleration` field:

| Deprecated setting | Replacement |
| ------------------ | ----------- |
| `snapshots.location` | `runtime.state.location`, whose `snapshots/` folder holds the snapshots, or `acceleration.snapshots_location` on each dataset. |
| `snapshots.params` | `runtime.state.params`, or `acceleration.snapshots_params` on each dataset. |
| `snapshots.bootstrap_on_failure_behavior` | `acceleration.snapshots_bootstrap_on_failure_behavior` on each dataset. |
| `snapshots.enabled` | No replacement. `acceleration.snapshots` defaults to `disabled`, so leave it unset, or set it to `disabled`, on each dataset that should not use snapshots. |

When the section is set, `snapshots.params` apply to `snapshots.location`, and they replace `runtime.state.params` for snapshots stored under `runtime.state`. `snapshots.enabled: false` still turns snapshots off for every dataset.

At startup, a Spicepod with the section logs one warning that shows the configuration that keeps the existing snapshots where they are. For example, when `snapshots.location` is `s3://my-bucket/spice/snapshots/` and `runtime.state` is not set, the warning asks to delete the section and set `runtime.state.location: s3://my-bucket/spice/`. When the section's location is already the `snapshots/` folder of `runtime.state.location`, the warning asks to delete the section. In other cases, it asks to set `acceleration.snapshots_location` to the section's location on each dataset that enables snapshots. The warning names the keys of `snapshots.params` to move, never their values. A cluster executor does not log it, because the scheduler that shares its Spicepod does.

### Conditional writes on the snapshot location

Each location holds one `metadata.json` document that records the snapshots of every dataset publishing there, from every Spice instance. Spice changes this document only with conditional writes. It creates the document only if it does not exist yet (`If-None-Match: *`), and updates it only if it still has the version Spice read (`If-Match` on its `ETag`). Google Cloud Storage expresses both conditions with the object generation (`x-goog-if-generation-match`). When another writer changes the document first, the store refuses the write, and Spice reads the document again and reapplies its change. Concurrent publishers therefore do not overwrite each other's entries.

The location's store must enforce both conditions. Amazon S3, Azure ADLS Gen2, Google Cloud Storage, and a local `file://` directory do. An S3-compatible store must honor `If-None-Match` and `If-Match` on `PUT`; Spice checks this before it publishes, as described below.

Before each Spice instance creates a dataset's first snapshot, it probes the store by creating, updating, and deleting one `.spice-conditional-write-probe-<id>` object under the location, in at most five requests. When the store rejects conditional writes, or accepts a write whose condition does not hold, Spice uploads no snapshot and does not write `metadata.json`. The snapshot fails with an error that names the dataset, the location, and the reason. Spice keeps this result and does not probe the store again, so restart Spice after moving the snapshot location to a store that enforces conditional writes.

When the probe cannot reach a result, for example after a transient error or because the credentials cannot write the probe object, the snapshot is not published and the next attempt probes again. The error asks for permission to create, update, and delete `.spice-conditional-write-probe-*` objects under the location. Every instance that publishes snapshots probes with its own credentials, and each needs permission to create and update these objects. Permission to delete them is needed only for cleanup: a failed delete does not change the probe result and leaves one small probe object behind.

Spice does not fall back to an unconditional overwrite of `metadata.json`. If the store returns no `ETag` or version for the document, the publish fails after its snapshot file is uploaded, and the file is not recorded.

When other writers keep changing `metadata.json`, Spice makes up to 10 attempts to update it, waiting a randomized interval before each retry. The first wait is 12 to 25 ms, and the upper bound doubles with each retry up to 2 seconds. If every attempt loses to another writer, the snapshot file stays uploaded but is not recorded, and the error names the dataset; the dataset's next snapshot tries again. An update that reached the store but whose response was lost is recognized on the next read and recorded once.

Requests that [pin and unpin](#pin-and-unpin-a-snapshot) a dataset (`PUT` and `DELETE` on `/v1/datasets/{name}/acceleration/snapshots/pin`, and `POST` on `/v1/datasets/{name}/acceleration/snapshots/current`) probe the store on every request before they change `metadata.json`. When the store fails the probe, or the probe cannot reach a result, the request returns `500 Internal Server Error` with the reason and `metadata.json` is not changed. Pinning the snapshot the dataset is already pinned to, or unpinning a dataset that is not pinned and whose newest snapshot is current, leaves `metadata.json` unwritten. The probe still runs first, so the request still creates, updates, and tries to delete a probe object.

Restoring a snapshot at startup, and reloading one with [`refresh_mode: snapshot`](./refresh-modes/snapshot) or [`file_format: snapshot`](#serve-a-dataset-from-published-snapshots), only reads `metadata.json` and does not probe the store.

In Spice v2.3.2 and earlier, a `file://` location records only its first publish. Every later publish, from any dataset, uploads its snapshot file and then fails to update `metadata.json` with the error ``Operation `put_opts` with mode `PutMode::Update` not yet implemented by LocalFileSystem``.

### Several instances creating one dataset's snapshots

When more than one Spice instance creates snapshots of the same dataset at the same location, only one of them uploads. The instances race for a lease object, `leases/<dataset>.json` under the location, with the same conditional writes as `metadata.json`. The holder renews the lease each time it is about to create a snapshot. The other instances skip their uploads and log a message such as:

```text
Dataset 'orders' is not creating snapshots while instance 'spice-1' holds its snapshot writer lease; this instance takes over if that lease goes 2m without renewal. See: https://spiceai.org/docs/features/data-acceleration/snapshots
```

A lease lasts twice the dataset's snapshot interval, kept between 30 seconds and 24 hours. The interval is `snapshots_trigger_threshold` with `snapshots_trigger: time_interval` and `refresh_check_interval` with `refresh_complete`, and otherwise 10 minutes. Another instance takes over a lease that has gone unrenewed that long, as measured on its own clock, so clock skew between instances does not expire a live lease. A holder whose snapshot fails releases the lease at once. A holder that loses the lease during an upload does not publish that snapshot over a newer one from the instance that took over.

Each instance is identified by its [instance identity](../../reference/spicepod/runtime#instance-identity): the `SPICE_INSTANCE_ID` environment variable, else `HOSTNAME`, else `COMPUTERNAME`, else the host name. The identity is stable across restarts, so a restarted instance resumes the lease it held. Give each replica a distinct identity: two processes with the same identity both upload, and a process that finds its lease renewed by the other logs an error naming the identity and the snapshot location:

```text
Another running instance uses SPICE_INSTANCE_ID 'spice-1' at state location 's3://my-bucket/snapshots/'. Give each instance its own SPICE_INSTANCE_ID (for example the pod name).
```

### Snapshot location and the Cayenne data tier

Keep the snapshot location on standard object storage: Amazon S3 (`s3://`), Google Cloud Storage (`gs://`), or Azure ADLS Gen2 (`abfss://`, `abfs://`). A local `file://` folder is valid on a single machine. Standard cloud storage is what bucket and object replication, and readers in another region, use.

The snapshot location is independent of Cayenne's S3 Express One Zone data tier. `cayenne_file_path` and the `cayenne_s3_*` parameters (`cayenne_s3_region`, `cayenne_s3_zone_ids`, `cayenne_s3_auth`, and the related keys) store Cayenne Vortex files on an Express One Zone directory bucket. That bucket is single-zone storage for the accelerator's data files. It does not substitute for the snapshot bucket, and it does not provide the replication or multi-region reads a standard snapshot location does. See [S3 Express One Zone storage](../../components/data-accelerators/cayenne#aws-s3-express-one-zone-storage).

The Cayenne [cold tier](../../components/data-accelerators/cayenne#cold-object-store-tier) uses a general-purpose S3 or S3-compatible bucket, set by `cayenne_datalake_location`, not GCS or ADLS. That prefix is the cold data tier, separate from the snapshot location.

### Failure behavior

`acceleration.snapshots_bootstrap_on_failure_behavior` controls what Spice does when it cannot load a dataset's most recent snapshot.

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
  snapshots_location: <uri> # default: the snapshots/ folder of runtime.state.location
  snapshots_params: <params> # default: the params of that location
  snapshots_bootstrap_on_failure_behavior: warn | retry | fallback # default: warn
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
runtime:
  state:
    location: s3://some_bucket/some_folder/
    params:
      s3_region: us-east-1

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

## Pin and unpin a snapshot

When a dataset's newest snapshot holds bad data, pin the dataset to an earlier snapshot. Every Spice instance that uses the dataset then serves the pinned snapshot:

- The instance that publishes the dataset's snapshots, which refreshes the dataset from its source, serves the pinned snapshot from a second local copy, also to queries that other instances delegate to it. It keeps refreshing its live copy and keeps publishing snapshots, so newer snapshots pick up the fix when the source recovers. A new snapshot does not become current while the dataset is pinned.
- A [`refresh_mode: snapshot`](./refresh-modes/snapshot) reader loads the pinned snapshot at its next check, also when it is older than the data it serves.
- An instance that starts loads the pinned snapshot, because the pinned snapshot is current.

When the source has recovered, unpin the dataset, and every instance serves the newest data again.

For example, a bad load goes into snapshot 42. Pin snapshot 41, and every instance serves 41. The writer publishes 43 and 44, which are not served. After you check 44, unpin the dataset.

List the dataset's snapshots, then pin one with the CLI or the HTTP API:

```bash
spice acceleration snapshots taxi_trips
spice acceleration pin taxi_trips 41
```

```bash
curl -X PUT http://localhost:8090/v1/datasets/taxi_trips/acceleration/snapshots/pin \
  -H 'Content-Type: application/json' \
  -d '{"snapshot_id": 41}'
```

```json
{
  "message": "Dataset taxi_trips is pinned to snapshot 41. Every instance serves it once loaded; readers load it at their next check. Newer snapshots are published but not served until you unpin with DELETE /v1/datasets/taxi_trips/acceleration/snapshots/pin."
}
```

While the dataset is pinned, `GET /v1/datasets/{name}/acceleration/snapshots` returns the pinned snapshot in `pinned_snapshot_id`, and `spice acceleration snapshots` prints it:

```console
$ spice acceleration snapshots taxi_trips
Current Snapshot ID: 41
Pinned Snapshot ID: 41 (unpin with `spice acceleration unpin`)
```

Each publish while pinned logs `Snapshot created; not made current, as the dataset is pinned to snapshot 41`. Pinning another snapshot replaces the pin. `POST /v1/datasets/{name}/acceleration/snapshots/current` and `spice acceleration set-snapshot` pin the dataset too.

To serve the newest data again, unpin the dataset. Unpinning deletes no snapshot. The newest snapshot becomes current, and the reply names it, with its publish time and its row count when the snapshot records one:

```console
$ spice acceleration unpin taxi_trips
Dataset taxi_trips is no longer pinned. Serving snapshot 44 (published 2026-10-16 10:42 UTC, 1,204,331 rows).
```

```bash
curl -X DELETE http://localhost:8090/v1/datasets/taxi_trips/acceleration/snapshots/pin
```

Unpinning a dataset that is not pinned changes nothing.

The pin is stored in the dataset's entry in `metadata.json`, as the `pinned-snapshot-id` property, so it applies to every instance that reads the location. Pinning and unpinning change `metadata.json` with the same [conditional writes](#conditional-writes-on-the-snapshot-location) as publishing, so a publish never loses a pin, and any instance that has the dataset's snapshots configured can pin or unpin it. Both requests need the same write access as other runtime changes. They return:

- `404 Not Found` for an unknown dataset or snapshot.
- `409 Conflict` when the snapshot's file is gone from the snapshot location.
- `400 Bad Request` for a dataset that [reads published snapshots](#serve-a-dataset-from-published-snapshots).

### Disk and memory while pinned

Only `mode: file` accelerations publish snapshots, so only they can be pinned. The instance that publishes the snapshots checks for a pin after each refresh, and at least once a minute when the dataset has no `refresh_check_interval` or refreshes from a stream (`refresh_mode: changes`, or `refresh_mode: append` without a `time_column`). While the dataset is pinned, it holds two copies of the dataset: the live one and the pinned one, in the `pinned` directory under the Spice data directory (`.spice/data/pinned/<dataset>/<snapshot id>`). Allow disk for one more copy of the dataset, and memory for that copy's cache. After the dataset is unpinned, the instance serves its live copy again and deletes the pinned copy.

When the instance cannot load the pinned copy, for example because the disk is full or the snapshot's file is gone, it serves its live data and logs an error after each refresh until it can load the copy.

A dataset with `refresh_mode: caching` serves its live data while pinned.

### Retention and missing files while pinned

A pinned snapshot is kept at any age. When its file is deleted while the dataset is pinned, for example by a bucket lifecycle rule, the dataset stays pinned. The instance that creates the snapshots logs a warning at each hourly cleanup that names the snapshot and asks for another snapshot to be pinned or for the dataset to be unpinned. Instances that already hold the pinned data keep serving it, and an instance that starts with `bootstrap_on_failure_behavior: fallback` tries only snapshots older than the pinned one.

When the pinned snapshot is no longer in the dataset's snapshot list, the next publish removes the pin and logs a warning.

### Upgrade every instance before pinning

Spice versions without pinning, including v2.3.2 and earlier, keep the pin and load the pinned snapshot when they start. An older `refresh_mode: snapshot` reader moves to the pinned snapshot only when it restarts, and an older writer keeps serving its live data. An older writer that publishes while the dataset is pinned makes its snapshot current until an instance that supports pinning publishes and makes the pinned snapshot current again. Upgrade every Spice instance that uses a dataset before you pin it.

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

A snapshot dataset needs no `acceleration` block, no `refresh_mode`, no `acceleration.snapshots` setting, and no top-level `snapshots` section. The snapshot location comes from the dataset's own `from` and `s3_*` params, not from `runtime.state`. To read snapshots that a writer [stores under `runtime.state`](#store-snapshots-under-runtimestate), set `from` to that location's `snapshots/` folder, such as `s3://my-bucket/spice/snapshots/`. An optional `acceleration` block can set `refresh_check_interval` (default `1m`) and engine params.

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

Snapshot datasets follow the same [metastore location](../../components/data-accelerators/cayenne/index.md#metastore-location) rule as other Cayenne datasets: every Cayenne dataset, including a snapshot dataset that sets `cayenne_file_path` or `cayenne_metadata_dir`, must resolve to the same metastore directory, or the Spicepod is rejected at startup. Set the same `cayenne_metadata_dir` on every Cayenne dataset.

### Disk use of a Cayenne copy

Each reload extracts the new snapshot into the Cayenne data directory beside the snapshot directories already there. Once the new snapshot is serving, Spice marks the directories it no longer references for deletion and deletes each one after a short grace period, once no query still reads it. A query that started before a reload keeps the directories it reads until it finishes, so long-running queries that span several reloads can keep several replaced copies on disk until they complete. A directory still in use when the background cleanup gives up is deleted on a later reload. When a restart restores the first snapshot, Spice applies the same cleanup to the unreferenced directories an earlier run left behind. Partitioned Cayenne tables, and Cayenne copies whose `cayenne_file_path` is an object-store (`s3://`) path, are not reclaimed this way. The [`cayenne_data_dir_snapshot_dirs`](../../components/data-accelerators/cayenne/deployment.md#storage-footprint-metrics) metric reports the number of snapshot directories on disk.

Earlier releases, including v2.4.0-rc.1, keep every replaced directory, so the data directory grows by one copy of the table per reload and a restart does not reclaim it. After an upgrade, the cleanup that follows the first snapshot restore deletes those leftover directories.

### Configuration constraints

The dataset is read-only. Spice rejects a configuration that contradicts reading snapshots, with an error that names the setting to remove:

- `from` must be an `s3://` location. Other connectors are not supported.
- `params` accepts only `file_format`, `s3_region`, `s3_endpoint`, `s3_auth`, `s3_key`, `s3_secret`, `s3_session_token`, `client_timeout`, and `allow_http`. `s3_auth` must be `iam_role` or `key`.
- `access` must be `read` (the default).
- `embeddings`, `vectors`, and `full_text_search` are not supported. Configure them on the dataset that publishes the snapshots.
- In the `acceleration` block, Spice rejects `enabled: false`, any `refresh_mode` other than `snapshot`, `mode: file_create` or `mode: file_update`, `snapshots: enabled` or `snapshots: create_only`, `refresh_sql`, the `retention_*` settings, `on_zero_results: use_source`, and an `engine` other than the one that created the snapshots.
- Engine path params (`duckdb_file`, `duckdb_data_dir`, `sqlite_file`, `turso_file`, and `cayenne_s3_zone_ids`) are rejected, because Spice chooses where the local copy lives. `cayenne_file_path` and `cayenne_metadata_dir` are accepted when the snapshots were created by Cayenne, and rejected by name when another engine created them.

### HTTP API behavior

`GET /v1/datasets/{name}/acceleration/snapshots` lists the snapshots at the dataset's own location. Requests that pin or unpin the dataset return `400 Bad Request`, because a reader never changes the metadata it reads; [pin and unpin](#pin-and-unpin-a-snapshot) the dataset on the instance that publishes the snapshots. `POST /v1/datasets/{name}/acceleration/refresh` checks for a newer snapshot.

## Best practices

- **Budget storage for a full file on every write.** Each snapshot is a complete copy of the accelerated dataset. See [What each snapshot contains](#what-each-snapshot-contains) and [Snapshot location and the Cayenne data tier](#snapshot-location-and-the-cayenne-data-tier).
- **Treat the snapshot interval as a freshness gap.** A reader that bootstraps from object storage serves the last successful snapshot until its own next refresh. `refresh_complete` is as fresh as the writer's last refresh; `time_interval` can be older still. Size the trigger against the freshness the readers are allowed to serve, and keep a durable volume when that gap is too wide. See [Read/Write Separation](../../deployment/read-write-separation).
- **Pair with ephemeral storage:** Deployments commonly place the acceleration file on fast ephemeral disks (such as NVMe instance storage) while relying on snapshots for persistence across restarts. Local NVMe is the recommended medium for accelerations — see [Storage](../../reference/performance-tuning#storage) for the tiers, the instance-store lifetime, and the capacity figures.
- **Enable compaction for large datasets:** Use `snapshots_compaction: enabled` for DuckDB accelerations to reduce snapshot size and improve bootstrap performance.
- **Tune trigger thresholds for stream datasets:** For high-throughput streaming datasets, balance snapshot frequency against I/O overhead by adjusting `snapshots_trigger_threshold`.
- **Let Spice expire snapshots:** Spice keeps [28 days of snapshots](#snapshot-retention) and deletes older files itself. An expiration rule for current objects on the snapshot location is not needed. When one is required, set its expiration longer than 28 days. Such a rule can still delete the file of a current or newest snapshot older than its expiration. On a bucket with versioning enabled, a Spice delete leaves a noncurrent version, so add a noncurrent-version expiration rule to reclaim that storage. A replication destination keeps deleted files unless the replication carries deletes or the destination has its own lifecycle rule.
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
