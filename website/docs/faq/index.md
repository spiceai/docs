---
title: 'Frequently Asked Questions'
sidebar_label: 'FAQ'
description: 'Get answers to common questions about Spice.ai, including its features, differences from other tools, and use cases'
pagination_prev: null
pagination_next: null
sidebar_position: 2
---

## 1. What is Spice?

Spice is an open-source SQL query and AI compute engine, written in Rust, for data-driven apps and agents.

Spice provides three industry standard APIs in a lightweight, portable runtime (single ~140 MB binary):

1. **SQL Query APIs**: HTTP, Arrow Flight, Arrow Flight SQL, ODBC, JDBC, and ADBC.
2. **OpenAI-Compatible APIs**: HTTP APIs compatible the OpenAI SDK, AI SDK with local model serving (CUDA/Metal accelerated) and gateway to hosted models.
3. **Iceberg Catalog REST APIs**: A unified Iceberg Catalog API.

## 2. Why should I use Spice?

Spice is primarily used for:

- **Data Federation**: SQL query across any database, data warehouse, or data lake. [Learn More](https://docs.spiceai.org/features/federated-queries).
- **Data Materialization and Acceleration**: Materialize, accelerate, and cache database queries. [Read the MaterializedView interview - Building a CDN for Databases](https://materializedview.io/p/building-a-cdn-for-databases-spice-ai)
- **AI apps and agents**: An AI-database powering retrieval-augmented generation (RAG) and intelligent agents. [Learn More](https://github.com/spiceai/cookbook/tree/trunk/rag#readme).

## 3. How is Spice different?

- **Application-Centric Design:** Spice is designed for 1:1 or 1:N mappings between applications and Spice instances, making it flexible for tenant-specific or customer-specific configurations. Unlike traditional databases designed for many applications sharing one data system, Spice often runs one instance per application or tenant.
- **Dual-Engine Acceleration:** Spice supports both OLAP (DuckDB/Arrow) and OLTP (SQLite/PostgreSQL) databases at the dataset level, providing flexibility for various query workloads.
- **Separation of Materialization and Storage/Compute:** Spice enables data to remain close to its source while materializing working sets for fast access, reducing data movement and query latency.
- **Deployment Flexibility:** Deployable across infrastructure tiers, including edge, on-prem, and cloud environments. Spice can run as a standalone instance, sidecar, microservice, or cluster.

## 4. Is Spice a cache?

Not solely. Spice can be thought of as an active cache or working dataset prefetcher. Unlike traditional caches that fetch data on a miss, Spice prefetches and materializes data based on filters or intervals, ensuring data is ready and optimized for querying.

## 5. Is Spice a CDN for databases?

Yes, Spice functions like a CDN for databases by loading and materializing working datasets where they are most frequently accessed. This reduces latency and improves efficiency for applications, particularly in scenarios involving frequent queries or AI inference.

## 6. How does Spice differ from Trino/Presto and Dremio?

Spice is purpose-built for data and AI applications, emphasizing low-latency access, materialization, and proximity to the application. Trino/Presto and Dremio are primarily optimized for big data analytics and rely on centralized cloud clusters.

Spice’s decentralized approach brings working datasets closer to their point of use, offering several key benefits:

- **Proximity to Applications:** Materialized datasets reduce latency and boost performance for frequent queries.
- **Lightweight Deployments:** Single-node runtime enables flexible scaling and avoids the need for large, centralized clusters.
- **Improved Efficiency:** Reduces data movement across networks, cutting costs and speeding up access times.

## 7. How does Spice compare to Spark?

While Spark excels at distributed batch processing and large-scale data transformations, Spice focuses on enabling real-time, low-latency data access for applications. By materializing data locally and supporting tiered storage, Spice accelerates query performance in use cases where fast access and high concurrency are essential.

## 8. How does Spice compare to DuckDB?

DuckDB is an embedded analytics database optimized for OLAP queries on large datasets. Spice integrates DuckDB as part of its runtime for materialization and acceleration. This means developers can leverage DuckDB’s capabilities within Spice while also benefiting from Spice’s broader data federation, multi-engine support, and deployment flexibility.

## 9. Can Spice handle federated queries?

Yes, Spice natively supports federated queries across diverse data sources with advanced query push-down capabilities. This allows it to execute portions of a query directly on the source database, reducing the amount of data transferred and improving query performance.

## 10. What AI capabilities does Spice provide?

Spice offers a unified API for both data and AI/ML workflows. It includes endpoints for model inference, embeddings, and an AI gateway supporting popular providers like OpenAI and Anthropic. While Spice emphasizes data readiness as the first step in AI workflows, it also accelerates AI applications by co-locating data and inference engines for real-time performance.

## 11. What deployment options does Spice support?

Spice is highly flexible and supports multiple deployment configurations:

- **Standalone Binary:** Lightweight and easy to set up locally or in production environments.
- **Sidecar or Microservice:** Ideal for colocating with specific applications.
- **Cluster Deployments:** Scalable setups for large workloads.
- **Infrastructure Tiers:** Deployable across edge, on-prem, and cloud environments, enabling tiered data access optimization.

## 12. How can I get started?

Visit the [Spice.ai Getting Started Guide](https://spiceai.org/docs/getting-started/) to set up the runtime, connect to data sources, and start querying in minutes. Comprehensive examples and step-by-step instructions are available to help you get the most out of Spice.
