---
title: 'Spice.ai Cloud Platform Data Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the Spice.ai Cloud Platform connector in production: API keys, Flight endpoints, message sizing, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - spiceai
  - observability
---

Production operating guide for the [Spice.ai Cloud Platform](https://spice.ai) data connector covering authentication, Arrow Flight transport, and operational tuning.

## Authentication & Secrets

The connector authenticates to the Spice.ai Cloud Platform using an API key supplied via the `spiceai_api_key` parameter. Endpoints default to the Spice.ai production cluster; override via `endpoint` for VPC or regional endpoints.

| Parameter              | Description                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| `spiceai_api_key`      | Spice.ai Cloud Platform API key. Use `${secrets:...}` to resolve from a configured secret store.                |
| `endpoint`             | Flight endpoint URL. Defaults to the production cluster. Override for VPC / regional endpoints.                 |

API keys must be sourced from a [secret store](../../secret-stores/) in production. Rotate keys from the Spice.ai Console and update the secret store without restarting the runtime if the secret store supports live reloads.

## Resilience Controls

### Endpoint Verification

On startup the connector performs a DNS + TCP reachability check against the configured `endpoint` before attempting a Flight handshake. This surfaces misconfigured endpoints as actionable startup errors rather than slow-failure query errors.

### Flight Transport

Data transfer uses [Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) over gRPC with TLS. Transient gRPC errors (`UNAVAILABLE`, `DEADLINE_EXCEEDED`) surface to the caller; retries are handled by the Flight client's default policy.

### Append Streams

The connector supports long-lived append streams (`supports_changes_stream`) for real-time CDC into accelerated datasets. Stream reconnection is handled automatically; loss of connection to the Cloud Platform results in the dataset being marked `Error` if the lag exceeds the configured acceptable window (see [Data Refresh](../../../features/data-acceleration/data-refresh))..

## Capacity & Sizing

### Message Sizing

Arrow Flight record batches may exceed the default gRPC 4 MiB message limit for wide or dense schemas. Control with:

| Parameter           | Default | Description                                                                                   |
| ------------------- | ------- | --------------------------------------------------------------------------------------------- |
| `max_message_size`  | `4MB`   | Maximum inbound gRPC message size. Raise for wide result sets or many string columns.          |

Set via Spice configuration or via environment at runtime startup. Accepted units: `B`, `KB`, `MB`, `GB`.

### Network

- The Spice.ai Cloud Platform is a managed service; place Spice runtime in a region geographically close to your Cloud Platform region to minimize round-trip latency.
- Expect typical query round-trip latency in the tens of milliseconds + result streaming time; for interactive dashboards, accelerate (`acceleration: enabled`) to cache into a local engine.

### Authentication Token Lifetime

API keys do not expire. Rotation is manual and must be coordinated via the secret store used by the runtime.

## Metrics

Flight transport metrics are collected via the shared Flight client instrumentation. The connector does not currently register Spice.ai-specific dataset-level instruments. Monitor the connector via:

- Query execution metrics (`query_duration_ms`, `query_processed_rows`, `query_failures_total`) from `runtime.metrics`.
- Acceleration refresh metrics when the dataset is accelerated (`refresh_last_duration_ms`, `refresh_errors_total`).
- Upstream Spice.ai Console metrics on the source dataset.

See [Component Metrics](../../../features/observability/component_metrics) for general configuration.

## Task History

Queries to the Spice.ai Cloud Platform participate in [task history](../../../reference/task_history) via the Flight client spans. Each Flight request is recorded as a child of the enclosing `sql_query` or `accelerated_table_refresh` task.

## Known Limitations

- **Read-only**: The connector is read-only; writes to the Cloud Platform are done via the Spice CLI / Console, not the runtime.
- **Single endpoint per dataset**: A dataset binds to a single `endpoint`. Multi-region failover must be handled at the load-balancer / DNS layer.
- **API key auth only**: OIDC / SSO is not currently supported at the data-plane connector.

## Troubleshooting

| Symptom                                             | Likely cause                                              | Resolution                                                                                                                  |
| --------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `Failed to connect to SpiceAI endpoint`             | DNS, firewall, or TLS issue against `endpoint`.           | Verify DNS resolution and outbound 443 connectivity. Test with `grpcurl -insecure <endpoint>:443 list`.                     |
| `UNAUTHENTICATED` on Flight handshake               | Invalid / expired / wrong-environment API key.            | Regenerate the key in the Spice.ai Console, update the secret store.                                                        |
| `message size exceeded` / `ResourceExhausted`       | Row batch exceeds gRPC message limit.                     | Increase `max_message_size`, or narrow the query projection.                                                                |
| Append stream stalled; acceleration lag climbing    | Network partition or upstream dataset paused.             | Check Cloud Platform status; verify the source dataset is healthy; restart the runtime to re-establish the stream.          |
| Sudden 5xx / `UNAVAILABLE` errors                   | Transient service-side issue.                             | Flight client auto-retries; if persistent, check Spice.ai status page.                                                      |
