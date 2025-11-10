---
title: 'HTTP(s) Data Connector'
sidebar_label: 'HTTP(s) Data Connector'
description: 'HTTP(s) Data Connector Documentation'
pagination_prev: null
---

The HTTP(s) Data Connector enables federated SQL query across [supported file formats](/docs/components/data-connectors/index.md#object-store-file-formats) stored at an HTTP(s) endpoint. The connector supports dynamic query and data refresh through SQL-based filtering.

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

1. **Direct URL to a file**: A complete URL pointing to a specific [supported file](/docs/components/data-connectors/index.md#object-store-file-formats).

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

The dataset name cannot be a [reserved keyword](/docs/reference/spicepod/keywords.md).

### `params`

The connector supports authentication, timeout, connection pooling, and retry configuration via `params`.

| Parameter Name           | Description                                                                                                                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `http_port`              | Optional. Port to create HTTP(s) connection over. Default: 80 and 443 for HTTP and HTTPS respectively.                                                                                                      |
| `http_username`          | Optional. Username for HTTP basic authentication. Default: None.                                                                                                                                            |
| `http_password`          | Optional. Password for HTTP basic authentication. Default: None. Use the [secret replacement syntax](../secret-stores/index.md) to load the password from a secret store, e.g. `${secrets:my_http_pass}`.   |
| `http_headers`           | Optional. Custom HTTP headers as a comma-separated list of `key:value` pairs. Example: `Content-Type:application/json,Accept:application/json`. Default: None.                                              |
| `client_timeout`         | Optional. Maximum time to wait for a response from the HTTP server (in seconds). Default: `30`. Supports duration formats like `30s`, `1m`, `500ms`, `2m30s`. Applied to the entire request-response cycle. |
| `connect_timeout`        | Optional. Timeout for establishing HTTP(s) connections (in seconds). Default: `10`.                                                                                                                         |
| `pool_max_idle_per_host` | Optional. Maximum number of idle connections to keep alive per host. Default: `10`.                                                                                                                         |
| `pool_idle_timeout`      | Optional. Timeout for idle connections in the pool (in seconds). Default: `90`.                                                                                                                             |
| `max_retries`            | Optional. Maximum number of retries for failed HTTP requests. Default: `3`.                                                                                                                                 |
| `retry_backoff_method`   | Optional. Retry backoff strategy: `fibonacci` (default), `linear`, or `exponential`.                                                                                                                        |
| `retry_max_duration`     | Optional. Maximum total duration for all retries (e.g., `30s`, `5m`). If not set, retries continue up to `max_retries`.                                                                                     |
| `retry_jitter`           | Optional. Randomization factor for retry delays (0.0 to 1.0). Default: `0.3` (30% randomization). Set to `0` for no jitter.                                                                                 |

## Timeouts and Retries

### Timeouts

The connector provides granular control over HTTP timeouts:

- **`client_timeout`**: Maximum time to wait for a complete HTTP response (default: 30 seconds)
- **`connect_timeout`**: Maximum time to establish a connection (default: 10 seconds)

Example configuration:

```yaml
datasets:
  - from: https://example.com/data.csv
    name: my_data
    params:
      client_timeout: 60s
      connect_timeout: 15s
```

### Connection Pooling

The connector maintains a connection pool for improved performance:

- **`pool_max_idle_per_host`**: Maximum idle connections per host (default: 10)
- **`pool_idle_timeout`**: How long idle connections are kept (default: 90 seconds)

Example configuration:

```yaml
datasets:
  - from: https://api.example.com/data
    name: api_data
    params:
      pool_max_idle_per_host: 20
      pool_idle_timeout: 120
```

### Retries

The HTTP connector automatically retries failed requests with configurable retry behavior:

- **Automatic retries**: Transient failures (network errors, 5xx server errors) trigger automatic retries
- **Default strategy**: Fibonacci backoff with 3 maximum attempts
- **Configurable options**:
  - `max_retries`: Number of retry attempts (default: 3)
  - `retry_backoff_method`: Strategy for retry delays - `fibonacci` (default), `linear`, or `exponential`
  - `retry_max_duration`: Total time limit for all retries (e.g., `30s`, `5m`)
  - `retry_jitter`: Randomization to prevent thundering herd (default: 0.3 for 30% randomization)

Example with custom retry configuration:

```yaml
datasets:
  - from: https://api.example.com/data.csv
    name: my_data
    params:
      max_retries: 5
      retry_backoff_method: exponential
      retry_max_duration: 2m
      retry_jitter: 0.5
```

### Special Metadata Fields

The HTTP connector supports special metadata fields that provide fine-grained control over HTTP requests. These fields can be included in your dataset schema to dynamically construct request URLs and payloads:

| Field Name      | Type   | Description                                                                                                                                                                                                                                                                                                    |
| --------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request_path`  | String | Specifies the URL path to append to the base URL from the `from` field. When using a base domain/path in `from`, `request_path` constructs the complete endpoint. Example: If `from: https://api.example.com` and `request_path: /users/123`, the request will be made to `https://api.example.com/users/123`. |
| `request_query` | String | Defines query parameters to append to the request URL. Formatted as a query string (e.g., `key1=value1&key2=value2`). These parameters are appended to the URL after any path specified in `request_path`.                                                                                                     |
| `request_body`  | String | Contains the request body for POST/PUT requests. Typically used with REST APIs that require a JSON or form-encoded payload. The content type should be specified using `http_headers`.                                                                                                                         |

These metadata fields work in combination:

- If `from` specifies a complete file URL, these fields are ignored
- If `from` specifies a base URL, these fields construct the full request dynamically
- `request_path` is appended to the base URL
- `request_query` is appended as query parameters
- `request_body` is sent as the request payload (requires appropriate HTTP method configuration)

## Advanced Usage

### Using Special Metadata Fields with Base URL

When using a base URL with special metadata fields, you can dynamically construct different API endpoints:

```yaml
datasets:
  - from: https://api.example.com/v1
    name: api_requests
    params:
      http_headers: 'Content-Type:application/json'
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

### Dynamic Filters with Metadata Fields

The special metadata fields can be combined with dynamic filters to create sophisticated data refresh patterns.

#### Dynamic API Queries with SQL

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: tv_shows
    params:
      http_headers: 'Accept:application/json'
```

Query specific API endpoints dynamically:

```sql
-- Search for shows by name
SELECT * FROM tv_shows
WHERE request_path = '/search/shows' AND request_query = 'q=game+of+thrones';

-- Get a specific show by ID
SELECT * FROM tv_shows
WHERE request_path = '/shows/82';

-- Get episodes for a show with filters
SELECT * FROM tv_shows
WHERE request_path = '/shows/82/episodes' AND request_query = 'season=1';
```

#### Incremental Loading with Metadata Fields

```yaml
datasets:
  - from: https://api.example.com
    name: events
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
    acceleration:
      enabled: true
      refresh_mode: full
      refresh_sql: |
        SELECT * FROM search_results
        WHERE request_path = '/search'
          AND _body = '{"query": {"match": {"status": "active"}}, "from": 0, "size": 1000}'
```

This example demonstrates:

- Using `_body` to send a JSON payload for a POST request
- Executing complex search queries against REST APIs
- Fetching results based on structured query syntax

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

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](/docs/components/secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](/docs/components/secret-stores#using-secrets).
