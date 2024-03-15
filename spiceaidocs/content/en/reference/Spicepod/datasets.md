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
  - from: spice.ai/eth/beacon/eigenlayer
    name: strategy_manager_deposits
    params:
      app: goerli-app
    acceleration:
      enabled: true
      mode: inmemory # / file
      engine: arrow # / duckdb
      refresh_interval: 1h
      refresh_mode: full / append # update / incremental
      retention: 30m
```

`spicepod.yaml`
```yaml
datasets:
  - from: databricks.com/spiceai/datasets
    name: uniswap_eth_usd
    params:
      environment: prod
    acceleration:
      enabled: true
      mode: inmemory # / file
      engine: arrow # / duckdb
      refresh_interval: 1h
      refresh_mode: full / append # update / incremental
      retention: 30m
```

`spicepod.yaml`
```yaml
datasets:
  - from: local/Users/phillip/data/test.parquet
    name: test
    acceleration:
      enabled: true
      mode: inmemory # / file
      engine: arrow # / duckdb
      refresh_interval: 1h
      refresh_mode: full / append # update / incremental
      retention: 30m
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

Enable or disable acceleration, defaults to `true`.

## `acceleration.engine`

The acceleration engine to use, defaults to `arrow`. The following engines are supported:

  - `arrow` - Cache data as in-memory Apache Arrow Records.
  - `duckdb` - Cache data in a DuckDB.
  - `postgres` - Cache data in a PostgreSQL database.

## `acceleration.mode`

Optional. The mode of acceleration. The following values are supported:

  - `memory` - Cache data in memory.
  - `file` - Store acceleration data in a file.

`mode` is currently only supported for the `duckdb` engine.

## `acceleration.refresh_mode`

Optional. How to refresh the dataset. The following values are supported:

  - `full` - Refresh the entire dataset.
  - `append` - Append new data to the dataset.

## `acceleration.refresh_interval`

Optional. How often data should be refreshed. Only supported for `full` datasets. For `append` datasets, the refresh interval not used.

i.e. `1h` for 1 hour, `1m` for 1 minute, `1s` for 1 second, etc.

## `acceleration.retention`

Optional. Only supported for `append` datasets. Specifies how long to retain data updates from the data source before they are deleted.

If not specified, the default retention is to keep all data.

## `acceleration.params`

Optional. Parameters to pass to the acceleration engine. The parameters are specific to the acceleration engine used.

## `acceleration.engine_secret`

Optional. The secret to use to connect to the acceleration engine. Use `spice login` to create a new secret.
