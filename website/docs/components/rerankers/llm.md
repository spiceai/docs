---
title: 'LLM and Decision Model Rerankers'
sidebar_label: 'LLM-as-Reranker'
description: 'Use a chat model or a decision model from the models section as a reranker, with no reranker configuration.'
sidebar_position: 7
tags:
  - rerankers
  - search
  - models
---

A chat model or a [decision model](../../features/large-language-models/decisions.md) that is defined in the `models:` section can rerank search results. Use the model name as the `model` argument of [`rerank()`](../../reference/sql/search.md#reranking-rerank). An entry in `rerankers:` is not necessary.

```yaml
models:
  - from: openai:gpt-4o-mini
    name: gpt_mini
    params:
      openai_api_key: ${secrets:OPENAI_API_KEY}
```

```sql
SELECT * FROM rerank(
  vector_search(kb, 'onboarding checklist', limit => 40),
  document => 'content',
  model    => 'gpt_mini',
  limit    => 10
);
```

An LLM can follow a custom instruction, for example "rank documents that a new hire can use first", which a dedicated [reranker](./index.md) cannot. An LLM is also slower and more expensive for each candidate than a dedicated reranker. Use a small candidate set, for example `limit => 20` to `limit => 50` on the inner search.

Spice reranks with a model through one of two paths:

| Path      | Request                                                                                       | `rerank_score`                                               |
| --------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Chat      | A chat completion with a prompt that asks for relevance scores as JSON.                       | The score from 0 to 1 that the model writes in its reply.    |
| Decisions | A decision request with the question "Is `document` relevant to `query`?" for each candidate. | The probability, from 0 to 1, that the document is relevant. |

## Model Resolution

A dedicated reranker named by `model` is always used as is. Any other model reranks through one of two paths, which the optional `via` argument selects:

| `via`         | `prompt_template` | Path                                                                                                                                                                                                      |
| ------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Not set       | Not set           | Decisions when the model has a native decisions API ([TypeSafe](../models/typesafe.md) models, OpenAI `gpt-6-luna`), otherwise chat. When the model has no handler for that path, the other path is used. |
| Not set       | Set               | Chat, with the template.                                                                                                                                                                                  |
| `'chat'`      | Optional          | Chat.                                                                                                                                                                                                     |
| `'decisions'` | Not set           | Decisions. A chat model answers through its chat adapter.                                                                                                                                                 |
| `'decisions'` | Set               | The query fails: the decisions path asks a fixed question.                                                                                                                                                |

`via` and `prompt_template` apply only to chat and decision models. When either is set for a dedicated reranker, the query fails. A model that has no chat completions, such as TypeSafe Jev, cannot use `via => 'chat'` or `prompt_template`, and the query fails with an error that says to remove them.

On the chat path, `strategy` defaults to `listwise`. On the decisions path, it defaults to `pointwise`.

## Chat Path

### Strategies

| `strategy`           | Requests for N candidates | Description                                                                                                                               |
| -------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `listwise` (default) | 1                         | Spice sends all candidates in one prompt, as a numbered list, and asks for a JSON array of `{"id": <1-based number>, "score": <0 to 1>}`. |
| `pointwise`          | N, one after the other    | Spice sends one prompt for each candidate and asks for a JSON object `{"score": <0 to 1>}`.                                               |

Use `listwise` for the lowest cost and latency. The model sees all candidates together, so each score is relative to the other candidates. Use `pointwise` when each score must not depend on the other candidates, or when the candidates together are too long for the model's context window. Pointwise requests run one after the other, so the latency increases with the number of candidates. `strategy` also accepts `list` and `point`.

### Prompt Templates

Spice sends the prompt as a single user message. The default prompts are:

<details>
<summary>Default listwise prompt</summary>

```text
You are a relevance reranker. Given a query and a numbered list of documents, rank the documents by how well they answer the query. For each document, return a JSON object with `id` (the 1-based index) and `score` (a relevance score from 0.0 to 1.0 where 1.0 is maximally relevant). Return ONLY a JSON array of these objects, with no surrounding prose. Include an entry for every document in the input.

Query: {query}

Documents:
{documents}

Response (JSON array only):
```

`{documents}` becomes one line for each candidate: `1. <first document>`, `2. <second document>`, and so on.

</details>

<details>
<summary>Default pointwise prompt</summary>

```text
Score how relevant the following document is to the query, on a scale of 0.0 (irrelevant) to 1.0 (maximally relevant). Return ONLY a JSON object of the form {"score": <number>}, with no surrounding prose.

Query: {query}

Document: {document}

Response (JSON only):
```

</details>

To replace the default prompt, set `prompt_template`. A custom template changes only the prompt. It does not change how Spice reads the reply, so the template must ask for the same JSON as the default prompt for its strategy:

| `strategy`  | Placeholders             | The reply must contain                         |
| ----------- | ------------------------ | ---------------------------------------------- |
| `listwise`  | `{query}`, `{documents}` | A JSON array: `[{"id": 1, "score": 0.9}, ...]` |
| `pointwise` | `{query}`, `{document}`  | A JSON object: `{"score": 0.9}`                |

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

Spice replaces each placeholder one time, so a query or document that contains the text `{document}` is sent as is. A SQL string literal does not convert `\n` to a new line.

### Reading the Reply

Spice removes a Markdown code fence (` ```json ... ``` `) and text before or after the JSON, then reads the JSON.

- **Listwise**: a candidate that has no entry in the array gets the score `0`. Spice ignores an entry with an `id` that is out of range.
- **Pointwise**: when a reply has no JSON object with a `score`, the query fails.

When the reply cannot be read, the query fails with an error that shows the reply:

```text
Reranker model 'gpt_mini' returned an unparseable response. Expected a JSON array of {id, score} (listwise) or object {score} (pointwise), but the model returned: 0.8
```

## Decisions Path

A [decision model](../../features/large-language-models/decisions.md), such as [TypeSafe Jev](../models/typesafe.md), reranks through the decisions path by default. For each candidate, Spice asks whether the document is relevant to the query, and uses the returned probability as `rerank_score`.

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
  model    => 'jev',
  limit    => 10
);
```

| `strategy`            | Requests for N candidates | Description                                                                                                                                               |
| --------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pointwise` (default) | N, concurrent             | One request for each candidate. Requests run at the same time, subject to the model's own rate limits. Each score is independent of the other candidates. |
| `listwise`            | 1                         | One request with all candidates, with one relevance question for each candidate.                                                                          |

The question is fixed, so `prompt_template` does not apply to the decisions path. When the model fails for a candidate, or returns an answer that is not a probability from 0 to 1, the whole `rerank()` query fails.

OpenAI `gpt-6-luna` and its dated snapshots serve both chat and decisions, and rerank through the Decisions API by default. A chat model without a native decisions API, such as `gpt-4o-mini`, can also rerank through the decisions path with `via => 'decisions'`. Spice then asks the model, through chat completions, for a JSON object with the probability for each question.

```sql
SELECT * FROM rerank(
  vector_search(kb, 'onboarding checklist', limit => 40),
  document => 'content',
  model    => 'gpt_mini',
  via      => 'decisions',
  limit    => 10
);
```

## Errors

| Error                                                                                                              | Cause                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `rerank: model '<name>' not found in rerankers, chat models, or evaluation models.`                                | No reranker or model has this name, or the model did not load.                                                 |
| `rerank: model '<name>' is a native reranker; 'via' and 'prompt_template' apply only to decision and chat models.` | `via` or `prompt_template` is set for a dedicated reranker.                                                    |
| `rerank: 'prompt_template' applies only to via => 'chat'; the decisions path asks a fixed relevance question.`     | `prompt_template` is set with `via => 'decisions'`.                                                            |
| `Unknown reranker strategy '<value>'. Use 'listwise' or 'pointwise'.`                                              | `strategy` has a value that is not known.                                                                      |
| `rerank: unknown via '<value>'. Expected 'chat' or 'decisions'.`                                                   | `via` has a value that is not known.                                                                           |
| `Reranker model '<name>' returned an unparseable response. ...`                                                    | The chat reply does not contain the JSON that the strategy needs. See [Reading the Reply](#reading-the-reply). |

## Changes After v2.4.1

In v2.4.1 and earlier, the `model` name was looked up in this order: dedicated rerankers, then chat models, then decision models, and `via` did not exist. OpenAI `gpt-6-luna` therefore reranked through chat completions with the listwise strategy, and its `rerank_score` was a relative score from one prompt. It now reranks through the Decisions API with the pointwise strategy, one request per candidate, and its `rerank_score` is the probability that the document is relevant. Add `via => 'chat'` to keep the earlier behavior. A `prompt_template` passed to a decision model with no chat completions was ignored in v2.4.1 and earlier, and now fails the query.
