---
title: 'Azure Key Vault Secret Store'
sidebar_label: 'Azure Key Vault Secret Store'
sidebar_position: 5
description: 'Azure Key Vault Secret Store Documentation'
---

The `azure_keyvault` store enables Spice to read secrets from [Azure Key Vault](https://azure.microsoft.com/products/key-vault/) by specifying the vault name with a selector.

```yaml
secrets:
  - from: azure_keyvault:my-vault
    name: azure
```

The selector is the Key Vault name. Any keys referenced using `${azure:my_key}` resolve to a secret named `spice-my-key` in `my-vault`, falling back to `my-key` if the prefixed form does not exist. Logical key names use underscores; the store automatically translates them to the hyphen-delimited names that Key Vault requires (`openai_api_key` → `spice-openai-api-key` → `openai-api-key`).

## Parameters

| Parameter Name  | Description                                                                                                                                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth_method`   | Optional. One of `service_principal`, `managed_identity`, `workload_identity`, `cli`, or `default`. Defaults to `default`: uses `service_principal` if `client_secret` is set, otherwise the Azure CLI / `azd` developer credential. Managed and workload identity are not selected implicitly — set `auth_method` explicitly when running on Azure infrastructure. |
| `tenant_id`     | Required for `auth_method: service_principal`. Optional for `workload_identity` — when omitted, read from the `AZURE_TENANT_ID` env var injected by the AKS workload-identity webhook. Ignored for `managed_identity`, `cli`, and `default` (developer-tools fallback). The Microsoft Entra tenant ID. |
| `client_id`     | Required for `auth_method: service_principal`. Optional for `workload_identity` — when omitted, read from the `AZURE_CLIENT_ID` env var injected by the AKS workload-identity webhook. Optional for `managed_identity` to select a user-assigned identity (system-assigned is used when omitted). Ignored for `cli` and `default` (developer-tools fallback). |
| `client_secret` | Required for `auth_method: service_principal`. The application secret.                                                                                                                                                                                                          |
| `endpoint`      | Optional. Sovereign cloud override. Accepts either a full URL (`https://my-vault.vault.azure.cn`) or a bare DNS suffix (`vault.azure.cn`). Defaults to the Azure public cloud (`vault.azure.net`).                                                                              |

Parameter values support `${ env:KEY }` references to load values from environment variables.

```yaml
secrets:
  - from: azure_keyvault:my-vault
    name: azure
    params:
      auth_method: service_principal
      tenant_id: ${ env:AZURE_TENANT_ID }
      client_id: ${ env:AZURE_CLIENT_ID }
      client_secret: ${ env:AZURE_CLIENT_SECRET }
```

:::note
Unknown parameters are rejected with an error listing the supported parameter names. This helps catch typos — e.g., `tenent_id` instead of `tenant_id` will produce an immediate error instead of being silently ignored.
:::

## Example

A complete Spicepod definition with a dataset that uses a secret from Azure Key Vault.

```yaml
version: v1
kind: Spicepod
name: taxi_trips

secrets:
  - from: azure_keyvault:prod-vault
    name: azure

datasets:
  - from: postgres:public.taxi_trips
    name: taxi_trips
    params:
      pg_host: postgres.example.com
      pg_user: ${azure:postgres_user}
      pg_pass: ${azure:postgres_password}
```

With the example above, Spice resolves `${azure:postgres_user}` by reading `spice-postgres-user` from the `prod-vault` Key Vault, falling back to `postgres-user`.

## Authentication

The `auth_method` parameter selects the credential source:

- **`default`** (the default) — uses an explicit `service_principal` when `client_secret` is set, otherwise falls back to local developer credentials (Azure CLI / `azd`, via the SDK's `DeveloperToolsCredential`). Set `auth_method` explicitly when running on Azure infrastructure. Suitable for local development and for service-principal credentials wired through params.
- **`service_principal`** — uses an explicit `tenant_id`, `client_id`, and `client_secret`. Use when Spice must authenticate as a specific Microsoft Entra application.
- **`managed_identity`** — uses the [system-assigned managed identity](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview) of the Azure VM, AKS node, Container App, or ACI hosting Spice. Pass `client_id` to select a user-assigned identity.
- **`workload_identity`** — uses [federated tokens](https://learn.microsoft.com/azure/aks/workload-identity-overview) injected by AKS or another Kubernetes cluster configured with workload identity. `client_id` and `tenant_id` are typically supplied by the workload-identity admission webhook through the `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_FEDERATED_TOKEN_FILE` environment variables.
- **`cli`** — uses cached credentials from a local `az login` session. Common during development.

For sovereign clouds (Azure China, Azure Government), set `endpoint` to the regional DNS suffix (for example `vault.azure.cn`).

## Required Role Assignments

The principal used by Spice must have read access to secrets in the target Key Vault. The recommended built-in role is **Key Vault Secrets User** (`4633458b-17de-408a-b874-0445c86b69e6`):

```bash
az role assignment create \
  --assignee-object-id <PRINCIPAL_OBJECT_ID> \
  --assignee-principal-type ServicePrincipal \
  --role "Key Vault Secrets User" \
  --scope /subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.KeyVault/vaults/<vault>
```

The store performs a `list_secret_properties` call on startup to validate connectivity and fail fast on misconfiguration. A `403 Forbidden` on list is tolerated, so principals scoped only to per-secret `Microsoft.KeyVault/vaults/secrets/getSecret/action` (for example, **Key Vault Reader** combined with a custom role) are supported.

| Permission                                              | Purpose                                            |
| ------------------------------------------------------- | -------------------------------------------------- |
| `Microsoft.KeyVault/vaults/secrets/getSecret/action`    | Required. Read individual secret values.           |
| `Microsoft.KeyVault/vaults/secrets/readMetadata/action` | Optional. Powers the startup validation list call. |

For Key Vaults configured with the legacy [access policy permission model](https://learn.microsoft.com/azure/key-vault/general/assign-access-policy), grant the `Get` and (optionally) `List` permissions on **Secrets** instead of an RBAC role assignment.

## Caching

The store maintains a per-key in-process cache with a 60-second positive TTL and a 10-second negative TTL, with single-flight coalescing so concurrent lookups for the same key issue at most one network round-trip. To force a refresh, restart the runtime.
