---
title: 'OpenAI (or Compatible) Language Models'
description: 'Instructions for using language models hosted on OpenAI or compatible services with Spice.'
sidebar_label: 'OpenAI'
sidebar_position: 4
---

To use a language model hosted on OpenAI (or compatible), specify the `openai` path in the `from` field.

For a specific model, include it as the model ID in the `from` field (see example below). The default model is `"gpt-3.5-turbo"`.

These parameters are specific to OpenAI models:

| Param               | Description                   | Default                     |
| ------------------- | ----------------------------- | --------------------------- |
| `openai_api_key`    | The OpenAI API key.           | -                           |
| `openai_org_id`     | The OpenAI organization ID.   | -                           |
| `openai_project_id` | The OpenAI project ID.        | -                           |
| `endpoint`          | The OpenAI API base endpoint. | `https://api.openai.com/v1` |

Example:

```yaml
models:
  - from: openai:gpt-4o
    name: local_fs_model
    params:
      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }
```

## Supported OpenAI Compatible Providers

Spice supports several OpenAI compatible providers. Specify the appropriate endpoint in the params section.

### Groq

Groq provides OpenAI compatible endpoints. Use the following configuration:

```yaml
models:
  - from: openai:llama3-groq-70b-8192-tool-use-preview
    name: groq-llama
    params:
      endpoint: https://api.groq.com/openai/v1
      openai_api_key: ${ secrets:SPICE_GROQ_API_KEY }
```

### Parasail

Parasail also offers OpenAI compatible endpoints. Use the following configuration:

```yaml
models:
  - from: openai:parasail-model-id
    name: parasail_model
    params:
      endpoint: https://api.parasail.com/v1
      openai_api_key: ${ secrets:SPICE_PARASAIL_API_KEY }
```

Refer to the respective provider documentation for more details on available models and configurations.
