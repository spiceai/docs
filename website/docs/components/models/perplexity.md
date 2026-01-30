---
title: 'Perplexity Models'
description: 'Instructions for using language models hosted on Perplexity with Spice.'
sidebar_label: 'Perplexity'
sidebar_position: 4
---

To use a language model hosted on Perplexity, specify `perplexity` in the `from` field.

To use a specific model, include its model ID in the `from` field (see example below). If not specified, the default model is `sonar`.

```yaml
models:
  - name: webs
    from: perplexity:sonar
    params:
      perplexity_auth_token: ${ secrets:SPICE_PERPLEXITY_AUTH_TOKEN }
```

The following parameters are specific to Perplexity models:

| Parameter               | Description                                                                                                                                                  | Default |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| `perplexity_auth_token` | The Perplexity API authentication token.                                                                                                                     | -       |
| `perplexity_*`          | Additional, perplexity specific parameters to use on all requests. See [Perplexity API Reference](https://docs.perplexity.ai/api-reference/chat-completions) | -       |

**Note:** Like other models in Spice, Perplexity can set default overrides for OpenAI parameters. See [Parameter Overrides](../../features/large-language-models/parameter_overrides.md).

### Example Configuration

```yaml
models:
  - name: webs
    from: perplexity:sonar
    params:
      perplexity_auth_token: ${ secrets:SPICE_PERPLEXITY_AUTH_TOKEN }
      perplexity_search_domain_filter:
        - docs.spiceai.org
        - huggingface.co
      perplexity_temperature: 0.3141595
```
