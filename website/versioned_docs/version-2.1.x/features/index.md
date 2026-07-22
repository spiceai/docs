---
title: 'Spice.ai Features'
sidebar_label: 'Features'
sidebar_position: 3
description: 'Explore Spice.ai features including data federation, data acceleration, caching, search, LLM integration, embeddings, observability, and more for building data-driven AI applications.'
keywords: [spice.ai, features, data federation, data acceleration, caching, search, llm, embeddings, observability, cdc, machine learning]
image: /img/og/spiceai.png
pagination_prev: null
pagination_next: null
---

import DocCardList from '@theme/DocCardList';

Spice provides a set of features for building data-driven applications and AI agents. This page gives an overview of each feature area.

### Data Query and Federation

[Query Federation](./query-federation/index.md) connects multiple data sources—databases, data warehouses, and data lakes—through a single SQL interface. Write one query that joins data across PostgreSQL, Snowflake, S3, and other sources. Spice pushes query operations to source databases when possible to reduce data transfer.

### Data Acceleration and Caching

[Data Acceleration](./data-acceleration/index.md) materializes remote datasets locally in memory or on disk using engines like Arrow, DuckDB, SQLite, or PostgreSQL. Accelerated datasets stay current through scheduled refreshes, append mode, or [Change Data Capture (CDC)](./cdc/index.md). [Caching](./caching/index.md) stores query and search results in memory with configurable TTLs and eviction policies to avoid redundant computation.

### Views

[Views](./views/index.md) create virtual tables from SQL queries over other datasets, similar to database views — useful for encapsulating query logic and (when accelerated) materializing precomputed joins or aggregates.

### AI and Language Models

[Large Language Models](./large-language-models/index.md) provides an OpenAI-compatible API gateway for hosted models (OpenAI, Anthropic, xAI) and locally served models (Llama, Phi) with CUDA and Metal acceleration. Models can call tools to query datasets, run SQL, and retrieve schemas. [Embeddings](./embeddings/index.md) generates vector representations of text for semantic search and RAG workflows. [Workers](./workers/index.md) coordinate interactions between models and tools, supporting load-balancing strategies such as round-robin and fallback across multiple LLM providers.

### Search

[Search](./search/index.md) supports three methods: vector search (semantic similarity using embeddings), full-text search (keyword matching with BM25 scoring), and hybrid search (combining both with Reciprocal Rank Fusion). All search methods are accessible through SQL UDTFs like `vector_search()` and `text_search()`.

### Functions

[Functions](./functions/index.md) extend SQL with custom scalar functions declared in a Spicepod. Inline SQL bodies run in-process and can use any DataFusion built-in; remote `http://` / `https://` endpoints batch row inputs over JSON for delegating logic to ML models, internal services, or custom code. Every function is automatically callable from SQL and (by default) surfaced as an LLM tool.

### Tool Registry

[Tool Registry](./tool-registry/index.md) keeps per-turn token cost bounded as the runtime's tool catalog grows. It replaces individual tool definitions with searchable `tool_search` and `tool_invoke` meta-tools backed by a hybrid full-text, keyword, schema, and vector search. Applies uniformly to built-in tools, MCP tools, and Functions declared with `as_tool: true` — typically a ~10× reduction in tool-definition tokens for tool-heavy Spicepods.

### Monitoring and Observability

[Observability](./observability/index.md) exposes Prometheus-compatible metrics, OpenTelemetry metric export, and distributed tracing with Zipkin. Integrations are available for Datadog, Grafana, and other monitoring platforms.

<DocCardList />
