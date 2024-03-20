---
type: docs
title: 'Manifest syntax for Spicepods'
linkTitle: 'Spicepod specification'
weight: 60
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

The secrets section in the Spicepod manifest is optional and is used to configure how secrets are stored and accessed by the Spicepod. [Learn more]({{<ref "secrets">}}).

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

A Spicepod can contain one or more [datasets]({{<ref "reference/spicepod/datasets">}}) referenced by relative path.

**Example**

A datasets referenced by relative path.

```yaml
datasets:
  - from: datasets/uniswap_v2_eth_usdc
```

A datasets with a dependency on another dataset.

```yaml
datasets:
  - from: datasets/uniswap_v2_eth_usdc
    dependsOn: datasets/uniswap_eth_usdc
```

A dataset defined inline.

```yaml
datasets:
  - name: spiceai.uniswap_v2_eth_usdc
    type: overwrite
    source: spice.ai
    acceleration:
      enabled: true
      refresh: 1h
```

## `models`

A Spicepod can contain one or more [models](https://docs.spice.ai/reference/specifications/models-yaml-specification) referenced by relative path.

**Example**

A model referenced by path.

```yaml
models:
  - from: models/gas_fees
```

## `dependencies`

A list of dependent Spicepods.

```yaml
dependencies:
  - lukekim/demo
  - spicehq/nfts
```
