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

A Spicepod can contain one or more [datasets](https://docs.spice.ai/reference/specifications/dataset-and-view-yaml-specification), defined inline or referenced by relative path.

**Example**

A datasets defined inline.

```yaml
datasets:
  - name: uniswap_v2_eth_usdc
    type: append
    firecache:
      enabled: true
```

A datasets referenced by path.

```yaml
datasets:
  - from: datasets/uniswap_v2_eth_usdc
```

## `functions`

A Spicepod can contain one or more [functions](https://docs.spice.ai/reference/specifications/spice-functions-yaml-specification), defined inline or referenced by relative path.

**Example**

A function defined inline.

```yaml
functions:
  - name: nft_mint_counter
    output_dataset: nft_mint_counter
    triggers:
      - path: eth
    runtime: python3.11
    handler: spice_function.process
```

A function referenced by path.

```yaml
functions:
  - from: functions/nft_mint_counter
```

## `models`

A Spicepod can contain one or more [models](https://docs.spice.ai/reference/specifications/models-yaml-specification), defined inline or referenced by relative path.

**Example**

A model defined inline.

```yaml
models:
  - name: v0.1
    family: gas_fees
    description: A Ethereum gas fee forecasting model.
    type: gasfees_v1
    handler: gas_fees.py
```

A model referenced by path.

```yaml
functions:
  - from: models/gas_fees
```
