---
title: 'OpenAI (or Compatible) Embedding Models'
sidebar_label: 'OpenAI'
sidebar_position: 1
---

To use a hosted OpenAI (or compatible) embedding model, specify the `openai` path in `from`. 

For a specific model, include it as the model ID in `from` (see example below). Defaults to `"text-embedding-3-small"`.
These parameters are specific to OpenAI models:

| Parameter | Description | Default |
| ----- | ----------- | ------- |
| `openai_api_key` | The OpenAI API key.        | -                           |
| `openai_org_id` | The OpenAI organization id. | -                           |
| `openai_project_id` | The OpenAI project id.  | -                           |
| `endpoint` | The OpenAI API base endpoint.    | `https://api.openai.com/v1` |


Example:

```yaml
models:
  - from: openai:text-embedding-3-large
    name: xl_embed
    params:
      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }

  - name: mistral
    from: openai:mistral-embed
    params:
      endpoint: https://api.mistral.ai/v1
      api_key: ${ secrets:SPICE_MISTRAL_API_KEY }
```