---
title: 'Databricks Model Provider'
description: 'Instructions for using Databricks Mosaic AI Models'
sidebar_label: 'Databricks'
sidebar_position: 8
---

To use a language model deployed to [Databricks Mosaic AI Model Serving](https://docs.databricks.com/aws/en/machine-learning/model-serving/), specify the model endpoint name prefixed with `databricks:` in the `from` field and include the required parameters in the `params` section.

### Parameters

| Parameter             | Description                                                                                                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `databricks_endpoint` | The Databricks workspace endpoint, e.g., `dbc-a12cd3e4-56f7.cloud.databricks.com`.                                                                                                                 |
| `databricks_token`    | The Databricks API token to authenticate with the Unity Catalog API. Use the [secret replacement syntax](../secret-stores/index.md) to reference a secret, e.g., `${secrets:my_databricks_token}`. |

### Example `spicepod.yaml` Configuration

```yaml
models:
  - from: databricks:jeadie
    name: food
    params:
      databricks_endpoint: dbc-46470731-42e5.cloud.databricks.com
      databricks_token: ${ secrets:SPICE_DATABRICKS_TOKEN }
```

### Additional Information

Refer to the [Moasic AI Model Serving documentation](https://docs.databricks.com/aws/en/machine-learning/model-serving/) for more details on available models and configurations.
