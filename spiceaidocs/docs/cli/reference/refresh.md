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
- `-h`, `--help`   Print this help message

### Examples

```shell 
>>> spice refresh taxi_trips

Refreshing dataset taxi_trips ...
Dataset refresh triggered for taxi_trips.
```
