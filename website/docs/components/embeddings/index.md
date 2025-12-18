---
title: 'Embedding Models'
sidebar_label: 'Embeddings'
description: 'Describes how embedding models are used in Spice to convert text into numerical vectors for machine learning and search applications.'
image: /img/og/embeddings.png
sidebar_position: 6
pagination_prev: null
pagination_next: null
tags:
  - components
  - embeddings
  - models
  - search
---

Embedding models transform raw text into numerical vectors that machine learning models can use. Spice supports running embedding models locally or via hosted services such as OpenAI, Amazon Bedrock, Databricks MosaicAI, or [la Plateforme](https://console.mistral.ai/).

Embeddings enable vector-based and similarity search, such as document retrieval. For chat-based large language models, see [Model Providers](../models/index.md).

Spice supports a variety of embedding model sources and formats:

| Name                       | Description                             | Status            | ML Format(s) | LLM Format(s)\*                 |
| -------------------------- | --------------------------------------- | ----------------- | ------------ | ------------------------------- |
| [`file`][file]             | Local filesystem                        | Release Candidate | ONNX         | GGUF, GGML, SafeTensor          |
| [`huggingface`][hf]        | Models hosted on HuggingFace            | Release Candidate | ONNX         | GGUF, GGML, SafeTensor          |
| [`openai`][openai]         | OpenAI (or compatible) LLM endpoint     | Release Candidate | -            | OpenAI-compatible HTTP endpoint |
| [`azure`][azure]           | Azure OpenAI                            | Alpha             | -            | OpenAI-compatible HTTP endpoint |
| [`databricks`][databricks] | Models deployed to Databricks Mosaic AI | Alpha             | -            | OpenAI-compatible HTTP endpoint |
| [`bedrock`][bedrock]       | Models deployed on Amazon Bedrock       | Alpha             | -            | OpenAI-compatible HTTP endpoint |
| [`model2vec`][model2vec]   | Model2Vec static word embeddings        | Alpha             | -            | Model2Vec format                |

[file]: /components/embeddings/local.md
[hf]: /components/embeddings/huggingface.md
[model2vec]: /components/embeddings/model2vec.md
[openai]: /components/embeddings/openai.md
[azure]: /components/embeddings/azure.md
[databricks]: /components/embeddings/databricks.md
[bedrock]: /components/embeddings/bedrock.md

## Overview

Spice provides three ways to handle embedding columns in datasets:

1. **[Just-in-Time (JIT) Embeddings](#jit-embeddings):** Embeddings are computed on demand during query execution, with no precomputation.
2. **[Accelerated Embeddings](#accelerated-embeddings):** Embeddings are precomputed and stored, enabling faster queries and searches.
3. **[Passthrough Embeddings](#passthrough-embeddings):** Pre-existing embeddings in the source dataset are used directly, with no additional computation.

## Configuring Embedding Models

Define embedding models in the `spicepod.yaml` file as top-level components.

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

Embedding models can be used via:

- An OpenAI-compatible [endpoint](/docs/api/HTTP/post-embeddings)
- Augmenting a dataset with column-level [embeddings](/docs/reference/spicepod/datasets.md#embeddings) for vector-based [search functionality](/docs/features/search/index.md#vector-search)

### Configuring Embedding Columns on Datasets

To create vector embeddings for specific dataset columns, define them under `columns` in the `spicepod.yaml` file, within the `datasets` section.

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

See the [embeddings](/docs/reference/spicepod/embeddings.md) and [datasets](/docs/reference/spicepod/datasets.md#embeddings) reference for more details.

## Embedding Methods

### Just-in-Time (JIT) Embeddings {#jit-embeddings}

JIT embeddings are computed at query time. This is useful when precomputing is impractical (e.g., large or rarely queried datasets, or heavy prefiltering). To add a JIT embedding column, specify it in the dataset's column config.

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

To speed up queries, embeddings can be precomputed and stored in a [data accelerator](/docs/components/data-accelerators/index.md). Enable this by adding:

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

If the dataset already contains embedding columns, Spice can use them for vector search and other embedding features. The schema must match that of Spice-generated embeddings (or be adapted with a [view](/docs/reference/spicepod#views)).

**Example:**

A `sales` table with an `address` column and its embedding:

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

Passthrough embedding columns must still be defined in the `spicepod.yaml` file. The Spice instance must also have access to the same embedding model used to generate the embeddings.

```yaml
datasets:
  - from: sftp://remote-sftp-server.com/sales/2024.csv
    name: sales
    columns:
      - name: address
        embeddings:
          - from: local_embedding_model

embeddings:
  - name: local_embedding_model # The model originally used for this column
  ...
```

#### Requirements

To ensure compatibility, embedding columns must meet these requirements:

1. **Underlying Column:**
   - The original column must exist and be of `string` [Arrow data type](../../reference/datatypes/accelerators.md).
2. **Naming Convention:**
   - The embedding column must be named `<column_name>_embedding` (e.g., `review_embedding` for a `review` column).
3. **Data Type:**
   - The embedding column must be:
     - `FixedSizeList[Float32 or Float64, N]` for unchunked data, where `N` is the embedding vector size.
     - `List[FixedSizeList[Float32 or Float64, N]]` for chunked data.
4. **Offset Column (for chunked data):**
   - If chunked, an offset column `<column_name>_offsets` must exist with type `List[FixedSizeList[Int32, 2]]`, where each pair `[start, end]` maps a chunk to its text segment.
   - Example: `[[0, 100], [101, 200]]` means two chunks covering indices 0–100 and 101–200.

Following these guidelines ensures that the dataset's pre-existing embeddings are fully compatible with Spice.

## Advanced Configuration

### Chunking

Spice supports chunking large text columns before embedding, which is useful for [Document Tables](/docs/components/data-connectors/index.md#document-support). Chunking helps return only the most relevant text during search. Configure chunking in the embedding config:

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

The `body` column will be split into chunks of about 512 tokens, preserving sentence and semantic boundaries. See the [API reference](/docs/reference/spicepod/datasets#columns-embeddings-chunking) for details.

#### Row Identifiers

The `row_id` field specifies which column(s) uniquely identify each row, similar to a primary key. This is important for chunked embeddings, so that operations (e.g., [`v1/search`](/docs/api/HTTP/post-search)) can map multiple chunked vectors to a single row. Set `row_id` in `columns[*].embeddings[*].row_id`.

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
