---
title: 'Embedding Datasets'
sidebar_label: 'Embedding Datasets'
description: 'Learn how to define, or augment existing datasets with embedding column(s).'
sidebar_position: 11
pagination_prev: null
pagination_next: null
---

# Embedding Datasets

Learn how to define and augment datasets with embedding columns for advanced search capabilities.

## Overview

Spice supports three methods for working with embeddings in datasets:

1. **Passthrough Embeddings**: Using existing embeddings from the underlying source datasets.
2. **Just-in-Time (JIT) Embeddings**: Compute embeddings for the dataset, on-demand, during query execution.
3. **Accelerated Embeddings**: Precompute embeddings by accelerating the source dataset.

## Configuring Embedding Models

Before configuring dataset embeddings, you must define the embedding models in your `spicepod.yaml`, for example:

```yaml
embeddings:
  - name: local_embedding_model
    from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2

  - from: openai
    name: remote_service
    params:
      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }
```

See [Embedding components](/components/embeddings/) for more information on embedding models.

## Embedding Methods

### Passthrough Embeddings

Datasets that already include embeddings can utilize the same functionalities (e.g., vector search) as those augmented with embeddings using Spice. To ensure compatibility, these table columns must adhere to the following constraints:

#### Example

A `sales` table with an `address` column that has an embedding.

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

Passthrough embedding columns still must be defined in the `spicepod.yaml` file. The spicepod must also have access to the same embedding model used to generate the embeddings.
```yaml
datasets:
  - from: sftp://remote-sftp-server.com/sales/2024.csv
    name: sales
    columns:
      - name: address
        embeddings:
          - from: local_embedding_model # Original embedding model used for this column
```

#### Requirements
1. **Underlying Column Presence:**
   - The underlying column must exist in the table, and be of `string` [Arrow data type](reference/datatypes.md) .

2. **Embeddings Column Naming Convention:**
   - For each underlying column, the corresponding embeddings column must be named as `<column_name>_embedding`. For example, a `customer_reviews` table with a `review` column must have a `review_embedding` column.

3. **Embeddings Column Data Type:**
   - The embeddings column must have the following [Arrow data type](reference/datatypes.md) when loaded into Spice:
     1. `FixedSizeList[Float32 or Float64, N]`, where `N` is the dimension (size) of the embedding vector. `FixedSizeList` is used for efficient storage and processing of fixed-size vectors.
     2. If the column is [**chunked**](#chunking), use `List[FixedSizeList[Float32 or Float64, N]]`.

4. **Offset Column for Chunked Data:**
   - If the underlying column is chunked, there must be an additional offset column named `<column_name>_offsets` with the following Arrow data type:
     1. `List[FixedSizeList[Int32, 2]]`, where each element is a pair of integers `[start, end]` representing the start and end indices of the chunk in the underlying text column. This offset column maps each chunk in the embeddings back to the corresponding segment in the underlying text column.
     - _For instance, `[[0, 100], [101, 200]]` indicates two chunks covering indices 0–100 and 101–200, respectively._

By following these guidelines, you can ensure that your dataset with pre-existing embeddings is fully compatible with the vector search and other embedding functionalities provided by Spice.

### Just-in-Time (JIT) Embeddings

JIT embeddings are computed during query execution. This is useful when you can't or don't want to pre-compute embeddings (e.g. if the dataset is large, infrequently queried, has heavy prefiltering). To add an embedding column, specify it within the dataset's column.

```yaml
datasets:
  - name: invoices
    from: sftp://remote-sftp-server.com/invoices/2024/
    columns:
      - name: line_item_details
        embeddings:
          - from: my_embedding_model
    params:
      file_format: parquet

embeddings:
  # Or any model you like!
  - from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2
    name: my_embedding_model
```

### Accelerated Embeddings
To improve query performance, column embeddings can be precomputed, and stored in any [data accelerator](/components/data-accelerators/index.md). The only change required for this it to set up the data accelerator. For example, just add
```yaml
acceleration:
  enabled: true
```
to the dataset configuration. All other data accelerator configurations are optional, but can be applied.

**Full example:**
```yaml
datasets:
  - name: invoices
    from: sftp://remote-sftp-server.com/invoices/2024/
    acceleration:
      enabled: true
    columns:
      - name: line_item_details
        embeddings:
          - from: my_embedding_model
    params:
      file_format: parquet
```

## Advanced Configuration

### Chunking

Spice also supports chunking of content before embedding, which is useful for large text columns such as those found in [Document Tables](/components/data-connectors/index.md#document-support). Chunking ensures that only the most relevant portions of text are returned during search queries. Chunking is configured as part of the embedding configuration.

```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/issues
    name: spiceai.issues
    acceleration:
      enabled: true
    columns:
      - name: body
        embeddings:
          - from: local_embedding_model
            chunking:
              enabled: true
              target_chunk_size: 512
```

The `body` column will be divided into chunks of approximately 512 tokens, while maintaining structural and semantic integrity (e.g. not splitting sentences). See the [API reference](/reference/spicepod/datasets#columns-embeddings-chunking) for full details.

#### Row Identifiers

Like a primary key, the `row_id` field specifies which column(s) uniquely identifies each row. This is useful for embedding datasets that don't have a primary key by default. This is important for chunked embedding datasets, so that operations (e.g. [`v1/search`](/api/http/search)), can be able to map multiple chunked vectors to a single dataset row. The `row_id` can be set in the `columns[*].embeddings[*].row_id`.
```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/issues
    name: spiceai.issues
    acceleration:
      enabled: true
    columns:
      - name: body
        embeddings:
          - from: local_embedding_model
            chunking:
              enabled: true
              target_chunk_size: 512
            row_id: id
```
