---
title: 'Functions (User-Defined Functions)'
sidebar_label: 'Functions'
description: 'User-defined functions YAML reference'
---

Functions extend Spice's SQL engine with custom scalar logic. Each entry in the top-level `functions:` block is registered as a callable SQL function and (by default) as an LLM tool.

For an overview, examples, and execution-tier details, see [Functions](../../features/functions).

:::warning[Registration is off by default]
The `functions:` section is only honored when [`runtime.functions.enabled`](./runtime#runtimefunctions) is set to `true`.
:::

## `functions`

The `functions:` section in your configuration declares one or more scalar functions.

Example:

```yaml
runtime:
  functions:
    enabled: true

functions:
  - name: double_it
    from: sql
    description: Double a 64-bit integer.
    volatility: immutable
    signature:
      args:
        - { name: x, type: int64 }
      returns: int64
    body: 'x * 2'
```

### `name`

A unique identifier for the function. The name is used to register the UDF in the SQL session and as the tool name when surfaced to LLMs.

### `from`

Source URI selecting the execution tier:

- `sql` — Inline SQL body executed in-process.
- `http://...` / `https://...` — Remote endpoint invoked over HTTP + JSON.

Other schemes are rejected at startup. See [Execution Tiers](../../features/functions#execution-tiers).

### `enabled`

Optional. Defaults to `true`. Set to `false` to keep the declaration in the spicepod without registering the function — useful for staged rollouts. Disabled functions are also hidden from `list_udfs()` and `GET /v1/functions`.

### `description`

Optional. Free-form description surfaced in `list_udfs()`, `GET /v1/functions`, and the LLM tool registry.

### `kind`

Optional. Defaults to `scalar`. Only scalar functions are supported in the current beta.

### `volatility`

Optional. Defaults to `volatile`. Controls how the optimizer treats the function across calls.

| Value       | Description                                                                                |
| ----------- | ------------------------------------------------------------------------------------------ |
| `immutable` | Same inputs always yield the same output. May be constant-folded and cached.                |
| `stable`    | Stable within a single query but may change across queries. Cached per query.                |
| `volatile`  | (default) Unpredictable on every call. Never cached.                                         |

Choose the strongest level that's actually true. See [Volatility](../../features/functions#volatility).

### `signature`

Required. Typed argument list and return type.

```yaml
signature:
  args:
    - { name: lat1, type: float64 }
    - { name: lon1, type: float64 }
  returns: float64
```

#### `signature.args`

Optional. Positional argument list. Empty for niladic functions.

Each entry has:

- `name` — Argument name. Used inside SQL `body` expressions and as the JSON key for remote tier requests.
- `type` — Arrow type. Accepts Spicepod aliases (`int64`, `utf8`, `list<int64>`, `decimal(38,10)`, `timestamp(us, utc)`) and Arrow display forms (`Int64`, `List(Int64)`, etc.). See [Types](../../features/functions#types).

#### `signature.returns`

Required for scalar functions. The Arrow type of the function's output, in the same format as argument types.

### `body`

Inline SQL expression body. Required when `from: sql` (unless `body_ref` is set instead). Must be a single SQL expression (not a statement) referencing the function's arguments by name.

```yaml
body: |
  6371 * acos(
    cos(radians(lat1)) * cos(radians(lat2)) *
    cos(radians(lon2) - radians(lon1)) +
    sin(radians(lat1)) * sin(radians(lat2))
  )
```

The body can call any DataFusion built-in scalar function (math, string, datetime, JSON, regex, etc.).

Mutually exclusive with `body_ref`. Must not be set for non-SQL `from:` schemes.

### `body_ref`

Path to a local filesystem file whose contents are the SQL body. Resolved relative to the runtime's current working directory at registration time.

```yaml
body_ref: ./functions/shipping_class.sql
```

`body_ref` is not read from object stores when a spicepod is loaded remotely — use inline `body:` for portable remote spicepods.

Mutually exclusive with `body`.

### `params`

Optional. Tier-specific parameters. Supports `${secrets:KEY}` and `${env:KEY}` interpolation at registration time.

For the **Remote tier** (`from: http://...` / `https://...`):

| Parameter           | Default | Description                                                                          |
| ------------------- | ------- | ------------------------------------------------------------------------------------ |
| `timeout`           | `30s`   | Per-call timeout. Plain integer seconds or `Ns` / `Nms` strings.                     |
| `batch_size`        | `1024`  | Maximum rows per HTTP request. Capped at `100 000`.                                  |
| `batch_concurrency` | `4`     | Maximum in-flight HTTP batches per invocation. Capped at `64`.                       |
| `auth_bearer`       | unset   | When set, adds `Authorization: Bearer <value>` to each request. Use `${secrets:...}`. |

The SQL tier does not currently use `params`.

### `metadata`

Optional. Free-form key/value pairs surfaced alongside the function definition. Useful for tagging, ownership, or custom metadata consumers.

```yaml
metadata:
  owner: data-platform
  jira: DATA-1234
```

### `as_tool`

Optional. Defaults to `true`. When `true`, the function is registered as an LLM tool with the same name and description and becomes callable from chat completions, `POST /v1/tools/<name>`, and the `/v1/tools` listing.

Set to `false` to keep the function SQL-only:

```yaml
functions:
  - name: internal_hash
    from: sql
    as_tool: false
    signature:
      args: [{ name: x, type: int64 }]
      returns: int64
    body: 'x * 2654435761'
```

### `dependsOn`

Optional. Names of other Spicepod components that must be loaded before this function (e.g. a dataset the function queries internally).

### `metrics`

Optional. Per-function metrics configuration. See [Component Metrics](../../features/observability/component_metrics).

## Discovering registered functions

After startup, registered functions can be inspected:

- **From SQL** — `SELECT * FROM list_udfs() WHERE source = 'user';`
- **From the HTTP API** — `GET /v1/functions` returns a JSON array of user functions.

See [Discovering registered functions](../../features/functions#discovering-registered-functions).
