---
title: 'YAML syntax for Spicepod manifests'
sidebar_position: 1
sidebar_label: 'Spicepod specification'
description: 'Detailed documentation on the Spicepod manifest syntax (spicepod.yaml)'
tags:
  - reference
  - spicepod
  - yaml
  - manifest
---

Spicepod manifests use YAML syntax. They are stored in the root directory of the application and must be named `spicepod.yaml` or `spicepod.yml`.

:::info[Tip]

If you are new to YAML and want to learn more, see "[Learn YAML in Y minutes](https://learnxinyminutes.com/docs/yaml/)."

:::

## `version`

The version of the Spicepod manifest. The current version is `v1`.

## `kind`

The kind of Spicepod manifest. The kind is `Spicepod`.

## `name`

The name of the Spicepod.

## `secrets`

The secrets section in the Spicepod manifest is optional and is used to configure how secrets are stored and accessed by the Spicepod. For more information, see [Secret Stores](../../components/secret-stores).

### `secrets.from`

The `from` field is a string that represents the Uniform Resource Identifier (URI) for the secret store. This URI is composed of two parts: a prefix indicating the Secret Store to use, and an optional selector that specifies the secret to retrieve.

The syntax for the `from` field is as follows:

```yaml
from: <secret_store>:<selector>
```

Where:

- `<secret_store>`: The Secret Store to use

  Currently supported secret stores:
  - [`env`](../../components/secret-stores/env/index.md)
  - [`kubernetes`](../../components/secret-stores/kubernetes/index.md)
  - [`keyring`](../../components/secret-stores/keyring/index.md)
  - [`aws-secrets-manager`](../../components/secret-stores/aws-secrets-manager/index.md)

  If no secret stores are explicitly specified, it defaults to `env`.

- `<selector>`: The secret within the secret store to load.

The type of secret store for reading secrets.

Example

```yaml
secrets:
  - from: env
    name: env
```

### `secrets.name`

The name of the secret store. This is used to reference the store in the secret replacement syntax, `${<secret_store_name>:<key_name>}`.

## `runtime`

The `runtime` section specifies configuration settings for the Spice runtime. For detailed documentation, see the [Runtime YAML reference](./runtime.md).

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
  - from: spice.ai/spiceai/quickstart/datasets/taxi_trips
    name: taxi_trips
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
  - from: spiceai/lukekim/smart/models/drive_stats:latest
    name: drive_stats
    datasets:
      - drive_stats_inferencing
```

## `embeddings`

A Spicepod can contain one or more [embeddings](./embeddings.md) referenced by relative path.

**Example**

An embeddings model referenced by path.

```yaml
embeddings:
  - from: embeddings/openai_text_embedding_3
```

An embedding defined inline.

```yaml
embeddings:
  - name: hf_baai_bge
    from: huggingface:huggingface.co/BAAI/bge-small-en-v1.5
```

## `evals`

A Spicepod can contain one or more [evaluations](./evals.md) referenced by relative path.

**Example**

```yaml
evals:
  - name: australia
    description: Make sure the model understands Aussies, and importantly Cricket.
    dataset: cricket_logic
    scorers:
      - Match
```

## `dependencies`

A list of dependent Spicepods.

```yaml
dependencies:
  - lukekim/demo
  - spicehq/nfts
```

## `views` {#views}

A Spicepod can contain one or more views which are virtual tables defined by SQL queries.

**Example**

```yaml
views:
  - name: rankings
    sql: |
      WITH a AS (
        SELECT products.id, SUM(count) AS count
        FROM orders
        INNER JOIN products ON orders.product_id = products.id
        GROUP BY products.id
      )
      SELECT name, count
      FROM products
      LEFT JOIN a ON products.id = a.id
      ORDER BY count DESC
      LIMIT 5
```

## `workers`

A Spicepod can contain one or more [workers](./workers.md) defining configurable units of compute.

**Example**

```yaml
workers:
  - name: round-robin
    type: load_balance
    description: |
      Distributes requests between 'llama3_2' and 'gpt4_1' models in a round-robin fashion.
    load_balance:
      routing:
        - from: llama3_2
        - from: gpt4_1
  - name: fallback
    type: load_balance
    description: |
      Attempts 'gpt4_1' first, then 'llama3_2', then 'anth_haiku' if previous models fail.
    load_balance:
      routing:
        - from: llama3_2
          order: 2
        - from: gpt4_1
          order: 1
        - from: anth_haiku
          order: 3
  - name: weighted
    type: load_balance
    description: |
      Routes 80% of traffic to 'llama3_2'.
    load_balance:
      routing:
        - from: llama3_2
          weight: 4
        - from: gpt4_1
          weight: 1
```

For a complete specification of worker configuration, see the [Workers Reference](../../reference/spicepod/workers.md).
