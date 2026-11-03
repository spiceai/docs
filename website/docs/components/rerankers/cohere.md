---
title: 'Cohere Rerankers'
sidebar_label: 'Cohere'
description: 'Configure the Cohere reranker in Spice to rerank search results with the Cohere API.'
sidebar_position: 1
tags:
  - rerankers
  - search
---

To use the [Cohere rerank API](https://docs.cohere.com/reference/rerank) as a reranker, set the `from` field to `cohere:<model_id>` and set the `api_key` parameter.

```yaml
rerankers:
  - from: cohere:rerank-v3.5
    name: cohere_rr
    params:
      api_key: ${secrets:COHERE_API_KEY}
```

## Configuration

### `from`

The `from` field has the format `cohere:<model_id>`, or `cohere/<model_id>`. Spice sends `<model_id>` as the `model` field of each request. For the list of models, see [Cohere Rerank](https://docs.cohere.com/docs/rerank). For example: `rerank-v3.5`, `rerank-english-v3.0`, `rerank-multilingual-v3.0`.

### `name`

A unique name for the reranker. Use this name as the `model` argument of [`rerank()`](../../reference/sql/search.md#reranking-rerank).

### `params`

| Parameter  | Required | Description                                                                                                 | Default                            |
| ---------- | -------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `api_key`  | Yes      | The Cohere API key. Spice sends it as `Authorization: Bearer <api_key>`. Also accepted as `cohere_api_key`. | -                                  |
| `endpoint` | No       | The full URL of the rerank endpoint, not a base URL. Set it to use a proxy or a regional endpoint.          | `https://api.cohere.com/v1/rerank` |

Use a [secret](../secret-stores/index.md) for the API key, as the example shows.

## Usage

```sql
SELECT * FROM rerank(
  vector_search(docs, 'delta lake time travel', limit => 50),
  document => 'content',
  model    => 'cohere_rr',
  limit    => 10
);
```

Spice sends all candidate documents for one query in one request, and uses the `relevance_score` that Cohere returns for each document as `rerank_score`. When the response does not contain exactly one score for each document, the query fails.

At startup, Spice sends one test request to Cohere to make sure that the API key and model work. This request counts toward your Cohere usage. See [Loading and Readiness](./index.md#loading-and-readiness).
