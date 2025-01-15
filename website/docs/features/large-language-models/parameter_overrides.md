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

The [`v1/chat/completion`](/docs/api/HTTP/post-chat-completions) endpoint is compatible with OpenAI's API. It supports all request body parameters defined in the [OpenAI reference documentation](https://platform.openai.com/docs/api-reference/chat/create). Spice helps configure different defaults for these request parameters.

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
