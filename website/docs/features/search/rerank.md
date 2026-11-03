---
title: 'Reranking'
sidebar_label: 'Reranking'
description: 'Rerank search results using dedicated reranker models, chat models, or decision models for improved relevance.'
sidebar_position: 4
tags:
  - search
  - features
---

Reranking reorders a set of candidate results — from `vector_search`, `text_search`, `rrf`, or a plain table — using a dedicated reranker model, a chat model, or a decision model. This produces more relevant rankings than the initial retrieval scores alone.

## How It Works

1. An initial search (vector, full-text, or hybrid) retrieves candidate documents.
2. The `rerank()` UDTF sends each candidate's text to a reranker model alongside the query.
3. The reranker scores each document for relevance and returns them in order.

This two-stage pattern (retrieve then rerank) is standard in modern search and RAG pipelines.

## Configuration

### Reranker Models

Define dedicated reranker models in the `rerankers:` section of the Spicepod. Each provider has its own page with its parameters and behavior:

| Provider                                                      | `from` format                                      | Runs              |
| ------------------------------------------------------------- | -------------------------------------------------- | ----------------- |
| [Cohere](../../components/rerankers/cohere.md)                   | `cohere:<model_id>`                                | Hosted API        |
| [Voyage AI](../../components/rerankers/voyage.md)                | `voyage:<model_id>`                                | Hosted API        |
| [Jina AI](../../components/rerankers/jina.md)                    | `jina:<model_id>`                                  | Hosted API        |
| [HTTP](../../components/rerankers/http.md)                       | `http://<url>` or `https://<url>`                  | Any HTTP endpoint with a Cohere-compatible schema |
| [Hugging Face](../../components/rerankers/huggingface.md)        | `huggingface:huggingface.co/<org>/<model>[:<rev>]` | Local, in-process |
| [File](../../components/rerankers/file.md)                       | `file:<path>`                                      | Local, in-process |

```yaml
rerankers:
  - from: cohere:rerank-v3.5
    name: cohere_rr
    params:
      api_key: ${secrets:COHERE_API_KEY}

  - from: https://rerank.internal/v1/rerank
    name: byo_rr
    params:
      api_key: ${secrets:INTERNAL_RR_KEY}  # optional

  # Runs locally. Downloaded from the Hugging Face Hub at startup.
  - from: huggingface:huggingface.co/BAAI/bge-reranker-base
    name: local_rr
```

For the reranker fields, startup behavior, and metrics, see [Reranker Models](../../components/rerankers/index.md).

### LLM-as-Reranker

Any registered chat model can also be used as a reranker without additional configuration. When a model name resolves to a chat model instead of a dedicated reranker, Spice wraps it in an LLM-based reranking adapter. A model with a native decisions API, such as OpenAI `gpt-6-luna`, reranks as a [decision model](#decision-models-as-rerankers) instead, unless the call sets `via => 'chat'` or a `prompt_template`.

```yaml
models:
  - from: openai:gpt-4o-mini
    name: gpt_mini
```

```sql
SELECT * FROM rerank(
  vector_search(kb, 'onboarding checklist', limit => 40),
  document => 'content',
  model    => 'gpt_mini',       -- resolves to the registered chat model
  strategy => 'pointwise',      -- or 'listwise' (default)
  limit    => 10
);
```

The `strategy` parameter controls how the LLM scores documents:
- **`listwise`** (default): sends all candidates in a single prompt and asks the LLM to rank them.
- **`pointwise`**: sends each candidate individually and asks the LLM to score it.

### Decision Models as Rerankers

A [decision model](../large-language-models/decisions.md), such as [TypeSafe Jev](../../components/models/typesafe.md), can also be used as a reranker without additional configuration. Spice asks the model whether each document is relevant to the query and uses the returned probability, a value between 0 and 1, as the document's `rerank_score`.

```yaml
models:
  - from: typesafe:jev
    name: jev
    params:
      typesafe_api_key: ${secrets:TYPESAFE_API_KEY}
```

```sql
SELECT * FROM rerank(
  vector_search(kb, 'onboarding checklist', limit => 40),
  document => 'content',
  model    => 'jev',            -- resolves to the registered decision model
  strategy => 'listwise',       -- or 'pointwise' (default)
  limit    => 10
);
```

For decision models, the `strategy` parameter controls how many requests are sent:

- **`pointwise`** (default): sends one request per candidate. Requests run concurrently, subject to the model's own rate limits, and each score is independent of the other candidates.
- **`listwise`**: sends all candidates in a single request, with one relevance question per candidate.

The question is fixed, so `prompt_template` does not apply to decision models. If the model fails for any candidate, or returns an answer that is not a probability between 0 and 1, the whole `rerank()` query fails.

OpenAI `gpt-6-luna` and its dated snapshots serve both chat and decisions, and rerank through the Decisions API by default, scored the same way. A chat model without a native decisions API, such as `gpt-4o-mini`, can also rerank this way with `via => 'decisions'`, through its chat adapter.

### Model Resolution

A dedicated reranker named by `model` is always used as is. Any other model reranks through one of two paths, which the optional `via` argument selects:

| `via`         | `prompt_template` | Path |
| ------------- | ----------------- | ---- |
| Not set       | Not set           | Decisions when the model has a native decisions API (TypeSafe models, OpenAI `gpt-6-luna`), otherwise chat. When the model has no handler for that path, the other path is used. |
| Not set       | Set               | Chat, with the template. |
| `'chat'`      | Optional          | Chat. |
| `'decisions'` | Not set           | Decisions. A chat model answers through its chat adapter. |
| `'decisions'` | Set               | The query fails: the decisions path asks a fixed question. |

`via` and `prompt_template` apply only to chat and decision models; setting either for a dedicated reranker fails the query. A model that has no chat completions, such as TypeSafe Jev, cannot use `via => 'chat'` or `prompt_template`, and the query fails with an error that says to remove them. On the chat path, `strategy` defaults to `listwise`; on the decisions path, to `pointwise`. Dedicated rerankers ignore `strategy`.

In v2.4.1 and earlier, the `model` name was looked up in this order: dedicated rerankers, then chat models, then decision models, and `via` did not exist. OpenAI `gpt-6-luna` therefore reranked through chat completions with the listwise strategy, and its `rerank_score` was a relative score from one prompt. It now reranks through the Decisions API with the pointwise strategy, one request per candidate, and its `rerank_score` is the probability that the document is relevant. Add `via => 'chat'` to keep the earlier behavior. A `prompt_template` passed to a decision model with no chat completions was ignored in v2.4.1 and earlier, and now fails the query.

## SQL Usage

```sql
SELECT * FROM rerank(
  <input>,
  document => '<column>',
  model    => '<reranker_name>',
  limit    => <n>
);
```

For the complete parameter reference, see [Reranking SQL Reference](../../reference/sql/search#reranking-rerank).

## Examples

### Hybrid Recall + Rerank

```sql
SELECT * FROM rerank(
  rrf(
    vector_search(docs, 'delta lake time travel', limit => 50),
    text_search(docs, 'delta lake time travel', limit => 50)
  ),
  document => 'content',
  model    => 'cohere_rr',
  limit    => 10
);
```

The query is automatically extracted from the nested search UDTFs — no need to specify `query` explicitly.

### Bare-Table Rerank

When reranking a plain table (not a search UDTF), provide the `query` explicitly:

```sql
SELECT * FROM rerank(
  tickets,
  query    => 'auth failures',
  document => 'body',
  model    => 'voyage_rr',
  limit    => 5
);
```

### Custom LLM Prompt

```sql
SELECT * FROM rerank(
  vector_search(kb, 'onboarding checklist', limit => 40),
  document        => 'content',
  model           => 'gpt_mini',
  strategy        => 'pointwise',
  prompt_template => 'Rate 0-1: is this useful for a new hire?\nQuery: {query}\nDoc: {document}',
  limit           => 10
);
```
