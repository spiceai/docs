---
title: 'Elasticsearch Data Connector'
sidebar_label: 'Elasticsearch Data Connector'
description: 'Query Elasticsearch indexes as SQL tables in Spice, including kNN vector search, full-text search, and hybrid search.'
tags:
  - data-connectors
  - elasticsearch
  - search
---

The Elasticsearch Data Connector exposes Elasticsearch indexes as SQL tables in Spice. Index mappings are translated to Arrow schemas so that documents can be queried with federated SQL alongside data from other connectors. The connector also bridges Elasticsearch's native kNN and full-text search into Spice, enabling [hybrid search](../../features/search) through the standard `vector_search`, `text_search`, and `rrf` UDTFs.

```yaml
datasets:
  - from: elasticsearch:products
    name: products
    params:
      elasticsearch_endpoint: https://localhost:9200
      elasticsearch_user: ${secrets:es_user}
      elasticsearch_pass: ${secrets:es_pass}
```

:::note[Enterprise edition]
The Elasticsearch connector is available in the Spice [Enterprise edition](https://docs.spice.ai/docs/enterprise/getting-started/distributions).
:::

## Configuration

### `from`

The `from` field takes the form `elasticsearch:{index_name}` where `index_name` is the Elasticsearch index to query.

```yaml
datasets:
  - from: elasticsearch:products
    name: products
```

Dot-separated paths may be used to refer to nested fields in query results (e.g. `address.city`); the connector flattens object mappings into Arrow columns using that convention.

### `name`

The dataset name used as the table name within Spice. The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords).

### `params`

The Elasticsearch connector accepts the following `params`. Use the [secret replacement syntax](../secret-stores) to load credentials from a secret store.

| Parameter Name           | Description                                                   | Required | Default |
| ------------------------ | ------------------------------------------------------------- | -------- | ------- |
| `elasticsearch_endpoint` | Cluster URL (e.g., `https://localhost:9200`).                 | Yes      | -       |
| `elasticsearch_user`     | Username for HTTP basic authentication.                       | No       | -       |
| `elasticsearch_pass`     | Password for HTTP basic authentication.                       | No       | -       |

## Types

The connector derives an Arrow schema from each index's mapping via `GET /<index>/_mapping`. Elasticsearch field types map to Arrow as follows:

| Elasticsearch Field Type                                         | Arrow Type                           | Notes                                                       |
| ---------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------- |
| `text`, `keyword`, `wildcard`, `constant_keyword`, `match_only_text` | `Utf8`                            |                                                             |
| `long`                                                           | `Int64`                              |                                                             |
| `unsigned_long`                                                  | `UInt64`                             | Accepts both numeric values and digit strings (JS clients commonly serialize values > 2<sup>53</sup>-1 as strings). |
| `integer`                                                        | `Int32`                              |                                                             |
| `short`                                                          | `Int16`                              |                                                             |
| `byte`                                                           | `Int8`                               |                                                             |
| `double`                                                         | `Float64`                            |                                                             |
| `float`, `half_float`, `scaled_float`                            | `Float32`                            |                                                             |
| `boolean`                                                        | `Boolean`                            |                                                             |
| `date`, `date_nanos`                                             | `Utf8`                               | ES dates are flexibly formatted; preserved as strings.      |
| `binary`                                                         | `Utf8`                               | Base64-encoded in the JSON response.                        |
| `ip`                                                             | `Utf8`                               |                                                             |
| `dense_vector` (with `dims`)                                     | `FixedSizeList<Float32, dims>`       | Required `dims` field must fit in `i32`.                    |
| `dense_vector` (missing `dims`)                                  | `Utf8`                               | Falls back to raw JSON when dims cannot be resolved.        |
| `object` (with sub-fields)                                       | _(flattened)_                        | Expanded into dot-separated columns (e.g. `address.city`).  |
| `object` (no sub-fields), `nested`                               | `Utf8`                               | Serialized JSON.                                            |
| Any other mapping type                                           | `Utf8`                               | Fallback — the raw JSON value is preserved as a string.     |

Nested `object` fields are flattened by concatenating field names with dots (e.g. `address.city`). `nested` fields are preserved as JSON strings because per-document ordering must be retained.

## Querying

After registering a dataset, query it like any other Spice table:

```sql
SELECT name, price
FROM products
WHERE price > 100
ORDER BY price DESC
LIMIT 10;
```

### Vector and Full-Text Search

When an index contains a `dense_vector` field, the Elasticsearch connector wires it into Spice's search pipeline. This enables:

- **Vector similarity search** via [`vector_search`](../../reference/sql/search#vector-search-vector_search) — executed natively as an Elasticsearch kNN query.
- **Full-text search** via [`text_search`](../../reference/sql/search#full-text-search-text_search) — executed using Elasticsearch's native BM25 ranking.
- **Hybrid search** via [`rrf`](../../reference/sql/search#reciprocal-rank-fusion-rrf) — combining both with Reciprocal Rank Fusion.

These operations run against the Elasticsearch cluster directly rather than ingesting vectors into an accelerator, keeping indexing and search colocated in Elasticsearch.

Example:

```sql
-- kNN vector search against Elasticsearch
SELECT product_id, name, score
FROM vector_search(products, 'wireless noise cancelling headphones')
ORDER BY score DESC
LIMIT 10;

-- BM25 full-text search
SELECT product_id, name, score
FROM text_search(products, 'headphones waterproof', description)
ORDER BY score DESC
LIMIT 10;

-- Hybrid search via RRF
SELECT product_id, name, fused_score
FROM rrf(
  vector_search(products, 'wireless noise cancelling headphones'),
  text_search(products, 'headphones waterproof', description),
  join_key => 'product_id'
)
ORDER BY fused_score DESC
LIMIT 10;
```

See [Search Functionality](../../features/search) for the full search feature guide.

## Authentication

The connector uses HTTP basic authentication when `elasticsearch_user` and `elasticsearch_pass` are provided. For production deployments, store credentials in a [secret store](../secret-stores) and reference them with `${secrets:...}` rather than hard-coding them in `spicepod.yaml`.

TLS is enabled automatically for `https://` endpoints.

## Limitations

- Nested object fields are exposed as JSON strings rather than structured columns.
- `date` and `date_nanos` fields are preserved as strings because Elasticsearch accepts heterogeneous date formats; cast to a timestamp in SQL when numeric comparison is required.
- `dense_vector` fields without a declared `dims` value fall back to `Utf8` and are not usable as a vector column.
- For queries with `LIMIT N` where N ≤ 10,000, the connector issues a single `_search` request. For larger result sets or queries without `LIMIT`, the connector automatically paginates using Point-In-Time (PIT) + `search_after`, fetching all matching documents in 10,000-hit batches.
- Pushdown of SQL predicates to Elasticsearch query DSL is limited; complex filter expressions are evaluated locally by DataFusion after fetching results.

Elasticsearch can also be configured as a [Vector Engine](../vectors/elasticsearch) for datasets sourced from other connectors (storing Spice-managed embeddings in Elasticsearch rather than querying an existing index).

## Cookbook

- A cookbook recipe to configure Elasticsearch as a data connector in Spice. [Elasticsearch Data Connector](https://github.com/spiceai/cookbook/tree/trunk/elasticsearch/connector#readme)
