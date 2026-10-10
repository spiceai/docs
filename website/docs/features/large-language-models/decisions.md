---
title: 'Decisions'
sidebar_label: 'Decisions'
description: 'Ask typed questions about data in SQL with ai_if, ai_probability, ai_classify, ai_score, and ai_decide, or through the OpenAI-compatible POST /v1/decisions API.'
sidebar_position: 8
pagination_prev: null
pagination_next: null
tags:
  - models
  - llm
  - api
  - sql
  - functions
---

A decision is a typed question about a piece of input: is it true, which option fits, or where it sits on a scale. Spice answers decisions in SQL, with the `ai_if`, `ai_probability`, `ai_classify`, `ai_score`, and `ai_decide` functions, and over HTTP, with `POST /v1/decisions`, which is compatible with [OpenAI's Decisions API](https://developers.openai.com/api/reference/resources/decisions/methods/create). Each answer is computed from the model's probabilities, so a query can filter, route, rank, or set thresholds on the model's judgment. `ai_probability` and `ai_decide` return those probabilities; the other functions return only their scalar, and a question the model refuses carries none.

Any model in the Spicepod can answer a decision:

| Model                   | Example `from`                                     | Probabilities                                                                                                                 |
| ----------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| TypeSafe decision model | `typesafe:jev`                                     | Calibrated by the model. See [TypeSafe Models](../../components/models/typesafe.md).                                          |
| OpenAI decision model   | `openai:gpt-6-luna`                                | The model's estimates. OpenAI recommends setting thresholds from labeled examples.                                            |
| Any chat model          | `openai:gpt-4o-mini`, `anthropic:claude-haiku-4-5` | The model's own estimates. They are not calibrated: a chat model's `0.9` is not a 90% likelihood the way a calibrated model's is. |

A decision model answers decisions only. A request to `/v1/chat/completions` or `/v1/responses` that names one returns `400` and directs the caller to `/v1/decisions`. An OpenAI decision model takes the same parameters as other [OpenAI models](../../components/models/openai/index.md):

```yaml
models:
  - from: openai:gpt-6-luna
    name: luna
    params:
      openai_api_key: ${secrets:OPENAI_API_KEY}
```

A chat model needs no extra configuration or parameters to answer decisions.

## SQL decision functions

| Function                                | Returns                                                                                  |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| `ai_if(input, condition)`               | `BOOLEAN`: true when the probability that `condition` holds is above 0.5.                 |
| `ai_probability(input, condition)`      | `DOUBLE` from 0 to 1: the probability that `condition` holds.                             |
| `ai_classify(input, labels)`            | `VARCHAR`: the label that fits best, always one of `labels`.                              |
| `ai_score(input, instructions, levels)` | `DOUBLE` from 0 to n−1: the probability-weighted, 0-based index of `levels`.               |
| `ai_decide(input, questions)`           | `STRUCT`: an answer to every question in a set, each with its probabilities.               |

The following queries filter, route, rank, and count support tickets:

```sql
-- Filter: the other predicates run first, so the model only sees open tickets.
SELECT id, subject FROM tickets
WHERE status = 'open' AND ai_if(body, 'The customer is asking for a refund');

-- Route and rank: both decisions on `body` share one request per distinct body.
SELECT id,
       ai_classify(body, ['billing', 'technical', 'account']) AS team,
       ai_score(body, 'How frustrated is the customer?', ['calm', 'annoyed', 'furious']) AS frustration
FROM tickets
ORDER BY frustration DESC
LIMIT 20;

-- Tune a threshold, or count the expected matches.
SELECT count(*) FILTER (WHERE ai_probability(body, 'The customer threatens to cancel') >= 0.8) AS at_risk,
       sum(ai_probability(body, 'The customer threatens to cancel')) AS expected_cancellations
FROM tickets;
```

### Arguments

Every argument except `input` must be a constant. Constants are checked when the query is planned, before any model is called, and an invalid one fails the query with the function's usage.

- **`input`**: The text to decide about. A struct, map, or list is sent as JSON, for example `named_struct('subject', subject, 'body', body)`. Other types are sent as text, except binary data, which is refused: cast it to text first, for example with `encode(col, 'hex')`. A NULL `input` returns NULL without a model call.
- **`condition`**, **`instructions`**: Constant text. `ai_classify` takes optional `instructions => '...'`.
- **`labels`**: A list of 2 to 255 labels, such as `['billing', 'technical']`, or a JSON object of label to description, such as `'{"billing": "Payments and refunds", "technical": null}'`. Labels cannot be empty or repeated. Include a fallback label such as `'other'` when no label may fit.
- **`levels`**: A list of 2 to 10 level descriptions, lowest first.
- **`questions`**: A JSON object of question ID to question, described in [Ask several questions with `ai_decide`](#ask-several-questions-with-ai_decide).
- **`model => 'name'`** (optional): The model that answers. When omitted, Spice uses the only model that can answer or, when there are several, the only decision model among them. Otherwise the query fails and lists the models to choose from.
- **`on_error => 'fail' | 'null'`** (optional): What happens to a row the model cannot answer. `'fail'`, the default, stops the query and names the model and the cause, after retrying rate limits and transient failures. `'null'` returns NULL for that row. A NULL in `WHERE` drops the row as if the answer were no, which is why `'null'` is not the default. When the model declines to answer one question of an `ai_decide` call, or of calls that share a request, `'fail'` stops the query, and `'null'` sets only that question's answer to NULL: the other answers from the same request are kept.

For example, to name a model and keep going when a row cannot be answered:

```sql
SELECT id, ai_classify(body, ['billing', 'technical', 'other'], model => 'jev', on_error => 'null') AS team
FROM tickets;
```

### Ask several questions with `ai_decide`

`ai_decide` asks a set of questions in one request and returns every answer. `questions` uses the same grammar as TypeSafe's API and Databricks' `ai_decide`. Each question has a `type` of `noul` (yes or no), `choice`, or `score`, and optional `instructions`. A `choice` maps 1 to 255 non-empty labels to descriptions in `criteria` (`null` when the label says it all), and a `score` lists 2 to 10 levels in `criteria`, lowest first. No question ID or label may repeat.

```sql
SELECT id, ai_decide(body, '{
  "team":   {"type": "choice", "instructions": "Which team should handle this?",
             "criteria": {"billing": "Payments and payouts", "technical": "Bugs and outages"}},
  "urgent": {"type": "noul", "instructions": "Does this convey urgency?"},
  "tone":   {"type": "score", "instructions": "How upset is the customer?",
             "criteria": ["calm", "annoyed", "furious"]}
}') AS d
FROM tickets;
```

Each field of the result is the answer to one question:

| Question type | Answer fields                                                       |
| ------------- | ------------------------------------------------------------------- |
| `noul`        | `probability`                                                       |
| `choice`      | `choice`, `probabilities` (a list of `value`, `probability`), `confidence` |
| `score`       | `score`, `probabilities` (a list of `value`, `label`, `probability`), `confidence` |

Read a single answer with a field access, such as `d['team']['choice']` or `d['urgent']['probability']`.

### How decision functions run

In one `SELECT` list or `WHERE` clause, `ai_if`, `ai_probability`, `ai_classify`, and `ai_score` calls on the same `input`, `model`, and `on_error` share one request per row, and that is an upper bound: identical non-NULL inputs within a batch are asked once, and a NULL input is not asked at all. In `WHERE`, the predicates a top-level `AND` joins to the call run first, so the model only sees rows that pass them; a predicate nested under `OR` does not prefilter.

A `LIMIT` stops requests only between input batches: each batch is answered in full before its rows reach the `LIMIT`. Narrow the rows with other predicates to bound how many requests a query sends.

The functions work in `SELECT`, `WHERE`, `HAVING`, `ORDER BY`, `GROUP BY`, window functions, aggregate arguments (including `FILTER (WHERE ...)`), and inner-join conditions. An outer-join condition is refused with a message that suggests the rewrite. The functions are never pushed down to a [federated source](../query-federation/index.md).

The model's `max_concurrency` and `requests_per_minute_limit` apply to every request, including a chat model's corrective retries. Each batch of calls is recorded in [`runtime.task_history`](../../reference/task_history.md) as an `ai_decide` task, and every model call is counted in the model's request, duration, and token metrics.

## HTTP: `POST /v1/decisions`

:::note[Migrating from v2.4.0-rc.1]
Spice v2.4.0-rc.1 served typed questions at `POST /v1/evaluate` and recorded them as `ai_evaluate` tasks. Later builds replace that endpoint with `POST /v1/decisions`, which takes OpenAI's Decisions API request shape, and record HTTP decisions as `ai_decision` tasks. `/v1/evaluate` is no longer served, so update callers to `/v1/decisions` and the request shape below.
:::

`POST /v1/decisions` takes and returns the request and response shapes of [OpenAI's Decisions API](https://developers.openai.com/api/reference/resources/decisions/methods/create). To call it from an OpenAI SDK, point the client's base URL at Spice and call `client.decisions.create(...)`.

```bash
curl -X POST http://localhost:8090/v1/decisions \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "jev",
    "input": "Help! My payouts have been failing for 3 days.",
    "questions": [
      {"type": "predicate", "name": "urgent", "instructions": "Does this convey urgency?"},
      {"type": "choice", "name": "team", "instructions": "Which team should handle this?",
       "choices": [{"value": "billing", "description": "Payments and payouts"}, {"value": "technical", "description": "Bugs and outages"}]},
      {"type": "score", "name": "tone", "instructions": "How upset is the customer?",
       "levels": [{"label": "calm"}, {"label": "annoyed"}, {"label": "furious"}]}
    ]
  }'
```

A response looks like this:

```json
{
  "model": "jev-1.13.0",
  "answers": [
    { "type": "predicate", "name": "urgent", "probability": 0.9 },
    {
      "type": "choice",
      "name": "team",
      "choice": "billing",
      "probabilities": [
        { "value": "billing", "probability": 0.8 },
        { "value": "technical", "probability": 0.2 }
      ],
      "confidence": 0.6
    },
    {
      "type": "score",
      "name": "tone",
      "score": 1.3,
      "probabilities": [
        { "value": 0, "label": "calm", "probability": 0.1 },
        { "value": 1, "label": "annoyed", "probability": 0.5 },
        { "value": 2, "label": "furious", "probability": 0.4 }
      ],
      "confidence": 0.3
    }
  ],
  "usage": {
    "input_tokens": 612,
    "input_tokens_details": { "cached_tokens": 0, "cache_write_tokens": 0 },
    "output_tokens": 0,
    "output_tokens_details": { "reasoning_tokens": 0 },
    "total_tokens": 612
  }
}
```

The request takes the following fields:

- **`model`**: The name of a model in the Spicepod.
- **`input`**: A string, or user messages with `input_text` parts. Image inputs return `400`.
- **`questions`**: 1 to 200 questions of type `predicate`, `choice` (2 to 255 `choices`), or `score` (2 to 10 `levels`, lowest first). Each question takes an optional `name`.
- **`safety_identifier`** (optional): An end-user identifier of at most 128 characters, forwarded to OpenAI decision models.
- **`reasoning_effort`** (optional): `none`, `minimal`, `low`, `medium`, `high`, or `xhigh`, passed to a chat model's completion request. When omitted, the model's own setting applies. This field is a Spice extension that OpenAI's Decisions API does not have. A decision model returns `400` with `code` `unsupported_parameter` for it.

Answers come back in question order, each with its question's `name`, or `null` when the question has none. An answer's `type` is `predicate`, `choice`, `score`, or `refusal` when the model declined to answer. `usage` is omitted when the model did not report it.

Any field outside OpenAI's schema, other than the `reasoning_effort` extension, returns `400`. Errors use OpenAI's envelope, `{"error": {"message", "type", "param", "code"}}`, with these status codes:

| Status | Cause                                                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------ |
| `400`  | The request is invalid: malformed JSON, an unknown field, an image input, or a question out of bounds. |
| `401`  | The model's provider rejected the API key.                                                             |
| `403`  | The model's provider denied the request.                                                               |
| `404`  | No model with that name is loaded.                                                                     |
| `429`  | The request was rate limited.                                                                          |
| `500`  | The model could not answer, for example after a malformed reply and a failed retry.                    |
| `503`  | The model's provider is unavailable.                                                                   |

Each request is recorded in [`runtime.task_history`](../../reference/task_history.md) as an `ai_decision` task.

## How a chat model answers

Spice turns the questions into a JSON schema that pins each answer to its own options or rubric levels, and writes the schema into the system prompt. The input is sent as an untrusted document, and the prompt tells the model not to follow instructions found in it.

The model is called without the Spice runtime tools that its `tools` param enables, so text in the input cannot trigger a tool call. The model's `system_prompt` and other parameter defaults still apply. A decision request is never streamed, so `stream` and `stream_options` defaults are not applied, and a `response_format` default is overridden, because the request always sends `response_format` `text`. No tools are offered, so `tool_choice` and `parallel_tool_calls` defaults are not sent.

Spice validates every reply. Each question must be answered, nothing else may be present, and every value must be inside its question's domain. The reply's JSON object may be wrapped in a Markdown code fence or surrounded by prose, but a reply with two objects, a repeated key, or an unclosed object is rejected. A malformed reply is sent back to the model once, with its problems listed. If the second reply is also malformed, the decision fails rather than returning a guessed answer.

The reply is converted to answers as follows:

- A probability distribution whose sum is within rounding of 1 is rescaled to sum to exactly 1. A sum further from 1 counts as a malformed reply.
- A `choice` answer is the most probable option. An exact tie goes to the first option in alphabetical order.
- A `score` answer is the probability-weighted average level.
- `confidence` measures how concentrated the distribution is, from 0 for a uniform distribution to 1 for a certain one.
- `usage` totals the tokens of every call the decision made, including a corrective retry. It is omitted when any call did not report its usage.

The prompts and answer conversion follow TypeSafe's [system-one-adapter-python](https://github.com/typesafe-ai/system-one-adapter-python) (probabilities mode, with the schema in the prompt), so results can be compared with that adapter's.

## Choosing a chat model

How reliably a chat model answers depends on the model. Small local models often return malformed JSON, copy parts of the schema back instead of answering, or follow instructions placed in the input. Use a model that follows JSON instructions well, or a decision model.
