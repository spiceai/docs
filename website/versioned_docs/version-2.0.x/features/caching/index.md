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

Results caching improves performance for repeated requests and non-accelerated results, such as refresh data returned [on zero results](data-acceleration/data-refresh#behavior-on-zero-results).

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
      stale_while_revalidate_ttl: 30s # Default 0s (disabled)
    search_results:
      enabled: true
      max_size: 1GiB # Default 128 MiB
      item_ttl: 1m # Default 1s
```

## `caching` Parameters

| Parameter name   | Optional | Description                                                                                                                                                                  |
| ---------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql_results`    | Yes      | Enabled by default. Configures the Runtime cache for results from SQL queries. See the [SQL Results Parameters](#cachingsql_results-parameters) for cache parameter details. |
| `search_results` | Yes      | Enabled by default. Configures the Runtime cache for results from searches. See the [Common Caching Parameters](#common-caching-parameters) for cache parameter details.     |
| `embeddings`     | Yes      | Enabled by default. Configures the Runtime cache for embeddings requests. See the [Common Caching Parameters](#common-caching-parameters) for cache parameter details.       |

## Common Caching Parameters

Every cache type (`sql_results`, `search_results`, `embeddings`) supports the following parameters:

| Parameter name      | Optional | Default  | Description                                                                                                                                                                                                  |
| ------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `enabled`           | Yes      | `true`   | Defaults to `true`.                                                                                                                                                                                          |
| `max_size`          | Yes      | `128MiB` | Maximum cache size. Defaults to `128MiB`.                                                                                                                                                                    |
| `eviction_policy`   | Yes      | `lru`    | Cache replacement policy when the cache reaches `max_size`. Defaults to `lru`. Supports `lru` (Least Recently Used) and `tiny_lfu` (Tiny Least Frequently Used, higher hit rate for skewed access patterns). |
| `item_ttl`          | Yes      | `1s`     | Cache entry expiration duration (Time to Live). Defaults to 1 second.                                                                                                                                        |
| `hashing_algorithm` | Yes      | `xxh3`   | Selects which hashing algorithm is used to hash the cache keys when storing the results. Defaults to `xxh3`. Supports `xxh3`, `ahash`, `siphash`, `blake3`, `xxh32`, `xxh64`, or `xxh128`.                   |

## `caching.sql_results` Parameters

In addition to the common caching parameters, `sql_results` also supports additional parameters:

| Parameter name               | Optional | Default | Description                                                                                                                                                                                                           |
| ---------------------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cache_key_type`             | Yes      | `plan`  | Determines how cache keys are generated. Defaults to `plan`. `plan` uses the query's logical plan, while `sql` uses the raw SQL query string.                                                                         |
| `encoding`                   | Yes      | `none`  | Compression algorithm for cached results. Defaults to `none`. Supports `none` or `zstd`.                                                                                                                              |
| `stale_while_revalidate_ttl` | Yes      | `0s`    | Duration to serve stale cache entries while revalidating in the background. When set to a non-zero value, expired cache entries continue to be served while a background refresh occurs. Defaults to `0s` (disabled). |

### Choosing a `cache_key_type`

- **`plan` (Default):** Uses the query's logical plan as the cache key. This approach matches semantically equivalent queries, even if their SQL syntax differs. However, it requires query parsing, which introduces some overhead.
- **`sql`:** Uses the raw SQL string as the cache key. This method provides faster lookups but requires exact string matches. Queries with dynamic functions, such as `NOW()`, may produce unexpected results because the cache key changes with each execution. Use `sql` only when query results are predictable and consistent.

Use `sql` for the lowest latency with identical queries that do not include dynamic functions. Use `plan` for greater flexibility and semantic matching of queries.

## Choosing a `hashing_algorithm`

The hashing algorithm determines how cache keys are hashed before being stored, impacting both lookup speed and protection against potential DOS attacks.

- **`xxh3` (Default):** Uses the [XXH3](https://cyan4973.github.io/xxHash/) algorithm for hashing the cache keys. XXH3 is a fast, non-cryptographic hash algorithm that provides high performance and good distribution. It is suitable for scenarios where speed is critical and cryptographic security is not required.
- **`siphash`:** Uses the SipHash1-3 algorithm for hashing the cache keys, the [default hashing algorithm of Rust](https://github.com/rust-lang/rust/commit/db1b1919baba8be48d997d9f70a6a5df7e31612a). This hashing algorithm is a secure algorithm that implements verified protections against ["hash flooding"](https://v8.dev/blog/hash-flooding) denial of service (DoS) attacks. Reasonably performant, and provides a high level of security.
- **`ahash`:** Uses the [AHash](https://github.com/tkaitchuck/ahash) algorithm for hashing the cache keys. The AHash algorithm is a [high quality](https://github.com/tkaitchuck/aHash/blob/master/compare/readme#Quality) hashing algorithm, and has claimed resistance against hashing DoS attacks. AHash has higher performance than SipHash1-3, especially when used with `cache_key_type: plan`.
- **`blake3`:** Uses the [BLAKE3](https://github.com/BLAKE3-team/BLAKE3) cryptographic hash function. BLAKE3 is a fast, parallelizable hash function that provides cryptographic security while maintaining high performance. It is suitable for scenarios requiring both speed and cryptographic guarantees.
- **`xxh32`, `xxh64`, `xxh128`:** Variants of the XXH hashing algorithm with different output sizes. These algorithms offer a balance between speed and collision resistance, with larger hash sizes providing better collision resistance at the cost of performance.

Use `xxh3` (the default) for its superior speed in most scenarios. Use `ahash`, `xxh64` or `xxh128` for reduced collision probability when caching a large number of queries. Use `blake3` when cryptographic security is required. Use `siphash` when protection against hash flooding attacks is a priority.

### Choosing an `encoding`

The encoding algorithm determines how cached results are compressed in memory, trading CPU for memory efficiency. Currently supported for SQL results only.

- **`none` (Default):** Stores query results uncompressed. Uses more memory but has zero compression overhead. Best for small result sets or when memory is not a constraint.
- **`zstd`:** Uses the [Zstandard compression algorithm](https://facebook.github.io/zstd/) to compress cached query results. Provides high compression ratios (often 50-90% reduction) with fast decompression speeds. Recommended when caching large result sets to maximize cache capacity.

Use `zstd` when maximizing cache efficiency is important, especially for large queries that would otherwise quickly fill the cache. Use `none` for the lowest latency when memory is not constrained.

## Per-Principal Cache Isolation

When [authentication](../api/auth) is enabled, all cache layers (SQL results, search results, and caching-mode acceleration storage) are automatically scoped per principal. Each authenticated caller has an isolated cache namespace — one caller's cached output is never served to a different caller.

| Scenario | Cache namespace |
| --- | --- |
| Auth disabled or anonymous request | `public` — all callers share the cache |
| Authenticated principal (e.g., API key) | Per-principal — isolated by a hash of the principal's identity |
| Background / system tasks (e.g., SWR revalidation) | Inherits the originating principal's namespace |

There are no user-facing knobs to disable isolation. Scope follows authentication presence by construction.

:::warning[Breaking change for caching accelerator]
The caching accelerator storage schema gains an internal `__spice_cache_namespace` column. Existing accelerator storage from earlier versions must be deleted (e.g., remove the `duckdb_file`, drop the backing table) before upgrading. The runtime errors with a clear message at startup if it encounters a non-extended schema.

The SQL results cache and search cache are in-memory and require no migration.
:::

## Cached Responses

Responses from HTTP APIs include headers that indicate the cache status and scope:

| Cache            | Status Header                 | Scope Header                    |
| ---------------- | ----------------------------- | ------------------------------- |
| `sql_results`    | `Results-Cache-Status`        | `Results-Cache-Scope`           |
| `search_results` | `Search-Results-Cache-Status` | `Search-Results-Cache-Scope`    |

The status header indicates the cache status:

| Header value         | Description                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `HIT`                | The query result was served from the cache.                                                                                              |
| `MISS`               | The cache was checked, but the result was not found.                                                                                     |
| `BYPASS`             | The cache was bypassed for this query (e.g., when `cache-control: no-cache` is specified).                                               |
| `STALE`              | A stale cache entry was served while the cache is being revalidated in the background (when `stale_while_revalidate_ttl` is configured). |
| _header not present_ | The cache did not apply to this query (e.g., when caching is disabled or querying a system table).                                       |

The scope header indicates the cache namespace:

| Scope value | Description |
| --- | --- |
| `shared` | The cache entry is in the public namespace (auth disabled or anonymous). |
| `user` | The cache entry is scoped to the authenticated principal. When the scope is `user`, the response also includes `Vary: Authorization`. |
| `system` | The cache entry is in the system/background namespace. |

### Examples

#### Cached Response

```bash
$ curl -XPOST -i http://localhost:8090/v1/sql -d 'select * from taxi_trips limit 1;'
HTTP/1.1 200 OK
content-type: text/plain; charset=utf-8
results-cache-status: HIT
results-cache-scope: shared
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
results-cache-scope: shared
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

#### Stale Cache Response (Stale-While-Revalidate)

```bash
$ curl -XPOST -i http://localhost:8090/v1/sql -d 'select * from taxi_trips limit 1;'
HTTP/1.1 200 OK
content-type: text/plain; charset=utf-8
results-cache-status: STALE
vary: origin, access-control-request-method, access-control-request-headers
content-length: 416
date: Thu, 13 Feb 2025 03:15:30 GMT
```

## Cache Control

You can control caching behavior for specific requests using HTTP headers. The `Cache-Control` header helps skip the cache for a request while caching the results for subsequent requests.

### Stale-While-Revalidate

The `stale_while_revalidate_ttl` parameter configures a grace period during which stale cache entries continue to be served while a background refresh occurs. This technique reduces latency for end users by serving cached data immediately, even after `item_ttl` expires, while the system fetches fresh data asynchronously.

When `stale_while_revalidate_ttl` is set to a non-zero value:

1. Cache entries are served normally until `item_ttl` expires.
2. After `item_ttl` expires but before `item_ttl + stale_while_revalidate_ttl` expires, the stale entry is served immediately with a `STALE` cache status.
3. Simultaneously, a background task refreshes the cache entry.
4. Once the background refresh completes, subsequent requests receive the fresh data with a `HIT` cache status.
5. After `item_ttl + stale_while_revalidate_ttl` expires, the entry is evicted and the next request results in a `MISS`.

#### Example Configuration

```yaml
runtime:
  caching:
    sql_results:
      enabled: true
      item_ttl: 10s
      stale_while_revalidate_ttl: 10s
```

With this configuration:

- Fresh cache entries are served for 10 seconds after creation.
- Between 10-20 seconds after creation, stale entries are served while being refreshed in the background.
- After 20 seconds, the entry is evicted if not refreshed.

This approach is particularly useful for queries that take significant time to execute, providing a better user experience by reducing perceived latency while keeping data reasonably fresh.

:::warning[Conflict with Caching Accelerator SWR]
When using a dataset with `refresh_mode: caching`, you cannot configure both the results cache's `stale_while_revalidate_ttl` and the caching accelerator's `caching_stale_while_revalidate_ttl` for the same dataset. These parameters control similar behavior at different layers.

Choose one approach:

- **Results cache SWR**: Configure `runtime.caching.sql_results.stale_while_revalidate_ttl` for SQL query results caching
- **Caching accelerator SWR**: Configure `acceleration.params.caching_stale_while_revalidate_ttl` for [HTTP-based dataset caching](data-acceleration/refresh-modes/caching)

:::

### HTTP/Flight API

The following endpoints support the standard HTTP [`Cache-Control` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control):

- SQL query (HTTP and Arrow Flight)
- Search (HTTP)

The following `Cache-Control` directives are supported:

| Directive                                                                                                  | Description                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`no-cache`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#no-cache)             | Skips the cache for the current request but caches the results for future requests.                                                                                                                                                                |
| [`min-fresh`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#min-fresh)           | Specifies the minimum time (in seconds) that a cached response must remain fresh. For example, `min-fresh=60` requires the cached entry to be fresh for at least 60 more seconds.                                                                  |
| [`max-stale`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#max-stale)           | Indicates the client will accept a stale response. An optional value in seconds specifies the maximum staleness allowed. For example, `max-stale=30` accepts responses stale for up to 30 seconds.                                                 |
| [`only-if-cached`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#only-if-cached) | Returns only cached responses. If no cached response is available, returns an error instead of fetching fresh data.                                                                                                                                |

#### HTTP Example

```bash
# Default behavior (uses cache)
curl -XPOST http://localhost:8090/v1/sql -d 'SELECT 1'

# Skip cache for this query, but cache the results for future queries
curl -H "cache-control: no-cache" -XPOST http://localhost:8090/v1/sql -d 'SELECT 1'

# Only use cached response if it will be fresh for at least 30 more seconds
curl -H "cache-control: min-fresh=30" -XPOST http://localhost:8090/v1/sql -d 'SELECT 1'

# Accept cached responses that are stale for up to 60 seconds
curl -H "cache-control: max-stale=60" -XPOST http://localhost:8090/v1/sql -d 'SELECT 1'

# Only return cached responses, fail if cache miss
curl -H "cache-control: only-if-cached" -XPOST http://localhost:8090/v1/sql -d 'SELECT 1'
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

The cache can be controlled using JDBC properties. For example,

```java
Properties props = new Properties();
props.setProperty("cache-control", "no-cache");
Connection conn = DriverManager.getConnection("jdbc:arrow-flight-sql://localhost:50051", props);
```

### `spice` CLI

The `spice sql` and `spice search` commands accept a `--cache-control` flag, which takes `cache` (the default) or `no-cache`:

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

:::note

`--cache-control` chooses between normal cache behavior (`cache`) and bypassing the cache
lookup for this request (`no-cache`, which still stores the result for later requests). It
does not accept the other `Cache-Control` directives: `spice search` rejects any value
other than `cache` or `no-cache`, and `spice sql` silently falls back to `cache`. To use
`min-fresh`, `max-stale`, or `only-if-cached`, send the `Cache-Control` header directly
against the HTTP or Arrow Flight API.

:::

## Custom Cache Keys

Set the `Spice-Cache-Key` header to supply a custom cache key. When set, a supplied cache key takes precedence over `caching.sql_results.cache_key_type`.

:::info[Info]
A valid cache key consists of up to 128 alphanumeric characters (and the characters `-` and `_`).
:::

### HTTP Example

Consider the case of two semantically equivalent queries:

```
Time: 0.0251325 seconds. 2 rows.
sql> select * from users where org_id = 1;
+----+--------+-------+----------------+
| id | org_id | name  | email          |
+----+--------+-------+----------------+
| 1  | 1      | Jane  | jane@spice.ai  |
| 2  | 1      | Sarah | sarah@spice.ai |
+----+--------+-------+----------------+

Time: 0.008993042 seconds. 2 rows.
sql> select * from users where split_part(email, '@', 2) = 'spice.ai';
+----+--------+-------+----------------+
| id | org_id | name  | email          |
+----+--------+-------+----------------+
| 1  | 1      | Jane  | jane@spice.ai  |
| 2  | 1      | Sarah | sarah@spice.ai |
+----+--------+-------+----------------+
```

To share a cache key for these queries, set `Spice-Cache-Key`. The first request is a cache miss:

```bash
$ curl -i -XPOST http://localhost:8090/v1/sql -H"spice-cache-key: users_spiceai" -d "select * from users where org_id = 1;"
HTTP/1.1 200 OK
content-type: application/json
x-cache: Miss from spiceai
results-cache-status: MISS
vary: Spice-Cache-Key
vary: origin, access-control-request-method, access-control-request-headers
content-length: 119
date: Thu, 24 Jul 2025 14:15:53 GMT

[{"id":1,"org_id":1,"name":"Jane","email":"jane@spice.ai"},{"id":2,"org_id":1,"name":"Sarah","email":"sarah@spice.ai"}]
```

The subsequent request with the different (but semantically equivalent) query is a cache hit:

```bash
$ curl -i -XPOST http://localhost:8090/v1/sql -H"spice-cache-key: users_spiceai" -d "select * from users where split_part(email, '@', 2) = 'spice.ai';"
HTTP/1.1 200 OK
content-type: application/json
x-cache: Hit from spiceai
results-cache-status: HIT
vary: Spice-Cache-Key
vary: origin, access-control-request-method, access-control-request-headers
content-length: 119
date: Thu, 24 Jul 2025 14:18:00 GMT
```

:::warning[Note]
When supplying a custom cache key, **ensure the semantic equivalence of queries**. For example, this is expected behavior:

```bash
$ curl -i -XPOST http://localhost:8090/v1/sql -H"spice-cache-key: users_spiceai" -d "select 1"
HTTP/1.1 200 OK
content-type: application/json
x-cache: Hit from spiceai
results-cache-status: HIT
vary: Spice-Cache-Key
vary: origin, access-control-request-method, access-control-request-headers
content-length: 119
date: Thu, 24 Jul 2025 14:21:32 GMT

[{"id":1,"org_id":1,"name":"Jane","email":"jane@spice.ai"},{"id":2,"org_id":1,"name":"Sarah","email":"sarah@spice.ai"}]
```

:::

## Metrics

Cache metrics can be monitored using the [Prometheus-compatible Metrics Endpoint](observability). The following metrics are available for each cache type:

| Metric                   | Type    | Description                                                |
| ------------------------ | ------- | ---------------------------------------------------------- |
| `*_cache_max_size_bytes` | Gauge   | Maximum configured cache size in bytes.                    |
| `*_cache_requests`       | Counter | Total number of cache lookup requests.                     |
| `*_cache_hits`           | Counter | Total number of cache hits.                                |
| `*_cache_items_count`    | Gauge   | Current number of items in the cache.                      |
| `*_cache_size_bytes`     | Gauge   | Current cache size in bytes.                               |
| `*_cache_evictions`      | Counter | Total number of cache evictions due to size or TTL limits. |
| `*_cache_hit_ratio`      | Gauge   | Current cache hit ratio (hits / total requests).           |

The `*` prefix corresponds to the cache type:

- `results_*` - SQL query results cache metrics
- `search_results_*` - Search results cache metrics
- `embeddings_*` - Embeddings cache metrics

Example metrics output:

```
# HELP results_cache_evictions Number of cache evictions.
# TYPE results_cache_evictions counter
results_cache_evictions 2
# HELP results_cache_hit_ratio Cache hit ratio (hits / total requests).
# TYPE results_cache_hit_ratio gauge
results_cache_hit_ratio 0.625
# HELP results_cache_hits Cache hit count.
# TYPE results_cache_hits counter
results_cache_hits 14
# HELP results_cache_items_count Number of items currently in the cache.
# TYPE results_cache_items_count gauge
results_cache_items_count 1
# HELP results_cache_max_size_bytes Maximum allowed size of the cache in bytes.
# TYPE results_cache_max_size_bytes gauge
results_cache_max_size_bytes 134217728
# HELP results_cache_misses Cache miss count.
# TYPE results_cache_misses counter
results_cache_misses 4
# HELP results_cache_requests Number of requests to get a key from the cache.
# TYPE results_cache_requests counter
results_cache_requests 18
# HELP results_cache_size_bytes Size of the cache in bytes.
# TYPE results_cache_size_bytes gauge
results_cache_size_bytes 7776
```
