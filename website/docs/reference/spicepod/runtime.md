---
title: 'Runtime'
sidebar_label: 'Runtime'
description: 'Runtime YAML reference'
---

The `runtime` section specifies configuration settings for the Spice runtime.

## `runtime.dataset_load_parallelism`

This setting specifies the maximum number of datasets that can be loaded in parallel during startup. By default, the number of parallel datasets is unlimited.

## `runtime.caching`

This setting specifies cache settings for supported Runtime components:

* `sql_results`: Specifies cache settings for results from SQL queries.
* `search_results`: Specifies cache settings for results from searches.
* `embeddings`: Specifies cache settings for embeddings requests.

Runtime caches support common configuration parameters:

| Parameter name      | Optional | Description                                                                                                                                    |
| ------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`           | Yes      | Defaults to `true`.                                                                                                                            |
| `max_size`    | Yes      | Maximum cache size. Defaults to `128MiB`.                                                                                                      |
| `eviction_policy`   | Yes      | Cache replacement policy when the cache reaches `max_size`. Defaults to `lru`, which is currently the only supported value.              |
| `item_ttl`          | Yes      | Cache entry expiration duration (Time to Live). Defaults to 1 second.                                                                          |
| `hashing_algorithm` | Yes      | Selects which hashing algorithm is used to hash the cache keys when storing the results. Defaults to `siphash`. Supports `siphash` or `ahash`. |

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

| Parameter name      | Optional | Description                                                                                                                                    |
| ------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `cache_key_type`    | Yes      | Determines how cache keys are generated. Defaults to `plan`. `plan` uses the query's logical plan, while `sql` uses the raw SQL query string.  |

:::info

`runtime.results_cache` has been deprecated and will be removed in a future release. If `runtime.results_cache` is specifed in the spicepod it will override the `runtime.caching.sql_results` settings if it is not defined.

:::

#### Choosing a `cache_key_type`

- **`plan` (Default):** Uses the query's logical plan as the cache key. Matches semantically equivalent queries but requires query parsing.
- **`sql`:** Uses the raw SQL string as the cache key. Provides faster lookups but requires exact string matches. Queries with dynamic functions, such as `NOW()`, may produce unexpected results. Use `sql` only when results are predictable.

Use `sql` for the lowest latency with identical queries that do not include dynamic functions. Use `plan` for greater flexibility.

### Choosing a `hashing_algorithm`

- **`siphash` (Default):** Uses the SipHash1-3 algorithm for hashing the cache keys, the [default hashing algorithm of Rust](https://github.com/rust-lang/rust/commit/db1b1919baba8be48d997d9f70a6a5df7e31612a). This hashing algorithm is a secure algorithm that implements verified protections against ["hash flooding"](https://v8.dev/blog/hash-flooding) denial of service (DoS) attacks. Reasonably performant, and provides a high level of security.
- **`ahash`:** Uses the [AHash](https://github.com/tkaitchuck/ahash) algorithm for hashing the cache keys. The AHash algorithm is a [high quality](https://github.com/tkaitchuck/aHash/blob/master/compare/readme.md#Quality) hashing algorithm, and has claimed resistance against hashing DoS attacks. AHash has higher performance than SipHash1-3, especially when used with a `plan` `cache_key_type`.

Consider using `ahash` if maximum performance is most important, or where hashing DoS attacks are unlikely or a low risk. More information on the security mechanisms of AHash are available [in the AHash documentation](https://github.com/tkaitchuck/aHash/wiki/How-aHash-is-resists-DOS-attacks).

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
```

| Parameter name             | Optional | Description                                                                                    |
| -------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `enabled`                  | Yes      | Defaults to `true`.                                                                            |
| `captured_output`          | Yes      | Specifies the level of output captured by the task history table. Defaults to `none`.          |
| `retention_period`         | Yes      | Specifies how long records in the task history table are retained. Defaults to `8h` (8 hours). |
| `retention_check_interval` | Yes      | Specifies how often old records are checked for removal. Defaults to `15m` (15 minutes).       |

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

## `runtime.memory_limit`

The `memory_limit` parameter sets a memory usage cap for the Spice runtime query engine. This limit applies **only** to the query engine and should be used in addition to other memory configuration options, such as `duckdb_memory_limit`. When `memory_limit` is specified, the value of `runtime.temp_directory` determines the directory DataFusion uses for spilling intermediate data to disk.

```yaml
runtime:
  memory_limit: 4GiB
```

Specify the value as a size, for example `4GiB` or `1024MiB`.

For detailed memory information, see [Memory](/docs/reference/memory.md).

## `runtime.temp_directory`

The path to a temporary directory that Spice uses for query and acceleration operations that spill to disk. For more details, see the [Managing Memory Usage documentation](../memory.md) and the [DuckDB Data Accelerator documentation](../../components/data-accelerators/duckdb.md).

```yaml
runtime:
  temp_directory: /tmp/spice
```
