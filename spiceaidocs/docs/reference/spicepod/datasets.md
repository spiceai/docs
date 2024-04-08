---
title: 'Datasets'
sidebar_label: 'Datasets'
description: 'Datasets YAML reference'
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
  - from: databricks:spiceai.datasets.specific_table
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

Relative path example:

`spicepod.yaml`

```yaml
datasets:
  - from: datasets/eth_recent_transactions
```

`datasets/eth_recent_transactions/dataset.yaml`

```yaml
from: spiceai:spice.ai/eth.recent_transactions
name: eth_recent_transactions
type: overwrite
acceleration:
  enabled: true
  refresh: 1h
```

## `from`

The `from` field is a string that represents the Uniform Resource Identifier (URI) for the dataset. This URI is composed of two parts: a prefix indicating the source of the dataset, and the actual link to the dataset.

The syntax for the `from` field is as follows:

```yaml
from: <source>:<link>
```

Where:

- `<source>`: The source of the dataset

  Currently supported sources:

  - `spiceai`
  - `dremio`
  - `databricks`
  - `s3`
  - `postgres`
  - `mysql`

  If the source is not specified, it defaults to `spiceai`.

- `<link>`: The actual link to the dataset.

## `name`

The name of the dataset. This is used to reference the dataset in the pod manifest, as well as in external data sources.

## `type`

The type of dataset. The following types are supported:

- `overwrite` - Overwrites the dataset with the contents of the dataset source.
- `append` - Appends new data from dataset source to the dataset.

## `acceleration`

Optional. Accelerate queries to the dataset by caching data locally.

## `acceleration.enabled`

Enable or disable acceleration, defaults to `true`.

## `acceleration.engine`

The acceleration engine to use, defaults to `arrow`. The following engines are supported:

- `arrow` - Accelerated in-memory backed by Apache Arrow DataTables.
- `duckdb` - Accelerated by an embedded DuckDB database.
- `postgres` - Accelerated by an embedded DuckDB database.

## `acceleration.mode`

Optional. The mode of acceleration. The following values are supported:

- `memory` - Store acceleration data in-memory.
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

Optional. The secret store key to use the acceleration engine connection credential. For supported data connectors, use `spice login` to store the secret.
