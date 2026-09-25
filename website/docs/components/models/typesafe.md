---
title: 'TypeSafe Models'
description: 'Instructions for using TypeSafe Jev evaluation models with the /v1/evaluate endpoint'
sidebar_label: 'TypeSafe'
sidebar_position: 11
---

[TypeSafe Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) is an evaluation model, not a chat model. It takes unstructured input (the `state`) and a set of typed questions, and returns a structured answer to each question with calibrated probabilities. Spice serves TypeSafe models through the `POST /v1/evaluate` endpoint. They cannot be used with `/v1/chat/completions` or `/v1/responses`.

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

## Evaluate API

Send a request to `POST /v1/evaluate` with the model `name`, the `state` to evaluate, and a map of named `questions`:

```bash
curl -X POST http://localhost:8090/v1/evaluate \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "jev",
    "state": "Help! My payouts have been failing for 3 days.",
    "questions": {
      "is_urgent": {
        "type": "noul",
        "instructions": "Does this convey urgency?"
      }
    }
  }'
```

`state` can be a string, a JSON array, or a JSON object. Each question has a `type`:

| `type`   | Question                                                          | Answer fields                                                         |
| -------- | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| `noul`   | A yes-or-no question. Optional `criteria` describe `true` and `false`. | `noul`: the probability of yes, from 0 to 1.                           |
| `choice` | A closed set of options. `criteria` maps each option ID to its description. | `choice`, `probabilities`, and `confidence`.                          |
| `score`  | An ordered rubric. `criteria` is a list of 2 to 10 levels.         | `score`, `legend`, `probabilities`, and `confidence`.                 |

`instructions` and `criteria` descriptions accept a string, an object, an array, or `null`. See the TypeSafe documentation for [structured instructions](https://docs.typesafe.ai/primitives/advanced) and the [API reference](https://docs.typesafe.ai/api).

The response carries `model`, the model version that answered, and `answers`, one answer per question keyed by the question name. Each answer has the question's `type` and that type's answer fields. When TypeSafe reports token counts, the response also carries `usage` with `input_tokens` and `output_tokens`.

### Errors

| Status | Cause                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------- |
| `400`  | The request is invalid, for example `questions` is empty.                                         |
| `404`  | No evaluation model with that name is loaded.                                                     |
| `422`  | The request body is not valid JSON for this endpoint.                                             |
| `401`  | TypeSafe rejected the API key.                                                                    |
| `403`  | TypeSafe denied the request.                                                                      |
| `429`  | The request was rate limited.                                                                     |
| `503`  | TypeSafe is unavailable.                                                                          |
| `500`  | The evaluation failed for another reason.                                                         |

A request to `/v1/chat/completions` that names a TypeSafe model returns `400` and directs the caller to `/v1/evaluate`.

Evaluations are recorded in [`runtime.task_history`](../../reference/task_history) as `ai_evaluate` tasks, and are counted in the same model request, duration, and token metrics as chat requests, labeled by `model`.
