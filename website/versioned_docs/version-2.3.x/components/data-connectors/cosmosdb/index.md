---
title: 'Azure Cosmos DB Data Connector'
sidebar_label: 'Azure Cosmos DB Data Connector'
description: 'Query Azure Cosmos DB (NoSQL / Core SQL API) containers as SQL tables in Spice. Read-only scan with schema inferred from a sample of documents.'
tags:
  - data-connectors
  - cosmosdb
  - azure
  - nosql
---

The Azure Cosmos DB Data Connector exposes Cosmos DB containers (NoSQL / Core SQL API) as SQL tables in Spice. The connector samples a configurable number of documents at startup, infers an Arrow schema, and streams documents into DataFusion for federated SQL queries alongside data from other connectors.

```yaml
datasets:
  - from: cosmosdb:store.products
    name: products
    params:
      cosmosdb_connection_string: ${secrets:COSMOSDB_CONNECTION_STRING}
```

## Configuration

### `from`

The `from` field takes the form `cosmosdb:{database}.{container}` or `cosmosdb:{database}/{container}`. The connector also accepts a bare `{container}` when `cosmosdb_database` is provided in `params`.

```yaml
datasets:
  - from: cosmosdb:store.orders
    name: orders
```

### `name`

The dataset name used as the table name within Spice. The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords).

### `params`

#### Authentication

Provide either a full Cosmos DB connection string (preferred) or the discrete `account_endpoint` + `account_key` pair. Secrets must be sourced from a [secret store](../secret-stores) in production.

| Parameter Name                 | Description                                                                                              | Required               |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- | ---------------------- |
| `cosmosdb_connection_string`   | Full connection string copied from the Azure portal. Takes precedence over `account_endpoint` / `account_key`. | Either this or both endpoint+key |
| `cosmosdb_account_endpoint`    | Account endpoint URL, e.g. `https://my-account.documents.azure.com:443/`.                                | When connection string isn't set |
| `cosmosdb_account_key`         | Primary or secondary account key.                                                                        | When connection string isn't set |

Microsoft Entra ID and managed-identity authentication are tracked as a post-RC enhancement and are not supported in the current release.

#### Data Shape

| Parameter Name                | Description                                                                                                                                          | Default            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `cosmosdb_database`           | Database name. When unset, parsed from the `from:` path (`database.container`).                                                                       | -                  |
| `query`                       | Cosmos SQL query used to scan the container. Useful when the container is large and only a subset should be surfaced as a dataset.                    | `SELECT * FROM c`  |
| `schema_infer_max_records`    | Number of documents sampled during schema inference at dataset registration. Larger samples produce a more precise schema at the cost of more RU consumption. | `100`              |

#### Resilience

The connector applies per-account concurrency limits, bounded retries with backoff, and a permanent-error latch that disables the connector account-wide on 401/403/404 responses.

| Parameter Name                | Description                                                                                                                                                                                          | Default        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `max_concurrent_requests`     | Maximum number of concurrent Cosmos DB requests per account endpoint, shared across all datasets pointing at the same account.                                                                       | `4`            |
| `http_max_retries`            | Maximum number of retries for transient errors (HTTP 429, 5xx, network) during the schema-inference pass at dataset registration. Retries honor `Retry-After` and `x-ms-retry-after-ms` headers.    | `3`            |
| `backoff_method`              | Backoff strategy between retries. `exponential` doubles the delay each attempt (capped at 30s); `fibonacci` follows the Fibonacci sequence (capped at 30s).                                          | `exponential`  |
| `disable_on_permanent_error`  | When `true`, a permanent error (401/403/404) latches the connector into a disabled state and short-circuits subsequent requests until Spice is restarted.                                            | `true`         |

See the [deployment guide](./deployment.md) for sizing, troubleshooting, and observability details.

## Authentication

### Connection String (recommended)

Copy the connection string from the Azure portal under **Settings → Keys** for the Cosmos DB account, then reference it from a secret store:

```yaml
datasets:
  - from: cosmosdb:store.products
    name: products
    params:
      cosmosdb_connection_string: ${secrets:COSMOSDB_CONNECTION_STRING}
```

### Explicit Endpoint and Key

When the endpoint and key are stored separately (for example in Key Vault), provide both:

```yaml
datasets:
  - from: cosmosdb:store.products
    name: products
    params:
      cosmosdb_account_endpoint: https://my-account.documents.azure.com:443/
      cosmosdb_account_key: ${secrets:COSMOSDB_ACCOUNT_KEY}
```

If both styles are supplied, the connection string takes precedence.

## Schema Inference

Cosmos DB has no native schema. At dataset registration the connector runs the configured `query` (default `SELECT * FROM c`) limited to `schema_infer_max_records` documents and hands the result to Arrow's JSON inference. The inferred schema is locked for the lifetime of the runtime process.

### JSON → Arrow type mapping

| Cosmos / JSON value         | Arrow type   | Notes                                                                                                                                            |
| --------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `"abc"`                     | `Utf8`       |                                                                                                                                                  |
| Integer (`42`, `-7`)        | `Int64`      | Widens to `Float64` if any sampled document contains a decimal value for the same field.                                                         |
| Floating (`3.14`, `1.0e9`)  | `Float64`    |                                                                                                                                                  |
| `true` / `false`            | `Boolean`    |                                                                                                                                                  |
| Object `{ ... }`            | `Struct`     | Nested objects are preserved as Arrow structs.                                                                                                   |
| Array `[ ... ]`             | `List`       | The element type is inferred from the first non-null item; heterogeneous arrays may surface as `Utf8` or require a wider sample to disambiguate. |
| All-null in sample          | `Null`       | Warn-dropped by default. Set `unsupported_type_action: string` to coerce to `Utf8`, or widen the sample so real values appear.                   |
| System fields (`_rid`, ...) | stripped     | The system fields `_rid`, `_self`, `_etag`, `_attachments`, and `_ts` are stripped and never appear in the dataset schema.                       |

Cosmos does not emit `Date`, `Time`, `Timestamp`, `Decimal`, or `Binary` natively — they round-trip as strings and should be handled with `CAST` at query time.

### Tuning Schema Inference

When optional fields are sparse in the first 100 documents but present in production data, increase `schema_infer_max_records`:

```yaml
datasets:
  - from: cosmosdb:store.orders
    name: orders
    params:
      cosmosdb_connection_string: ${secrets:COSMOSDB_CONNECTION_STRING}
      schema_infer_max_records: '500'
```

Each unit increase costs additional Request Units (RUs) at startup. Pin a schema explicitly via `columns:` for the most precise control.

## `unsupported_type_action`

Optional. Controls behavior for fields that infer as `DataType::Null` (every sampled document had `null` for the field). Defaults to `warn`.

- `error` — Fail dataset registration.
- `warn` — Log a warning and drop the column. (Default.)
- `ignore` — Silently drop the column.
- `string` — Coerce the column to `Utf8`.

```yaml
datasets:
  - from: cosmosdb:store.products
    name: products
    unsupported_type_action: string
    params:
      cosmosdb_connection_string: ${secrets:COSMOSDB_CONNECTION_STRING}
```

## Querying

After registering a dataset, query it like any other Spice table:

```sql
SELECT id, name, price
FROM products
WHERE price > 100
ORDER BY price DESC
LIMIT 10;
```

```sql
SELECT
  category,
  COUNT(*)   AS count,
  AVG(price) AS avg_price
FROM products
GROUP BY category
ORDER BY count DESC;
```

### Custom Cosmos SQL Queries

When the container is large and only a subset should be surfaced as a dataset, push the predicate to Cosmos with a custom `query`:

```yaml
datasets:
  - from: cosmosdb:store.orders
    name: active_orders
    params:
      cosmosdb_connection_string: ${secrets:COSMOSDB_CONNECTION_STRING}
      query: "SELECT * FROM c WHERE c.status = 'active'"
```

### Joins Across Containers

Cosmos DB does not support joins across containers. Spice federates joins between Cosmos-backed datasets (and any other connector) in the local DataFusion engine:

```sql
SELECT
  o.id    AS order_id,
  p.name  AS product_name,
  p.price AS unit_price
FROM active_orders o
JOIN products p ON o.product_id = p.id
LIMIT 50;
```

### Acceleration

Standard Spice acceleration (DuckDB, SQLite, Arrow in-memory, Cayenne) works on top of the Cosmos DB connector. Acceleration is recommended when the container is large or when query latency matters — it avoids per-query RU consumption against the Cosmos account.

```yaml
datasets:
  - from: cosmosdb:store.products
    name: products
    params:
      cosmosdb_connection_string: ${secrets:COSMOSDB_CONNECTION_STRING}
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      refresh_check_interval: 1h
```

## Limitations

- **Read-only**: Only `SELECT` scans are supported. Writes (`INSERT` / `UPDATE` / `DELETE`) are not implemented.
- **No filter / projection / limit pushdown into Cosmos**: SQL predicates are evaluated locally by DataFusion after the documents have been streamed in. Use the `query` parameter to narrow at the Cosmos side.
- **Schema is frozen at registration**: New fields added in Cosmos after startup are not picked up until the runtime restarts.
- **No change feed**: `acceleration.refresh_mode: changes` is not supported.
- **No native temporal / decimal / binary types**: Cosmos stores everything as JSON. Round-trip these as strings and `CAST` in SQL.
- **Microsoft Entra ID / managed identity not supported**: Use account keys via connection string or `account_endpoint` + `account_key`.

## Cookbook

A copy-pasteable example Spicepod is in the runtime repo at [`examples/cosmosdb-connector/`](https://github.com/spiceai/spiceai/tree/trunk/examples/cosmosdb-connector).
