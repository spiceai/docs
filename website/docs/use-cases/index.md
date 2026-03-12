---
title: 'Spice.ai Use Cases'
sidebar_label: 'Use Cases'
sidebar_position: 4
description: 'Discover how to use Spice.ai for data federation, reverse-ETL, database CDN, enterprise search, RAG, and building AI-powered applications and agents.'
keywords: [spice.ai, use cases, data federation, reverse-etl, database cdn, enterprise search, rag, ai agents, data mesh]
image: /img/og/spiceai.png
pagination_prev: null
pagination_next: null
---

Spice supports a range of use cases across data infrastructure, search, and AI. Each use case below describes a specific scenario with architecture guidance, configuration examples, and links to relevant cookbook recipes.

For hands-on examples, see the [Spice.ai Cookbook](https://github.com/spiceai/cookbook).

## Data Federation, Acceleration, and SQL Query

- [**Reverse-ETL**](use-cases/data/reverse-etl): Serve data from warehouses and data lakes to operational systems, applications, and dashboards, eliminating complex pipelines.
- [**ETL-free Workflows and Data Migrations**](use-cases/data/etl-free-workflows): Enable data migrations and workflows without ETL federating legacy and modern systems for faster time-to-market and lower operational overhead.
- [**Database CDN**](use-cases/data/database-cdn): Locally replicate working sets of data for operational applications, caching dynamic data for high performance, low-latency, and resilience.
- [**Data Mesh**](use-cases/data/data-mesh): Unified data access across disparate sources with acceleration.
- [**Object-Store Native Database**](use-cases/data/object-store-data-engine): Federates, accelerates, and queries object-store data for real-time data access without centralized warehouses.

## Caching

- [**Write-Through Cache**](use-cases/caching/write-through-cache): Write data through Spice to both a local accelerator and the upstream source, keeping both layers consistent.
- [**Read-Through Cache**](use-cases/caching/read-through-cache): Fetch data from the upstream source on cache miss, with stale-while-revalidate and stale-if-error semantics.
- [**SQL/Database Cache**](use-cases/caching/sql-database-cache): Cache SQL database tables locally with acceleration and cache SQL query results in memory.
- [**S3 Cache**](use-cases/caching/s3-cache): Cache S3 and object store data locally with smart refresh skip for unchanged files.
- [**HTTP Cache**](use-cases/caching/http-cache): Cache HTTP API responses locally with request filtering, TTL, and stale-while-revalidate support.

## Search and Retrieval

- [**Enterprise Search**](use-cases/search/enterprise-search): Semantic and full-text-search search with hybrid vector and keyword capabilities.
- [**Object-Store Native Search**](use-cases/search/object-store-search-engine): Enables SQL queries, hybrid search, and LLM inference on object-store data for security applications, delivering real-time insights.
- [**Simplifying Real-Time Data Collection and Search**](use-cases/search/data-collection-and-search): Processes streaming and static data with integrated search for real-time insights in health-tech, focusing on application logic.

## Retrieval-Augmented-Generation (RAG)

- [**RAG for Contextual Applications**](use-cases/rag/applications): Combines structured and unstructured data for context-rich AI outputs in SaaS chatbots, improving user interactions.
- [**RAG for AI-Powered Reporting**](use-cases/rag/reporting): Generates dynamic, context-aware AI-driven reports for operational insights in health-tech, ensuring compliance and precision.

## AI Applications and Agents

- [**Real-Time Decision-Making for Intelligent Applications**](use-cases/ai/real-time-decision-making): Powers instant, context-aware decisions for security applications by grounding AI in federated, low-latency datasets.
- [**Edge-Enabled AI Applications and Agents**](use-cases/ai/edge-ai): Deploys AI applications across cloud and edge for low-latency decisions in security IoT use cases.
- [**Tool-Augmented AI with Model Context Protocol Server**](use-cases/ai/federated-mcp-server): Extends AI with custom tools via MCP server in finserv, integrating domain-specific APIs for enhanced functionality.
- [**Agentic AI Applications and Agents**](use-cases/ai/agentic-apps): Builds intelligent, autonomous agents for SaaS applications, enabling context-aware automation and decision-making.
