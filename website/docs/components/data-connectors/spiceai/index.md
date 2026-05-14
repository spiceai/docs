---
title: 'Spice.ai Data Connector'
sidebar_label: 'Spice.ai Data Connector'
description: 'Federated SQL across Spice runtimes — Spice Cloud Platform datasets and self-hosted Spice instances (cluster-sidecar pattern).'
pagination_next: null
---

The Spice.ai Data Connector federates SQL queries across **another Spice runtime** over [Arrow Flight](https://arrow.apache.org/docs/format/Flight.html). The same connector targets two architectures:

- **Spice → Spice Cloud Platform** — federate datasets hosted on the managed [Spice.ai Cloud Platform](https://docs.spice.ai/building-blocks/datasets). Requires a free [Spice.ai account](https://spice.ai/login).
- **Spice → Spice (self-hosted)** — federate to another Spice runtime running anywhere reachable over the network. The most common pattern is a **cluster-sidecar**: a thin Spice runtime co-located with each application instance forwards queries to a heavier-weight upstream Spice (or a cluster of them) that owns the data and acceleration.

Both architectures use the same `spice.ai` (or legacy `spiceai`) `from:` URI scheme; the difference is in the URI format and the `endpoint` parameter.

## Quick start

### Spice → Spice Cloud Platform

```yaml
datasets:
  - from: spice.ai/spiceai/quickstart/datasets/taxi_trips
    name: taxi_trips
    params:
      spiceai_api_key: ${secrets:SPICEAI_API_KEY}
      spiceai_region: us-east-1
```

`spice login` writes the API key to `~/.spice/auth` and exposes it as `SPICEAI_API_KEY` via the [env secret store](../secret-stores/env/). The `spiceai_region` parameter selects the Spice Cloud region the API key was created in.

### Spice → Spice (self-hosted, cluster-sidecar)

```yaml
datasets:
  - from: spice.ai:http://upstream-spice.internal:50051
    name: orders                          # table name on the upstream runtime
    params:
      spiceai_api_key: ${secrets:UPSTREAM_API_KEY}   # match runtime.auth.api-key on upstream
```

The local sidecar Spice now exposes `orders` as if it were a local dataset, federating every query to `upstream-spice.internal:50051`. Combine with `acceleration.enabled: true` to cache hot data at the sidecar.

## Configuration

### `from:` URI formats

| URI                                                    | Mode       | Notes                                                                             |
| ------------------------------------------------------ | ---------- | --------------------------------------------------------------------------------- |
| `spice.ai/<org>/<app>/datasets/<dataset>`              | Cloud      | Path-style. Most common.                                                          |
| `spice.ai:<org>/<app>/datasets/<dataset>`              | Cloud      | Colon-style. Equivalent to the path-style form.                                   |
| `spice.ai://<org>/<app>/datasets/<dataset>`            | Cloud      | URL-style. Equivalent.                                                            |
| `spice.ai/<table>`                                     | Cloud      | Short form when the dataset isn't under a 4-segment `<org>/<app>/datasets/...` path. |
| `spice.ai:http://<host>:<port>`                        | Self-hosted| Connects without TLS. The local dataset's `name:` field is the upstream table name. |
| `spice.ai:https://<host>:<port>`                       | Self-hosted| TLS-encrypted Flight.                                                              |
| `spice.ai:grpc+tls://<host>:<port>`                    | Self-hosted| TLS-encrypted Flight (alias for `https://`).                                       |

The legacy `spiceai:` prefix (without the dot) is accepted in every form above for backward compatibility.

:::note `grpc://` is not supported
Plain `grpc://` (without TLS) is rejected at startup. Use `http://` for unencrypted connections to a local sidecar, or `https://` / `grpc+tls://` for production.
:::

### Parameters

| Parameter                         | Default                              | Description                                                                                                                                                       |
| --------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spiceai_api_key`                 | None                                 | API key. **Required** for Cloud. Optional for self-hosted (omit for anonymous; supply to match the upstream's `runtime.auth.api-key.keys`). Use `${secrets:...}`. |
| `spiceai_token`                   | None                                 | Legacy alias for `spiceai_api_key`. Prefer `spiceai_api_key` in new configurations.                                                                                |
| `spiceai_region`                  | None                                 | Cloud region (e.g. `us-east-1`). **Required** when targeting Cloud without an explicit `spiceai_endpoint`. Used to build `https://<region>-prod-aws-flight.spiceai.io`. |
| `spiceai_endpoint`                | Built from `spiceai_region` (Cloud)  | Override the Flight endpoint URL. Use for VPC / regional Cloud endpoints, or to point at a self-hosted Spice runtime. Schemes: `http://`, `https://`, `grpc+tls://`. |
| `spiceai_flight_endpoint`         | None                                 | Legacy alias for `spiceai_endpoint`.                                                                                                                              |
| `spiceai_tls_ca_certificate_file` | System cert store                    | Path to a CA certificate file (PEM) to verify a self-hosted upstream that uses a private CA. Ignored for `http://` endpoints.                                     |
| `spiceai_tls_client_certificate_file` | None                            | Path to a PEM client certificate chain for mutual TLS (mTLS). Must be set together with `spiceai_tls_client_key_file`. Mutually exclusive with `spiceai_tls_client_certificate`. |
| `spiceai_tls_client_key_file`     | None                                 | Path to the PEM private key matching `spiceai_tls_client_certificate_file`. Must be set together with `spiceai_tls_client_certificate_file`. Mutually exclusive with `spiceai_tls_client_key`. |
| `spiceai_tls_client_certificate`  | None                                 | Inline PEM client certificate chain for mutual TLS (mTLS). Use the [secret replacement syntax](../secret-stores/) to load from a secret store, e.g. `${secrets:my_cert}`. Must be set together with `spiceai_tls_client_key`. Mutually exclusive with `spiceai_tls_client_certificate_file`. |
| `spiceai_tls_client_key`          | None                                 | Inline PEM private key for mutual TLS (mTLS). Use the [secret replacement syntax](../secret-stores/) to load from a secret store, e.g. `${secrets:my_key}`. Must be set together with `spiceai_tls_client_certificate`. Mutually exclusive with `spiceai_tls_client_key_file`. |

#### Endpoint resolution order

The connector picks a Flight endpoint in this order:

1. `spiceai_endpoint` (or its legacy alias `spiceai_flight_endpoint`).
2. The URI in `from:` if it begins with `http://`, `https://`, or `grpc+tls://` (self-hosted forms).
3. `https://<spiceai_region>-prod-aws-flight.spiceai.io` (Cloud, regional).

The legacy `https://flight.spiceai.io` host is rewritten to the regional URL automatically. If both `spiceai_endpoint` and `spiceai_region` are set and they refer to different Cloud regions, the runtime fails fast with a region-mismatch error. For self-hosted endpoints, `spiceai_region` is not validated.

### `name`

The dataset name as exposed on the local runtime. The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords).

For self-hosted (`spice.ai:http://...`) `from:` URIs, the connector uses **the `name:` value as the upstream table reference** — so `name: orders` queries the `orders` table on the upstream Spice runtime. For Cloud `from:` URIs, the table reference is parsed from the path.

## Spice → Spice Cloud Platform

### Authentication

API keys are issued in the [Spice.ai Console](https://spice.ai). The `spice login` CLI command writes the active key to a local `.env` file via the [env secret store](../secret-stores/env/), making it available as `SPICEAI_API_KEY` in spicepod parameters:

```yaml
params:
  spiceai_api_key: ${secrets:SPICEAI_API_KEY}
```

For production, prefer a managed [secret store](../secret-stores/) (Kubernetes Secrets, AWS Secrets Manager, HashiCorp Vault) over the env file. API keys do not expire — rotate manually via the Console and update the secret store.

### Region & endpoint

`spiceai_region` is required when targeting Cloud without an explicit endpoint. Spice builds the regional Flight URL automatically:

```yaml
params:
  spiceai_api_key: ${secrets:SPICEAI_API_KEY}
  spiceai_region: us-east-1
```

For VPC-peered or otherwise-routed Cloud endpoints, set `spiceai_endpoint` explicitly. The endpoint must match `spiceai_region` if it's a recognized Cloud regional URL.

### Cloud example

```yaml
datasets:
  - from: spice.ai/spiceai/tpch/datasets/customer
    name: tpch.customer
    params:
      spiceai_api_key: ${secrets:SPICEAI_API_KEY}
      spiceai_region: us-east-1
    acceleration:
      enabled: true
```

## Spice → Spice (self-hosted federation)

The same connector federates queries to **any** Spice runtime that exposes Arrow Flight on a network endpoint. The most common pattern is a **cluster sidecar**: each application pod runs a small Spice runtime that owns no data but forwards queries to a heavier upstream Spice that owns the acceleration. The sidecar adds local caching, in-process auth, and protocol translation (HTTP / OpenAPI / MCP / gRPC) without each app needing direct access to the upstream cluster.

### When to use it

- **Cluster sidecar**: per-pod Spice next to each application instance, federating to a central cluster Spice. The sidecar handles in-process queries; the cluster Spice handles refresh and storage.
- **Edge → core federation**: edge Spice runtimes accelerate local datasets and federate the long-tail to a core Spice in the data center.
- **Multi-region read replicas**: regional Spice instances replicate hot datasets and federate cold ones to a central runtime.

### Authentication

If the upstream runtime has API key authentication enabled (`runtime.auth.api-key.keys`), set `spiceai_api_key` to a key listed there. The connector sends it via Flight handshake using HTTP Basic — the upstream's `BasicAuthLayer` validates the key and issues a Bearer token for subsequent calls.

```yaml
# Upstream runtime spicepod.yaml
runtime:
  auth:
    api-key:
      enabled: true
      keys:
        - ${secrets:SIDECAR_API_KEY}
```

```yaml
# Sidecar runtime spicepod.yaml
datasets:
  - from: spice.ai:https://upstream.cluster.svc:50051
    name: events
    params:
      spiceai_api_key: ${secrets:SIDECAR_API_KEY}
```

If the upstream has no auth, omit `spiceai_api_key` — the connector falls back to anonymous credentials.

### TLS and private CAs

Production-grade self-hosted federation should use TLS (`https://` or `grpc+tls://`). By default the connector trusts the system certificate store. To pin a private CA — common in cluster-internal deployments with a self-signed or internal-PKI CA:

```yaml
params:
  spiceai_tls_ca_certificate_file: /etc/spice/upstream-ca.pem
```

For local development and trusted internal networks, `http://` (no TLS) is also supported and avoids cert configuration entirely.

### Mutual TLS (mTLS)

When the upstream Spice runtime enforces mutual TLS (e.g. `runtime.tls.client_auth_mode: required`), the connector can present a client certificate during the handshake. Configure it in one of two mutually exclusive forms:

**File-based** — point at PEM files on disk:

```yaml
params:
  spiceai_endpoint: grpc+tls://upstream.cluster.svc:50051
  spiceai_tls_ca_certificate_file: /etc/spice/clients/server-ca.pem
  spiceai_tls_client_certificate_file: /etc/spice/clients/client.pem
  spiceai_tls_client_key_file: /etc/spice/clients/client.key
```

**Inline** — supply PEM material directly, typically from a [secret store](../secret-stores/):

```yaml
params:
  spiceai_endpoint: grpc+tls://upstream.cluster.svc:50051
  spiceai_tls_client_certificate: ${secrets:CLIENT_CERT_PEM}
  spiceai_tls_client_key: ${secrets:CLIENT_KEY_PEM}
```

Within each form, cert and key must be set together — setting only one is rejected at dataset-load time with a clear error naming both fields. The file-based and inline forms are mutually exclusive; mixing them is also rejected.

The cached Flight `Channel` is built once at dataset-load time, so certificate rotation requires a runtime restart.

### Append streams (real-time CDC)

The connector advertises [`supports_append_stream`](../../features/cdc/) — when the upstream Spice exposes a dataset with append-stream support, the sidecar can subscribe over Flight `DoExchange` and receive each new batch as soon as the upstream emits it. Enable on the sidecar via `refresh_mode: append` on an accelerated dataset:

```yaml
datasets:
  - from: spice.ai:https://upstream.cluster.svc:50051
    name: events
    params:
      spiceai_api_key: ${secrets:SIDECAR_API_KEY}
    acceleration:
      enabled: true
      refresh_mode: append
```

Append streams are **append-only** — deletes and updates from the upstream are not propagated. Stream reconnection is automatic; persistent loss of connection causes the dataset to enter `Error` state if the lag exceeds the configured acceptable window. See [Data Refresh](../../features/data-acceleration/data-refresh) for the full append-mode reference.

### Sidecar example

A sidecar Spice running alongside an application, federating to a cluster Spice over TLS with API key auth and local in-memory acceleration:

```yaml
version: v1
kind: Spicepod
name: app-sidecar

datasets:
  - from: spice.ai:https://upstream.cluster.svc:50051
    name: orders
    params:
      spiceai_api_key: ${secrets:SIDECAR_API_KEY}
    acceleration:
      enabled: true
      refresh_mode: append
      refresh_check_interval: 30s

  - from: spice.ai:https://upstream.cluster.svc:50051
    name: customers
    params:
      spiceai_api_key: ${secrets:SIDECAR_API_KEY}
    acceleration:
      enabled: true
      refresh_mode: full
      refresh_check_interval: 5m
```

### Local development sidecar

To run a sidecar against a local Spice without TLS:

```yaml
datasets:
  - from: spice.ai:http://localhost:50051
    name: events
```

`localhost` and loopback addresses are accepted with `http://` for development.

## Cookbook

- [Spice.ai Cloud Platform Data Connector](https://github.com/spiceai/cookbook/tree/trunk/spiceai#readme) — end-to-end Cloud connection.

## Limitations

- **Read-only.** The connector does not support `INSERT`/`UPDATE`/`DELETE` against Cloud or self-hosted upstreams. Writes happen on the upstream runtime (or via the Spice CLI / Console for Cloud).
- **Single endpoint per dataset.** Multi-endpoint failover must be handled at the load-balancer / DNS layer.
- **API key auth only.** OIDC / SSO is not supported at the data-plane connector. Use API keys for both Cloud and self-hosted federation.
- **Append-only changes stream.** Updates and deletes from the upstream are not propagated; rely on `refresh_mode: full` for datasets that mutate.
- **Cloud connections cap at 1000 requests per connection.** When the cap is hit the connection is reset; the Flight client retries automatically. If you see `Connection is reset by the server. Please retry the request.` or the `spiceai-retryable` metadata, the query has been retried already.
- **`grpc://` (without TLS) is rejected.** Use `http://` for clear-text or `https://` / `grpc+tls://` for TLS.

:::warning Memory considerations
Without `acceleration.enabled: true`, federated queries that join across multiple Spice instances perform the join in memory on the local runtime. Ensure the local runtime has enough memory for query workspace plus runtime overhead, especially for concurrent queries.

For large workloads, accelerate hot datasets locally with a file-mode engine ([`duckdb`](../data-accelerators/duckdb) or [`sqlite`](../data-accelerators/sqlite) with `mode: file`) to spill to disk instead of RAM.
:::
