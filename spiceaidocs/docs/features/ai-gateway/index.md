---
title: 'AI Gateway - Configuring LLMs'
sidebar_label: 'AI Gateway'
description: 'Learn how to configure language models and use Spice as an AI Gateway.'
sidebar_position: 5
pagination_prev: null
pagination_next: null
---

Spice provides a high-performance, OpenAI API-compatible AI Gateway optimized for managing and scaling large language models (LLMs).

Additionally, Spice offers tools for Enterprise Retrieval-Augmented Generation (RAG), such as SQL query across federated datasets and an advanced search feature (see [Search](/features/search)).

Spice also supports **full OpenTelemetry observability**, enabling detailed tracking of data flows and requests for full transparency and easier debugging.

## Configuring Language Models

Spice supports a variety of LLMs (see [Model Components](/components/models/index.md)).

### Core Features

- **Custom Tools**: Equip models with tools to interact with the Spice runtime.
- **System Prompts**: Customize system prompts and override defaults for [`v1/chat/completion`](/api/http/chat-completions.md).

For detailed configuration and API usage, refer to the [API Documentation](/api).

### Example: Configuring an OpenAI Model

To use a language model hosted on OpenAI (or compatible), specify the `openai` path in `from`. 

For a specific model, include it as the model ID in `from`. Defaults to `"gpt-3.5-turbo"`.
These parameters are specific to OpenAI models:

| Param | Description | Default |
| ----- | ----------- | ------- |
| `openai_api_key` | The OpenAI API key.        | -                           |
| `openai_org_id` | The OpenAI organization id. | -                           |
| `openai_project_id` | The OpenAI project id.  | -                           |
| `endpoint` | The OpenAI API base endpoint.    | `https://api.openai.com/v1` |

Example configuration:

```yaml
models:
  - from: openai:gpt-4o
    name: local_fs_model
    params:
      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }

  - from: openai:llama3-groq-70b-8192-tool-use-preview
    name: groq-llama
    params:
      endpoint: https://api.groq.com/openai/v1
      openai_api_key: ${ secrets:SPICE_GROQ_API_KEY }
```

This example demonstrates how to configure an OpenAI model in the AI Gateway. The `from` field specifies the model source and ID, while the `params` field includes necessary parameters such as the API key and endpoint.
