---
title: 'Results Caching'
sidebar_label: 'Results Caching'
description: 'Learn how to use Spice in-memory caching of query results'
sidebar_position: 3
pagination_prev: null
pagination_next: null
tags:
  - caching
  - results caching
  - cache control
---

Spice supports in-memory caching of query results, which is enabled by default for both the HTTP (`/v1/sql`) and Arrow Flight APIs.

Results caching can help improve performance for bursts of requests and for non-accelerated results such as refresh data returned [on zero results](/docs/features/data-acceleration/data-refresh.md#behavior-on-zero-results).

Results caching employs a [least-recently-used (LRU)](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU) cache replacement policy with the ability to specify an item expiry duration, which defaults to 1-second.

```yaml
version: v1
kind: Spicepod
name: app

runtime:
  results_cache:
    enabled: true
    cache_max_size: 128MiB
    eviction_policy: lru
    item_ttl: 1s
```

| Parameter name    | Optional | Description                                                                                                                     |
| ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`         | Yes      | `true` by default                                                                                                               |
| `cache_max_size`  | Yes      | Maximum cache size. Default is `128MiB`                                                                                         |
| `eviction_policy` | Yes      | Cache replacement policy when the cached data reaches the `cache_max_size`. Default and only currently supported value is `lru` |
| `item_ttl`        | Yes      | Cache entry expiration duration (Time to Live), 1 second by default.                                                            |
| `cache_key_type`  | Yes      | Determines how cache keys are generated. `plan` (default) uses the query's logical plan. `sql` uses the raw SQL query string. |

### Choosing a `cache_key_type`

- **`plan` (Default):** Uses query's logical plan as cache key. Matches semantically equivalent queries. Requires query parsing first.
- **`sql`:** Uses raw SQL string as cache key. Faster lookups but requires exact string matches. May return stale results for parameterized queries.

Choose `sql` for lowest latency with identical queries, `plan` for more flexibility.

## Cached responses

The response includes a `Results-Cache-Status` header indicating the cache status of the query:

| Header value | Description |
| ----------- | ----------- |
| `HIT` | The query result was served from cache |
| `MISS` | The cache was checked but the result was not found |
| `BYPASS` | The cache was bypassed for this query. (e.g., when `cache-control: no-cache` is specified) |
| _header not present_ | Results cache did not apply to this query. (e.g. when results cache is disabled or querying a system table) |

Example cached response:

```bash
$ curl -XPOST -i http://localhost:8090/v1/sql -d 'select * from taxi_trips limit 1;'
HTTP/1.1 200 OK
content-type: text/plain; charset=utf-8
results-cache-status: HIT
vary: origin, access-control-request-method, access-control-request-headers
content-length: 416
date: Thu, 13 Feb 2025 03:05:39 GMT
```

Example uncached response:

```bash
$ curl -XPOST -i http://localhost:8090/v1/sql -d 'select * from taxi_trips limit 1;'
HTTP/1.1 200 OK
content-type: text/plain; charset=utf-8
results-cache-status: MISS
vary: origin, access-control-request-method, access-control-request-headers
content-length: 416
date: Thu, 13 Feb 2025 03:13:19 GMT
```

Example uncached response with `cache-control: no-cache`:

```bash
$ curl -H "cache-control: no-cache" -XPOST -i http://localhost:8090/v1/sql -d 'select * from taxi_trips limit 1;'
HTTP/1.1 200 OK
content-type: text/plain; charset=utf-8
results-cache-status: BYPASS
vary: origin, access-control-request-method, access-control-request-headers
content-length: 416
date: Thu, 13 Feb 2025 03:14:00 GMT
```

## Cache Control

The results cache behavior can be controlled for specific queries through HTTP headers. The `Cache-Control` header can be used to skip the cache for a specific query, but still cache the results for subsequent queries.

### HTTP/Flight API

The SQL query API endpoints (both HTTP and Arrow Flight) understand the standard HTTP [`Cache-Control` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control), supporting the [`no-cache` directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#no-cache). When `no-cache` is specified, the cache is not used for the current query, but the query results are cached for subsequent queries.

`Cache-Control` directives other than `no-cache` are not supported.

#### HTTP Example

```bash
# Default behavior (use cache)
curl -XPOST http://localhost:8090/v1/sql -d 'SELECT 1'

# Skip cache for this query, but cache the results for future queries
curl -H "cache-control: no-cache" -XPOST http://localhost:8090/v1/sql -d 'SELECT 1'
```

#### Arrow FlightSQL Example

The following example shows how to skip the cache for a specific query using FlightSQL in Rust:

```rust
let sql_command = arrow_flight::sql::CommandStatementQuery {
    query: "SELECT 1".to_string(),
    transaction_id: None,
};
let sql_command_bytes = sql_command.as_any().encode_to_vec();

let mut request = FlightDescriptor::new_cmd(sql_command_bytes).into_request();

request
  .metadata_mut()
  .insert("cache-control", "no-cache");

// Send the request
```

### `spice sql` CLI

The `spice sql`