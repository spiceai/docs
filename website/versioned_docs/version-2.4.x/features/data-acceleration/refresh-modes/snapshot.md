---
title: 'Snapshot Refresh Mode'
sidebar_label: 'Snapshot'
description: 'Reload acceleration data exclusively from the snapshot store.'
sidebar_position: 5
pagination_prev: null
pagination_next: null
---

The `snapshot` refresh mode creates a read-only acceleration that reloads exclusively from the [snapshot store](../snapshots). The federated source is never queried for refreshes — instead, the runtime polls the snapshot store on a configurable interval and atomically swaps in newer snapshots when available.

Use `snapshot` when:

- A separate writer publishes acceleration snapshots to object storage.
- Read replicas need fast, source-independent startup and refresh.
- The federated source should not be queried by the replica (e.g., edge nodes, security boundaries, or to reduce source load).

To read snapshots published to S3 without naming the original federated source, an engine, or a top-level `snapshots` section, set the dataset's `from` to the snapshot location and `file_format: snapshot`. See [Serve a dataset from published snapshots](../snapshots#serve-a-dataset-from-published-snapshots).

## Configuration

```yaml
datasets:
  - from: postgres:public.my_table
    name: my_table
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      refresh_mode: snapshot
      refresh_check_interval: 30s # Poll interval; defaults to 1m
      snapshots: enabled
      snapshots_location: s3://my-bucket/spice/snapshots/ # The writer's snapshot folder
      params:
        duckdb_file: /nvme/my_table.db
```

This reader sets [`acceleration.snapshots_location`](../snapshots#override-the-snapshot-location-per-dataset) to the folder the writer publishes to, so it needs only read access to the snapshots. It could instead set [`runtime.state`](../../../reference/spicepod/runtime#runtimestate) to the writer's state location, whose `snapshots/` folder holds the snapshots. An instance with `runtime.state` checks the location at startup, which needs write access under `_spice/`, and does not report ready until the [check](../../../reference/spicepod/runtime#startup-check-of-the-state-location) passes, even though snapshot reads do not wait for it.

## Requirements

- `acceleration.snapshots` must be `enabled` or `bootstrap_only`. Snapshot mode is a snapshot *consumer* only, so the two behave identically here: creation is skipped for the mode entirely and the dataset never publishes new snapshots — a separate writer must produce them.
- The acceleration engine must be a snapshot-capable file-based engine: **DuckDB**, **SQLite**, **Cayenne**, or **Turso**.

## Behavior

- On startup, the runtime bootstraps from the most recent snapshot, identical to other snapshot-enabled modes.
- When no snapshot has been published yet, the dataset waits for the first one, whatever `bootstrap_on_failure_behavior` is set to. Spice logs `Snapshot acceleration for dataset 'my_table' is waiting for its first snapshot`, checks the location every `refresh_check_interval`, and restores the first snapshot once a writer publishes it.
- After bootstrap, the runtime polls the snapshot store at `refresh_check_interval` (default: 60s) for newer snapshots.
- Before each poll, the refresh waits until the dataset's `from` source can be reached, although it does not query that source. A dataset whose source is unavailable, for example because its table does not exist or its credentials are rejected, keeps serving the snapshot it bootstrapped from and does not load newer snapshots until the source is reachable. A dataset whose `from` is the snapshot location (`file_format: snapshot`) is not affected. Starting in v2.5, the refresh polls the snapshot store without waiting for the source.
- Each poll reads the snapshot store's metadata conditionally, sending the `ETag` recorded by the previous poll in `If-None-Match`. When the store reports that the metadata is unchanged, the poll ends without downloading it.
- When a newer snapshot is found, its schema is validated against the current acceleration schema before downloading.
- A poll reads the metadata once and uses that read for the snapshot id comparison, the schema validation, and the download, so the snapshot that is downloaded is the one whose schema was validated, even if a writer publishes another snapshot during the poll.
- Until a snapshot is loaded, with [`bootstrap_on_failure_behavior: retry`](../snapshots#failure-behavior), a failed download retries the whole poll. Each attempt reads the metadata again and validates the snapshot before downloading it, so a snapshot published to replace a broken one is picked up.
- A poll that does not load the current snapshot records no `ETag`, so the next poll reads the metadata in full. This applies when `bootstrap_on_failure_behavior: warn` skipped a failed download or `fallback` loaded an older snapshot, and when the store's current snapshot id is older than the loaded one.
- When a poll finds no published snapshot, or finds one older than the loaded snapshot, the dataset stays `Ready` and keeps serving the loaded snapshot. The poll increments [`dataset_acceleration_refresh_errors`](../../observability/index.md) with `reason="snapshot_not_found"` or `reason="snapshot_older_than_loaded"` and logs a warning that begins `Dataset '<name>' cannot refresh from its snapshot location, so it keeps serving snapshot <id>`.
- Once a snapshot is loaded, a poll that cannot load a newer published snapshot does the same, whatever `bootstrap_on_failure_behavior` is set to: the dataset stays `Ready` and keeps serving the loaded snapshot, the poll increments `dataset_acceleration_refresh_errors` with `reason="snapshot_download_failed"` and logs the same warning, and the next poll tries again. A snapshot file that has not yet reached the location, because `metadata.json` arrived first, is checked every 10 seconds for up to 90 seconds before the poll reports it. A file that fails verification is reported at once.
- The accelerator file is swapped atomically — queries continue to be served from the previous snapshot until the swap completes.
- `INSERT`, `UPDATE`, `DELETE`, and `TRUNCATE` statements are all rejected with an error since the acceleration is driven exclusively from snapshots.

:::tip
Use `refresh_mode: snapshot` for read-only replicas that should not access the federated source — for example, edge nodes that receive snapshots from a centralized writer.
:::

## Reload on S3 event notifications

A reader that only polls loads a new snapshot up to one `refresh_check_interval` after a writer publishes it. When the snapshot location is on Amazon S3, set `s3_queue_url` in the location's params (`runtime.state.params`, or a dataset's [`snapshots_params`](../snapshots#override-the-snapshot-location-per-dataset)) to an Amazon SQS queue that receives the location's [S3 event notifications](https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html), and `refresh_mode: snapshot` datasets reload as soon as a new snapshot is published:

```yaml
datasets:
  - from: postgres:public.my_table
    name: my_table
    acceleration:
      enabled: true
      engine: cayenne
      mode: file
      refresh_mode: snapshot
      refresh_check_interval: 10m # Fallback check for missed notifications
      snapshots: bootstrap_only
      snapshots_location: s3://my-bucket/spice/snapshots/
      snapshots_params:
        s3_queue_url: https://sqs.us-east-1.amazonaws.com/123456789012/spice-reader-1
```

A writer makes a snapshot current by rewriting the location's `metadata.json`, so an `ObjectCreated` notification for that object triggers the reload. Spice reads `metadata.json` once for each batch of such notifications it receives and reloads only the datasets whose current snapshot changed, with the same snapshot id, schema, and checksum checks as a poll. Notifications for snapshot files and for removed objects are deleted from the queue without a reload. A reader that is still waiting for its first snapshot restores it when the notification arrives.

Set up the queue as follows:

- **One queue per reader process.** SQS delivers each message to one receiver, so readers that share a queue each see only some notifications. To serve several readers, publish the bucket's notifications to an Amazon SNS topic and subscribe one queue per reader process. All `refresh_mode: snapshot` datasets in one process share that process's queue. Snapshot locations in one process that name the same queue share one consumer, which reads the queue with the credentials of the first location. A location that names the queue with other credentials logs a warning that names both locations.
- **Only the notifications of the locations on the queue.** Filter the bucket notification by the prefix of each snapshot location that names the queue. A notification for an object outside every one of those locations is logged as an error and left on the queue, which delivers it again after each visibility timeout until it expires. When the location is the `snapshots/` folder of `runtime.state.location`, the notification can cover the whole `runtime.state` prefix: notifications for the other [runtime state folders](../../../reference/spicepod/runtime#runtime-state-layout), such as the scheduler's `cluster/` folder, are deleted from the queue without a log.
- **Permissions.** Spice reads the queue with the snapshot location's credentials: `s3_key` and `s3_secret` when both are set, otherwise the default AWS credential chain. The region comes from the queue URL. Grant `sqs:ReceiveMessage` and `sqs:DeleteMessage` on the queue.

Datasets keep checking the location every `refresh_check_interval`, which covers notifications that never arrive. When Spice cannot reach SQS, it logs a warning when the outage starts, an error if it lasts five minutes, and an info message when it recovers. Datasets reload on `refresh_check_interval` in the meantime.

A queue URL that is empty, is an ARN, or is not an SQS queue URL, and a snapshot location that is not `s3://`, fail the dataset at load with an error that names `s3_queue_url`. When `s3_queue_url` is set but no dataset uses `refresh_mode: snapshot`, Spice logs a warning that names the setting that holds the queue, such as `runtime.state.params.s3_queue_url`, and does not read the queue. A cluster scheduler, which loads no accelerations, does not log this warning. A dataset that reads snapshots with [`file_format: snapshot`](../snapshots#serve-a-dataset-from-published-snapshots) does not accept `s3_queue_url` and checks for new snapshots every `refresh_check_interval`.

## Related Topics

- [Acceleration Snapshots](../snapshots)
- [Refresh Interval](../data-refresh#refresh-interval)
