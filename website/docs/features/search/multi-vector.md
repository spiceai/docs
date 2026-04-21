---
title: 'Multi-Vector Search'
sidebar_label: 'Multi-Vector Search'
description: 'Embed list-of-strings columns as a column of vectors and use ColBERT-style late-interaction search in Spice.'
sidebar_position: 3
tags:
  - search
  - embeddings
  - models
---

A multi-vector column stores many embedding vectors per row rather than a single vector. Spice produces a multi-vector column by embedding each element of a `List<Utf8>` source column independently, yielding a `List<FixedSizeList<Float32, N>>` embedding column.

Multi-vector embeddings are useful when a single row has several distinct pieces of text — for example, a product with many tags, a paper with multiple titles and section headings, or a user with a set of historical queries. Each element is embedded and scored separately, and per-row results are produced by aggregating the per-element similarities.

## How Multi-Vector Differs from Chunking

Chunking splits one long string (such as a document body) into pieces and embeds each piece. Multi-vector starts from a column that is already a list of independent strings and embeds each list element as-is.

| Source column type | Embedding mode         | Produced embedding type           |
| ------------------ | ---------------------- | --------------------------------- |
| `Utf8`             | Scalar (default)       | `FixedSizeList<Float32, N>`       |
| `Utf8` + chunking  | Chunked                | `List<FixedSizeList<Float32, N>>` |
| `List<Utf8>`       | Multi-vector (default) | `List<FixedSizeList<Float32, N>>` |

Multi-vector and chunked columns share the same Arrow type, but the per-element offsets column (`<column>_offsets`) is only produced for chunked columns.

## Configuring a Multi-Vector Column

Define an embedding on a `List<Utf8>` column the same way as a scalar string column. Spice detects the list type and embeds each element independently.

```yaml
datasets:
  - from: file:products.parquet
    name: products
    acceleration:
      enabled: true
    columns:
      - name: tags              # List<Utf8>
        embeddings:
          - from: local_embedding_model
            aggregation: max
            max_elements_per_row: 64

embeddings:
  - from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2
    name: local_embedding_model
```

### Aggregation Strategies

When a multi-vector column is queried with a single query string, each element's similarity to the query is computed, and the per-row score is the aggregate of those similarities.

| `aggregation` | Description                                                                        |
| ------------- | ---------------------------------------------------------------------------------- |
| `max`         | ColBERT-style `MaxSim`. Row scores as high as its best-matching element (default). |
| `mean`        | Average similarity across elements. Favors rows where most elements are relevant.  |
| `sum`         | Sum of similarities. Biases toward rows with many matching elements.               |

### Element Caps

Multi-vector columns default to embedding the first 32 elements per row. Raise the cap with `max_elements_per_row` (hard-capped at `1024`). Excess elements are dropped with a warning log so that rows with unbounded tag counts do not blow up embedding cost.

## Querying with `vector_search`

A multi-vector column is queried with the standard `vector_search` UDTF. The configured `aggregation` is applied automatically.

```sql
SELECT product_id, name, score
FROM vector_search(products, 'travel accessories', tags)
ORDER BY score DESC
LIMIT 10;
```

## Late-Interaction (Multi-Query) Search

Multi-vector columns also support ColBERT-style late-interaction search, where the query itself is an array of strings. Each query is embedded independently, the best-matching element is selected for each query (`MaxSim`), and the per-row score is the sum across queries:

```text
score(d) = Σ_{q ∈ Q} max_{e ∈ d} cos(q, e)
```

```sql
SELECT product_id, name, score
FROM vector_search(
  products,
  ['hiking', 'waterproof', 'lightweight'],
  tags
)
ORDER BY score DESC
LIMIT 10;
```

Late-interaction search is only supported on multi-vector columns; passing an array of queries to a scalar or chunked column returns an error. A maximum of 32 query strings are accepted per call.

## Passthrough Multi-Vector Columns

Datasets that already contain multi-vector columns can be used directly when their schema matches the conventions in [Vector-Based Search](vector-search#using-existing-embeddings):

- Column name: `<original_column>_embedding`
- Type: `List<FixedSizeList<Float32 or Float64, N>>`
- No offsets column (that is only required for chunked scalar columns)

Declare the underlying column's embedding in `spicepod.yaml` so that Spice knows which embedding model the existing vectors came from.

## Limitations

- Multi-vector embeddings require the source column to be `List<Utf8>` or `LargeList<Utf8>`.
- Late-interaction search accepts at most 32 query strings per call.
- Multi-vector columns cannot currently be stored in an external vector engine; use a [data accelerator](../../components/data-accelerators) with `acceleration.enabled: true` to cache embeddings.
