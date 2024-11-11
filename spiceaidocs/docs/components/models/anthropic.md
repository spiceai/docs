---
title: 'Anthropic Models'
description: 'Instructions for using language models hosted on Anthropic with Spice.'
sidebar_label: 'Anthropic'
sidebar_position: 5
---

To use a language model hosted on Anthropic, specify `anthropic` in the `from` field.

To use a specific model, include its model ID in the `from` field (see example below). If not specified, the default model is `"claude-3-5-sonnet-latest"`.

The following parameters are specific to Anthropic models:

| Parameter              | Description                      | Default                        |
| ---------------------- | -------------------------------- | ------------------------------ |
| `anthropic_api_key`    | The Anthropic API key.           | -                              |
| `anthropic_auth_token` | The Anthropic auth token.        | -                              |
| `endpoint`             | The Anthropic API base endpoint. | `https://api.anthropic.com/v1` |

Example `spicepod.yml` configuration:

```yaml
models:
  - from: anthropic:claude-3-5-sonnet-latest
    name: claude_3_5_sonnet
    params:
      anthropic_api_key: ${ secrets:SPICE_ANTHROPIC_API_KEY }
```

See [Anthropic Model Names](https://docs.anthropic.com/en/docs/about-claude/models#model-names) for a list of supported model names.
