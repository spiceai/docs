---
title: 'Anthropic Models'
description: 'Instructions for using language models hosted on Anthropic with Spice.'
sidebar_label: 'Anthropic'
sidebar_position: 3
---

To use a language model hosted on Anthropic, specify `anthropic` in the `from` field.

To use a specific model, include its model ID in the `from` field (see example below). If not specified, the default model is `claude-sonnet-5`. Name a model explicitly for anything long-lived: Anthropic retires model IDs, and a request for a retired one fails with a `not_found_error`.

The following parameters are specific to Anthropic models:

| Parameter              | Description                                                     | Default                        |
| ---------------------- | --------------------------------------------------------------- | ------------------------------ |
| `anthropic_api_key`    | The Anthropic API key.                                          | -                              |
| `anthropic_auth_token` | The Anthropic Auth Token.                                       | -                              |
| `anthropic_usage_tier` | Anthropic usage tier (1-4). Used for rate limit defaults.       | -                              |
| `endpoint`             | The Anthropic API base endpoint.                                | `https://api.anthropic.com/v1` |

Example `spicepod.yml` configuration:

```yaml
models:
  - from: anthropic:claude-sonnet-4-5
    name: claude_4_5_sonnet
    params:
      anthropic_api_key: ${ secrets:SPICE_ANTHROPIC_API_KEY }
```

See [Anthropic Model Names](https://platform.claude.com/docs/en/about-claude/models/overview) for a list of supported model names.
