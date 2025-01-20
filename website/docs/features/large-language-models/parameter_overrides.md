---
title: 'Language Model Overrides'
sidebar_label: 'Parameter Overrides'
description: 'Learn how to override default LLM hyperparameters in Spice.'
sidebar_position: 4
pagination_prev: null
pagination_next: null
tags:
  - models
  - parameters
  - overrides
  - configuration
---

### Chat Completion Parameter Overrides

The [`v1/chat/completion`](/docs/api/HTTP/post-chat-completions) endpoint is compatible with OpenAI's API. It supports a subset of request body parameters defined in the [OpenAI reference documentation](https://platform.openai.com/docs/api-reference/chat/create). Spice helps configure different defaults for these request parameters.

Supported parameters:

- [`frequency_penalty`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-frequency_penalty)
- [`logit_bias`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-logit_bias)
- [`logprobs`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-logprobs)
- [`max_completion_tokens`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-max_completion_tokens)
- [`metadata`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-metadata)
- [`n`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-n)
- [`parallel_tool_calls`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-parallel_tool_calls)
- [`presence_penalty`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-presence_penalty)
- [`response_format`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-response_format)
- [`seed`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-seed)
- [`stop`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-stop)
- [`store`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-store)
- [`stream`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-stream)
- [`stream_options`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-stream_options)
- [`temperature`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-temperature)
- [`tool_choice`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-tool_choice)
- [`tools`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-tools)
- [`top_logprobs`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-top_logprobs)
- [`top_p`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-top_p)
- [`user`](https://platform.openai.com/docs/api-reference/chat/create#chat-create-user)

### Example: Setting Default Overrides

To specify a default override for a parameter, use the `openai_` prefix followed by the parameter name. For example, to set the `temperature` parameter to `0.1` for all requests with this model, use `openai_temperature: 0.1`. A `temperature` parameter in the request body will still override the default.

```yaml
models:
  - name: pirate-haikus
    from: openai:gpt-4o
    params:
      openai_temperature: 0.1
      openai_response_format: { 'type': 'json_object' }
```

When sending this payload to spice `/v1/chat/completions`:

```js
{
  "model": "pirate-haikus",
  "messages": [
    {
      "role": "user",
      "content": "What is the capital of France?"
    }
  ],
  "temperature": 0.5
}
```

Will be passed to the OpenAI API as:

```js
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "What is the capital of France?"
    }
  ],
  "temperature": 0.5,                          // temperature overriden by value in request body
  "response_format": { "type": "json_object" } // default response format from model configuration
}
```

### System Prompt

In addition to any system prompts provided in message dialogue, or added by model providers, Spice can configure an additional system prompt.

```yaml
models:
  - name: pirate-haikus
    from: openai:gpt-4o
    params:
      system_prompt: |
        Write everything in Haiku like a pirate
```

Any request to [HTTP `v1/chat/completion`](/docs/api/HTTP/post-chat-completions) will include the configured system prompt.
