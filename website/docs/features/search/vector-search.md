---
title: 'Vector-Based Search'
sidebar_label: 'Vector Search'
description: 'Learn how Spice can perform searches using vector-based methods.'
sidebar_position: 1
tags:
  - search
  - models
  - embeddings
---

> 🎓 Learn how it works with the [Amazon S3 Vectors with Spice](https://spiceai.org/blog/amazon-s3-vectors-with-spice) engineering blog post.

Spice provides advanced vector-based search capabilities, enabling more nuanced and intelligent searches.

## Embedding Models

Spice supports two types of embedding providers:

- **Local embedding models** e.g., [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2).
- **Remote embedding services** e.g., [OpenAI Embeddings API](https://platform.openai.com/docs/api-reference/embeddings/create).

Embedding models are defined in the `spicepod.yaml` file as top-level components.

```yaml
embeddings:
  - name: openai_embeddings
    from: openai
    params:
      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }

  - name: local_embedding_model
    from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2
```

## Configuring Datasets for Embeddings

To enable vector search, specify embeddings for the dataset columns in `spicepod.yaml`:

```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/issues
    name: spiceai.issues
    params:
      github_token: ${ secrets:GITHUB_TOKEN }
    acceleration:
      enabled: true
    columns:
      - name: body
        embeddings:
          - from: local_embedding_model
```

This configuration instructs Spice to create embeddings from the `body` column, enabling similarity searches on body content.

## Performing a Vector Search

Execute similarity searches using Spice's HTTP API:

```shell
curl -X POST http://localhost:8090/v1/search \
  -H 'Content-Type: application/json' \
  -d '{
    "datasets": ["spiceai.issues"],
    "text": "cutting edge AI",
    "where": "author=\"jeadie\"",
    "additional_columns": ["title", "state"],
    "limit": 2
  }'
```

For detailed API documentation, see [Search API Reference](/docs/api/HTTP/post-search).

## Retrieving Full Documents

If the dataset uses chunking, Spice returns relevant chunks. To retrieve entire documents, include the embedding column in `additional_columns`:

```shell
curl -X POST http://localhost:8090/v1/search \
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
      },
      "score": 0.66,
    },
    {
      "value": "est external tools being returned for toolusing models",
      "dataset": "spiceai.issues",
      "metadata": {
        "title": "Automatic NSQL retries in /v1/nsql ",
        "state": "Open",
        "body": "To mimic our ability for LLMs to repeatedly retry tools based on errors, the `/v1/nsql`, which does not use this same paradigm, should retry internally.\n\nIf possible, improve the structured output to increase the likelihood of valid SQL in the response. Currently we just inforce JSON like this\n```json\n{\n  "sql": "SELECT ..."\n}\n```"
      },
      "score": 0.52,
    }
  ],
  "duration_ms": 45
}
````

## SQL UDTF

The embedding index can also be used to perform search in SQL, via a user-defined table function (UDTF).

```sql
SELECT id, title, score
FROM vector_search('sales', 'cutting edge AI')
ORDER BY score DESC
LIMIT 5;
```

**SQL Function Signature of `vector_search`:**

```sql
vector_search(
  table STRING,          -- Dataset name (required)
  query STRING,          -- Search text (required)
  col STRING,            -- Column name (optional if single embedding column)
  limit INTEGER,         -- Results limit (default: all)
  include_score BOOLEAN  -- Include relevance scores (default: TRUE)
)
RETURNS TABLE                -- The original table and:
                             --  - A FLOAT column `score` (if `include_score`).
```

:::warning[Limitations]

- `vector_search` UDTF does not support chunked embedding columns.

:::

## Using Existing Embeddings

Spice supports vector searches on datasets with pre-existing embeddings. Ensure the dataset meets these requirements:

1. **Column Naming**: The embedding column name must be `<original_column_name>_embedding`.
2. **Data Types**: Embedding columns must use Arrow types:
   - Non-chunked: `FixedSizeList[Float32|Float64, N]`
   - Chunked: `List[FixedSizeList[Float32|Float64, N]]`
3. **Offset Columns**: For chunked embeddings, an additional offset column (`<column_name>_offsets`) is required:
   - Type: `List[FixedSizeList[Int32, 2]]`, indicating chunk boundaries.

Example dataset structure (`sales` table):

Non-chunked:

```shell
sql> describe sales;
+-------------------+-----------------------------------------+-------------+
| column_name       | data_type                               | is_nullable |
+-------------------+-----------------------------------------+-------------+
| order_number      | Int64                                   | YES         |
| quantity_ordered  | Int64                                   | YES         |
| price_each        | Float64                                 | YES         |
| order_line_number | Int64                                   | YES         |
| address           | Utf8                                    | YES         |
| address_embedding | FixedSizeList(                          | NO          |
|                   |   Field {                               |             |
|                   |     name: "item",                       |             |
|                   |     data_type: Float32,                 |             |
|                   |     nullable: false,                    |             |
|                   |     dict_id: 0,                         |             |
|                   |     dict_is_ordered: false,             |             |
|                   |     metadata: {}                        |             |
|                   |   },                                    |             |
|                   |   384                                   |             |
+-------------------+-----------------------------------------+-------------+
```

Chunked:

```shell
sql> describe sales;
+-------------------+-----------------------------------------+-------------+
| column_name       | data_type                               | is_nullable |
+-------------------+-----------------------------------------+-------------+
| order_number      | Int64                                   | YES         |
| quantity_ordered  | Int64                                   | YES         |
| price_each        | Float64                                 | YES         |
| order_line_number | Int64                                   | YES         |
| address           | Utf8                                    | YES         |
| address_embedding | List(Field {                            | NO          |
|                   |   name: "item",                         |             |
|                   |   data_type: FixedSizeList(             |             |
|                   |     Field {                             |             |
|                   |       name: "item",                     |             |
|                   |       data_type: Float32,               |             |
|                   |     },                                  |             |
|                   |     384                                 |             |
|                   |   ),                                    |             |
|                   | })                                      |             |
+-------------------+-----------------------------------------+-------------+
| address_offset    | List(Field {                            | NO          |
|                   |   name: "item",                         |             |
|                   |   data_type: FixedSizeList(             |             |
|                   |     Field {                             |             |
|                   |       name: "item",                     |             |
|                   |       data_type: Int32,                 |             |
|                   |     },                                  |             |
|                   |     2                                   |             |
|                   |   ),                                    |             |
|                   | })                                      |             |
+-------------------+-----------------------------------------+-------------+
```

### Constraints

1. **Underlying Column Presence:**
   - The underlying column must exist in the table, and be of `string` [Arrow data type](../../reference/datatypes/accelerators.md) .

2. **Embeddings Column Naming Convention:**
   - For each underlying column, the corresponding embeddings column must be named as `<column_name>_embedding`. For example, a `customer_reviews` table with a `review` column must have a `review_embedding` column.

3. **Embeddings Column Data Type:**
   - The embeddings column must have the following [Arrow data type](../../reference/datatypes/accelerators.md) when loaded into Spice:
     1. `FixedSizeList[Float32 or Float64, N]`, where `N` is the dimension (size) of the embedding vector. `FixedSizeList` is used for efficient storage and processing of fixed-size vectors.
     2. If the column is [**chunked**](/docs/components/embeddings#chunking), use `List[FixedSizeList[Float32 or Float64, N]]`.

4. **Offset Column for Chunked Data:**
   - If the underlying column is chunked, there must be an additional offset column named `<column_name>_offsets` with the following Arrow data type:
     1. `List[FixedSizeList[Int32, 2]]`, where each element is a pair of integers `[start, end]` representing the start and end indices of the chunk in the underlying text column. This offset column maps each chunk in the embeddings back to the corresponding segment in the underlying text column.
     - _For instance, `[[0, 100], [101, 200]]` indicates two chunks covering indices 0–100 and 101–200, respectively._

By following these guidelines, you can ensure that your dataset with pre-existing embeddings is fully compatible with the vector search and other embedding functionalities provided by Spice.

### Example

A table `sales` with an `address` column and corresponding embedding column(s).
