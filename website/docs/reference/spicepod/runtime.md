---
title: 'Runtime'
sidebar_label: 'Runtime'
description: 'Runtime YAML reference'
---

The `runtime` section specifies configuration settings for the Spice runtime.

## Reload Behavior

Editing a Spicepod on disk reloads it into the running process, but **most of `runtime.*` is consumed once when `spiced` starts and cannot be rebuilt in place**. A reload installs the new value in the app while the process keeps running the old one; `spiced` logs a warning naming each start-time-only section that changed and telling you to restart. Restart `spiced` to apply them.

**Applied when `spiced` starts — a reload logs a warning and the previous value stays in effect:**

`runtime.auth` · `runtime.caching` · `runtime.cors` · `runtime.cpu` · `runtime.dataset_load_parallelism` · `runtime.mcp` · `runtime.metrics` · `runtime.output_level` · `runtime.query` · `runtime.ready_state` · `runtime.scheduler` · `runtime.state` · `runtime.task_history` · `runtime.telemetry` · `runtime.tls` · `runtime.tracing`

**Applied when `spiced` starts, except for components the same reload recreates** — a connector rebuilt by the reload reads the new value, while the process-wide use of it does not change until a restart:

`runtime.adaptive_tuning` · `runtime.flight` · `runtime.params` · `runtime.source_rate_control`

**Applied on reload — no restart needed:**

| Setting                                  | Why it applies                                             |
| ---------------------------------------- | ------------------------------------------------------------ |
| `runtime.shutdown_timeout`               | Read from the current app when the runtime shuts down.       |
| `runtime.functions`                      | Reconciled by the function diff on each reload.              |
| `runtime.caching.sql_results.cache_key_type` | Resolved per request from the live app.                  |
| `runtime.query.timeout`                  | Resolved per request from the live app.                      |
| `runtime.telemetry.user_agent_collection` | Resolved per request from the live app.                     |

The three per-request settings sit inside otherwise start-time-only sections. Changing one of them alone takes effect on the next request and is not reported as requiring a restart; changing any *other* key in the same section is.

:::note
`runtime.tls` certificate and CA **files** are separately hot-reloadable without a restart — see [Certificate Hot-Reload](#certificate-hot-reload). Inline PEM material is loaded once at startup.
:::

## `runtime.auth`

### `runtime.auth.api-key`

Spice supports adding optional authentication to its API endpoints via configurable API keys. [Learn more](../../api/auth).

```yaml
runtime:
  auth:
    api-key:
      enabled: true
      keys:
        - ${ secrets:api_key } # Use the secret replacement syntax to load the API key from a secret store
        - 1234567890 # Or specify the API key directly
```

API key authentication supports the following configuration parameters:

| Parameter name | Optional | Default | Description                                                    |
| -------------- | -------- | ------- | -------------------------------------------------------------- |
| `enabled`      | Yes      | `true`  | Defaults to `true`. Whether API key authentication is enabled  |
| `keys`         | No       | -       | A list of API keys used to authenticate requests.              |

## `runtime.dataset_load_parallelism`

This setting specifies the maximum number of datasets that can be loaded in parallel during startup. By default, the number of parallel datasets is unlimited.

## `runtime.caching`

This setting specifies cache settings for supported Runtime components:

- `sql_results`: Specifies cache settings for results from SQL queries.
- `search_results`: Specifies cache settings for results from searches.
- `embeddings`: Specifies cache settings for embeddings requests.

Runtime caches support common configuration parameters:

| Parameter name      | Optional | Default  | Description                                                                                                                                                                                                  |
| ------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `enabled`           | Yes      | `true`   | Defaults to `true`.                                                                                                                                                                                          |
| `max_size`          | Yes      | `128MiB` | Maximum cache size. Defaults to `128MiB`.                                                                                                                                                                    |
| `eviction_policy`   | Yes      | `lru`    | Cache replacement policy when the cache reaches `max_size`. Defaults to `lru`. Supports `lru` (Least Recently Used), `lfu` (Least Frequently Used), and `tiny_lfu` (Window TinyLFU, higher hit rate for skewed access patterns). |
| `item_ttl`          | Yes      | `1s`     | Cache entry expiration duration (Time to Live). Defaults to 1 second.                                                                                                                                        |
| `hashing_algorithm` | Yes      | `xxh3`   | Selects which hashing algorithm is used to hash the cache keys when storing the results. Defaults to `xxh3`. Supports `xxh3`, `ahash`, `siphash`, `blake3`, `xxh32`, `xxh64`, or `xxh128`.                   |
| `engine`            | Yes      | -        | Ignored. Accepted so existing spicepods still load; `engine: pingora` logs a one-time warning. [Learn more](../../features/caching#the-engine-parameter). |

### `runtime.caching.search_results`

The search results cache section specifies runtime search cache configuration. [Learn more](../../features/caching).

```yaml
runtime:
  caching:
    search_results:
      enabled: true
      max_size: 128MiB
      item_ttl: 1s
```

The search results cache supports the common cache configuration parameters.

### `runtime.caching.embeddings`

The embeddings cache section specifies runtime embeddings requests cache configuration. [Learn more](../../features/caching).

```yaml
runtime:
  caching:
    embeddings:
      enabled: true
      max_size: 128MiB
      item_ttl: 1s
```

The embeddings cache supports the common cache configuration parameters.

### `runtime.caching.sql_results`

The SQL results cache section specifies runtime SQL query cache configuration. [Learn more](../../features/caching).

```yaml
runtime:
  caching:
    sql_results:
      enabled: true
      max_size: 128MiB
      item_ttl: 1s
```

In addition to the common cache configuration parameters, `sql_results` also supports the following parameters:

| Parameter name               | Optional | Default | Description                                                                                                                                                                                                           |
| ---------------------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cache_key_type`             | Yes      | `plan`  | Determines how cache keys are generated. Defaults to `plan`. `plan` uses the query's logical plan, while `sql` uses the raw SQL query string.                                                                         |
| `encoding`                   | Yes      | `none`  | Compression algorithm for cached results. Defaults to `none`. Supports `none` or `zstd`.                                                                                                                              |
| `stale_while_revalidate_ttl` | Yes      | `0s`    | Duration to serve stale cache entries while revalidating in the background. When set to a non-zero value, expired cache entries continue to be served while a background refresh occurs. Defaults to `0s` (disabled). |
| `warmup`                     | Yes      | `disabled` | `on_first_refresh` records the first 10 distinct query shapes (plans with equality-filter values replaced by placeholders) and replays them after the next restart, once accelerated `full` and `append` datasets finish their first refresh. Datasets stay not ready until the replay completes. Requires `enabled: true` and `cache_key_type: plan`. See [Warming the Cache After a Restart](../../features/caching#warming-the-cache-after-a-restart). |

:::info

`runtime.results_cache` has been deprecated and will be removed in a future release. If `runtime.results_cache` is specifed in the spicepod it will override the `runtime.caching.sql_results` settings if it is not defined.

:::

#### Choosing a `cache_key_type`

- **`plan` (Default):** Uses the query's logical plan as the cache key. Matches semantically equivalent queries but requires query parsing.
- **`sql`:** Uses the raw SQL string as the cache key. Provides faster lookups but requires exact string matches. Queries with dynamic functions, such as `NOW()`, may produce unexpected results. Use `sql` only when results are predictable.

Use `sql` for the lowest latency with identical queries that do not include dynamic functions. Use `plan` for greater flexibility.

### Choosing a `hashing_algorithm`

- **`xxh3` (Default):** Uses the [XXH3](https://cyan4973.github.io/xxHash/) algorithm for hashing the cache keys. XXH3 is a fast, non-cryptographic hash algorithm that provides high performance and good distribution. It is suitable for scenarios where speed is critical and cryptographic security is not required.
- **`siphash`:** Uses the SipHash1-3 algorithm for hashing the cache keys, the [default hashing algorithm of Rust](https://github.com/rust-lang/rust/commit/db1b1919baba8be48d997d9f70a6a5df7e31612a). This hashing algorithm is a secure algorithm that implements verified protections against ["hash flooding"](https://v8.dev/blog/hash-flooding) denial of service (DoS) attacks. Reasonably performant, and provides a high level of security.
- **`ahash`:** Uses the [AHash](https://github.com/tkaitchuck/ahash) algorithm for hashing the cache keys. The AHash algorithm is a [high quality](https://github.com/tkaitchuck/aHash/blob/master/compare/readme#Quality) hashing algorithm, and has claimed resistance against hashing DoS attacks. AHash has higher performance than SipHash1-3, especially when used with `cache_key_type: plan`.
- **`blake3`:** Uses the [BLAKE3](https://github.com/BLAKE3-team/BLAKE3) cryptographic hash function. BLAKE3 is a fast, parallelizable hash function that provides cryptographic security while maintaining high performance. It is suitable for scenarios requiring both speed and cryptographic guarantees.
- **`xxh32`, `xxh64`, `xxh128`:** Variants of the XXH hashing algorithm with different output sizes. These algorithms offer a balance between speed and collision resistance, with larger hash sizes providing better collision resistance at the cost of performance.

Use `xxh3` (the default) for its superior speed in most scenarios. Use `ahash`, `xxh64` or `xxh128` for reduced collision probability when caching a large number of queries. Use `blake3` when cryptographic security is required. Use `siphash` when protection against hash flooding attacks is a priority.

## `runtime.params`

Optional. Global key-value parameters for the runtime.

### Dedicated thread pools

| Parameter Name          | Description                                                                                                                                                                                                                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dedicated_thread_pool` | Where query execution, acceleration refresh, CDC apply, and Cayenne compaction run. `sql_engine` (the default, also used when the parameter is unset) gives each of those a dedicated Tokio runtime: queries on the CPU pool, queries that read a bounded set of rows by primary key on a small `query-interactive` pool (one fifth of the CPU budget's cores, at least 2 threads) so key lookups do not queue behind analytical queries, refresh on a low-priority `refresh-worker` pool, CDC apply on `cdc-apply-worker` when any dataset uses `refresh_mode: changes`, and Cayenne compaction on `compaction-worker` when a dataset can produce files to compact. `disabled` runs that work on the main runtime. Any other value logs a warning and keeps `sql_engine`. |

```yaml
runtime:
  params:
    dedicated_thread_pool: sql_engine # default; set disabled to share one pool
```

See [Isolating refresh from queries](../../features/data-acceleration/data-refresh#isolating-refresh-from-queries).

### HTTP Rate Control

HTTP-based connectors (HTTP/HTTPS, GraphQL, Databricks) support the following rate control defaults. The GitHub connector is **not** part of this family — it has its own limiter, configured with [`runtime.source_rate_control.github_concurrent_connections_limit`](#runtimesource_rate_control):

| Parameter Name                    | Description                                                                                                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `http_max_concurrent_requests`    | Default maximum concurrent HTTP requests per upstream origin. Can be overridden per-dataset with `max_concurrent_requests`.                                    |
| `http_requests_per_second_limit`  | Default maximum HTTP requests per second per upstream origin. Can be overridden per-dataset with `requests_per_second_limit`.                                  |
| `http_requests_per_minute_limit`  | Default maximum HTTP requests per minute per upstream origin. Can be overridden per-dataset with `requests_per_minute_limit`.                                  |
| `http_rate_control_jitter_min`    | Default minimum random delay before HTTP requests when rate control is active. Defaults to `5ms` when a rate limit is configured. Can be overridden per-dataset. |
| `http_rate_control_jitter_max`    | Default maximum random delay before HTTP requests when rate control is active. Defaults to `10ms` when a rate limit is configured. Can be overridden per-dataset. |
| `http_rate_control_acquire_timeout`   | Default maximum time a request waits for rate-control capacity (a concurrency slot and the per-second and per-minute quota) before it fails, as a duration such as `30s`. Defaults to the component's client timeout. `0` waits without a bound. Can be overridden per-dataset with `rate_control_acquire_timeout`. |
| `http_rate_control_failure_threshold` | Default upstream error rate above which [adaptive rate control](#adaptive-rate-control) admits fewer requests, as a percentage (`25%`) or a fraction (`0.25`) above 0 and below 1. Defaults to `10%`. Can be overridden per-dataset with `rate_control_failure_threshold`. |
| `http_rate_control_window`            | Default reaction and recovery window of [adaptive rate control](#adaptive-rate-control), as a duration such as `10s`. Defaults to `10s`. Can be overridden per-dataset with `rate_control_window`.                                |

```yaml
runtime:
  params:
    http_max_concurrent_requests: 10
    http_requests_per_second_limit: 5
    http_requests_per_minute_limit: 200
```

#### Adaptive rate control

Rate control adapts to the health of each origin. While an origin's error rate stays at or below `rate_control_failure_threshold`, Spice applies the configured limits unchanged. When the error rate rises above it, Spice admits a smaller share of the configured limits, in proportion to the origin's success rate, and returns to the full limits as the origin recovers. Admission never goes above the configured limits, and an origin with no `max_concurrent_requests`, `requests_per_second_limit`, or `requests_per_minute_limit` is never throttled.

A `2xx` response counts as a success. A `408`, `429`, or `5xx` response, a connection failure, and a timeout count as failures. Other responses, such as `401` or `404`, are not counted, because sending fewer requests does not fix them. Each outcome loses half its weight every `rate_control_window`, so a shorter window reacts to failures and recovers from them faster, and a longer window changes admission more smoothly.

The share Spice admits is an admission coefficient between 0 and 1, computed from the decayed counts of requests and accepted (successful) requests:

```text
coefficient = min( (K × accepts + 1) / (requests + 1), 1 )

K = 1 / (1 − rate_control_failure_threshold)
```

On a single instance, the coefficient scales every configured limit on the origin: per-second, per-minute, and concurrency. With [limits across instances](#limits-across-instances), it scales the shared per-second and per-minute budgets, and `max_concurrent_requests` stays unscaled.

Spice logs a warning when an origin starts to be throttled, and an informational line when it recovers:

```text
WARN runtime_rate_control::adaptive: Upstream 'https://api.example.com:443' is failing more than the 10% `rate_control_failure_threshold`, so adaptive rate control is reducing requests to it below the configured limits until it recovers. See: https://spiceai.org/docs/components/data-connectors/https/deployment#rate-control
INFO runtime_rate_control::adaptive: Upstream 'https://api.example.com:443' has recovered, so adaptive rate control is sending it the full configured limits again.
```

The HTTP/HTTPS and GraphQL connectors report request outcomes and accept `rate_control_failure_threshold` and `rate_control_window`. The Databricks connector does not report outcomes, so its configured limits always apply unchanged and it does not support those two parameters. The `rate_control_adaptive_admission_ratio` and `rate_control_adaptive_throttled_total` [metrics](../../components/data-connectors/https/deployment#metrics) report the current state for each origin.

#### Bounded waits

A request that waits for rate-control capacity fails after `rate_control_acquire_timeout`, which defaults to the component's client timeout (`client_timeout` for the HTTP/HTTPS and Databricks connectors, 30 seconds for GraphQL). The query error includes:

```text
Timed out after 30s waiting for rate-control capacity for origin 'https://api.example.com:443' to admit the request. The configured rate limit could not free a slot in time. Increase the rate limit, raise `rate_control_acquire_timeout`, or lower request concurrency, then try again. See: https://spiceai.org/docs/reference/spicepod/runtime#http-rate-control
```

#### Components that share an origin

Every dataset and catalog that targets the same origin (`scheme://host:port`) shares one rate controller, so the limits apply to all of their requests together. They must resolve to the same `max_concurrent_requests`, `requests_per_second_limit`, `requests_per_minute_limit`, `rate_control_jitter_min`, `rate_control_jitter_max`, `rate_control_acquire_timeout`, `rate_control_failure_threshold`, and `rate_control_window` values. A component whose values differ from the first one registered for that origin fails to load:

```text
Multiple HTTP-based components target http://api.example.com:80 with different rate-control settings. Use the same max_concurrent_requests, requests_per_second_limit, requests_per_minute_limit, rate_control_jitter_min, rate_control_jitter_max, rate_control_acquire_timeout, rate_control_failure_threshold and rate_control_window values for components sharing an origin.
```

#### Limits across instances

In open-source builds, each Spice instance keeps its rate-control state in memory and enforces the configured limits on its own. In Spice.ai Enterprise, instances that share a [`runtime.state`](#runtimestate) location coordinate `requests_per_second_limit` and `requests_per_minute_limit` through that location, so `requests_per_second_limit: 20` means about 20 requests per second across all instances. Adaptive rate control then derives the same admission on every instance from the shared outcomes, and `rate_control_window` defaults to [`runtime.source_rate_control.refresh_interval`](#runtimesource_rate_control). `max_concurrent_requests` stays local to each instance.

An instance that cannot reach the shared `runtime.state` location keeps admitting requests against the lease it already holds. Once that lease expires, or if the instance has not obtained a lease yet, it fails closed while the location stays unreachable: a request that needs rate-control capacity fails instead of waiting, and `rate_control_fail_closed_total` counts it. The query error includes:

```text
Cluster rate-control budget exhausted for origin https://api.example.com:443; persisted store is unavailable and the lease has expired
```

### Spatial SQL Functions (opt-in)

PostGIS-style spatial `ST_*` SQL functions (via [`geodatafusion`](https://github.com/datafusion-contrib/geodatafusion)) can be optionally registered with the SQL engine.

| Parameter Name | Description                                                                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `geo`          | Set to `enabled` to register `ST_*` spatial functions. Requires a `spiced` binary built with the `geo` Cargo feature (`cargo build -p spiced --features geo`). Unset by default.       |

Both gates must be satisfied: the binary must be built with `--features geo` **and** `runtime.params.geo: enabled` must be set in the Spicepod. Standard distributions of `spiced` do not include the `geo` feature, so spatial functions remain unregistered unless you produce a custom build.

```yaml
runtime:
  params:
    geo: enabled
```

```sql
SELECT ST_AsText(ST_Point(0.0, 0.0)) AS geom;
-- POINT(0 0)
```

### Spice Cayenne (engine-global)

Engine-global tuning for the [Spice Cayenne](../../components/data-accelerators/cayenne) data accelerator. These apply to every Cayenne-accelerated dataset in the instance and are **not** valid under a dataset's `acceleration.params` (per-dataset Cayenne parameters are documented on the [Cayenne accelerator page](../../components/data-accelerators/cayenne#acceleration-parameters-accelerationparams)).

| Parameter Name                            | Description                                                                                                                                                                                                              |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cayenne_footer_cache_mb`                 | Size of the engine-wide in-memory Vortex footer cache in megabytes, shared across all Cayenne datasets. Optional; when unset, DataFusion's default file-metadata-cache limit of 50 MB applies (there is no fixed 128 MB default).                                     |
| `cayenne_segment_cache_mb`                | Total size in megabytes of the in-memory Vortex segment cache, which holds decompressed data segments. One cache serves every Cayenne table in the process, so adding a table divides this budget rather than reserving another cache. Takes a whole number of megabytes; `0` disables segment caching. When unset, derived as ~1/64 of the process's memory entitlement, clamped to 256 MB–2 GB. |
| `cayenne_filter_propagation`              | Enables Cayenne's filter-propagation optimizer rules. Accepts `enabled` or `disabled`; defaults to `disabled`.                                                                                                          |
| `cayenne_optimizer_rules`                 | Selects which Cayenne optimizer rules run. Accepts `auto` (default), `all`, `none` / `disabled`, or a comma-separated list of rule names.                                                                               |
| `cayenne_compaction_memory_fraction`      | Fraction of the query memory pool reserved for the dedicated Cayenne compaction pool. Defaults to `0.2` (clamped to a supported range). Applied only when an enabled Cayenne dataset can accumulate files to compact — a file acceleration `mode` on a refresh mode that is not a whole-table replace — and dedicated thread pools are not disabled. A pod whose Cayenne datasets are all `refresh_mode: full`, or all `mode: memory`, carves no compaction pool. |
| `cayenne_sort_merge_min_rows`             | Advanced anti-join tuning: row-count threshold above which filter propagation switches to a sort-merge strategy. Internally tuned default.                                                                              |
| `cayenne_sort_merge_memory_pool_fraction` | Advanced anti-join tuning: fraction of the memory pool the sort-merge anti-join strategy may use. Internally tuned default.                                                                                             |

```yaml
runtime:
  params:
    cayenne_footer_cache_mb: 512
    cayenne_segment_cache_mb: 1024
    cayenne_filter_propagation: enabled
```

### Adaptive tuning targets

Runtime-wide service-level targets for [adaptive tuning](#runtimeadaptive_tuning). The adaptive controller steers every Cayenne-accelerated dataset and every Cayenne catalog toward these targets in small, bounded steps, within the same bounds that static tuning derives. A target never turns adaptive tuning on: while `runtime.adaptive_tuning` is `disabled`, the targets are ignored and Cayenne logs one warning per dataset or catalog.

| Parameter Name              | Description                                                                                                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `target_replication_lag`    | Target end-to-end CDC replication lag, as a duration such as `5s`.                                                                                                           |
| `target_freshness`          | Target data freshness, which is the age of the newest queryable data, as a duration such as `30s`.                                                                           |
| `target_query_latency`      | Target p99 query latency, as a duration such as `250ms`.                                                                                                                     |
| `target_qph`                | Target query throughput in queries per hour (higher is better), as a positive number such as `5000`. Throughput is measured system-wide, so a query that spans several datasets, such as a join, is counted once. |
| `target_convergence_window` | Time budget the controller targets for converging toward the other targets, as a duration such as `1m`. Defaults to `60s`. It paces the controller rather than declaring an outcome. |

An invalid value logs a warning and is ignored. See [Goal-driven tuning](../../components/data-accelerators/cayenne/performance.md#goal-driven-tuning) for how the controller uses the targets.

```yaml
runtime:
  adaptive_tuning: enabled
  params:
    target_replication_lag: 5s
    target_query_latency: 250ms
    target_qph: 5000
```

## `runtime.adaptive_tuning`

Turns adaptive tuning on or off for the [Spice Cayenne](../../components/data-accelerators/cayenne) data accelerator across the whole runtime. It applies to every Cayenne-accelerated dataset and to Cayenne catalogs.

| Value                | Description                                                                                                                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `disabled` (default) | Cayenne derives its memory-, CPU-, and storage-sensitive settings statically from the detected environment and the inferred schema. No feedback loop runs.                                                                                                         |
| `enabled` (preview)  | In addition to the static derivation, Cayenne runs a closed-loop controller per table that adjusts those settings over time from the live workload, steering toward any [adaptive tuning targets](#adaptive-tuning-targets). Cayenne logs a startup warning that the mode is in preview. |

```yaml
runtime:
  adaptive_tuning: enabled
```

Only the exact values `enabled` and `disabled` are accepted. Any other value, including `true` or a different letter case, fails the Spicepod load with an error that includes:

```text
Invalid `runtime.adaptive_tuning` value 'true': expected `enabled` or `disabled`. See: https://spiceai.org/docs/reference/spicepod/runtime
```

Setting `adaptive_tuning` under `runtime.params` has no effect; it must be set directly under `runtime`. The adaptive controller runs on the background compaction tick, so a dataset with `cayenne_compaction_background_interval_ms: 0` uses static tuning and logs a warning. See [Self-Tuning](../../components/data-accelerators/cayenne/performance.md#self-tuning) for how both modes work.

### Migrating from `cayenne_tuning` and `cayenne_goal_*` {#migrate-from-cayenne-tuning}

Earlier releases, including v2.4.0-rc.1, configured adaptive tuning with the `cayenne_tuning` and `cayenne_goal_*` parameters on each dataset or catalog, and with `cayenne_goal_*` under `runtime.params`. These names are no longer read. Spice logs one startup warning for each old name still in use, naming its replacement, and does not apply the value. The warning covers each name with or without the `cayenne_` prefix.

| Old setting                                                     | Replacement                                                      |
| --------------------------------------------------------------- | ---------------------------------------------------------------- |
| Dataset or catalog `cayenne_tuning: adaptive`                   | `runtime.adaptive_tuning: enabled`                               |
| Dataset or catalog `cayenne_tuning: auto`                       | `runtime.adaptive_tuning: disabled`, or omit it                  |
| `cayenne_goal_replication_lag`                                  | `runtime.params.target_replication_lag`                          |
| `cayenne_goal_freshness`                                        | `runtime.params.target_freshness`                                |
| `cayenne_goal_query_latency`                                    | `runtime.params.target_query_latency`                            |
| `cayenne_goal_qph`                                              | `runtime.params.target_qph`                                      |
| Dataset `cayenne_goal_convergence_window`                       | `runtime.params.target_convergence_window`                       |

Adaptive tuning and its targets are now runtime-wide, so per-dataset overrides are no longer supported. Only `runtime.adaptive_tuning` selects the tuning mode. A Spicepod that relies on `cayenne_tuning: adaptive` runs with static tuning until `runtime.adaptive_tuning: enabled` is set. A Spicepod that already sets `runtime.adaptive_tuning: enabled` but still carries an old `cayenne_goal_*` key runs adaptive tuning, and only that old target is ignored.

## `runtime.source_rate_control`

Optional. Configures the GitHub connector's request limit, and how often instances that coordinate HTTP rate limits exchange state.

```yaml
runtime:
  source_rate_control:
    refresh_interval: 30s
    github_concurrent_connections_limit: 4
```

| Parameter Name                        | Optional | Default | Description                                                                                                                                                                                                                       |
| ------------------------------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `refresh_interval`                    | Yes      | `30s`   | How often each instance refreshes and persists per-origin rate-control state at [`runtime.state`](#runtimestate). Applies only to Spice.ai Enterprise instances that [coordinate limits](#limits-across-instances). Longer intervals reduce object-store writes but adapt more slowly to demand changes. |
| `github_concurrent_connections_limit` | Yes      | `4`     | Maximum number of concurrent GitHub HTTP requests per authentication context. Replaces the deprecated `runtime.params.github_max_concurrent_connections`.                                                                          |

HTTP/API rate limits are configured through [`runtime.params`](#runtimeparams) (cluster defaults) and per-dataset overrides. Precedence is:

```text
dataset param > runtime.params.http_* default > unset
```

When instances coordinate limits, the configured per-second and per-minute quota is converted into a token budget per `refresh_interval` window and distributed across instances using a demand-weighted leased token-bucket model.

The shared state records request outcomes one `refresh_interval` window at a time, so a `rate_control_window` shorter than `refresh_interval` is raised to it, and Spice logs an informational line saying so.

:::warning[Breaking change]

`runtime.source_rate_control` no longer accepts `state_location` or `params`, and a Spicepod that still sets either fails to load. Move them to [`runtime.state`](#runtimestate):

```yaml
# Before
runtime:
  source_rate_control:
    state_location: s3://my-bucket/spice/
    params:
      s3_region: us-east-1

# After
runtime:
  state:
    location: s3://my-bucket/spice/
    params:
      s3_region: us-east-1
```

:::

## `runtime.functions`

Controls whether [functions](../../features/functions) declared in the top-level `functions:` section (and `tools:` entries with `as_sql: true`) are registered with the SQL engine. Defaults to disabled.

```yaml
runtime:
  functions:
    enabled: true
```

| Parameter | Optional | Default | Description                                                                                       |
| --------- | -------- | ------- | ------------------------------------------------------------------------------------------------- |
| `enabled` | Yes      | `false` | When `true`, the runtime registers `functions:` entries and exposes them via SQL and `/v1/functions`. |

When disabled, the `functions:` block is parsed but not registered, `list_udfs()` returns no `user`-source rows, and `GET /v1/functions` returns an empty array.

See the [Functions Spicepod reference](./functions) for the function declaration schema.

## `runtime.shutdown_timeout`

Controls how long Spice waits for connections to be gracefully drained and for components to shut down cleanly during runtime termination. Defaults to 30 seconds.

```yaml
runtime:
  shutdown_timeout: 1m
```

## `runtime.tls`

The TLS section specifies the configuration for enabling Transport Layer Security (TLS) for all endpoints exposed by the runtime. [Learn more about enabling TLS](../../api/tls).

In addition to configuring TLS via the manifest, TLS can also be configured via `spiced` command line arguments using the `--tls-enabled true` flag along with `--tls-certificate`/`--tls-certificate-file` and `--tls-key`/`--tls-key-file`.

### Certificate Hot-Reload

Spice can hot-reload TLS certificates and client CA files for runtime endpoints. Update the certificate, key, or CA file on disk, then send `SIGHUP` to the Spice process to reload without restart. Only file-based certificates/keys/CA are hot-reloaded (not inline PEM). Existing connections are not interrupted; only new connections use the updated files. If reload fails, the previous certificate remains active and a warning is logged.

**Steps:**
1. Replace the certificate/key/CA file on disk.
2. Send `SIGHUP` to the Spice process (e.g., `kill -SIGHUP <pid>`).
3. Check logs for reload confirmation or errors.

### `runtime.tls.enabled`

Enables or disables TLS for the runtime endpoints.

```yaml
runtime:
  tls:
    ...
    enabled: true # or false
```

### `runtime.tls.certificate`

The TLS certificate to use for securing the runtime endpoints. The certificate can also come from [secrets](../../components/secret-stores).

```yaml
runtime:
  tls:
    certificate: |
      -----BEGIN CERTIFICATE-----
      ...
      -----END CERTIFICATE-----
```

```yaml
runtime:
  tls:
    ...
    certificate: ${secrets:tls_cert}
```

### `runtime.tls.certificate_file`

The path to the TLS PEM-encoded certificate file. Only one of `certificate` or `certificate_file` must be used.

```yaml
runtime:
  tls:
    certificate_file: /path/to/cert.pem
```

### `runtime.tls.key`

The TLS key to use for securing the runtime endpoints. The key can also come from [secrets](../../components/secret-stores).

```yaml
runtime:
  tls:
    key: |
      -----BEGIN PRIVATE KEY-----
      (private key contents)
      -----END PRIVATE KEY-----
```

```yaml
runtime:
  tls:
    ...
    key: ${secrets:tls_key}
```

### `runtime.tls.key_file`

The path to the TLS PEM-encoded key file. Only one of `key` or `key_file` must be used.

```yaml
runtime:
  tls:
    key_file: /path/to/key.pem
```

### `runtime.tls.client_auth_mode`

:::info Enterprise Feature
mTLS (client certificate authentication) is included in the Enterprise distribution of Spice.ai. [Learn more](https://docs.spice.ai/docs/enterprise).
:::

Controls whether the runtime requires, requests, or ignores client certificates on its public endpoints (HTTP, Flight, Metrics). Defaults to `none`.

| Mode | Behavior |
|------|----------|
| `none` *(default)* | Standard one-way TLS. No client certificate is requested. |
| `request` | The server sends a `CertificateRequest` but accepts connections without a certificate. Presented certificates are verified against the configured CA. Useful for migration or audit-only deployments. |
| `required` | A valid client certificate is required. The Flight (gRPC) listener rejects connections without a certificate at the TLS handshake. The HTTP listener admits no-cert connections so `/health` and `/v1/ready` remain accessible for Kubernetes probes, but all other HTTP endpoints return 401 without a verified client certificate. The metrics listener has no client-auth gate. |

Requires `client_auth_ca_file` or `client_auth_ca` to be set when mode is `request` or `required`.

```yaml
runtime:
  tls:
    enabled: true
    certificate_file: /path/to/cert.pem
    key_file: /path/to/key.pem
    client_auth_mode: required
    client_auth_ca_file: /path/to/client-ca.pem
```

### `runtime.tls.client_auth_ca_file`

Path to a PEM-encoded CA bundle used to verify client certificates. The file is watched for changes and reloaded atomically alongside the server certificate and key.

```yaml
runtime:
  tls:
    client_auth_ca_file: /path/to/client-ca.pem
```

### `runtime.tls.client_auth_ca`

Inline PEM (or `${ secrets:... }`) form of the client CA bundle. Mutually exclusive with `client_auth_ca_file`. Inline material is loaded once at startup and is not hot-reloaded.

```yaml
runtime:
  tls:
    client_auth_ca: |
      -----BEGIN CERTIFICATE-----
      ...
      -----END CERTIFICATE-----
```

## `runtime.task_history`

The task history section specifies runtime task history configuration. For more details, see the [Task History documentation](../task_history).

```yaml
runtime:
  task_history:
    enabled: true
    captured_output: none
    retention_period: 8h
    retention_check_interval: 15m
    min_sql_duration: 5s
```

| Parameter name             | Optional | Description                                                                                                                                                  |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `enabled`                  | Yes      | Defaults to `true`.                                                                                                                                          |
| `captured_output`          | Yes      | Specifies the level of output captured by the task history table. Defaults to `none`.                                                                        |
| `captured_context`         | Yes      | Controls how much of the `input` and `captured_output` payload is stored for AI and search tasks. Options: `truncated` (default), `redacted`, or `full`. Values are case-sensitive. |
| `captured_plan`            | Yes      | Controls SQL query plan capture. Options: `none` (default), `explain`, or `explain analyze`. Query plans are captured asynchronously after query completion. |
| `min_sql_duration`         | Yes      | Minimum query execution duration before a plan is captured. Only queries exceeding this threshold are captured. Example: `5s`.                               |
| `min_plan_duration`        | Yes      | Minimum plan execution duration before a plan is captured. This threshold applies to the execution time of the `EXPLAIN` operation itself. Example: `10s`.   |
| `retention_period`         | Yes      | Specifies how long records in the task history table are retained. Defaults to `8h` (8 hours).                                                               |
| `retention_check_interval` | Yes      | Specifies how often old records are checked for removal. Defaults to `15m` (15 minutes).                                                                     |

## `runtime.cors`

The CORS section specifies the configuration for enabling Cross-Origin Resource Sharing (CORS) for the HTTP endpoint. By default, CORS is disabled.

Default configuration:

```yaml
runtime:
  cors:
    enabled: false
```

### `runtime.cors.enabled`

Enables or disables CORS for the HTTP endpoint. Defaults to `false`.

### `runtime.cors.allowed_origins`

A list of allowed origins for CORS requests. Defaults to `["*"]`, which permits all origins.

This list is also the source for the MCP Streamable HTTP `Origin` check on `/v1/mcp`, where `["*"]` behaves differently: it is not a valid origin, so it expands to the localhost defaults (`http://localhost`, `http://127.0.0.1`, `http://[::1]` and their `https://` forms) instead of accepting every origin. An empty list expands the same way. A concrete list rejects a mismatched `Origin` with `403 Forbidden`; a request with no `Origin` header always passes. See [Allowed Origins](../../features/large-language-models/mcp#allowed-origins).

Example:

```yaml
runtime:
  cors:
    enabled: true
    allowed_origins: ['https://example.com']
```

This configuration permits requests only from the `https://example.com` origin.

## `runtime.cpu`

The CPU section states how many CPUs the runtime should behave as though it has. That single entitlement sizes every CPU-derived pool coherently — the tokio runtimes' worker threads, DataFusion's query fan-out (`runtime.query.target_partitions`) and query admission bound (`runtime.query.max_concurrent_queries`), the Cayenne encode, compaction, upload and file-scan concurrency defaults, the Cayenne SQLite metastore pool, the embedding inference pool, DuckDB's per-instance `threads`, and a cluster executor's concurrent-task advertisement.

The entitlement also sets the partition count of the DataFusion sessions the runtime builds for its own work outside the user query session: refresh and accelerator writes, Cayenne compaction and maintenance, results caching, search, and SQL user-defined functions. These sessions do not use DataFusion's default of the host's core count, so on a pod with a CPU request and no CPU limit, background work is partitioned for the entitlement rather than for the whole node.

### `runtime.cpu.cores`

```yaml
runtime:
  cpu:
    cores: 4 # `auto` (the default) detects it
```

Accepts a Kubernetes CPU quantity — a whole number of cores (`4`), a fraction (`3.5`), or millicores (`3500m`) — or one of two named values:

| Value      | Meaning                                                                                                                                                                                                                               |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auto`     | The default. Detect the entitlement. On a pod that declares a CPU request and no CPU limit, that is **twice the request** — `min(max(2 cores, request × 2), available CPUs)`. The multiple is deliberate: it exceeds the request so the pod can still burst above its scheduling floor. |
| `all`      | Every CPU this process may use, regardless of any CPU request. A CPU **limit**, if set, still applies.                                                                                                                                 |
| A quantity | Use exactly this, whatever the pod declares.                                                                                                                                                                                          |

Millicores must be integral, so `3500m` is valid and `3.5m` is not. A value of `0`, a negative value, or an unparseable one fails startup with an actionable error rather than being clamped silently — `0` is not a spelling of `all`, so a typo cannot resolve to full-machine sizing.

Three configuration surfaces set the same value. Precedence, highest first:

| Surface                | Form                       |
| ---------------------- | -------------------------- |
| Command-line flag      | `--cpu-cores 4`            |
| Environment variable   | `SPICE_CPU_CORES=4`        |
| Spicepod               | `runtime.cpu.cores: 4`     |

A surface set to `auto` still takes precedence over the surfaces below it; it simply resolves to detection.

`all` is the exception: it states that a surface imposes no ceiling of its own, so it **defers to a quantity named on a lower-precedence surface**. A platform that sets `SPICE_CPU_CORES=all` on every deployment therefore does not silence an operator who wrote `runtime.cpu.cores: 4` in their spicepod. It does not defer to `auto`, which is an instruction ("detect it") rather than the absence of one.

Applied at startup only. The thread pools it sizes cannot be resized afterwards, so changing `runtime.cpu` and reloading the spicepod logs a warning that a restart is required rather than taking effect. It is one of several start-time-only sections — see [Reload Behavior](#reload-behavior).

#### Detection

With nothing configured (`auto`), the entitlement is detected. First match wins:

1. A cgroup CPU **quota** — cgroup v2 `cpu.max`, cgroup v1 `cpu.cfs_quota_us`; Kubernetes `resources.limits.cpu`. Read along the whole cgroup path, taking the smallest quota found at any level, and capped by the CPU affinity mask.
2. The pod's **declared CPU request**, as `min(max(2 cores, request × 2), available CPUs)` — see [Sizing from a CPU request](#sizing-from-a-cpu-request).
3. The process's CPU affinity mask (`sched_getaffinity` on Linux, the logical CPU count elsewhere) — the CPUs the process may run on, which a `cpuset` or `taskset` may narrow below the host's core count.
4. One core, when nothing can be determined.

A CPU limit outranks a request: bursting past a quota does not produce CPU, it produces CFS throttling. `runtime.cpu.cores: all` suppresses rung 2 only, so it resolves exactly as it would on a pod that declared no request — a CPU limit if one is set, otherwise every available CPU.

A process that declares **no** CPU request skips rung 2 entirely and is sized for every CPU it can see. That covers every bare-metal deployment, `docker run` without CPU flags, and every benchmark.

If the host or cgroup metadata reports more CPUs than the process should use, set `runtime.cpu.cores` explicitly to the process allocation. This keeps thread pools and CPU-derived defaults sized to the deployment's intended CPU budget instead of the host total.

#### Sizing from a CPU request

A pod that sets `resources.requests.cpu` without `resources.limits.cpu` has no cgroup quota. Sizing for the whole node would build thread pools and query fan-out for a machine the pod does not own, so the entitlement is derived from the request instead — as a **bounded multiple** of it, currently 2×.

The multiple is what makes this safe to automate. A request is a scheduling floor rather than a ceiling, so sizing *at* the request would remove the bursting that is the reason the limit was omitted. The result floors at **2 cores**, so a `requests.cpu: 100m` pod still has enough parallelism to overlap a scan with something, and yields to a genuinely smaller host.

The request must be **declared** — a cgroup CPU *share* is never an input. Every cgroup carries a share whether or not a request was expressed (a plain `docker run` reports `cpu.weight: 100`), and the conversion back to a request varies by container runtime, so a share is read for reporting only and never interpreted as a number.

Declaring it is the deployment surface's job, through `SPICE_CPU_REQUEST_MILLICORES`:

```yaml
env:
  - name: SPICE_CPU_REQUEST_MILLICORES
    valueFrom:
      resourceFieldRef:
        containerName: spiceai
        resource: requests.cpu
        divisor: 1m # required: makes the value millicores — a `requests.cpu` of 4 arrives as "4000"
```

The [Spice Helm chart](https://github.com/spiceai/spiceai/tree/trunk/deploy/chart) and the Spice Kubernetes Operator both emit this automatically whenever the pod sets a CPU request, so neither needs configuring. A hand-written pod spec must include it, or the pod falls through to rung 3 and sizes for the machine — the runtime warns at startup when it detects that case.

Two details in that block are load-bearing. The `divisor: 1m` is what makes the value millicores, which is what the variable's name states; without it a `requests.cpu` of 4 arrives as `4` and reads as four millicores. And the block must be emitted **only when a CPU request is actually set**: with no request declared, `resourceFieldRef` reports the node's *allocatable* CPU, which is exactly the over-sizing this exists to prevent.

See [Resource Allocation](../performance-tuning#resource-allocation) for the Kubernetes guidance.

#### Observability

At startup the runtime logs the effective entitlement, the rung of the ladder or the setting it came from, the readings it sits between, and the defaults derived from it:

```
CPU budget: 8 cores (source: the declared CPU request (x2); host reports 64, declared CPU request 4 cores, cgroup share unset, cgroup limit unset) → 8 main worker threads, 7 per dedicated runtime pool, 8 target partitions
CPU budget derived sizing: main_runtime_worker_threads=8, dedicated_runtime_worker_threads=7, target_partitions=8, max_concurrent_queries=32, ...
```

These two lines are the primary diagnostic: between them they name what the runtime sized for, which rung produced it, and every quantity derived from it. A pod sized differently than expected is answered here rather than by inference.

The derived line reports **defaults**, not necessarily the values in force: several are overridable by their own setting (`runtime.query.target_partitions`, `runtime.query.max_concurrent_queries`, DuckDB's `threads`, a model's parallelism), and the line is logged before that configuration is resolved. Each overridable consumer separately logs the value it used and where that value came from.

The following warnings identify CPU configuration issues and remedies:

| Warning                                        | Fires when                                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| CPU request present but not passed through      | Running under Kubernetes with a cgroup share but no `SPICE_CPU_REQUEST_MILLICORES` — the deployment surface is not emitting the block above, so sizing fell through to the machine. |
| Declared request implausibly small              | A declared request below 10 millicores, which is what a `resourceFieldRef` missing its `divisor: 1m` produces for a request of one to nine cores. |
| Configured cores above the real ceiling         | The explicit CPU entitlement exceeds the cgroup or affinity limit. The configured value remains unchanged; the warning identifies the limit so the entitlement or limit can be adjusted. |
| CPU share changed after startup                 | The cgroup share moved from its value at startup — the pod was resized in place. The entitlement cannot change without a restart, so this reports the drift rather than acting on it. |

The `spiced_cpu_budget_cores`, `spiced_cpu_budget_millicores`, `spiced_cpu_limit_millicores`, and `spiced_cpu_request_millicores` gauges report the same figures — see [Observability](../../features/observability). The `source` label on `spiced_cpu_budget_cores` is the authority on which rung won, which is what makes a fleet greppable for pods that resolved somewhere unexpected. `tokio_runtime_workers` is the cross-check on the thread pools the entitlement sized.

## `runtime.query.memory_limit`

The `memory_limit` parameter sets a memory usage cap for the Spice runtime query engine. This limit applies **only** to the query engine and should be used in addition to other memory configuration options, such as `duckdb_memory_limit`. When the limit is reached, DataFusion spills intermediate data to disk using the directory configured in `runtime.query.temp_directory`.

If not specified, defaults to **90% of the memory the process may use** — its cgroup memory limit when one binds, otherwise total system memory. The limit is read from the process's own cgroup path (cgroup v2 `memory.max`, cgroup v1 `memory.limit_in_bytes`), taking the smallest limit found at any level of that path, so a container limit, a `systemd` unit's `MemoryMax=`, a capped parent slice, and a Kubernetes pod cgroup all size the default. When a cgroup limit binds, the runtime logs the figure it sized from at startup. When Cayenne acceleration is active, the default is reduced to **70%** to reserve headroom for Cayenne's dedicated compaction memory pool and its in-memory CDC tier. When DuckDB accelerators are configured, that default is reduced further so the query pool and the DuckDB instance ceilings together fit within available memory — see [Coordinated memory budget](../../components/data-accelerators/duckdb#coordinated-memory-budget). An explicitly configured `memory_limit` is always honored verbatim and is never reduced.

```yaml
runtime:
  query:
    memory_limit: 4GiB
```

Specify the value as a size, for example `4GiB` or `1024MiB`.

For detailed memory information, see [Memory](../memory).

## `runtime.query.max_concurrent_queries`

The `max_concurrent_queries` parameter bounds how many query-executing plans may run concurrently. Excess queries wait (admission control) rather than oversubscribing the shared query runtime and memory pool, which can otherwise cause queries to starve each other under load — for example, analytical queries running alongside CDC ingestion and compaction.

```yaml
runtime:
  query:
    max_concurrent_queries: 8
```

Behavior:

- Applies to ordinary queries, DDL/DML, and `EXECUTE`. Lightweight session-state statements (`PREPARE`, `DEALLOCATE`, `SET`) are not gated.
- A permit is held for the plan's full execution and result-streaming lifetime. A results-cache hit is never gated.
- If not set, the bound is sized from the CPU entitlement at **four concurrent plans per core** — `16` on a 4-core budget. Above one per core so a query blocked on I/O does not idle its core, and low enough that the query memory pool is shared between a countable number of plans. See [`runtime.cpu`](#runtimecpu).
- `max_concurrent_queries: 0` opts out and leaves concurrency **unbounded**. Every other configured value is a limit, applied verbatim.

:::warning Behavior change

Prior to this release the default was **unbounded**, and an explicit `0` was clamped to a minimum of `1` (a single concurrent query). Both have changed: an unset value is now bounded by the CPU entitlement, and `0` now means unbounded rather than maximally throttled. A deployment that set `0` to disable admission control gets the behavior it intended; one that set `0` expecting a throttle gets the opposite.

:::

## `runtime.query.timeout`

The `timeout` parameter sets a maximum wall-clock duration a query may run before it is automatically cancelled, expressed as a human-readable duration (for example `30s` or `5m`). The clock covers the query's full lifetime: planning, admission-control waits (`max_concurrent_queries`), execution, and streaming results to the client.

```yaml
runtime:
  query:
    timeout: 30s
```

Behavior:

- Applies to queries issued through the runtime's query APIs (HTTP, Flight, and Flight SQL). Internal runtime queries — acceleration refreshes and health checks — are exempt.
- Enforcement is cooperative (best-effort): the query is cancelled at its next cancellation checkpoint, so actual runtime can slightly exceed the configured value.
- On expiry, the query fails with a timeout error. If the timeout is observed before the response starts, the client receives an HTTP `504` / gRPC `DEADLINE_EXCEEDED`. If results are already streaming, the status can no longer change, so the in-progress stream is terminated with the error — data streamed before expiry will have been delivered, but the stream never ends silently as if complete. On Flight SQL that is a long `DoGet`: the stream ends with an error rather than a clean completion. Short-query tuning (prepared statements, partition fan-out) is separate — see [Arrow Flight SQL](../../api/arrow-flight-sql#short-queries).
- If not set, queries run with **no timeout** (the default behavior). The value must be a positive duration greater than `0`.

## `runtime.query.spill_compression`

The `spill_compression` parameter configures compression for spill files generated during large query execution in the Spice runtime.

**Supported values:**

- `zstd` (default): Enables high compression ratios for spill files, reducing disk usage but with moderate (de)compression speed.
- `lz4_frame`: Provides faster (de)compression, resulting in larger spill files and potentially higher disk usage.
- `uncompressed`: Disables compression. Spill files will be the largest, but with no (de)compression overhead.

```yaml
runtime:
  query:
    spill_compression: lz4_frame
```

This setting controls the trade-off between disk space usage and query performance for large-scale analytics workloads.

## `runtime.query.temp_directory`

<!-- Backwards compatibility anchor for older versioned docs -->
<a id="runtimetemp_directory"></a>

The path to a temporary directory that Spice uses for query and acceleration operations that spill to disk. It is used by DataFusion query execution (spill for sorts, aggregations, and sort-merge joins that exceed `runtime.query.memory_limit`), by Spice Cayenne's dedicated compaction runtime, by every DuckDB accelerator instance (passed through as DuckDB's own `temp_directory`), and by cluster-mode executors as their local working directory. When unset, DataFusion spills to the operating system's temporary directory (`$TMPDIR`, otherwise `/tmp`) and DuckDB to a `.tmp` directory beside its database file; when Cayenne acceleration is active and the setting is unset, the runtime logs a reminder at startup.

```yaml
runtime:
  query:
    temp_directory: /nvme/spice/tmp
```

Set it to a directory on **local NVMe or SSD** with ample free space — not the root volume, a network file system, or a RAM-backed mount, whose files count against the process's memory. Each spilled batch is a synchronous write the query waits on, so the directory's per-I/O latency lands directly on query time. DataFusion caps total spill at 100 GB per runtime environment; the cap is not configurable — there is no `runtime.query` setting for it, and `SET datafusion.runtime.max_temp_directory_size` is rejected because the query APIs do not accept `SET` statements. For more details, see [Spill-to-Disk and the Temporary Directory](../performance-tuning#spill-to-disk-and-the-temporary-directory) and [Storage](../performance-tuning#storage) in the Performance Tuning guide, the [Managing Memory Usage documentation](../memory), and the [DuckDB Data Accelerator documentation](../../components/data-accelerators/duckdb#temporary-directory).

## `runtime.query.cte_materialization`

Controls whether the [Spice Cayenne](../../components/data-accelerators/cayenne/index.md) query path computes a multi-reference `WITH` clause once and shares the result, instead of letting DataFusion inline the body at every reference.

DataFusion inlines `WITH` bodies at bind time, so a CTE referenced twice is planned and executed twice. `auto` rewrites the qualifying cases into a producer/consumer pair — the body is computed once into a buffer that every reference reads.

```yaml
runtime:
  query:
    cte_materialization: auto # disabled (default) | auto
```

**Supported values:**

- `disabled` (default): every CTE is inlined at each reference — DataFusion's own behavior.
- `auto`: a CTE is materialized when it qualifies (below), and inlined otherwise.

Behavior:

- A CTE is only a candidate when it is referenced **more than once**, is **not recursive**, and its body **scans a Cayenne-accelerated table**. The setting is a no-op on a query that does not scan Cayenne, so a pod with no Cayenne acceleration behaves identically under either value.
- Among the candidates, the keep-or-inline decision follows DuckDB's `CTEInlining` rules, in this order:
  - a body containing a **volatile** function is materialized (so the function is evaluated once);
  - a body ending in **aggregate**, **distinct**, or **window** (peeling single-child operators) is materialized;
  - a **cheap** body — an empty relation, a `VALUES` list, or a scan of an already-materialized CTE — is inlined even with several references;
  - otherwise, a body with **more than two base-table scans** where `scans × references > 10` is materialized;
  - a consumer carrying a `LIMIT` (or a sort with a fetch) inlines a CTE that did not match a rule above, so the limit can still abort the work early;
  - anything else that is referenced more than once is materialized.
- The shared buffer is **charged to the query memory pool** ([`runtime.query.memory_limit`](#runtimequerymemory_limit)), so a materialized CTE spends the same budget the rest of the query does.
- Simple pass-through CTEs stay inlined on purpose: inlining is what lets projection and filter pushdown prune each copy separately.
- When `auto` is in effect the runtime logs `Applied runtime.query.cte_materialization=auto` at startup, and a materialized CTE appears in `EXPLAIN` output as a `MaterializedCte` node with a `CteScan` at each reference.

Any other value is rejected when the Spicepod is loaded.

## `runtime.query.log_errors`

Chooses which failed queries are logged. The records go to stdout and, when [`signals`](#runtimetelemetryotel_exporter) includes `logs`, to the OpenTelemetry endpoint. Failed queries can be frequent, so by default nothing new is logged.

```yaml
runtime:
  query:
    log_errors: execution # none (default) | execution | all
```

**Supported values:**

- `none` (default): a query refused because the runtime ran out of memory is logged at `WARN`. Every other failure is logged at `DEBUG`, which shows only when debug logging is on (`-v`, [`runtime.output_level`](#runtimeoutput_level), or `SPICED_LOG`).
- `execution`: also logs queries that failed while running, such as a source or object-store error, a timeout, or an internal error, at `WARN`.
- `all`: also logs queries rejected before running, such as a SQL syntax error or an unknown table or column, at `INFO`.

The record names the error, with the error code and the datasets the query read as fields. A record logged during a query carries the query's trace id:

```text
WARN query{trace_id=4bf92f3577b34da6a3ce929d0e0e4736}: runtime::datafusion::query::tracker: Query failed: Arrow error: Divide by zero error error_code=QueryExecutionError datasets="trips"
```

The SQL text is not logged, because it can contain data. Look it up in [`runtime.task_history`](../task_history) by the trace id.

Any other value is rejected when the Spicepod is loaded.

## `runtime.output_level`

Controls verbosity in addition to the existing [CLI and environment variable support.](https://spiceai.org/docs/cli/tracing).
Supported values are `info`, `verbose`, and `very_verbose`. The value is applied in the following priority: CLI, environment variables, then YAML configuration.

```yaml
runtime:
  output_level: info # or verbose, very_verbose
```

## `runtime.telemetry`

The telemetry section configures runtime telemetry collection and export. [Learn more](../../features/observability).

```yaml
runtime:
  telemetry:
    enabled: true
    otel_exporter:
      enabled: true
      endpoint: 'localhost:4317'
      push_interval: '5m'
```

### `runtime.telemetry.enabled`

Enables or disables runtime telemetry collection. Defaults to `true`.

### `runtime.telemetry.metric_prefix` {#runtimetelemetrymetric_prefix}

Optional string prepended to every exported metric name. Useful for namespacing Spice metrics in shared backends (e.g. Datadog, Grafana Cloud, New Relic) so they do not collide with metrics from other services. Defaults to no prefix.

The prefix applies to **all** metric readers — the Prometheus scrape endpoint (`--metrics`), the cluster on-demand OTLP reader, and the `otel_exporter` push exporter — because OpenTelemetry views are configured at the meter-provider level rather than per reader.

```yaml
runtime:
  telemetry:
    metric_prefix: 'spiceai.'
```

With this configuration, the runtime metric `query_duration_ms` is exported as `spiceai.query_duration_ms`.

The prefix is validated at spicepod load against the [OpenTelemetry instrument name syntax](https://opentelemetry.io/docs/specs/otel/metrics/api/#instrument-name-syntax) so `{prefix}{instrument}` stays a valid OTLP/Prometheus metric name. A non-empty prefix must:

- start with an ASCII letter (`A`–`Z` or `a`–`z`);
- contain only ASCII letters, digits, `_`, `.`, `-`, or `/`; and
- be at most 128 characters (leaving ≥127 characters of headroom under the OpenTelemetry 255-character instrument-name limit for the base metric name).

An invalid prefix fails fast with an actionable error rather than producing malformed metric names. An empty or unset `metric_prefix` applies no prefix.

### `runtime.telemetry.properties` {#runtimetelemetryproperties}

Map of custom key/value attributes attached to telemetry metrics emitted by `spiced`. Applied as OpenTelemetry resource attributes on the runtime's `MeterProvider`, so they appear as dimensions/tags on every metric exported via the Prometheus scrape endpoint, the cluster on-demand OTLP reader, and the `otel_exporter` push exporter. Log records that `otel_exporter` sends carry the same resource attributes. Defaults to empty.

```yaml
runtime:
  telemetry:
    properties:
      environment: prod
      region: us-west-2
      team: data-platform
```

The standard OpenTelemetry environment variables (`OTEL_SERVICE_NAME`, `OTEL_RESOURCE_ATTRIBUTES`) are still honored and act as defaults; explicit `properties` entries take precedence on key conflicts.

For backends that map OTLP resource attributes to tags through additional configuration (e.g. Datadog), see the [Datadog OTLP guide](/docs/next/monitoring/datadog#opentelemetry-otlp-export).

### `runtime.telemetry.otel_exporter`

Configures an [OpenTelemetry](https://opentelemetry.io/) exporter that pushes metrics, logs, or both to an OpenTelemetry collector or any OTLP endpoint. The exporter automatically infers the protocol (gRPC or HTTP) based on the endpoint configuration.

| Parameter name  | Optional | Default | Description                                                                                                                                                                                                                                                   |
| --------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`       | Yes      | `true`  | Whether the OpenTelemetry exporter is enabled.                                                                                                                                                                                                                |
| `endpoint`      | No       | -       | The OpenTelemetry collector endpoint. Protocol is inferred from the format (see examples below).                                                                                                                                                              |
| `push_interval` | Yes      | `60s`   | How frequently metrics are pushed to the collector. Specify as a [duration](../duration).                                                                                                                                                                     |
| `temporality`   | Yes      | `delta` | Aggregation temporality of exported metrics: `delta`, `cumulative`, or `low_memory` (cumulative counters and delta histograms). Datadog requires `delta`. Use `cumulative` for a collector that forwards to Prometheus. Applies to the OTLP exporter only; the Prometheus `/metrics` endpoint always reports cumulative values. |
| `metrics`       | Yes      | `[]`    | List of metric names to export. When empty (default), all metrics are exported.                                                                                                                                                                               |
| `signals`       | Yes      | `[metrics]` | What the exporter sends: `metrics`, `logs`, or both. See [Exporting logs](#exporting-logs). `push_interval` and `metrics` apply to metrics only. |
| `headers`       | Yes      | `{}`    | Map of headers to send with each export request. For HTTP these are sent as HTTP headers; for gRPC they are sent as metadata entries (keys must be lowercase ASCII). Values support the `${secrets:...}` [replacement syntax](../../components/secret-stores#using-secrets) for loading credentials from a [secret store](../../components/secret-stores). |

**Protocol inference:**

- **gRPC (default):** Use a bare host:port endpoint without a scheme (e.g., `localhost:4317`). gRPC uses port 4317 by default.
- **HTTP:** Include the `http://` or `https://` scheme (e.g., `http://localhost:4318/v1/metrics` or `http://localhost:4318`). HTTP uses port 4318 by default. Metrics are sent to `/v1/metrics` and logs to `/v1/logs` under the endpoint's base URL. An endpoint that ends in `/v1/metrics` is the base URL without that suffix, so `http://localhost:4318/v1/metrics` sends logs to `http://localhost:4318/v1/logs`.

**Examples:**

gRPC configuration:

```yaml
runtime:
  telemetry:
    enabled: true
    otel_exporter:
      # gRPC - no scheme or path needed
      endpoint: 'localhost:4317'
      push_interval: '30s'
```

HTTP configuration:

```yaml
runtime:
  telemetry:
    enabled: true
    otel_exporter:
      enabled: true
      # HTTP - include scheme and /v1/metrics path
      endpoint: 'http://localhost:4318/v1/metrics'
      push_interval: '30s'
```

With metric filtering (export only specific metrics):

```yaml
runtime:
  telemetry:
    enabled: true
    otel_exporter:
      endpoint: 'localhost:4317'
      push_interval: '30s'
      metrics:
        - query_duration_ms
        - query_executions
        - dataset_load_state
```

:::caution Filtering happens after `metric_prefix` is applied
The whitelist is matched against the **final** metric name, after [`runtime.telemetry.metric_prefix`](#runtimetelemetrymetric_prefix) has been prepended. If you set `metric_prefix: 'spiceai.'`, the entries under `metrics:` must include the prefix (e.g. `spiceai.query_duration_ms`), otherwise nothing will match and no metrics will be exported.
:::

**Authenticated exporters:**

For collectors that require authentication, set the `headers` map. Load credentials from a [secret store](../../components/secret-stores) via `${secrets:...}` rather than committing them to source.

Datadog (OTLP/HTTP) — replace `us3` with your Datadog site:

```yaml
runtime:
  telemetry:
    otel_exporter:
      endpoint: 'https://otlp.us3.datadoghq.com/v1/metrics'
      headers:
        DD-API-KEY: ${secrets:dd_api_key}
```

Grafana Cloud (OTLP/HTTP) — use the base64 `instanceID:accessPolicyToken` from the Grafana Cloud OpenTelemetry connection page:

```yaml
runtime:
  telemetry:
    otel_exporter:
      endpoint: 'https://otlp-gateway-us-central2.grafana.net/otlp/v1/metrics'
      headers:
        Authorization: 'Basic ${secrets:grafana_cloud_auth}'
```

gRPC collector with auth metadata (keys must be lowercase ASCII):

```yaml
runtime:
  telemetry:
    otel_exporter:
      endpoint: 'otel-collector.internal:4317'
      headers:
        api-key: ${secrets:collector_api_key}
```

#### Exporting logs

Add `logs` to `signals` to send the runtime's log to the same endpoint as structured OTLP log records. The collector needs only its `otlp` receiver; there is nothing to parse.

```yaml
runtime:
  telemetry:
    otel_exporter:
      endpoint: 'otel-collector:4317'
      signals: [metrics, logs]
```

The records are the lines `spiced` prints to stdout, at the same level (`runtime.output_level`, `SPICED_LOG`, or `-v`), from the moment export starts once the Spicepod is loaded. The lines printed before that, such as the startup banner and the CPU budget, are on stdout only. stdout does not change.

| OTLP field                         | Value                                                                                                                                                                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `severity_number`, `severity_text` | `TRACE` 1, `DEBUG` 5, `INFO` 9, `WARN` 13, `ERROR` 17                                                                                                                                                                                      |
| `body`                             | The message, newlines included                                                                                                                                                                                                             |
| `attributes`                       | The record's fields, with their types kept (int, double, bool, string)                                                                                                                                                                     |
| Instrumentation scope name         | The module that logged the record, such as `runtime::init::dataset`                                                                                                                                                                       |
| `trace_id`                         | For a record logged during a query, the query's trace id: the `spice-trace-id` the response returns and the `trace_id` in [`runtime.task_history`](../task_history), including an id the client pinned. For another task that task history records, that task's trace id. Otherwise empty. |
| `span_id`                          | The `span_id` of the task's `runtime.task_history` row, when task history is enabled. Otherwise empty.                                                                                                                                    |
| Resource                           | The same attributes as exported metrics: [`runtime.telemetry.properties`](#runtimetelemetryproperties), `OTEL_SERVICE_NAME`, and `OTEL_RESOURCE_ATTRIBUTES`                                                                              |

What the export itself logs, on the threads that send records (its gRPC or HTTP client, connections, TLS handshakes, and failure reports), is printed to stdout but not exported, so that the export cannot feed back into itself. `runtime.task_history` bookkeeping is neither printed nor exported.

Delivery:

- Records are batched and sent every second from a bounded queue of 2048 records, on a runtime of their own, so logging never blocks a query. When the queue is full, new records are dropped. The standard `OTEL_BLRP_*` environment variables change these limits.
- On shutdown, `spiced` sends the queued records last, after the error that ended the process, if any, and `Goodbye!`. It waits up to 5 seconds for them. After a crash or `SIGKILL`, queued records are only on stdout.
- In cluster mode, the scheduler and each executor send their own logs with the scheduler's `otel_exporter` settings. An executor starts sending once it joins the cluster.
- The records leave the host with whatever the log contains. Use an `https://` endpoint for a collector on another host: gRPC endpoints are sent without TLS.

When export starts, `spiced` logs:

```text
INFO spiced: OTEL logs exporter enabled endpoint=otel-collector:4317 protocol="grpc"
```

If the endpoint stops accepting records, `spiced` reports it once on stdout, and again when it recovers:

```text
WARN runtime::otel_push_exporter: Failed to export logs to the OpenTelemetry endpoint 'otel-collector:4317', so log records are dropped until it recovers. Check that the endpoint is reachable and accepts OTLP logs. Cause: <error>. See: https://spiceai.org/docs/reference/spicepod/runtime#runtimetelemetryotel_exporter
INFO runtime::otel_push_exporter: Log export to the OpenTelemetry endpoint 'otel-collector:4317' recovered; 42 log records were not delivered while it was failing.
```

If the cluster also collects container stdout, for example with a `file_log` receiver, exclude Spice pods from that collection when `logs` is exported, or each record arrives twice.

To log failed queries, see [`runtime.query.log_errors`](#runtimequerylog_errors).

## `runtime.metrics`

Specifies metrics that are disabled by default.

Following metrics are disabled by default:

- `dataset_acceleration_max_timestamp_before_refresh_ms`
- `dataset_acceleration_max_timestamp_after_refresh_ms`
- `dataset_acceleration_refresh_lag_ms`
- `dataset_acceleration_ingestion_lag_ms`

For details about these metrics, see [Observability](../../features/observability).

```yaml
runtime:
  metrics:
    - name: dataset_acceleration_max_timestamp_before_refresh_ms
    - name: dataset_acceleration_max_timestamp_after_refresh_ms
      enabled: true
    - name: dataset_acceleration_refresh_lag_ms
      enabled: false
    - name: dataset_acceleration_ingestion_lag_ms
```

## `runtime.flight`

Configures Arrow Flight protocol settings for the runtime.

```yaml
runtime:
  flight:
    max_message_size: 16MiB
    do_put_rate_limit_enabled: true
    batch_size:
      mode: adaptive
      max: 131072
    ipc_compression: zstd
```

| Parameter name              | Optional | Default | Description                                                          |
| --------------------------- | -------- | ------- | -------------------------------------------------------------------- |
| `max_message_size`          | Yes      | -       | Maximum size of a single Arrow Flight message.                       |
| `do_put_rate_limit_enabled` | Yes      | `true`  | Whether rate limiting is applied to `DoPut` Arrow Flight operations. |
| `batch_size`                | Yes      | `mode: adaptive`, `max: 131072` | Record batch size of Arrow Flight and Flight SQL query responses. With `mode: adaptive`, Spice raises the batch size of a response whose planner estimate is large, up to `max` rows. With `mode: default`, every response uses the query engine's configured batch size. |
| `ipc_compression`           | Yes      | `none`  | Compression of the Arrow IPC record batches in Arrow Flight and Flight SQL responses: `none`, `lz4_frame`, or `zstd`. The client must support the codec to read the response. |

The `DoPut` rate limit admits 100 writes per minute, shared by all clients of the runtime. Arrow Flight data writes, Flight SQL bulk ingestion (`CommandStatementIngest`), and Flight SQL statement updates (`CommandStatementUpdate`, sent by a Flight SQL client's execute-update call) count against it. Prepared statement calls, including parameter binding, do not. A write over the limit fails with the gRPC status `RESOURCE_EXHAUSTED`.

## `runtime.tracing`

Exports task history spans to a [Zipkin](https://zipkin.io/) collector. See [Zipkin](../../monitoring/zipkin) for an example.

```yaml
runtime:
  tracing:
    zipkin_enabled: true
    zipkin_endpoint: http://localhost:9411/api/v2/spans
```

| Parameter name    | Optional | Default | Description |
| ----------------- | -------- | ------- | ----------- |
| `zipkin_enabled`  | No       | -       | Whether spans are exported to Zipkin. |
| `zipkin_endpoint` | Yes      | -       | The Zipkin spans endpoint. Required when `zipkin_enabled` is `true`; without it, tracing setup fails with `zipkin_endpoint is required when zipkin_enabled is true`. When the endpoint is not reachable at startup, Spice prints `Zipkin endpoint '<endpoint>' is not reachable. Skipping Zipkin exporter initialization.` and runs without the Zipkin exporter. |

## `runtime.mcp`

Configures settings for the Spice MCP server endpoint (`/v1/mcp`).

The endpoint is dual-era: it serves the [`2026-07-28`](https://modelcontextprotocol.io/specification/2026-07-28/) revision statelessly and still answers the legacy `initialize` handshake with an `Mcp-Session-Id` session. See [Protocol Versions](../../features/large-language-models/mcp#protocol-versions).

### `runtime.mcp.allowed_hosts`

Controls which `Host` header values are accepted on the `/v1/mcp` endpoint. This prevents [DNS rebinding](https://en.wikipedia.org/wiki/DNS_rebinding) attacks against the MCP server.

| Behavior | Configuration |
| --- | --- |
| **Default** (not set, or an empty list `[]`) | Only `localhost`, `127.0.0.1`, and `::1` are permitted. Requests with any other `Host` value receive `403 Forbidden`. |
| **Explicit list** | Replaces the defaults entirely. Only the listed hosts are accepted. |
| **Wildcard** (`["*"]`) | Disables host checking — all `Host` header values are accepted. |

```yaml
runtime:
  mcp:
    allowed_hosts:
      - localhost
      - my-host.internal:8090
```

To disable host checking entirely:

```yaml
runtime:
  mcp:
    allowed_hosts:
      - "*"
```

Each entry can be a bare hostname (`example.com`), a host-port pair (`example.com:8090`), or a full origin URL (`https://example.com`).

Only `["*"]` disables the check. An empty list (`allowed_hosts: []`) uses the defaults. In `v2.4.0-rc.1`, an empty list disabled host checking; set `allowed_hosts: ["*"]` to keep that behavior.

## `runtime.ready_state`

Controls when the runtime readiness probe (`/v1/ready`) reports the runtime as ready. This is particularly useful for Kubernetes readiness probes.

```yaml
runtime:
  ready_state: on_load
```

| Value               | Description                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| `on_load` (default) | The runtime reports ready after all components (datasets, models, etc.) have loaded successfully.     |
| `on_registration`   | The runtime reports ready as soon as all components have been registered, before they finish loading. |

## `runtime.scheduler`

Configures the cluster scheduler when running Spice in [cluster mode](../../deployment/architectures/cluster). This section is relevant only when using `--role scheduler`.

```yaml
runtime:
  state:
    location: s3://my-bucket/spice-state/
    params:
      s3_region: us-east-1
  scheduler:
    partition_assignment_interval: 30s
    max_partition_assignments_per_interval: 100
    max_partitions_per_executor: 1000
    partition_discovery_timeout: 60s
```

| Parameter name                                     | Optional | Default | Description                                                            |
| -------------------------------------------------- | -------- | ------- | ---------------------------------------------------------------------- |
| `state_location`                                   | Yes      | -       | Deprecated. Root URI for shared cluster state storage (e.g. `s3://bucket/path/`). Set [`runtime.state.location`](#runtimestate) instead. |
| `params`                                           | Yes      | -       | Deprecated. Object store parameters (e.g. `s3_region`). See [State location parameters](#state-location-parameters). Set `runtime.state.params` instead. When `state_location` is omitted, defaults to `runtime.state.params`. |
| `partition_assignment_interval`                    | Yes      | `30s`   | How often the scheduler runs partition assignment cycles.              |
| `max_partition_assignments_per_interval`           | Yes      | `100`   | Maximum number of partition assignments per interval.                  |
| `max_partitions_per_executor`                      | Yes      | `1000`  | Maximum number of partitions assigned to a single executor.            |
| `partition_discovery_timeout`                      | Yes      | `60s`   | How long the scheduler waits for executor discovery before timing out. |

The scheduler keeps its shared cluster state in the `cluster/` folder of [`runtime.state.location`](#runtimestate) and reads it with `runtime.state.params`. `runtime.scheduler.state_location` and `runtime.scheduler.params` are deprecated and will be removed in a future release. They still take precedence over `runtime.state`, and a scheduler or standalone instance that sets either one logs a startup warning that shows how to move to `runtime.state`:

| Current setting | What the warning says |
| --------------- | --------------------- |
| `state_location` is the `cluster/` folder of `runtime.state.location` | Remove `state_location`: the state is already there. |
| `state_location` ends in `cluster/` and `runtime.state` is not set | Remove `state_location` and set `runtime.state.location` to its parent, for example `s3://my-bucket/spice/` for `s3://my-bucket/spice/cluster/`, which keeps the state where it is. |
| Any other `state_location`, and every `abfs://` or `abfss://` `state_location` | No `runtime.state` location holds the current state. Removing `state_location` (and setting `runtime.state.location`, when it is not set) makes the scheduler start empty in the new folder, so partition assignments are rebuilt and async query jobs are lost. An `abfs://` or `abfss://` `state_location` keeps its state at the container root, which is never a `runtime.state` folder. |

The warning also asks to move the keys of `runtime.scheduler.params` into `runtime.state.params`. When `runtime.state.params` are already set, it asks to remove `runtime.scheduler.params` instead, because `runtime.state.params` serve every feature that keeps state under `runtime.state`, and to check that they give the scheduler access to its state. The warning names parameter keys, never their values.

## `runtime.state`

Optional. Sets one shared object store for runtime state, so each feature that persists state does not need its own location. Supported URI schemes are `file://`, `s3://`, `gs://` (or its alias `gcs://`), `abfs://`, and `abfss://`.

```yaml
runtime:
  state:
    location: s3://my-bucket/spice-state
    params:
      s3_region: us-east-1
      s3_auth: iam_role
```

| Parameter name | Optional | Default | Description |
| -------------- | -------- | ------- | ----------- |
| `location`     | No       | -       | Root URI for runtime state storage (e.g. `s3://bucket/path/`). |
| `params`       | Yes      | -       | Object store parameters (e.g. `s3_region`, `s3_auth`). Supports `${ secrets:NAME }` references. |

The following features store their state under `runtime.state` when their own section does not set a location:

| Feature | Uses `runtime.state` when |
| ------- | ------------------------- |
| [SQL results cache warmup](../../features/caching#warming-the-cache-after-a-restart) | `runtime.caching.sql_results.warmup` is `on_first_refresh`. Without `runtime.state`, recorded query plans are written to `.spice/data/results_cache_warmup.json`. |
| [Cluster scheduler](#runtimescheduler) | The deprecated `runtime.scheduler.state_location` is not set. The scheduler's other settings still apply. |
| [HTTP rate control](#limits-across-instances) | Always, in a Spice.ai Enterprise build: instances that share the location coordinate per-second and per-minute limits for every origin that sets one. Open-source builds keep rate-control state in memory. Rate control has no location of its own. |
| [Acceleration snapshots](../../features/data-acceleration/snapshots#store-snapshots-under-runtimestate) | A dataset enables snapshots and sets no `acceleration.snapshots_location`, and the deprecated top-level `snapshots.location` is not set. Snapshots are available in Spice.ai Enterprise. |

A location set in a feature's own section takes precedence over `runtime.state`. Changing `runtime.state` requires a restart.

### Runtime state layout

Each feature writes under its own folder below the `runtime.state` location's path: the cluster scheduler under `cluster/`, HTTP rate control under `rate-control/`, SQL results cache warmup under `results-cache/`, and acceleration snapshots under `snapshots/`. The [startup check](#startup-check-of-the-state-location) keeps its files under `_spice/`. For `location: s3://my-bucket/spice-state`, the scheduler writes `spice-state/cluster/cluster.json` and warmup writes `spice-state/results-cache/results_cache_warmup.json`. The location's path is kept for every scheme, including `abfs://` and `abfss://`.

A location set in a feature's own section is used as given, without a feature folder. With `runtime.scheduler.state_location`, the scheduler writes `cluster.json` and its other state at the root of that location. For an `abfs://` or `abfss://` `state_location`, that root is the container root, and the URL's path is ignored.

:::warning[Migrating from v2.4.0-rc.1]

In v2.4.0-rc.1, every feature that used `runtime.state` wrote at the root of the location, and `abfs://` and `abfss://` locations wrote at the container root. Later versions do not read state at those paths. To keep it, stop every rc.1 instance that shares the location, move each feature's objects from the old path into that feature's folder, and upgrade all of those instances before restarting them, so that no instance keeps writing at the old path or reads a different layout than the others:

| Feature | Objects at the old path | Move into |
| ------- | ----------------------- | --------- |
| Cluster scheduler | `cluster.json`, `heartbeats/`, `jobs/`, and `scheduler/` | `cluster/` |
| HTTP rate control | One folder per spicepod, with a name derived from the spicepod's `name` (for example, `my_app/` for `name: my app`). To find it, list the old path for objects named `<origin>-<16 hex digits>.json`. | `rate-control/` |
| SQL results cache warmup | `results_cache_warmup.json` | `results-cache/` |

For example, `spice-state/cluster.json` moves to `spice-state/cluster/cluster.json`, and `spice-state/my_app/` moves to `spice-state/rate-control/my_app/`.

Move the rate-control objects first, one spicepod folder at a time, and move only the objects named `<origin>-<16 hex digits>.json` in that folder. A spicepod name can match another folder in the table, such as `heartbeats`, `jobs`, `scheduler`, `cluster`, `rate-control`, or `results-cache`, and moving whole folders would then mix rate-control objects with scheduler objects. Move the scheduler and warmup objects after that.

To keep the scheduler's previous layout instead of moving its objects, set the deprecated `runtime.scheduler.state_location` to the old location. A scheduler with its own `state_location` does not use `runtime.state.params`, so also copy any parameters the location needs, such as credentials or an endpoint, into `runtime.scheduler.params`. Rate control and warmup have no location of their own, so their objects must be moved. Otherwise, the scheduler starts with fresh cluster state, rate control starts with no shared usage, and warmup records new query shapes.

:::

### Startup check of the state location

Each instance with `runtime.state` checks the location when it starts. The check reads `_spice/format.json`, which records the version of the state format, and probes whether the store enforces conditional writes by creating, updating, and deleting a `.spice-conditional-write-probe-<id>` object under `_spice/`. When `format.json` does not exist yet, the instance creates it with `{"format-version": 1}`. The instance therefore needs read and write access to the location, even when no enabled feature keeps state there.

Until the check passes, the instance does not report ready, and the features that keep state under `runtime.state` wait to write it: HTTP rate control, SQL results cache warmup, and the cluster scheduler when `runtime.scheduler.state_location` is not set. A scheduler with its own `state_location` does not wait for the check. Reads do not wait. With [`ready_state: on_registration`](#runtimeready_state), readiness does not wait for the check. Acceleration snapshots are not held back by the check: they keep their own [probe before the first publish](../../features/data-acceleration/snapshots#conditional-writes-on-the-snapshot-location).

When the check cannot finish, for example because the bucket does not exist, the credentials cannot write, or `runtime.state.params` are rejected, Spice logs a warning with the cause and retries with backoff and no retry limit. Fixing the bucket or its permissions lets the instance become ready without a restart. When the check passes, Spice logs the location and the features that keep state in it.

Spice stops at startup and exits with an error in these cases:

- The store does not support conditional writes, or accepts a write whose condition does not hold. Instances that share such a store could overwrite each other's state. Amazon S3, Azure Blob Storage and ADLS Gen2, Google Cloud Storage, and a local `file://` directory enforce conditional writes. An S3-compatible store must honor `If-None-Match` and `If-Match` on `PUT`.
- `_spice/format.json` records a newer format version than this version of Spice supports, because a newer version of Spice wrote to the location. Upgrade Spice.
- `_spice/format.json` is not valid.

v2.4.0-rc.1 did not check the location. After an upgrade from rc.1, an instance whose `runtime.state` credentials are read-only does not become ready until they can write, and an instance whose store does not enforce conditional writes stops at startup.

### Metrics for the state location

Spice reports each feature's requests to its state location on the [metrics endpoint](../../features/observability/index.md#available-metrics). The metrics cover the `runtime.state` location and a location set in a feature's own section, such as a dataset's `acceleration.snapshots_location`.

| Metric | Type | Description |
| ------ | ---- | ----------- |
| `state_store_request_duration_ms` | Histogram | Time in milliseconds of each request, labeled by `feature` and `operation`. |
| `state_store_conflicts_total` | Counter | Conditional writes the store refused because another writer created or changed the object first, labeled by `feature`. |
| `state_store_cleanup_deleted_total` | Counter | Objects that cleanup deleted, labeled by `feature`. |

`feature` is `scheduler`, `rate_control`, `results_cache_warmup`, or `snapshots`. `operation` is `read`, `conditional_write`, `write`, `list`, or `delete`. A `write` is an unconditional upload, including a multipart upload, a copy, or a rename; snapshot files are uploaded this way. A read is timed until the response starts, a list or delete until it ends, and a multipart upload until it completes or is aborted. The two counters are published at zero for every `feature` when the runtime starts, so a missing series points to a scrape problem rather than an idle feature. The [startup check](#startup-check-of-the-state-location) is not measured.

A rising `state_store_conflicts_total` means instances that share the location are contending for the same objects.

### Instance identity

Every feature that coordinates with other instances through shared state names the instance with one identity. Spice reads the identity once per process from the first of these that is set and not empty: the `SPICE_INSTANCE_ID` environment variable, the `HOSTNAME` environment variable, the `COMPUTERNAME` environment variable, and otherwise the operating system's host name. The identity stays the same across restarts, so a restarted instance resumes the state it held.

| Feature | Uses the identity for |
| ------- | --------------------- |
| [Cluster scheduler](../../features/distributed-query#instance-identity) | Its registration in the shared cluster state. |
| [Cluster executor](../../features/distributed-query#instance-identity) | Its executor ID when it registers with the schedulers. |
| [Acceleration snapshots](../../features/data-acceleration/snapshots#several-instances-creating-one-datasets-snapshots) | The holder of a dataset's snapshot writer lease. |
| [HTTP rate control](#limits-across-instances) | The name of each process's share of the per-window budget, paired with a per-process ID so that a restarted instance does not reuse its earlier run's share. |
| [PostgreSQL replication](../../features/cdc/postgres-replication#multi-replica-deployments) | The default replication slot name. |

Give each instance that shares state its own identity. On Kubernetes, `HOSTNAME` defaults to the pod name, which is already distinct. Instances on one host share its host name, so two schedulers or two executors started on the same machine each need their own `SPICE_INSTANCE_ID`. When Spice finds another running process with the same identity, it logs an error such as:

```text
Another running instance uses SPICE_INSTANCE_ID 'spice-0' at state location 's3://my-bucket/spice-state/'. Give each instance its own SPICE_INSTANCE_ID (for example the pod name).
```

A scheduler logs this error, and its registration is refused, when the scheduler already registered under its identity keeps sending heartbeats. A scheduler restarted after a crash is not reported as a duplicate, because the heartbeat its predecessor left stops advancing. It waits until it has seen that heartbeat unchanged for 30 seconds, then registers in its predecessor's place. In v2.4.0-rc.2 and earlier, a scheduler restarted within 30 seconds of its predecessor's last heartbeat failed to register and exited. A scheduler also logs the error when a second executor process connects under an ID that a running executor already uses, and a snapshot writer logs it when another process renews its lease. HTTP rate control does not detect a shared identity.

### State location parameters

These rules apply to `runtime.state.params`, and to the `params` of a feature that sets its own state location, such as [`runtime.scheduler`](#runtimescheduler). Snapshots stored under `runtime.state` use `runtime.state.params`. A dataset that sets [`acceleration.snapshots_params`](./datasets.md#accelerationsnapshots_params) uses those instead, and a dataset that sets `acceleration.snapshots_location` without `snapshots_params` uses no params. A location set with the deprecated top-level `snapshots.location` takes its parameters from `snapshots.params`, and `snapshots.params`, when set, also replace `runtime.state.params` for snapshots stored under `runtime.state`. See [Configure snapshot storage](../../features/data-acceleration/snapshots#configure-snapshot-storage).

`runtime.state.params` can hold `s3_queue_url`, the SQS queue for [snapshot notifications](../../features/data-acceleration/refresh-modes/snapshot#reload-on-s3-event-notifications). The scheduler, HTTP rate control, and SQL results cache warmup accept it there without a warning and do not use it. A feature's own `params`, such as `runtime.scheduler.params`, still log a warning for it.

An `s3://` location takes `s3_region`, `s3_endpoint`, `s3_auth`, `s3_key`, `s3_secret`, `s3_session_token`, `client_timeout`, and `allow_http`. `s3_auth` is `iam_role` (the default) or `key`. With `s3_auth: key`, both `s3_key` and `s3_secret` must be set. A location that sets `s3_auth: key` without both keys fails instead of connecting with the credentials from the environment, and the error reads:

```text
's3_auth' is 'key', but 's3_key' and 's3_secret' are not both set. Set both, or set 's3_auth: iam_role' to use the credentials from the environment.
```

To use the credentials from the environment, set `s3_auth: iam_role` or omit `s3_auth`. `s3_key` and `s3_secret` set without `s3_auth` are used as given.

A `gs://` or `gcs://` location takes the [GCS data connector](../../components/data-connectors/gcs#authentication-parameters) parameter names: `gcs_service_account_path`, `gcs_service_account_key`, `gcs_application_default_credentials`, `gcs_skip_signature`, the [retry parameters](../../components/data-connectors/gcs#retry-parameters) (`gcs_max_retries`, `gcs_retry_timeout`, `gcs_backoff_initial_duration`, `gcs_backoff_max_duration`, `gcs_backoff_base`), `client_timeout`, and `allow_http`. As for the connector, set at most one authentication method. An invalid value, or more than one authentication method, is an error. A parameter name that the location does not support is logged as a warning and ignored.

```yaml
runtime:
  state:
    location: gs://my-bucket/spice-state
    params:
      gcs_service_account_key: ${ secrets:GCS_SERVICE_ACCOUNT_JSON }
```

When a location's `params` are rejected, Spice logs the error and the feature runs without that location. The [cluster scheduler](#runtimescheduler) does not initialize its shared state, and the [SQL results cache warmup](../../features/caching#warming-the-cache-after-a-restart) stores its query plans on the local disk instead. When `runtime.state.params` are rejected, the [startup check](#startup-check-of-the-state-location) also cannot reach the location, so the instance does not become ready. Fix the parameters and restart Spice.
