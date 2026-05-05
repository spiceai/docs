---
title: 'Elasticsearch Vector Engine'
sidebar_label: 'Elasticsearch'
description: 'Use Elasticsearch as a vector engine in Spice for kNN vector search, full-text search, and hybrid search.'
sidebar_position: 2
pagination_next: null
---

Elasticsearch can be used as a vector engine in Spice to store embeddings and execute kNN similarity search, full-text search (BM25), and hybrid search (RRF) natively in the Elasticsearch cluster. This is useful when Elasticsearch is already the system of record for a workload, or when the operational characteristics of a managed Elasticsearch cluster (replication, sharding, snapshots) are preferred over a dedicated vector store.

Unlike the [Elasticsearch Data Connector](../data-connectors/elasticsearch), which reads an existing Elasticsearch index as a Spice dataset, the Elasticsearch vector engine accepts data from any Spice data connector, generates embeddings using the configured embedding model, and writes vectors (and source fields) to an Elasticsearch index that Spice manages.

```yaml
datasets:
  - from: file:products.parquet
    name: products
    acceleration:
      enabled: true
    vectors:
      enabled: true
      engine: elasticsearch
      params:
        elasticsearch_endpoint: https://localhost:9200
        elasticsearch_user: ${secrets:es_user}
        elasticsearch_pass: ${secrets:es_pass}
        elasticsearch_index: products-embeddings
    columns:
      - name: description
        embeddings:
          - from: bedrock_titan

embeddings:
  - from: bedrock:amazon.titan-embed-text-v2:0
    name: bedrock_titan
    params:
      aws_region: us-east-2
      dimensions: '1024'
```

:::note[Enterprise edition]
The Elasticsearch vector engine is available in the Spice [Enterprise edition](https://docs.spice.ai/docs/enterprise/getting-started/distributions).
:::

## Parameters

| Parameter                | Description                                                                                                          | Example Value                 |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `elasticsearch_endpoint` | Required. Cluster URL.                                                                                               | `https://localhost:9200`      |
| `elasticsearch_user`     | Optional. Username for HTTP basic authentication.                                                                    | `${secrets:es_user}`          |
| `elasticsearch_pass`     | Optional. Password for HTTP basic authentication.                                                                    | `${secrets:es_pass}`          |
| `elasticsearch_index`    | Optional. Index used to store vectors. Defaults to a sanitized `{dataset}-{column}-{model}` value.                   | `products-embeddings`         |
| `elasticsearch_vector_field` | Optional. Name of the `dense_vector` field in Elasticsearch. Defaults to `{column}_embedding`.                   | `description_embedding`       |
| `elasticsearch_distance_metric` | Optional. Vector similarity metric for kNN search. One of: `cosine`, `l2_norm`, `dot_product`, `max_inner_product`. | `cosine`               |
| `elasticsearch_hnsw_m`  | Optional. HNSW graph parameter `m` (links per node). Higher values improve recall at the cost of more memory. Elasticsearch default: `16`. | `16`                  |
| `elasticsearch_hnsw_ef_construction` | Optional. HNSW build parameter `ef_construction` (candidate list size at build time). Elasticsearch default: `100`. | `100`              |
| `client_timeout`         | Optional. Total request timeout for the Elasticsearch HTTP client, in time unit format. Default: `30s`.              | `30s`                         |
| `connect_timeout`        | Optional. Connect timeout for the Elasticsearch HTTP client, in time unit format. Default: `10s`.                    | `10s`                         |
| `elasticsearch_max_retries` | Optional. Maximum retry attempts for transient Elasticsearch errors (HTTP 429 / 5xx). Default: `3`.              | `3`                           |
| `elasticsearch_retry_initial_backoff` | Optional. Initial backoff duration between retries, in time unit format. Default: `200ms`.                | `200ms`                       |
| `elasticsearch_batch_write_rows` | Optional. Maximum rows per Elasticsearch `_bulk` request. Controls memory usage and payload size during writes. Default: `1000`. | `1000`       |

:::warning[Not yet supported]
The Elasticsearch vector engine does **not** currently support:

- `partition_by` — Partitioned vector indexes. Setting this parameter (or the dataset-level `vectors.partition_by`) returns a configuration error at startup. Use the [S3 Vectors](./s3_vectors) engine for partitioned workloads.
- `spill_writes` — Spilling writes to disk for backpressure. Setting `spill_writes: true` returns a configuration error at startup.

Remove these parameters from the `vectors:` block, or choose a different vector engine.
:::

## Overview

When configured as a vector engine, Spice:

1. Reads data from the underlying connector (for example, Parquet on disk or a federated SQL source).
2. Computes embeddings on the configured column using the attached embedding model.
3. Writes vectors and source fields to the configured Elasticsearch index, provisioning the index mapping when needed (`dense_vector` of the correct dimension plus text fields for full-text search).
4. At query time, routes `vector_search`, `text_search`, and `rrf` against the Elasticsearch index using native kNN and BM25 queries.

Source fields on the dataset are indexed as `text` in Elasticsearch so they can be used as full-text search targets. Primary key columns are indexed as `keyword` and included in kNN results so that matches can be joined back to the Spice base table when additional columns are requested.

:::warning[Limitations]

- A dataset or view must be accelerated (`datasets[].acceleration.enabled: true`) for the vector engine to be provided the appropriate data to ingest. See [`acceleration.enabled`](../../reference/spicepod/datasets#accelerationenabled).
- The dataset must have a resolvable primary key, either via the underlying schema or an explicit [`row_id`](../../reference/spicepod/datasets#columnsembeddingsrow_id).
- Elasticsearch kNN uses approximate nearest neighbors and returns probabilistically closest results.

:::

## Configuration

### Embedding Models

Any embedding model supported by Spice can be used to produce the vectors written to Elasticsearch, including local models via [Hugging Face](../embeddings/huggingface), hosted models via [OpenAI](../embeddings/openai), [Bedrock](../embeddings/bedrock), and others. The vector dimension is inferred from the embedding model and used to provision the Elasticsearch `dense_vector` field.

```yaml
embeddings:
  - from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2
    name: local_embedding_model
```

### Primary Keys

Spice requires a primary key to round-trip matches between Elasticsearch and the base dataset. If the source dataset does not carry primary key metadata, specify it on the column embedding:

```yaml
columns:
  - name: description
    embeddings:
      - from: local_embedding_model
        row_id: product_id
```

### Custom Index and Vector Field Names

By default the index name is a sanitized `{dataset}-{column}-{model}` and the vector field is `{column}_embedding`. Override either with `elasticsearch_index` and `elasticsearch_vector_field`:

```yaml
vectors:
  enabled: true
  engine: elasticsearch
  params:
    elasticsearch_endpoint: https://localhost:9200
    elasticsearch_index: products-vectors-v2
    elasticsearch_vector_field: desc_vec
```

## Querying

Vector, full-text, and hybrid search use the standard Spice UDTFs. When the dataset is backed by the Elasticsearch vector engine, these UDTFs compile to native Elasticsearch queries rather than local computation.

### Vector Search

```sql
SELECT product_id, name, score
FROM vector_search(products, 'wireless noise cancelling headphones')
ORDER BY score DESC
LIMIT 10;
```

The query text is embedded with the configured embedding model and sent to Elasticsearch as a kNN query. By default the number of candidates considered by Elasticsearch is twice the requested `k`.

### Full-Text Search

Any `Utf8`/`LargeUtf8` column on the dataset is available as a full-text search target:

```sql
SELECT product_id, name, score
FROM text_search(products, 'bluetooth waterproof', description)
ORDER BY score DESC
LIMIT 10;
```

### Hybrid Search (RRF)

Combine vector and full-text results with [Reciprocal Rank Fusion](../../reference/sql/search#reciprocal-rank-fusion-rrf):

```sql
SELECT product_id, name, fused_score
FROM rrf(
  vector_search(products, 'wireless noise cancelling headphones'),
  text_search(products, 'bluetooth waterproof', description),
  join_key => 'product_id'
)
ORDER BY fused_score DESC
LIMIT 10;
```

Advanced RRF options — per-query `rank_weight`, recency decay, and custom smoothing `k` — work identically regardless of the underlying vector engine. See [RRF](../../reference/sql/search#reciprocal-rank-fusion-rrf) for the full reference.

## Authentication

When `elasticsearch_user` and `elasticsearch_pass` are provided, the vector engine uses HTTP basic authentication. Prefer storing credentials in a [secret store](../secret-stores) and referencing them with `${secrets:...}`. TLS is enabled automatically for `https://` endpoints.

## Comparison with the Data Connector

| Use case                                                                 | Use                                                                       |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Query an existing Elasticsearch index (with or without `dense_vector`).  | [Elasticsearch Data Connector](../data-connectors/elasticsearch).         |
| Ingest data from another source and have Spice manage vectors in ES.    | Elasticsearch Vector Engine (this page).                                  |

Both paths surface `vector_search`, `text_search`, and `rrf`; pick the one that matches which system owns the data.
