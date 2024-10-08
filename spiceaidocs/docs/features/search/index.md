---
title: 'Search Functionality'
sidebar_label: 'Search'
description: 'Learn how Spice can search across datasets using database-native and vector-search methods.'
sidebar_position: 6
pagination_prev: null
pagination_next: null
---

Spice provides advanced search capabilities that go beyond standard SQL queries, offering both traditional SQL search patterns and vector-based search functionality.

## SQL-Based Search

Spice supports basic search patterns directly through SQL, leveraging its SQL query features. For example, you can perform a text search within a table using SQL's `LIKE` clause:

```sql
SELECT id, text_column
FROM my_table
WHERE
    LOWER(text_column) LIKE '%search_term%'
  AND
    date_published > '2021-01-01'
```

## Vector Search

In addition to SQL, Spice provides advanced vector-based search capabilities, enabling more nuanced and intelligent searches. The runtime supports both:

1. Local embedding models, e.g. [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2).
2. Remote embedding providers, e.g. [OpenAI](https://platform.openai.com/docs/api-reference/embeddings/create).

Embedding models are defined in the `spicepod.yaml` file as top-level components.

```yaml
embeddings:
  - from: openai
    name: remote_service
    params:
      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }

  - name: local_embedding_model
    from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2
```

Datasets can be augmented with embeddings targeting specific columns, to enable search capabilities through similarity searches.

```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/issues
    name: spiceai.issues
    acceleration:
      enabled: true
    embeddings:
      - column: body # The text column in the `spiceai.issues` dataset
        use: local_embedding_model # Embedding model used for this column
```

By defining embeddings on the `body` column, Spice is now configured to execute similarity searches on the dataset.

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

For more details, see the [API reference for /v1/search](/api/http/search).

### Chunking Support

Spice also supports chunking of content before embedding, which is useful for large text columns such as those found in [Document Tables](/components/data-connectors/index.md#document-support). Chunking ensures that only the most relevant portions of text are returned during search queries. Chunking is configured as part of the embedding configuration.

```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/issues
    name: spiceai.issues
    acceleration:
      enabled: true
    embeddings:
      - column: body
        use: local_embedding_model
        chunking:
          enabled: true
          target_chunk_size: 512
```

The `body` column will be divided into chunks of approximately 512 tokens, while maintaining structural and semantic integrity (e.g. not splitting sentences).

### Document Retrieval

When performing searches on datasets with chunking enabled, Spice returns the most relevant chunk for each match. To retrieve the full content of a column, include the embedding column in the `additional_columns` list.

For example:

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

Response:

````json
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
````
