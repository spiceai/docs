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

Limit the principal to these secret names, as described in [Required Role Assignments](#required-role-assignments).

## Authentication

The `auth_method` parameter selects the credential source:

- **`default`** (the default) — uses an explicit `service_principal` when `client_secret` is set, otherwise falls back to local developer credentials (Azure CLI / `azd`, via the SDK's `DeveloperToolsCredential`). Set `auth_method` explicitly when running on Azure infrastructure. Suitable for local development and for service-principal credentials wired through params.
- **`service_principal`** — uses an explicit `tenant_id`, `client_id`, and `client_secret`. Use when Spice must authenticate as a specific Microsoft Entra application.
- **`managed_identity`** — uses the [system-assigned managed identity](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview) of the Azure VM, AKS node, Container App, or ACI hosting Spice. Pass `client_id` to select a user-assigned identity.
- **`workload_identity`** — uses [federated tokens](https://learn.microsoft.com/azure/aks/workload-identity-overview) injected by AKS or another Kubernetes cluster configured with workload identity. `client_id` and `tenant_id` are typically supplied by the workload-identity admission webhook through the `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_FEDERATED_TOKEN_FILE` environment variables.
- **`cli`** — uses cached credentials from a local `az login` session. Common during development.

For sovereign clouds (Azure China, Azure Government), set `endpoint` to the regional DNS suffix (for example `vault.azure.cn`).

## Required Role Assignments

The principal used by Spice must be able to read the secrets the Spicepod references, and no others. Spice reads any secret name a `${azure:...}` reference produces, and `spice run` reloads the Spicepod when the file changes. A principal that can read every secret in the vault therefore exposes every secret in the vault, including secrets that belong to other applications, to anyone who can edit the Spicepod.

Assign the built-in **Key Vault Secrets User** role (`4633458b-17de-408a-b874-0445c86b69e6`) on the vault with an [Azure ABAC condition](https://learn.microsoft.com/azure/key-vault/general/rbac-abac) that limits `getSecret` to the secret names the Spicepod uses. For the [example](#example) above:

```bash
az role assignment create \
  --assignee-object-id "<PRINCIPAL_OBJECT_ID>" \
  --assignee-principal-type ServicePrincipal \
  --role "Key Vault Secrets User" \
  --scope "/subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.KeyVault/vaults/<vault>" \
  --condition-version "2.0" \
  --condition "(NOT ActionMatches{'Microsoft.KeyVault/vaults/secrets/getSecret/action'}) OR (@Resource[Microsoft.KeyVault/vaults/secrets:name] ForAnyOfAnyValues:StringEquals {'spice-postgres-user', 'postgres-user', 'spice-postgres-password', 'postgres-password'})"
```

The condition lists both names for each key. Spice requests the `spice-` name first and requests the unprefixed name only when Key Vault returns `404 Not Found`. Any other error, including `403 Forbidden`, stops the lookup and fails the reference. Storing each secret under its `spice-` name means the first request returns the secret. Write the names in lowercase, because Key Vault normalizes secret names to lowercase before evaluating the condition. When the Spicepod adds a secret reference, add its names to the condition. A reference to a name outside the condition fails with `403 Forbidden`.

ABAC conditions for Key Vault are in preview and require the vault to use the [Azure RBAC permission model](https://learn.microsoft.com/azure/key-vault/general/rbac-guide). Without conditions, assign the role on each secret instead of on the vault. Store each secret under its `spice-` name so that the first request is for a secret the principal can read:

```bash
az role assignment create \
  --assignee-object-id "<PRINCIPAL_OBJECT_ID>" \
  --assignee-principal-type ServicePrincipal \
  --role "Key Vault Secrets User" \
  --scope "/subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.KeyVault/vaults/<vault>/secrets/spice-postgres-user"
```

Repeat the assignment for `spice-postgres-password` and for every other secret the Spicepod references.

The store performs a `list_secret_properties` call on startup to validate connectivity and fail fast on misconfiguration. A `403 Forbidden` on list is tolerated, so a principal limited to `getSecret` on individual secrets passes startup. The vault-scope assignment above also grants `readMetadata` on the vault, so the list call succeeds; it returns secret names and properties, not values.

| Permission                                              | Purpose                                                                               |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `Microsoft.KeyVault/vaults/secrets/getSecret/action`    | Required. Read secret values. Limit it to the secret names the Spicepod references.   |
| `Microsoft.KeyVault/vaults/secrets/readMetadata/action` | Optional. Powers the startup validation list call. Returns names and properties only. |

Key Vaults that use the legacy [access policy permission model](https://learn.microsoft.com/azure/key-vault/general/assign-access-policy) cannot limit access to individual secrets: a `Get` permission on **Secrets** applies to every secret in the vault. Migrate the vault to the [Azure RBAC permission model](https://learn.microsoft.com/azure/key-vault/general/rbac-migration) and use one of the assignments above, or keep the Spicepod's secrets in a vault that holds no secrets for other applications.

## Caching

The store maintains a per-key in-process cache with a 60-second positive TTL and a 10-second negative TTL, with single-flight coalescing so concurrent lookups for the same key issue at most one network round-trip. To force a refresh, restart the runtime.
