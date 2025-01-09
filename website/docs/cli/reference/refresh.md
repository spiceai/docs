---
title: "refresh"
sidebar_label: "refresh"
pagination_prev: null
pagination_next: null
---

Refreshes an accelerated dataset loaded by the Spice runtime

### Usage

```shell
spice refresh [dataset] [flags]
```

`dataset` - an accelerated dataset name

#### Flags

- `--tls-root-certificate-file`   The path to the root certificate file used to verify the Spice.ai runtime server certificate
- `--refresh-sql`  SQL used to refresh the dataset, see [Refresh SQL docs](/components/data-accelerators/data-refresh.md#refresh-sql).
- `--refresh-mode`  Refresh mode to use, see [Refresh Modes docs](/components/data-accelerators/data-refresh.md#refresh-modes).
- `-h`, `--help`   Print this help message

### Examples

```shell
>>> spice refresh taxi_trips --refresh-sql "SELECT * FROM taxi_trips WHERE trip_amount > 10.0"
```

Refreshing dataset taxi_trips ...
Dataset refresh triggered for taxi_trips.

### Additional Example

```shell
>>> spice refresh taxi_trips --refresh-mode append
```

Refreshing dataset taxi_trips with append mode...
Dataset refresh triggered for taxi_trips.
```
