---
title: 'Runtime'
sidebar_label: 'Runtime'
description: 'Runtime YAML reference'
---

The `runtime` section specifies configuration settings for the Spice runtime.

## `runtime.dataset_load_parallelism`

This setting specifies the maximum number of datasets that can be loaded in parallel during startup. By default, the number of parallel datasets is unlimited.

## `runtime.results_cache`

The results cache section specifies runtime cache configuration. [Learn more](/docs/features/caching/index.md).

```yaml
runtime:
  results_cache:
    enabled: true
    cache_max_size: 128MiB
    item_ttl: 1s
```

| Parameter name    | Optional | Description                                                                                                                                   |
| ----------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`         | Yes      | Defaults to `true`.                                                                                                                           |
| `cache_max_size`  | Yes      | Maximum cache size. Defaults to `128MiB`.                                                                                                     |
| `eviction_policy` | Yes      | Cache replacement policy when the cache reaches `cache_max_size`. Defaults to `lru`, which is currently the only supported value.             |
| `item_ttl`        | Yes      | Cache entry expiration duration (Time to Live). Defaults to 1 second.                                                                         |
| `cache_key_type`  | Yes      | Determines how cache keys are generated. Defaults to `plan`. `plan` uses the query's logical plan, while `sql` uses the raw SQL query string. |

### Choosing a `cache_key_type`

- **`plan` (Default):** Uses the query's logical plan as the cache key. Matches semantically equivalent queries but requires query parsing.
- **`sql`:** Uses the raw SQL string as the cache key. Provides faster lookups but requires exact string matches. Queries with dynamic functions, such as `NOW()`, may produce unexpected results. Use `sql` only when results are predictable.

Use `sql` for the lowest latency with identical queries that do not include dynamic functions. Use `plan` for greater flexibility.

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
