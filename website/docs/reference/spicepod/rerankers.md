---
title: 'Rerankers'
sidebar_label: 'Rerankers'
description: 'Rerankers YAML reference'
---

Rerankers score candidate documents against a query, to reorder search results by relevance. The [`rerank()`](../sql/search.md#reranking-rerank) SQL table function uses them. For the list of providers, see [Reranker Models](../../components/rerankers/index.md).

## `rerankers`

The `rerankers` section in the Spicepod specifies one or more reranker models.

Example:

```yaml
rerankers:
  - from: cohere:rerank-v3.5
    name: cohere_rr
    description: Reranks support articles
    params:
      api_key: ${secrets:COHERE_API_KEY}

  - from: huggingface:huggingface.co/BAAI/bge-reranker-base
    name: local_rr
    params:
      truncate: end
```

### `from`

Required. The source of the reranker. The prefix selects the provider:

- [`cohere:<model_id>`](../../components/rerankers/cohere.md) - Cohere Rerank API
- [`voyage:<model_id>`](../../components/rerankers/voyage.md) - Voyage AI Rerank API
- [`jina:<model_id>`](../../components/rerankers/jina.md) - Jina AI Reranker API
- [`http://<url>` or `https://<url>`](../../components/rerankers/http.md) - An HTTP endpoint with a Cohere-compatible rerank schema
- [`huggingface:huggingface.co/<org>/<model>[:<revision>]`](../../components/rerankers/huggingface.md) (or `hf:`) - A local cross-encoder downloaded from the Hugging Face Hub
- [`file:<path>`](../../components/rerankers/file.md) - A local cross-encoder loaded from a directory

A `from` value with a different prefix fails to load.

### `name`

Required. A unique name for the reranker. Use this name as the `model` argument of `rerank()`. Two rerankers with the same name fail the Spicepod.

### `description`

Optional. A description of the reranker.

### `params`

Optional. A map of parameters for the provider. Each [provider page](../../components/rerankers/index.md) lists the parameters it accepts. Spice ignores an unknown parameter and logs a warning, which suggests the closest known parameter.

### `dependsOn`

Optional. A list of components that must load before this reranker.
