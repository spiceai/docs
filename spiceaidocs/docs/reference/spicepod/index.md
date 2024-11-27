---
title: 'Manifest syntax for Spicepods'
sidebar_position: 1
sidebar_label: 'Spicepod specification'
description: 'Detailed documentation on the Spicepod manifest syntax (spicepod.yaml)'
---

## About YAML syntax for Spicepod manifests (spicepod.yaml)

Spicepod manifests use YAML syntax and must be named `spicepod.yaml` or `spicepod.yml`. If you're new to YAML and want to learn more, see "[Learn YAML in Y minutes](https://learnxinyminutes.com/docs/yaml/)."

Spicepod manifest files are stored in the root directory of your application code.

## `version`

The version of the Spicepod manifest. The current version is `v1beta1`.

## `kind`

The kind of Spicepod manifest. The kind is `Spicepod`.

## `name`

The name of the Spicepod.

## `secrets`

The secrets section in the Spicepod manifest is optional and is used to configure how secrets are stored and accessed by the Spicepod. [Learn more](/components/secret-stores).

### `secrets.from`

The `from` field is a string that represents the Uniform Resource Identifier (URI) for the secret store. This URI is composed of two parts: a prefix indicating the Secret Store to use, and an optional selector that specifies the secret to retrieve.

The syntax for the `from` field is as follows:

```yaml
from: <secret_store>:<selector>
```

Where:

- `<secret_store>`: The Secret Store to use

  Currently supported secret stores:

  - [`env`](/components/secret-stores/env/index.md)
  - [`kubernetes`](/components/secret-stores/kubernetes/index.md)
  - [`keyring`](/components/secret-stores/keyring/index.md)
  - [`aws-secrets-manager`](/components/secret-stores/aws-secrets-manager/index.md)

  If no secret stores are explicitly specified, it defaults to `env`.

- `<selector>`: The secret within the secret store to load.

The type of secret store for reading secrets.

Example

```yaml
secrets:
  - from: env
    name: env
```

### `secrets.name`

The name of the secret store. This is used to reference the store in the secret replacement syntax, `${<secret_store_name>:<key_name>}`.

## `runtime`

### `runtime.num_of_parallel_loading_at_start_up`

This configuration setting determines the maximum number of datasets that can be loaded in parallel during startup. This parallel loading capability accelerates Spice's startup process when multiple datasets are configured.

### `runtime.results_cache`

The results cache section specifies runtime cache configuration. [Learn more](/features/caching).

```yaml
runtime:
  results_cache:
    enabled: true
    cache_max_size: 128MiB
    eviction_policy: lru
    item_ttl: 1s
```

- `enabled` - optional, `true` by default
- `cache_max_size` - optional, maximum cache size. Default is `128MiB`
- `eviction_policy` - optional, cache replacement policy when the cached data reaches the `cache_max_size`. Default is `lru` - [least-recently-used (LRU)](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU)
- `item_ttl` - optional, cache entry expiration time, 1 second by default.

### `runtime.tls`

The TLS section specifies the configuration for enabling Transport Layer Security (TLS) for all endpoints exposed by the runtime. [Learn more about enabling TLS](/api/tls).

In addition to configuring TLS via the manifest, TLS can also be configured via `spiced` command line arguments using with `--tls-enabled true` and `--tls-certificate`/`--tls-certificate-file` and `--tls-key`/`--tls-key-file` flags.

#### `runtime.tls.enabled`

Enables or disables TLS for the runtime endpoints.

```yaml
runtime:
  tls:
    ...
    enabled: true # or false
```

#### `runtime.tls.certificate`

The TLS certificate to use for securing the runtime endpoints. The certificate can also come from [secrets](/components/secret-stores).

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

#### `runtime.tls.certificate_file`

The path to the TLS PEM-encoded certificate file. Only one of `certificate` or `certificate_file` must be used.

```yaml
runtime:
  tls:
    ...
    certificate_file: /path/to/cert.pem
```

#### `runtime.tls.key`

The TLS key to use for securing the runtime endpoints. The key can also come from [secrets](/components/secret-stores).

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

#### `runtime.tls.key_file`

The path to the TLS PEM-encoded key file. Only one of `key` or `key_file` must be used.

```yaml
runtime:
  tls:
    ...
    key_file: /path/to/key.pem
```

### `runtime.task_history`

The task history section specifies runtime task history configuration.

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

### `runtime.cors`

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
    allowed_origins: ["https://example.com"]
```

This configuration allows requests from the `https://example.com` origin only.

## `metadata`

An optional `map` of metadata.

**Example**

```yaml
metadata:
  epoch_time: 1605312000
  period: 72h
  interval: 1m
  granularity: 10s
  episodes: 10
```

## `datasets`

A Spicepod can contain one or more [datasets](./datasets.md) referenced by relative path.

**Example**

A datasets referenced by relative path.

```yaml
datasets:
  - ref: datasets/uniswap_v2_eth_usdc
```

A dataset defined inline.

```yaml
datasets:
  - from: spice.ai/eth.recent_blocks
    name: eth_blocks
    acceleration:
      enabled: true
      refresh_mode: full
      refresh_check_interval: 1h
```

## `models`

A Spicepod can contain one or more [models](./models.md) referenced by relative path.

**Example**

A model referenced by path.

```yaml
models:
  - from: models/drive_stats
```

A model defined inline.

```yaml
models:
  - from: spiceai/lukekim/smart/models/drive_stats:latest
    name: drive_stats
    datasets:
      - drive_stats_inferencing
```

## `embeddings`

A Spicepod can contain one or more [embeddings](./embeddings.md) referenced by relative path.

**Example**

An embeddings model referenced by path.

```yaml
embeddings:
  - from: embeddings/openai_text_embedding_3
```

An embedding defined inline.

```yaml
embeddings:
  - name: hf_baai_bge
    from: huggingface:huggingface.co/BAAI/bge-small-en-v1.5
```

## `dependencies`

A list of dependent Spicepods.

```yaml
dependencies:
  - lukekim/demo
  - spicehq/nfts
```

## `views`

A Spicepod can contain one or more views which are virtual tables defined by SQL queries.

**Example**

```yaml
views:
  - name: rankings
    sql: |
      WITH a AS (
        SELECT products.id, SUM(count) AS count
        FROM orders
        INNER JOIN products ON orders.product_id = products.id
        GROUP BY products.id
      )
      SELECT name, count
      FROM products
      LEFT JOIN a ON products.id = a.id
      ORDER BY count DESC
      LIMIT 5
```
