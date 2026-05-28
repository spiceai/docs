---
title: 'HashiCorp Vault Secret Store'
sidebar_label: 'HashiCorp Vault Secret Store'
sidebar_position: 6
description: 'HashiCorp Vault Secret Store Documentation'
---

The `hashicorp_vault` store enables Spice to read secrets from a [HashiCorp Vault](https://developer.hashicorp.com/vault) KV secrets engine (v1 or v2). The selector is the path *under the mount* — Spice automatically inserts the `data/` segment for KV v2.

:::note[Build requirement]
The official Spice Open Source prebuilt binary does not include `hashicorp_vault` in its default feature set. To use the HashiCorp Vault secret store, [build Spice from source](https://github.com/spiceai/spiceai/blob/trunk/CONTRIBUTING.md#building) with the `hashicorp_vault` feature enabled, for example:

```bash
cargo build --release --features release,models,hashicorp_vault -p spiced
```
:::

```yaml
secrets:
  - from: hashicorp_vault:myapp/config
    name: vault
    params:
      hashicorp_vault_address: https://vault.example.com:8200
      hashicorp_vault_token: ${ env:VAULT_TOKEN }
```

With the default mount (`secret`) and KV v2, the example above reads `/v1/secret/data/myapp/config`. The Vault response body's `data` field is treated as a `key → string` map; each `${vault:my_key}` reference resolves to the corresponding entry.

## Parameters

| Parameter Name | Description |
| --- | --- |
| `hashicorp_vault_address` | **Required.** Vault server URL, e.g. `https://vault.example.com:8200`. Plaintext `http://` is allowed only for `localhost` / `127.0.0.1` so local dev with `vault server -dev` works without TLS. |
| `hashicorp_vault_namespace` | Optional. Vault Enterprise namespace, sent as the `X-Vault-Namespace` header. Leave unset for OSS Vault. |
| `hashicorp_vault_mount` | Optional. Mount path of the KV secrets engine. Defaults to `secret`, matching `vault server -dev`. |
| `hashicorp_vault_kv_version` | Optional. `v1` or `v2`. Defaults to `v2`. v2 supports versioning and rolls the read URL through `/data/`; v1 is the legacy layout. |
| `hashicorp_vault_auth_method` | Optional. One of `token`, `approle`, `kubernetes`, or `jwt`. Defaults to `token`. |
| `hashicorp_vault_token` | Required for `auth_method: token`. Vault client token. Typically `${ env:VAULT_TOKEN }`. |
| `hashicorp_vault_role_id` | Required for `auth_method: approle`. AppRole `role_id`. |
| `hashicorp_vault_secret_id` | Required for `auth_method: approle`. AppRole `secret_id`. Typically `${ env:VAULT_SECRET_ID }`. |
| `hashicorp_vault_role` | Required for `auth_method: kubernetes` and `auth_method: jwt`. Vault role name. |
| `hashicorp_vault_jwt` | JWT/OIDC token presented for `auth_method: jwt`, or the Kubernetes service-account JWT for `auth_method: kubernetes` when not reading it from disk. Typically sourced from env. |
| `hashicorp_vault_kubernetes_token_path` | Optional. Filesystem path to the service-account JWT for `auth_method: kubernetes`. Defaults to `/var/run/secrets/kubernetes.io/serviceaccount/token`. Ignored when `hashicorp_vault_jwt` is set. |
| `hashicorp_vault_auth_mount` | Optional. Mount path of the auth backend, *without* the leading `auth/` segment. Defaults to the auth method name (`approle`, `kubernetes`, `jwt`). Override when the backend has been mounted at a non-default path (e.g. `k8s-prod`). |
| `hashicorp_vault_ca_cert` | Optional. Filesystem path to a PEM-encoded CA certificate to add to the TLS trust store. Use for self-signed Vault deployments. |
| `hashicorp_vault_tls_skip_verify` | Optional. `true` / `false` (default `false`). Skip TLS certificate verification. Strongly discouraged outside local development. |
| `hashicorp_vault_request_timeout` | Optional. Per-request timeout in seconds for Vault HTTP calls. Defaults to `10`. |

Parameter values support `${ env:KEY }` references to load values from environment variables.

:::note
Unknown parameters are rejected with an error listing the supported parameter names. This helps catch typos — e.g., `hashicorp_vault_addr` instead of `hashicorp_vault_address` will produce an immediate error instead of being silently ignored.
:::

## Authentication

The `hashicorp_vault_auth_method` parameter selects the credential source:

- **`token`** (the default) — uses the supplied `hashicorp_vault_token` directly. Suitable for local development (`vault server -dev` prints a root token at startup) and for short-lived tokens minted by an external orchestrator.
- **`approle`** — performs a [`POST /v1/auth/approle/login`](https://developer.hashicorp.com/vault/docs/auth/approle) using `hashicorp_vault_role_id` and `hashicorp_vault_secret_id`. Production-shaped: long-lived `role_id`, short-lived `secret_id`.
- **`kubernetes`** — performs a [`POST /v1/auth/kubernetes/login`](https://developer.hashicorp.com/vault/docs/auth/kubernetes) using `hashicorp_vault_role` and the in-cluster service-account JWT (read from `hashicorp_vault_kubernetes_token_path`, or supplied directly via `hashicorp_vault_jwt`).
- **`jwt`** — performs a [`POST /v1/auth/jwt/login`](https://developer.hashicorp.com/vault/docs/auth/jwt) using `hashicorp_vault_role` and `hashicorp_vault_jwt`. Use for OIDC-issued tokens or any other JWT-shaped credential.

For `approle`, `kubernetes`, and `jwt`, the returned client token is cached in-process and reused until its lease expires. On a `403 Forbidden` from the data read, the store re-authenticates once and retries transparently. There is no background renewal task.

For self-signed Vault deployments, supply the CA bundle path via `hashicorp_vault_ca_cert` (preferred) or, for ad-hoc testing only, set `hashicorp_vault_tls_skip_verify: true`.

## Example

A complete Spicepod definition with a dataset that uses a secret from Vault, authenticated via AppRole:

```yaml
version: v1
kind: Spicepod
name: taxi_trips

secrets:
  - from: hashicorp_vault:databases/postgres/taxi
    name: vault
    params:
      hashicorp_vault_address: https://vault.example.com:8200
      hashicorp_vault_auth_method: approle
      hashicorp_vault_role_id: ${ env:VAULT_ROLE_ID }
      hashicorp_vault_secret_id: ${ env:VAULT_SECRET_ID }

datasets:
  - from: postgres:public.taxi_trips
    name: taxi_trips
    params:
      pg_host: postgres.example.com
      pg_user: ${vault:username}
      pg_pass: ${vault:password}
```

With the example above, Spice reads `/v1/secret/data/databases/postgres/taxi` from Vault and resolves `${vault:username}` and `${vault:password}` against the returned `data` map.

## Required Vault Policy

The token / role used by Spice needs `read` capability on the configured KV path. For the example above:

```hcl
path "secret/data/databases/postgres/taxi" {
  capabilities = ["read"]
}
```

For KV v1, drop the `data/` segment.

## Caching

The store maintains a per-path in-process cache. The positive TTL honors the `lease_duration` returned by Vault, falling back to 60 seconds when none is provided (typical for KV, which has no lease itself). Confirmed-missing paths (`404`) are negatively cached for 10 seconds. Concurrent lookups for the same path are coalesced behind a single async lock so only one `GET` is in flight per store. To force a refresh, restart the runtime.
