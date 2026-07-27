---
title: 'Spice.ai Data Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the Spice.ai connector in production: API keys, Flight endpoints, message sizing, sidecar topology, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - spiceai
  - observability
---

Production operating guide for the [Spice.ai Data Connector](./index.md), covering both the **Spice → Spice Cloud Platform** and **Spice → Spice (self-hosted / cluster-sidecar)** topologies. The connector uses [Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) over gRPC for both.

## Topology decision

| Use case                                                           | Topology               | Endpoint                                         |
| ------------------------------------------------------------------ | ---------------------- | ------------------------------------------------ |
| Federate datasets hosted on the managed Spice.ai Cloud Platform     | Spice → Spice Cloud    | `https://<region>-prod-aws-flight.spiceai.io` (auto) |
| Per-pod sidecar federating to a heavier upstream Spice runtime      | Spice → Spice (sidecar)| `https://upstream.cluster.svc:50051`             |
| Edge runtime federating cold queries to a core Spice                | Spice → Spice          | Cluster-internal `https://...`                   |
| Local development against a Spice on `localhost`                    | Spice → Spice          | `http://localhost:50051`                          |

Both topologies use the same `spiceai`-prefixed parameters and the same `spice.ai:` `from:` URI scheme. See the [connector reference](./index.md#configuration) for the full parameter list and URI formats.

## Authentication & Secrets

The connector authenticates to the upstream Spice runtime using `spiceai_api_key`. The same parameter covers both Cloud and self-hosted upstreams:

| Topology     | Source of the key                                        | Required?                |
| ------------ | -------------------------------------------------------- | ------------------------ |
| Cloud        | Spice.ai Console; written to `.env` by `spice login`     | Yes                      |
| Self-hosted  | Listed in the upstream's `runtime.auth.api-key.keys`     | Only if upstream has auth enabled (otherwise anonymous) |

| Parameter                         | Description                                                                                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `spiceai_api_key`                 | API key. Resolved from any [secret store](../../secret-stores/) via `${secrets:...}`.                                                                              |
| `spiceai_token`                   | Legacy alias for `spiceai_api_key`.                                                                                                                                |
| `spiceai_region`                  | Cloud region (e.g. `us-east-1`). Required for Cloud unless `spiceai_endpoint` is set.                                                                              |
| `spiceai_endpoint`                | Override the Flight endpoint URL. Schemes: `http://`, `https://`, `grpc+tls://`.                                                                                   |
| `spiceai_flight_endpoint`         | Legacy alias for `spiceai_endpoint`.                                                                                                                               |
| `spiceai_tls_ca_certificate_file` | Path to a CA PEM file for verifying a self-hosted upstream that uses a private CA. Ignored for `http://` endpoints.                                                |
| `spiceai_tls_client_certificate_file` | Path to a PEM client certificate chain for mutual TLS (mTLS). Must be set together with `spiceai_tls_client_key_file`. Mutually exclusive with `spiceai_tls_client_certificate`. |
| `spiceai_tls_client_key_file`     | Path to the PEM private key matching `spiceai_tls_client_certificate_file`. Must be set together with `spiceai_tls_client_certificate_file`. Mutually exclusive with `spiceai_tls_client_key`. |
| `spiceai_tls_client_certificate`  | Inline PEM client certificate chain for mutual TLS (mTLS). Resolve from a [secret store](../../secret-stores/) via `${secrets:...}`. Must be set together with `spiceai_tls_client_key`. Mutually exclusive with `spiceai_tls_client_certificate_file`. |
| `spiceai_tls_client_key`          | Inline PEM private key for mutual TLS (mTLS). Resolve from a [secret store](../../secret-stores/) via `${secrets:...}`. Must be set together with `spiceai_tls_client_certificate`. Mutually exclusive with `spiceai_tls_client_key_file`. |

Always source production keys from a managed secret store rather than from a checked-in `.env` file. API keys do not expire — rotate manually in the issuing system and update the secret store. Secret stores that support live reload (Kubernetes, Vault) pick up rotations without restarting the runtime.

## Resilience Controls

### Endpoint Verification

On startup the connector performs a DNS + TCP reachability check against the resolved endpoint before attempting a Flight handshake. Misconfigured endpoints surface as actionable startup errors rather than slow-failure query errors.

### Flight Transport

Data transfer uses Arrow Flight over gRPC. Transient gRPC errors (`UNAVAILABLE`, `DEADLINE_EXCEEDED`) surface to the caller; retries are handled by the Flight client's default policy.

For self-hosted upstreams, prefer `https://` or `grpc+tls://` in production. `http://` is supported for local development and trusted networks but transmits Flight payloads unencrypted. Plain `grpc://` is rejected at startup.

### TLS and private CAs

By default the connector trusts the system certificate store. For cluster-internal upstreams that present a private-CA-signed certificate, pin the CA explicitly:

```yaml
params:
  spiceai_endpoint: https://upstream.cluster.svc:50051
  spiceai_tls_ca_certificate_file: /etc/spice/upstream-ca.pem
```

The CA file is loaded once at startup; updates require a runtime restart. Mount it via Kubernetes ConfigMap or Secret in containerized deployments.

### Mutual TLS (mTLS)

When the upstream Spice runtime enforces mutual TLS (e.g. `runtime.tls.client_auth_mode: required`), the connector presents a client certificate during the handshake. Configure it as PEM files mounted into the pod, or as inline PEM material from a managed secret store:

```yaml
# File-based
params:
  spiceai_endpoint: grpc+tls://upstream.cluster.svc:50051
  spiceai_tls_ca_certificate_file: /etc/spice/clients/server-ca.pem
  spiceai_tls_client_certificate_file: /etc/spice/clients/client.pem
  spiceai_tls_client_key_file: /etc/spice/clients/client.key
```

```yaml
# Inline / secrets
params:
  spiceai_endpoint: grpc+tls://upstream.cluster.svc:50051
  spiceai_tls_client_certificate: ${secrets:CLIENT_CERT_PEM}
  spiceai_tls_client_key: ${secrets:CLIENT_KEY_PEM}
```

Certificate and key must be set as a pair within each form, and the file-based and inline forms are mutually exclusive. The cached Flight `Channel` is built once at dataset-load time, so cert rotation requires a runtime restart.

### Append Streams

The connector supports long-lived append streams for real-time CDC. The upstream — whether Cloud or self-hosted — must expose a dataset with append-stream support. The sidecar subscribes over Flight `DoExchange` and receives each new batch as soon as it's emitted. Stream reconnection is automatic; persistent loss of connection causes the dataset to enter `Error` state if the lag exceeds the acceptable window. See [Data Refresh](../../../features/data-acceleration/data-refresh).

Append streams are append-only — deletes and updates from the upstream are **not** propagated. Use `refresh_mode: full` for datasets that mutate.

## Capacity & Sizing

### Message Sizing

Arrow Flight record batches can be large for wide or dense schemas. Spice raises the gRPC message limit to `100MiB` by default (well above gRPC's built-in 4 MiB); raise it further with the runtime-level `runtime.flight.max_message_size` setting:

| Setting                           | Default  | Description                                                                                                                       |
| --------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `runtime.flight.max_message_size` | `100MiB` | Maximum inbound and outbound gRPC message size, applied to all Flight clients. Raise for wide result sets or many string columns. |

This is a runtime-level setting under `runtime.flight` (not a dataset connector parameter). Accepted units: `B`, `KB`, `MB`, `GB`. The same limit applies to the upstream's Flight server — raising it on the client without raising it on the server still fails.

### Network

#### Cloud topology

- Place the Spice runtime in a region geographically close to the Cloud Platform region (`spiceai_region`) to minimize round-trip latency.
- Expect typical round-trip latency in the tens of milliseconds plus result streaming time. For interactive dashboards, accelerate (`acceleration.enabled: true`) into a local engine.

#### Self-hosted / sidecar topology

- Run the sidecar **in the same network namespace or cluster** as the upstream when possible — Flight is most efficient over single-digit-millisecond RTT.
- Size sidecar memory for the local query workspace plus any in-memory acceleration. The sidecar does not need to be sized for the full dataset — only for hot data accelerated locally and the working set of in-flight queries.
- Use a Kubernetes `Service` (with stable DNS) or a load balancer in front of multi-replica upstreams. Connection pooling is per-endpoint URL.

### API key lifetime

API keys do not expire. Rotation is manual; coordinate with the secret store used by the runtime.

## Sidecar deployment patterns

### Per-pod sidecar (Kubernetes)

Co-locate a Spice sidecar with each application pod. The sidecar terminates HTTP / OpenAPI / MCP / gRPC for the app and federates queries to a central upstream Spice cluster.

```yaml
# Sidecar spicepod.yaml mounted into each app pod
version: v1
kind: Spicepod
name: app-sidecar

runtime:
  http:
    bind_address: 127.0.0.1:8090   # localhost-only, sidecar talks to the app

datasets:
  - from: spice.ai:https://upstream-spice.spiceai.svc.cluster.local:50051
    name: orders
    params:
      spiceai_api_key: ${secrets:SIDECAR_API_KEY}
      spiceai_tls_ca_certificate_file: /etc/spice/cluster-ca.pem
    acceleration:
      enabled: true
      refresh_mode: append
      refresh_check_interval: 30s
```

The application talks to `127.0.0.1:8090`; the sidecar handles federation and caching. The upstream runs as a `Deployment` or `StatefulSet` with persistent storage for the acceleration files.

### Edge → core federation

Edge Spice runtimes accelerate local datasets and federate the long-tail to a core Spice in the data center. The same connector is used; the difference is that edge runtimes have their own non-federated datasets too:

```yaml
datasets:
  - from: postgres:public.local_orders        # local, accelerated
    name: local_orders
    acceleration:
      enabled: true

  - from: spice.ai:https://core.example.com:50051   # federated
    name: historical_orders
```

## Metrics

The Flight client is not instrumented, so this connector emits no transport-level metrics, and it does not currently register Spice.ai-specific dataset-level instruments. Monitor the connector via:

- Query execution metrics (`query_duration_ms`, `query_returned_rows`, `query_failures`) from `runtime.metrics`.
- Acceleration refresh metrics when the dataset is accelerated (`dataset_acceleration_refresh_duration_ms`, `dataset_acceleration_refresh_errors`).
- For Cloud: upstream Console metrics on the source dataset.
- For self-hosted: monitor the upstream's own `runtime.metrics` and acceleration metrics.

See [Component Metrics](../../../features/observability/component_metrics) for general configuration.

## Task History

Queries to the upstream Spice runtime participate in [task history](../../../reference/task_history) via Flight client spans. Each Flight request is recorded as a child of the enclosing `sql_query` or `accelerated_table_refresh` task. The upstream runtime records its own task history independently — correlate by request timestamps or by propagated trace IDs.

## Known Limitations

- **Read-only.** The connector does not write to the upstream. Cloud writes go through the Spice CLI / Console; self-hosted writes happen on the upstream runtime directly.
- **Single endpoint per dataset.** A dataset binds to a single endpoint URL. Multi-endpoint failover lives at the load-balancer / DNS layer.
- **API key auth only.** OIDC / SSO is not supported at the data-plane connector.
- **Append-only changes stream.** Updates and deletes are not propagated.
- **Cloud connections cap at 1000 requests per connection.** When the cap is hit the connection is reset; the Flight client retries automatically. The `spiceai-retryable` metadata flag indicates the retry path.
- **No `grpc://` (clear-text gRPC).** Use `http://` for unencrypted Flight or `https://` / `grpc+tls://` for TLS.

## Troubleshooting

| Symptom                                              | Likely cause                                                  | Resolution                                                                                                                          |
| ---------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `Failed to connect to SpiceAI endpoint`              | DNS, firewall, or TLS issue against the resolved endpoint.    | Verify DNS resolution and outbound 443/50051 connectivity. Test with `grpcurl -insecure <host>:<port> list`.                        |
| `UnsupportedEndpointScheme`                          | Endpoint uses `grpc://` or another unsupported scheme.        | Switch to `http://`, `https://`, or `grpc+tls://`.                                                                                  |
| `CloudEndpointRegionMismatch`                        | `spiceai_endpoint` is a Cloud regional URL but `spiceai_region` doesn't match. | Set both to the same region, or remove one and let Spice pick the other.                                                            |
| `UNAUTHENTICATED` on Flight handshake                | Invalid / expired / wrong-environment API key.                | For Cloud: regenerate in the Console; update the secret store. For self-hosted: confirm the key is in the upstream's `runtime.auth.api-key.keys`. |
| TLS handshake failure with self-signed upstream cert | System cert store doesn't trust the upstream CA.              | Set `spiceai_tls_ca_certificate_file` to the upstream's CA PEM, or have the upstream present a publicly-trusted certificate.        |
| `message size exceeded` / `ResourceExhausted`        | Row batch exceeds gRPC message limit.                         | Increase `runtime.flight.max_message_size` on both client and server, or narrow the query projection.                                              |
| Append stream stalled; acceleration lag climbing     | Network partition or upstream dataset paused.                 | Check upstream status; verify the source dataset is healthy; restart the runtime to re-establish the stream.                        |
| Sudden 5xx / `UNAVAILABLE` errors                    | Transient service-side issue.                                 | Flight client auto-retries; if persistent, check upstream runtime health (or the [Spice.ai status page](https://status.spice.ai)).  |
| `MissingRequiredParameter: api_key or token`         | Targeting a Cloud endpoint with no API key configured.        | Set `spiceai_api_key` (Cloud requires authentication; self-hosted endpoints accept anonymous if upstream auth is off).              |
