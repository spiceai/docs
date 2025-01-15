---
title: 'Large Language Models'
sidebar_label: 'Large Language Models'
description: 'Learn how to configure large language models (LLMs)'
sidebar_position: 5
pagination_prev: null
pagination_next: null
tags:
  - models
---

Spice provides a high-performance, OpenAI API-compatible AI Gateway optimized for managing and scaling large language models (LLMs). It offers tools for Enterprise Retrieval-Augmented Generation (RAG), such as SQL query across federated datasets and an advanced search feature (see [Search](/docs/features/search)).

Spice supports **full OpenTelemetry observability**, helping with detailed tracking of model tool use, recursion, data flows and requests for full transparency and easier debugging.

## Configuring Language Models

Spice supports a variety of LLMs (see [Model Providers](/docs/components/models/index.md)).

### Core Features

- **Custom Tools**: Provide models with tools to interact with the Spice runtime. See [Tools](/docs/features/large-language-models/tools).
- **System Prompts**: Customize system prompts and override defaults for [`v1/chat/completion`](/docs/api/HTTP/post-chat-completions). See [Parameter Overrides](/docs/features/large-language-models/parameter_overrides).
- **Memory**: Provide LLMs with memory persistence tools to store and retrieve information across conversations. See [Memory](/docs/features/large-language-models/memory).
- **Vector Search**: Perform advanced vector-based searches using embeddings. See [Vector Search](/docs/features/search/vector-search).
- **Evals**: Evaluate, track, compare, and improve language model performance for specific tasks. See [Evals](/docs/features/large-language-models/evals).
- **Local Models**: Load and serve models locally from various sources, including local filesystems and Hugging Face. See [Local Models](/docs/features/large-language-models/serving).

For API usage, refer to the [API Documentation](/docs/api).

import DocCardList from '@theme/DocCardList';

<DocCardList />
