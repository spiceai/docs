---
title: 'Observability & Monitoring'
sidebar_label: 'Observability'
description: 'Monitor Spice with Prometheus metrics, OpenTelemetry, and distributed tracing.'
sidebar_position: 14
pagination_prev: null
pagination_next: null
---

Spice provides monitoring and observability through three mechanisms:

- **Prometheus-compatible metrics endpoint**: Exposes metrics in the [Prometheus exposition format](https://prometheus.io/docs/instrumenting/exposition_formats/#basic-info) for scraping by monitoring systems like [Datadog](https://www.datadoghq.com/), [New Relic](https://newrelic.com/), and [Chronosphere](https://chronosphere.io/).
- **OpenTelemetry metrics export**: Pushes metrics to an [OpenTelemetry](https://opentelemetry.io/) collector using gRPC.
- **Distributed tracing**: Integrates with [Zipkin](https://zipkin.io/) and compatible tracing systems for request tracing.

<img width="740" alt="observability" src="https://github.com/user-attachments/assets/2468e3e7-4fb4-4a74-8b26-45eeeee90310" />

### Monitoring Integrations

- [Datadog](../monitoring/datadog)
- [Grafana & Prometheus](../monitoring/grafana)
- [New Relic](../monitoring/new-relic)
- [Zipkin](../monitoring/zipkin)

## Prometheus Metrics Endpoint

Spice exposes a Prometheus-compatible metrics endpoint that monitoring systems can scrape. The endpoint serves metrics in the [Prometheus exposition format](https://prometheus.io/docs/instrumenting/exposition_formats/), which is supported by most enterprise monitoring platforms including Datadog, New Relic, Chronosphere, Grafana Cloud, and others.

### Default Configuration

The metrics endpoint listens on port `9090` by default. The endpoint address is logged at startup:

```bash
2024-11-28T19:48:10.942003Z  INFO runtime::metrics_server: Spice Runtime Metrics listening on 127.0.0.1:9090
```

### Custom Port Binding

Use the `--metrics` flag to bind to a specific address and port:

```bash
spiced --metrics 0.0.0.0:9091
```

For Docker deployments:

```Dockerfile
FROM spiceai/spiceai:latest

CMD ["--metrics", "0.0.0.0:9090"]
EXPOSE 9090
```

### Verifying the Endpoint

Verify the metrics endpoint is working with a GET request:

```bash
curl http://localhost:9090/metrics

# HELP runtime_flight_server_started Indicates the runtime Flight server has started.
# TYPE runtime_flight_server_started counter
runtime_flight_server_started 1
# HELP runtime_http_server_started Indicates the runtime HTTP server has started.
# TYPE runtime_http_server_started counter
runtime_http_server_started 1

# HELP dataset_load_state Status of the dataset. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.
# TYPE dataset_load_state gauge
dataset_load_state{dataset="taxi_trips"} 2
dataset_load_state{dataset="taxi_trips_accelerated"} 2

# HELP dataset_active_count Number of currently loaded datasets.
# TYPE dataset_active_count gauge
dataset_active_count{engine="None"} 1
dataset_active_count{engine="duckdb"} 1
...
```

## OpenTelemetry Metrics Exporter

Spice can push metrics to an [OpenTelemetry](https://opentelemetry.io/) collector, enabling integration with platforms such as [Jaeger](https://www.jaegertracing.io/), [New Relic](https://newrelic.com/), [Honeycomb](https://www.honeycomb.io/), and other OpenTelemetry-compatible backends.

### Configuration

Configure the OpenTelemetry exporter in `spicepod.yaml` under `runtime.telemetry.otel_exporter`:

| Parameter       | Required | Default | Description                                                                                                                                                                                                 |
| --------------- | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`       | No       | `true`  | Whether the OpenTelemetry exporter is enabled.                                                                                                                                                              |
| `endpoint`      | Yes      | -       | The OpenTelemetry collector endpoint. Protocol (gRPC or HTTP) is inferred from the format.                                                                                                                  |
| `push_interval` | No       | `60s`   | How frequently metrics are pushed to the collector.                                                                                                                                                         |
| `metrics`       | No       | `[]`    | List of metric names to export. When empty, all metrics are exported.                                                                                                                                       |
| `headers`       | No       | `{}`    | Map of headers to send with each export request. For HTTP: sent as HTTP headers. For gRPC: sent as metadata entries (keys must be lowercase ASCII). Values support the `${secrets:...}` replacement syntax. |

### Protocol

Spice infers the OTLP protocol from the `endpoint` format:

- **gRPC** — bare host:port with no scheme (e.g. `localhost:4317`). Default port: `4317`.
- **HTTP** — includes the `http://` or `https://` scheme and ends in `/v1/metrics` (e.g. `http://localhost:4318/v1/metrics`, `https://otlp.us3.datadoghq.com/v1/metrics`). Default port: `4318`.

### Authentication

For collectors that require authentication (Datadog, Grafana Cloud, New Relic, Honeycomb, etc.), set the `headers` map. Secret values should be loaded from a [supported secret store](../components/secret-stores) using the `${secrets:...}` [replacement syntax](../components/secret-stores#using-secrets) rather than committed to source:

```yaml
runtime:
  telemetry:
    otel_exporter:
      endpoint: 'https://otlp.example.com/v1/metrics'
      headers:
        Authorization: 'Bearer ${secrets:otlp_token}'
```

:::tip gRPC metadata keys must be lowercase
When exporting over gRPC, header keys are sent as gRPC metadata and **must be lowercase ASCII** — use `authorization`, not `Authorization`. The runtime fails fast at startup if any gRPC metadata key is invalid. HTTP exports preserve the casing you provide.
:::

### Examples

#### Local gRPC collector

```yaml
runtime:
  telemetry:
    enabled: true
    otel_exporter:
      endpoint: 'localhost:4317'
      push_interval: '30s'
```

#### Local HTTP collector

```yaml
runtime:
  telemetry:
    enabled: true
    otel_exporter:
      endpoint: 'http://localhost:4318/v1/metrics'
      push_interval: '30s'
```

#### Datadog (OTLP/HTTP)

Replace `us3` with your Datadog site (`us3`, `us5`, `eu`, `ap1`, etc.) and store the API key in a secret store:

```yaml
runtime:
  telemetry:
    enabled: true
    otel_exporter:
      endpoint: 'https://otlp.us3.datadoghq.com/v1/metrics'
      push_interval: '30s'
      headers:
        DD-API-KEY: ${secrets:dd_api_key}
```

Equivalent standard OTLP environment-variable form (for cross-reference):

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT="https://otlp.us3.datadoghq.com"
export OTEL_EXPORTER_OTLP_HEADERS="DD-API-KEY=${DD_API_KEY}"
```

For a complete Datadog setup including metric prefixing and custom tags via OTLP resource attributes, see the [Datadog monitoring guide](/docs/next/monitoring/datadog#opentelemetry-otlp-export).

#### Grafana Cloud (OTLP/HTTP)

Grafana Cloud's OTLP gateway expects HTTP Basic authentication. Obtain the base64-encoded `instanceID:accessPolicyToken` credential from the Grafana Cloud "OpenTelemetry" connection page and store it in a secret:

```yaml
runtime:
  telemetry:
    enabled: true
    otel_exporter:
      endpoint: 'https://otlp-gateway-us-central2.grafana.net/otlp/v1/metrics'
      push_interval: '30s'
      headers:
        Authorization: 'Basic ${secrets:grafana_cloud_auth}'
```

Equivalent standard OTLP environment-variable form (for cross-reference):

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT="https://otlp-gateway-us-central2.grafana.net/otlp"
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic ${GRAFANA_CLOUD_AUTH}"
```

Match the region in the URL to your Grafana Cloud stack (`us-central2`, `eu-west-2`, `prod-ap-south-0`, etc.).

#### gRPC collector with auth metadata

```yaml
runtime:
  telemetry:
    enabled: true
    otel_exporter:
      endpoint: 'otel-collector.internal:4317'
      push_interval: '30s'
      headers:
        # Keys MUST be lowercase for gRPC
        api-key: ${secrets:collector_api_key}
```

## Metric Naming and Custom Tags

Two runtime fields control how exported metrics are named and labeled across **all** readers (Prometheus scrape, cluster OTLP reader, and the `otel_exporter` push exporter):

- [`runtime.telemetry.metric_prefix`](/docs/next/reference/spicepod/runtime#runtimetelemetrymetric_prefix) — prepends a string to every metric name (e.g. `spiceai.query_duration_ms`). Useful for namespacing in shared backends.
- [`runtime.telemetry.properties`](/docs/next/reference/spicepod/runtime#runtimetelemetryproperties) — attaches custom key/value attributes as OpenTelemetry resource attributes, which most backends surface as dimensions or tags.

```yaml
runtime:
  telemetry:
    metric_prefix: 'spiceai.'
    properties:
      environment: prod
      region: us-west-2
      team: data-platform
```

Both fields apply to every exporter the runtime has enabled. See the [Datadog monitoring guide](/docs/next/monitoring/datadog#opentelemetry-otlp-export) for backend-specific notes (Datadog requires `dd-otel-metric-config` to map resource attributes to tags).

### Metric Filtering

To export only specific metrics, use the `metrics` parameter:

```yaml
runtime:
  telemetry:
    enabled: true
    otel_exporter:
      endpoint: 'localhost:4317'
      metrics:
        - query_duration_ms
        - query_executions
        - dataset_load_state
```

When `metrics` is empty or omitted, all available metrics are exported.

:::caution Filtering happens after `metric_prefix` is applied
The whitelist is matched against the **final** metric name, after `runtime.telemetry.metric_prefix` has been prepended. If you set `metric_prefix: 'spiceai.'`, the entries under `metrics:` must include the prefix (e.g. `spiceai.query_duration_ms`), otherwise nothing will match and no metrics will be exported.
:::

For full configuration details, see the [runtime.telemetry reference](../reference/spicepod/runtime#runtimetelemetry).

## Available Metrics

Spice exposes the following metrics. The **Dimensions** column lists labels available for filtering and aggregation; `—` indicates the metric is emitted without dimensions. Dimensions annotated _(request context)_ expand to: `protocol`, `client`, `client_version`, `client_system`, `user_agent`, `runtime`, `runtime_version`, `runtime_system` (individual labels are only emitted when the corresponding request attribute is present).

| Metric                                                                                                                                                                                                                              | Type        | Dimensions                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------- |
| `accelerated_ready_state_federated_fallback`<br/><br/>Number of times the federated table was queried due to the accelerated table loading the initial data.                                                                 | _count_     | `dataset_name`                                                                                              |
| `accelerated_zero_results_federated_fallback`<br/><br/>Number of times the federated table was queried due to the accelerated table returning zero results.                                                                  | _count_     | `dataset_name`                                                                                              |
| `ai_inferences_with_spice_count`<br/><br/>AI Inferences with Spice count.                                                                                                                                                    | _count_     | `tools_used`                                                                                                |
| `catalog_load_errors`<br/><br/>Number of errors loading the catalog provider.                                                                                                                                                | _count_     | —                                                                                                           |
| `catalog_load_state`<br/><br/>Status of the catalog provider. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                    | _gauge_     | `catalog`                                                                                                   |
| `component_metric_registered_count`<br/><br/>Number of currently registered component metrics.                                                                                                                               | _gauge_     | —                                                                                                           |
| `dataset_acceleration_ingestion_lag_ms`<br/><br/>Lag between the current wall-clock time and the maximum time_column value after the refresh operation, in milliseconds. [Disabled by default](../reference/spicepod/runtime#runtimemetrics) | _gauge_     | `dataset`, `mode`                                                                                           |
| `dataset_acceleration_last_refresh_unix_time_ms`<br/><br/>Unix timestamp in milliseconds when the last refresh completed. [Disabled by default](../reference/spicepod/runtime#runtimemetrics)                                     | _gauge_     | `dataset`                                                                                                   |
| `dataset_acceleration_max_timestamp_after_refresh_ms`<br/><br/>Maximum value of the dataset's time_column after the refresh operation, in milliseconds. [Disabled by default](../reference/spicepod/runtime#runtimemetrics)  | _gauge_     | `dataset`, `mode`                                                                                           |
| `dataset_acceleration_max_timestamp_before_refresh_ms`<br/><br/>Maximum value of the dataset's time_column before the refresh operation, in milliseconds. [Disabled by default](../reference/spicepod/runtime#runtimemetrics) | _gauge_     | `dataset`, `mode`                                                                                           |
| `dataset_acceleration_refresh_data_fetches_skipped`<br/><br/>Number of refresh data fetches skipped due to unchanged file metadata.                                                                                          | _count_     | `dataset`, `mode`                                                                                           |
| `dataset_acceleration_refresh_duration_ms`<br/><br/>Duration in milliseconds to load a full or appended refresh data.                                                                                                        | _histogram_ | `dataset`, `mode`                                                                                           |
| `dataset_acceleration_refresh_errors`<br/><br/>Number of errors refreshing the dataset.                                                                                                                                      | _count_     | `dataset`, `mode`                                                                                           |
| `dataset_acceleration_refresh_lag_ms`<br/><br/>Difference between the maximum time_column value after and before the refresh operation, in milliseconds.                                                                     | _gauge_     | `dataset`, `mode`                                                                                           |
| `dataset_acceleration_refresh_rows_written`<br/><br/>Cumulative number of rows read from the federated source and written into the accelerated table.                                                                        | _count_     | `dataset`                                                                                                   |
| `dataset_acceleration_refresh_bytes_written`<br/><br/>Cumulative number of bytes (Arrow in-memory size) read from the federated source and written into the accelerated table.                                               | _count_     | `dataset`                                                                                                   |
| `dataset_acceleration_refresh_worker_panics`<br/><br/>Number of times a refresh worker panicked while refreshing a dataset.                                                                                                  | _count_     | `dataset`                                                                                                   |
| `dataset_acceleration_size_bytes`<br/><br/>Size of the accelerated table storage in bytes.                                                                                                                                   | _gauge_     | `dataset`                                                                                                   |
| `dataset_acceleration_snapshot_bootstrap_bytes`<br/><br/>Number of bytes downloaded when bootstrapping the acceleration from a snapshot.                                                                                     | _gauge_     | `dataset`                                                                                                   |
| `dataset_acceleration_snapshot_bootstrap_checksum`<br/><br/>Checksum of the snapshot downloaded during bootstrap (emitted with `checksum` attribute).                                                                         | _gauge_     | `dataset`, `checksum`                                                                                       |
| `dataset_acceleration_snapshot_bootstrap_duration_ms`<br/><br/>Time in milliseconds taken to download the snapshot used to bootstrap acceleration.                                                                           | _count_     | `dataset`                                                                                                   |
| `dataset_acceleration_snapshot_failure_count`<br/><br/>Number of failures encountered while writing snapshots.                                                                                                               | _count_     | `dataset`                                                                                                   |
| `dataset_acceleration_snapshot_write_bytes`<br/><br/>Number of bytes written for the most recent snapshot.                                                                                                                   | _gauge_     | `dataset`                                                                                                   |
| `dataset_acceleration_snapshot_write_checksum`<br/><br/>Checksum of the most recent snapshot write (emitted with `checksum` attribute).                                                                                      | _gauge_     | `dataset`, `checksum`                                                                                       |
| `dataset_acceleration_snapshot_write_duration_ms`<br/><br/>Time in milliseconds taken to write the latest snapshot to object storage.                                                                                        | _histogram_ | `dataset`                                                                                                   |
| `dataset_acceleration_snapshot_write_timestamp`<br/><br/>Unix timestamp (seconds) when the most recent snapshot write completed.                                                                                             | _gauge_     | `dataset`                                                                                                   |
| `dataset_active_count`<br/><br/>Number of currently loaded datasets.                                                                                                                                                         | _gauge_     | `engine`                                                                                                    |
| `dataset_load_errors`<br/><br/>Number of errors loading the dataset.                                                                                                                                                         | _count_     | —                                                                                                           |
| `dataset_load_state`<br/><br/>Status of the dataset. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                             | _gauge_     | `dataset`                                                                                                   |
| `dataset_unavailable_time_ms`<br/><br/>Time dataset went offline in milliseconds.                                                                                                                                            | _gauge_     | `dataset`                                                                                                   |
| `embeddings_active_count`<br/><br/>Number of currently loaded embeddings.                                                                                                                                                    | _gauge_     | `embeddings`, `source`                                                                                      |
| `embeddings_cache_evictions`<br/><br/>Number of cache evictions.                                                                                                                                                             | _count_     | —                                                                                                           |
| `embeddings_cache_hit_ratio`<br/><br/>Cache hit ratio (hits / total requests).                                                                                                                                               | _gauge_     | —                                                                                                           |
| `embeddings_cache_hits`<br/><br/>Cache hit count.                                                                                                                                                                            | _count_     | —                                                                                                           |
| `embeddings_cache_items_count`<br/><br/>Number of items currently in the cache.                                                                                                                                              | _gauge_     | —                                                                                                           |
| `embeddings_cache_max_size_bytes`<br/><br/>Maximum allowed size of the cache in bytes.                                                                                                                                       | _gauge_     | —                                                                                                           |
| `embeddings_cache_misses`<br/><br/>Cache miss count.                                                                                                                                                                         | _count_     | —                                                                                                           |
| `embeddings_cache_requests`<br/><br/>Number of requests to get a key from the cache.                                                                                                                                         | _count_     | —                                                                                                           |
| `embeddings_cache_size_bytes`<br/><br/>Size of the cache in bytes.                                                                                                                                                           | _gauge_     | —                                                                                                           |
| `embeddings_cache_stale_swr_count`<br/><br/>Number of stale-while-revalidate background refreshes skipped due to existing in-flight revalidation.                                                                            | _count_     | —                                                                                                           |
| `embeddings_cache_swr_background_query_count`<br/><br/>Number of background queries triggered for stale-while-revalidate cache refreshes.                                                                                    | _count_     | —                                                                                                           |
| `embeddings_failures`<br/><br/>Number of embedding failures.                                                                                                                                                                 | _count_     | `model`, `encoding_format`, `user`, `dimensions`                                                            |
| `embeddings_internal_request_duration_ms`<br/><br/>The duration of running an embedding(s) internally.                                                                                                                       | _histogram_ | `model`, `encoding_format`, `user`, `dimensions`                                                            |
| `embeddings_load_errors`<br/><br/>Number of errors loading the embedding.                                                                                                                                                    | _count_     | —                                                                                                           |
| `embeddings_load_state`<br/><br/>Status of the embedding. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                        | _gauge_     | `model`                                                                                                     |
| `embeddings_requests`<br/><br/>Number of embedding requests.                                                                                                                                                                 | _count_     | `model`, `encoding_format`, `user`, `dimensions`                                                            |
| `executor_assigned_partitions_count`<br/><br/>Number of acceleration partitions currently assigned to this executor in distributed query mode.                                                                                | _gauge_     | `node_id`, `dataset`                                                                                        |
| `executor_scheduler_active_connections`<br/><br/>Active control-stream connections from the executor to each scheduler (0 or 1 per scheduler).                                                                                | _gauge_     | `node_id`, `scheduler`                                                                                      |
| `executor_scheduler_connection_retries`<br/><br/>Reconnections initiated by the executor to a scheduler.                                                                                                                      | _count_     | `node_id`, `scheduler`                                                                                      |
| `flight_do_exchange_data_updates_sent`<br/><br/>Number of data updates sent via DoExchange.                                                                                                                                  | _count_     | —                                                                                                           |
| `flight_do_put_bytes_written`<br/><br/>Cumulative number of bytes (Arrow in-memory size) received and written via Flight DoPut.                                                                                              | _count_     | `dataset`                                                                                                   |
| `flight_do_put_rows_written`<br/><br/>Cumulative number of rows received and written via Flight DoPut.                                                                                                                       | _count_     | `dataset`                                                                                                   |
| `flight_request_duration_ms`<br/><br/>Measures the duration of Flight requests in milliseconds.                                                                                                                              | _histogram_ | `method`, `command`, _(request context)_                                                                    |
| `flight_requests`<br/><br/>Total number of Flight requests.                                                                                                                                                                  | _count_     | `method`, `command`, _(request context)_                                                                    |
| `http_requests`<br/><br/>Number of HTTP requests.                                                                                                                                                                            | _count_     | `method`, `path`, `status`, _(request context)_                                                             |
| `http_requests_duration_ms`<br/><br/>Measures the duration of HTTP requests in milliseconds.                                                                                                                                 | _histogram_ | `method`, `path`, `status`, _(request context)_                                                             |
| `llm_failures`<br/><br/>Number of LLM failures.                                                                                                                                                                              | _count_     | `model`, `stream`, `request_level_tools`, `tool_choice`, `user`, `metadata`, `responses_api`, `instructions` |
| `llm_internal_request_duration_ms`<br/><br/>The duration of running an LLM request internally.                                                                                                                               | _histogram_ | `model`, `stream`, `request_level_tools`, `tool_choice`, `user`, `metadata`, `responses_api`, `instructions` |
| `llm_load_state`<br/><br/>Status of the LLM model. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                               | _gauge_     | `model`                                                                                                     |
| `llm_requests`<br/><br/>Number of LLM requests.                                                                                                                                                                              | _count_     | `model`, `stream`, `request_level_tools`, `tool_choice`, `user`, `metadata`, `responses_api`, `instructions` |
| `model_active_count`<br/><br/>Number of currently loaded models.                                                                                                                                                             | _gauge_     | `model`, `source`                                                                                           |
| `model_load_duration_ms`<br/><br/>Duration in milliseconds to load the model.                                                                                                                                                | _histogram_ | —                                                                                                           |
| `model_load_errors`<br/><br/>Number of errors loading the model.                                                                                                                                                             | _count_     | —                                                                                                           |
| `model_load_state`<br/><br/>Status of the model. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                                 | _gauge_     | `model`                                                                                                     |
| `query_active_count`<br/><br/>Number of concurrent top-level queries actively being processed in the runtime.                                                                                                                | _histogram_ | `protocol` (one of `http`, `flight`, `flightsql`, `internal`)                                               |
| `query_duration_ms`<br/><br/>The total amount of time spent planning and executing queries in milliseconds.                                                                                                                  | _histogram_ | `tags`, `datasets`, _(request context)_                                                                     |
| `query_execution_duration_ms`<br/><br/>The total amount of time spent only executing queries (0 for cached queries).                                                                                                         | _histogram_ | `tags`, `datasets`, _(request context)_                                                                     |
| `query_executions`<br/><br/>Number of query executions.                                                                                                                                                                      | _count_     | `tags`, `datasets`, _(request context)_                                                                     |
| `query_executor_count`<br/><br/>Number of executors selected per query during partition-aware planning (distributed query).                                                                                                   | _histogram_ | `node_id`                                                                                                   |
| `query_failures`<br/><br/>Number of query failures.                                                                                                                                                                          | _count_     | `tags`, `datasets`, `err_code`, _(request context)_                                                         |
| `query_planning_failures`<br/><br/>Queries that failed during partition-aware planning before execution. Indicates missing partitions or unavailable executors.                                                               | _count_     | `node_id`, `error_type` (`missing_partitions`, `no_executors`)                                              |
| `query_processed_bytes`<br/><br/>Number of bytes processed by the runtime.                                                                                                                                                   | _count_     | _(request context)_                                                                                         |
| `query_produced_spills`<br/><br/>Number of spills produced by the query.                                                                                                                                                     | _count_     | _(request context)_                                                                                         |
| `query_returned_bytes`<br/><br/>Number of bytes returned to query clients.                                                                                                                                                   | _count_     | _(request context)_                                                                                         |
| `query_returned_rows`<br/><br/>Number of rows returned to query clients.                                                                                                                                                     | _histogram_ | _(request context)_                                                                                         |
| `query_spilled_bytes`<br/><br/>Number of spilled bytes produced by the query.                                                                                                                                                | _count_     | _(request context)_                                                                                         |
| `query_spilled_rows`<br/><br/>Number of spilled rows produced by the query.                                                                                                                                                  | _count_     | _(request context)_                                                                                         |
| `results_cache_evictions`<br/><br/>Number of cache evictions.                                                                                                                                                                | _count_     | —                                                                                                           |
| `results_cache_hit_ratio`<br/><br/>Cache hit ratio (hits / total requests).                                                                                                                                                  | _gauge_     | —                                                                                                           |
| `results_cache_hits`<br/><br/>Cache hit count.                                                                                                                                                                               | _count_     | —                                                                                                           |
| `results_cache_items_count`<br/><br/>Number of items currently in the cache.                                                                                                                                                 | _gauge_     | —                                                                                                           |
| `results_cache_max_size_bytes`<br/><br/>Maximum allowed size of the cache in bytes.                                                                                                                                          | _gauge_     | —                                                                                                           |
| `results_cache_misses`<br/><br/>Cache miss count.                                                                                                                                                                            | _count_     | —                                                                                                           |
| `results_cache_requests`<br/><br/>Number of requests to get a key from the cache.                                                                                                                                            | _count_     | —                                                                                                           |
| `results_cache_size_bytes`<br/><br/>Size of the cache in bytes.                                                                                                                                                              | _gauge_     | —                                                                                                           |
| `results_cache_stale_swr_count`<br/><br/>Number of stale-while-revalidate background refreshes skipped due to existing in-flight revalidation.                                                                               | _count_     | —                                                                                                           |
| `results_cache_swr_background_query_count`<br/><br/>Number of background queries triggered for stale-while-revalidate cache refreshes.                                                                                       | _count_     | —                                                                                                           |
| `runtime_flight_server_started`<br/><br/>Indicates the runtime Flight server has started.                                                                                                                                    | _count_     | —                                                                                                           |
| `runtime_http_server_started`<br/><br/>Indicates the runtime HTTP server has started.                                                                                                                                        | _count_     | —                                                                                                           |
| `runtime_tls_reload_total`<br/><br/>Number of TLS certificate hot-reload attempts.                                                                                                                                           | _count_     | `scope` (`public`, `cluster`), `result` (`ok`, `io_error`, `parse_error`)                                   |
| `scheduler_active_executors_count`<br/><br/>Number of executors currently connected to the scheduler node.                                                                                                                   | _gauge_     | `node_id`                                                                                                   |
| `scheduler_executor_active_connections`<br/><br/>Active control-stream connections from the scheduler to each executor (0 or 1 per executor).                                                                                 | _gauge_     | `node_id`, `executor`                                                                                       |
| `scheduler_executor_connection_retries`<br/><br/>Reconnections observed by the scheduler for an executor.                                                                                                                     | _count_     | `node_id`, `executor`                                                                                       |
| `scheduler_partition_assignments`<br/><br/>Acceleration-partition assignment operations executed by the scheduler.                                                                                                            | _count_     | `node_id`, `executor`, `status` (`committed`, `failed`)                                                     |
| `scheduler_partition_discovery_duration_ms`<br/><br/>Duration of acceleration-partition discovery against the upstream source.                                                                                                | _histogram_ | `node_id`, `dataset`                                                                                        |
| `scheduler_partition_state_operations`<br/><br/>Partition status update operations on the scheduler.                                                                                                                          | _count_     | `node_id`, `status` (`added`, `removed`, `reassigned`)                                                      |
| `scheduler_partitioned_write_forwards`<br/><br/>Partitioned writes forwarded by the scheduler to executors.                                                                                                                   | _count_     | `node_id`, `executor`, `status` (`completed`, `failed`)                                                     |
| `scheduler_partitions_count`<br/><br/>Number of acceleration partitions known to the scheduler, broken down by assignment status.                                                                                             | _gauge_     | `node_id`, `dataset`, `status` (`assigned`, `unassigned`)                                                   |
| `search_results_cache_evictions`<br/><br/>Number of cache evictions.                                                                                                                                                         | _count_     | —                                                                                                           |
| `search_results_cache_hit_ratio`<br/><br/>Cache hit ratio (hits / total requests).                                                                                                                                           | _gauge_     | —                                                                                                           |
| `search_results_cache_hits`<br/><br/>Search cache hit count.                                                                                                                                                                 | _count_     | —                                                                                                           |
| `search_results_cache_items_count`<br/><br/>Number of items currently in the search cache.                                                                                                                                   | _gauge_     | —                                                                                                           |
| `search_results_cache_max_size_bytes`<br/><br/>Maximum allowed size of the search cache in bytes.                                                                                                                            | _gauge_     | —                                                                                                           |
| `search_results_cache_misses`<br/><br/>Cache miss count.                                                                                                                                                                     | _count_     | —                                                                                                           |
| `search_results_cache_requests`<br/><br/>Number of requests to get a key from the search cache.                                                                                                                              | _count_     | —                                                                                                           |
| `search_results_cache_size_bytes`<br/><br/>Size of the search cache in bytes.                                                                                                                                                | _gauge_     | —                                                                                                           |
| `search_results_cache_stale_swr_count`<br/><br/>Number of stale-while-revalidate background refreshes skipped due to existing in-flight revalidation.                                                                        | _count_     | —                                                                                                           |
| `search_results_cache_swr_background_query_count`<br/><br/>Number of background queries triggered for stale-while-revalidate cache refreshes.                                                                                | _count_     | —                                                                                                           |
| `secrets_store_load_duration_ms`<br/><br/>Duration in milliseconds to load the secret stores.                                                                                                                                | _histogram_ | —                                                                                                           |
| `tool_active_count`<br/><br/>Number of currently loaded LLM tools.                                                                                                                                                           | _gauge_     | `tool` or `tool_catalog`                                                                                    |
| `tool_load_errors`<br/><br/>Number of errors loading the LLM tool.                                                                                                                                                           | _count_     | —                                                                                                           |
| `tool_load_state`<br/><br/>Status of the LLM tools. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                              | _gauge_     | `tool` or `tool_catalog`                                                                                    |
| `view_load_errors`<br/><br/>Number of errors loading the view.                                                                                                                                                               | _count_     | —                                                                                                           |
| `view_load_state`<br/><br/>Status of the views. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                                  | _gauge_     | `view`                                                                                                      |
| `worker_active_count`<br/><br/>Number of currently loaded workers.                                                                                                                                                           | _gauge_     | `worker`                                                                                                    |
| `workers_load_duration_ms`<br/><br/>Duration in milliseconds to load the worker.                                                                                                                                             | _histogram_ | —                                                                                                           |

:::note Component Metrics

In addition to these core metrics, individual components can expose their own metrics. For example, the MySQL data connector exposes [connection pool metrics](../components/data-connectors/mysql/#metrics). See [Component Metrics](observability/component_metrics) for more information.

:::
