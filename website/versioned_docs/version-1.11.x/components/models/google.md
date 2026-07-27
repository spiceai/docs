---
title: 'Google AI Models'
description: 'Instructions for using language models hosted on Google AI with Spice.'
sidebar_label: 'Google AI'
sidebar_position: 5
---

To use a language model hosted on Google AI, specify `google` in the `from` field.

Include a model ID in the `from` field (see example below); a model ID is required. Spice does not apply a default model — the model fails to load if the ID is omitted (`from: google`).

The following parameters are specific to Google AI models:

| Parameter        | Description             | Default |
| ---------------- | ----------------------- | ------- |
| `google_api_key` | The Google AI API key.  | -       |

Example `spicepod.yml` configuration:

```yaml
models:
  - from: google:gemini-3.5-flash
    name: flash
    params:
      google_api_key: ${ secrets:GEMINI_API_KEY }
```

See [Google AI Models](https://ai.google.dev/gemini-api/docs/models/gemini) for a list of supported model names.

See [Large Language Models](../../features/large-language-models) for additional configuration options:

- [Tools](../../features/large-language-models/tools)
- [Memory](../../features/large-language-models/memory)
- [Evals](../../features/large-language-models/evals)
- [Parameter overrides](../../features/large-language-models/parameter_overrides)
