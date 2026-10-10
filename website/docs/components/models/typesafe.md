---
title: 'TypeSafe Models'
description: 'Instructions for using TypeSafe Jev decision models with the SQL decision functions and the /v1/decisions endpoint'
sidebar_label: 'TypeSafe'
sidebar_position: 11
---

[TypeSafe Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) is a decision model, not a chat model. It takes unstructured input and a set of typed questions, and returns a structured answer to each question with calibrated probabilities. Spice serves TypeSafe models through the SQL decision functions (`ai_if`, `ai_probability`, `ai_classify`, `ai_score`, and `ai_decide`) and the `POST /v1/decisions` endpoint. They cannot be used with `/v1/chat/completions` or `/v1/responses`.

Chat models answer decisions too, with uncalibrated probabilities. See [Decisions](../../features/large-language-models/decisions.md).

## Configuration

Specify `typesafe:<model>` in the `from` field and provide a TypeSafe API key.

```yaml
models:
  - from: typesafe:jev
    name: jev
    params:
      typesafe_api_key: ${secrets:TYPESAFE_API_KEY}
```

The model after `typesafe:` is sent to TypeSafe as follows:

| `from`                 | TypeSafe model             |
| ---------------------- | -------------------------- |
| `typesafe:jev`         | `jev-latest`               |
| `typesafe`             | `jev-latest`               |
| `typesafe:jev-latest`  | `jev-latest`               |
| `typesafe:jev-preview` | `jev-preview`              |
| `typesafe:jev-1.13.0`  | `jev-1.13.0` (version pin) |

`typesafe/jev` is accepted as an alternative spelling of `typesafe:jev`.

| Param                       | Description                                                                                                   | Default                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `typesafe_api_key`          | The TypeSafe API key. `typesafe_ai_api_key` is accepted as an alias.                                          | -                         |
| `typesafe_endpoint`         | The TypeSafe API base URL.                                                                                    | `https://api.typesafe.ai` |
| `max_concurrency`           | Maximum number of concurrent requests to this model.                                                          | Provider default          |
| `requests_per_minute_limit` | Maximum requests per minute to this model.                                                                    | Provider default          |

When `typesafe_api_key` is not set, Spice loads the key from the `TYPESAFE_API_KEY` secret, and then from `TYPESAFE_AI_API_KEY`. If neither is found, the model fails to load.

### Load-time check

When the model loads, Spice lists the models available to the API key. The model fails to load if the key is rejected, or if the configured model is not offered to the account. A version pin such as `typesafe:jev-1.13.0` skips the offered-model check, but still requires a valid key. For example, an invalid key fails with:

```
Failed to load LLM: jev. Evaluation health check failed: HTTP 401 Unauthorized: {"detail":{"error_type":"authentication_error","message":"Cannot authenticate with the server. Please check your API key and try again."}}
```

## Decisions

Name the model in a SQL decision function with `model => 'jev'`, or omit `model` when the TypeSafe model is the only decision model in the Spicepod:

```sql
SELECT id FROM tickets WHERE ai_if(body, 'Does this convey urgency?', model => 'jev');
```

Or send a request to `POST /v1/decisions` with the model `name`, the `input`, and a list of `questions`:

```bash
curl -X POST http://localhost:8090/v1/decisions \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "jev",
    "input": "Help! My payouts have been failing for 3 days.",
    "questions": [
      {"type": "predicate", "name": "urgent", "instructions": "Does this convey urgency?"}
    ]
  }'
```

The response carries `model`, the model version that answered, and `answers`, one per question in question order. The question types, answer fields, `ai_decide` result, and error status codes are described in [Decisions](../../features/large-language-models/decisions.md).

In `ai_decide`, which uses TypeSafe's question grammar, `instructions` and `criteria` descriptions accept a string, an object, an array, or `null`. See the TypeSafe documentation for [structured instructions](https://docs.typesafe.ai/primitives/advanced) and the [API reference](https://docs.typesafe.ai/api).

TypeSafe models do not take `reasoning_effort`: a `/v1/decisions` request that sets it for a TypeSafe model returns `400` with `code` `unsupported_parameter`.

A request to `/v1/chat/completions` that names a TypeSafe model returns `400` and directs the caller to `/v1/decisions`.

Decision requests are recorded in [`runtime.task_history`](../../reference/task_history.md) as `ai_decision` tasks (`POST /v1/decisions`) or `ai_decide` tasks (SQL), and are counted in the same model request, duration, and token metrics as chat requests, labeled by `model`.
