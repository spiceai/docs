---
title: 'OpenAI (or Compatible) Language Models'
sidebar_label: 'OpenAI'
sidebar_position: 4
---

To use a language model hosted on OpenAI (or compatible), specify the `openai` path in `from`. For a specific model, include it as the model id in `from` (see example below). Default `"gpt-3.5-turbo"`.
Several params are specific to OpenAI models.

| Param | Description | Default |
| ----- | ----------- | ------- |
| `openai_api_key` | The OpenAI API key.        | -                           |
| `openai_org_id` | The OpenAI organization id. | -                           |
| `openai_project_id` | The OpenAI project id.  | -                           |
| `endpoint` | The OpenAI API base endpoint.    | `https://api.openai.com/v1` |


Example:

```yaml
models:
  - from: openai/gpt-4o
    name: local_fs_model
    params:
      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }

  - from: openai/llama3-groq-70b-8192-tool-use-preview
    name: groq-llama
    params:
      endpoint: https://api.groq.com/openai/v1
      openai_api_key: ${ secrets:SPICE_GROQ_API_KEY }
```
