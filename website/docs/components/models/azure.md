---
title: 'Azure OpenAI Models'
description: 'Instructions for using Azure OpenAI models'
sidebar_label: 'Azure OpenAI'
sidebar_position: 2
---

To use a language model hosted on Azure OpenAI, specify the `azure` path in the `from` field and the following parameters from the [Azure OpenAI Model Deployment](https://ai.azure.com/resource/deployments) page:

| Param                   | Description                                                                         | Default    |
| ----------------------- | ----------------------------------------------------------------------------------- | ---------- |
| `azure_api_key`         | The Azure OpenAI API key from the models deployment page.                           | -          |
| `azure_api_version`     | The API version used for the Azure OpenAI service.                                  | -          |
| `azure_deployment_name` | The name of the model deployment.                                                   | Model name |
| `endpoint`              | The Azure OpenAI resource endpoint, e.g., `https://resource-name.openai.azure.com`. | -          |
| `azure_entra_token`     | A Microsoft Entra access token for authentication. Spice sends the token as given and does not renew it, so requests fail once it expires. For a token that Spice renews, use [workload identity federation](#workload-identity-federation). | -          |
| `azure_tenant_id` | The Microsoft Entra tenant of the identity the model authenticates as: a directory (tenant) ID, which is a GUID, or a domain name such as `contoso.onmicrosoft.com`. With `azure_client_id`, the model authenticates with [workload identity federation](#workload-identity-federation) instead of `azure_api_key` or `azure_entra_token`. | `AZURE_TENANT_ID` |
| `azure_client_id` | The client ID of the user-assigned managed identity or app registration whose federated credential trusts the workload's identity token. Required for workload identity federation. | `AZURE_CLIENT_ID` |
| `azure_federated_token_file` | A file that holds the workload's identity token, such as a Kubernetes projected service account token. Spice reads it again for every exchange. When neither this parameter nor `AZURE_FEDERATED_TOKEN_FILE` is set, Spice requests the token from GitHub Actions. | `AZURE_FEDERATED_TOKEN_FILE` |
| `azure_federated_token_audience` | The audience Spice requests a GitHub Actions identity token for. It must match the audience of the federated credential. Applies only to a token from GitHub Actions. | `api://AzureADTokenExchange` |
| `responses_api`           | `enabled` or `disabled`. Controls the Chat Completions backend: `enabled` proxies `/v1/chat/completions` through the backend Responses API; `disabled` uses the standard Chat Completions backend. The `/v1/responses` endpoint is available for all models regardless of this setting. | `disabled` |
| `openai_responses_tools`  | Comma-separated list of OpenAI-hosted tools exposed via the Responses API for this model. The key has no `azure_` prefix, and takes effect only when the model also sets `tools` (for example, `tools: auto`). These hosted tools are **not** available from the `/v1/chat/completions` HTTP endpoint. Supported tools: `code_interpreter`, `web_search`, `web_search_preview` (the legacy tool, for older models that do not support `web_search`). | -                           |


A model authenticates with exactly one of `azure_api_key`, `azure_entra_token`, or [workload identity federation](#workload-identity-federation).

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

      # Responses API configuration
      responses_api: enabled
      tools: auto
      openai_responses_tools: web_search
```

## Workload Identity Federation

An Azure OpenAI model can authenticate with [Microsoft Entra workload identity federation](https://learn.microsoft.com/entra/workload-id/workload-identity-federation) instead of an API key or an Entra token. Spice exchanges the identity token that the platform gives the workload, such as a GitHub Actions OIDC token or a Kubernetes service account token, for a Microsoft Entra access token, and exchanges again before each access token expires, so no Azure OpenAI API key or Entra token is stored with Spice. The same parameters apply to `/v1/chat/completions`, `/v1/responses`, and [Azure OpenAI embedding models](../embeddings/azure.md).

```yaml
models:
  - from: azure:gpt-4o-mini
    name: gpt
    params:
      endpoint: https://my-resource.openai.azure.com
      azure_api_version: 2024-10-21
      azure_deployment_name: gpt-4o-mini
      azure_tenant_id: ${ secrets:AZURE_TENANT_ID }
      azure_client_id: ${ secrets:AZURE_CLIENT_ID }
      azure_federated_token_file: /var/run/secrets/tokens/azure-identity-token
```

`azure_tenant_id` and `azure_client_id` are both required. When the Spicepod does not set one of them, Spice uses the `AZURE_TENANT_ID` or `AZURE_CLIENT_ID` environment variable. The identity token comes from the first of these sources that is available:

1. The file in `azure_federated_token_file`.
2. The file in the `AZURE_FEDERATED_TOKEN_FILE` environment variable.
3. The GitHub Actions job that Spice runs in, which needs `permissions: id-token: write` (see [OpenID Connect in GitHub Actions](https://docs.github.com/en/actions/concepts/security/openid-connect)). Spice requests a new token from GitHub for every exchange, for the audience in `azure_federated_token_audience`, which defaults to `api://AzureADTokenExchange`, the audience Microsoft Entra ID recommends for a federated credential.

Spice reads a token file again for every exchange, so the platform can rotate the token in place. The audience of a token in a file is set where the token is issued, such as the `audience` of a Kubernetes projected volume, so a model that sets `azure_federated_token_audience` while its token comes from a file fails to load with a configuration error.

Spice exchanges the token with the Microsoft Entra ID authority of the cloud that `endpoint` belongs to, for a token scoped to Azure OpenAI in that cloud:

| `endpoint` host     | Authority                           | Scope                                          |
| ------------------- | ----------------------------------- | ---------------------------------------------- |
| Ends in `.azure.us` | `https://login.microsoftonline.us`  | `https://cognitiveservices.azure.us/.default`  |
| Ends in `.azure.cn` | `https://login.chinacloudapi.cn`    | `https://cognitiveservices.azure.cn/.default`  |
| Any other host      | `https://login.microsoftonline.com` | `https://cognitiveservices.azure.com/.default` |

When the `AZURE_AUTHORITY_HOST` environment variable is set, it replaces the authority. When the model loads, Spice logs one `info` line that names where each part of the model's identity came from.

Spice exchanges again one minute before the access token expires, or, for a token that lasts less than four minutes, after three quarters of its lifetime. When an exchange after the first one fails, Spice keeps using the current access token and retries, waiting at most 15 seconds between attempts, and logs a warning that names the model.

A model that sets `azure_api_key` or `azure_entra_token` together with `azure_tenant_id`, `azure_client_id`, `azure_federated_token_file`, or `azure_federated_token_audience` fails to load with an error that names both. A model that has only one of the tenant and the client ID fails with an error that names the missing parameter, and a tenant that is neither a GUID nor a domain name fails with an error that names `azure_tenant_id`. A model with no identity token source fails with an error that names `azure_federated_token_file`. When Microsoft Entra ID refuses the first exchange, the model fails to load with Entra's reason, such as an `AADSTS700213` error for a token whose subject matches no federated credential.

### AKS Workload Identity

A model that sets none of `azure_api_key`, `azure_entra_token`, and the federation parameters uses the workload identity of its environment, as the Azure SDKs do: `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, and the token file in `AZURE_FEDERATED_TOKEN_FILE`. [AKS workload identity](https://learn.microsoft.com/azure/aks/workload-identity-overview) sets these variables in a pod that has the `azure.workload.identity/use: "true"` label and a service account with the `azure.workload.identity/client-id` annotation, so on AKS the model needs only its `endpoint`:

```yaml
models:
  - from: azure:gpt-4o-mini
    name: gpt
    params:
      endpoint: https://my-resource.openai.azure.com
```

Without the label, the workload identity webhook does not set the variables, and the model fails to load for lack of a credential. [Configure workload identity for Azure access](../../deployment/azure/index.md#2-configure-workload-identity-for-azure-access) shows the Helm values that add the label and the annotation.

The environment supplies a workload identity only when it has all three parts: a tenant, a client ID, and an identity token, from `AZURE_FEDERATED_TOKEN_FILE` or the GitHub Actions job. Otherwise the model has no credential and fails to load with an error that lists `azure_api_key`, `azure_entra_token`, and workload identity federation. A model that sets `azure_api_key` or `azure_entra_token` never uses the environment's workload identity.

### Kubernetes Outside AKS

On another Kubernetes cluster, project a service account token with the audience `api://AzureADTokenExchange` into the pod, and name its file in `azure_federated_token_file`, as in the Spicepod at the top of this section:

```yaml
# Pod spec
spec:
  serviceAccountName: spiceai
  containers:
    - name: spiceai
      volumeMounts:
        - name: azure-identity-token
          mountPath: /var/run/secrets/tokens
          readOnly: true
  volumes:
    - name: azure-identity-token
      projected:
        sources:
          - serviceAccountToken:
              path: azure-identity-token
              audience: api://AzureADTokenExchange
              expirationSeconds: 3600
```

Kubernetes rotates a projected token before it expires ([service account token volume projection](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/#serviceaccount-token-volume-projection)). The federated credential's issuer is the cluster's service account issuer, and Microsoft Entra ID must be able to read that issuer's OIDC discovery document and signing keys.

### GitHub Actions

In a GitHub Actions job, Spice requests the job's OIDC token, so the model needs no token file. With `AZURE_TENANT_ID` and `AZURE_CLIENT_ID` in the job's environment, a model that sets only `endpoint` uses the job's identity, as on AKS. The job needs `permissions: id-token: write`:

```yaml
jobs:
  integration:
    runs-on: ubuntu-latest
    environment: prod # The federated credential's subject is repo:my-org/my-repo:environment:prod
    permissions:
      contents: read
      id-token: write # Spice requests the job's OIDC token
    env:
      AZURE_TENANT_ID: ${{ vars.AZURE_TENANT_ID }}
      AZURE_CLIENT_ID: ${{ vars.AZURE_CLIENT_ID }}
    steps:
      - uses: actions/checkout@v5
      - run: curl https://install.spiceai.org | /bin/bash
      - run: ~/.spice/bin/spice run &
```

Spice requests a new OIDC token from the job for every exchange, so the model keeps its access for as long as the job runs.

### Create the Identity in Azure

The identity is a [user-assigned managed identity](https://learn.microsoft.com/entra/workload-id/workload-identity-federation-create-trust-user-assigned-managed-identity) or an app registration. It needs a federated credential that trusts the workload's identity token, and the [`Cognitive Services OpenAI User`](https://learn.microsoft.com/azure/ai-services/openai/how-to/role-based-access-control) role on the Azure OpenAI resource. With the Azure CLI:

```bash
RG=my-rg

# 1. Create a user-assigned managed identity, and read the IDs Spice needs.
az identity create --resource-group $RG --name spice-models
AZURE_CLIENT_ID=$(az identity show --resource-group $RG --name spice-models --query clientId -o tsv)
AZURE_TENANT_ID=$(az identity show --resource-group $RG --name spice-models --query tenantId -o tsv)
PRINCIPAL_ID=$(az identity show --resource-group $RG --name spice-models --query principalId -o tsv)

# 2. Trust the workload's identity token.
az identity federated-credential create \
  --resource-group $RG \
  --identity-name spice-models \
  --name github-prod \
  --issuer https://token.actions.githubusercontent.com \
  --subject repo:my-org/my-repo:environment:prod \
  --audiences api://AzureADTokenExchange

# 3. Grant the identity access to the Azure OpenAI resource.
OPENAI_ID=$(az cognitiveservices account show --resource-group $RG --name my-resource --query id -o tsv)
az role assignment create \
  --assignee-object-id $PRINCIPAL_ID \
  --assignee-principal-type ServicePrincipal \
  --role "Cognitive Services OpenAI User" \
  --scope $OPENAI_ID
```

The issuer and subject of the federated credential depend on where Spice runs:

| Workload                                                              | `--issuer`                                                                                                                      | `--subject`                                           |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| GitHub Actions job in the environment `prod`                          | `https://token.actions.githubusercontent.com`                                                                                   | `repo:my-org/my-repo:environment:prod`                |
| AKS pod with the service account `spiceai` in the namespace `spiceai` | The cluster's OIDC issuer, from `az aks show --resource-group $RG --name my-cluster --query oidcIssuerProfile.issuerUrl -o tsv` | `system:serviceaccount:spiceai:spiceai`               |
| Pod on another Kubernetes cluster                                     | The cluster's service account issuer                                                                                            | `system:serviceaccount:<namespace>:<service-account>` |

The subject must match the token's `sub` claim exactly. GitHub lists the subject of each kind of job in [OpenID Connect in Azure](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-azure). For an app registration, add the federated credential with `az ad app federated-credential create`, and use the application (client) ID as `azure_client_id`. A new federated credential can take a few seconds to take effect.

Refer to the [Azure OpenAI Service models](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models) for more details on available models and configurations.

Follow the [Azure OpenAI Models Cookbook](https://github.com/spiceai/cookbook/tree/trunk/azure_openai) to try Azure OpenAI models for vector-based search and chat functionalities with structured (taxi trips) and unstructured (GitHub files) data.
