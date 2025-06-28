---
title: 'Spice.ai Data Connector'
sidebar_label: 'Spice.ai Data Connector'
description: 'Spice.ai Data Connector Documentation'
pagination_next: null
---

The [Spice.ai](https://spice.ai/) Data Connector enables federated SQL query across datasets in the [Spice.ai Cloud Platform](https://docs.spice.ai/building-blocks/datasets). Access to these datasets requires a free [Spice.ai account](https://spice.ai/login).

## Configuration

### Secrets

Secrets will be written to a `.env` file by using the `spice login` command and logging in with an active Spice AI account. Learn more about the [Env Secret Store](/docs/components/secret-stores/env).

- `api_key`: A Spice.ai API key.
- `token`: An active personal access token that is configured when logging in to spice via `spice login`.

### Parameters

#### `from`

The Spice.ai Cloud Platform dataset URI. To query a dataset in a public Spice.ai App, use the format `spice.ai/<org>/<app>/datasets/<dataset_name>`.

#### `name`

The dataset name. This will be used as the table name within Spice. The dataset name cannot be a [reserved keyword](/docs/reference/spicepod/keywords.md).

### `params`

The Spice.ai Cloud Platform data connector can be configured by providing the following `params`. Use the [secret replacement syntax](../secret-stores/index.md) to load the secret from a secret store, e.g. `${secrets:SPICEAI_API_KEY}`.

| Parameter Name    | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `spiceai_api_key` | The Spice.ai Cloud Platform API key to connect with. |

## Example

```yaml
- from: spice.ai/spiceai/quickstart/datasets/taxi_trips
  name: taxi_trips
```

```yaml
- from: spice.ai/spiceai/tpch/datasets/customer
  name: tpch.customer
```

## Full Configuration Example

```yaml
- from: spice.ai/spiceai/tpch/datasets/customer
  name: tpch.customer
  params:
    spiceai_api_key: ${secrets:spiceai_api_key}
  acceleration:
    enabled: true
```

## Cookbook

- A cookbook recipe to configure Spice.ai Cloud Platform as a data connector in Spice. [Spice.ai Cloud Platform Data Connector](https://github.com/spiceai/cookbook/tree/trunk/spiceai#readme)
