---
title: 'Language Model Overrides'
sidebar_label: 'Parameter Overrides'
description: 'Learn how to override default LLM hyperparameters in Spice.'
sidebar_position: 5
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

:::warning[Deprecated Default Overrides Parameters]

The `openai_` prefix is deprecated for non-OpenAI model providers. Use the [model provider prefix](/docs/components/models#model-provider-prefix) instead.

:::

To specify a default override for a parameter, use the [model provider prefix](/docs/components/models#model-provider-prefix) followed by the parameter name. For example, to set the `temperature` parameter to `0.1` for all requests with this model for Hugging Face model, use `hf_temperature: 0.1`. A `temperature` parameter in the request body will still override the default.

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

### Example: Enforcing default structured output and using system prompt

This example demonstrates how to create a specialized math tutoring model by combining system prompts with structured JSON output.
The configuration ensures consistent, step-by-step mathematical solutions in a machine-readable format.

```yaml
models:
  - name: math-tutor
    from: openai:gpt-4o
    params:
      system_prompt: |
        You are a helpful math tutor. Guide the user through the solution step by step.
      openai_response_format:
        type: json_schema
        json_schema:
          name: math_reasoning
          schema:
            type: object
            properties:
              steps:
                type: array
                items:
                  type: object
                  properties:
                    explanation:
                      type: string
                    output:
                      type: string
                  required:
                    - explanation
                    - output
                  additionalProperties: false
              final_answer:
                type: string
            required:
              - steps
              - final_answer
            additionalProperties: false
          strict: true
```

To use the configured math tutor, send a simple request to the chat completions endpoint:

```shell
curl -s -XPOST http://localhost:8090/v1/chat/completions -H "Content-Type: application/json" -d \
    '{
      "model": "math-tutor",
      "messages": [{
        "role": "user",
        "content" :"how can I solve 8x + 7 = -23"
      }]
    }' \
  | jq '.choices[0].message.content | fromjson'
```

Example response:

```json
{
  "final_answer": "x = -3.75",
  "steps": [
    {
      "explanation": "We start with the given equation that we need to solve.",
      "output": "8x + 7 = -23"
    },
    {
      "explanation": "Our goal is to solve for x. We can start by isolating the term with x on one side of the equation. To do this, we need to eliminate the constant term (7) on the left side. We subtract 7 from both sides of the equation in order to keep it balanced.",
      "output": "8x + 7 - 7 = -23 - 7"
    },
    {
      "explanation": "Subtracting 7 from both sides simplifies the equation. On the left side, the +7 and -7 cancel out, leaving just the term with the variable.",
      "output": "8x = -30"
    },
    {
      "explanation": "Now, we have 8 times x equals -30. To solve for x, we divide both sides of the equation by the coefficient of x, which is 8.",
      "output": "8x / 8 = -30 / 8"
    },
    {
      "explanation": "Dividing both sides results in x on the left side and simplifies the fraction on the right side. The fraction -30/8 can be simplified further by dividing both the numerator and the denominator by their greatest common divisor, which is 2.",
      "output": "x = -3.75"
    },
    {
      "explanation": "The solution has been simplified completely, giving us the value of x.",
      "output": "x = -3.75"
    }
  ]
}
```

Visit [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) for more information on how to use structured output formats.
