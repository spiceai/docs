---
title: 'Jina AI Rerankers'
sidebar_label: 'Jina AI'
description: 'Configure the Jina AI reranker in Spice to rerank search results with the Jina AI API.'
sidebar_position: 3
tags:
  - rerankers
  - search
---

To use the [Jina AI rerank API](https://jina.ai/reranker/) as a reranker, set the `from` field to `jina:<model_id>` and set the `api_key` parameter.

```yaml
rerankers:
  - from: jina:jina-reranker-v2-base-multilingual
    name: jina_rr
    params:
      api_key: ${secrets:JINA_API_KEY}
```

## Configuration

### `from`

The `from` field has the format `jina:<model_id>`, or `jina/<model_id>`. Spice sends `<model_id>` as the `model` field of each request. For the list of models, see [Jina Reranker](https://jina.ai/reranker/). For example: `jina-reranker-v2-base-multilingual`.

### `name`

A unique name for the reranker. Use this name as the `model` argument of [`rerank()`](../../reference/sql/search.md#reranking-rerank).

### `params`

| Parameter  | Required | Description                                                                                                | Default                         |
| ---------- | -------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `api_key`  | Yes      | The Jina AI API key. Spice sends it as `Authorization: Bearer <api_key>`. Also accepted as `jina_api_key`. | -                               |
| `endpoint` | No       | The full URL of the rerank endpoint, not a base URL. Set it to use a proxy or a regional endpoint.         | `https://api.jina.ai/v1/rerank` |

Use a [secret](../secret-stores/index.md) for the API key, as the example shows.

## Usage

```sql
SELECT * FROM rerank(
  vector_search(docs, 'delta lake time travel', limit => 50),
  document => 'content',
  model    => 'jina_rr',
  limit    => 10
);
```

Spice sends all candidate documents for one query in one request, and uses the `relevance_score` that Jina AI returns for each document as `rerank_score`. When the response does not contain exactly one score for each document, the query fails.

At startup, Spice sends one test request to Jina AI to make sure that the API key and model work. This request counts toward your Jina AI usage. See [Loading and Readiness](./index.md#loading-and-readiness).
