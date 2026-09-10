---
title: 'HTTP Cache'
sidebar_label: 'HTTP Cache'
sidebar_position: 5
description: 'Use Spice.ai to cache HTTP API responses locally, reducing API call frequency and providing fast, SQL-queryable access to external API data.'
pagination_prev: null
pagination_next: null
---

Spice.ai caches HTTP API responses at two layers: a connector-level HTTP response cache that respects upstream `Cache-Control` headers, and dataset-level acceleration with `refresh_mode: caching` that stores API responses in a local accelerator with configurable TTL and stale-while-revalidate semantics.

This pattern is useful for applications that query external REST APIs repeatedly — for example, caching search results from a third-party API so that the same query served to multiple users does not trigger redundant upstream requests.

```mermaid
graph LR
    App[Application] -->|SQL Query| RC[Results Cache]
    RC -->|MISS| Acc[Accelerator]
    Acc -->|Cache Miss| API[HTTP API]
    RC -->|HIT| App
```

## Why Spice.ai?

- **Two-Layer Caching**: The HTTP connector caches raw responses based on upstream `Cache-Control: max-age` headers. Dataset-level caching adds TTL, stale-while-revalidate, and stale-if-error on top, providing application-controlled cache behavior independent of upstream headers.
- **SQL-Queryable API Data**: Cached HTTP responses are stored as structured tables, queryable with standard SQL including filters, joins, and aggregations.
- **Request Filtering**: Controls which request paths, query parameters, and body content are cacheable via `allowed_request_paths`, `request_query_filters`, and `request_body_filters`, preventing unbounded cache growth.
- **Durable Cache**: File-backed accelerators (Cayenne, DuckDB, SQLite) persist cached responses to disk for fast restarts without re-fetching.

## Example

### Accelerated HTTP Dataset with Caching Mode

Cache JSON responses from a REST API with stale-while-revalidate:

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: tv_shows_cache
    params:
      file_format: json
      allowed_request_paths: '/search/shows,/shows/*'
      request_query_filters: enabled
      max_request_query_length: 1024
    acceleration:
      enabled: true
      refresh_mode: caching
      engine: cayenne
      mode: file
      params:
        caching_ttl: 30s
        caching_stale_while_revalidate_ttl: 2m
        caching_stale_if_error: enabled
```

Query the cached API data over SQL:

```sql
SELECT * FROM tv_shows_cache
WHERE request_path = '/search/shows'
  AND request_query = 'q=breaking+bad';
```

The first query triggers a fetch from the upstream API. Subsequent queries within 30 seconds are served from the local accelerator. After 30 seconds, the cached result is served immediately while Spice revalidates in the background. If the upstream API is unavailable, the stale cached result is served instead of an error.

### Request Filtering

Limit which API paths and parameters are cached to prevent unbounded cache growth:

```yaml
datasets:
  - from: https://api.example.com
    name: api_cache
    params:
      file_format: json
      allowed_request_paths: '/v1/search,/v1/items/*'
      request_query_filters: enabled
      max_request_query_length: 1024
      request_body_filters: enabled
      max_request_body_bytes: 16384
    acceleration:
      enabled: true
      refresh_mode: caching
      engine: duckdb
      mode: file
      params:
        caching_ttl: 1m
```

Only requests matching the allowed paths with query and body sizes within the configured limits are cached.

## Query Results Cache

The SQL results cache adds a third caching layer for HTTP API data. While the HTTP connector caches raw responses and `refresh_mode: caching` stores parsed data in the accelerator, the SQL results cache stores the output of executed SQL queries in memory so that identical queries return instantly without re-querying the accelerator.

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: tv_shows_cache
    params:
      file_format: json
      allowed_request_paths: '/search/shows,/shows/*'
      request_query_filters: enabled
    acceleration:
      enabled: true
      refresh_mode: caching
      engine: cayenne
      mode: file
      params:
        caching_ttl: 30s
        caching_stale_if_error: enabled

runtime:
  caching:
    sql_results:
      enabled: true
      item_ttl: 10s
```

In this three-layer configuration:

1. The HTTP connector caches raw responses based on upstream `Cache-Control` headers.
2. The dataset accelerator caches parsed data with a 30-second TTL and stale-if-error.
3. The SQL results cache stores query output in memory for 10 seconds.

Identical SQL queries within 10 seconds are served from memory. After 10 seconds, the query re-executes against the accelerator (which may still be serving from its dataset-level cache).

The `Results-Cache-Status` response header indicates cache state: `HIT`, `MISS`, `BYPASS`, or `STALE`. Clients can bypass the results cache using the `Cache-Control: no-cache` header.

:::warning
Do not configure `stale_while_revalidate_ttl` on both the SQL results cache (`runtime.caching.sql_results`) and the dataset caching accelerator (`acceleration.params.caching_stale_while_revalidate_ttl`) for the same dataset. Use one or the other to avoid conflicting revalidation behavior.
:::

## Benefits

- **Reduced API Costs**: Three caching layers minimize redundant upstream HTTP requests.
- **Low Latency**: Queries are served from the closest cache layer with data — memory, accelerator, or HTTP cache.
- **Resilience**: Stale-if-error keeps the application functional when upstream APIs experience downtime or rate limiting.

### Learn More

- **Caching Refresh Mode**: [Documentation](../../features/data-acceleration/refresh-modes/caching) for detailed configuration, schema, and parameters.
- **Caching**: [Documentation](../../features/caching) for SQL results cache configuration, Cache-Control directives, and response headers.
- **HTTP(s) Data Connector**: [Documentation](../../components/data-connectors/https) for authentication, headers, and connector-specific parameters.
- **Data Acceleration**: [Documentation](../../features/data-acceleration) for acceleration engines and modes.
