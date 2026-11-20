---
title: 'acceleration'
sidebar_label: 'acceleration'
pagination_prev: null
pagination_next: null
---

Lists the [acceleration snapshots](../../features/data-acceleration/snapshots) of a dataset loaded by the Spice runtime, shows one snapshot, and sets the current snapshot to roll a dataset back.

:::note[Enterprise edition]
Acceleration Snapshots are available in the Spice [Enterprise edition](https://docs.spice.ai/docs/enterprise/getting-started/distributions).
:::

### Usage

```shell
spice acceleration snapshots <dataset> [flags]
spice acceleration snapshot <dataset> <snapshot_id> [flags]
spice acceleration set-snapshot <dataset> <snapshot_id> [flags]
```

#### Commands

- `snapshots` List the snapshots of a dataset, most recent first. Calls `GET /v1/datasets/{name}/acceleration/snapshots`.
- `snapshot` Show one snapshot: its timestamp, location, engine, size, row count, checksum, and whether it is the current snapshot. Calls `GET /v1/datasets/{name}/acceleration/snapshots/{snapshot_id}`.
- `set-snapshot` Make a snapshot the dataset's current snapshot in the snapshot metadata, for rollback. Calls `POST /v1/datasets/{name}/acceleration/snapshots/current`. It does not change the data the dataset serves: the runtime answers `Current snapshot for dataset <name> set to <id>. Restart the runtime to bootstrap from this snapshot.` A restart bootstraps from a snapshot only when the dataset's local acceleration file is missing, as [How it works](../../features/data-acceleration/snapshots#how-it-works) describes, so a restart that finds the existing file keeps serving it. An instance that reads the snapshots with `refresh_mode: snapshot` does not load an older snapshot by polling. Run `set-snapshot` against the instance that publishes the dataset's snapshots: an instance that only reads them answers `400 Bad Request`, as [HTTP API behavior](../../features/data-acceleration/snapshots#http-api-behavior) describes.

#### Flags

- `--limit <n>` For `snapshots`: the maximum number of snapshots to list. Default: `10`.
- `-o`, `--output <format>` Output format: `table` (default) or `json`.
- `-h`, `--help` Print this help message.

The commands call the runtime's HTTP endpoint (`--http-endpoint`, default `http://127.0.0.1:8090`). `spice acceleration` does not support `--cloud`.

### Examples

```shell
# List the 10 most recent snapshots of taxi_trips
spice acceleration snapshots taxi_trips

# Show snapshot 3
spice acceleration snapshot taxi_trips 3

# Record snapshot 2 as the current snapshot for the next bootstrap
spice acceleration set-snapshot taxi_trips 2
```

A snapshot that the 28-day [snapshot retention](../../features/data-acceleration/snapshots#snapshot-retention) dropped is no longer listed, and `set-snapshot` cannot make it current.
