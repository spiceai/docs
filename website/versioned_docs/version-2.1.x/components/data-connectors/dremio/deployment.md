---
title: 'Dremio Data Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the Dremio data connector in production: authentication, Flight SQL transport, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - dremio
  - observability
---

Production operating guide for the Dremio data connector covering authentication, Flight SQL transport, and operational tuning.

## Authentication & Secrets

The Dremio connector connects over [Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html) with username/password authentication.

| Parameter              | Description                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| `dremio_endpoint`      | Flight SQL endpoint, e.g. `grpc+tls://dremio.internal:32010`.                                                   |
| `dremio_username`      | Dremio user.                                                                                                    |
| `dremio_password`      | Dremio password. Use `${secrets:...}` from a secret store.                                                      |

Use TLS endpoints (`grpc+tls://`) in production. Credentials must be sourced from a [secret store](../../secret-stores/).

## Resilience Controls

### Flight SQL Transport

Data transfer uses gRPC. Transient `UNAVAILABLE` / `DEADLINE_EXCEEDED` errors surface to the caller; the connector does not perform automatic retries, and no per-operation retry parameters are exposed at the Spice layer. Build retry/backoff into the calling application, or rely on Spice acceleration to reduce direct coordinator queries.

### Query Pushdown

Dremio is a federated engine; the connector pushes SQL predicates and projections into Dremio where possible. For heavy analytical joins, execute the join in Dremio (via a Dremio view) rather than pulling raw rows into Spice.

## Capacity & Sizing

- **Network**: Flight SQL is gRPC over HTTP/2. Co-locate Spice with Dremio for best latency.
- **Coordinator load**: Every Spice query opens a Flight ticket against a Dremio coordinator. For dashboard-heavy workloads, accelerate the dataset in Spice (`acceleration: enabled`) to offload repeat queries from the coordinator.
- **Result streaming**: Large result sets are streamed as Arrow record batches; memory footprint scales with the configured DataFusion batch size, not the result-set total.

## Metrics

Flight SQL transport metrics are collected via the shared Flight client instrumentation. The connector does not currently register Dremio-specific dataset-level instruments. Monitor via:

- Spice query execution metrics (`query_duration_ms`, `query_processed_rows`, `query_failures_total`) from `runtime.metrics`.
- Dremio's own job metrics exposed via the Dremio UI / API (`job_id` correlation).

See [Component Metrics](../../../features/observability/component_metrics) for configuration.

## Task History

Dremio queries participate in [task history](../../../reference/task_history) via Flight client spans. Each Flight request is captured as a child of the enclosing `sql_query` or `accelerated_table_refresh` task.

## Known Limitations

- **Temporary tables**: Dremio temporary objects are not visible to Spice; use Dremio views for shared logic.
- **Reflection-aware routing**: The connector does not explicitly hint Dremio reflections; they are still applied by the coordinator transparently.

## Troubleshooting

| Symptom                                     | Likely cause                                         | Resolution                                                                                        |
| ------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `UNAUTHENTICATED` on handshake              | Wrong or expired username/password credentials.      | Verify `dremio_username` and `dremio_password`; reset the credentials via the Dremio UI if needed. |
| `UNAVAILABLE` intermittent errors           | Network partition or coordinator restart.            | Errors surface to the caller; retry the request from the application and check coordinator health if persistent. |
| `PERMISSION_DENIED` on a specific dataset   | Dremio role lacks SELECT on the underlying source.   | Grant access in Dremio via the user/role management UI.                                           |
| Slow queries for repeated dashboards        | Coordinator overloaded by repeat queries.            | Enable Spice acceleration for the dataset to cache results locally.                               |
| TLS handshake failures                      | Self-signed cert or missing CA.                      | Configure TLS at the Flight client; ensure the CA bundle is trusted by the Spice runtime.         |
