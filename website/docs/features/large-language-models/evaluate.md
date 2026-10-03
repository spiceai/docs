---
title: 'Evaluate API'
sidebar_label: 'Evaluate API'
description: 'Answer typed questions about unstructured input with any chat model or a TypeSafe System One model through POST /v1/evaluate.'
sidebar_position: 8
pagination_prev: null
pagination_next: null
tags:
  - models
  - llm
  - api
---

`POST /v1/evaluate` takes unstructured input, the `state`, and a map of typed questions, and returns a typed answer with probabilities for each question. The `model` in the request names any model in the Spicepod: a chat model, or a [TypeSafe](../../components/models/typesafe.md) System One model such as `from: typesafe:jev`.

| Model            | Example `from`                                         | Probabilities                                                                                                                  |
| ---------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| System One model | `typesafe:jev`                                         | Calibrated by the model.                                                                                                       |
| Any chat model   | `openai:gpt-4o-mini`, `anthropic:claude-haiku-4-5`     | The model's own estimates. They are not calibrated: a chat model's `0.9` is not a 90% likelihood the way a System One model's is. |

## Evaluate with a chat model

Every chat model in the Spicepod answers `/v1/evaluate`. No extra configuration or parameters are needed:

```yaml
models:
  - from: openai:gpt-4o-mini
    name: judge
    params:
      openai_api_key: ${secrets:OPENAI_API_KEY}
```

```bash
curl -X POST http://localhost:8090/v1/evaluate \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "judge",
    "state": "Help! My payouts have been failing for 3 days.",
    "questions": {
      "is_urgent": { "type": "noul", "instructions": "Does this convey urgency?" },
      "team": {
        "type": "choice",
        "instructions": "Which team should handle this?",
        "criteria": { "billing": "Payments and payouts", "technical": "Bugs and outages" }
      }
    }
  }'
```

The request and response have the same shape as for a System One model. The question types (`noul`, `choice`, and `score`), their answer fields, and the error status codes are described in [TypeSafe Models](../../components/models/typesafe.md#evaluate-api). For a chat model, the provider's errors map to the same status codes: a rejected API key returns `401`, a permission error returns `403`, a rate limit returns `429`, and an unreachable provider returns `503`. A response looks like this:

```json
{
  "model": "judge",
  "answers": {
    "is_urgent": { "type": "noul", "noul": 0.9 },
    "team": {
      "type": "choice",
      "choice": "billing",
      "probabilities": { "billing": 0.8, "technical": 0.2 },
      "confidence": 0.6
    }
  },
  "usage": { "input_tokens": 612, "output_tokens": 31 }
}
```

## How a chat model answers

Spice turns the questions into a JSON schema that pins each answer to its own options or rubric levels, and writes the schema into the system prompt. The `state` is sent as an untrusted document, and the prompt tells the model not to follow instructions found in it.

The model is called without the Spice runtime tools that its `tools` param enables, so text in `state` cannot trigger a tool call. The model's `system_prompt` and other parameter defaults still apply. An evaluation request is never streamed, so `stream` and `stream_options` defaults are not applied, and a `response_format` default is overridden, because the evaluation always sends `response_format` `text`. No tools are offered, so `tool_choice` and `parallel_tool_calls` defaults are not sent.

Spice validates every reply. Each question must be answered, nothing else may be present, and every value must be inside its question's domain. The reply's JSON object may be wrapped in a Markdown code fence or surrounded by prose, but a reply with two objects, a repeated key, or an unclosed object is rejected. A malformed reply is sent back to the model once, with its problems listed. If the second reply is also malformed, the request fails with HTTP `500` rather than returning a partial answer.

The reply is converted to answers as follows:

- A probability distribution whose sum is within rounding of 1 is rescaled to sum to exactly 1. A sum further from 1 counts as a malformed reply.
- A `choice` answer is the most probable option. An exact tie goes to the first option in alphabetical order.
- A `score` answer is the probability-weighted average level.
- `confidence` measures how concentrated the distribution is, from 0 for a uniform distribution to 1 for a certain one.
- `usage` totals the tokens of every call the evaluation made, including a corrective retry. It is omitted when any call did not report its usage.

Each call to the model is recorded in [`runtime.task_history`](../../reference/task_history) under the evaluation's `ai_evaluate` task, and is counted in the chat model's request, duration, and token metrics.

The prompts and answer conversion follow TypeSafe's [system-one-adapter-python](https://github.com/typesafe-ai/system-one-adapter-python) (probabilities mode, with the schema in the prompt), so results can be compared with that adapter's.

## Choosing a chat model

How reliably a chat model answers depends on the model. Small local models often return malformed JSON, copy parts of the schema back instead of answering, or follow instructions placed in `state`. Use a model that follows JSON instructions well.
