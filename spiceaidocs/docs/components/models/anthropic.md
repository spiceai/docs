---
title: 'Anthropic Language Models'
sidebar_label: 'Anthropic'
sidebar_position: 5
---

To use a language model hosted on Anthropic, specify `anthropic` in `from`.

For a specific model, include it as the model ID in `from` (see example below). Defaults to `"claude-3-5-sonnet-20240620"`.
These parameters are specific to Anthropic models:

| Param | Description | Default |
| ----- | ----------- | ------- |
| `anthropic_api_key` | The Anthropic API key.        | -                           |
| `anthropic_auth_token` | The Anthropic auth token. | -                           |
| `endpoint` | The Anthropic API base endpoint.    | `https://api.anthropic.com/v1` |

Example:

```yaml
models:
  - from: anthropic:claude-3-5-sonnet-20240620
    name: claude_3_5_sonnet
    params:
      anthropic_api_key: ${ secrets:SPICE_ANTHROPIC_API_KEY }
```

## Supported Models

- `claude-3-5-sonnet-20240620`
- `claude-3-opus-20240229`
- `claude-3-sonnet-20240229`
- `claude-3-haiku-20240307`
- `claude-2.1`
- `claude-2.0`
- `claude-instant-1.2`
