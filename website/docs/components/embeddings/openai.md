---
title: 'OpenAI (or Compatible) Embedding Models'
sidebar_label: 'OpenAI'
sidebar_position: 1
---

To use a hosted OpenAI (or compatible) embedding model, specify the `openai` path in the `from` field of your configuration. If you want to use a specific model, include its model ID in the `from` field. If no model ID is specified, it defaults to `"text-embedding-3-small"`.

The following parameters are specific to OpenAI models:

| Parameter           | Description                           | Default                     |
| ------------------- | ------------------------------------- | --------------------------- |
| `openai_api_key`    | The API key for accessing OpenAI.     | -                           |
| `openai_org_id`     | The organization ID for OpenAI.       | -                           |
| `openai_project_id` | The project ID for OpenAI.            | -                           |
| `endpoint`          | The base endpoint for the OpenAI API. | `https://api.openai.com/v1` |

Below is an example configuration in `spicepod.yaml`:

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
