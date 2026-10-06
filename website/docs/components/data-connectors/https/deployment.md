---
title: 'HTTP(s) Data Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the HTTP(s) data connector in production: authentication, adaptive rate control, retries, and observability.'
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

The connector supports HTTP Basic, custom-header, and OAuth2 (refresh-token and client-credentials grants) authentication. Secrets must be sourced from a [secret store](../../secret-stores/) in production.

| Parameter                 | Description                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| `http_username`           | Username for HTTP Basic authentication.                                                              |
| `http_password`           | Password for HTTP Basic authentication. Use `${secrets:...}` to resolve from a secret store.         |
| `http_headers`            | Custom headers (e.g. `Authorization:Bearer ${secrets:api_token}`). Treated as sensitive — not logged. Dynamic JSON API endpoints only; structured HTTP file datasets ignore these headers. |
| `auth_token_url`          | OAuth2 token endpoint URL (must be HTTPS in production).                                             |
| `auth_grant_type`         | OAuth2 grant: `refresh_token` (default) or `client_credentials`.                                    |
| `http_auth_refresh_token` | OAuth2 refresh token. Required for the (default) refresh-token grant; unused by `client_credentials`. |
| `http_auth_client_id`     | OAuth2 client ID (required for confidential clients and for `client_credentials`).                  |
| `http_auth_client_secret` | OAuth2 client secret (required for confidential clients and for `client_credentials`). Use `${secrets:...}`. |
| `auth_header_name`        | Header carrying the access token. Default `Authorization` (`Bearer <token>`); any other name sends the bare token. |

For OAuth2-protected APIs, prefer refresh-token flow over storing long-lived bearer tokens. The connector exchanges the refresh token for short-lived access tokens at startup and refreshes them before expiry.

### TLS

Use HTTPS endpoints in production. `auth_token_url` must use HTTPS (loopback addresses are allowed for local testing only). Self-signed certificates require a trusted CA bundle in the container or host OS trust store.

For upstream servers that require mutual TLS (mTLS), the connector can present a client certificate during the TLS handshake. Supply the certificate and key as file paths or inline PEM — the two forms are mutually exclusive, and the certificate and key must be set together. mTLS client identity applies to dynamic JSON API endpoints only.

| Parameter                          | Description                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| `http_tls_client_certificate_file` | Path to a PEM client certificate chain. Pair with `http_tls_client_key_file`.                |
| `http_tls_client_key_file`         | Path to the PEM private key matching the client certificate file.                            |
| `http_tls_client_certificate`      | Inline PEM client certificate chain. Use `${secrets:...}`. Pair with `http_tls_client_key`.  |
| `http_tls_client_key`              | Inline PEM private key matching the inline certificate. Use `${secrets:...}`.                |

## Resilience Controls

### Rate Control

The HTTP connector participates in the shared HTTP rate control system. Concurrency and per-second/per-minute request limits can be configured per-dataset (in `params`) or globally (in `runtime.params`). Dataset-level settings override the global defaults. Multiple datasets targeting the same upstream origin share a single rate controller.

Rate control is adaptive. On a healthy origin the configured limits apply unchanged. While the origin fails or times out, Spice sends it fewer requests than the configured limits, and returns to the full limits as it recovers. See [Adaptive rate control](#adaptive-rate-control).

| Parameter                        | Default                                       | Description                                                                                                                                                                                   |
| -------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `max_concurrent_requests`        | unset                                         | Maximum concurrent HTTP requests to the same origin. Disabled when unset.                                                                                                                     |
| `requests_per_second_limit`      | unset                                         | Maximum HTTP requests per second to the same origin. Disabled when unset.                                                                                                                     |
| `requests_per_minute_limit`      | unset                                         | Maximum HTTP requests per minute to the same origin. Disabled when unset.                                                                                                                     |
| `rate_control_jitter_min`        | `5ms` with a request-rate limit, else `0ms`   | Minimum random delay before requests when rate control is active.                                                                                                                             |
| `rate_control_jitter_max`        | `10ms` with a request-rate limit, else `0ms`  | Maximum random delay before requests when rate control is active.                                                                                                                             |
| `rate_control_failure_threshold` | `10%`                                         | The upstream error rate above which adaptive rate control starts to throttle the origin. A percentage (`25%`) or a fraction (`0.25`), greater than 0 and less than 1.                         |
| `rate_control_window`            | `10s`                                         | The half-life over which request outcomes decay. A shorter window reacts to failures and recovers faster; a longer window is smoother. With [cluster rate control](#cluster-rate-control), the default is `runtime.source_rate_control.refresh_interval`. |
| `rate_control_acquire_timeout`   | `client_timeout`                              | Maximum time a request waits for a rate-control permit before it fails. `0` waits indefinitely.                                              |

The runtime equivalents add an `http_` prefix (`http_max_concurrent_requests`, `http_requests_per_second_limit`, `http_requests_per_minute_limit`, `http_rate_control_jitter_min`, `http_rate_control_jitter_max`, `http_rate_control_failure_threshold`, `http_rate_control_window`, `http_rate_control_acquire_timeout`) and set defaults that apply to every HTTP-based connector unless overridden per dataset. See [HTTP Rate Control](../../../reference/spicepod/runtime#http-rate-control) in the runtime reference.

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

#### Adaptive rate control

Static limits protect a healthy origin from too much load, but an origin that is already failing still receives the full configured rate, and retries add to it. That delays recovery and uses the origin's quota on requests that fail. Adaptive rate control uses the outcome of each request to lower the request rate to an origin while it fails, and to raise the rate back to the configured limits as the origin recovers.

Adaptive rate control has no on/off setting. It applies to every origin that has a `max_concurrent_requests`, `requests_per_second_limit`, or `requests_per_minute_limit`. It only scales those limits down: Spice never sends more than the configured limits, and an origin with no limit has nothing to scale, so adaptive rate control has no effect on it.

Spice classifies each response with the same rules as [retries](#retry-behavior):

| Outcome                                              | Counted as                                                                             |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `2xx`                                                | Success                                                                                |
| `408`, `429`, `5xx`                                  | Failure                                                                                |
| Timeout or connection error                          | Failure                                                                                |
| Any other status (for example `401`, `403`, `404`)   | Not counted. Throttling cannot fix a client, authentication, or configuration error.  |

Spice keeps two counts per origin: requests, and accepted (successful) requests. Both decay with a half-life of `rate_control_window`, so an outcome that is `t` seconds old has a weight of `0.5^(t / rate_control_window)`. From these counts, Spice calculates an admission coefficient between 0 and 1, which is the fraction of the configured limits that it admits:

```text
coefficient = min( (K × accepts + 1) / (requests + 1), 1 )

K = 1 / (1 − rate_control_failure_threshold)
```

It has several valuable properties worth stating:

- Throttling starts when the error rate goes above `rate_control_failure_threshold`.
- At a steady success rate `p` below `1 / K`, the coefficient settles near `K × p`. With the default `10%` threshold, a 25% error rate settles near `0.83` of the configured limits, and a 50% error rate near `0.56`.

The coefficient scales every configured limit on the origin: per-second, per-minute, and concurrency.

```yaml
datasets:
  - from: https://api.example.com/v1
    name: api_data
    params:
      file_format: json
      requests_per_minute_limit: 60
      rate_control_failure_threshold: 25% # Throttle only above a 25% error rate
      rate_control_window: 30s # React and recover more slowly than the 10s default
```

See [Cluster rate control](../../../reference/spicepod/runtime#cluster-rate-control) for details in configuring multi-replica, object-store coordinated rate controls.

### Retry Behavior

HTTP-level retries follow the shared `resilient_http` policy: 408, 429, and 5xx responses plus transient network errors are retried. The connector respects `Retry-After`, `retry-after-ms`, and `x-retry-after-ms` headers.

| Parameter              | Default     | Description                                                                                                  |
| ---------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| `max_retries`          | `3`         | Maximum retry attempts per request.                                                                          |
| `retry_backoff_method` | `fibonacci` | Backoff strategy. Options: `fibonacci`, `linear`, `exponential`.                                             |
| `retry_max_duration`   | unset       | Maximum total duration across all retries (e.g. `30s`, `5m`). When set, retries stop after this elapsed time. |
| `retry_jitter`         | `0.3`       | Randomization factor (`0.0`–`1.0`) applied to retry delays. Set to `0` to disable jitter.                    |

Each retry is a new request for rate control. It waits for a new permit, so a retry that would exceed the configured per-second or per-minute rate waits for the rate window to open, and that wait is bounded by [`rate_control_acquire_timeout`](#bounded-permit-wait). The outcome of each attempt counts toward [adaptive rate control](#adaptive-rate-control).

### Timeouts and Connection Pool

| Parameter                | Default | Description                                                              |
| ------------------------ | ------- | ------------------------------------------------------------------------ |
| `client_timeout`         | `30`    | Maximum time (seconds) to wait for the entire request-response cycle.    |
| `connect_timeout`        | `10`    | Maximum time (seconds) to establish a TCP/TLS connection.                |
| `pool_max_idle_per_host` | `10`    | Maximum idle connections held per upstream host.                         |
| `pool_idle_timeout`      | `90`    | Idle connection lifetime (seconds) before the pool closes them.          |

Increase `client_timeout` for endpoints with large response bodies or expensive server-side computation. Reduce `pool_max_idle_per_host` when running many small datasets against the same host to keep the runtime's open file descriptors bounded.

### Caching Mode

When using `refresh_mode: caching`, transient HTTP errors (5xx, 429) are excluded from the cache and propagated to clients. Set `caching_stale_if_error` to serve expired cached data on upstream failure — prefer a duration (`caching_stale_if_error: 600s`), which bounds both how stale a served entry may be and how long it is retained; `enabled` is the unbounded form. Always set `caching_ttl` explicitly — the default of `30s` is rarely the desired window.

Set `caching_max_size` (a byte budget, e.g. `512MiB`) or `caching_max_items` (a row budget) to bound the acceleration. A TTL alone does not: a workload that keeps fetching new request paths grows it indefinitely, and with `caching_stale_if_error: enabled` expired entries are deliberately kept as fallback material and are never expired away (a duration value instead derives an eviction deadline, so it does not have this effect). The runtime warns at startup, naming the dataset, when a caching accelerator has nothing bounding it. The eviction sweep runs at `caching_ttl`, clamped to 30s–5m, so the acceleration may overshoot its budget by whatever the workload writes between sweeps. See [Cache Size and Item Limits](../../../features/data-acceleration/refresh-modes/caching#cache-size-and-item-limits).

## Capacity & Sizing

- **Throughput**: Bounded by the upstream rate limit, then by `max_concurrent_requests` and `connect_timeout`. Plan limits to stay within the API quota.
- **Memory**: Response bodies are streamed; memory footprint is bounded by `max_request_body_bytes` (filter inputs) and DataFusion's record-batch size for response rows.
- **Response cache**: Each dynamic JSON API dataset holds its own [response cache](./index.md#response-cache), bounded by `response_cache_max_size_bytes` — `67108864` (64 MiB) by default, **per dataset**. The runtime's total exposure therefore scales with the number of HTTP datasets, not with the budget alone: budget it as `datasets × response_cache_max_size_bytes` and raise the value only for the datasets that earn it. Set `0` on a dataset whose responses are never repeated. This cache is not one of the caches under `runtime.caching`, so its memory is not counted against those limits.
- **Connection setup**: TLS handshake adds latency. The connection pool keeps `pool_max_idle_per_host` warm connections to absorb burst traffic.
- **Partitioned refreshes**: When using `IN`-list filters or cross-product partitioning, the runtime issues one HTTP request per partition. Use `max_request_partitions` to cap the request count for unbounded filter combinations, and `max_concurrent_requests` to throttle their fan-out.

## Metrics

The connector reports two metric families: response-cache occupancy, and per-origin rate control. Both are registered automatically — no `metrics` configuration is required.

### Response cache

Occupancy of the dataset's [response cache](./index.md#response-cache). These are reported for every HTTP dataset, because the memory the cache holds is otherwise attributable to nothing; structured file-format datasets do not use the cache and report `0`.

| Metric Name                  | Type  | Description                                                                                                                                                                                     |
| ---------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `response_cache_size_bytes`  | Gauge | Bytes retained by the response cache, counting response bodies, their headers, and the request keys they are held under. Excludes the cache's own per-entry bookkeeping. Compare against `response_cache_max_size_bytes` to see how close a dataset is to its budget. |
| `response_cache_items_count` | Gauge | Number of responses held by the response cache. Read beside the byte figure, this separates a cache holding a few large responses from one holding very many small ones.                        |

Both are refreshed when a request consults the cache, so an idle dataset reports its last observed occupancy — which is the same figure, since nothing enters or leaves the cache except on a request.

### Rate control

Per-origin rate-control metrics, exposed for dynamic JSON API datasets. The limit gauges report `0` when the corresponding limit is not configured. The adaptive metrics have no series for an origin with no request limit, and the cluster metrics have one series per cluster budget (`limiter` attribute) only when [cluster rate control](#cluster-rate-control) is in use. Structured file-format datasets (`parquet`, `csv`, and the other listing-table formats) do not expose them:

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
| `rate_control_adaptive_admission_ratio`     | Gauge   | Fraction of the configured limits that adaptive rate control admits now, from `0` to `1` (`1` = all). Absent when the origin has no request limit, and with cluster rate control until the first window is leased. With cluster rate control, it is the lower of the per-second and per-minute budget ratios on this instance. |
| `rate_control_adaptive_throttled_total`     | Counter | Total requests that adaptive rate control throttled (charged above their normal weight because the origin was failing). `0` while the origin stays healthy, and always `0` with cluster rate control, which lowers the shared budget instead. Absent when the origin has no request limit. |
| `rate_control_lease_granted`                | Gauge   | Cluster rate control only. Tokens this instance holds in the current window, per `limiter`.              |
| `rate_control_cluster_budget_remaining`     | Gauge   | Cluster rate control only. Tokens of the current window that no instance has leased, per `limiter`.      |
| `rate_control_lease_refresh_errors_total`   | Counter | Cluster rate control only. Total failures to read or write the shared rate-control state, per `limiter`. |
| `rate_control_fail_closed_total`            | Counter | Cluster rate control only. Total requests refused because the shared state was unreachable and this instance's lease had expired, per `limiter`. |

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

Instruments from both families are exposed with the prefix `dataset_http_` — the HTTP connector's component name is `http`, not `https` — so the exported names are `dataset_http_response_cache_size_bytes`, `dataset_http_rate_control_wait_duration_ms`, and so on. The two families are attributed differently: the rate-control instruments carry an `origin` attribute (`scheme://host:port`) identifying the upstream origin instead of a dataset `name`, because datasets sharing an origin share one rate controller, while the response-cache gauges carry the dataset `name`, because each dataset has its own cache. See [Component Metrics](../../../features/observability/component_metrics) for general configuration.

For broader observability, also monitor:

- Spice query execution metrics (`query_duration_ms`, `query_returned_rows`, `query_failures`) from `runtime.metrics`.

## Task History

HTTP requests participate in [task history](../../../reference/task_history) through the HTTP client's span. Each partitioned request and each pagination page is a child of the enclosing `sql_query` or `acceleration_refresh` task.

## Known Limitations

- **Read-only**: The connector is read-only. Only `GET` and `POST` (via `request_body` filters) are supported.
- **Filter pushdown is opt-in**: `request_path`, `request_query`, `request_body`, and `request_headers` filters require explicit allowlists or `_filters: enabled` parameters.
- **OAuth2 OOS scope**: The refresh-token and client-credentials grants are supported. The authorization-code and device-code flows are not exposed.
- **OR across virtual filter columns**: `WHERE request_path = '/a' OR request_query = 'b=1'` is rejected. Use separate datasets or `UNION ALL` for cross-column alternatives. Single-column `OR` (and `IN`-lists) is supported.

## Troubleshooting

| Symptom                                          | Likely cause                                                | Resolution                                                                                                |
| ------------------------------------------------ | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `401 Unauthorized`                               | Wrong/expired token or password.                            | Rotate the credential in the secret store.                                                                |
| `429 Too Many Requests` (frequent)               | Upstream rate limit hit; concurrency too high.              | Set `requests_per_second_limit` / `requests_per_minute_limit`; reduce `max_concurrent_requests`.          |
| Refresh blocked / queue building up              | `max_concurrent_requests` set too low for the workload.     | Raise the dataset-level limit or move heavy datasets to their own origin.                                 |
| `Timed out after ... waiting for rate-control capacity` | The origin's limits, which adaptive rate control lowers while the origin fails, could not admit the request within `rate_control_acquire_timeout`. | Check `dataset_http_rate_control_adaptive_admission_ratio`. Raise the limit or `rate_control_acquire_timeout`, or lower concurrency. `0` waits indefinitely. |
| Warning `Upstream '...' is failing more than the ... rate_control_failure_threshold` | More than the threshold share of requests to the origin fail or time out. | Expected while the origin is unhealthy; Spice returns to the full limits when it recovers. If the origin's normal error rate is above the threshold, raise `rate_control_failure_threshold`. |
| `Multiple HTTP-based components target ... with different rate-control settings` | Datasets that share an origin resolve to different rate-control values, for example through different `client_timeout` values. | Use the same values on each dataset, or set them once in `runtime.params`. See [Datasets that share an origin](#datasets-that-share-an-origin). |
| OAuth2 token refresh fails                       | `auth_token_url` not HTTPS, or wrong client credentials.    | Verify the token endpoint URL; check `http_auth_client_id`/`secret` and required scopes.                  |
| Request rejected: "OR across HTTP filter columns" | `WHERE request_path = '...' OR request_query = '...'`.    | Split into separate refreshes or `UNION ALL`.                                                             |
| Many partitions created from cross-product       | Multiple `IN`-list filters multiplied into many requests.   | Set `max_request_partitions` to cap; tighten filters.                                                     |
| Slow first refresh                               | Cold connection pool + TLS handshake per request.           | Raise `pool_max_idle_per_host`; ensure `pool_idle_timeout` is long enough to keep connections warm.       |
| Runtime memory grows with HTTP traffic           | Response caches are held per dataset, 64 MiB each by default. | Check `dataset_http_response_cache_size_bytes` per dataset; lower `response_cache_max_size_bytes`, or set it to `0` where responses are never repeated. |
| Repeat queries still hit the origin              | The origin refuses retention (`no-store`, `no-cache`, `private`, `Vary: *`), or sends no `Cache-Control` at all. | Confirm with `dataset_http_response_cache_items_count` staying at `0`. For a header-less origin, set `response_cache_fallback_ttl`; an origin that refuses explicitly is always honored. |
