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

### Using Custom Headers

Custom HTTP headers can be specified for authentication, API keys, or other requirements. Headers are treated as sensitive data and will not be logged.

```yaml
datasets:
  - from: https://api.example.com/data.csv
    name: api_data
    params:
      http_headers: 'Authorization:Bearer ${secrets:api_token},Accept:application/json'
```

Headers can also be separated by semicolons:

```yaml
datasets:
  - from: https://api.example.com/data.csv
    name: api_data
    params:
      http_headers: 'Authorization: Bearer ${secrets:api_token}; X-API-Key: ${secrets:api_key}'
```

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

| Parameter Name             | Description                                                                                                                                                                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `http_port`                | Optional. Port to create HTTP(s) connection over. Default: 80 and 443 for HTTP and HTTPS respectively.                                                                                                                                                                               |
| `http_username`            | Optional. Username for HTTP basic authentication. Default: None.                                                                                                                                                                                                                     |
| `http_password`            | Optional. Password for HTTP basic authentication. Default: None. Use the [secret replacement syntax](../secret-stores/) to load the password from a secret store, e.g. `${secrets:my_http_pass}`.                                                                                    |
| `http_headers`             | Optional. Custom HTTP headers as a comma-separated list of `key:value` pairs. Example: `Content-Type:application/json,Accept:application/json`. Default: None.                                                                                                                       |
| `allowed_request_paths`    | **Required** for using `request_path` filters. Comma-separated list of allowed paths. Example: `/api/users,/api/posts`. Paths must start with `/` and cannot contain `..` segments.                                                                                                  |
| `request_query_filters`    | Optional. Set to `enabled` to enable `request_query` filters. Default: `disabled`. When disabled, query parameter filters will be rejected.                                                                                                                                          |
| `request_body_filters`     | Optional. Set to `enabled` to enable `request_body` filters for POST requests. Default: `disabled`. When disabled, request body filters will be rejected.                                                                                                                            |
| `client_timeout`           | Optional. Maximum time to wait for a response from the HTTP server (in seconds). Default: `30`. Supports duration formats like `30s`, `1m`, `500ms`, `2m30s`. Applied to the entire request-response cycle.                                                                          |
| `connect_timeout`          | Optional. Timeout for establishing HTTP(s) connections (in seconds). Default: `10`.                                                                                                                                                                                                  |
| `pool_max_idle_per_host`   | Optional. Maximum number of idle connections to keep alive per host. Default: `10`.                                                                                                                                                                                                  |
| `pool_idle_timeout`        | Optional. Timeout for idle connections in the pool (in seconds). Default: `90`.                                                                                                                                                                                                      |
| `max_retries`              | Optional. Maximum number of retries for failed HTTP requests. Default: `3`.                                                                                                                                                                                                          |
| `retry_backoff_method`     | Optional. Retry backoff strategy: `fibonacci` (default), `linear`, or `exponential`.                                                                                                                                                                                                 |
| `retry_max_duration`       | Optional. Maximum total duration for all retries (e.g., `30s`, `5m`). If not set, retries continue up to `max_retries`.                                                                                                                                                              |
| `retry_jitter`             | Optional. Randomization factor for retry delays (0.0 to 1.0). Default: `0.3` (30% randomization). Set to `0` for no jitter.                                                                                                                                                          |
| `max_request_query_length` | Optional. Maximum length in characters for `request_query` filter values. Default: `1024`. Maximum: `4096`.                                                                                                                                                                          |
| `max_request_body_bytes`   | Optional. Maximum size in bytes for `request_body` filter values. Default: `16384` (16 KiB). Maximum: `65536` (64 KiB).                                                                                                                                                              |
| `health_probe`             | Optional. Custom health probe path for endpoint validation during initialization (e.g., `/health`, `/api/status`). The endpoint must return a 2xx status code to pass validation. If not set, a random path is used and any status (including 404) is accepted. Must start with `/`. |

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

The HTTP connector provides advanced capabilities for working with dynamic APIs and RESTful services through special metadata fields.

### Special Metadata Fields

The HTTP connector supports special metadata fields that provide fine-grained control over HTTP requests. These fields can be included in your dataset schema to dynamically construct request URLs and payloads.

:::warning Security Requirements
For security, these metadata fields require explicit configuration to prevent unauthorized access:

- `request_path` requires `allowed_request_paths` to be configured with glob patterns
- `request_query` requires `request_query_filters: enabled`
- `request_body` requires `request_body_filters: enabled`
  :::

| Field Name      | Type   | Description                                                                                                                                                                                                                                                                                                                                                    |
| --------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request_path`  | String | Specifies the URL path to append to the base URL from the `from` field. When using a base domain/path in `from`, `request_path` constructs the complete endpoint. Example: If `from: https://api.example.com` and `request_path: /users/123`, the request will be made to `https://api.example.com/users/123`. **Requires `allowed_request_paths` parameter.** |
| `request_query` | String | Defines query parameters to append to the request URL. Formatted as a query string (e.g., `key1=value1&key2=value2`). These parameters are appended to the URL after any path specified in `request_path`. **Requires `request_query_filters: enabled`.** Maximum length: configurable via `max_request_query_length` (default: 1024 characters).              |
| `request_body`  | String | Contains the request body for POST/PUT requests. Typically used with REST APIs that require a JSON or form-encoded payload. The content type should be specified using `http_headers`. **Requires `request_body_filters: enabled`.** Maximum size: configurable via `max_request_body_bytes` (default: 16 KiB).                                                |

These metadata fields work in combination:

- If `from` specifies a complete file URL, these fields are ignored
- If `from` specifies a base URL, these fields construct the full request dynamically
- `request_path` is appended to the base URL
- `request_query` is appended as query parameters
- `request_body` is sent as the request payload (requires appropriate HTTP method configuration)

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

### Configuration Requirements

To use the special metadata fields (`request_path`, `request_query`, `request_body`), you must:

1. **For `request_path`**: Configure `allowed_request_paths` with a comma-separated list of allowed path patterns (supports glob patterns)
2. **For `request_query`**: Set `request_query_filters: enabled` in params
3. **For `request_body`**: Set `request_body_filters: enabled` in params

Example minimal configuration for all three fields:

```yaml
datasets:
  - from: https://api.example.com
    name: my_api
    params:
      allowed_request_paths: '/users,/posts,/comments,/api/**'
      request_query_filters: enabled
      request_body_filters: enabled
```

### Performance Considerations

- **Connection Pooling**: The connector maintains up to 10 idle connections per host by default
- **Retry Overhead**: With the default 3 retries and Fibonacci backoff, failed requests may take several seconds before returning an error
- **Cache Behavior**: HTTP responses are cached based on the combination of path, query, and body parameters

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores/). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores/#using-secrets).
