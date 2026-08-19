---
title: 'HTTP(s) Data Connector'
sidebar_label: 'HTTP(s) Data Connector'
description: 'HTTP(s) Data Connector Documentation'
pagination_prev: null
---

The HTTP(s) Data Connector enables federated SQL query across [supported file formats](./#file-formats) stored at an HTTP(s) endpoint. The connector supports dynamic query and data refresh through SQL-based filtering.

```yaml
datasets:
  - from: http://static_username@localhost:3001/report.csv
    name: local_report
    params:
      http_password: ${env:MY_HTTP_PASS}
```

## Examples

### Basic Example

```yaml
datasets:
  - from: https://github.com/LAION-AI/audio-dataset/raw/7fd6ae3cfd7cde619f6bed817da7aa2202a5bc28/metadata/freesound/parquet/freesound_parquet.parquet
    name: laion_freesound
```

### Using Basic Authentication

```yaml
datasets:
  - from: http://static_username@localhost:3001/report.csv
    name: local_report
    params:
      http_password: ${env:MY_HTTP_PASS}
```

The username is taken from the `user-info` section of the `from` URL (`user@host`) or from the `http_username` parameter. The password comes from the `http_password` parameter. The connector then sends a standard [RFC 7617](https://datatracker.ietf.org/doc/html/rfc7617) Basic authentication header on every request:

```http
Authorization: Basic <base64(username:password)>
```

For example, `static_username` with password `s3cret` produces `Authorization: Basic c3RhdGljX3VzZXJuYW1lOnMzY3JldA==`. Only one of `http_password` or user info in the URL can provide the password — setting both is not supported.

### Using Custom Headers

Custom HTTP headers can be specified for authentication, API keys, or other requirements. Headers are treated as sensitive data and will not be logged.

`http_headers` applies to **dynamic JSON API endpoints only**. A structured HTTP file dataset — `csv`, `tsv`, `parquet`, `arrow`, `avro`, `jsonl`/`ndjson`/`ldjson`, `soda`, `socrata`, `vortex`, or a static `json` file — is served by the object-store listing path, which cannot carry request headers, so the headers are ignored and a warning is logged naming the dataset. To authenticate a structured file download, use [Basic authentication](#using-basic-authentication) (`http_username` / `http_password`, or user info in the URL).

```yaml
datasets:
  - from: https://api.example.com
    name: api_data
    params:
      http_headers: 'Authorization:Bearer ${secrets:api_token},Accept:application/json'
```

Headers can also be separated by semicolons:

```yaml
datasets:
  - from: https://api.example.com
    name: api_data
    params:
      http_headers: 'Authorization: Bearer ${secrets:api_token}; X-API-Key: ${secrets:api_key}'
```

### Using OAuth2 Refresh-Token Authentication

For JSON APIs protected by OAuth2, the connector can acquire short-lived access tokens from a token endpoint and keep them fresh automatically. The **refresh-token grant** (RFC 6749 §6) exchanges a long-lived refresh token; the **client-credentials grant** (RFC 6749 §4.4) authenticates with a `client_id`/`client_secret` for machine-to-machine APIs. On startup Spice hits the configured token endpoint once, then stamps `Authorization: Bearer <access_token>` on every data request (or a custom header — see [Custom Token Header](#custom-token-header)) and refreshes the token in the background before it expires.

```yaml
datasets:
  - from: https://api.example.com
    name: secure_data
    params:
      file_format: json
      allowed_request_paths: '/v1/**'
      auth_token_url: https://auth.example.com/oauth/token
      http_auth_refresh_token: ${secrets:my_refresh_token}
      http_auth_client_id: ${secrets:my_client_id}
      http_auth_client_secret: ${secrets:my_client_secret}
      auth_scopes: 'read:data offline_access'
```

The `http_auth_refresh_token`, `http_auth_client_id`, and `http_auth_client_secret` parameters can be loaded from any [supported secret store](../secret-stores/) (environment variables, Kubernetes Secrets, AWS Secrets Manager, HashiCorp Vault, the OS keychain, etc.) using the `${secrets:...}` [replacement syntax](../secret-stores/#using-secrets).

Applies to **dynamic JSON API endpoints only** (e.g. `file_format: json` with `allowed_request_paths`). A structured HTTP file dataset (csv/parquet/etc.) goes through the object-store listing path, which cannot attach an access token, so setting any OAuth2 parameter on one is **rejected at registration** — the dataset fails to load with a configuration error naming the parameters to remove, rather than quietly sending unauthenticated requests. `http_headers` is not applied on that path either; use [Basic authentication](#using-basic-authentication) to authenticate a structured file download.

See [OAuth2 Authentication](#oauth2-authentication) for the full parameter reference and behavior notes.

## Configuration

### `from`

The `from` field specifies the HTTP(s) endpoint and can be configured in two ways:

1. **Direct URL to a file**: A complete URL pointing to a specific [supported file](./#file-formats).

   ```yaml
   from: https://example.com/data/report.csv
   ```

2. **Base domain/path**: A base URL that will be combined with special metadata fields to construct the complete request.

   ```yaml
   from: https://api.example.com/v1
   ```

The connector supports templated URLs with query parameters that can be dynamically populated using `refresh_sql` filters and special metadata fields.

### `name`

The dataset name. This will be used as the table name within Spice.

Example:

```yaml
datasets:
  - from: http://static_username@localhost:3001/report.csv
    name: cool_dataset
    params: ...
```

```sql
SELECT COUNT(*) FROM cool_dataset;
```

```shell
+----------+
| count(*) |
+----------+
| 6001215  |
+----------+
```

The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords).

### `params`

The connector supports authentication, timeout, connection pooling, and retry configuration via `params`.

| Parameter Name             | Description                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `http_port`                | Optional. Port to create HTTP(s) connection over. Default: 80 and 443 for HTTP and HTTPS respectively.                                                                                                                                                                                                                                                                                                                                    |
| `http_username`            | Optional. Username for HTTP basic authentication. Default: None.                                                                                                                                                                                                                                                                                                                                                                          |
| `http_password`            | Optional. Password for HTTP basic authentication. Default: None. Use the [secret replacement syntax](../secret-stores/) to load the password from a secret store, e.g. `${secrets:my_http_pass}`.                                                                                                                                                                                                                                         |
| `http_headers`             | Optional. Custom HTTP headers as a comma-separated list of `key:value` pairs. Example: `Content-Type:application/json,Accept:application/json`. Applies to dynamic JSON API endpoints only; structured HTTP file datasets ignore these headers. Default: None.                                                                                                                                                                                                                                                                            |
| `allowed_request_paths`    | **Required** for using `request_path` filters. Comma-separated list of allowed paths. Example: `/api/users,/api/posts`. Paths must start with `/` and cannot contain `..` segments.                                                                                                                                                                                                                                                       |
| `request_query_filters`    | Optional. Set to `enabled` to enable `request_query` filters. Default: `disabled`. When disabled, query parameter filters will be rejected.                                                                                                                                                                                                                                                                                               |
| `request_body_filters`     | Optional. Set to `enabled` to enable `request_body` filters for POST requests. Default: `disabled`. When disabled, request body filters will be rejected.                                                                                                                                                                                                                                                                                 |
| `client_timeout`           | Optional. Maximum time to wait for a response from the HTTP server (in seconds). Default: `30`. Applied to the entire request-response cycle.                                                                                                                                                                                                                                                                                             |
| `connect_timeout`          | Optional. Timeout for establishing HTTP(s) connections (in seconds). Default: `10`.                                                                                                                                                                                                                                                                                                                                                       |
| `pool_max_idle_per_host`   | Optional. Maximum number of idle connections to keep alive per host. Default: `10`.                                                                                                                                                                                                                                                                                                                                                       |
| `pool_idle_timeout`        | Optional. Timeout for idle connections in the pool (in seconds). Default: `90`.                                                                                                                                                                                                                                                                                                                                                           |
| `max_retries`              | Optional. Maximum number of retries for failed HTTP requests. Default: `3`.                                                                                                                                                                                                                                                                                                                                                               |
| `retry_backoff_method`     | Optional. Retry backoff strategy: `fibonacci` (default), `linear`, or `exponential`.                                                                                                                                                                                                                                                                                                                                                      |
| `retry_max_duration`       | Optional. Maximum total duration for all retries (e.g., `30s`, `5m`). If not set, retries continue up to `max_retries`.                                                                                                                                                                                                                                                                                                                   |
| `retry_jitter`             | Optional. Randomization factor for retry delays (0.0 to 1.0). Default: `0.3` (30% randomization). Set to `0` for no jitter.                                                                                                                                                                                                                                                                                                               |
| `max_request_query_length` | Optional. Maximum length in characters for `request_query` filter values. Default: `1024`. Maximum: `4096`.                                                                                                                                                                                                                                                                                                                               |
| `max_request_body_bytes`   | Optional. Maximum size in bytes for `request_body` filter values. Default: `16384` (16 KiB). Maximum: `65536` (64 KiB).
| `request_header_filters`   | Optional. Set to `enabled` to allow `request_headers` filters to push down dynamic HTTP request headers. Default: `disabled`. Requires `request_header_allowlist`.
| `request_header_allowlist` | Comma-separated list of HTTP header names that `request_headers` filters may set (e.g., `x-sandbox-id, x-region`). **Required** when `request_header_filters` is enabled. The `authorization` header cannot be allowlisted when HTTP authentication is configured.
| `max_request_headers_length` | Optional. Maximum size in bytes for `request_headers` filter values. Default: `16384` (16 KiB).
| `max_request_partitions`   | Optional. Maximum number of HTTP request partitions created from the cross product of `request_path`, `request_query`, `request_body`, and `request_headers` filters. If unset, partition count is unlimited.                                                                                                                                                                                                                                                                                                                   |
| `health_probe`             | Optional. Custom health probe path for endpoint validation during initialization (e.g., `/health`, `/api/status`). The endpoint must return a 2xx status code to pass validation. If not set, a random path is used and any status (including 404) is accepted. Must start with `/`.                                                                                                                                                      |
| `auth_token_url`           | Optional. OAuth2 token endpoint URL (must be HTTPS; `http://localhost` and loopback IPs are allowed for local testing). Enables OAuth2: the connector acquires short-lived access tokens (refresh-token grant by default, or `client_credentials` via `auth_grant_type`) and attaches them to all data requests (`Authorization: Bearer <token>` by default, or the bare token under a custom `auth_header_name`). Applies to dynamic JSON API endpoints only; structured HTTP file datasets reject OAuth2 params. See [OAuth2 Authentication](#oauth2-authentication). |
| `auth_grant_type`          | Optional. OAuth2 grant type: `refresh_token` (default, RFC 6749 §6) or `client_credentials` (RFC 6749 §4.4). `client_credentials` authenticates with `http_auth_client_id`/`http_auth_client_secret` and issues no refresh token.                                                                                                                                                                                                          |
| `http_auth_refresh_token`  | Optional. OAuth2 refresh token exchanged against `auth_token_url` to obtain access tokens. **Required** when `auth_token_url` is set with the (default) refresh-token grant; not used by the `client_credentials` grant. Use a secret store, e.g. `${secrets:my_refresh_token}`.                                                                                                                                                            |
| `http_auth_client_id`      | Optional. OAuth2 `client_id` presented to the token endpoint. Required for confidential clients; optional for public clients. Must be paired with `http_auth_client_secret` for confidential clients.                                                                                                                                                                                                                                     |
| `http_auth_client_secret`  | Optional. OAuth2 `client_secret` presented to the token endpoint. Required when the client is confidential; must be set together with `http_auth_client_id`. Use a secret store, e.g. `${secrets:my_client_secret}`.                                                                                                                                                                                                                      |
| `auth_scopes`              | Optional. Space-separated OAuth2 scopes to request when refreshing (e.g. `read:data offline_access`). Omit to inherit the scopes bound to the refresh token.                                                                                                                                                                                                                                                                              |
| `auth_client_auth`         | Optional. How client credentials are sent to the token endpoint: `basic` (HTTP Basic header, default per RFC 6749 §2.3.1) or `body` (`client_id`/`client_secret` in the form body). Default: `basic`.                                                                                                                                                                                                                                     |
| `auth_header_name`         | Optional. HTTP header that carries the access token. Default: `Authorization` (sends `Bearer <token>`). Any other name (e.g. `X-Shopify-Access-Token`) sends the bare token instead.                                                                                                                                                                                                                                                      |

#### Mutual TLS (mTLS) Client Authentication

For upstream servers that require mutual TLS, the connector can present a client certificate during the TLS handshake. Provide the certificate and key either as file paths or inline PEM — the file-path and inline forms are mutually exclusive, and the certificate and key must always be set together. mTLS client identity applies to dynamic JSON API endpoints only; structured HTTP file datasets reject these parameters.

| Parameter Name                     | Description                                                                                                                                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `http_tls_client_certificate_file` | Optional. Path to a PEM client certificate chain to present during the TLS handshake. Must be set together with `http_tls_client_key_file`. Mutually exclusive with the inline forms.   |
| `http_tls_client_key_file`         | Optional. Path to the PEM private key matching `http_tls_client_certificate_file`. Must be set together with it. Mutually exclusive with the inline forms.                              |
| `http_tls_client_certificate`      | Optional. Inline PEM client certificate chain (or `${secrets:...}` reference). Must be set together with `http_tls_client_key`. Mutually exclusive with the file-path forms.            |
| `http_tls_client_key`              | Optional. Inline PEM private key (or `${secrets:...}` reference) matching `http_tls_client_certificate`. Must be set together with it. Mutually exclusive with the file-path forms.     |

#### Rate Control Parameters

HTTP-based connectors share a rate control system that limits concurrency and request rate per upstream origin. These parameters can be set per-dataset (in `params`) or globally (in `runtime.params`). Dataset-level settings override the global defaults.

| Parameter Name              | Description                                                                                                                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `max_concurrent_requests`   | Maximum number of concurrent HTTP requests to the same upstream origin. Overrides `runtime.params.http_max_concurrent_requests`. If both are unset, concurrency limiting is disabled.         |
| `requests_per_second_limit` | Maximum number of HTTP requests per second to the same upstream origin. Overrides `runtime.params.http_requests_per_second_limit`. If both are unset, no per-second rate limit is applied.    |
| `requests_per_minute_limit` | Maximum number of HTTP requests per minute to the same upstream origin. Overrides `runtime.params.http_requests_per_minute_limit`. If both are unset, no per-minute rate limit is applied.    |
| `rate_control_jitter_min`   | Minimum random delay added before HTTP requests when rate control is active. Accepts durations such as `5ms` or `0ms`. Defaults to `5ms` when a request-rate limit is configured.            |
| `rate_control_jitter_max`   | Maximum random delay added before HTTP requests when rate control is active. Accepts durations such as `10ms` or `0ms`. Defaults to `10ms` when a request-rate limit is configured.          |

Multiple datasets targeting the same origin share the same rate controller, ensuring the limits apply across all datasets for that origin.

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
      max_concurrent_requests: 3        # Override: this dataset uses at most 3 concurrent requests
```

#### Pagination Parameters

| Parameter Name                 | Description                                                                                                                                                                                                                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pagination`                   | Optional. Pagination mode: `auto` (default) auto-detects `Link` headers, `enabled` explicitly enables pagination with configuration below, `disabled` turns off pagination.                                                                                                       |
| `pagination_next_pointer`      | Optional. JSON pointer ([RFC 6901](https://datatracker.ietf.org/doc/html/rfc6901)) to the next page URL or cursor in the response body (e.g., `/next`, `/pagination/cursor`, `/links/next`).                                                                                      |
| `pagination_link_header`       | Optional. Whether to follow HTTP `Link` headers with `rel="next"` for pagination. Default: `enabled`. Set to `disabled` to ignore `Link` headers.                                                                                                                                 |
| `pagination_token_param`       | Optional. When set, the value from `pagination_next_pointer` is treated as a cursor/token and passed as this query parameter name in subsequent requests. When not set, the value is treated as a full URL.                                                                       |
| `pagination_data_pointer`      | Optional. JSON pointer ([RFC 6901](https://datatracker.ietf.org/doc/html/rfc6901)) to the data array in each page's response (e.g., `/data`, `/results`, `/items`). When set, only the array at this path is returned as data rows.                                               |
| `pagination_max_pages`         | Optional. Maximum number of pages to fetch. Default: `100`. Set to `nolimit` to disable the page cap and fetch all available pages.                                                                                                                                                |
| `pagination_data_map_to_array` | Optional. When `enabled`, if the data at `pagination_data_pointer` (or the top-level response) is a JSON object/map, extracts its values as rows instead of treating it as a single row. Default: `disabled`. Requires pagination to be enabled.                                  |
| `pagination_query_params`      | Optional. Query parameter template for client-driven pagination. Supports `{offset}`, `{limit}`, and `{page}` variables (e.g., `offset={offset}&limit={limit}`). Requires `pagination_page_size`. Mutually exclusive with `pagination_next_pointer` and `pagination_token_param`. |
| `pagination_page_size`         | Optional. Number of items per page for query-parameter pagination. Must be a positive integer. Expands `{limit}` in `pagination_query_params` and detects the last page (fewer results than `page_size` means done). Requires `pagination_query_params`.                          |

### Caching Mode Parameters

When using [`refresh_mode: caching`](../../features/data-acceleration/refresh-modes/caching), cache freshness is controlled by additional parameters placed under `acceleration.params` — **not** under the top-level `params` block.

| Parameter                            | Description                                                                                                                                                       | Default    |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `caching_ttl`                        | How long cached data is considered fresh. After this period, data becomes stale and a background refresh is triggered. **Defaults to `30s`.**                     | `30s`      |
| `caching_stale_while_revalidate_ttl` | How long after `caching_ttl` expires to continue serving stale data while a background refresh runs. If omitted, queries wait for fresh data once TTL expires.    | None       |
| `caching_stale_if_error`             | When set to `enabled`, serves expired cached data if the upstream source returns an error rather than failing the query.                                           | `disabled` |

:::warning[`caching_ttl` defaults to 30 seconds]
If you set `refresh_check_interval: 15m` but leave `caching_ttl` at its default, cached entries are considered stale after only **30 seconds** — not 15 minutes. Always set `caching_ttl` explicitly to match your intended freshness window.
:::

```yaml
datasets:
  - from: https://api.example.com/v1
    name: api_cache
    params:
      file_format: json
      allowed_request_paths: '/data/**'
      request_query_filters: enabled
    acceleration:
      enabled: true
      refresh_mode: caching
      refresh_check_interval: 15m
      on_zero_results: use_source
      params:
        caching_ttl: 15m                        # explicit — default is only 30s
        caching_stale_while_revalidate_ttl: 5m  # serve stale data while refreshing
```

See [Caching Refresh Mode](../../features/data-acceleration/refresh-modes/caching) for full TTL semantics, stale-while-revalidate behaviour, and cache persistence options.

## HTTP Response Headers

When querying HTTP(s) datasets, Spice respects standard HTTP caching headers in responses. The connector supports the following cache-related response headers:

### `Cache-Control`

The `Cache-Control` response header from the HTTP(s) endpoint is passed through to clients querying Spice. When the HTTP(s) server returns a `Cache-Control` header with the `stale-while-revalidate` directive, clients can use this value to determine appropriate caching behavior.

For example, if the HTTP(s) endpoint returns:

```
Cache-Control: max-age=10, stale-while-revalidate=10
```

Clients querying Spice will receive this header and can:

1. Serve fresh data for 10 seconds after fetching.
2. Between 10-20 seconds, serve stale data while fetching fresh data in the background.
3. After 20 seconds, fetch fresh data before serving the next request.

The stale-while-revalidate behavior in Spice is controlled by the `stale_while_revalidate_ttl` parameter in the [caching configuration](../../features/caching#stale-while-revalidate). When `stale_while_revalidate_ttl` is set to `0` (default), stale data will not be served. When set to a non-zero value, Spice serves stale cache entries while revalidating in the background.

## Advanced Features

The HTTP connector provides advanced capabilities for working with dynamic APIs and RESTful services, including built-in pagination and special metadata fields.

### Pagination

The HTTP connector supports automatic pagination for REST APIs that return data across multiple pages. Pagination is configured via `params` and works transparently with acceleration (caching, append, and full refresh modes) — each page is streamed as a separate batch without buffering entire result sets in memory.

#### Pagination Modes

There are three pagination modes:

**URL mode** — The next page URL is extracted from the response body (via `pagination_next_pointer`) or from the HTTP `Link` header with `rel="next"`.

```yaml
datasets:
  - from: https://api.example.com/v1/items
    name: items
    params:
      pagination: enabled
      pagination_next_pointer: /links/next
      pagination_data_pointer: /data
      pagination_max_pages: 50
```

**Token mode** — A cursor/token is extracted from the response body (via `pagination_next_pointer`) and passed as a query parameter (specified by `pagination_token_param`) in subsequent requests.

```yaml
datasets:
  - from: https://api.example.com/v1/items
    name: items
    params:
      pagination: enabled
      pagination_next_pointer: /pagination/cursor
      pagination_token_param: cursor
      pagination_data_pointer: /results
```

**Query-parameter mode** — The client drives pagination by expanding a template (`pagination_query_params`) with `{offset}`, `{limit}`, and `{page}` variables. Pagination stops when a page returns fewer rows than `pagination_page_size`.

```yaml
datasets:
  - from: https://api.example.com/v1/widgets
    name: widgets
    params:
      pagination: enabled
      pagination_query_params: "offset={offset}&limit={limit}"
      pagination_page_size: "100"
      pagination_max_pages: "50"
```

#### Map-to-Array Conversion

Some APIs return data as a JSON object/map (e.g., `{"1": {...}, "2": {...}}`) instead of an array. Set `pagination_data_map_to_array: enabled` to extract the map values as individual rows.

```yaml
datasets:
  - from: https://api.example.com/v1/records
    name: records
    params:
      pagination: enabled
      pagination_data_map_to_array: enabled
      pagination_query_params: "offset={offset}&limit={limit}"
      pagination_page_size: "100"
```

#### Auto Mode

By default, `pagination` is set to `auto`, which automatically follows HTTP `Link` headers with `rel="next"` if present in responses. Set `pagination: disabled` to turn off all pagination behavior, or `pagination: enabled` to explicitly configure pagination with the parameters above.

#### Validation Rules

- `pagination_query_params` requires `pagination_page_size` (and vice versa)
- `pagination_query_params` is mutually exclusive with `pagination_next_pointer` and `pagination_token_param`
- `pagination_query_params` must contain `{offset}` or `{page}` to ensure pages advance
- `pagination_token_param` requires `pagination_next_pointer`
- `pagination_next_pointer` and `pagination_data_pointer` must be valid JSON pointers starting with `/`

#### SSRF Protection

When using URL mode, next-page URLs extracted from response bodies are validated to share the same origin as the base URL configured in `from`. Cross-origin redirects are rejected.

### Special Metadata Fields

The HTTP connector supports special metadata fields that provide fine-grained control over HTTP requests. These fields can be included in your dataset schema to dynamically construct request URLs and payloads.

:::warning Security Requirements
For security, these metadata fields require explicit configuration to prevent unauthorized access:

- `request_path` requires `allowed_request_paths` to be configured with glob patterns
- `request_query` requires `request_query_filters: enabled`
- `request_body` requires `request_body_filters: enabled`
- `request_headers` requires `request_header_filters: enabled` and `request_header_allowlist`
  :::

| Field Name        | Type   | Description                                                                                                                                                                                                                                                                                                                                                    |
| ----------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request_path`    | String | Specifies the URL path to append to the base URL from the `from` field. When using a base domain/path in `from`, `request_path` constructs the complete endpoint. Example: If `from: https://api.example.com` and `request_path: /users/123`, the request will be made to `https://api.example.com/users/123`. **Requires `allowed_request_paths` parameter.** |
| `request_query`   | String | Defines query parameters to append to the request URL. Formatted as a query string (e.g., `key1=value1&key2=value2`). These parameters are appended to the URL after any path specified in `request_path`. **Requires `request_query_filters: enabled`.** Maximum length: configurable via `max_request_query_length` (default: 1024 characters).              |
| `request_body`    | String | Contains the request body for POST/PUT requests. Typically used with REST APIs that require a JSON or form-encoded payload. The content type should be specified using `http_headers`. **Requires `request_body_filters: enabled`.** Maximum size: configurable via `max_request_body_bytes` (default: 16 KiB).                                                |
| `request_headers` | String | A JSON object of HTTP request headers to set on a per-request basis (e.g., `'{"x-sandbox-id":"sandbox-1"}'`). Only headers listed in `request_header_allowlist` are permitted. **Requires `request_header_filters: enabled` and `request_header_allowlist`.** Maximum size: configurable via `max_request_headers_length` (default: 16 KiB).                   |

These metadata fields work in combination:

- If `from` specifies a complete file URL, these fields are ignored
- If `from` specifies a base URL, these fields construct the full request dynamically
- `request_path` is appended to the base URL
- `request_query` is appended as query parameters
- `request_body` is sent as the request payload (requires appropriate HTTP method configuration)
- `request_headers` sets per-request HTTP headers (allowlisted names only)

:::note OR filter restriction
`OR` expressions across **different** filter columns (e.g., `WHERE request_query = 'a' OR request_headers = 'b'`) are rejected because the connector would issue a single combined HTTP request instead of separate ones. Use `UNION ALL` for alternative requests across different columns. `OR` within a single column (e.g., `WHERE request_path = '/a' OR request_path = '/b'`) is supported.
:::

### Response Metadata Fields

In addition to request metadata, the HTTP connector includes response metadata fields in the dataset schema. These fields capture information about the HTTP response and are available in SQL queries.

| Field Name         | Type                   | Description                                                                                                                                                                                 |
| ------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content`          | String                 | The response body content.                                                                                                                                                                  |
| `response_status`  | UInt16                 | The HTTP status code of the response (e.g., `200`, `404`, `500`).                                                                                                                           |
| `response_headers` | Map(String, String)    | The HTTP response headers as key-value pairs. Each header name maps to its value. Available for inspection in queries, e.g., to check `content-type` or custom headers returned by the API. |
| `_fetched_at`      | Timestamp (Nanosecond) | The timestamp when the data was fetched. Uses the HTTP `Date` response header when available, falling back to the current system time. Always present in the dataset schema, even when not declared explicitly — this is required for caching TTL eviction and for append-mode datasets that set `time_column: _fetched_at`. |

#### Querying Response Metadata

```sql
-- Check the HTTP status of cached responses
SELECT request_path, response_status, _fetched_at
FROM my_http_dataset;

-- Inspect response headers
SELECT request_path, response_headers
FROM my_http_dataset
WHERE request_path = '/api/data';
```

:::note
When using [caching refresh mode](../../features/data-acceleration/refresh-modes/caching), transient HTTP error responses (5xx server errors and 429 Too Many Requests) are automatically excluded from the cache. These responses are still returned to the querying client but are not persisted, preventing temporary failures from polluting cached data.
:::

### Metadata Columns with JSON Schema Decomposition

When a dataset uses JSON schema decomposition (`metadata.json_object: "*"`), columns whose names match a reserved HTTP metadata field are populated from the HTTP request/response — with their original Arrow types — instead of being decomposed from the JSON body. This lets a single dataset expose both decomposed body columns and typed HTTP metadata.

Reserved metadata field names: `request_path`, `request_query`, `request_body`, `request_headers`, `content`, `response_status`, `response_headers`, `_fetched_at`. `_fetched_at` is auto-injected into the schema even when not declared.

```yaml
datasets:
  - from: https://api.tvmaze.com/shows
    name: tvmaze_shows
    columns:
      - name: request_path        # Utf8, from HTTP request metadata
      - name: response_status     # UInt16, from HTTP response metadata
      - name: _fetched_at         # Timestamp(ns), from response Date header (auto-injected if omitted)
      - name: id                  # Utf8, decomposed from JSON body
      - name: name                # Utf8, decomposed from JSON body
      - name: premiered           # Utf8, decomposed from JSON body
      - name: details             # catch-all for remaining JSON keys
        metadata:
          json_object: "*"
```

```sql
SELECT id, name, response_status, _fetched_at
FROM tvmaze_shows
WHERE request_path = '/shows/1' AND response_status = 200;
```

Metadata columns retain their native types (`UInt16` for `response_status`, `Timestamp(Nanosecond)` for `_fetched_at`, `Map(String, String)` for `response_headers`), while body-derived columns are `Utf8`. `_fetched_at` is appended to the schema automatically when omitted, so caching TTL eviction and `time_column: _fetched_at` work without requiring the column to be declared.

**Collision rules:**

- A JSON body key that collides with a reserved metadata name is dropped — it does not shadow the real HTTP value and does not leak into the catch-all column.
- Declaring the catch-all column itself (`json_object: "*"`) with a reserved metadata name is rejected at registration time.
- Datasets that don't use JSON schema decomposition are unaffected.

### Endpoint Validation

The HTTP connector validates the configured endpoint during initialization to detect issues such as DNS errors, connection problems, or invalid URLs early in the startup process.

#### Default Validation Behavior

By default, the connector performs a health check by requesting a randomly generated path (e.g., `/__spice_health_check_abc123def456`) that is expected to return a 404 status. Any HTTP response, including 404 Not Found, indicates that the endpoint is reachable and the dataset will initialize successfully.

This default behavior works for most HTTP endpoints but may not be suitable for APIs that:

- Return error responses for unknown paths without proper HTTP status codes
- Have strict path validation that rejects requests to non-existent endpoints
- Require authentication for all paths, including health check endpoints

#### Custom Health Probe

For endpoints that require a specific health check path, configure the `health_probe` parameter:

```yaml
datasets:
  - from: https://api.example.com/v1
    name: api_data
    params:
      health_probe: /health
```

When a custom health probe is configured:

- The connector validates the endpoint by requesting the specified path
- The health probe endpoint must return a 2xx status code (200-299) for validation to succeed
- If the health probe returns a non-2xx status code, the dataset will fail to initialize with an error message

This provides more reliable validation for APIs with dedicated health check endpoints.

##### Example with Authentication

```yaml
datasets:
  - from: https://api.example.com
    name: authenticated_api
    params:
      http_headers: 'Authorization:Bearer ${secrets:api_token}'
      health_probe: /api/status
```

In this configuration, the health probe request to `/api/status` will include the authentication header, ensuring that the validation succeeds for APIs that require authentication on all endpoints.

##### Health Probe Requirements

The `health_probe` parameter has the following requirements:

- Must start with `/`
- Cannot exceed 2048 characters in length
- The target endpoint must return a 2xx HTTP status code for validation to succeed

### OAuth2 Authentication

The HTTP connector supports two OAuth2 grants for JSON APIs — the **refresh-token grant** (RFC 6749 §6, the default) and the **client-credentials grant** (RFC 6749 §4.4). Both acquire short-lived access tokens from a token endpoint and keep them fresh in the background. For the (default) refresh-token grant, given a long-lived refresh token and a token endpoint, Spice will:

1. Exchange the refresh token for an access token at dataset startup.
2. Attach the access token to every data request — `Authorization: Bearer <access_token>` by default, or under a custom header (see [Custom Token Header](#custom-token-header)).
3. Refresh the access token in the background, 60 seconds before it expires, for the lifetime of the process.
4. Honor rotated refresh tokens — when the token endpoint returns a new `refresh_token`, Spice uses it for the next exchange.

The [client-credentials grant](#client-credentials-grant) is designed for machine-to-machine APIs that authenticate with a `client_id`/`client_secret` and issue no refresh token; it re-runs the same token exchange in the background before expiry. In both cases Spice does **not** perform an interactive authorization flow (the authorization-code and device-code flows are not exposed), nor does it retry data requests on 401 — keeping the token continuously fresh in the background is the only recovery path.

#### Basic Configuration

```yaml
datasets:
  - from: https://api.example.com
    name: secure_data
    params:
      file_format: json
      allowed_request_paths: '/v1/**'
      auth_token_url: https://auth.example.com/oauth/token
      http_auth_refresh_token: ${secrets:my_refresh_token}
      http_auth_client_id: ${secrets:my_client_id}
      http_auth_client_secret: ${secrets:my_client_secret}
```

#### Parameter Reference

| Parameter                 | Kind              | Required        | Description                                                                                                                                                             |
| ------------------------- | ----------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth_token_url`          | runtime           | yes (for OAuth) | OAuth2 token endpoint URL. Must be HTTPS; `http://localhost`, `http://127.0.0.1`, and `http://[::1]` are accepted for local testing.                                    |
| `auth_grant_type`         | runtime           | no              | OAuth2 grant type: `refresh_token` (default, RFC 6749 §6) or `client_credentials` (RFC 6749 §4.4). See [Client-Credentials Grant](#client-credentials-grant).           |
| `http_auth_refresh_token` | component, secret | refresh-token   | Long-lived refresh token. Exchanged on startup for the first access token. **Required** for the (default) refresh-token grant; must not be set for `client_credentials`. Can be loaded from any [supported secret store](../secret-stores/) via `${secrets:...}`. |
| `http_auth_client_id`     | component, secret | confidential    | `client_id`. Required for confidential clients and for the `client_credentials` grant, optional for public clients. When set together with `http_auth_client_secret`, both are sent to the token endpoint. |
| `http_auth_client_secret` | component, secret | confidential    | `client_secret`. Must be paired with `http_auth_client_id`; required for the `client_credentials` grant. Can be loaded from any [supported secret store](../secret-stores/) via `${secrets:...}`.       |
| `auth_scopes`             | runtime           | no              | Space-separated OAuth2 scopes (e.g. `read:data offline_access`). Omit to inherit the scopes bound to the refresh token.                                                 |
| `auth_client_auth`        | runtime           | no              | How client credentials are sent to the token endpoint: `basic` (default, HTTP Basic header per RFC 6749 §2.3.1) or `body` (as `client_id`/`client_secret` form fields). |
| `auth_header_name`        | runtime           | no              | HTTP header that carries the access token. Default `Authorization` (sends `Bearer <token>`); any other name sends the bare token (e.g. `X-Shopify-Access-Token`). See [Custom Token Header](#custom-token-header). |

:::tip Parameter naming convention
Component/secret parameters carry the `http_` prefix when set in a dataset (`http_auth_refresh_token`, `http_auth_client_id`, `http_auth_client_secret`). Runtime parameters do not (`auth_token_url`, `auth_grant_type`, `auth_scopes`, `auth_client_auth`, `auth_header_name`). This follows the same convention as `http_password` vs `client_timeout`.
:::

:::tip Loading secrets from a secret store
The refresh token and client secret should never be committed to source. Reference them from any [supported secret store](../secret-stores/) — environment variables, Kubernetes Secrets, AWS Secrets Manager, HashiCorp Vault, or the OS keychain — using the `${secrets:...}` [replacement syntax](../secret-stores/#using-secrets). For example, with Kubernetes Secrets enabled:

```yaml
params:
  auth_token_url: https://auth.example.com/oauth/token
  http_auth_refresh_token: ${secrets:my_refresh_token}
  http_auth_client_id: ${secrets:my_client_id}
  http_auth_client_secret: ${secrets:my_client_secret}
```
:::

#### Public Clients (No Client Secret)

For public clients the `client_secret` is omitted. If you still want to send a `client_id` for correlation, set `http_auth_client_id` without `http_auth_client_secret`:

```yaml
params:
  auth_token_url: https://auth.example.com/oauth/token
  http_auth_refresh_token: ${secrets:my_refresh_token}
  http_auth_client_id: ${secrets:my_public_client_id}
```

#### Sending Credentials in the Body Instead of Basic Auth

Some token endpoints require `client_id`/`client_secret` in the form body rather than via the HTTP Basic header. Set `auth_client_auth: body`:

```yaml
params:
  auth_token_url: https://auth.example.com/oauth/token
  http_auth_refresh_token: ${secrets:my_refresh_token}
  http_auth_client_id: ${secrets:my_client_id}
  http_auth_client_secret: ${secrets:my_client_secret}
  auth_client_auth: body
```

#### Client-Credentials Grant

For machine-to-machine APIs that authenticate with a `client_id`/`client_secret` and issue no refresh token, set `auth_grant_type: client_credentials`. Both `http_auth_client_id` and `http_auth_client_secret` are required, and `http_auth_refresh_token` must **not** be set:

```yaml
params:
  auth_token_url: https://auth.example.com/oauth/token
  auth_grant_type: client_credentials
  http_auth_client_id: ${secrets:my_client_id}
  http_auth_client_secret: ${secrets:my_client_secret}
  auth_scopes: 'read:data'
```

Spice re-runs the client-credentials exchange in the background before the access token expires, reusing the same refresh machinery as the refresh-token grant. `auth_client_auth` (`basic`/`body`) applies to this grant as well.

#### Custom Token Header

By default the access token is attached as `Authorization: Bearer <token>`. Some APIs expect the token in a non-standard header and without the `Bearer` prefix — for example the Shopify Admin API uses `X-Shopify-Access-Token`. Set `auth_header_name` to send the bare token under that header instead:

```yaml
params:
  auth_token_url: https://auth.example.com/oauth/token
  auth_grant_type: client_credentials
  auth_header_name: X-Shopify-Access-Token
  http_auth_client_id: ${secrets:my_client_id}
  http_auth_client_secret: ${secrets:my_client_secret}
```

`auth_header_name` is independent of the grant type — it works with the refresh-token grant too.

#### Local Testing

The connector rejects `http://` token URLs by default, but allows `http://localhost`, `http://127.0.0.1`, and `http://[::1]` so you can run a mock OAuth server for development:

```yaml
params:
  auth_token_url: http://localhost:8080/oauth/token
  http_auth_refresh_token: local-dev-token
```

#### Error Behavior

The connector classifies token-endpoint errors to make remediation easy:

- **Configuration errors** (fail-fast at dataset init, surfaces as `InvalidConfiguration`):
  - Malformed or insecure `auth_token_url`
  - Token endpoint returns `400`, `401`, or `403` (typically an invalid refresh token, client credentials, or scope)
  - Token endpoint returns a non-`Bearer` `token_type`
  - Incomplete config (e.g. `http_auth_refresh_token` without `auth_token_url`, or `http_auth_client_secret` without `http_auth_client_id`)
  - `auth_grant_type: client_credentials` without both `http_auth_client_id` and `http_auth_client_secret`, or with `http_auth_refresh_token` set (the client-credentials grant issues no refresh token)
  - Both OAuth2 auth *and* an `Authorization` header in `http_headers` — remove one
- **Transient / connection errors** (surfaces as `UnableToConnect`, retried in the background):
  - Network / TLS failures
  - `5xx`, `408`, or `429` from the token endpoint
  - Parse failures on the token response

Error bodies returned by the token endpoint are truncated to 512 bytes and whitespace-collapsed before being surfaced in errors or logs, so hostile or misbehaving endpoints cannot force unbounded buffering or leak multi-line payloads into logs.

#### Limitations

- **Dynamic JSON APIs only.** A structured HTTP file dataset (csv, parquet, etc.) is served by the object-store listing path, which cannot attach an access token. Setting any OAuth2 parameter on one fails registration with a configuration error naming the parameters to remove, rather than sending unauthenticated requests. `http_headers` is not applied on that path either — use [Basic authentication](#using-basic-authentication) to authenticate a structured file download.
- **No interactive auth flows.** The refresh-token and client-credentials grants are supported; the authorization-code and device-code flows are not. For the refresh-token grant, obtain the initial refresh token out-of-band.
- **No 401→refresh-and-retry.** Background refresh keeps the token fresh; if a data request 401s, it propagates to the caller.
- **One authenticator per dataset.** Configure either OAuth2 or an `Authorization` header in `http_headers`, not both — the connector rejects the combination at registration time.

## Advanced Usage

### Using Special Metadata Fields with Base URL

When using a base URL with special metadata fields, you can dynamically construct different API endpoints:

```yaml
datasets:
  - from: https://api.example.com/v1
    name: api_requests
    params:
      http_headers: 'Content-Type:application/json'
      allowed_request_paths: '/users,/data/upload,/api/**'
      request_query_filters: enabled
      request_body_filters: enabled
```

With the above configuration, you can query different endpoints by providing values for the special metadata fields:

```sql
-- Query a specific user endpoint
SELECT * FROM api_requests
WHERE request_path = '/users/123' AND request_query = 'include=profile,settings';

-- Make a POST request with a body
SELECT * FROM api_requests
WHERE request_path = '/data/upload' AND request_body = '{"name":"example","value":42}';
```

The connector will construct requests like:

- `https://api.example.com/v1/users/123?include=profile,settings`
- `https://api.example.com/v1/data/upload` with the JSON body

#### Securing Paths with Glob Patterns

The `allowed_request_paths` parameter supports glob patterns to flexibly and securely match request paths. This provides a flexible way to configure path filtering without listing every possible endpoint.

**Pattern Types:**

- **Single wildcard (`*`)**: Matches any characters within a single path segment
  - Example: `/shows/*` matches `/shows/123` and `/shows/breaking-bad`
  - Does not match across path separators: `/shows/*` does not match `/shows/123/episodes`

- **Recursive wildcard (`**`)\*\*: Matches any number of path segments
  - Example: `/api/**` matches `/api/users`, `/api/v1/users`, and `/api/v2/posts/123`
  - Use for flexible API version matching or deep hierarchies

- **Character classes (`[...]`)**: Matches one character from a set
  - Example: `/api/v[0-9]/*` matches `/api/v1/users` and `/api/v2/posts`
  - Example: `/api/v[1-3]/*` matches `/api/v1/users`, `/api/v2/posts`, and `/api/v3/data`

**Examples:**

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: tv_api
    params:
      # Match any show ID
      allowed_request_paths: '/shows/*'
```

```sql
-- Matches because /shows/82 matches the pattern /shows/*
SELECT * FROM tv_api WHERE request_path = '/shows/82';
```

```yaml
datasets:
  - from: https://api.example.com
    name: versioned_api
    params:
      # Match all endpoints under any API version
      allowed_request_paths: '/api/**'
```

```sql
-- All of these match the pattern /api/**
SELECT * FROM versioned_api WHERE request_path = '/api/users';
SELECT * FROM versioned_api WHERE request_path = '/api/v1/users';
SELECT * FROM versioned_api WHERE request_path = '/api/v2/products/electronics';
```

```yaml
datasets:
  - from: https://api.example.com
    name: specific_versions
    params:
      # Match only API versions 1-9
      allowed_request_paths: '/api/v[0-9]/*'
```

```sql
-- Matches because /api/v1/users matches /api/v[0-9]/*
SELECT * FROM specific_versions WHERE request_path = '/api/v1/users';

-- Does NOT match because v10 has two digits
SELECT * FROM specific_versions WHERE request_path = '/api/v10/users';
```

### Dynamic Filters with Metadata Fields

The special metadata fields can be combined with dynamic filters to create sophisticated data refresh patterns.

#### Dynamic API Queries with SQL

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: tv_shows
    params:
      http_headers: 'Accept:application/json'
      allowed_request_paths: '/search/shows,/shows/*,/shows/*/episodes'
      request_query_filters: enabled
```

Query specific API endpoints dynamically:

```sql
-- Search for shows by name
SELECT * FROM tv_shows
WHERE request_path = '/search/shows' AND request_query = 'q=game+of+thrones';

-- Get a specific show by ID (matches /shows/* pattern)
SELECT * FROM tv_shows
WHERE request_path = '/shows/82';

-- Get episodes for a show with filters (matches /shows/*/episodes pattern)
SELECT * FROM tv_shows
WHERE request_path = '/shows/82/episodes' AND request_query = 'season=1';
```

#### Incremental Loading with Metadata Fields

```yaml
datasets:
  - from: https://api.example.com
    name: events
    params:
      allowed_request_paths: '/events,/events/*'
      request_query_filters: enabled
    acceleration:
      enabled: true
      refresh_mode: append
      refresh_sql: |
        SELECT * FROM events
        WHERE request_path = '/events'
          AND request_query = CONCAT('since=', (SELECT MAX(created_at) FROM events))
```

This configuration:

- Uses `request_path` to specify the `/events` endpoint
- Dynamically constructs the `request_query` parameter using the latest timestamp from existing data
- On each refresh, only fetches events created after the last refresh

#### Paginated Data Loading

:::tip
For APIs with standard pagination patterns, consider using the built-in [pagination](#pagination) feature instead of manual `refresh_sql` pagination. Built-in pagination handles page traversal automatically with streaming execution.
:::

```yaml
datasets:
  - from: https://api.example.com/v2
    name: paginated_data
    params:
      http_headers: 'Content-Type:application/json'
      allowed_request_paths: '/data'
      request_query_filters: enabled
    acceleration:
      enabled: true
      refresh_mode: append
      refresh_sql: |
        SELECT * FROM paginated_data
        WHERE request_path = '/data'
          AND request_query = CONCAT('page=', 
                              COALESCE((SELECT MAX(page_number) FROM paginated_data) + 1, 1),
                              '&limit=100')
```

This incrementally loads pages of data by:

- Tracking the last loaded page number
- Constructing the next page query parameter
- Fetching 100 records per page

#### POST Request with Dynamic Body

```yaml
datasets:
  - from: https://api.example.com
    name: search_results
    params:
      http_headers: 'Content-Type:application/json'
      allowed_request_paths: '/search'
      request_body_filters: enabled
    acceleration:
      enabled: true
      refresh_mode: full
      refresh_sql: |
        SELECT * FROM search_results
        WHERE request_path = '/search'
          AND request_body = '{"query": {"match": {"status": "active"}}, "from": 0, "size": 1000}'
```

This example demonstrates:

- Using `_body` to send a JSON payload for a POST request
- Executing complex search queries against REST APIs
- Fetching results based on structured query syntax

#### Subquery-Driven HTTP Requests

The HTTP connector supports `IN (SELECT ...)` subqueries on filter columns (`request_path`, `request_query`, `request_body`, `request_headers`). Instead of fetching the entire HTTP dataset and joining in memory, the optimizer produces one HTTP request per unique subquery value.

```yaml
datasets:
  - from: s3://my-bucket/org_list.csv
    name: orgs

  - from: https://api.example.com
    name: org_api
    params:
      file_format: json
      allowed_request_paths: '/headers'
      http_headers: 'x-static-header: static-value'
      request_header_filters: enabled
      request_header_allowlist: x-org-id
      max_request_partitions: 100
```

```sql
WITH org_headers AS (
    SELECT '{"x-org-id":"' || org_id || '"}' AS hdr
    FROM orgs
)
SELECT request_headers, content
FROM org_api
WHERE request_path = '/headers'
  AND request_headers IN (SELECT hdr FROM org_headers);
```

Each unique `hdr` value from the subquery triggers a separate HTTP request with the corresponding `x-org-id` header. The connector deduplicates values and caps the build side at 20,000 unique values. Use `max_request_partitions` to limit the total number of HTTP requests.

:::warning JOIN is not supported for HTTP filter columns
`JOIN ... ON` queries where the join key is an HTTP filter column (e.g., `request_headers`, `request_path`) are not supported and will return an error. Use `IN (SELECT ...)` instead:

```sql
-- This will error:
SELECT h.content, p.path FROM http_api h JOIN params p ON h.request_path = p.path;

-- Use this instead:
SELECT content FROM http_api WHERE request_path IN (SELECT path FROM params);
```
:::

### Processing JSON Responses

APIs often return JSON data that requires parsing to extract specific fields. Spice provides [JSON functions](../../reference/sql/json) to process and transform JSON responses directly in SQL queries.

#### Extracting Fields from JSON

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: tvmaze
    params:
      file_format: json
      allowed_request_paths: '/shows/*'
```

Extract specific fields from JSON responses:

```sql
-- Extract the show name from a JSON response
SELECT json_get_str(content, 'name') as name
FROM tvmaze
WHERE request_path = '/shows/169';
```

#### Working with Nested JSON

APIs often return deeply nested JSON structures that require parsing to extract specific fields. Use chained JSON functions to navigate nested objects:

```sql
-- Extract nested fields from a show's network information
SELECT
  json_get_str(content, 'name') as show_name,
  json_get_str(json_get(content, 'network'), 'name') as network_name,
  json_get_str(json_get(json_get(content, 'network'), 'country'), 'name') as country,
  json_get_str(json_get(json_get(content, 'network'), 'country'), 'code') as country_code
FROM tvmaze
WHERE request_path = '/shows/82';
```

This demonstrates extracting nested objects step by step:

- `json_get(content, 'network')` extracts the network object
- `json_get_str(json_get(content, 'network'), 'name')` gets the network name from the nested object
- Multiple `json_get` calls can be chained to navigate deeper levels

#### Extracting Multiple Fields

```sql
-- Parse multiple fields from a TV show API response
SELECT
  json_get_str(content, 'name') as show_name,
  json_get_str(content, 'type') as show_type,
  json_get_str(content, 'language') as language,
  json_get_int(content, 'runtime') as runtime_minutes,
  json_get_str(content, 'premiered') as premiere_date,
  json_get_str(content, 'status') as status
FROM tvmaze
WHERE request_path = '/shows/169';
```

#### Processing JSON Arrays

```sql
-- Extract genres from a JSON array
SELECT
  json_get_str(content, 'name') as show_name,
  json_get_array(content, 'genres') as genres_array
FROM tvmaze
WHERE request_path = '/shows/82';
```

For more details on available JSON functions including `json_get`, `json_get_str`, `json_get_int`, `json_get_bool`, and others, refer to the [JSON functions reference](../../reference/sql/json).

### Refresh SQL with Dynamic Filters

The HTTP connector supports dynamic URL construction through `refresh_sql` with templated query parameters. This enables incremental data loading by appending filter conditions from the SQL query to the HTTP request URL.

#### How It Works

When `refresh_sql` is specified with filters, the connector extracts filter conditions and appends them as query parameters to the URL. This is particularly useful for APIs that support filtering via query parameters.

#### Time-Based Incremental Loading

```yaml
datasets:
  - from: https://api.example.com/data.csv?start_time={start_time}&end_time={end_time}
    name: incremental_data
    acceleration:
      enabled: true
      refresh_mode: append
      refresh_sql: |
        SELECT * FROM incremental_data 
        WHERE timestamp > (SELECT MAX(timestamp) FROM incremental_data)
```

In this example:

- The `{start_time}` and `{end_time}` placeholders in the URL are replaced with values extracted from the `WHERE` clause in `refresh_sql`
- Each refresh appends only new data since the last refresh
- The connector automatically maps SQL filter conditions to URL query parameters

#### Supported Filter Operations

The dynamic filter feature supports the following SQL operations:

- Equality comparisons (`=`)
- Greater than (`>`)
- Less than (`<`)
- Greater than or equal (`>=`)
- Less than or equal (`<=`)
- Range queries with `BETWEEN`

#### Notes

- URL parameters must match filter column names in the `refresh_sql`
- Only filters that can be pushed down to the HTTP source will be applied to the URL
- Complex filters may not be supported for URL templating

## Limitations

### Security Constraints

For security and to prevent unauthorized access, the HTTP connector enforces the following constraints on special metadata fields:

#### Request Path Limitations

- **Explicit Allow-List Required**: The `request_path` field cannot be used without configuring `allowed_request_paths`
- **Path Pattern Format**: All patterns in `allowed_request_paths` must:
  - Start with `/`
  - Not contain `..` path traversal segments
  - Not exceed 2048 characters in length
- **Glob Pattern Matching**: Query filters are matched against glob patterns in the `allowed_request_paths` list using:
  - `*` matches a single path segment (e.g., `/shows/*` matches `/shows/123` but not `/shows/123/episodes`)
  - `**` matches multiple path segments recursively (e.g., `/api/**` matches `/api/v1/users` and `/api/v2/posts/123`)
  - `[...]` character classes (e.g., `/api/v[0-9]/*` matches `/api/v1/users` but not `/api/v10/users`)
- **Empty Paths**: Empty `request_path` filters are rejected

Example error when `allowed_request_paths` is not configured:

```
request_path filters are disabled for this dataset. Configure allowed_request_paths to enable them.
```

#### Request Query Limitations

- **Explicit Enable Required**: The `request_query` field requires `request_query_filters: enabled`
- **Length Limit**: Query strings are limited to 1024 characters by default (configurable up to 4096 via `max_request_query_length`)
- **Control Characters**: Query strings cannot contain control characters
- **Leading Question Mark**: The connector automatically strips leading `?` if present

Example error when query filters are not enabled:

```
request_query filters are disabled for this dataset. Enable request_query_filters to use them.
```

#### Request Body Limitations

- **Explicit Enable Required**: The `request_body` field requires `request_body_filters: enabled`
- **Size Limit**: Request bodies are limited to 16 KiB (16,384 bytes) by default (configurable up to 64 KiB via `max_request_body_bytes`)
- **POST Method**: When a `request_body` filter is present, the HTTP method automatically changes to POST

Example error when body filters are not enabled:

```
request_body filters are disabled for this dataset. Enable request_body_filters to use them.
```

#### Request Headers Limitations

- **Explicit Enable Required**: The `request_headers` field requires `request_header_filters: enabled`
- **Allowlist Required**: Every header name in the JSON object must be listed in `request_header_allowlist`
- **Size Limit**: Header filter values are limited to 16 KiB (16,384 bytes) by default (configurable via `max_request_headers_length`)
- **Authorization Blocked**: The `authorization` header cannot be allowlisted when HTTP authentication (Basic or OAuth2) is configured
- **OR Across Columns Not Supported**: `OR` expressions that span different filter columns (e.g., `request_headers OR request_query`) are rejected. Use `UNION ALL` for cross-column alternatives.

#### Partition Limits

When multiple filter columns are used together with `AND`, the connector creates a cross product of all filter values. For example, 3 `request_path` values × 2 `request_headers` values = 6 HTTP requests. Use the `max_request_partitions` parameter to cap this cross product and prevent runaway request counts.

#### Subquery Limitations

- **`IN (SELECT ...)` only**: Subqueries against HTTP filter columns must use `IN (SELECT ...)`. `JOIN ... ON` with HTTP filter columns is not supported and returns an error.
- **Build-side value cap**: The subquery (build side) is capped at 20,000 unique values. Values are deduplicated before creating HTTP requests.
- **Partition limit applies**: The expanded partitions from subquery values are subject to `max_request_partitions`. If the cross product of existing partitions and subquery values exceeds the limit, the query fails with an error.

### Configuration Requirements

To use the special metadata fields (`request_path`, `request_query`, `request_body`, `request_headers`), you must:

1. **For `request_path`**: Configure `allowed_request_paths` with a comma-separated list of allowed path patterns (supports glob patterns)
2. **For `request_query`**: Set `request_query_filters: enabled` in params
3. **For `request_body`**: Set `request_body_filters: enabled` in params
4. **For `request_headers`**: Set `request_header_filters: enabled` and `request_header_allowlist` in params

Example minimal configuration for all four fields:

```yaml
datasets:
  - from: https://api.example.com
    name: my_api
    params:
      allowed_request_paths: '/users,/posts,/comments,/api/**'
      request_query_filters: enabled
      request_body_filters: enabled
      request_header_filters: enabled
      request_header_allowlist: x-sandbox-id, x-region
      max_request_partitions: 10000
```

### Performance Considerations

- **Connection Pooling**: The connector maintains up to 10 idle connections per host by default
- **Retry Overhead**: With the default 3 retries and Fibonacci backoff, failed requests may take several seconds before returning an error
- **Cache Behavior**: HTTP responses are cached based on the combination of path, query, body, and headers parameters
- **Partition Limits**: Use `max_request_partitions` to cap the number of HTTP requests created from cross-product filters

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores/). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores/#using-secrets).

## Cookbook

- A cookbook recipe to configure an HTTP/HTTPS endpoint as a data connector in Spice. [HTTP Data Connector](https://github.com/spiceai/cookbook/tree/trunk/http#readme)
