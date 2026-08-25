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

HTTP-level retries cover 408 (request timeout) and 5xx (server errors) plus transient network errors. 429 responses are handled proactively by the built-in rate limiter rather than retried. Retries use fibonacci backoff with a maximum of 5 attempts.

### Pagination

The connector supports cursor-based pagination. Each page is a separate HTTP request; pagination errors mid-sequence cause the entire refresh to fail. Use `json_pointer` to select the row collection and configure the pagination variables to match the upstream schema's cursor fields.

### Server Rate Limits

GraphQL APIs (GitHub, Shopify, etc.) typically enforce query-cost-based rate limits rather than request count. When a query returns a cost/rate-limit error, the connector surfaces it immediately. Reduce refresh frequency or narrow the query to stay within budget.

## Capacity & Sizing

- **Throughput**: Bounded by the upstream rate limit, typical GraphQL endpoints cap at 100s-1000s of requests per minute.
- **Query cost**: Design `graphql_query` to request only the fields you need. Request fewer nested fields to reduce query cost.
- **Pagination depth**: Large datasets requiring hundreds of pages extend refresh duration linearly; plan refresh intervals accordingly.

## Metrics

When used as a dataset connector, GraphQL exposes per-origin HTTP rate-control metrics under the `graphql` component. They are registered automatically for every GraphQL dataset — no `metrics` configuration is required — and the limit gauges report `0` when the corresponding limit is not configured. Catalog components expose none:

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

GraphQL requests participate in [task history](../../../reference/task_history) through the HTTP client's span. Each page fetch is a child of the enclosing `sql_query` or `accelerated_table_refresh` task.

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
| Refresh fails mid-pagination                   | Rate-limit or transient network failure.              | Reduce refresh frequency; the connector will retry on retriable errors. Narrow the query.   |
| Query cost exceeded                            | Query requests too many nested fields.                | Simplify the query; fetch only required fields.                                             |
| Inferred schema differs between refreshes      | Optional fields appear/disappear in responses.        | Provide an explicit dataset `schema` to lock down types.                                    |
