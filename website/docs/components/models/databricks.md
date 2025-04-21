---
title: 'Databricks AI Models'
description: 'Instructions for using Databricks Mosaic AI Models'
sidebar_label: 'Databricks'
sidebar_position: 8
---

To use a language model hosted on Databricks Mosaic AI Model Serving, specify the model endpoint name in the `from` field with appropriate parameters.

For more details on Databricks models [see documentation](https://docs.databricks.com/aws/en/machine-learning/model-serving/).

| Param                 | Description                                                                       | Default    |
| --------------------- | --------------------------------------------------------------------------------- | ---------- |
| `databricks_endpoint` | The Databricks workspace endpoint, e.g. `dbc-a12cd3e4-56f7.cloud.databricks.com`. | -          |
| `databricks_token`    | The Databricks API token to authenticate with the Unity Catalog API. Use the [secret replacement syntax](../secret-stores/index.md) to reference a secret, e.g. `${secrets:my_databricks_token}`. | -          |

Example:
```yaml
models:
  - from: databricks:jeadie
    name: food
    params:
      databricks_endpoint: dbc-46470731-42e5.cloud.databricks.com
      databricks_token: ${ secrets::SPICE_DATABRICKS_TOKEN }
```
