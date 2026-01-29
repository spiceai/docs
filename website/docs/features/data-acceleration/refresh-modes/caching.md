---
title: 'Caching Refresh Mode'
sidebar_label: 'Caching'
description: 'Learn how to use caching refresh mode for HTTP-based datasets'
sidebar_position: 4
pagination_prev: null
pagination_next: null
---

The `caching` refresh mode provides intelligent caching for HTTP-based datasets where multiple result rows can share the same request metadata. This mode is specifically designed for scenarios like API responses where the same request parameters can return different content over time or multiple rows of data.

The caching mode supports two key paradigms:

1. **Stale-While-Revalidate (SWR)** - Serves cached data immediately while refreshing in the background, optimizing for low latency and reduced API costs
2. **Cache Persistence** - Stores cached data to disk using file-based accelerators (DuckDB, SQLite, or Cayenne) for fast cold starts and durability

## Overview

Unlike traditional refresh modes that treat datasets as single sources of truth, the `caching` mode treats HTTP request metadata (path, query parameters, and body) as cache keys. This approach is particularly useful for:

- REST API responses that return multiple records for a single request
- Search API results where the same query may return different results over time
- Dynamic content APIs where responses change based on server state

:::info[Future Enhancement]
While currently designed for HTTP-based datasets, future versions of Spice will extend the `caching` mode to support arbitrary queries from any data source, enabling flexible caching strategies across all connector types.
:::

## How It Works

The `caching` mode uses HTTP request filter values as cache keys rather than enforcing primary key constraints. When a refresh occurs:

1. **Cache Key Generation**: By default, the combination of `request_path`, `request_query`, and `request_body` acts as the cache key. If a `primary_key` is explicitly specified in the acceleration configuration, it will be used instead of the metadata fields.
2. **Row Replacement**: All existing rows matching the cache key are removed before inserting new data
3. **Multiple Results**: Multiple rows with identical request metadata can coexist, representing different content items from the same API response
4. **Timestamp Tracking**: Each row includes a `fetched_at` timestamp indicating when the data was retrieved

## Schema

Datasets using `caching` mode include the following metadata fields in addition to the content data:

| Field Name      | Type      | Description                                                         |
| --------------- | --------- | ------------------------------------------------------------------- |
| `request_path`  | String    | The URL path used for the request                                   |
| `request_query` | String    | The query parameters used for the request                           |
| `request_body`  | String    | The request body (for POST requests)                                |
| `content`       | String    | The response content                                                |
| `fetched_at`    | Timestamp | The timestamp when the data was fetched (based on HTTP Date header) |

The `fetched_at` timestamp uses the HTTP `Date` response header when available, falling back to the current system time if not present.

## Configuration

To use `caching` mode, configure an `HTTP`/`HTTPS` dataset with `refresh_mode: caching`:

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
      engine: duckdb
      mode: file
      refresh_check_interval: 30s
      params:
        caching_ttl: 10s # How long a cache entry is considered fresh
        caching_stale_while_revalidate_ttl: 30s # How long after the `caching_ttl` to serve stale data while refreshing in the background
```

## Use Cases

### Caching TV Show Search Results

Cache TV show search API results where the same query may return different results over time:

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: tv_search_cache
    params:
      file_format: json
      allowed_request_paths: '/search/shows'
      request_query_filters: enabled
    acceleration:
      enabled: true
      refresh_mode: caching
      engine: duckdb
      mode: file
      params:
        caching_ttl: 15s
        caching_stale_while_revalidate_ttl: 10s
      refresh_check_interval: 30s
      refresh_sql: |
        SELECT * FROM tv_search_cache
        WHERE request_path = '/search/shows'
          AND request_query = 'q=game+of+thrones'
```

This configuration:

- Fetches search results for "game of thrones" every 30 seconds
- Stores all result items with the same request metadata
- Replaces all previous results for this query on each refresh
- Preserves the timestamp of when results were fetched

### Caching TV Show Episodes

Cache responses from a TV show episodes API:

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: episodes_cache
    params:
      file_format: json
      allowed_request_paths: '/shows/*/episodes'
      request_query_filters: enabled
    acceleration:
      enabled: true
      refresh_mode: caching
      engine: duckdb
      mode: file
      params:
        caching_ttl: 10s
        caching_stale_while_revalidate_ttl: 10s
      refresh_check_interval: 20s
      refresh_sql: |
        SELECT * FROM episodes_cache
        WHERE request_path = '/shows/82/episodes'
          AND request_query = 'season=1'
```

### Multi-Endpoint Caching

Cache responses from multiple TVMaze API endpoints:

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: multi_endpoint_cache
    params:
      file_format: json
      allowed_request_paths: '/shows/*,/search/shows,/people/*'
      request_query_filters: enabled
    acceleration:
      enabled: true
      refresh_mode: caching
      engine: duckdb
      mode: file
      params:
        caching_ttl: 10s
        caching_stale_while_revalidate_ttl: 10s
      refresh_check_interval: 30s
      refresh_sql: |
        SELECT * FROM multi_endpoint_cache
        WHERE (request_path = '/shows/82' OR request_path = '/shows/169')
           OR (request_path = '/search/shows' AND request_query = 'q=breaking+bad')
```

## Querying Cached Data

Query cached data using standard SQL, filtering by request metadata or content:

```sql
-- Get all cached search results for a specific TV show query
SELECT content, fetched_at
FROM tv_search_cache
WHERE request_query = 'q=game+of+thrones'
ORDER BY fetched_at DESC;

-- Find the most recent cache entry for each unique request
SELECT request_path, request_query, MAX(fetched_at) as last_fetched
FROM tv_shows_cache
GROUP BY request_path, request_query;

-- Get cached results fetched within the last hour
SELECT *
FROM episodes_cache
WHERE fetched_at > NOW() - INTERVAL '1 hour';

-- Parse JSON to extract show information
SELECT
  json_get_str(content, 'name') as show_name,
  json_get_str(content, 'type') as show_type,
  fetched_at
FROM tv_shows_cache
WHERE request_path = '/shows/82';
```

## Stale-While-Revalidate Pattern

The `caching` mode supports the Stale-While-Revalidate (SWR) pattern for acceleration, providing optimal performance by serving cached data immediately while refreshing in the background.

### How SWR Works

When configured with background refresh, the caching mode:

1. **Serves stale data immediately** - Returns cached results without waiting for a refresh
2. **Triggers background refresh** - Initiates an asynchronous refresh of the cache
3. **Updates cache transparently** - Subsequent queries receive fresh data once the refresh completes

This pattern reduces query latency by eliminating wait times for data fetches while keeping the cache reasonably fresh.

### Background Refresh Configuration

Configure background refresh using `refresh_check_interval` to specify how frequently the cache should be updated:

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: shows_cache
    params:
      file_format: json
      allowed_request_paths: '/shows/*'
    acceleration:
      enabled: true
      refresh_mode: caching
      engine: duckdb
      mode: file # Persist cache to disk
      params:
        caching_ttl: 10s # Data is fresh for 10 seconds
        caching_stale_while_revalidate_ttl: 10s # Serve stale data for 10 seconds while refreshing
      refresh_check_interval: 30s # Refresh every 30 seconds in background
      refresh_sql: |
        SELECT * FROM shows_cache
        WHERE request_path = '/shows/82'
```

### SWR Benefits for API Caching

The SWR pattern is particularly valuable for caching API responses:

- **Reduced latency** - Queries return immediately from the cache without waiting for HTTP requests
- **Lower API costs** - Fewer requests to external APIs reduce usage and costs
- **Improved reliability** - Cached data remains available even if the API is temporarily unavailable
- **Better user experience** - Consistent fast response times improve application performance

### Example: SWR with On-Demand Refresh

Combine background refresh with on-demand refresh for maximum flexibility:

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: tv_search_swr
    params:
      file_format: json
      allowed_request_paths: '/search/shows'
      request_query_filters: enabled
    acceleration:
      enabled: true
      refresh_mode: caching
      engine: duckdb
      mode: file # Persist cache to disk
      params:
        caching_ttl: 15s # Cache data is fresh for 15 seconds
        caching_stale_while_revalidate_ttl: 10s # Serve stale data for 10 seconds while refreshing
      refresh_check_interval: 30s # Background refresh every 30 seconds
      refresh_on_startup: always # Always refresh on startup
      refresh_sql: |
        SELECT * FROM tv_search_swr
        WHERE request_path = '/search/shows'
          AND request_query = 'q=breaking+bad'
```

With this configuration:

- The cache refreshes every 30 seconds automatically
- Queries are served immediately from the cache
- Manual refresh is available via `/v1/datasets/tv_search_swr/acceleration/refresh`
- Cache is guaranteed fresh on application startup

## Cache Persistence

The `caching` mode supports persisting cached data to disk using file-based acceleration engines, enabling the cache to survive application restarts and reducing cold start times.

### File-Based Accelerators

Three acceleration engines support file persistence for caching mode:

- **DuckDB** - High-performance analytical database with excellent compression
- **SQLite** - Lightweight, reliable database ideal for embedded scenarios
- **Cayenne** - Spice's native accelerator optimized for analytical workloads

### Configuring File Persistence

Enable file persistence by setting `acceleration.mode: file` and specifying an acceleration engine:

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: shows_persistent_cache
    params:
      file_format: json
      allowed_request_paths: '/shows/*,/search/shows'
      request_query_filters: enabled
    acceleration:
      enabled: true
      refresh_mode: caching
      engine: duckdb # or sqlite, cayenne
      mode: file # Enable file persistence
      params:
        caching_ttl: 10s
        caching_stale_while_revalidate_ttl: 10s
      refresh_check_interval: 30s
      refresh_sql: |
        SELECT * FROM shows_persistent_cache
        WHERE request_path IN ('/shows/82', '/shows/169')
           OR (request_path = '/search/shows' AND request_query = 'q=game+of+thrones')
```

### DuckDB Persistence Example

DuckDB provides excellent performance for analytical queries on cached data:

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: tv_shows_duckdb
    params:
      file_format: json
      allowed_request_paths: '/shows/*,/shows/*/episodes'
      request_query_filters: enabled
    acceleration:
      enabled: true
      refresh_mode: caching
      engine: duckdb
      mode: file
      params:
        caching_ttl: 10s
        caching_stale_while_revalidate_ttl: 10s
        duckdb_file: tv_shows_cache.db # Specify custom file location
      refresh_check_interval: 30s
      refresh_sql: |
        SELECT * FROM tv_shows_duckdb
        WHERE request_path IN ('/shows/82', '/shows/169')
           OR (request_path = '/shows/82/episodes' AND request_query = 'season=1')
```

### SQLite Persistence Example

SQLite is ideal for lightweight caching scenarios:

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: tv_search_sqlite
    params:
      file_format: json
      allowed_request_paths: '/search/shows'
      request_query_filters: enabled
    acceleration:
      enabled: true
      refresh_mode: caching
      engine: sqlite
      mode: file
      params:
        caching_ttl: 15s
        caching_stale_while_revalidate_ttl: 10s
        sqlite_file: tv_search_cache.db
      refresh_check_interval: 30s
      refresh_sql: |
        SELECT * FROM tv_search_sqlite
        WHERE request_path = '/search/shows'
          AND request_query IN ('q=breaking+bad', 'q=game+of+thrones')
```

### Cayenne Persistence Example

Cayenne provides optimized performance for Spice workloads:

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: tv_shows_cayenne
    params:
      file_format: json
      allowed_request_paths: '/shows/*'
    acceleration:
      enabled: true
      refresh_mode: caching
      engine: cayenne
      mode: file
      params:
        caching_ttl: 10s
        caching_stale_while_revalidate_ttl: 10s
      refresh_check_interval: 30s
      refresh_sql: |
        SELECT * FROM tv_shows_cayenne
        WHERE request_path IN ('/shows/82', '/shows/169', '/shows/73')
```

### Benefits of File Persistence

Persisting the cache to disk provides several advantages:

- **Fast cold starts** - Cache is immediately available on application restart without fetching from APIs
- **Reduced API load** - No need to refetch all data after restarts
- **Cost savings** - Fewer API requests reduce metered API costs
- **Offline capability** - Cached data remains queryable even when the API is unavailable
- **Data durability** - Cache survives application crashes and restarts

### Memory vs. File Mode

Choose between in-memory and file-based caching based on your requirements:

| Aspect          | Memory Mode (`mode: memory`)      | File Mode (`mode: file`)      |
| --------------- | --------------------------------- | ----------------------------- |
| **Performance** | Fastest - all data in RAM         | Fast with disk I/O            |
| **Persistence** | Lost on restart                   | Survives restarts             |
| **Capacity**    | Limited by available memory       | Limited by disk space         |
| **Cold start**  | Slow - must refetch all data      | Fast - loads from disk        |
| **Best for**    | Small, frequently changing caches | Large, stable caches          |
| **Engines**     | `arrow` (default)                 | `duckdb`, `sqlite`, `cayenne` |

### Combining SWR and Persistence

For optimal performance, combine the SWR pattern with file persistence:

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: tv_shows_optimized
    params:
      file_format: json
      allowed_request_paths: '/shows/*,/search/shows'
      request_query_filters: enabled
    acceleration:
      enabled: true
      refresh_mode: caching
      engine: duckdb
      mode: file # Persist to disk
      params:
        caching_ttl: 15s # Cache data is fresh for 15 seconds
        caching_stale_while_revalidate_ttl: 10s # Serve stale data for 10 seconds while refreshing
      refresh_check_interval: 30s # Background refresh (SWR)
      refresh_on_startup: auto # Use persisted cache on startup
      refresh_sql: |
        SELECT * FROM tv_shows_optimized
        WHERE request_path IN ('/shows/82', '/shows/169')
           OR (request_path = '/search/shows' AND request_query = 'q=game+of+thrones')
```

This configuration provides:

- Immediate query response from persisted cache on startup
- Background refresh every 30 seconds without blocking queries
- Durable cache that survives application restarts
- Reduced API requests and costs

## Behavior and Characteristics

### Row-Level Replacement

The `caching` mode uses `InsertOp::Replace` to handle data updates. When new data is fetched for a given cache key (request metadata):

1. All existing rows matching that cache key are removed
2. All new rows are inserted
3. This operation is atomic, ensuring consistent cache state

This behavior differs from other modes:

- **`full` mode**: Replaces the entire dataset
- **`append` mode**: Adds new rows without removing existing ones
- **`changes` mode**: Applies CDC events
- **`caching` mode**: Replaces rows matching the specific cache key

### Cache Key Behavior

The `caching` mode determines cache keys based on the acceleration configuration:

**Default (No Primary Key Specified)**:

- Uses HTTP request metadata fields as the cache key: `request_path`, `request_query`, and `request_body`
- Multiple result rows can share the same request metadata
- The cache key serves as the logical grouping mechanism for row replacement
- Content within a response may have duplicate values across different requests

**With Primary Key Specified**:

- Uses the explicitly configured `primary_key` columns as the cache key
- Provides fine-grained control over cache key composition
- Useful when caching requires uniqueness based on response content fields rather than request metadata

Example with custom primary key:

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: tv_episodes_custom_key
    params:
      file_format: json
      allowed_request_paths: '/shows/*/episodes'
    acceleration:
      enabled: true
      refresh_mode: caching
      engine: duckdb
      mode: file
      primary_key: [id, season, number] # Use episode fields as cache key
      params:
        caching_ttl: 15s
        caching_stale_while_revalidate_ttl: 10s
      refresh_check_interval: 30s
      refresh_sql: |
        SELECT * FROM tv_episodes_custom_key
        WHERE request_path = '/shows/82/episodes'
```

### HTTP Date Header

The `fetched_at` timestamp respects the HTTP `Date` response header when present. This provides:

- Accurate server-side timestamps for cached responses
- Consistency across distributed systems
- Proper cache age calculation based on server time

If the `Date` header is not present, the system falls back to using the current system time.

## Refresh Configuration

The `caching` mode supports standard refresh configuration options. See [Stale-While-Revalidate Pattern](#stale-while-revalidate-pattern) for background refresh details and [Cache Persistence](#cache-persistence) for file-based caching configuration.

| Parameter                | Description                                                           | Default        |
| ------------------------ | --------------------------------------------------------------------- | -------------- |
| `refresh_check_interval` | How often to refresh cached data in the background                    | None           |
| `refresh_sql`            | SQL query defining what data to cache                                 | None           |
| `refresh_on_startup`     | Whether to refresh on startup (`auto` or `always`)                    | `auto`         |
| `on_zero_results`        | Behavior when cache returns no results (`return_empty`, `use_source`) | `return_empty` |
| `engine`                 | Acceleration engine (`arrow`, `duckdb`, `sqlite`, `cayenne`)          | `arrow`        |
| `mode`                   | Persistence mode (`memory` or `file`)                                 | `memory`       |

### Cache TTL (Time-to-Live)

The caching mode provides parameters to control cache freshness and staleness behavior:

| Parameter                            | Description                                                                                                                                                | Default    |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `caching_ttl`                        | Duration that cached data is considered fresh. After this period, data becomes stale and triggers a background refresh.                                    | `30s`      |
| `caching_stale_while_revalidate_ttl` | Duration after `caching_ttl` expires during which stale data is served while refreshing in the background. After this period, queries wait for fresh data. | None       |
| `caching_stale_if_error`             | When set to `enabled`, serves expired cached data if the upstream source returns an error. Valid values: `enabled`, `disabled`.                            | `disabled` |

The `caching_ttl` parameter defines how long cached data is considered fresh before it becomes stale. Once cached data exceeds this age, the SWR pattern triggers background refresh to update the cache while continuing to serve the stale data during the `caching_stale_while_revalidate_ttl` window.

If `caching_stale_while_revalidate_ttl` is omitted, cached data becomes rotten immediately after `caching_ttl` expires, and queries will wait for fresh data rather than returning stale results. When a value is specified, stale data is served during that window after `caching_ttl` expires while a background refresh occurs. Once the combined `caching_ttl + caching_stale_while_revalidate_ttl` period has passed, queries will wait for fresh data instead of returning stale results.

**Configuring Cache TTL**:

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: tv_shows_ttl
    params:
      file_format: json
      allowed_request_paths: '/shows/*'
    acceleration:
      enabled: true
      refresh_mode: caching
      engine: duckdb
      mode: file # Persist cache to disk
      refresh_check_interval: 30s # Periodic check for stale data
      params:
        caching_ttl: 15s # Cache data is fresh for 15 seconds
        caching_stale_while_revalidate_ttl: 10s # Serve stale data for 10 seconds while refreshing
```

**How Cache TTL Works**:

1. When data is fetched, the `fetched_at` timestamp is recorded
2. On subsequent queries, the system checks `now - fetched_at > caching_ttl`
3. If data is within TTL, it is served immediately (fresh)
4. If data exceeds TTL, it becomes stale:
   - Stale data is served immediately (no query delay) if within `caching_stale_while_revalidate_ttl`
   - Background refresh is triggered to update the cache
   - Next query receives the refreshed data

**TTL Format**: Duration strings support common units:

- Seconds: `30s`, `90s`
- Minutes: `5m`, `15m`
- Hours: `1h`, `24h`
- Mixed: `1h30m`, `2h15m30s`

**Default Behavior**: When `caching_ttl` is not specified, it defaults to `30s` (30 seconds). This provides a reasonable balance between freshness and cache efficiency for most use cases. When `caching_stale_while_revalidate_ttl` is not specified, stale data is not served after the TTL expires, and queries will wait for fresh data.

### Stale-If-Error Behavior

The `caching_stale_if_error` parameter controls whether expired cached data is served when the upstream data source returns an error during a refresh attempt. This provides fault tolerance by returning stale data instead of failing the query when the upstream source is temporarily unavailable.

```yaml
datasets:
  - from: https://api.tvmaze.com
    name: tv_shows_resilient
    acceleration:
      enabled: true
      refresh_mode: caching
      engine: duckdb
      mode: file
      params:
        caching_ttl: 15s
        caching_stale_while_revalidate_ttl: 30s
        caching_stale_if_error: enabled # Serve stale data on upstream errors
```

When `caching_stale_if_error: enabled`:

- If the upstream source returns an error during refresh, expired cached data is served instead of failing
- Queries continue to return data even when the upstream API is unavailable
- Useful for APIs with intermittent availability or rate limits

When `caching_stale_if_error: disabled` (default):

- Errors from the upstream source propagate to the query
- Queries fail when fresh data cannot be fetched and cached data has expired

:::warning[Stale-While-Revalidate Configuration Conflict]
When using `refresh_mode: caching`, you cannot configure both the caching accelerator's `caching_stale_while_revalidate_ttl` and the [results cache](../../caching)'s `stale_while_revalidate_ttl` for the same dataset. These parameters control similar behavior at different layers, and having both enabled creates a conflict.

Choose one approach:

- **Caching accelerator SWR**: Use `acceleration.params.caching_stale_while_revalidate_ttl` for HTTP-based dataset caching
- **Results cache SWR**: Use `runtime.caching.sql_results.stale_while_revalidate_ttl` for SQL query results caching

:::

**TTL Considerations**:

- **Shorter TTL** (e.g., `10s`, `30s`): More frequent refresh, higher data freshness, more API requests
- **Longer TTL** (e.g., `10m`, `1h`): Fewer refreshes, lower API costs, potentially stale data
- **Matching patterns**: Set `caching_ttl` shorter than `refresh_check_interval` to define the staleness window

## Limitations

- Currently only available for HTTP-based datasets using the [HTTPS connector](../../../components/data-connectors/https.md). Future releases will extend support to arbitrary queries from any data source.
- Requires `acceleration.enabled: true`
- When no `primary_key` is specified, cache keys default to request metadata fields (`request_path`, `request_query`, `request_body`)
- On-demand refresh via `/v1/datasets/:name/acceleration/refresh` API triggers a new refresh for all cache keys defined in `refresh_sql`

## Related Documentation

- [HTTPS Data Connector](../../../components/data-connectors/https.md) - Detailed HTTP connector configuration
- [Data Refresh](../data-refresh) - Overview of all refresh modes
- [Refresh SQL](../data-refresh#refresh-sql) - Using SQL to control refresh behavior
- [Special Metadata Fields](../../../components/data-connectors/https.md#special-metadata-fields) - HTTP request metadata fields
- [Data Accelerators](../../../components/data-accelerators/index.md) - Acceleration engines for cache persistence
- [DuckDB Accelerator](../../../components/data-accelerators/duckdb.md) - DuckDB acceleration engine
- [SQLite Accelerator](../../../components/data-accelerators/sqlite.md) - SQLite acceleration engine
