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
snapshots:
  enabled: true
  location: s3://my-bucket/snapshots/
  params:
    s3_auth: iam_role

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
      params:
        duckdb_file: /nvme/my_table.db
```

## Requirements

- `acceleration.snapshots` must be `enabled` or `bootstrap_only`. Snapshot mode is a snapshot *consumer* only, so the two behave identically here: creation is skipped for the mode entirely and the dataset never publishes new snapshots — a separate writer must produce them.
- The acceleration engine must be a snapshot-capable file-based engine: **DuckDB**, **SQLite**, **Cayenne**, or **Turso**.

## Behavior

- On startup, the runtime bootstraps from the most recent snapshot, identical to other snapshot-enabled modes.
- After bootstrap, the runtime polls the snapshot store at `refresh_check_interval` (default: 60s) for newer snapshots.
- Each poll reads the snapshot store's metadata conditionally, sending the `ETag` recorded by the previous poll in `If-None-Match`. When the store reports that the metadata is unchanged, the poll ends without downloading it.
- When a newer snapshot is found, its schema is validated against the current acceleration schema before downloading.
- A poll reads the metadata once and uses that read for the snapshot id comparison, the schema validation, and the download, so the snapshot that is downloaded is the one whose schema was validated, even if a writer publishes another snapshot during the poll.
- With [`bootstrap_on_failure_behavior: retry`](../snapshots#failure-behavior), a failed download retries the whole poll. Each attempt reads the metadata again and validates the snapshot before downloading it, so a snapshot published to replace a broken one is picked up.
- A poll that does not load the current snapshot records no `ETag`, so the next poll reads the metadata in full. This applies when `bootstrap_on_failure_behavior: warn` skipped a failed download or `fallback` loaded an older snapshot, and when the store's current snapshot id is older than the loaded one, in which case every poll logs the `snapshot metadata current id is older than the locally loaded snapshot` warning.
- The accelerator file is swapped atomically — queries continue to be served from the previous snapshot until the swap completes.
- `INSERT`, `UPDATE`, `DELETE`, and `TRUNCATE` statements are all rejected with an error since the acceleration is driven exclusively from snapshots.

:::tip
Use `refresh_mode: snapshot` for read-only replicas that should not access the federated source — for example, edge nodes that receive snapshots from a centralized writer.
:::

## Related Topics

- [Acceleration Snapshots](../snapshots)
- [Refresh Interval](../data-refresh#refresh-interval)
