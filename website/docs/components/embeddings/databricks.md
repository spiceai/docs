---
title: 'Databricks Model Provider'
description: 'Instructions for using Databricks Mosaic AI Models'
sidebar_label: 'Databricks'
sidebar_position: 8
---

To use an embedding model deployed to [Databricks Mosaic AI Model Serving](https://docs.databricks.com/aws/en/machine-learning/model-serving/), specify the model endpoint name prefixed with `databricks:` in the `from` field and include the required parameters in the `params` section.

### Parameters

| Parameter                  | Description                                                                                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `databricks_endpoint`      | The Databricks workspace endpoint, e.g., `dbc-a12cd3e4-56f7.cloud.databricks.com`.                                                                                                                     |
| `databricks_token`         | The Databricks API token to authenticate with the Databricks Models API. Use the [secret replacement syntax](../secret-stores/index.md) to reference a secret, e.g., `${secrets:my_databricks_token}`. |
| `databricks_client_id`     | The Databricks Service Principal Client ID. Can't be used with `databricks_token`.                                                                                                                     |
| `databricks_client_secret` | The Databricks Service Principal Client Secret. Can't be used with `databricks_token`.                                                                                                                 |

### Example `spicepod.yaml` configuration, using personal access token

To learn more about how to set up personal access tokens, see [Databricks PAT docs](https://docs.databricks.com/aws/en/dev-tools/auth/pat).

```yaml
embeddings:
  - from: databricks:databricks-gte-large-en
    name: gte-large-en
    params:
      databricks_endpoint: dbc-46470731-42e5.cloud.databricks.com
      databricks_token: ${ secrets:SPICE_DATABRICKS_TOKEN }
```

### Example `spicepod.yaml` configuration, using Databricks service principal

Spice supports the Machine-to-Machine (M2M) OAuth flow with service principal credentials by utilizing the `databricks_client_id` and `databricks_client_secret` parameters. The runtime will automatically refresh the token.

The service principal must be granted the "Can Query" permission for model serving.

To learn more about how to set up the service principal, see [Databricks M2M OAuth docs](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m).

```yaml
embeddings:
  - from: databricks:databricks-gte-large-en
    name: gte-large-en
    params:
      databricks_endpoint: dbc-42424242-4242.cloud.databricks.com
      databricks_client_id: ${secrets:DATABRICKS_CLIENT_ID}
      databricks_client_secret: ${secrets:DATABRICKS_CLIENT_SECRET}
```

### Additional Information

Refer to the [Mosaic AI Model Serving documentation](https://docs.databricks.com/aws/en/machine-learning/model-serving/) for more details on available models and configurations.
