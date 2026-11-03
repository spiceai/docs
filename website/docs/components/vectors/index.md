---
title: 'Vector Engines'
sidebar_label: 'Vector Engines'
description: 'Configure vector engines for efficient embedding storage and similarity search in Spice.'
sidebar_position: 8
pagination_prev: null
pagination_next: null
---

> 🎓 Learn how it works with the [Amazon S3 Vectors with Spice](https://spice.ai/blog/getting-started-with-amazon-s3-vectors-and-spice) engineering blog post.

Data sourced by Data Connectors, or views built atop them with vector embedding columns can be indexed and efficiently searched using a vector engine.

A vector engine will store all vector embeddings associated with columns in a dataset/view, provide efficient vector search operations and avoid unnecessary recomputation of embeddings.

A vector engine is configured by setting the `vectors` configuration. E.g.

```yaml
datasets:
  - name: dataset_with_embeddings
    vectors:
      enabled: true
```

For the complete reference specification see [datasets](../reference/spicepod/datasets).

Supported Vector engines:

| Name                             | Description                         |
| -------------------------------- | ----------------------------------- |
| [`s3_vectors`][s3vectors]        | AWS S3 vectors                      |
| [`elasticsearch`][elasticsearch] | Elasticsearch (Spice.ai Enterprise) |

## Choosing an engine

The engines differ in where the index lives:

- **External engines**, for high-QPS serving where the index lives outside the Spice process and survives a restart of it. [S3 Vectors](./vectors/s3_vectors#handling-filters) stores vectors in S3 and pushes predicates on columns marked `metadata.vectors: filterable` into the index query. [Elasticsearch](./vectors/elasticsearch) keeps the kNN index in the cluster (and can combine it with full-text in that cluster).
- **No vector engine**, when the dataset or view is accelerated with [Spice Cayenne](../data-accelerators/cayenne/index.md). Cayenne indexes embedding columns for `vector_search` itself, without a `vectors` block. Its index is exact: it scores every candidate row, so query time grows with the rows searched.

The DuckDB vector engine (`vectors.engine: duckdb`) is removed in v2.5. See [Migrating the DuckDB vector engine](../data-accelerators/cayenne/migration.md#migrating-the-duckdb-vector-engine).

Add vector search only when semantic retrieval is required. Hybrid retrieval ([`rrf`](../reference/sql/search#reciprocal-rank-fusion-rrf) over `vector_search` and `text_search`) is for queries that need both semantic and literal matches. Otherwise stay on SQL, regex, or [full-text search](../features/search/full-text). See [Where indexes are built](../features/search#where-indexes-are-built).

[s3vectors]: /docs/components/vectors/s3_vectors.md
[elasticsearch]: /docs/components/vectors/elasticsearch.md

:::warning[Limitations]

- A dataset or view must be accelerated (i.e. `datasets[].acceleration.enabled: true`, see [docs](../reference/spicepod/datasets#accelerationenabled)) for a vector engine to be provided the appropriate data to ingest.

  :::

## Vector Engine Docs

import DocCardList from '@theme/DocCardList';

<DocCardList />
