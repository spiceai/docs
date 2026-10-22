---
title: 'xAI Models'
description: 'Instructions for using xAI models'
sidebar_label: 'xAI'
sidebar_position: 7
---

To use a language model hosted on xAI, specify `xai` path in the `from` field and the associated `xai_api_key` parameter. When no model is specified in the `from` field (i.e., `from: xai`), the default model is `grok-4.3`.

| Param             | Description                                               | Default |
| ----------------- | --------------------------------------------------------- | ------- |
| `xai_api_key`     | The xAI API key.                                          | -       |
| `xai_usage_tier`  | xAI usage tier (0-4). Used for rate limit defaults.       | -       |

Example:

```yaml
models:
  - from: xai:grok-4.3
    name: xai
    params:
      xai_api_key: ${secrets:SPICE_GROK_API_KEY}
```

Refer to the [xAI models documentation](https://docs.x.ai/docs/models) for more details on available models and configurations.

:::note
Although the xAI [documentation](https://docs.x.ai/docs/guides/structured-outputs) shows that xAI models can return structured outputs, this is not true.
:::

## Errors

When xAI refuses a request, `/v1/chat/completions` and `/v1/responses` return xAI's error message with an HTTP status taken from xAI's status. The error's `code` is xAI's code in snake case, for example `invalid_argument` for xAI's `invalid-argument`.

| xAI status | Error `type`            | Spice status |
| ---------- | ----------------------- | ------------ |
| 400        | `invalid_request_error` | 400          |
| 401        | `authentication_error`  | 401          |
| 402        | `insufficient_quota`    | 402          |
| 403        | `permission_error`      | 403          |
| 404        | `not_found_error`       | 404          |
| 429        | `rate_limit_error`      | 429          |
| Other 4xx  | `invalid_request_error` | 400          |
| 5xx        | `api_error`             | 500          |

A 5xx from xAI, such as `503`, is returned as `500` with xAI's message.

## Token Usage

xAI's Chat Completions API reports reasoning tokens outside `completion_tokens`. Spice adds them to `completion_tokens`, as OpenAI counts them, so `completion_tokens` includes reasoning and `total_tokens` equals `prompt_tokens` plus `completion_tokens`. The adjusted count applies to `/v1/chat/completions` responses, streamed or not, to `output_tokens` in [`/v1/decisions`](../../features/large-language-models/decisions.md), and to the `llm_completion_tokens_total` metric. Spice adjusts the count only when xAI's own numbers show the reasoning outside the completion, so usage already reported the OpenAI way is not counted twice. xAI's Responses API already counts reasoning in `output_tokens`, so `/v1/responses` usage is unchanged.

## Cookbook

- A cookbook recipe to use xAI's Grok models with Spice. [xAI Models](https://github.com/spiceai/cookbook/tree/trunk/models/xai#readme)
