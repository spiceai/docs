---
title: 'Spice.ai Runtime Components'
sidebar_label: 'Components'
sidebar_position: 5
description: 'Configure Spice.ai runtime components including data connectors, data accelerators, catalog connectors, model providers, embedding models, and secret stores.'
keywords: [spice.ai, components, data connectors, data accelerators, catalog connectors, model providers, embeddings, secret stores]
image: /img/og/spiceai.png
pagination_prev: null
pagination_next: null
---

Spice runtime components are the building blocks for configuring data access, acceleration, AI models, embeddings, and secrets. Each component is defined in the `spicepod.yaml` manifest.

**[Data Connectors](./components/data-connectors)** connect to databases, data warehouses, data lakes, and file systems for federated SQL queries. Spice supports over 30 connectors including PostgreSQL, MySQL, S3, Snowflake, Databricks, and DuckDB.

**[Data Accelerators](./components/data-accelerators)** materialize datasets locally in memory or on disk for faster query performance. Choose from Arrow (in-memory), DuckDB, SQLite, PostgreSQL, or Cayenne depending on workload characteristics.

**[Catalog Connectors](./components/catalogs)** integrate with data catalogs like Apache Iceberg, Unity Catalog, AWS Glue, and DuckLake to discover and register datasets from existing catalog infrastructure.

**[Models](./components/models)** configure LLM providers for AI inference through an OpenAI-compatible API. Connect to hosted models (OpenAI, Anthropic, xAI) or serve models locally with CUDA/Metal acceleration.

**[Embeddings](./components/embeddings)** generate vector representations of text for semantic search and RAG workflows, using built-in models or external providers.

**[Tools](./components/tools)** define callable functions that LLMs can invoke during inference, including MCP (Model Context Protocol) integrations for connecting to external services.

**[Vector Engines](./components/vectors)** index dataset embedding columns and serve nearest-neighbour search backed by DuckDB, Elasticsearch, or Amazon S3 Vectors.

**[Secret Stores](./components/secret-stores)** manage credentials and sensitive configuration values using environment variables, files, or external secret managers like AWS Secrets Manager and Azure Key Vault.

import DocCardList from '@theme/DocCardList';

<DocCardList />
