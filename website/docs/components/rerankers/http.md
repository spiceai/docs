---
title: 'HTTP Rerankers'
sidebar_label: 'HTTP'
description: 'Connect Spice to a self-hosted or third-party reranker service over HTTP with a Cohere-compatible rerank schema.'
sidebar_position: 4
tags:
  - rerankers
  - search
---

To use a reranker service that Spice does not have a provider for, set the `from` field to the URL of the rerank endpoint. The URL must start with `http://` or `https://`. The service must accept and return the Cohere-compatible schema in [API Schema](#api-schema). Make sure that the service returns a `results` array with a `relevance_score` for each document; a service with a different response shape does not work.

```yaml
rerankers:
  - from: https://rerank.internal/v1/rerank
    name: byo_rr
    params:
      api_key: ${secrets:INTERNAL_RR_KEY} # optional
      model: bge-reranker-v2-m3 # optional
```

## Configuration

### `from`

The full URL of the rerank endpoint. Spice sends a `POST` request to this URL. Spice does not add a path to it.

### `name`

A unique name for the reranker. Use this name as the `model` argument of [`rerank()`](../../reference/sql/search.md#reranking-rerank).

### `params`

All parameters are optional.

| Parameter | Description                                                                                                                                                               | Default |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `api_key` | A token that Spice sends as `Authorization: Bearer <api_key>`. When not set, Spice sends no `Authorization` header.                                                       | -       |
| `model`   | A model ID that Spice sends as the `model` field of the request. When not set, Spice does not send the `model` field. Set it when the service serves more than one model. | -       |

## API Schema

For each `rerank()` query, Spice sends all candidate documents in one request.

Request:

```json
{
  "query": "what is spice",
  "documents": ["apples are red", "spice is fast", "bananas"],
  "model": "bge-reranker-v2-m3"
}
```

The response must contain a `results` array. Each entry has the position of a document in the request (`index`, starting at 0) and its score (`relevance_score`):

```json
{
  "results": [
    { "index": 1, "relevance_score": 0.92 },
    { "index": 0, "relevance_score": 0.11 },
    { "index": 2, "relevance_score": 0.03 }
  ]
}
```

The order of the entries in `results` is not important. Spice uses `relevance_score` as the `rerank_score` of the document at `index`, and ignores other fields. Spice is tolerant of responses that are not complete:

- When the response has no entry for a document, the document gets the score `0`.
- Spice ignores an entry with an `index` that is out of range.

A response with an HTTP error status, or a body that is not in this schema, fails the query.

## Usage

```sql
SELECT * FROM rerank(
  tickets,
  query    => 'auth failures',
  document => 'body',
  model    => 'byo_rr',
  limit    => 5
);
```

At startup, Spice sends one test request to the endpoint, with the query `health check` and the document `ok`. The endpoint must be available at startup, or the reranker does not load. See [Loading and Readiness](./index.md#loading-and-readiness).
