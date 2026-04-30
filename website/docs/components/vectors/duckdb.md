---
title: 'DuckDB Vector Engine'
sidebar_label: 'DuckDB'
description: 'Use DuckDB as a vector engine in Spice for HNSW-based vector search via the DuckDB VSS extension.'
sidebar_position: 3
pagination_next: null
---

DuckDB can be used as a vector engine in Spice to store embeddings and execute vector similarity search using HNSW indexes via the [DuckDB VSS](https://duckdb.org/docs/extensions/vss) extension. This is useful when a dataset is already accelerated with DuckDB and a fully embedded, single-process vector store is preferred over an external service.

The DuckDB vector engine requires the dataset to be accelerated with the [DuckDB accelerator](../data-accelerators/duckdb). Spice computes embeddings on the configured columns during refresh and write, stores them in the DuckDB accelerator alongside the source data, and creates an HNSW index that is used to answer `vector_search` and `/v1/search` queries.

```yaml
datasets:
  - from: file:products.parquet
    name: products
    acceleration:
      enabled: true
      engine: duckdb
    vectors:
      enabled: true
      engine: duckdb
      params:
        duckdb_distance_metric: cosine
        duckdb_hnsw_m: '16'
        duckdb_hnsw_ef_construction: '128'
        duckdb_hnsw_ef_search: '64'
    columns:
      - name: description
        embeddings:
          - from: local_embedding_model

embeddings:
  - from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2
    name: local_embedding_model
```

## Parameters

| Parameter                     | Description                                                                                                                                                  | Default  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| `duckdb_distance_metric`      | Optional. Vector similarity metric. Accepts `cosine`, `l2` (or `l2_norm` / `euclidean` / `l2sq`), or `inner_product` (or `ip` / `dot` / `dot_product`).      | `cosine` |
| `duckdb_metric`               | Optional. Alias for `duckdb_distance_metric`. `duckdb_distance_metric` takes precedence when both are set.                                                   | —        |
| `duckdb_hnsw_m`               | Optional. HNSW graph parameter `m` — the number of bidirectional links per node. Higher values improve recall at the cost of index size and build time.     | DuckDB VSS default |
| `duckdb_hnsw_ef_construction` | Optional. HNSW build-time parameter — the size of the dynamic candidate list during index construction. Higher values improve recall at the cost of build time. | DuckDB VSS default |
| `duckdb_hnsw_ef_search`       | Optional. HNSW query-time parameter — the size of the dynamic candidate list during search. Higher values improve recall at the cost of query latency.     | DuckDB VSS default |

## Configuring HNSW Indexes via the `embeddings` Syntax

When a dataset is accelerated with DuckDB and has embedding columns configured, the DuckDB vector engine can be enabled implicitly by placing HNSW parameters directly on the DuckDB accelerator's `params`. This avoids the separate `vectors:` block when an HNSW index is the only vector-engine configuration needed.

```yaml
datasets:
  - from: file:products.parquet
    name: products
    acceleration:
      enabled: true
      engine: duckdb
      params:
        duckdb_distance_metric: cosine
        duckdb_hnsw_m: '16'
        duckdb_hnsw_ef_construction: '128'
        duckdb_hnsw_ef_search: '64'
    columns:
      - name: description
        embeddings:
          - from: local_embedding_model
```

Spice detects the HNSW parameters on the accelerator config and automatically attaches a DuckDB vector engine to the dataset. The recognized keys are `duckdb_distance_metric` (or `duckdb_metric`), `duckdb_hnsw_m`, `duckdb_hnsw_ef_construction`, and `duckdb_hnsw_ef_search`; any non-vector accelerator parameters are passed through to DuckDB unchanged.

The two configurations are equivalent:

- **`embeddings` syntax** — HNSW params on `acceleration.params`. Inferred when the dataset has DuckDB acceleration and at least one recognized HNSW parameter.
- **`vectors` block** — `vectors.engine: duckdb` with HNSW params on `vectors.params`. Required if the engine name needs to be set explicitly or to disable the vector engine without removing the HNSW parameters.

If both are set, the explicit `vectors:` block takes precedence.

## Overview

When configured as a vector engine, Spice:

1. Reads data from the underlying connector (for example, Parquet on disk or a federated SQL source).
2. Computes embeddings on the configured column(s) using the attached embedding model.
3. Writes vectors and source rows to the DuckDB accelerator alongside the rest of the dataset.
4. Maintains a DuckDB VSS HNSW index on the embedding column. For full-refresh datasets the index is rebuilt after each refresh; for append/CDC datasets the index is auto-maintained by DuckDB VSS as rows are inserted.
5. At query time, routes `vector_search` and `/v1/search` against the DuckDB accelerator, computing similarity natively in DuckDB.

The DuckDB VSS extension is installed and loaded automatically by the runtime; no manual setup is required.

:::warning[Limitations]

- A dataset or view must be accelerated with the DuckDB accelerator (`datasets[].acceleration.engine: duckdb`) for the DuckDB vector engine to be used.
- The dataset must have a resolvable primary key, either via the underlying schema or an explicit [`row_id`](../../reference/spicepod/datasets#columnsembeddingsrow_id).
- [Chunking](../../reference/spicepod/datasets#columns-embeddings-chunking) is not yet supported for the DuckDB vector engine.
- `partition_by` is not yet supported for the DuckDB vector engine.
- `spill_writes` is not supported for the DuckDB vector engine.
- DuckDB VSS uses approximate nearest neighbor search and returns probabilistically closest results.

:::

## Configuration

### Embedding Models

Any embedding model supported by Spice can be used to produce the vectors stored in DuckDB, including local models via [Hugging Face](../embeddings/huggingface) and hosted models via [OpenAI](../embeddings/openai), [Bedrock](../embeddings/bedrock), and others. The vector dimension is inferred from the embedding model and used to size the DuckDB embedding column.

```yaml
embeddings:
  - from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2
    name: local_embedding_model
```

### Primary Keys

Spice requires a primary key to round-trip matches between the HNSW index and the base dataset. If the source dataset does not carry primary key metadata, specify it on the column embedding:

```yaml
columns:
  - name: description
    embeddings:
      - from: local_embedding_model
        row_id: product_id
```

### Distance Metric

The distance metric controls how similarity is computed between query and stored vectors. Pick the metric that matches how your embedding model is trained:

- `cosine` (default) — cosine similarity. Appropriate for most text embedding models.
- `l2` — Euclidean (L2) distance. Aliases: `l2_norm`, `euclidean`, `l2sq`.
- `inner_product` — dot-product similarity. Aliases: `ip`, `dot`, `dot_product`, `max_inner_product`.

```yaml
vectors:
  enabled: true
  engine: duckdb
  params:
    duckdb_distance_metric: inner_product
```

### HNSW Tuning

The `duckdb_hnsw_m`, `duckdb_hnsw_ef_construction`, and `duckdb_hnsw_ef_search` parameters control the trade-off between recall, index size, build time, and query latency. When unset, Spice defers to the DuckDB VSS defaults. See the [DuckDB VSS documentation](https://duckdb.org/docs/extensions/vss) for guidance on tuning these values.

## Querying

Vector search uses the standard Spice search surfaces. When the dataset is backed by the DuckDB vector engine, both `vector_search` and `/v1/search` execute natively in DuckDB using the HNSW index.

### Vector Search

```sql
SELECT product_id, name, score
FROM vector_search(products, 'wireless noise cancelling headphones')
ORDER BY score DESC
LIMIT 10;
```

The query text is embedded with the configured embedding model and used as the probe vector for the HNSW index.

### Search HTTP API

```shell
curl -X POST http://localhost:8090/v1/search \
  -H 'Content-Type: application/json' \
  -d '{
    "datasets": ["products"],
    "text": "wireless noise cancelling headphones",
    "additional_columns": ["name"],
    "limit": 10
  }'
```

For the full reference, see [Vector Search](../../features/search/vector-search) and [Search API Reference](../../api/HTTP/post-search).
