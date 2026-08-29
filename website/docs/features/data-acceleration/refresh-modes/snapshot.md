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
- When a newer snapshot is found, its schema is validated against the current acceleration schema before downloading.
- The accelerator file is swapped atomically — queries continue to be served from the previous snapshot until the swap completes.
- `INSERT INTO` statements are rejected with an error since the acceleration is driven exclusively from snapshots.

:::tip
Use `refresh_mode: snapshot` for read-only replicas that should not access the federated source — for example, edge nodes that receive snapshots from a centralized writer.
:::

## Related Topics

- [Acceleration Snapshots](../snapshots)
- [Refresh Interval](../data-refresh#refresh-interval)
