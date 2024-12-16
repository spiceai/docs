---
title: 'Azure OpenAI Models'
description: 'Instructions for using Azure OpenAI models'
sidebar_label: 'Azure OpenAI'
sidebar_position: 2
---

To use a language model hosted on Azure OpenAI, specify the `azure` path in the `from` field and the following parameters from the [Azure OpenAI Model Deployment](https://ai.azure.com/resource/deployments) page:

| Param                   | Description                                                                 | Default                     |
| ----------------------- | --------------------------------------------------------------------------- | --------------------------- |
| `azure_api_key`         | The Azure OpenAI API key from the models deployment page.                   | -                           |
| `azure_api_version`     | The API version used for the Azure OpenAI service.                          | -                           |
| `azure_deployment_name` | The name of the model deployment.                                           | Model name                  |
| `endpoint`              | The Azure OpenAI resource endpoint, e.g., `https://resource-name.openai.azure.com`. | -                           |
| `azure_entra_token`     | The Azure Entra token for authentication.                                   | -                           |

Only one of `azure_api_key` or `azure_entra_token` can be provided for model configuration.

Example:

```yaml
models:
  - from: azure:gpt-4o-mini
    name: gpt-4o-mini
    params:
      endpoint: ${ secrets:SPICE_AZURE_AI_ENDPOINT }
      azure_api_version: 2024-08-01-preview
      azure_deployment_name: gpt-4o-mini
      azure_api_key: ${ secrets:SPICE_AZURE_API_KEY }
```

Refer to the [Azure OpenAI Service models](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models) for more details on available models and configurations.

Follow [Quickstart: Using Azure OpenAI models](https://github.com/spiceai/quickstarts/tree/trunk/azure_openai) to try Azure OpenAI models for vector-based search and chat functionalities with structured (taxi trips) and unstructured (GitHub files) data.
