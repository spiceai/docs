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

### LLM-as-Reranker and Decision Models

A chat model or a [decision model](../large-language-models/decisions.md) from the `models:` section can also rerank, with no entry in `rerankers:`. A chat model scores candidates from a prompt, listwise (all candidates in one prompt, the default) or pointwise (one prompt for each candidate). A decision model returns the probability that each document is relevant.

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
  limit    => 10
);
```

For strategies, prompt templates, the `via` argument, and how Spice selects the path for a model, see [LLM and Decision Model Rerankers](../../components/rerankers/llm.md).

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
  prompt_template => 'Is this document useful for a new hire? Query: {query} Document: {document} Return only a JSON object of the form {"score": <number from 0 to 1>}.',
  limit           => 10
);
```
