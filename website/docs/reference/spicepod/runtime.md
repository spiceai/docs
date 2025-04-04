---
title: 'Runtime'
sidebar_label: 'Runtime'
description: 'Runtime YAML reference'
---

The `runtime` section specifies configuration settings for the Spice runtime.

## `runtime.dataset_load_parallelism`

This configuration setting determines the maximum number of datasets that can be loaded in parallel during startup.

By default, the maximum number of parallel datasets is effectively unlimited.

## `runtime.results_cache`

The results cache section specifies runtime cache configuration. [Learn more](/docs/features/caching/index.md).

```yaml
runtime:
  results_cache:
    enabled: true
    cache_max_size: 128MiB
    eviction_policy: lru
    item_ttl: 1s
    cache_key_type: plan
```

- `enabled` - optional, `true` by default
- `cache_max_size` - optional, maximum cache size. Default is `128MiB`
- `eviction_policy` - optional, cache replacement policy when the cached data reaches the `cache_max_size`. Default is `lru` - [least-recently-used (LRU)](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU)
- `item_ttl` - optional, cache entry expiration time, 1 second by default.
- `cache_key_type` - optional, determines how cache keys are generated. Default is `plan`.

### Choosing a `cache_key_type`

- **`plan` (Default):** Uses query's logical plan as cache key. Matches semantically equivalent queries despite syntax differences. Requires query parsing first.

- **`sql`:** Uses raw SQL string as cache key. Faster lookups but requires exact string matches. May return stale results for parameterized queries.

Choose `sql` for lowest latency with identical queries, `plan` for more flexibility.

## `runtime.tls`

The TLS section specifies the configuration for enabling Transport Layer Security (TLS) for all endpoints exposed by the runtime. [Learn more about enabling TLS](/docs/api/tls/index.md).

In addition to configuring TLS via the manifest, TLS can also be configured via `spiced` command line arguments using with `--tls-enabled true` and `--tls-certificate`/`--tls-certificate-file` and `--tls-key`/`--tls-key-file` flags.

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

- `enabled` - optional, `true` by default.
- `captured_output` - optional, what level of output is captured by the task history table. `none` by default. Possible values are `truncated`, or `none`.
- `retention_period` - optional, how long records in the task history table should be retained. Default is `8h`, or 8 hours.
- `retention_check_interval` - optional, how often should old records be checked for removal. Default is `15m`, or 15 minutes.

## `runtime.cors`

The CORS section specifies the configuration for enabling Cross-Origin Resource Sharing (CORS) for the HTTP endpoint. By default, CORS is disabled.

Default configuration:

```yaml
runtime:
  cors:
    enabled: false
```

### `runtime.cors.enabled`

Enables or disables CORS for the HTTP endpoint. `false` by default.

### `runtime.cors.allowed_origins`

A list of allowed origins for CORS requests. `["*"]` by default, which allows all origins.

Example:

```yaml
runtime:
  cors:
    enabled: true
    allowed_origins: ['https://example.com']
```

This configuration allows requests from the `https://example.com` origin only.

## `runtime.temp_directory`

The path to a temporary directory that Spice will use for query/acceleration operations that spill to disk. For more details, see the [Managing Memory Usage documentation](../memory.md) and the [DuckDB Data Accelerator documentation](../../components/data-accelerators/duckdb.md).

```yaml
runtime:
  temp_directory: /tmp/spice
```
