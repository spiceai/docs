---
title: 'Observability & Monitoring'
sidebar_label: 'Observability'
description: 'Learn how to use Spice telemetry.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
---

Spice can be monitored using the [Spice Prometheus-compatible Metrics Endpoint](https://prometheus.io/docs/instrumenting/exposition_formats/#basic-info). Spice also supports distributed tracing by integrating with [Zipkin](https://zipkin.io/) and compatible tracing systems.

<img width="740" alt="observability" src="https://github.com/user-attachments/assets/2468e3e7-4fb4-4a74-8b26-45eeeee90310" />

Monitoring clients configuration:

- [Grafana](/docs/monitoring/grafana)
- [Datadog](/docs/monitoring/datadog)
- [Zipkin](/docs/monitoring/zipkin)

## Spice Metrics Endpoint Configuration

The metrics endpoint uses port `9090` by default. The metrics endpoint configuration is logged at startup.

```bash
2024-11-28T19:48:10.942003Z  INFO runtime::metrics_server: Spice Runtime Metrics listening on 127.0.0.1:9090
```

Pass the `--metrics` parameter to bind to a specific port. For example, to bind to port `9091`:

```bash
 spiced --metrics 0.0.0.0:9091
```

or when using Docker:

```Dockerfile
FROM spiceai/spiceai:latest

# Docker configuration ...

# Configure the metrics endpoint on port 9090
CMD ["--metrics", "0.0.0.0:9090"]
EXPOSE 9090
```

Configuration of the metrics endpoint can be verified using a HTTP GET request, for example:

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

## Metrics

| Metric                                                                | Description                                                                                                                                                                               |
|-----------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `accelerated_ready_state_federated_fallback`<br/>_(count)_            | Number of times the federated table was queried due to the accelerated table loading the initial data.                                                                                    |
| `catalog_load_errors`<br/>_(count)_                                   | Number of errors loading the catalog provider.                                                                                                                                            |
| `catalog_load_state`<br/>_(gauge)_                                    | Status of the catalog provider. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                               |
| `dataset_acceleration_last_refresh_time_ms`<br/>_(gauge)_             | Unix timestamp in seconds when the last refresh completed.                                                                                                                                |
| `dataset_acceleration_refresh_duration_ms`<br/>_(histogram)_          | Duration in milliseconds to load a full or appended refresh data.                                                                                                                         |
| `dataset_acceleration_max_timestamp_before_refresh_ms`<br/>_(gauge)_  | Maximum value of the dataset's time_column before the refresh operation, in milliseconds. [Disabled by default](/docs/reference/spicepod.md#runtimemetrics)                               |
| `dataset_acceleration_max_timestamp_after_refresh_ms`<br/>_(gauge)_   | Maximum value of the dataset's time_column after the refresh operation, in milliseconds. [Disabled by default](/docs/reference/spicepod.md#runtimemetrics)                                |
| `dataset_acceleration_refresh_lag_ms`<br/>_(gauge)_                   | Difference between the maximum time_column value after and before the refresh operation, in milliseconds. [Disabled by default](/docs/reference/spicepod.md#runtimemetrics)               |
| `dataset_acceleration_ingestion_lag_ms`<br/>_(gauge)_                 | Lag between the current wall-clock time and the maximum time_column value after the refresh operation, in milliseconds. [Disabled by default](/docs/reference/spicepod.md#runtimemetrics) |
| `dataset_acceleration_refresh_errors`<br/>_(count)_                   | Number of errors refreshing the dataset.                                                                                                                                                  |
| `dataset_acceleration_snapshot_bootstrap_bytes`<br/>_(gauge)_         | Number of bytes downloaded when bootstrapping the acceleration from a snapshot.                                                                                                           |
| `dataset_acceleration_snapshot_bootstrap_checksum`<br/>_(gauge)_      | Checksum of the snapshot downloaded during bootstrap (emitted with `checksum` attribute).                                                                                                 |
| `dataset_acceleration_snapshot_bootstrap_duration_ms`<br/>_(count)_   | Time in milliseconds taken to download the snapshot used to bootstrap acceleration.                                                                                                       |
| `dataset_acceleration_snapshot_failure_count`<br/>_(count)_           | Number of failures encountered while writing snapshots.                                                                                                                                   |
| `dataset_acceleration_snapshot_write_bytes`<br/>_(gauge)_             | Number of bytes written for the most recent snapshot.                                                                                                                                     |
| `dataset_acceleration_snapshot_write_checksum`<br/>_(gauge)_          | Checksum of the most recent snapshot write (emitted with `checksum` attribute).                                                                                                           |
| `dataset_acceleration_snapshot_write_duration_ms`<br/>_(histogram)_   | Time in milliseconds taken to write the latest snapshot to object storage.                                                                                                                |
| `dataset_acceleration_snapshot_write_timestamp`<br/>_(gauge)_         | Unix timestamp (seconds) when the most recent snapshot write completed.                                                                                                                   |
| `dataset_active_count`<br/>_(gauge)_                                  | Number of currently loaded datasets.                                                                                                                                                      |
| `dataset_load_state`<br/>_(gauge)_                                    | Status of the dataset. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                        |
| `dataset_unavailable_time_ms`<br/>_(gauge)_                           | Time dataset went offline in milliseconds.                                                                                                                                                |
| `embeddings_active_count`<br/>_(gauge)_                               | Number of currently loaded embeddings.                                                                                                                                                    |
| `embeddings_load_errors`<br/>_(count)_                                | Number of errors loading the embedding.                                                                                                                                                   |
| `embeddings_load_state`<br/>_(gauge)_                                 | Status of the embedding. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                      |
| `flight_request_duration_ms`<br/>_(histogram)_                        | Measures the duration of Flight requests in milliseconds.                                                                                                                                 |
| `flight_requests`<br/>_(count)_                                       | Total number of Flight requests.                                                                                                                                                          |
| `http_requests_duration_ms`<br/>_(histogram)_                         | Measures the duration of HTTP requests in milliseconds.                                                                                                                                   |
| `http_requests`<br/>_(count)_                                         | Number of HTTP requests.                                                                                                                                                                  |
| `llm_load_state`<br/>_(gauge)_                                        | Status of the LLM model. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                      |
| `model_active_count`<br/>_(gauge)_                                    | Number of currently loaded models.                                                                                                                                                        |
| `model_load_duration_ms`<br/>_(histogram)_                            | Duration in milliseconds to load the model.                                                                                                                                               |
| `model_load_errors`<br/>_(count)_                                     | Number of errors loading the model.                                                                                                                                                       |
| `model_load_state`<br/>_(gauge)_                                      | Status of the model. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                          |
| `query_duration_ms`<br/>_(histogram)_                                 | The total amount of time spent planning and executing queries in milliseconds.                                                                                                            |
| `query_execution_duration_ms`<br/>_(histogram)_                       | The total amount of time spent only executing queries (0 for cached queries).                                                                                                             |
| `query_executions`<br/>_(count)_                                      | Number of query executions.                                                                                                                                                               |
| `query_failures`<br/>_(count)_                                        | Number of query failures.                                                                                                                                                                 |
| `query_processed_bytes`<br/>_(count)_                                 | Number of bytes processed by the runtime.                                                                                                                                                 |
| `query_returned_bytes`<br/>_(count)_                                  | Number of bytes returned to query clients.                                                                                                                                                |
| `embeddings_cache_max_size_bytes`<br/>_(gauge)_                       | Maximum allowed size of the cache in bytes.                                                                                                                                               |
| `embeddings_cache_requests`<br/>_(count)_                             | Number of requests to get a key from the cache.                                                                                                                                           |
| `embeddings_cache_hits`<br/>_(count)_                                 | Cache hit count.                                                                                                                                                                          |
| `embeddings_cache_items_count`<br/>_(gauge)_                          | Number of items currently in the cache.                                                                                                                                                   |
| `embeddings_cache_size_bytes`<br/>_(gauge)_                           | Size of the cache in bytes.                                                                                                                                                               |
| `results_cache_max_size_bytes`<br/>_(gauge)_                          | Maximum allowed size of the cache in bytes.                                                                                                                                               |
| `results_cache_requests`<br/>_(count)_                                | Number of requests to get a key from the cache.                                                                                                                                           |
| `results_cache_hits`<br/>_(count)_                                    | Cache hit count.                                                                                                                                                                          |
| `results_cache_items_count`<br/>_(gauge)_                             | Number of items currently in the cache.                                                                                                                                                   |
| `results_cache_size_bytes`<br/>_(gauge)_                              | Size of the cache in bytes.                                                                                                                                                               |
| `search_results_cache_max_size_bytes`<br/>_(gauge)_                   | Maximum allowed size of the search cache in bytes.                                                                                                                                        |
| `search_results_cache_requests`<br/>_(count)_                         | Number of requests to get a key from the search cache.                                                                                                                                    |
| `search_results_cache_hits`<br/>_(count)_                             | Search cache hit count.                                                                                                                                                                   |
| `search_results_cache_items_count`<br/>_(gauge)_                      | Number of items currently in the search cache.                                                                                                                                            |
| `search_results_cache_size_bytes`<br/>_(gauge)_                       | Size of the search cache in bytes.                                                                                                                                                        |
| `runtime_flight_server_started`<br/>_(count)_                         | Indicates the runtime Flight server has started.                                                                                                                                          |
| `runtime_http_server_started`<br/>_(count)_                           | Indicates the runtime HTTP server has started.                                                                                                                                            |
| `secrets_store_load_duration_ms`<br/>_(histogram)_                    | Duration in milliseconds to load the secret stores.                                                                                                                                       |
| `tool_active_count`<br/>_(gauge)_                                     | Number of currently loaded LLM tools.                                                                                                                                                     |
| `tool_load_errors`<br/>_(count)_                                      | Number of errors loading the LLM tool.                                                                                                                                                    |
| `tool_load_state`<br/>_(gauge)_                                       | Status of the LLM tools. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                      |
| `view_load_errors`<br/>_(count)_                                      | Number of errors loading the view.                                                                                                                                                        |
| `view_load_state`<br/>_(gauge)_                                       | Status of the views. 0=Initializing, 1=Ready, 2=Disabled, 3=Error, 4=Refreshing, 5=ShuttingDown.                                                                                          |

:::note Component Metrics

In addition to these core metrics, individual components can expose their own metrics. For example, the MySQL data connector exposes [connection pool metrics](/docs/components/data-connectors/mysql/#metrics). See [Component Metrics](/docs/features/observability/component_metrics) for more information.

:::
