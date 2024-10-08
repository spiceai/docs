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

For detailed configuration and API usage, refer to the [API Documentation](/api/overview.md).
