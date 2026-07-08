---
title: 'Runtime'
sidebar_label: 'Runtime'
description: 'Runtime YAML reference'
---

The `runtime` section specifies configuration settings for the Spice runtime.

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
| `keys`         | Yes      | `[]`    | A list of API keys used to authenticate requests.              |

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
| `eviction_policy`   | Yes      | `lru`    | Cache replacement policy when the cache reaches `max_size`. Defaults to `lru`. Supports `lru` (Least Recently Used) and `tiny_lfu` (Tiny Least Frequently Used, higher hit rate for skewed access patterns). |
| `item_ttl`          | Yes      | `1s`     | Cache entry expiration duration (Time to Live). Defaults to 1 second.                                                                                                                                        |
| `hashing_algorithm` | Yes      | `xxh3`   | Selects which hashing algorithm is used to hash the cache keys when storing the results. Defaults to `xxh3`. Supports `xxh3`, `ahash`, `siphash`, `blake3`, `xxh32`, `xxh64`, or `xxh128`.                   |

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

### HTTP Rate Control

HTTP-based connectors (HTTP/HTTPS, GraphQL, GitHub) support the following rate control defaults:

| Parameter Name                    | Description                                                                                                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `http_max_concurrent_requests`    | Default maximum concurrent HTTP requests per upstream origin. Can be overridden per-dataset with `max_concurrent_requests`.                                    |
| `http_requests_per_second_limit`  | Default maximum HTTP requests per second per upstream origin. Can be overridden per-dataset with `requests_per_second_limit`.                                  |
| `http_requests_per_minute_limit`  | Default maximum HTTP requests per minute per upstream origin. Can be overridden per-dataset with `requests_per_minute_limit`.                                  |
| `http_rate_control_jitter_min`    | Default minimum random delay before HTTP requests when rate control is active. Defaults to `5ms` when a rate limit is configured. Can be overridden per-dataset. |
| `http_rate_control_jitter_max`    | Default maximum random delay before HTTP requests when rate control is active. Defaults to `10ms` when a rate limit is configured. Can be overridden per-dataset. |

```yaml
runtime:
  params:
    http_max_concurrent_requests: 10
    http_requests_per_second_limit: 5
    http_requests_per_minute_limit: 200
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
| `cayenne_footer_cache_mb`                 | Size of the engine-wide in-memory Vortex footer cache in megabytes, shared across all Cayenne datasets. Defaults to `128`.                                                                                              |
| `cayenne_filter_propagation`              | Enables Cayenne's filter-propagation optimizer rules. Accepts `enabled` or `disabled`; defaults to `disabled`.                                                                                                          |
| `cayenne_optimizer_rules`                 | Selects which Cayenne optimizer rules run. Accepts `auto` (default), `all`, `none` / `disabled`, or a comma-separated list of rule names.                                                                               |
| `cayenne_compaction_memory_fraction`      | Fraction of the query memory pool reserved for the dedicated Cayenne compaction pool. Defaults to `0.2` (clamped to a supported range). Applied only when a Cayenne dataset is enabled and dedicated thread pools are not disabled. |
| `cayenne_sort_merge_min_rows`             | Advanced anti-join tuning: row-count threshold above which filter propagation switches to a sort-merge strategy. Internally tuned default.                                                                              |
| `cayenne_sort_merge_memory_pool_fraction` | Advanced anti-join tuning: fraction of the memory pool the sort-merge anti-join strategy may use. Internally tuned default.                                                                                             |

```yaml
runtime:
  params:
    cayenne_footer_cache_mb: 512
    cayenne_filter_propagation: enabled
```

## `runtime.source_rate_control`

Optional. Configures how Spice limits outbound requests to upstream data sources, and optionally enables cluster-wide coordination through persisted state in object storage.

Without `state_location`, rate limits are local to each Spice instance. When `state_location` is set, Spice instances coordinate through object storage so that a configured limit is shared across the cluster. For example, `requests_per_second_limit: 20` means approximately 20 RPS total across all replicas, not 20 RPS per replica.

```yaml
runtime:
  source_rate_control:
    state_location: s3://my-bucket/spice/rate-control/
    refresh_interval: 30s
    params:
      s3_region: us-west-2
      s3_key: ${ secrets:AWS_ACCESS_KEY_ID }
      s3_secret: ${ secrets:AWS_SECRET_ACCESS_KEY }
    github_concurrent_connections_limit: 10
```

| Parameter Name                        | Optional | Default | Description                                                                                                                                                                                                                       |
| ------------------------------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state_location`                      | Yes      | -       | Root URI for globally persisted rate-control state (e.g. `s3://bucket/path/`). Enables cluster-wide rate control when set. Without this, limits are local to each Spice instance.                                                  |
| `params`                              | Yes      | -       | Object-store authentication parameters for `state_location`. Supports the same keys as other object-store configurations (e.g. `s3_region`, `s3_key`, `s3_secret` for S3; `account`, `access_key` for Azure). Supports `${ secrets:NAME }` references. |
| `refresh_interval`                    | Yes      | `30s`   | How often each instance refreshes and persists per-source rate-control state. Longer intervals reduce object-store writes but adapt more slowly to demand changes.                                                                 |
| `github_concurrent_connections_limit` | Yes      | `10`    | Maximum number of concurrent GitHub HTTP requests per authentication context. Replaces the deprecated `runtime.params.github_max_concurrent_connections`.                                                                          |

HTTP/API rate limits are configured through [`runtime.params`](#runtimeparams) (cluster defaults) and per-dataset overrides. Precedence is:

```text
dataset param > runtime.params.http_* default > unset
```

When `state_location` is set, the configured RPS/RPM quota is converted into a token budget per lease window and distributed across replicas using a demand-weighted leased token-bucket model.

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

Example:

```yaml
runtime:
  cors:
    enabled: true
    allowed_origins: ['https://example.com']
```

This configuration permits requests only from the `https://example.com` origin.

## `runtime.query.memory_limit`

The `memory_limit` parameter sets a memory usage cap for the Spice runtime query engine. This limit applies **only** to the query engine and should be used in addition to other memory configuration options, such as `duckdb_memory_limit`. When the limit is reached, DataFusion spills intermediate data to disk using the directory configured in `runtime.query.temp_directory`.

If not specified, defaults to **90% of total system memory** (container-aware). When Cayenne acceleration is active, the default is reduced to **70%** to reserve headroom for Cayenne's dedicated compaction memory pool and its in-memory CDC tier.

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
- If not set, the number of concurrent queries is **unbounded** (the default behavior).
- A configured value is clamped to a minimum of `1`, so `max_concurrent_queries: 0` allows one concurrent query (not unbounded).

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

The path to a temporary directory that Spice uses for query and acceleration operations that spill to disk. For more details, see the [Managing Memory Usage documentation](../memory) and the [DuckDB Data Accelerator documentation](../../components/data-accelerators/duckdb).

```yaml
runtime:
  query:
    temp_directory: /tmp/spice
```

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

### `runtime.telemetry.properties` {#runtimetelemetryproperties}

Map of custom key/value attributes attached to telemetry metrics emitted by `spiced`. Applied as OpenTelemetry resource attributes on the runtime's `MeterProvider`, so they appear as dimensions/tags on every metric exported via the Prometheus scrape endpoint, the cluster on-demand OTLP reader, and the `otel_exporter` push exporter. Defaults to empty.

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

Configures an [OpenTelemetry](https://opentelemetry.io/) metrics exporter to push metrics to an OpenTelemetry collector. The exporter automatically infers the protocol (gRPC or HTTP) based on the endpoint configuration.

| Parameter name  | Optional | Default | Description                                                                                                                                                                                                                                                   |
| --------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`       | Yes      | `true`  | Whether the OpenTelemetry exporter is enabled.                                                                                                                                                                                                                |
| `endpoint`      | No       | -       | The OpenTelemetry collector endpoint. Protocol is inferred from the format (see examples below).                                                                                                                                                              |
| `push_interval` | Yes      | `60s`   | How frequently metrics are pushed to the collector. Specify as a [duration](../duration).                                                                                                                                                                     |
| `metrics`       | Yes      | `[]`    | List of metric names to export. When empty (default), all metrics are exported.                                                                                                                                                                               |
| `headers`       | Yes      | `{}`    | Map of headers to send with each export request. For HTTP these are sent as HTTP headers; for gRPC they are sent as metadata entries (keys must be lowercase ASCII). Values support the `${secrets:...}` [replacement syntax](../../components/secret-stores#using-secrets) for loading credentials from a [secret store](../../components/secret-stores). |

**Protocol inference:**

- **gRPC (default):** Use a bare host:port endpoint without a scheme (e.g., `localhost:4317`). gRPC uses port 4317 by default.
- **HTTP:** Include the `http://` or `https://` scheme and the `/v1/metrics` path (e.g., `http://localhost:4318/v1/metrics`). HTTP uses port 4318 by default.

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
```

| Parameter name              | Optional | Default | Description                                                          |
| --------------------------- | -------- | ------- | -------------------------------------------------------------------- |
| `max_message_size`          | Yes      | -       | Maximum size of a single Arrow Flight message.                       |
| `do_put_rate_limit_enabled` | Yes      | `true`  | Whether rate limiting is applied to `DoPut` Arrow Flight operations. |

## `runtime.mcp`

Configures settings for the Spice MCP server endpoint (`/v1/mcp`).

### `runtime.mcp.allowed_hosts`

Controls which `Host` header values are accepted on the `/v1/mcp` endpoint. This prevents [DNS rebinding](https://en.wikipedia.org/wiki/DNS_rebinding) attacks against the MCP server.

| Behavior | Configuration |
| --- | --- |
| **Default** (not set) | Only `localhost`, `127.0.0.1`, and `::1` are permitted. Requests with any other `Host` value receive `403 Forbidden`. |
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
  scheduler:
    state_location: s3://my-bucket/spice-cluster-state/
    params:
      s3_region: us-east-1
    partition_assignment_interval: 30s
    max_partition_assignments_per_interval: 100
    max_partitions_per_executor: 1000
    partition_discovery_timeout: 60s
```

| Parameter name                                     | Optional | Default | Description                                                            |
| -------------------------------------------------- | -------- | ------- | ---------------------------------------------------------------------- |
| `state_location`                                   | No       | -       | Root URI for shared cluster state storage (e.g. `s3://bucket/path/`).  |
| `params`                                           | Yes      | -       | Object store parameters (e.g. `aws_region`).                           |
| `partition_assignment_interval`                    | Yes      | `30s`   | How often the scheduler runs partition assignment cycles.              |
| `max_partition_assignments_per_interval`           | Yes      | `100`   | Maximum number of partition assignments per interval.                  |
| `max_partitions_per_executor`                      | Yes      | `1000`  | Maximum number of partitions assigned to a single executor.            |
| `partition_discovery_timeout`                      | Yes      | `60s`   | How long the scheduler waits for executor discovery before timing out. |
