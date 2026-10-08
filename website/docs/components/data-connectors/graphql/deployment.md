---
title: 'GraphQL Data Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the GraphQL data connector in production: authentication, pagination, rate limits, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - graphql
  - observability
---

Production operating guide for the GraphQL data connector covering authentication, pagination, and operational tuning.

## Authentication & Secrets

Authentication is endpoint-specific. The connector supports bearer tokens, custom headers via `graphql_auth_header`, and HTTP Basic Auth:

| Parameter                  | Description                                                                  |
| -------------------------- | ---------------------------------------------------------------------------- |
| `graphql_auth_header`      | Custom authorization header name. The value of `graphql_auth_token` is sent as this header's value. |
| `graphql_auth_token`       | Bearer token for GraphQL requests. Typically `"${secrets:api_token}"`.        |
| `graphql_auth_user`        | Username for HTTP Basic Auth.                                                 |
| `graphql_auth_pass`        | Password for HTTP Basic Auth.                                                 |
| `graphql_query`            | The GraphQL query to execute.                                                 |
| `json_pointer`             | RFC-6901 JSON pointer to the row collection inside the response (e.g. `/data/repository/issues/nodes`). |

Tokens must be sourced from a [secret store](../../secret-stores/) in production.

### TLS

Use HTTPS endpoints in production. Self-signed certificates require a trusted CA bundle in the container / host OS trust store.

## Resilience Controls

### Retry Behavior

Each GraphQL request is retried up to 5 times after the initial attempt, so a request fails after at most 6 tries. The retries apply to every page of a refresh and to the request the connector sends when a dataset loads to infer or validate its schema. Retries use [Fibonacci backoff](https://github.com/spiceai/spiceai/blob/bccd19955b60d2271b1cf7b3816f451aaece7629/crates/util/src/fibonacci_backoff.rs) of about 1, 2, 3, 5, and 8 seconds with ±30% jitter. When a retried response carries a `Retry-After` header, or a `RateLimit` reset header while no requests remain, the connector waits that long instead, and the retry still counts against the 5-retry budget. Each retry is logged at `WARN`, and the error is returned once the budget is spent.

Before decoding a response as JSON, the connector [classifies the body](https://github.com/spiceai/spiceai/blob/bccd19955b60d2271b1cf7b3816f451aaece7629/crates/data-connectors/connector-graphql/src/graphql/response.rs) from its `Content-Type` header and its first characters as JSON, HTML, text, empty, or incomplete (shorter than its `Content-Length` header). The classification and the HTTP status decide whether a failure is retried:

| Response                                                               | Retried |
| ---------------------------------------------------------------------- | ------- |
| HTTP 5xx, 408, or 429, with any body                                   | Yes     |
| HTTP 2xx with an empty or incomplete body                              | Yes     |
| HTTP 2xx whose JSON body is truncated or invalid                       | Yes     |
| HTTP 4xx with a JSON error message that mentions a rate limit          | Yes     |
| Connection errors, timeouts, and errors reading the response body      | Yes     |
| HTTP 2xx with an HTML or text body                                     | No      |
| Other HTTP 4xx, including 401 and 403                                  | No      |
| GraphQL `errors` returned in an HTTP 200 JSON body                     | No¹     |

¹ Except an error whose message contains `Something went wrong while executing your query`, which the GitHub GraphQL API returns when its backend times out on a query. The connector retries that error with a smaller page, as described below.

An HTML or text body on HTTP 200 usually means the endpoint URL is wrong or the request was redirected to a login page, so it fails without a retry. For a response that is not JSON, the error message names the HTTP status and body format and includes a short preview with HTML tags removed. An empty, incomplete, or invalid JSON body on HTTP 200 is retried on a new connection, because the pooled connection is likely half-closed. The GitHub GraphQL API returns an empty HTTP 200 intermittently.

A 502 or 504 response also closes the pooled connection before the retry. For a paginated query, the retry after a 502, a 504, or the GitHub backend-timeout error requests a smaller page, stepping down a reverse Fibonacci sequence (for example, 100, 55, 34, 21), so an upstream that times out on large pages can still complete the refresh.

Separately from retries, the connector's per-origin rate limiter waits before each request while a `Retry-After` or `RateLimit` reset cooldown from an earlier response is in effect. See [Rate Control Parameters](./index.md#rate-control-parameters) to limit request rate and concurrency.

### Pagination

The connector supports cursor-based pagination. Each page is a separate HTTP request; pagination errors mid-sequence cause the entire refresh to fail. Use `json_pointer` to select the row collection and configure the pagination variables to match the upstream schema's cursor fields.

### Server Rate Limits

GraphQL APIs (GitHub, Shopify, etc.) typically enforce query-cost-based rate limits rather than request count. A rate limit reported with HTTP 429, or with a 4xx response whose JSON error message mentions a rate limit, is retried as described in [Retry Behavior](#retry-behavior). A cost or rate-limit error reported in the GraphQL `errors` array of an HTTP 200 response fails the request without a retry. Reduce refresh frequency or narrow the query to stay within budget.

### Rate Control

The GraphQL connector uses the shared HTTP [rate control parameters](./index.md#rate-control-parameters). Rate control is adaptive: when a request-rate or concurrency limit is configured, Spice sends fewer requests while the endpoint fails or times out, and returns to the configured limits as it recovers. A `rate_control_acquire_timeout` bounds how long a request waits for a permit (default `30s`; `0` waits indefinitely). See [Rate Control](../https/deployment.md#rate-control) in the HTTP(s) deployment guide for the full behavior.

Adaptive rate control classifies each request by its HTTP status. A `2xx` response counts as a success, `408`, `429`, `5xx`, timeouts, and connection errors count as failures, and other statuses are not counted. A GraphQL error returned in the body of a `200` response counts as a success, so query-cost limits that a GraphQL API reports in the response body do not throttle the endpoint.

## Capacity & Sizing

- **Throughput**: Bounded by the upstream rate limit, typical GraphQL endpoints cap at 100s-1000s of requests per minute.
- **Query cost**: Design `graphql_query` to request only the fields you need. Request fewer nested fields to reduce query cost.
- **Pagination depth**: Large datasets requiring hundreds of pages extend refresh duration linearly; plan refresh intervals accordingly.

## Metrics

When used as a dataset connector, GraphQL exposes per-origin HTTP rate-control metrics under the `graphql` component. They are registered automatically for every GraphQL dataset — no `metrics` configuration is required — and the limit gauges report `0` when the corresponding limit is not configured. The adaptive metrics have no series for an origin with no request limit, and the cluster metrics have one series per cluster budget (`limiter` attribute) only when [cluster rate control](../../../reference/spicepod/runtime#cluster-rate-control) is in use. Catalog components expose none:

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
| `rate_control_adaptive_admission_ratio`     | Gauge   | Fraction of the configured limits that adaptive rate control admits now, from `0` to `1` (`1` = all). Absent when the origin has no request limit, and with cluster rate control until the first window is leased. |
| `rate_control_adaptive_throttled_total`     | Counter | Total requests that adaptive rate control throttled. `0` while the origin stays healthy, and always `0` with cluster rate control. Absent when the origin has no request limit. |
| `rate_control_lease_granted`                | Gauge   | Cluster rate control only. Tokens this instance holds in the current window, per `limiter`.              |
| `rate_control_cluster_budget_remaining`     | Gauge   | Cluster rate control only. Tokens of the current window that no instance has leased, per `limiter`.      |
| `rate_control_lease_refresh_errors_total`   | Counter | Cluster rate control only. Total failures to read or write the shared rate-control state, per `limiter`. |
| `rate_control_fail_closed_total`            | Counter | Cluster rate control only. Total requests refused because the shared state was unreachable and this instance's lease had expired, per `limiter`. |

These metrics are auto-registered — no configuration is required to export them. To turn one off for a dataset, set `enabled: false` in the dataset's `metrics` section:

```yaml
datasets:
  - from: graphql:https://api.example.com/graphql
    name: api_data
    metrics:
      - name: rate_control_wait_duration_ms
        enabled: false
```

Instruments are exposed with the prefix `dataset_graphql_`, and each carries an `origin` attribute (`scheme://host:port`) identifying the upstream origin instead of a dataset `name`, because datasets sharing an origin share one rate controller. See [Component Metrics](../../../features/observability/component_metrics) for general configuration.

For broader observability, also monitor:

- Spice query execution metrics (`query_duration_ms`, `query_returned_rows`, `query_failures`) from `runtime.metrics`.
- The upstream GraphQL provider's rate-limit dashboards.

## Task History

GraphQL requests participate in [task history](../../../reference/task_history) through the HTTP client's span. Each page fetch is a child of the enclosing `sql_query` or `acceleration_refresh` task.

## Known Limitations

- **Read-only**: Only GraphQL queries (not mutations or subscriptions) are supported.
- **Single query per dataset**: Each dataset is one GraphQL query. Multi-query datasets require separate dataset definitions.
- **Schema inference**: The connector infers schema from the first response; schemas with deeply-nested optional fields may require an explicit dataset `schema` override.
- **Batching**: GraphQL query batching (multiple operations in one HTTP request) is not exposed.

## Troubleshooting

| Symptom                                        | Likely cause                                          | Resolution                                                                                  |
| ---------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `401 Unauthorized`                             | Wrong or expired token in `graphql_auth_token`.      | Rotate the token; verify the header format (`Bearer` prefix, etc.).                          |
| Rows missing from the dataset                  | Wrong `json_pointer`.                         | Inspect the response payload; JSON pointer must navigate to the array of rows.              |
| Refresh fails mid-pagination                   | Rate-limit or transient network failure.              | Transient errors are retried up to 5 times per page before the refresh fails. Reduce refresh frequency or narrow the query.   |
| `returned HTML instead of JSON (HTTP 200 OK)`  | Wrong endpoint URL, or a redirect to a login page.   | Verify the dataset `from` URL points at the GraphQL endpoint and that authentication is set. |
| `upstream returned an empty response body (HTTP 200)` | The endpoint returned an empty HTTP 200 on every try. | Check the upstream service status, then retry the refresh.                               |
| Query cost exceeded                            | Query requests too many nested fields.                | Simplify the query; fetch only required fields.                                             |
| Inferred schema differs between refreshes      | Optional fields appear/disappear in responses.        | Provide an explicit dataset `schema` to lock down types.                                    |
