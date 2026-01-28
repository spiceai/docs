---
title: 'System Prompt parameterization'
sidebar_label: 'Parameterized Prompts'
description: 'Learn how to update system prompts for each request with Jinja-styled templating.'
sidebar_position: 7
pagination_prev: null
pagination_next: null
tags:
  - models
  - parameters
  - overrides
  - configuration
---

Spice supports defining system prompts for Large Language Models (LLM)s in the [spicepod](./parameter_overrides#system-prompt).

**Example**:
```yaml
models:
  - name: advice
    from: openai:gpt-4o
    params:
      system_prompt: |
        Write everything in Haiku like a pirate from Australia
```

More than this, system prompts can use Jinja syntax to allow system prompts to be altered on each [v1/chat/completion](../../api/HTTP/post-chat-completions) request. This involves three steps:
1. Add `parameterized_prompt: enabled` to the model.
1. Use Jinja syntax in the `system_prompt` parameter for the model in the spicepods.
   ```yaml
   models:
    - name: advice
      from: openai:gpt-4o
      params:
        parameterized_prompt: enabled
        system_prompt: |
          Write everything in {{ form }} like a {{ user.character }} from {{ user.country }}
   ```

2. Provide the required variables in [v1/chat/completion](../../api/HTTP/post-chat-completions) via the `.metadata` field.
   ```bash
    curl -X POST http://localhost:8090/v1/chat/completions \
      -H "Content-Type: application/json" \
      -d '{
        "model": "advice",
        "messages": [
          {"role": "user", "content": "Where should I visit in San Francisco?"}
        ],
        "metadata": {
          "form": "haiku",
          "user": {
            "character": "pirate",
            "country": "australia"
          }
        }
      }'
    ```
