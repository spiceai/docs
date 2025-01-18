---
title: 'Embedding Models'
sidebar_label: 'Embeddings'
description: ''
sidebar_position: 6
pagination_prev: null
pagination_next: null
tags:
  - components
  - embeddings
  - models
  - search
---

Embedding models convert raw text into numerical representations that can be used by machine learning models. Spice supports running embedding models locally or using remote services such as OpenAI or [la Plateforme](https://console.mistral.ai/).

Embeddings are used for vector-based and similarity search, like document retrieval. For chat-based large language models, refer to [Model Providers](../models/index.md).

Spice supports various model sources and formats to provide embedding components:

| Name                | Description                                  | Status | ML Format(s) | LLM Format(s)\*                 |
| ------------------- | -------------------------------------------- | ------ | ------------ | ------------------------------- |
| [`file`][file]      | Local filesystem                             | Beta  | ONNX         | GGUF, GGML, SafeTensor          |
| [`huggingface`][hf] | Models hosted on HuggingFace                 | Beta   | ONNX         | GGUF, GGML, SafeTensor          |
| [`openai`][openai]  | OpenAI (or compatible) LLM endpoint          | Alpha  | -            | OpenAI-compatible HTTP endpoint |
| [`azure`][azure]    | Azure OpenAI                                 | Alpha  | -            | OpenAI-compatible HTTP endpoint |

[file]: /components/embeddings/local.md
[hf]:  /components/embeddings/huggingface.md
[openai]: /components/embeddings/openai.md
[azure]: /components/embeddings/azure.md

## Overview

Spice provides three distinct methods for handling embedding columns in datasets:

1. **[Just-in-Time (JIT) Embeddings](#jit-embeddings)**: Dynamically computes embeddings, on-demand, during query execution, without precomputing data.
2. **[Accelerated Embeddings](#accelerated-embeddings)**: Precomputes embeddings by transforming and augmenting the source dataset for faster query and search performance.
3. **[Passthrough Embeddings](#passthrough-embeddings)**: Utilizes pre-existing embeddings directly from the underlying source datasets, bypassing any additional computation.

## Configuring Embedding Models

Embedding models are defined in the `spicepod.yaml` file as top-level components.

Example configuration in `spicepod.yaml`:

```yaml
embeddings:
  - from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2
    name: all_minilm_l6_v2

  - from: openai:text-embedding-3-large
    name: xl_embed
    params:
      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }

  - name: my_model
    from: file:model.safetensors
    files:
      - path: config.json
      - path: models/embed/tokenizer.json
```

Embedding models can be used either by:

- An OpenAI-compatible [endpoint](/docs/api/HTTP/post-embeddings)
- Augmenting a dataset with column-level [embeddings](/docs/reference/spicepod/datasets.md#embeddings), to provide vector-based [search functionality](/docs/features/search/index.md#vector-search).

### Configuring Embeddings Columns on Datasets

Embedding models can be configured to create vector embeddings for specific columns in a dataset. Define embeddings under `columns` in the `spicepod.yaml` file, under the `datasets` section.

Example configuration in `spicepod.yaml`:

```yaml
embeddings:
  - from: openai:text-embedding-3-large
    name: xl_embed
    params:
      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }

datasets:
  - from: file:sales_data.parquet
    name: sales
    columns:
      - name: address_line1
        description: The first line of the address.
        embeddings:
          - from: xl_embed
            row_id: order_number
            chunking:
              enabled: true
              target_chunk_size: 256
              overlap_size: 32
```

Refer to the [embeddings](/docs/reference/spicepod/embeddings.md) and [datasets](/docs/reference/spicepod/datasets.md#embeddings) Spicepod reference for more details on configuring embeddings for datasets.

## Embedding Methods

### Just-in-Time (JIT) Embeddings {#jit-embeddings}

JIT embeddings are computed during query execution. This is useful when pre-computing embeddings is infeasible (e.g. if the dataset is large, infrequently queried, has heavy prefiltering). To add an embedding column, specify it within the dataset's column.

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

To improve query performance, column embeddings can be precomputed, and stored in any [data accelerator](/docs/components/data-accelerators/index.md). The only change required for this it to set up the data accelerator. For example, just add

```yaml
acceleration:
  enabled: true
```

to the dataset configuration. All other data accelerator configurations are optional, but can be applied as per their respective [documentation](/docs/components/data-accelerators/index.md).

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

### Passthrough Embeddings

Datasets that already have embedding columns can utilize the same functionalities (e.g. vector search) as those augmented with Spice-generated embeddings. They should follow the same schema as Spice-generated embeddings (or be altered with a [view](/docs/reference/spicepod#view).

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
|                   |     data_type: Int32,                   |             |
|                   |     nullable: false,                    |             |
|                   |     dict_id: 0,                         |             |
|                   |     dict_is_ordered: false,             |             |
|                   |     metadata: {}                        |             |
|                   |   },                                    |             |
|                   |     2                                   |             |
|                   |   ),                                    |             |
|                   | })                                      |             |
+-------------------+-----------------------------------------+-------------+
```

Passthrough embedding columns must still be defined in the `spicepod.yaml` file. The spice instance must also have access to the same embedding model used to generate the embeddings.

```yaml
datasets:
  - from: sftp://remote-sftp-server.com/sales/2024.csv
    name: sales
    columns:
      - name: address
        embeddings:
          - from: local_embedding_model

embeddings:
  - name: local_embedding_model # Original embedding model used for this column
  ...
```

#### Requirements

To ensure compatibility, these table columns must adhere to the following constraints:

1. **Underlying Column Presence:**

   - The underlying column must exist in the table, and be of `string` [Arrow data type](../../reference/datatypes/accelerators.md) .

2. **Embeddings Column Naming Convention:**

   - For each underlying column, the corresponding embeddings column must be named as `<column_name>_embedding`. For example, a `customer_reviews` table with a `review` column must have a `review_embedding` column.

3. **Embeddings Column Data Type:**

   - The embeddings column must have the following [Arrow data type](../../reference/datatypes/accelerators.md) when loaded into Spice:
     1. `FixedSizeList[Float32 or Float64, N]`, where `N` is the dimension (size) of the embedding vector. `FixedSizeList` is used for efficient storage and processing of fixed-size vectors.
     2. If the column is [**chunked**](#chunking), use `List[FixedSizeList[Float32 or Float64, N]]`.

4. **Offset Column for Chunked Data:**
   - If the underlying column is chunked, there must be an additional offset column named `<column_name>_offsets` with the following Arrow data type:
     1. `List[FixedSizeList[Int32, 2]]`, where each element is a pair of integers `[start, end]` representing the start and end indices of the chunk in the underlying text column. This offset column maps each chunk in the embeddings back to the corresponding segment in the underlying text column.
     - _For instance, `[[0, 100], [101, 200]]` indicates two chunks covering indices 0–100 and 101–200, respectively._

Following these guidelines ensures that the dataset with pre-existing embeddings is fully compatible with embedding functionalities provided by Spice.

## Advanced Configuration

### Chunking

Spice also supports chunking of content before embedding, which is useful for large text columns such as those found in [Document Tables](/docs/components/data-connectors/index.md#document-support). Chunking ensures that only the most relevant portions of text are returned during search queries. Chunking is configured as part of the embedding configuration.

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

The `body` column will be divided into chunks of approximately 512 tokens, while maintaining structural and semantic integrity (e.g. not splitting sentences). See the [API reference](/docs/reference/spicepod/datasets#columns-embeddings-chunking) for full details.

#### Row Identifiers

Like a primary key, the `row_id` field specifies which column(s) uniquely identifies each row. This is useful for embedding datasets that don't have a primary key by default. This is important for chunked embedding datasets, so that operations (e.g. [`v1/search`](/docs/api/HTTP/post-search)), can be able to map multiple chunked vectors to a single dataset row. The `row_id` can be set in the `columns[*].embeddings[*].row_id`.

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

import DocCardList from '@theme/DocCardList';

<DocCardList />
