---
title: 'Large Language Models'
sidebar_label: 'Large Language Models'
description: 'Learn how to configure large language models (LLMs)'
sidebar_position: 7
pagination_prev: null
pagination_next: null
tags:
  - models
---

Spice provides a high-performance, OpenAI API-compatible AI Gateway optimized for managing and scaling large language models (LLMs). It offers tools for Enterprise Retrieval-Augmented Generation (RAG), such as SQL query across federated datasets and an advanced search feature (see [Search](../../features/search)).

<img width="740" alt="ai-gateway" src="https://github.com/user-attachments/assets/4a45cd62-ebfc-4a73-956d-661f1ab44cd8" />

Spice supports **full OpenTelemetry observability**, helping with detailed tracking of model tool use, recursion, data flows and requests for full transparency and easier debugging.

## Configuring Language Models

Spice supports a variety of LLMs (see [Model Providers](../../components/models/index.md)).

### Core Features

- **SQL Integration**: Invoke LLMs directly within SQL queries using the `ai()` function for text generation tasks. See [SQL Reference: ai function](../../reference/sql/scalar_functions#ai).
- **Custom Tools**: Provide models with tools to interact with the Spice runtime. See [Tools](../../features/large-language-models/tools).
- **System Prompts**: Customize system prompts and override defaults for [`v1/chat/completion`](../../api/HTTP/post-chat-completions). See [Parameter Overrides](../../features/large-language-models/parameter_overrides.md).
- **Memory**: Provide LLMs with memory persistence tools to store and retrieve information across conversations. See [Memory](../../features/large-language-models/memory).
- **Vector Search**: Perform advanced vector-based searches using embeddings. See [Vector Search](../../features/search/vector-search).
- **Evals**: Evaluate, track, compare, and improve language model performance for specific tasks. See [Evals](../../features/large-language-models/evals).
- **Local Models**: Load and serve models locally from various sources, including local filesystems and Hugging Face. See [Local Models](../../features/large-language-models/serving).

For API usage, refer to the [API Documentation](../api).

import DocCardList from '@theme/DocCardList';

<DocCardList />
