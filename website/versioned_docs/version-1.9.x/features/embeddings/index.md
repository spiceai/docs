---
title: 'Embedding Datasets'
sidebar_label: 'Embedding Datasets'
description: 'Learn how to define, or augment existing datasets with embedding column(s).'
sidebar_position: 9
pagination_prev: null
pagination_next: null
---

Learn how to define and augment datasets with embedding columns for advanced search capabilities.

## Overview

Spice provides three distinct methods for handling embedding columns in datasets:

1. **[Just-in-Time (JIT) Embeddings](../../components/embeddings#jit-embeddings)**: Dynamically computes embeddings, on-demand, during query execution, without precomputing data.
2. **[Accelerated Embeddings](../../components/embeddings#accelerated-embeddings)**: Precomputes embeddings by transforming and augmenting the source dataset for faster query and search performance.
3. **[Passthrough Embeddings](../../components/embeddings#passthrough-embeddings)**: Utilizes pre-existing embeddings directly from the underlying source datasets, bypassing any additional computation.

## Configuring Embedding Models

Before configuring dataset embeddings define the embedding models in the `spicepod.yaml`, for example:

```yaml
embeddings:
  - name: local_embedding_model
    from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2

  - from: openai
    name: remote_service
    params:
      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }
```

See [Embedding components](../../components/embeddings/) for more information on embedding models.

## Vector Searches

Spice supports complex searches by utilizing embeddings. Both local and remote embedding models can be used for vector searches.

To run a vector search, embeddings must be defined for the relevant columns in your dataset. Once configured, similarity searches can be performed using the defined embeddings.

For detailed instructions and examples on running vector searches, refer to the [Vector-Based Search documentation](../../features/search/vector-search).

## Generating Embeddings in Queries

The [`embed()` scalar function](../../reference/sql/scalar_functions#embed) allows you to generate embeddings directly within SQL queries. This function can process both single text strings and arrays of text, making it useful for ad-hoc embedding generation and comparison operations.
