---
title: 'Reranker Models'
sidebar_label: 'Rerankers'
description: 'Overview of the reranker model providers that Spice supports to reorder search results by relevance.'
sidebar_position: 6.5
pagination_prev: null
pagination_next: null
tags:
  - components
  - rerankers
  - search
---

A reranker model scores a set of candidate documents against a query, and returns one relevance score for each document. Spice uses rerankers in the [`rerank()`](../../reference/sql/search.md#reranking-rerank) SQL table function, to reorder the results of `vector_search`, `text_search`, `rrf`, or a plain table. For the retrieve-then-rerank pattern, see [Reranking](../../features/search/rerank.md).

Define rerankers in the `rerankers:` section of the Spicepod. The prefix of the `from` field selects the provider:

| Name                         | `from` format                                      | Runs              | Description                                                           |
| ---------------------------- | -------------------------------------------------- | ----------------- | --------------------------------------------------------------------- |
| [`cohere`][cohere]           | `cohere:<model_id>`                                | Hosted API        | Cohere Rerank API                                                     |
| [`voyage`][voyage]           | `voyage:<model_id>`                                | Hosted API        | Voyage AI Rerank API                                                  |
| [`jina`][jina]               | `jina:<model_id>`                                  | Hosted API        | Jina AI Reranker API                                                  |
| [HTTP][http]                 | `http://<url>` or `https://<url>`                  | Any HTTP endpoint | A self-hosted or third-party endpoint with a Cohere-compatible schema |
| [`huggingface`][huggingface] | `huggingface:huggingface.co/<org>/<model>[:<rev>]` | Local, in-process | A cross-encoder reranker downloaded from the Hugging Face Hub         |
| [`file`][file]               | `file:<path>`                                      | Local, in-process | A cross-encoder reranker loaded from a local directory                |

[cohere]: ./cohere.md
[voyage]: ./voyage.md
[jina]: ./jina.md
[http]: ./http.md
[huggingface]: ./huggingface.md
[file]: ./file.md

Each provider also accepts `/` in place of `:` after the provider name, for example `cohere/rerank-v3.5`. `hf:` is a short form of `huggingface:`.

Rerankers are available in Spice v2.0 and later. The `huggingface` and `file` providers are available in v2.2 and later.

## Chat and Decision Models as Rerankers

A reranker is not the only model that `rerank()` can use. A [chat model](../models/index.md) or a [decision model](../../features/large-language-models/decisions.md) that is defined in the `models:` section can also rerank, with no entry in `rerankers:`. For how Spice selects the path for these models, see [Model Resolution](../../features/search/rerank.md#model-resolution).

| Model type     | Configured in | Score                                                          |
| -------------- | ------------- | -------------------------------------------------------------- |
| Reranker       | `rerankers:`  | The relevance score that the reranker returns.                 |
| Chat model     | `models:`     | A score from 0 to 1 that the LLM gives, listwise or pointwise. |
| Decision model | `models:`     | The probability, from 0 to 1, that the document is relevant.   |

## Configuration

```yaml
rerankers:
  - from: cohere:rerank-v3.5
    name: cohere_rr
    description: Reranks support articles
    params:
      api_key: ${secrets:COHERE_API_KEY}
```

| Field         | Required | Description                                                                                                        |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `from`        | Yes      | The provider prefix and model. See the table above.                                                                |
| `name`        | Yes      | A unique name. Use this name as the `model` argument of `rerank()`.                                                |
| `description` | No       | A description of the reranker.                                                                                     |
| `params`      | No       | Provider parameters. Each provider page lists its parameters. Values can use [secrets](../secret-stores/index.md). |
| `dependsOn`   | No       | Components that must load before this reranker.                                                                    |

For the full field reference, see [`rerankers`](../../reference/spicepod/rerankers.md).

## Usage

Use the reranker `name` as the `model` argument of `rerank()`:

```sql
SELECT * FROM rerank(
  vector_search(docs, 'delta lake time travel', limit => 50),
  document => 'content',
  model    => 'cohere_rr',
  limit    => 10
);
```

The `rerank_score` column contains the score from the reranker. A dedicated reranker ignores the `strategy` argument, and the query fails when it sets `via` or `prompt_template`.

## Loading and Readiness

At startup, Spice loads each reranker, then sends one test request (the query `health check` and the document `ok`) to make sure that the reranker works. For a hosted provider, this request uses the API key and counts toward the provider's usage.

When the load or the test request fails:

- Spice logs a warning that names the reranker and the error, for example `Failed to load Reranker cohere_rr. Reranker 'cohere_rr' failed health check: ... 401 Unauthorized ...`.
- The reranker is not registered. A `rerank()` query that names it fails with `model '<name>' not found in rerankers, chat models, or evaluation models`.
- With the default runtime [`ready_state`](../../reference/spicepod/runtime.md#runtimeready_state) of `on_load`, [`/v1/ready`](../../api/HTTP/ready.api.mdx) returns `503`.

Spice loads rerankers only at startup. Spice does not retry a reranker that failed to load, and a change to the `rerankers:` section does not reload rerankers, also when the Spicepod watcher is on. After you correct the configuration, restart the runtime.

Rerankers require the `models` feature, which the default `spiced` build includes. A build without it logs an error and loads no rerankers.

Spice exports these metrics for rerankers. See [Observability](../../features/observability/index.md) for the full list.

| Metric                   | Description                                                                      |
| ------------------------ | -------------------------------------------------------------------------------- |
| `rerankers_active_count` | The number of rerankers that loaded, with the `reranker` label.                  |
| `rerankers_load_errors`  | The number of errors when loading rerankers.                                     |
| `rerankers_load_state`   | The status of each reranker, with the `model` label. `1` is ready, `3` is error. |

import DocCardList from '@theme/DocCardList';

<DocCardList />
