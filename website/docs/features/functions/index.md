---
title: 'Functions'
sidebar_label: 'Functions'
description: 'Define custom scalar and table SQL functions inline (SQL tier) or by calling remote HTTP services (Remote tier), automatically exposed as SQL functions and LLM tools.'
sidebar_position: 11
pagination_prev: null
pagination_next: null
tags:
  - functions
  - udf
  - sql
  - tools
---

Functions extend Spice's SQL engine with custom logic declared in your Spicepod. Functions can be **scalar** (one value per row) or **table** (returning multiple rows and columns). Each function can be:

- **Called directly in SQL** like any built-in function (`SELECT my_fn(col) FROM ...`).
- **Surfaced to LLMs as tools** for tool-calling workflows.
- **Listed via SQL** with the `list_udfs()` UDTF and via the HTTP API at `GET /v1/functions`.

Functions are declared in the top-level `functions:` block of `spicepod.yaml`. The full YAML reference is on the [Functions Spicepod reference](../../reference/spicepod/functions.md) page.

## Quickstart

Enable functions and declare a SQL function:

```yaml
runtime:
  functions:
    enabled: true # Required — registration is off by default

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

Call it from SQL:

```sql
SELECT double_it(21); -- 42
```

The function is automatically registered both as a SQL function and as a callable LLM tool (set `as_tool: false` to keep it SQL-only).

## Execution Tiers

Spice supports two tiers for functions, selected by the `from:` field:

| Tier   | `from:` scheme        | Where it runs                       | When to use                                                                  |
| ------ | --------------------- | ----------------------------------- | ---------------------------------------------------------------------------- |
| SQL    | `sql`                 | In-process, in the DataFusion engine | Pure expressions, math, string transforms, business logic over column values. |
| Remote | `http://`, `https://` | A remote HTTP + JSON service        | Custom logic in another language, ML inference, calls to internal APIs.       |

### SQL tier (`from: sql`)

The function `body` is a single SQL expression evaluated against the function's arguments. It can call any DataFusion built-in function (math, string, datetime, JSON, regex, etc.).

```yaml
functions:
  - name: haversine_km
    from: sql
    description: Haversine great-circle distance in kilometres.
    volatility: immutable
    signature:
      args:
        - { name: lat1, type: float64 }
        - { name: lon1, type: float64 }
        - { name: lat2, type: float64 }
        - { name: lon2, type: float64 }
      returns: float64
    body: |
      6371 * acos(
        cos(radians(lat1)) * cos(radians(lat2)) *
        cos(radians(lon2) - radians(lon1)) +
        sin(radians(lat1)) * sin(radians(lat2))
      )
```

```sql
SELECT haversine_km(37.7749, -122.4194, 40.7128, -74.0060) AS km;
-- 4129.085647...
```

#### External SQL files with `body_ref`

For non-trivial SQL, keep the body in its own file with proper editor support:

```yaml
functions:
  - name: shipping_class
    from: sql
    signature:
      args:
        - { name: weight_g, type: int64 }
        - { name: country, type: utf8 }
      returns: utf8
    body_ref: ./functions/shipping_class.sql
```

`body_ref` is read from the local filesystem at registration time. For portable spicepods loaded from object storage, use inline `body:` instead.

### Remote tier (`from: http://...`)

The runtime POSTs row batches to the configured endpoint and reads the resulting values. Use this tier to delegate logic to a service in another language, an ML model server, or an internal API.

```yaml
functions:
  - name: classify_intent
    from: http://classifier.internal/v1/classify
    description: Classify a user prompt via a remote service.
    volatility: volatile
    signature:
      args:
        - { name: prompt, type: utf8 }
      returns: utf8
    params:
      timeout: 5s
      batch_size: 256
      batch_concurrency: 4
      auth_bearer: ${secrets:CLASSIFIER_TOKEN}
```

```sql
SELECT user_id, classify_intent(latest_message) AS intent
FROM conversations
WHERE date = today();
```

#### Wire contract

The runtime sends a single HTTP `POST` per batch with `Content-Type: application/json`:

**Request body:**

```json
{
  "rows": [
    { "prompt": "How do I cancel my subscription?" },
    { "prompt": "What's the weather in Paris?" }
  ]
}
```

**Response body** (HTTP `200`):

```json
{
  "values": ["billing", "smalltalk"]
}
```

`values.len()` must equal `rows.len()` — a mismatch is treated as an error. Each row contains every declared argument under its argument `name`. Output values are decoded into the declared `returns` Arrow type using Arrow's JSON reader.

#### Remote `params:` knobs

| Parameter           | Default | Description                                                                                            |
| ------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `timeout`           | `30s`   | Per-call timeout. Accepts plain integer seconds or `Ns` / `Nms` suffix strings.                        |
| `batch_size`        | `1024`  | Maximum rows per HTTP request. Capped at `100 000`.                                                    |
| `batch_concurrency` | `4`     | Maximum in-flight HTTP batches per function invocation. Capped at `64`.                                |
| `auth_bearer`       | unset   | When set, the runtime adds `Authorization: Bearer <value>` to each request. Use `${secrets:...}`.       |

Calls to remote functions require the runtime to be configured with [`runtime.auth.api-key`](../reference/spicepod/runtime#runtimeauth) — they execute under the read-write API key context.

## Table Functions

Table functions (`kind: table`) return multiple rows and columns instead of a single scalar value. They are called using standard SQL table-function syntax: `SELECT ... FROM my_table_fn(args)`.

### Declaring a table function

Set `kind: table` and provide `returns` as a list of output columns (instead of a single type string):

```yaml
functions:
  - name: emit_pair
    from: sql
    kind: table
    description: Emit an input row and its successor.
    volatility: immutable
    signature:
      args: [{ name: x, type: int64 }]
      returns:
        - { name: value, type: int64 }
        - { name: doubled, type: int64 }
    body: |
      SELECT x AS value, x * 2 AS doubled FROM args
      UNION ALL
      SELECT x + 1 AS value, (x + 1) * 2 AS doubled FROM args
```

```sql
SELECT value, doubled FROM emit_pair(4) ORDER BY value;
-- value | doubled
-- ------+--------
--     4 |       8
--     5 |      10
```

### Key differences from scalar functions

| Aspect | Scalar | Table |
| --- | --- | --- |
| `kind:` | `scalar` (default) | `table` |
| `signature.returns:` | Single Arrow type string (e.g., `int64`) | List of `{name, type}` output columns |
| `body:` (SQL tier) | Single SQL expression | Full SQL `SELECT` query |
| LLM tool exposure | `as_tool: true` (default) | Always SQL-only |

### SQL body for table functions

The `body` of a SQL table function is a complete `SELECT` query (not an expression). Scalar arguments are exposed through a virtual one-row table named `args`:

```yaml
body: |
  SELECT x AS value, x * 2 AS doubled FROM args
```

The query's output columns must match the declared `returns` schema.

### Filter pushdown with args

Scalar args are inlined as literals before logical planning, so they participate in filter pushdown. This makes it possible to parameterize a table function against connectors that require concrete filter values — for example, the HTTP connector's `request_path`:

```yaml
functions:
  - name: hn_user
    from: sql
    kind: table
    signature:
      args:
        - { name: username, type: utf8 }
      returns:
        - { name: username, type: utf8 }
        - { name: karma, type: utf8 }
    body: |
      SELECT
        json_get_str(content, 'username') AS username,
        json_get_str(content, 'karma')    AS karma
      FROM raw_users
      WHERE request_path = concat('/users/', (SELECT username FROM args))
```

Calling `SELECT * FROM hn_user('pg')` resolves the `(SELECT username FROM args)` subquery to the literal `'pg'` before planning, so the resulting `WHERE request_path = '/users/pg'` predicate is pushed down to the HTTP connector.

### Wrapping search functions

A SQL table function can wrap the [search functions](../../reference/sql/search) — [`vector_search()`](../../reference/sql/search#vector-search-vector_search), [`text_search()`](../../reference/sql/search#full-text-search-text_search), and either of them nested inside [`rrf()`](../../reference/sql/search#reciprocal-rank-fusion-rrf) — passing its own argument through as the search query. This packages a hybrid-search query as one named, callable function:

```yaml
functions:
  - name: search_cookbook
    from: sql
    kind: table
    description: Hybrid search over the cookbook.
    signature:
      args:
        - { name: q, type: utf8 }
      returns:
        - { name: path, type: utf8 }
        - { name: content, type: utf8 }
    body: |
      SELECT path, content
      FROM rrf(
        vector_search(cookbook_files, q),
        text_search(cookbook_files, q, content)
      )
```

```sql
SELECT * FROM search_cookbook('how does hybrid search work') LIMIT 10;
```

Search functions need their query as a string literal while the plan is being built, which is earlier than the `args` table can supply a value. The runtime handles this by substituting the literal into the search function's query position before the body is planned. What that supports, and what it does not:

- **The argument must be a declared `utf8` argument, referenced by name.** `vector_search(docs, q)` resolves; an expression built from one — `vector_search(docs, concat(q, ' docs'))` — is not rewritten, and planning still rejects it with `Second argument must be a query string`. Compose the query text in the caller instead.
- **Both positional and `query =>` forms work.** `text_search(docs, query => q, column => body)` is accepted; the named query argument is moved into the second positional slot, which is where every search function reads it from.
- **Only the query position is rewritten.** Every other reference to a function argument in the body — a `WHERE` predicate, a `LIMIT`, a join key — still goes through the `args` table as described above.

## Volatility

Volatility tells the optimizer how the function behaves across calls. Pick the strongest level that's actually true — the default (`volatile`) is the safest but disables constant folding, query-level caching, and pushdown.

| Volatility  | Meaning                                                                | Optimizer behavior                                                     |
| ----------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `immutable` | Same inputs always yield the same output. E.g. `abs`, `upper`.         | May be constant-folded at plan time and cached aggressively.            |
| `stable`    | Stable within a single query but may change across queries. E.g. `now()`. | Cached per query, not constant-folded.                                  |
| `volatile`  | (default) Unpredictable on every call. E.g. `random()`.                | Never cached, never constant-folded, never pushed across executors.      |

Set volatility explicitly on every function — it strongly affects performance:

```yaml
functions:
  - name: shout
    from: sql
    volatility: immutable # opts into constant folding & caching
    signature:
      args: [{ name: s, type: utf8 }]
      returns: utf8
    body: 'upper(s)'
```

## Types

Argument and return types use Arrow logical types. Both Spicepod aliases and Arrow display forms are accepted.

**Scalar aliases:**

| Spicepod alias               | Arrow type                |
| ---------------------------- | ------------------------- |
| `int8` / `int16` / `int32` (or `int`) / `int64`     | `Int8` … `Int64`           |
| `uint8` / `uint16` / `uint32` / `uint64`           | `UInt8` … `UInt64`         |
| `float32` (or `float`) / `float64` (or `double`)   | `Float32`, `Float64`       |
| `utf8` (or `string`) / `large_utf8`                | `Utf8`, `LargeUtf8`        |
| `boolean` (or `bool`)                              | `Boolean`                  |
| `binary` / `large_binary`                          | `Binary`, `LargeBinary`    |
| `date32` / `date64`                                | `Date32`, `Date64`         |

**Complex types:**

| Spicepod alias               | Arrow type                                      |
| ---------------------------- | ----------------------------------------------- |
| `list<int64>`                | `List(Int64)`                                   |
| `large_list<utf8>`           | `LargeList(Utf8)`                               |
| `struct<name:utf8, age:int32>` | `Struct(name: Utf8, age: Int32)`             |
| `decimal(38, 10)`            | `Decimal128(38, 10)`                            |
| `decimal256(76, 20)`         | `Decimal256(76, 20)`                            |
| `timestamp(us, utc)`         | `Timestamp(Microsecond, Some("UTC"))`           |

The corresponding Arrow display forms (e.g. `Int64`, `List(Int64)`, `Decimal128(38, 10)`) are also accepted.

## Discovering registered functions

### From SQL

```sql
SELECT * FROM list_udfs() WHERE source = 'user';
```

The `list_udfs()` UDTF returns every function registered in the runtime, including built-ins. Filter by `source = 'user'` to see only declared functions:

| Column        | Description                                                           |
| ------------- | --------------------------------------------------------------------- |
| `name`        | Function identifier.                                                  |
| `source`      | `user` for declared functions, `builtin` for Spice/DataFusion ones.    |
| `kind`        | `scalar` or `table` for user functions, `NULL` for built-ins.         |
| `volatility`  | `immutable` / `stable` / `volatile`.                                  |
| `from`        | `sql`, `http://...`, or `https://...`.                                |
| `description` | The declared description, if any.                                     |

### From the HTTP API

```bash
curl http://localhost:8090/v1/functions
```

Returns a JSON array of user functions only (built-ins are excluded). Each entry includes `name`, `kind`, `volatility`, `from`, and `description`. The endpoint returns an empty array when `runtime.functions.enabled` is `false`.

## Functions as LLM tools

Every declared scalar function is automatically callable from LLMs as a tool with the same name and description. This lets a model reason in natural language and then invoke `haversine_km(...)` or `classify_intent(...)` directly. Table functions (`kind: table`) are always SQL-only and are not surfaced as LLM tools.

:::tip[Many functions? Use the Tool Registry]
A Spicepod with many functions can quickly cross the threshold where injecting every function definition into every chat turn becomes expensive. The [Tool Registry](../tool-registry/index.md) replaces individual tool definitions with searchable `tool_search` / `tool_invoke` meta-tools, typically saving ~10× the per-turn tool-definition tokens. Set `tools: auto` on the model and the registry kicks in automatically once the function count crosses the threshold.
:::

To keep a function SQL-only:

```yaml
functions:
  - name: internal_hash
    from: sql
    as_tool: false # Hidden from the tool registry; still callable from SQL
    signature:
      args: [{ name: x, type: int64 }]
      returns: int64
    body: 'x * 2654435761'
```

The reverse — a `tools:` entry that's also callable from SQL — is supported via `as_sql: true` on a tool. See [Tools Spicepod reference](../reference/spicepod/tools).

## Examples

### String normalization (SQL tier, immutable)

```yaml
functions:
  - name: shout
    from: sql
    volatility: immutable
    signature:
      args: [{ name: s, type: utf8 }]
      returns: utf8
    body: 'upper(s)'
```

```sql
SELECT shout('hello world'); -- "HELLO WORLD"
```

### Geospatial helper (SQL tier, immutable)

See `haversine_km` above. Because it is `immutable`, repeated calls with the same arguments are constant-folded.

### Remote ML classifier (Remote tier, volatile)

```yaml
functions:
  - name: classify_intent
    from: https://classifier.internal/v1/classify
    volatility: volatile
    signature:
      args: [{ name: prompt, type: utf8 }]
      returns: utf8
    params:
      timeout: 5s
      batch_size: 256
      auth_bearer: ${secrets:CLASSIFIER_TOKEN}
```

```sql
SELECT id, classify_intent(message) AS intent
FROM support_tickets
WHERE created_at >= now() - INTERVAL '1' DAY;
```

The runtime batches up to 256 rows per HTTP call and issues up to four batches in parallel.

### Returning a struct (SQL tier)

```yaml
functions:
  - name: split_full_name
    from: sql
    volatility: immutable
    signature:
      args: [{ name: full, type: utf8 }]
      returns: struct<first:utf8, last:utf8>
    body: |
      named_struct(
        'first', split_part(full, ' ', 1),
        'last',  split_part(full, ' ', 2)
      )
```

### List-typed arguments (SQL tier)

```yaml
functions:
  - name: total_quantity
    from: sql
    volatility: immutable
    signature:
      args: [{ name: quantities, type: list<int64> }]
      returns: int64
    body: 'array_sum(quantities)'
```

## Troubleshooting

| Symptom                                                            | Likely cause                                                                                  | Resolution                                                                                                  |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Function appears defined but `SELECT my_fn(...)` errors with "function not found" | `runtime.functions.enabled` is not set to `true`.                                              | Add `runtime.functions.enabled: true` to the spicepod.                                                       |
| `the from scheme '...' is unsupported`                             | `from:` is not `sql`, `http://`, or `https://`.                                                | Use one of the supported schemes.                                                                            |
| `body: and body_ref: are mutually exclusive`                       | Both fields are set on a SQL function.                                                         | Provide exactly one.                                                                                         |
| `failed to parse function body as a SQL expression`                 | The body is not a single valid DataFusion SQL expression.                                      | The body must be one expression (no statements), referencing arguments by name.                              |
| `body expression evaluates to type ... not coercible to declared return type ...` | The body's computed type doesn't match `returns:`.                                              | Adjust the body, declare a wider numeric `returns:`, or cast inside the body.                                  |
| Remote function returns `expected N values, got M`                  | The HTTP service returned the wrong number of `values`.                                        | The service must return exactly one value per input row, in input order.                                     |
| Remote function calls fail with auth errors                         | `runtime.auth.api-key` is not configured, or `auth_bearer` is missing/invalid.                 | Configure runtime auth and supply a valid bearer token via `${secrets:...}`.                                |
| Function registered but not surfaced as a tool                      | `as_tool: false` is set, or the function is `enabled: false`.                                  | Remove `as_tool: false`; ensure `enabled: true` (default).                                                   |
