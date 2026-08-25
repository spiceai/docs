---
title: 'Reranking'
sidebar_label: 'Reranking'
description: 'Rerank search results using dedicated reranker models or LLM-as-reranker for improved relevance.'
sidebar_position: 4
tags:
  - search
  - features
---

Reranking reorders a set of candidate results — from `vector_search`, `text_search`, `rrf`, or a plain table — using a dedicated reranker model. This produces more relevant rankings than the initial retrieval scores alone.

## How It Works

1. An initial search (vector, full-text, or hybrid) retrieves candidate documents.
2. The `rerank()` UDTF sends each candidate's text to a reranker model alongside the query.
3. The reranker scores each document for relevance and returns them in order.

This two-stage pattern (retrieve then rerank) is standard in modern search and RAG pipelines.

## Configuration

### Reranker Models

Define dedicated reranker models in the `rerankers:` section of the spicepod. Supported providers:

| Provider prefix | Description |
| --------------- | ----------- |
| `cohere:`       | Cohere Rerank API (e.g., `cohere:rerank-v3.5`) |
| `voyage:`       | Voyage Rerank API (e.g., `voyage:rerank-2`) |
| `jina:`         | Jina Rerank API (e.g., `jina:jina-reranker-v2-base-multilingual`) |
| `http://` / `https://` | Any HTTP endpoint implementing the standard rerank API schema |
| `huggingface:` (or `hf:`) | A cross-encoder reranker downloaded from Hugging Face and run locally, in-process (e.g. `huggingface:huggingface.co/BAAI/bge-reranker-base`) |
| `file:`         | A cross-encoder reranker loaded locally from a directory of model artifacts (e.g. `file:/models/bge-reranker-base`) |

```yaml
rerankers:
  - from: cohere:rerank-v3.5
    name: cohere_rr
    params:
      api_key: ${secrets:COHERE_API_KEY}

  - from: voyage:rerank-2
    name: voyage_rr
    params:
      api_key: ${secrets:VOYAGE_API_KEY}

  - from: jina:jina-reranker-v2-base-multilingual
    name: jina_rr
    params:
      api_key: ${secrets:JINA_API_KEY}

  - from: https://rerank.internal/v1/rerank
    name: byo_rr
    params:
      api_key: ${secrets:INTERNAL_RR_KEY}  # optional
```

### Local Rerankers

The `huggingface:` and `file:` prefixes run a cross-encoder reranker in-process instead of calling a hosted API, so no request leaves the runtime. Both are included in the default `spiced` build.

```yaml
rerankers:
  # Downloaded from the Hugging Face Hub. Pin a revision with a trailing `:<rev>`.
  - from: huggingface:huggingface.co/BAAI/bge-reranker-base
    name: local_rr
    params:
      hf_token: ${secrets:HF_TOKEN} # only needed for a private repo

  # Loaded from a directory holding config.json, tokenizer.json, and the weights.
  - from: file:/models/gte-reranker-modernbert-base
    name: dir_rr
```

Both accept the same two tuning parameters:

| Parameter         | Description                                                                                                                                                                | Default |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `max_seq_length`  | Maximum sequence length for the `(query, document)` pair. When unset, the model's own configured maximum applies.                                                            | -       |
| `truncate`        | How to handle a pair longer than the maximum sequence length: `none` rejects the request with an input-validation error, `end` discards the end of the pair, `start` discards the start. Matched case-insensitively. | `none`  |

`huggingface:` rerankers additionally accept `hf_token` (also spelled `api_key`) for private repositories.

### LLM-as-Reranker

Any registered chat model can also be used as a reranker without additional configuration. When a model name resolves to a chat model instead of a dedicated reranker, Spice wraps it in an LLM-based reranking adapter.

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
