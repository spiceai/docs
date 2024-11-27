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

To use a language model hosted on OpenAI (or compatible), specify the `openai` path and model ID in `from`.

Example `spicepod.yml`:

```yaml
models:
  - from: openai:gpt-4o-mini
    name: openai
    params:
      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }

  - from: openai:llama3-groq-70b-8192-tool-use-preview
    name: groq-llama
    params:
      endpoint: https://api.groq.com/openai/v1
      openai_api_key: ${ secrets:SPICE_GROQ_API_KEY }
```

For details, see [OpenAI (or Compatible) Language Models](/components/models/openai.md).
