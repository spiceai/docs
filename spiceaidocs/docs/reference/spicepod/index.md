---
title: 'Manifest syntax for Spicepods'
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
      refresh_interval: 1h
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
