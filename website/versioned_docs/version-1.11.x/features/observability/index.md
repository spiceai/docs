---
title: 'Observability & Monitoring'
sidebar_label: 'Observability'
description: 'Monitor Spice with Prometheus metrics, OpenTelemetry, and distributed tracing.'
sidebar_position: 12
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

| Parameter       | Required | Default | Description                                                           |
| --------------- | -------- | ------- | --------------------------------------------------------------------- |
| `enabled`       | No       | `true`  | Whether the OpenTelemetry exporter is enabled.                        |
| `endpoint`      | Yes      | -       | The OpenTelemetry collector endpoint.                                 |
| `push_interval` | No       | `60s`   | How frequently metrics are pushed to the collector.                   |
| `metrics`       | No       | `[]`    | List of metric names to export. When empty, all metrics are exported. |

### Protocol

Spice currently supports only the gRPC protocol for OpenTelemetry metrics export. Specify the collector `endpoint` as a host and port (e.g., `localhost:4317`). 

### Examples

**gRPC (default port 4317):**

```yaml
runtime:
  telemetry:
    enabled: true
    otel_exporter:
      endpoint: 'localhost:4317'
      push_interval: '30s'
```

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

For full configuration details, see the [runtime.telemetry reference](../reference/spicepod/runtime#runtimetelemetry).

## Available Metrics

Spice exposes the following metrics. All metrics include relevant labels (dimensions) for filtering and aggregation.

| Metric                                                               | Description                                                                                                                                                                                 |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accelerated_ready_state_federated_fallback`<br/>_(count)_           | Number of times the federated table was queried due to the accelerated table loading the initial data.                                                                                      |
| `accelerated_zero_results_federated_fallback`<br/>_(count)_          | Number of times the federated table was queried due to the accelerated table returning zero results.                                                                                        |
| `ai_inferences_with_spice_count`<br/>_(count)_                       | AI Inferences with Spice count.                                                                                                                                                             |
| `catalog_load_errors`<br/>_(count)_                                  | Number of errors loading the catalog provider.                                                                                                                                              |
| `catalog_load_state`<br/>_(gauge)_                                   | Status of the catalog provider. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                 |
| `component_metric_registered_count`<br/>_(gauge)_                    | Number of currently registered component metrics.                                                                                                                                           |
| `dataset_acceleration_ingestion_lag_ms`<br/>_(gauge)_                | Lag between the current wall-clock time and the maximum time_column value after the refresh operation, in milliseconds. [Disabled by default](../reference/spicepod/runtime#runtimemetrics) |
| `dataset_acceleration_last_refresh_time_ms`<br/>_(gauge)_            | Unix timestamp in milliseconds when the last refresh completed. [Disabled by default](../reference/spicepod/runtime#runtimemetrics)                                                         |
| `dataset_acceleration_max_timestamp_after_refresh_ms`<br/>_(gauge)_  | Maximum value of the dataset's time_column after the refresh operation, in milliseconds. [Disabled by default](../reference/spicepod/runtime#runtimemetrics)                                |
| `dataset_acceleration_max_timestamp_before_refresh_ms`<br/>_(gauge)_ | Maximum value of the dataset's time_column before the refresh operation, in milliseconds. [Disabled by default](../reference/spicepod/runtime#runtimemetrics)                               |
| `dataset_acceleration_refresh_data_fetches_skipped`<br/>_(count)_    | Number of refresh data fetches skipped due to unchanged file metadata.                                                                                                                      |
| `dataset_acceleration_refresh_duration_ms`<br/>_(histogram)_         | Duration in milliseconds to load a full or appended refresh data.                                                                                                                           |
| `dataset_acceleration_refresh_errors`<br/>_(count)_                  | Number of errors refreshing the dataset.                                                                                                                                                    |
| `dataset_acceleration_refresh_lag_ms`<br/>_(gauge)_                  | Difference between the maximum time_column value after and before the refresh operation, in milliseconds.                                                                                   |
| `dataset_acceleration_refresh_worker_panics`<br/>_(count)_           | Number of times a refresh worker panicked while refreshing a dataset.                                                                                                                       |
| `dataset_acceleration_snapshot_bootstrap_bytes`<br/>_(gauge)_        | Number of bytes downloaded when bootstrapping the acceleration from a snapshot.                                                                                                             |
| `dataset_acceleration_snapshot_bootstrap_checksum`<br/>_(gauge)_     | Checksum of the snapshot downloaded during bootstrap (emitted with `checksum` attribute).                                                                                                   |
| `dataset_acceleration_snapshot_bootstrap_duration_ms`<br/>_(count)_  | Time in milliseconds taken to download the snapshot used to bootstrap acceleration.                                                                                                         |
| `dataset_acceleration_snapshot_failure_count`<br/>_(count)_          | Number of failures encountered while writing snapshots.                                                                                                                                     |
| `dataset_acceleration_snapshot_write_bytes`<br/>_(gauge)_            | Number of bytes written for the most recent snapshot.                                                                                                                                       |
| `dataset_acceleration_snapshot_write_checksum`<br/>_(gauge)_         | Checksum of the most recent snapshot write (emitted with `checksum` attribute).                                                                                                             |
| `dataset_acceleration_snapshot_write_duration_ms`<br/>_(histogram)_  | Time in milliseconds taken to write the latest snapshot to object storage.                                                                                                                  |
| `dataset_acceleration_snapshot_write_timestamp`<br/>_(gauge)_        | Unix timestamp (seconds) when the most recent snapshot write completed.                                                                                                                     |
| `dataset_active_count`<br/>_(gauge)_                                 | Number of currently loaded datasets.                                                                                                                                                        |
| `dataset_load_errors`<br/>_(count)_                                  | Number of errors loading the dataset.                                                                                                                                                       |
| `dataset_load_state`<br/>_(gauge)_                                   | Status of the dataset. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                          |
| `dataset_unavailable_time_ms`<br/>_(gauge)_                          | Time dataset went offline in milliseconds.                                                                                                                                                  |
| `embeddings_active_count`<br/>_(gauge)_                              | Number of currently loaded embeddings.                                                                                                                                                      |
| `embeddings_cache_evictions`<br/>_(count)_                           | Number of cache evictions.                                                                                                                                                                  |
| `embeddings_cache_hit_ratio`<br/>_(gauge)_                           | Cache hit ratio (hits / total requests).                                                                                                                                                    |
| `embeddings_cache_hits`<br/>_(count)_                                | Cache hit count.                                                                                                                                                                            |
| `embeddings_cache_items_count`<br/>_(gauge)_                         | Number of items currently in the cache.                                                                                                                                                     |
| `embeddings_cache_max_size_bytes`<br/>_(gauge)_                      | Maximum allowed size of the cache in bytes.                                                                                                                                                 |
| `embeddings_cache_misses`<br/>_(count)_                              | Cache miss count.                                                                                                                                                                           |
| `embeddings_cache_requests`<br/>_(count)_                            | Number of requests to get a key from the cache.                                                                                                                                             |
| `embeddings_cache_size_bytes`<br/>_(gauge)_                          | Size of the cache in bytes.                                                                                                                                                                 |
| `embeddings_cache_stale_swr_count`<br/>_(count)_                     | Number of stale-while-revalidate background refreshes skipped due to existing in-flight revalidation.                                                                                       |
| `embeddings_cache_swr_background_query_count`<br/>_(count)_          | Number of background queries triggered for stale-while-revalidate cache refreshes.                                                                                                          |
| `embeddings_failures`<br/>_(count)_                                  | Number of embedding failures.                                                                                                                                                               |
| `embeddings_internal_request_duration_ms`<br/>_(histogram)_          | The duration of running an embedding(s) internally.                                                                                                                                         |
| `embeddings_load_errors`<br/>_(count)_                               | Number of errors loading the embedding.                                                                                                                                                     |
| `embeddings_load_state`<br/>_(gauge)_                                | Status of the embedding. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                        |
| `embeddings_requests`<br/>_(count)_                                  | Number of embedding requests.                                                                                                                                                               |
| `flight_do_exchange_data_updates_sent`<br/>_(count)_                 | Number of data updates sent via DoExchange.                                                                                                                                                 |
| `flight_request_duration_ms`<br/>_(histogram)_                       | Measures the duration of Flight requests in milliseconds.                                                                                                                                   |
| `flight_requests`<br/>_(count)_                                      | Total number of Flight requests.                                                                                                                                                            |
| `http_requests`<br/>_(count)_                                        | Number of HTTP requests.                                                                                                                                                                    |
| `http_requests_duration_ms`<br/>_(histogram)_                        | Measures the duration of HTTP requests in milliseconds.                                                                                                                                     |
| `llm_failures`<br/>_(count)_                                         | Number of LLM failures.                                                                                                                                                                     |
| `llm_internal_request_duration_ms`<br/>_(histogram)_                 | The duration of running an LLM request internally.                                                                                                                                          |
| `llm_load_state`<br/>_(gauge)_                                       | Status of the LLM model. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                        |
| `llm_requests`<br/>_(count)_                                         | Number of LLM requests.                                                                                                                                                                     |
| `model_active_count`<br/>_(gauge)_                                   | Number of currently loaded models.                                                                                                                                                          |
| `model_load_duration_ms`<br/>_(histogram)_                           | Duration in milliseconds to load the model.                                                                                                                                                 |
| `model_load_errors`<br/>_(count)_                                    | Number of errors loading the model.                                                                                                                                                         |
| `model_load_state`<br/>_(gauge)_                                     | Status of the model. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                            |
| `query_active_count`<br/>_(histogram)_                               | Number of concurrent top-level queries actively being processed in the runtime. Includes the `protocol` dimension (`http`, `flight`, `flightsql`, `internal`) to indicate the query type.   |
| `query_duration_ms`<br/>_(histogram)_                                | The total amount of time spent planning and executing queries in milliseconds.                                                                                                              |
| `query_execution_duration_ms`<br/>_(histogram)_                      | The total amount of time spent only executing queries (0 for cached queries).                                                                                                               |
| `query_executions`<br/>_(count)_                                     | Number of query executions.                                                                                                                                                                 |
| `query_failures`<br/>_(count)_                                       | Number of query failures.                                                                                                                                                                   |
| `query_processed_bytes`<br/>_(count)_                                | Number of bytes processed by the runtime.                                                                                                                                                   |
| `query_produced_spills`<br/>_(count)_                                | Number of spills produced by the query.                                                                                                                                                     |
| `query_returned_bytes`<br/>_(count)_                                 | Number of bytes returned to query clients.                                                                                                                                                  |
| `query_returned_rows`<br/>_(histogram)_                              | Number of rows returned to query clients.                                                                                                                                                   |
| `query_spilled_bytes`<br/>_(count)_                                  | Number of spilled bytes produced by the query.                                                                                                                                              |
| `query_spilled_rows`<br/>_(count)_                                   | Number of spilled rows produced by the query.                                                                                                                                               |
| `results_cache_evictions`<br/>_(count)_                              | Number of cache evictions.                                                                                                                                                                  |
| `results_cache_hit_ratio`<br/>_(gauge)_                              | Cache hit ratio (hits / total requests).                                                                                                                                                    |
| `results_cache_hits`<br/>_(count)_                                   | Cache hit count.                                                                                                                                                                            |
| `results_cache_items_count`<br/>_(gauge)_                            | Number of items currently in the cache.                                                                                                                                                     |
| `results_cache_max_size_bytes`<br/>_(gauge)_                         | Maximum allowed size of the cache in bytes.                                                                                                                                                 |
| `results_cache_misses`<br/>_(count)_                                 | Cache miss count.                                                                                                                                                                           |
| `results_cache_requests`<br/>_(count)_                               | Number of requests to get a key from the cache.                                                                                                                                             |
| `results_cache_size_bytes`<br/>_(gauge)_                             | Size of the cache in bytes.                                                                                                                                                                 |
| `results_cache_stale_swr_count`<br/>_(count)_                        | Number of stale-while-revalidate background refreshes skipped due to existing in-flight revalidation.                                                                                       |
| `results_cache_swr_background_query_count`<br/>_(count)_             | Number of background queries triggered for stale-while-revalidate cache refreshes.                                                                                                          |
| `runtime_flight_server_started`<br/>_(count)_                        | Indicates the runtime Flight server has started.                                                                                                                                            |
| `runtime_http_server_started`<br/>_(count)_                          | Indicates the runtime HTTP server has started.                                                                                                                                              |
| `search_results_cache_evictions`<br/>_(count)_                       | Number of cache evictions.                                                                                                                                                                  |
| `search_results_cache_hit_ratio`<br/>_(gauge)_                       | Cache hit ratio (hits / total requests).                                                                                                                                                    |
| `search_results_cache_hits`<br/>_(count)_                            | Search cache hit count.                                                                                                                                                                     |
| `search_results_cache_items_count`<br/>_(gauge)_                     | Number of items currently in the search cache.                                                                                                                                              |
| `search_results_cache_max_size_bytes`<br/>_(gauge)_                  | Maximum allowed size of the search cache in bytes.                                                                                                                                          |
| `search_results_cache_misses`<br/>_(count)_                          | Cache miss count.                                                                                                                                                                           |
| `search_results_cache_requests`<br/>_(count)_                        | Number of requests to get a key from the search cache.                                                                                                                                      |
| `search_results_cache_size_bytes`<br/>_(gauge)_                      | Size of the search cache in bytes.                                                                                                                                                          |
| `search_results_cache_stale_swr_count`<br/>_(count)_                 | Number of stale-while-revalidate background refreshes skipped due to existing in-flight revalidation.                                                                                       |
| `search_results_cache_swr_background_query_count`<br/>_(count)_      | Number of background queries triggered for stale-while-revalidate cache refreshes.                                                                                                          |
| `secrets_store_load_duration_ms`<br/>_(histogram)_                   | Duration in milliseconds to load the secret stores.                                                                                                                                         |
| `tool_active_count`<br/>_(gauge)_                                    | Number of currently loaded LLM tools.                                                                                                                                                       |
| `tool_load_errors`<br/>_(count)_                                     | Number of errors loading the LLM tool.                                                                                                                                                      |
| `tool_load_state`<br/>_(gauge)_                                      | Status of the LLM tools. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                        |
| `view_load_errors`<br/>_(count)_                                     | Number of errors loading the view.                                                                                                                                                          |
| `view_load_state`<br/>_(gauge)_                                      | Status of the views. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                            |
| `worker_active_count`<br/>_(gauge)_                                  | Number of currently loaded workers.                                                                                                                                                         |
| `workers_load_duration_ms`<br/>_(histogram)_                         | Duration in milliseconds to load the worker.                                                                                                                                                |

:::note Component Metrics

In addition to these core metrics, individual components can expose their own metrics. For example, the MySQL data connector exposes [connection pool metrics](../components/data-connectors/mysql/#metrics). See [Component Metrics](observability/component_metrics) for more information.

:::
