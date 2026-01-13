---
title: 'Runtime'
sidebar_label: 'Runtime'
description: 'Runtime YAML reference'
---

The `runtime` section specifies configuration settings for the Spice runtime.

## `runtime.auth`

### `runtime.auth.api-key`

Spice supports adding optional authentication to its API endpoints via configurable API keys. [Learn more](../../api/auth/index.md).

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
| `enabled`      | Yes      | `false` | Defaults to `false`. Whether API key authentication is enabled |
| `keys`         | Yes      | `[]`    | A list of API keys used to authenticate requests.              |

## `runtime.dataset_load_parallelism`

This setting specifies the maximum number of datasets that can be loaded in parallel during startup. By default, the number of parallel datasets is unlimited.

## `runtime.caching`

This setting specifies cache settings for supported Runtime components:

- `sql_results`: Specifies cache settings for results from SQL queries.
- `search_results`: Specifies cache settings for results from searches.
- `embeddings`: Specifies cache settings for embeddings requests.

Runtime caches support common configuration parameters:

| Parameter name      | Optional | Default  | Description                                                                                                                                                                                |
| ------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `enabled`           | Yes      | `true`   | Defaults to `true`.                                                                                                                                                                        |
| `max_size`          | Yes      | `128MiB` | Maximum cache size. Defaults to `128MiB`.                                                                                                                                                  |
| `eviction_policy`   | Yes      | `lru`    | Cache replacement policy when the cache reaches `max_size`. Defaults to `lru`, which is currently the only supported value.                                                                |
| `item_ttl`          | Yes      | `1s`     | Cache entry expiration duration (Time to Live). Defaults to 1 second.                                                                                                                      |
| `hashing_algorithm` | Yes      | `xxh3`   | Selects which hashing algorithm is used to hash the cache keys when storing the results. Defaults to `xxh3`. Supports `xxh3`, `ahash`, `siphash`, `blake3`, `xxh32`, `xxh64`, or `xxh128`. |

### `runtime.caching.search_results`

The search results cache section specifies runtime search cache configuration. [Learn more](/docs/features/caching/index.md).

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

The embeddings cache section specifies runtime embeddings requests cache configuration. [Learn more](/docs/features/caching/index.md).

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

The SQL results cache section specifies runtime SQL query cache configuration. [Learn more](/docs/features/caching/index.md).

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
- **`ahash`:** Uses the [AHash](https://github.com/tkaitchuck/ahash) algorithm for hashing the cache keys. The AHash algorithm is a [high quality](https://github.com/tkaitchuck/aHash/blob/master/compare/readme.md#Quality) hashing algorithm, and has claimed resistance against hashing DoS attacks. AHash has higher performance than SipHash1-3, especially when used with `cache_key_type: plan`.
- **`blake3`:** Uses the [BLAKE3](https://github.com/BLAKE3-team/BLAKE3) cryptographic hash function. BLAKE3 is a fast, parallelizable hash function that provides cryptographic security while maintaining high performance. It is suitable for scenarios requiring both speed and cryptographic guarantees.
- **`xxh32`, `xxh64`, `xxh128`:** Variants of the XXH hashing algorithm with different output sizes. These algorithms offer a balance between speed and collision resistance, with larger hash sizes providing better collision resistance at the cost of performance.

Use `xxh3` (the default) for its superior speed in most scenarios. Use `ahash`, `xxh64` or `xxh128` for reduced collision probability when caching a large number of queries. Use `blake3` when cryptographic security is required. Use `siphash` when protection against hash flooding attacks is a priority.

## `runtime.shutdown_timeout`

Controls how long Spice waits for connections to be gracefully drained and for components to shut down cleanly during runtime termination. Defaults to 30 seconds.

```yaml
runtime:
  shutdown_timeout: 1m
```

## `runtime.tls`

The TLS section specifies the configuration for enabling Transport Layer Security (TLS) for all endpoints exposed by the runtime. [Learn more about enabling TLS](/docs/api/tls/index.md).

In addition to configuring TLS via the manifest, TLS can also be configured via `spiced` command line arguments using the `--tls-enabled true` flag along with `--tls-certificate`/`--tls-certificate-file` and `--tls-key`/`--tls-key-file`.

### `runtime.tls.enabled`

Enables or disables TLS for the runtime endpoints.

```yaml
runtime:
  tls:
    ...
    enabled: true # or false
```

### `runtime.tls.certificate`

The TLS certificate to use for securing the runtime endpoints. The certificate can also come from [secrets](/docs/components/secret-stores).

```yaml
runtime:
  tls:
    ...
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
    ...
    certificate_file: /path/to/cert.pem
```

### `runtime.tls.key`

The TLS key to use for securing the runtime endpoints. The key can also come from [secrets](/docs/components/secret-stores).

```yaml
runtime:
  tls:
    ...
    key: |
      -----BEGIN PRIVATE KEY-----
      ...
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
    ...
    key_file: /path/to/key.pem
```

## `runtime.task_history`

The task history section specifies runtime task history configuration. For more details, see the [Task History documentation](../task_history.md).

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

The `memory_limit` parameter sets a memory usage cap for the Spice runtime query engine. This limit applies **only** to the query engine and should be used in addition to other memory configuration options, such as `duckdb_memory_limit`. When `memory_limit` is specified, the value of `runtime.query.temp_directory` determines the directory DataFusion uses for spilling intermediate data to disk.

```yaml
runtime:
  query:
    memory_limit: 4GiB
```

Specify the value as a size, for example `4GiB` or `1024MiB`.

For detailed memory information, see [Memory](/docs/reference/memory.md).

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

This option allows you to balance disk space usage and query performance for large-scale analytics workloads.

## `runtime.query.temp_directory`

<!-- Backwards compatibility anchor for older versioned docs -->
<a id="runtimetemp_directory"></a>

The path to a temporary directory that Spice uses for query and acceleration operations that spill to disk. For more details, see the [Managing Memory Usage documentation](../memory.md) and the [DuckDB Data Accelerator documentation](../../components/data-accelerators/duckdb.md).

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

The telemetry section configures runtime telemetry collection and export. [Learn more](/docs/features/observability).

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

### `runtime.telemetry.otel_exporter`

Configures an [OpenTelemetry](https://opentelemetry.io/) metrics exporter to push metrics to an OpenTelemetry collector. The exporter automatically infers the protocol (gRPC or HTTP) based on the endpoint configuration.

| Parameter name  | Optional | Default | Description                                                                                                     |
| --------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| `enabled`       | Yes      | `true`  | Whether the OpenTelemetry exporter is enabled.                                                                  |
| `endpoint`      | No       | -       | The OpenTelemetry collector endpoint. Protocol is inferred from the format (see examples below).                |
| `push_interval` | Yes      | `60s`   | How frequently metrics are pushed to the collector. Specify as a [duration](/docs/reference/duration/index.md). |
| `metrics`       | Yes      | `[]`    | List of metric names to export. When empty (default), all metrics are exported.                                 |

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

## `runtime.metrics`

Specifies metrics that are disabled by default.

Following metrics are disabled by default:

- `dataset_acceleration_max_timestamp_before_refresh_ms`
- `dataset_acceleration_max_timestamp_after_refresh_ms`
- `dataset_acceleration_refresh_lag_ms`
- `dataset_acceleration_ingestion_lag_ms`

For details about these metrics, see [Observability](/docs/features/observability/index.md).

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
