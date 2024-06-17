---
title: 'Manifest syntax for Spicepods'
sidebar_position: 1
sidebar_label: 'Spicepod specification'
description: 'Detailed documentation on the Spicepod manifest syntax (spicepod.yaml)'
---

## About YAML syntax for Spicepod manifests (spicepod.yaml)

Spicepod manifests use YAML syntax and must be named `spicepod.yaml` or `spicepod.yml`. If you're new to YAML and want to learn more, see "[Learn YAML in Y minutes](https://learnxinyminutes.com/docs/yaml/)."

Spicepod manifest files are stored in the root directory of your application code.

## `version`

The version of the Spicepod manifest. The current version is `v1beta1`.

## `kind`

The kind of Spicepod manifest. The kind is `Spicepod`.

## `name`

The name of the Spicepod.

## `secrets`

The secrets section in the Spicepod manifest is optional and is used to configure how secrets are stored and accessed by the Spicepod. [Learn more](/secret-stores).

### `secrets.store`

The type of secret store for reading secrets.

- `file` (default)
- `env`
- `kubernetes`
- `keyring`

Example

```yaml
secrets:
  store: env
```

## `runtime`

### `num_of_parallel_loading_at_start_up`

This configuration setting determines the maximum number of datasets that can be loaded in parallel during startup. This parallel loading capability accelerates Spice's startup process when multiple datasets are configured.

### `results_cache`

The results cache section specifies runtime cache configuration. [Learn more](/features/caching).

```yaml
runtime:
  results_cache:
    enabled: true
    cache_max_size: 128MiB
    eviction_policy: lru 
    item_ttl: 1s
```

- `enabled` - optional, `true` by default
- `cache_max_size` - optional, maximum cache size. Default is `128MiB`
- `eviction_policy` - optional, cache replacement policy when the cached data reaches the `cache_max_size`. Default is `lru` - [least-recently-used (LRU)](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU)
- `item_ttl` - optional, cache entry expiration time, 1 second by default.

## `metadata`

An optional `map` of metadata.

**Example**

```yaml
metadata:
  epoch_time: 1605312000
  period: 72h
  interval: 1m
  granularity: 10s
  episodes: 10
```

## `datasets`

A Spicepod can contain one or more [datasets](./datasets.md) referenced by relative path.

**Example**

A datasets referenced by relative path.

```yaml
datasets:
  - ref: datasets/uniswap_v2_eth_usdc
```

A dataset defined inline.

```yaml
datasets:
  - from: spice.ai/eth.recent_blocks
    name: eth_blocks
    acceleration:
      enabled: true
      refresh_mode: full
      refresh_check_interval: 1h
```

## `models`

A Spicepod can contain one or more [models](./models.md) referenced by relative path.

**Example**

A model referenced by path.

```yaml
models:
  - from: models/drive_stats
```

A model defined inline.

```yaml
models:
  - from: spiceai:spice.ai/lukekim/smart/models/drive_stats:latest
    name: drive_stats
    datasets:
      - drive_stats_inferencing
```

## `dependencies`

A list of dependent Spicepods.

```yaml
dependencies:
  - lukekim/demo
  - spicehq/nfts
```
