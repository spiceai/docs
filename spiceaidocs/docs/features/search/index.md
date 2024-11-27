---
title: 'Search Functionality'
sidebar_label: 'Search'
description: 'Learn how Spice can search across datasets using database-native and vector-search methods.'
sidebar_position: 7
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
    columns:
      - name: body
        embeddings:
          - from: local_embedding_model  # Embedding model used for this column
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

Spice also supports vector search on datasets with preexisting embeddings. See [below](#preexisting-embeddings) for compatibility details.

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
        from: local_embedding_model
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

### Pre-Existing Embeddings

Datasets that already include embeddings can utilize the same functionalities (e.g., vector search) as those augmented with embeddings using Spice. To ensure compatibility, these table columns must adhere to the following constraints:

1. **Underlying Column Presence:**

   - The underlying column must exist in the table, and be of `string` [Arrow data type](reference/datatypes.md) .

2. **Embeddings Column Naming Convention:**

   - For each underlying column, the corresponding embeddings column must be named as `<column_name>_embedding`. For example, a `customer_reviews` table with a `review` column must have a `review_embedding` column.

3. **Embeddings Column Data Type:**

   - The embeddings column must have the following [Arrow data type](reference/datatypes.md) when loaded into Spice:
     1. `FixedSizeList[Float32 or Float64, N]`, where `N` is the dimension (size) of the embedding vector. `FixedSizeList` is used for efficient storage and processing of fixed-size vectors.
     2. If the column is [**chunked**](#chunking-support), use `List[FixedSizeList[Float32 or Float64, N]]`.

4. **Offset Column for Chunked Data:**
   - If the underlying column is chunked, there must be an additional offset column named `<column_name>_offsets` with the following Arrow data type:
     1. `List[FixedSizeList[Int32, 2]]`, where each element is a pair of integers `[start, end]` representing the start and end indices of the chunk in the underlying text column. This offset column maps each chunk in the embeddings back to the corresponding segment in the underlying text column.
     - _For instance, `[[0, 100], [101, 200]]` indicates two chunks covering indices 0–100 and 101–200, respectively._

By following these guidelines, you can ensure that your dataset with pre-existing embeddings is fully compatible with the vector search and other embedding functionalities provided by Spice.

#### Example

A table `sales` with an `address` column and corresponding embedding column(s).

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

The same table if it was chunked:

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
