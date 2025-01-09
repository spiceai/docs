---
title: 'Monitoring'
sidebar_label: 'Monitoring'
description: 'Learn how to use Spice telemetry.'
sidebar_position: 9
pagination_prev: null
pagination_next: null
---

Spice can be monitored using the [Spice Prometheus-compatible Metrics Endpoint](https://prometheus.io/docs/instrumenting/exposition_formats/#basic-info). Monitoring clients configuration:

- [Grafana](/clients/grafana/)
- [Datadog](/clients/Datadog/)

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

# HELP dataset_load_state Status of the dataset. 1=Initializing, 2=Ready, 3=Disabled, 4=Error, 5=Refreshing.
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

| Metric                                             | Description                                                                                       |
|----------------------------------------------------|---------------------------------------------------------------------------------------------------|
| `accelerated_ready_state_federated_fallback`<br/>*(count)*   | Number of times the federated table was queried due to the accelerated table loading the initial data. |
| `catalog_load_errors`<br/>*(count)*                | Number of errors loading the catalog provider.                                                   |
| `catalog_load_state`<br/>*(gauge)*                 | Status of the catalog provider. 1=Initializing, 2=Ready, 3=Disabled, 4=Error, 5=Refreshing.      |
| `dataset_acceleration_last_refresh_time_ms`<br/>*(gauge)* | Unix timestamp in seconds when the last refresh completed.                                       |
| `dataset_acceleration_refresh_duration_ms`<br/>*(histogram)* | Duration in milliseconds to load a full or appended refresh data.                                |
| `dataset_acceleration_refresh_errors`<br/>*(count)*   | Number of errors refreshing the dataset.                                                         |
| `dataset_active_count`<br/>*(gauge)*               | Number of currently loaded datasets.                                                             |
| `dataset_load_state`<br/>*(gauge)*                 | Status of the dataset. 1=Initializing, 2=Ready, 3=Disabled, 4=Error, 5=Refreshing.               |
| `dataset_unavailable_time_ms`<br/>*(gauge)*        | Time dataset went offline in milliseconds.                                                       |
| `embeddings_active_count`<br/>*(gauge)*            | Number of currently loaded embeddings.                                                           |
| `embeddings_load_errors`<br/>*(count)*             | Number of errors loading the embedding.                                                          |
| `embeddings_load_state`<br/>*(gauge)*              | Status of the embedding. 1=Initializing, 2=Ready, 3=Disabled, 4=Error, 5=Refreshing.             |
| `flight_request_duration_ms`<br/>*(histogram)*     | Measures the duration of Flight requests in milliseconds.                                        |
| `flight_requests`<br/>*(count)*                    | Total number of Flight requests.                                                                 |
| `http_requests_duration_ms`<br/>*(histogram)*      | Measures the duration of HTTP requests in milliseconds.                                          |
| `http_requests`<br/>*(count)*                      | Number of HTTP requests.                                                                         |                              |
| `llm_load_state`<br/>*(gauge)*                     | Status of the LLM model. 1=Initializing, 2=Ready, 3=Disabled, 4=Error, 5=Refreshing.             |
| `model_active_count`<br/>*(gauge)*                 | Number of currently loaded models.                                                               |
| `model_load_duration_ms`<br/>*(histogram)*         | Duration in milliseconds to load the model.                                                      |
| `model_load_errors`<br/>*(count)*                  | Number of errors loading the model.                                                              |
| `model_load_state`<br/>*(gauge)*                   | Status of the model. 1=Initializing, 2=Ready, 3=Disabled, 4=Error, 5=Refreshing.                 |
| `query_duration_ms`<br/>*(histogram)*              | The total amount of time spent planning and executing queries in milliseconds.                   |
| `query_execution_duration_ms`<br/>*(histogram)*    | The total amount of time spent only executing queries (0 for cached queries).                    |
| `query_executions`<br/>*(count)*                   | Number of query executions.                                                                      |
| `query_failures`<br/>*(count)*                     | Number of query failures.                                                                        |
| `query_processed_bytes`<br/>*(count)*              | Number of bytes processed by the runtime.                                                        |
| `query_returned_bytes`<br/>*(count)*               | Number of bytes returned to query clients.                                                       |
| `results_cache_max_size_bytes`<br/>*(gauge)*       | Maximum allowed size of the cache in bytes.                                                      |
| `results_cache_requests`<br/>*(count)*             | Number of requests to get a key from the cache.                                                  |
| `results_cache_hits`<br/>*(count)*                 | Cache hit count.                                                                                 |
| `results_cache_items_count`<br/>*(gauge)*          | Number of items currently in the cache.                                                          |
| `results_cache_size_bytes`<br/>*(gauge)*           | Size of the cache in bytes.                                                                      |
| `runtime_flight_server_started`<br/>*(count)*      | Indicates the runtime Flight server has started.                                                 |
| `runtime_http_server_started`<br/>*(count)*        | Indicates the runtime HTTP server has started.                                                   |
| `secrets_store_load_duration_ms`<br/>*(histogram)* | Duration in milliseconds to load the secret stores.                                              |
| `tool_active_count`<br/>*(gauge)*                  | Number of currently loaded LLM tools.                                                            |
| `tool_load_errors`<br/>*(count)*                   | Number of errors loading the LLM tool.                                                           |
| `tool_load_state`<br/>*(gauge)*                    | Status of the LLM tools. 1=Initializing, 2=Ready, 3=Disabled, 4=Error, 5=Refreshing.             |
| `view_load_errors`<br/>*(count)*                   | Number of errors loading the view.                                                              |
| `view_load_state`<br/>*(gauge)*                    | Status of the views. 1=Initializing, 2=Ready, 3=Disabled, 4=Error, 5=Refreshing.                 |
