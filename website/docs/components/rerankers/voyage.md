---
title: 'Voyage AI Rerankers'
sidebar_label: 'Voyage AI'
description: 'Configure the Voyage AI reranker in Spice to rerank search results with the Voyage AI API.'
sidebar_position: 2
tags:
  - rerankers
  - search
---

To use the [Voyage AI rerank API](https://docs.voyageai.com/reference/reranker-api) as a reranker, set the `from` field to `voyage:<model_id>` and set the `api_key` parameter.

```yaml
rerankers:
  - from: voyage:rerank-2
    name: voyage_rr
    params:
      api_key: ${secrets:VOYAGE_API_KEY}
```

## Configuration

### `from`

The `from` field has the format `voyage:<model_id>`, or `voyage/<model_id>`. Spice sends `<model_id>` as the `model` field of each request. For the list of models, see [Voyage AI rerankers](https://docs.voyageai.com/docs/reranker). For example: `rerank-2`, `rerank-lite-1`.

### `name`

A unique name for the reranker. Use this name as the `model` argument of [`rerank()`](../../reference/sql/search.md#reranking-rerank).

### `params`

| Parameter  | Required | Description                                                                                                    | Default                              |
| ---------- | -------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `api_key`  | Yes      | The Voyage AI API key. Spice sends it as `Authorization: Bearer <api_key>`. Also accepted as `voyage_api_key`. | -                                    |
| `endpoint` | No       | The full URL of the rerank endpoint, not a base URL. Set it to use a proxy or a regional endpoint.             | `https://api.voyageai.com/v1/rerank` |

Use a [secret](../secret-stores/index.md) for the API key, as the example shows.

## Usage

```sql
SELECT * FROM rerank(
  vector_search(docs, 'delta lake time travel', limit => 50),
  document => 'content',
  model    => 'voyage_rr',
  limit    => 10
);
```

Spice sends all candidate documents for one query in one request, and uses the `relevance_score` that Voyage AI returns for each document as `rerank_score`. When the response does not contain exactly one score for each document, the query fails.

At startup, Spice sends one test request to Voyage AI to make sure that the API key and model work. This request counts toward your Voyage AI usage. See [Loading and Readiness](./index.md#loading-and-readiness).
