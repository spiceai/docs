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

> 🎓 Learn how it works with the [Amazon S3 Vectors with Spice](https://spice.ai/blog/amazon-s3-vectors-with-spice) engineering blog post.

Vector search uses embeddings (numerical representations of text or data) to find semantically similar content. Unlike keyword search, vector search understands meaning and context, making it useful for:

- Finding documents with similar meaning but different wording
- Semantic similarity matching
- Retrieval-augmented generation (RAG) applications
- Recommendation systems

For embedding columns that contain many vectors per row (for example, one vector per tag or per section), see [Multi-Vector Search](multi-vector).

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

For detailed API documentation, see [Search API Reference](../../api/HTTP/post-search).

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
  limit INTEGER,         -- Results limit (default: 1000)
  include_score BOOLEAN  -- Include relevance scores (default: TRUE)
)
RETURNS TABLE                -- The original table and:
                             --  - A FLOAT column `score` (if `include_score`).
```

By default, `vector_search` retrieves up to 1000 results. To adjust this limit, specify the `limit` parameter in the function call. When using a specific vector engine, such as `s3_vectors` the limit defaults to that of the vector engine.

```sql
SELECT id, title, score
FROM vector_search('sales', 'cutting edge AI', 1500)
ORDER BY score DESC;
```

`WHERE` predicates on base table columns are pushed down as pre-filters — only matching rows are scored and ranked. See [Search in SQL](../../reference/sql/search#vector-search-vector_search) for details.

:::warning[Limitations]

- `vector_search` UDTF does not yet support chunked embedding columns. Chunking support is on the roadmap.

:::

## Vectors an Index Will Not Store

A vector is indexable only if it has a defined direction under the metrics the index offers. Two shapes do not, and a row carrying one is skipped instead of stored:

| Shape | Examples | Why |
| --- | --- | --- |
| **No direction** — every component is `0` or `NaN` | `[0, 0, 0]`, `[NaN, NaN]`, `[0, NaN]` | The vector points nowhere, so a cosine distance to it is undefined. |
| **Non-finite** — at least one component is `NaN` or `±Inf` | `[1.0, NaN]`, `[0.0, Inf]` | Every metric the index offers answers `NaN` or `Inf` for it, whatever it is compared against. |

A vector that is both is reported as the first.

Skipping is neither silent nor passive:

- **The skip is logged, and the two reasons are reported apart.** The in-memory and `s3_vectors` write paths warn once per record, naming it and its reason — `its embedding has no direction — every component is zero or NaN`, or `its embedding has a NaN or infinite component, so every distance to it is undefined`. The `elasticsearch` path aggregates instead: one warning per reason per write, carrying the count of records skipped for it and a sample of their row indices.
- **A skipped row evicts whatever its primary key already holds.** Within a write, the last row for a repeated key decides that key, so a key whose deciding row is skipped is removed from the index rather than left answering at the vector its previous text produced. The same applies to a row whose search text is `NULL` or empty.
- A row whose primary key is `NULL` is skipped too, with its own warning, but evicts nothing — there is no key with which to address an earlier entry.

This criterion is applied by the [`elasticsearch`](../../components/vectors/elasticsearch) and [`s3_vectors`](../../components/vectors/s3_vectors) engines, and by the in-memory warm index written through to alongside them. The [`duckdb`](../../components/vectors/duckdb) engine's write path applies no such criterion and stores the vector as it arrives; it screens the **query** vector instead, failing a search whose query embedding has a non-finite component with `DuckDB vector query contains a non-finite value.`

## Chunks a Shortened Row Leaves Behind

A [chunked](../../components/embeddings#chunking) embedding column is indexed one entry per chunk, addressed by the row's primary key plus a chunk id. A write upserts the entries the row's current text produces — chunk ids `0` through `n` — and nothing above them. So when a row's text is rewritten into **fewer** chunks than it held before, the entries the longer text produced above the new count are not overwritten by that write: unless the index removes them, a search can still match a row on content its current text no longer has.

Which engine holds the entries decides whether they are removed:

| Index | Entries a shortened row superseded |
| --- | --- |
| The in-memory warm index, written through to alongside a vector engine | Removed by the same write. |
| [`elasticsearch`](../../components/vectors/elasticsearch) and [`s3_vectors`](../../components/vectors/s3_vectors) | **Kept.** Neither store can be addressed by part of a key, and the chunk ids a shorter text no longer produces are not known to it. |
| [`duckdb`](../../components/vectors/duckdb) | Not applicable — the engine refuses a chunked column at load. |

A chunked column on `elasticsearch` or `s3_vectors` is written through both, so the warm index stops returning the superseded chunks while the persistent store still holds them. Spice reports that once per index, on its first write to it — whether or not a row has been shortened yet — naming the index that keeps them and the column:

```
The `s3_vector_index` search index cannot remove the entries a row's previous 'content' text produced when that text is rewritten to something shorter, so such a row can stay searchable by content it no longer has and a search can return it. The index can only be addressed by a complete key, and the entries a shorter text no longer produces are not known to it. Re-create the search index to rebuild it from the rows the dataset holds now. See: https://spiceai.org/docs/features/search
```

The index name is `elasticsearch_index` or `s3_vector_index`, and `'content'` is the search column of the reader's own dataset.

**A full refresh does not clear them.** A [`refresh_mode: full`](../data-acceleration/refresh-modes) refresh re-upserts every row under the chunk ids its current text produces, but neither `elasticsearch` nor `s3_vectors` empties its store at the start of such a refresh, so a chunk id no row produces any more is never written over. The same is true of an `append`, an upsert, and a [`changes`](../cdc) CDC batch, each of which sees only the rows it carries. Re-creating the index is what clears them, because it is rebuilt from the rows the dataset holds now.

A row whose search text becomes `NULL` or empty is a separate case, handled by eviction — see [Vectors an Index Will Not Store](#vectors-an-index-will-not-store).

## Using Existing Embeddings

Spice supports vector searches on datasets with pre-existing embeddings. Ensure the dataset meets these requirements:

1. **Column Naming**: The embedding column name must be `<original_column_name>_embedding`.
2. **Data Types**: Embedding columns must use Arrow types:
   - Non-chunked: `FixedSizeList[Float32|Float64, N]`
   - Chunked: `List[FixedSizeList[Float32|Float64, N]]`
3. **Offset Columns**: For chunked embeddings, an additional offset column (`<column_name>_offset`) is required:
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
   - The underlying column must exist in the table, and be of `string` [Arrow data type](../../reference/datatypes/accelerators) .

2. **Embeddings Column Naming Convention:**
   - For each underlying column, the corresponding embeddings column must be named as `<column_name>_embedding`. For example, a `customer_reviews` table with a `review` column must have a `review_embedding` column.

3. **Embeddings Column Data Type:**
   - The embeddings column must have the following [Arrow data type](../../reference/datatypes/accelerators) when loaded into Spice:
     1. `FixedSizeList[Float32 or Float64, N]`, where `N` is the dimension (size) of the embedding vector. `FixedSizeList` is used for efficient storage and processing of fixed-size vectors.
     2. If the column is [**chunked**](../../components/embeddings#chunking), use `List[FixedSizeList[Float32 or Float64, N]]`.

4. **Offset Column for Chunked Data:**
   - If the underlying column is chunked, there must be an additional offset column named `<column_name>_offset` with the following Arrow data type:
     1. `List[FixedSizeList[Int32, 2]]`, where each element is a pair of integers `[start, end]` representing the start and end indices of the chunk in the underlying text column. This offset column maps each chunk in the embeddings back to the corresponding segment in the underlying text column.
     - _For instance, `[[0, 100], [101, 200]]` indicates two chunks covering indices 0–100 and 101–200, respectively._

By following these guidelines, you can ensure that your dataset with pre-existing embeddings is fully compatible with the vector search and other embedding functionalities provided by Spice.

### Example

A table `sales` with an `address` column and corresponding embedding column(s).
