---
type: docs
title: "Datasets"
linkTitle: "Datasets"
description: 'Datasets YAML reference'
weight: 80
---

A Spicepod can contain one or more datasets referenced by relative path, or defined inline.

# `datasets`

Inline example:

`spicepod.yaml`
```yaml
datasets:
  - name: spiceai.uniswap_v2_eth_usdc
    type: overwrite
    source: spice.ai
    auth: spice.ai
    acceleration:
      enabled: true
      refresh: 1h
```

Relative path example:

`spicepod.yaml`
```yaml
datasets:
  - from: datasets/uniswap_v2_eth_usdc
```

`datasets/uniswap_v2_eth_usdc/dataset.yaml`
```yaml
name: spiceai.uniswap_v2_eth_usdc
type: overwrite
source: spice.ai
auth: spice.ai
acceleration:
  enabled: true
  refresh: 1h
```

## `name`

The name of the dataset. This is used to reference the dataset in the pod manifest, as well as in external data sources.

## `type`

The type of dataset. The following types are supported:

- `overwrite` - Overwrites the dataset with the contents of the dataset source.
- `append` - Appends new data from dataset source to the dataset.

## `source`

The source of the dataset. The following sources are supported:

- `spice.ai`
- `dremio` (coming soon)
- `databricks` (coming soon)

## `auth`

Optional. The authentication profile to use to connect to the dataset source. Use `spice login` to create a new authentication profile.

If not specified, the default profile for the data source is used.

## `acceleration`

Optional. Accelerate queries to the dataset by caching data locally.

## `acceleration.enabled`

Optional. Enable or disable acceleration.

## `acceleration.refresh`

Optional. The interval to refresh the data for the dataset if the dataset type is overwrite. Specified as a [duration literal]({{<ref "reference/duration">}}).

For `append` datasets, the refresh interval not used.

i.e. `1h` for 1 hour, `1m` for 1 minute, `1s` for 1 second, etc.

## `acceleration.retention`

Optional. Only supported for `append` datasets. Specifies how long to retain data updates from the data source before they are deleted. Specified as a [duration literal]({{<ref "reference/duration">}}).

If not specified, the default retention is to keep all data.