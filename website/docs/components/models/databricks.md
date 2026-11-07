---
title: 'Databricks Model Provider'
description: 'Instructions for using Databricks Mosaic AI Models'
sidebar_label: 'Databricks'
sidebar_position: 8
---

To use a language model deployed to [Databricks Mosaic AI Model Serving](https://docs.databricks.com/aws/en/machine-learning/model-serving/), specify the model endpoint name prefixed with `databricks:` in the `from` field and include the required parameters in the `params` section.

### Parameters

| Parameter                  | Description                                                                                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `databricks_endpoint`      | The Databricks workspace endpoint, e.g., `dbc-a12cd3e4-56f7.cloud.databricks.com`.                                                                                                             |
| `databricks_token`         | The Databricks API token to authenticate with the Databricks Models API. Use the [secret replacement syntax](../secret-stores/) to reference a secret, e.g., `${secrets:my_databricks_token}`. |
| `databricks_client_id`     | The Databricks Service Principal Client ID. Can't be used with `databricks_token`. Required for workload identity federation.                                                                                                             |
| `databricks_client_secret` | The Databricks Service Principal Client Secret. Can't be used with `databricks_token`.                                                                                                         |
| `databricks_oidc_token_filepath` | A file that holds the workload's identity token, read again for every exchange, such as a Kubernetes projected service account token. With `databricks_client_id`, the model authenticates with workload identity federation. Can't be used with `databricks_token_audience`. |
| `databricks_token_audience` | The audience of the identity token Spice requests from a GitHub Actions job, such as the Databricks account ID. With `databricks_client_id`, the model authenticates with workload identity federation. Can't be used with `databricks_oidc_token_filepath`. |

### Example `spicepod.yaml` configuration, using personal access token

To learn more about how to set up personal access tokens, see [Databricks PAT docs](https://docs.databricks.com/aws/en/dev-tools/auth/pat).

```yaml
models:
  - from: databricks:databricks-llama-4-maverick
    name: llama-4-maverick
    params:
      databricks_endpoint: dbc-46470731-42e5.cloud.databricks.com
      databricks_token: ${ secrets:SPICE_DATABRICKS_TOKEN }
```

### Example `spicepod.yaml` configuration, using Databricks service principal

Spice supports the Machine-to-Machine (M2M) OAuth flow with service principal credentials by utilizing the `databricks_client_id` and `databricks_client_secret` parameters. The runtime will automatically refresh the token.

The service principal must be granted the "Can Query" permission for model serving.

To learn more about how to set up the service principal, see [Databricks M2M OAuth docs](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m).

```yaml
models:
  - from: databricks:databricks-llama-4-maverick
    name: llama-4-maverick
    params:
      databricks_endpoint: dbc-46470731-42e5.cloud.databricks.com
      databricks_client_id: ${secrets:DATABRICKS_CLIENT_ID}
      databricks_client_secret: ${secrets:DATABRICKS_CLIENT_SECRET}
```

### Example `spicepod.yaml` configuration, using workload identity federation

The model can authenticate as a service principal with the identity token its platform gives it, so no Databricks token or client secret is stored. Set `databricks_client_id` to the service principal's application ID, and set either `databricks_oidc_token_filepath` or, in a GitHub Actions job, `databricks_token_audience`.

The service principal must be granted the "Can Query" permission for model serving. See [workload identity federation](../data-connectors/databricks#workload-identity-federation) for the federation policy the service principal needs and how Spice renews the token.

```yaml
models:
  - from: databricks:databricks-llama-4-maverick
    name: llama-4-maverick
    params:
      databricks_endpoint: dbc-a12cd3e4-56f7.cloud.databricks.com
      databricks_client_id: ${secrets:DATABRICKS_CLIENT_ID}
      databricks_oidc_token_filepath: /var/run/secrets/tokens/databricks
```

### Additional Information

Refer to the [Mosaic AI Model Serving documentation](https://docs.databricks.com/aws/en/machine-learning/model-serving/) for more details on available models and configurations.
