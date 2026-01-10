---
description: 'Spice.ai Data Connector Documentation'
pagination_next: null
---

# Spice.ai Data Connector

The [Spice.ai](https://spice.ai/) Data Connector enables federated SQL query across datasets in the [Spice.ai Cloud Platform](https://docs.spice.ai/building-blocks/datasets). Access to these datasets requires a free [Spice.ai account](https://spice.ai/login).

## Configuration

### Parameters

#### `from`

The Spice.ai Cloud Platform dataset URI. To query a dataset in a public Spice.ai App, use the format `spice.ai/<org>/<app>/datasets/<dataset_name>`.

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
