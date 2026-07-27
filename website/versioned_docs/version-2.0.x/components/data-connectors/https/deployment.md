---
title: 'HTTP(s) Data Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the HTTP(s) data connector in production: authentication, rate control, retries, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - https
  - observability
---

Production operating guide for the HTTP(s) data connector covering authentication, rate control, retry tuning, and observability.

## Authentication & Secrets

The connector supports HTTP Basic, custom-header, and OAuth2 refresh-token authentication. Secrets must be sourced from a [secret store](../../secret-stores/) in production.

| Parameter                 | Description                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| `http_username`           | Username for HTTP Basic authentication.                                                              |
| `http_password`           | Password for HTTP Basic authentication. Use `${secrets:...}` to resolve from a secret store.         |
| `http_headers`            | Custom headers (e.g. `Authorization:Bearer ${secrets:api_token}`). Treated as sensitive — not logged. |
| `auth_token_url`          | OAuth2 token endpoint URL (must be HTTPS in production).                                             |
| `http_auth_refresh_token` | OAuth2 refresh token. Required when `auth_token_url` is set.                                         |
| `http_auth_client_id`     | OAuth2 client ID (required for confidential clients).                                                |
| `http_auth_client_secret` | OAuth2 client secret (required for confidential clients). Use `${secrets:...}`.                      |

For OAuth2-protected APIs, prefer refresh-token flow over storing long-lived bearer tokens. The connector exchanges the refresh token for short-lived access tokens at startup and refreshes them before expiry.

### TLS

Use HTTPS endpoints in production. `auth_token_url` must use HTTPS (loopback addresses are allowed for local testing only). Self-signed certificates require a trusted CA bundle in the container or host OS trust store.

## Resilience Controls

### Rate Control

The HTTP connector participates in the shared HTTP rate control system. Concurrency and per-second/per-minute request limits can be configured per-dataset (in `params`) or globally (in `runtime.params`). Dataset-level settings override the global defaults. Multiple datasets targeting the same upstream origin share a single rate controller.

| Parameter                       | Description                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| `max_concurrent_requests`       | Maximum concurrent HTTP requests to the same origin. Disabled when unset.              |
| `requests_per_second_limit`     | Maximum HTTP requests per second to the same origin. Disabled when unset.              |
| `requests_per_minute_limit`     | Maximum HTTP requests per minute to the same origin. Disabled when unset.              |
| `rate_control_jitter_min`       | Minimum random delay before requests when rate control is active. Defaults to `5ms`.   |
| `rate_control_jitter_max`       | Maximum random delay before requests when rate control is active. Defaults to `10ms`.  |

The runtime equivalents (`http_max_concurrent_requests`, `http_requests_per_second_limit`, `http_requests_per_minute_limit`, `http_rate_control_jitter_min`, `http_rate_control_jitter_max`) set defaults that apply to every HTTP-based connector unless overridden per dataset.

```yaml
runtime:
  params:
    http_max_concurrent_requests: 10
    http_requests_per_second_limit: 5

datasets:
  - from: https://api.example.com/v1
    name: api_data
    params:
      file_format: json
      allowed_request_paths: '/data/**'
      max_concurrent_requests: 3 # Override for this dataset
      requests_per_minute_limit: 60
```

Use rate control when the upstream API enforces request quotas, when many datasets share a single origin, or when running large `IN`-list refreshes that would otherwise burst hundreds of concurrent requests.

### Retry Behavior

HTTP-level retries follow the shared `resilient_http` policy: 408, 429, and 5xx responses plus transient network errors are retried. The connector respects `Retry-After`, `retry-after-ms`, and `x-retry-after-ms` headers.

| Parameter              | Default     | Description                                                                                                  |
| ---------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| `max_retries`          | `3`         | Maximum retry attempts per request.                                                                          |
| `retry_backoff_method` | `fibonacci` | Backoff strategy. Options: `fibonacci`, `linear`, `exponential`.                                             |
| `retry_max_duration`   | unset       | Maximum total duration across all retries (e.g. `30s`, `5m`). When set, retries stop after this elapsed time. |
| `retry_jitter`         | `0.3`       | Randomization factor (`0.0`–`1.0`) applied to retry delays. Set to `0` to disable jitter.                    |

Retries are independent of rate control. If a retry would exceed the configured per-second or per-minute rate, it waits for the rate window to open before issuing the request.

### Timeouts and Connection Pool

| Parameter                | Default | Description                                                              |
| ------------------------ | ------- | ------------------------------------------------------------------------ |
| `client_timeout`         | `30`    | Maximum time (seconds) to wait for the entire request-response cycle.    |
| `connect_timeout`        | `10`    | Maximum time (seconds) to establish a TCP/TLS connection.                |
| `pool_max_idle_per_host` | `10`    | Maximum idle connections held per upstream host.                         |
| `pool_idle_timeout`      | `90`    | Idle connection lifetime (seconds) before the pool closes them.          |

Increase `client_timeout` for endpoints with large response bodies or expensive server-side computation. Reduce `pool_max_idle_per_host` when running many small datasets against the same host to keep the runtime's open file descriptors bounded.

### Caching Mode

When using `refresh_mode: caching`, transient HTTP errors (5xx, 429) are excluded from the cache and propagated to clients. Set `caching_stale_if_error: enabled` to serve expired cached data on upstream failure. Always set `caching_ttl` explicitly — the default of `30s` is rarely the desired window.

## Capacity & Sizing

- **Throughput**: Bounded by the upstream rate limit, then by `max_concurrent_requests` and `connect_timeout`. Plan limits to stay within the API quota.
- **Memory**: Response bodies are streamed; memory footprint is bounded by `max_request_body_bytes` (filter inputs) and DataFusion's record-batch size for response rows.
- **Connection setup**: TLS handshake adds latency. The connection pool keeps `pool_max_idle_per_host` warm connections to absorb burst traffic.
- **Partitioned refreshes**: When using `IN`-list filters or cross-product partitioning, the runtime issues one HTTP request per partition. Use `max_request_partitions` to cap the request count for unbounded filter combinations, and `max_concurrent_requests` to throttle their fan-out.

## Metrics

The connector exposes per-origin HTTP rate-control metrics for every dynamic JSON API dataset. They are registered automatically — no `metrics` configuration is required — and the limit gauges report `0` when the corresponding limit is not configured. Structured file-format datasets (`parquet`, `csv`, and the other listing-table formats) do not expose them:

| Metric Name                                 | Type    | Description                                                                                              |
| ------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `inflight_operations`                       | Gauge   | Current number of HTTP requests holding a rate-control permit.                                           |
| `rate_control_max_concurrent_requests`      | Gauge   | Configured maximum concurrent HTTP requests for this upstream origin; `0` means disabled.                |
| `rate_control_requests_per_second_limit`    | Gauge   | Configured HTTP request-per-second limit for this upstream origin; `0` means disabled.                   |
| `rate_control_requests_per_minute_limit`    | Gauge   | Configured HTTP request-per-minute limit for this upstream origin; `0` means disabled.                   |
| `rate_control_jitter_min_ms`                | Gauge   | Configured minimum rate-control jitter (ms) before HTTP requests.                                        |
| `rate_control_jitter_max_ms`                | Gauge   | Configured maximum rate-control jitter (ms) before HTTP requests.                                        |
| `rate_control_available_permits`            | Gauge   | Current available permits in the HTTP request concurrency semaphore; `0` when concurrency is disabled.   |
| `rate_control_acquisitions_total`           | Counter | Total HTTP request rate-control permits acquired.                                                        |
| `rate_control_acquire_errors_total`         | Counter | Total HTTP request rate-control permit acquisition errors.                                               |
| `rate_control_wait_duration_ms`             | Counter | Cumulative time (ms) spent waiting for HTTP rate-control permits, quotas, and jitter.                    |
| `rate_limit_retry_after_updates_total`      | Counter | Total upstream cooldown hints accepted from `Retry-After` or `RateLimit` reset headers.                  |
| `rate_limit_retry_after_waits_total`        | Counter | Total waits caused by `Retry-After` or `RateLimit` reset headers.                                        |
| `rate_limit_retry_after_wait_duration_ms`   | Counter | Cumulative time (ms) spent waiting because of `Retry-After` or `RateLimit` reset headers.                |
| `rate_limit_retry_after_remaining_ms`       | Gauge   | Current remaining `Retry-After` / `RateLimit` cooldown (ms) for this upstream origin.                    |

These metrics are auto-registered — no configuration is required to export them. To turn one off for a dataset, set `enabled: false` in the dataset's `metrics` section:

```yaml
datasets:
  - from: https://api.example.com/v1
    name: api_data
    params:
      file_format: json
    metrics:
      - name: rate_control_wait_duration_ms
        enabled: false
```

Instruments are exposed with the prefix `dataset_http_` — the HTTP connector's component name is `http`, not `https` — and each carries an `origin` attribute (`scheme://host:port`) identifying the upstream origin instead of a dataset `name`, because datasets sharing an origin share one rate controller. See [Component Metrics](../../../features/observability/component_metrics) for general configuration.

For broader observability, also monitor:

- Spice query execution metrics (`query_duration_ms`, `query_returned_rows`, `query_failures`) from `runtime.metrics`.

## Task History

HTTP requests participate in [task history](../../../reference/task_history) through the HTTP client's span. Each partitioned request and each pagination page is a child of the enclosing `sql_query` or `accelerated_table_refresh` task.

## Known Limitations

- **Read-only**: The connector is read-only. Only `GET` and `POST` (via `request_body` filters) are supported.
- **Filter pushdown is opt-in**: `request_path`, `request_query`, `request_body`, and `request_headers` filters require explicit allowlists or `_filters: enabled` parameters.
- **OAuth2 OOS scope**: Only the refresh-token grant is supported. Client-credentials and authorization-code flows are not exposed.
- **OR across virtual filter columns**: `WHERE request_path = '/a' OR request_query = 'b=1'` is rejected. Use separate datasets or `UNION ALL` for cross-column alternatives. Single-column `OR` (and `IN`-lists) is supported.

## Troubleshooting

| Symptom                                          | Likely cause                                                | Resolution                                                                                                |
| ------------------------------------------------ | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `401 Unauthorized`                               | Wrong/expired token or password.                            | Rotate the credential in the secret store.                                                                |
| `429 Too Many Requests` (frequent)               | Upstream rate limit hit; concurrency too high.              | Set `requests_per_second_limit` / `requests_per_minute_limit`; reduce `max_concurrent_requests`.          |
| Refresh blocked / queue building up              | `max_concurrent_requests` set too low for the workload.     | Raise the dataset-level limit or move heavy datasets to their own origin.                                 |
| OAuth2 token refresh fails                       | `auth_token_url` not HTTPS, or wrong client credentials.    | Verify the token endpoint URL; check `http_auth_client_id`/`secret` and required scopes.                  |
| Request rejected: "OR across HTTP filter columns" | `WHERE request_path = '...' OR request_query = '...'`.    | Split into separate refreshes or `UNION ALL`.                                                             |
| Many partitions created from cross-product       | Multiple `IN`-list filters multiplied into many requests.   | Set `max_request_partitions` to cap; tighten filters.                                                     |
| Slow first refresh                               | Cold connection pool + TLS handshake per request.           | Raise `pool_max_idle_per_host`; ensure `pool_idle_timeout` is long enough to keep connections warm.       |
