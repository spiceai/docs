---
title: "acceleration"
sidebar_label: "acceleration"
pagination_prev: null
pagination_next: null
---

Manages the [snapshots](../../features/data-acceleration/snapshots) of an accelerated dataset loaded by the Spice runtime: lists them, shows one, and pins and unpins the dataset.

### Usage

```shell
spice acceleration snapshots <dataset> [--limit <n>] [flags]
spice acceleration snapshot <dataset> <snapshot_id> [flags]
spice acceleration pin <dataset> <snapshot_id> [flags]
spice acceleration unpin <dataset> [flags]
spice acceleration set-snapshot <dataset> <snapshot_id> [flags]
```

`dataset` - an accelerated dataset name

#### Commands

- `snapshots`  Lists the dataset's most recent snapshots, by ID, with the current snapshot and the pinned snapshot.
- `snapshot`  Shows the details of one snapshot.
- `pin`  Pins the dataset to a snapshot. Every Spice instance that uses the dataset serves the pinned snapshot, and newer snapshots are published but not served until the dataset is unpinned. See [Pin and unpin a snapshot](../../features/data-acceleration/snapshots#pin-and-unpin-a-snapshot).
- `unpin`  Unpins the dataset. Every instance serves the newest snapshot again.
- `set-snapshot`  Pins the dataset to a snapshot, as `pin` does.

#### Flags

- `--limit <n>`  `snapshots` only: the number of most recent snapshots to list. Default: `10`.
- `-o`, `--output <format>` Output format: `table` (default) or `json`.
- `-h`, `--help`   Print this help message

### Examples

```shell
>>> spice acceleration pin orders 1
```

Dataset orders is pinned to snapshot 1. Every instance serves it once loaded; readers load it at their next check. Newer snapshots are published but not served until you unpin with DELETE /v1/datasets/orders/acceleration/snapshots/pin.

```shell
>>> spice acceleration snapshots orders
```

```console
Dataset: orders
Location: s3://my-bucket/spice/snapshots/
Engine: duckdb
Current Snapshot ID: 1
Pinned Snapshot ID: 1 (unpin with `spice acceleration unpin`)
Last Updated: 2026-10-17T01:28:55Z

 ID  TIMESTAMP             SIZE    ROWS  CHECKSUM             CURRENT  STATUS
 0   2026-10-17T01:28:36Z  1.0 MB  -     4471adf0da47ecec...           verified
 1   2026-10-17T01:28:38Z  1.5 MB  -     487d6447e287f011...  ✓        verified
 2   2026-10-17T01:28:41Z  1.0 MB  -     66c1bca171a5ab7a...           verified
 3   2026-10-17T01:28:43Z  1.5 MB  -     004cee823eb17cf2...           verified
 4   2026-10-17T01:28:45Z  1.0 MB  -     80fe0b7c3e1dad5b...           verified
 5   2026-10-17T01:28:48Z  1.5 MB  -     2240a344ec354a5d...           verified
 6   2026-10-17T01:28:50Z  1.0 MB  -     c5680b8a39378bc5...           verified
 7   2026-10-17T01:28:52Z  1.5 MB  -     f7fe0f06dbbe1bb5...           verified
 8   2026-10-17T01:28:55Z  1.0 MB  -     c883b949efd6c897...           verified
```

```shell
>>> spice acceleration unpin orders
```

Dataset orders is no longer pinned. Serving snapshot 8 (published 2026-10-17 01:28 UTC).
