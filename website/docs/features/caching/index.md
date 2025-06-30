---
title: 'Caching'
sidebar_label: 'Caching'
description: 'Learn how to use Spice in-memory caching'
sidebar_position: 3
pagination_prev: null
pagination_next: null
tags: [caching]
---

Spice supports in-memory caching for SQL query results and search results, which are both enabled by default when querying or searching via the HTTP (`/v1/sql`, `/v1/search`) and Arrow Flight APIs.

Results caching improves performance for repeated requests and non-accelerated results, such as refresh data returned [on zero results](/docs/features/data-acceleration/data-refresh.md#behavior-on-zero-results).

The cache uses a [least-recently-used (LRU)](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU) replacement policy. You can configure the cache to set an item expiration duration, which defaults to 1 second.

```yaml
version: v1
kind: Spicepod
name: app

runtime:
  caching:
    sql_results:
      enabled: true
      max_size: 1GiB # Default 128 MiB
      item_ttl: 1m # Default 1s
    search_results:
      enabled: true
      max_size: 1GiB # Default 128 MiB
      item_ttl: 1m # Default 1s
```

## `caching` Parameters

| Parameter name   | Optional | Description                                                |
| ---------------- | -------- | ---------------------------------------------------------- |
| `sql_results`    | Yes      | Configures the Runtime cache for results from SQL queries. |
| `search_results` | Yes      | Configures the Runtime cache for results from searches.    |

## Common Caching Parameters

Every cache type (`sql_results`, `search_results`) supports the following parameters:

| Parameter name      | Optional | Description                                                                                                                                    |
| ------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`           | Yes      | Defaults to `true`.                                                                                                                            |
| `max_size`          | Yes      | Maximum cache size. Defaults to `128MiB`.                                                                                                      |
| `eviction_policy`   | Yes      | Cache replacement policy when the cache reaches `max_size`. Defaults to `lru`, which is currently the only supported value.                    |
| `item_ttl`          | Yes      | Cache entry expiration duration (Time to Live). Defaults to 1 second.                                                                          |
| `hashing_algorithm` | Yes      | Selects which hashing algorithm is used to hash the cache keys when storing the results. Defaults to `siphash`. Supports `siphash` or `ahash`. |

## Choosing a `hashing_algorithm`

The hashing algorithm determines how cache keys are hashed before being stored, impacting both lookup speed and protection against potential DOS attacks.

- **`siphash` (Default):** Uses the SipHash1-3 algorithm for hashing the cache keys, the [default hashing algorithm of Rust](https://github.com/rust-lang/rust/commit/db1b1919baba8be48d997d9f70a6a5df7e31612a). This hashing algorithm is a secure algorithm that implements verified protections against ["hash flooding"](https://v8.dev/blog/hash-flooding) denial of service (DoS) attacks. Reasonably performant, and provides a high level of security.
- **`ahash`:** Uses the [AHash](https://github.com/tkaitchuck/ahash) algorithm for hashing the cache keys. The AHash algorithm is a [high quality](https://github.com/tkaitchuck/aHash/blob/master/compare/readme.md#Quality) hashing algorithm, and has claimed resistance against hashing DoS attacks. AHash has higher performance than SipHash1-3, especially when used with `cache_key_type: plan`.

Consider using `ahash` if maximum performance is most important, or where hashing DoS attacks are unlikely or a low risk. More information on the security mechanisms of AHash are available [in the AHash documentation](https://github.com/tkaitchuck/aHash/wiki/How-aHash-is-resists-DOS-attacks).

## `caching.sql_results` Parameters

In addition to the common caching parameters, `sql_results` also supports additional parameters:

| Parameter name   | Optional | Description                                                                                                                                   |
| ---------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `cache_key_type` | Yes      | Determines how cache keys are generated. Defaults to `plan`. `plan` uses the query's logical plan, while `sql` uses the raw SQL query string. |

### Choosing a `cache_key_type`

- **`plan` (Default):** Uses the query's logical plan as the cache key. This approach matches semantically equivalent queries, even if their SQL syntax differs. However, it requires query parsing, which introduces some overhead.
- **`sql`:** Uses the raw SQL string as the cache key. This method provides faster lookups but requires exact string matches. Queries with dynamic functions, such as `NOW()`, may produce unexpected results because the cache key changes with each execution. Use `sql` only when query results are predictable and consistent.

Use `sql` for the lowest latency with identical queries that do not include dynamic functions. Use `plan` for greater flexibility and semantic matching of queries.

## Cached Responses

Responses from HTTP APIs include a header that indicates the cache status of the applicable cache:

| Cache            | Header Key                    |
| ---------------- | ----------------------------- |
| `sql_results`    | `Results-Cache-Status`        |
| `search_results` | `Search-Results-Cache-Status` |

The value of the header indicates the status of the cache:

| Header value         | Description                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| `HIT`                | The query result was served from the cache.                                                        |
| `MISS`               | The cache was checked, but the result was not found.                                               |
| `BYPASS`             | The cache was bypassed for this query (e.g., when `cache-control: no-cache` is specified).         |
| _header not present_ | The cache did not apply to this query (e.g., when caching is disabled or querying a system table). |

### Examples

#### Cached Response

```bash
$ curl -XPOST -i http://localhost:8090/v1/sql -d 'select * from taxi_trips limit 1;'
HTTP/1.1 200 OK
content-type: text/plain; charset=utf-8
results-cache-status: HIT
vary: origin, access-control-request-method, access-control-request-headers
content-length: 416
date: Thu, 13 Feb 2025 03:05:39 GMT
```

#### Uncached Response

```bash
$ curl -XPOST -i http://localhost:8090/v1/sql -d 'select * from taxi_trips limit 1;'
HTTP/1.1 200 OK
content-type: text/plain; charset=utf-8
results-cache-status: MISS
vary: origin, access-control-request-method, access-control-request-headers
content-length: 416
date: Thu, 13 Feb 2025 03:13:19 GMT
```

#### Bypassed Cache with `cache-control: no-cache`

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

You can control caching behavior for specific requests using HTTP headers. The `Cache-Control` header helps skip the cache for a request while caching the results for subsequent requests.

### HTTP/Flight API

The following endpoints support the standard HTTP [`Cache-Control` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control):

- SQL query (HTTP and Arrow Flight)
- Search (HTTP)

The [`no-cache` directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#no-cache) skips the cache for the current request but caches the results for future requests.

Other `Cache-Control` directives are not supported.

#### HTTP Example

```bash
# Default behavior (uses cache)
curl -XPOST http://localhost:8090/v1/sql -d 'SELECT 1'

# Skip cache for this query, but cache the results for future queries
curl -H "cache-control: no-cache" -XPOST http://localhost:8090/v1/sql -d 'SELECT 1'
```

#### Arrow FlightSQL Example

The following example skips the cache for a specific query using FlightSQL in Rust:

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

### `spice` CLI

The `spice sql` and `spice search` commands accept a `--cache-control` flag that follows the same behavior as the HTTP `Cache-Control` header:

```bash
# Default behavior (use cache if available)
spice sql
# Same as above
spice sql --cache-control cache
# Skip cache for this query, but cache the results for future queries
spice sql --cache-control no-cache

# Default behavior (use cache if available)
spice search
# Same as above
spice search --cache-control cache
# Skip cache for this search, but cache the results for future searches
spice search --cache-control no-cache
```
