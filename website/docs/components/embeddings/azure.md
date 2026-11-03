---
title: 'Azure OpenAI Embedding Models'
sidebar_label: 'Azure OpenAI'
sidebar_position: 2
tags:
  - embeddings
  - azure
  - openai
---

To use an embedding model hosted on Azure OpenAI, specify the `azure` path in the `from` field and the following parameters from the [Azure OpenAI Model Deployment](https://ai.azure.com/resource/deployments) page:

| Param                   | Description                                                                         | Default    |
| ----------------------- | ----------------------------------------------------------------------------------- | ---------- |
| `azure_api_key`         | The Azure OpenAI API key from the models deployment page.                           | -          |
| `azure_api_version`     | The API version used for the Azure OpenAI service.                                  | -          |
| `azure_deployment_name` | The name of the model deployment.                                                   | Model name |
| `endpoint`              | The Azure OpenAI resource endpoint, e.g., `https://resource-name.openai.azure.com`. | -          |
| `azure_entra_token`     | A Microsoft Entra access token for authentication. Spice sends the token as given and does not renew it, so requests fail once it expires. | -          |
| `azure_tenant_id` | The Microsoft Entra tenant (directory) ID, or a domain name such as `contoso.onmicrosoft.com`. With `azure_client_id`, the embedding model authenticates with [workload identity federation](#workload-identity-federation) instead of `azure_api_key` or `azure_entra_token`. | `AZURE_TENANT_ID` |
| `azure_client_id` | The client ID of the user-assigned managed identity or app registration whose federated credential trusts the workload's identity token. Required for workload identity federation. | `AZURE_CLIENT_ID` |
| `azure_federated_token_file` | A file that holds the workload's identity token, such as a Kubernetes projected service account token. Spice reads it again for every exchange. When neither this parameter nor `AZURE_FEDERATED_TOKEN_FILE` is set, Spice requests the token from GitHub Actions. | `AZURE_FEDERATED_TOKEN_FILE` |
| `azure_federated_token_audience` | The audience Spice requests a GitHub Actions identity token for. It must match the audience of the federated credential. Applies only to a token from GitHub Actions. | `api://AzureADTokenExchange` |

An embedding model authenticates with exactly one of `azure_api_key`, `azure_entra_token`, or [workload identity federation](#workload-identity-federation).

Example:

```yaml
embeddings:
  - name: embeddings-model
    from: azure:text-embedding-3-small
    params:
      endpoint: ${ secrets:SPICE_AZURE_AI_ENDPOINT }
      azure_deployment_name: text-embedding-3-small
      azure_api_version: 2023-05-15
      azure_api_key: ${ secrets:SPICE_AZURE_API_KEY }
```

## Workload Identity Federation

An Azure OpenAI embedding model can authenticate with Microsoft Entra workload identity federation, with the same parameters, identity token sources, environment variables, and errors as an [Azure OpenAI model](../models/azure.md#workload-identity-federation). See [Troubleshooting](../models/azure.md#troubleshooting) for the load errors. On AKS with workload identity, in a pod with the `azure.workload.identity/use: "true"` label, the embedding model needs only its `endpoint`.

```yaml
embeddings:
  - from: azure:text-embedding-3-small
    name: embeddings-model
    params:
      endpoint: https://my-resource.openai.azure.com
      azure_deployment_name: text-embedding-3-small
      azure_api_version: 2023-05-15
      azure_tenant_id: ${ secrets:AZURE_TENANT_ID }
      azure_client_id: ${ secrets:AZURE_CLIENT_ID }
```

In a pod where AKS sets `AZURE_FEDERATED_TOKEN_FILE`, this embedding model logs the following line when it loads. The log line and the errors name the embedding model rather than a model:

```text
Authenticated embedding 'embeddings-model' (azure) as a Microsoft Entra workload identity, with the tenant from `azure_tenant_id`, the client from `azure_client_id` and the identity token from `AZURE_FEDERATED_TOKEN_FILE`.
```

An embedding model with no credential fails to load with:

```text
Azure embedding model 'embeddings-model' requires `azure_api_key`, `azure_entra_token`, or a Microsoft Entra workload identity: `azure_tenant_id` and `azure_client_id`, or on AKS a pod labeled `azure.workload.identity/use: "true"`. See https://spiceai.org/docs/components/embeddings/azure for details.
```

Unlike a model, an embedding model also loads `azure_api_key` and `azure_entra_token` from a secret store when the Spicepod does not set them, such as `AZURE_API_KEY` from the default [`env` secret store](../secret-stores/env/index.md). An embedding model with `azure_api_key` or `azure_entra_token`, whether the Spicepod sets it or Spice loads it from a secret store, never uses the environment's workload identity. A key loaded from a secret store does not conflict with federation parameters that the Spicepod sets: those parameters take precedence over the key, and any federation parameter the Spicepod does not set comes from its `AZURE_*` environment variable, as for a model. A key that the Spicepod sets together with a federation parameter is a configuration error.

Refer to the [Azure OpenAI Service models](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models) for more details on available models and configurations.

Follow the [Azure OpenAI Models Cookbook](https://github.com/spiceai/cookbook/tree/trunk/azure_openai) to try Azure OpenAI models for vector-based search and chat functionalities with structured (taxi trips) and unstructured (GitHub files) data.
