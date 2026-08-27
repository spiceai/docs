---
title: 'Anthropic Models'
description: 'Instructions for using language models hosted on Anthropic with Spice.'
sidebar_label: 'Anthropic'
sidebar_position: 3
---

To use a language model hosted on Anthropic, specify `anthropic` in the `from` field.

To use a specific model, include its model ID in the `from` field (see example below). If not specified, the default model is `claude-sonnet-4-6`. Name a model explicitly for anything long-lived: Anthropic retires model IDs, and a request for a retired one fails with a `not_found_error`.

The default deliberately trails Anthropic's newest model. Claude 5 models reject `temperature`, `top_p`, and `top_logprobs` individually, so a request that sets any one of them fails against them; `claude-sonnet-4-6` is the newest model that still accepts each of them. It accepts them one at a time, not in every combination — Claude 4 and later reject `temperature` and `top_p` set *together*, and reject a trailing assistant message (a response prefill). Spice sends `top_logprobs` to Anthropic as `top_k`, so that is the parameter name an Anthropic error reports. Set `from: anthropic:<model_id>` to use a newer model, and drop these parameters when you do.

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
