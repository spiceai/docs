---
title: 'Search '
sidebar_label: 'Search'
description: 'Learn how Spice can search across datasets.'
sidebar_position: 8
pagination_prev: null
pagination_next: null
---

Spice offers powerful search functionality above the in-built SQL query capabilities.

As a full feature SQL database, spice offers basic search patterns directly in SQL.

```sql
SELECT id, text_column
FROM my_table
WHERE
    LOWER(text_column) LIKE '%search_term%'
  AND
    date_published > '2021-01-01'
```

## Vector Search

Beyond SQL, Spice provides powerful vector-based search functionality. The runtime has support for both:
  1. Local embedding models, e.g. [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2).
  2. Remote embedding providers e.g. [Open AI](https://platform.openai.com/docs/api-reference/embeddings/create).

Embedding models are a first-class component in a `spicepod.yaml`

```yaml
embeddings:
  - from: openai
    name: remote_service
    params:
      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }

  - name: i_run_locally
    from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2
```

With this, datasets can be augmented to have embeddings created for specific columns.

```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/issues
    name: spiceai.issues
    acceleration:
      enabled: true
    embeddings:
      - column: body # Text column in `spiceai.issues` dataset
        use: i_run_locally # Embedding model to use
```

With this, Spice can perform similarity searches against this dataset.

```shell
curl -XPOST http://localhost:8090/v1/search \
  -H 'Content-Type: application/json' \
  -d '{
    "datasets": ["spiceai.issues"],
    "text": "cutting edge AI",
    "where": "author=\"jeadie\"",
    "additional_columns": ["title", "state"],
    "limit": 2
  }'
```

See [/v1/search](/api/http/search) for API reference.

### Chunking

Spice supports chunking a table's column prior to being embedded. This is useful for large text columns (e.g. [Document Tables](/components/data-connectors/index.md#document-support)), where a small part of the content may be relevant to the query. Chunking is also configured in the dataset.

```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/issues
    name: spiceai.issues
    acceleration:
      enabled: true
    embeddings:
      - column: body
        use: i_run_locally
        chunking:
          enabled: true
          target_chunk_size: 512
```

The `body` column will automatically be divided into chunks close to 512 tokens, whilst keeping structural and semantic integrity (e.g. not splitting within a sentence).

#### Document Retrieval

For [vector-based search endpoints](/api/http/search), datasets with chunking [enabled](/reference/spicepod/datasets.md) only return the most relevant chunk for each match.

To retrieve the entire column, provide the embedding column into the `additional_columns` list. For example:

```shell
curl -XPOST http://localhost:8090/v1/search \
  -H 'Content-Type: application/json' \
  -d '{
    "datasets": ["spiceai.issues"],
    "text": "cutting edge AI",
    "where": "array_has(assignees, \"jeadie\")",
    "additional_columns": ["title", "state", "body"],
    "limit": 2
  }'
```

Response
```json
{
  "matches": [
    {
      "value": "implements a scalar UDF `array_distance`:\n```\narray_distance(FixedSizeList[Float32], FixedSizeList[Float32])",
      "dataset": "spiceai.issues",
      "metadata": {
        "title": "Improve scalar UDF array_distance",
        "state": "Closed",
        "body": "## Overview\n- Previous PR https://github.com/spiceai/spiceai/pull/1601 implements a scalar UDF `array_distance`:\n```\narray_distance(FixedSizeList[Float32], FixedSizeList[Float32])\narray_distance(FixedSizeList[Float32], List[Float64])\n```\n\n### Changes\n - Improve using Native arrow function, e.g. `arrow_cast`, [`sub_checked`](https://arrow.apache.org/rust/arrow/array/trait.ArrowNativeTypeOp.html#tymethod.sub_checked)\n - Support a greater range of array types and numeric types\n - Possibly create a sub operator and UDF, e.g.\n\t- `FixedSizeList[Float32] - FixedSizeList[Float32]`\n\t- `Norm(FixedSizeList[Float32])`"
      }
    },
    {
      "value": "est external tools being returned for toolusing models",
      "dataset": "spiceai.issues",
      "metadata": {
        "title": "Automatic NSQL retries in /v1/nsql ",
        "state": "Open",
        "body": "To mimic our ability for LLMs to repeatedly retry tools based on errors, the `/v1/nsql`, which does not use this same paradigm, should retry internally.\n\nIf possible, improve the structured output to increase the likelihood of valid SQL in the response. Currently we just inforce JSON like this\n```json\n{\n  "sql": "SELECT ..."\n}\n```"
      }
    }
  ],
  "duration_ms": 45
}
```
