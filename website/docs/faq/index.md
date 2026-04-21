---
title: 'Spice.ai FAQ'
sidebar_label: 'FAQ'
description: 'Answers to frequently asked questions about Spice.ai including features, use cases, differences from Trino/Presto/Dremio, federated queries, caching, and AI capabilities.'
keywords: [spice.ai, faq, frequently asked questions, trino, presto, dremio, data federation, caching, ai agents]
image: /img/og/spiceai.png
pagination_prev: null
pagination_next: null
sidebar_position: 2
---

## 1. What is Spice?

Spice is an open-source SQL query and AI compute engine, written in Rust, for data-driven apps and agents.

Spice provides four industry standard APIs in a lightweight, portable runtime (single ~140 MB binary):

1. **SQL Query APIs**: Supports HTTP, Arrow Flight, Arrow Flight SQL, ODBC, JDBC, and ADBC.
2. **OpenAI-Compatible APIs**: Provides HTTP APIs for OpenAI SDK compatibility, local model serving (CUDA/Metal accelerated), and hosted model gateway.
3. **Iceberg Catalog REST APIs**: Offers a unified API for Iceberg Catalog.
4. **MCP HTTP+SSE APIs**: Enables integration with external tools via Model Context Protocol (MCP) using HTTP and Server-Sent Events (SSE).

Spice embeds [DataFusion](https://datafusion.apache.org/), the fastest single-node Parquet SQL query engine, and [DuckDB](https://duckdb.org), to serve secure, virtualized data views to data-intensive apps, AI, and agents.

## 2. Why should I use Spice?

Spice is primarily used for:

- **Data Federation**: SQL query across any database, data warehouse, or data lake. [Learn More](../features/query-federation).
- **Data Materialization and Acceleration**: Materialize, accelerate, and cache database queries. [Read the MaterializedView interview - Building a CDN for Databases](https://materializedview.io/p/building-a-cdn-for-databases-spice-ai)
- **AI apps and agents**: An AI-database powering retrieval-augmented generation (RAG) and intelligent agents. [Learn More](https://github.com/spiceai/cookbook/tree/trunk/rag#readme).

## 3. How is Spice different?

- **Application-Centric Design:** Spice is designed for 1:1 or 1:N mappings between applications and Spice instances, making it flexible for tenant-specific or customer-specific configurations. Unlike traditional databases designed for many applications sharing one data system, Spice often runs one instance per application or tenant.
- **Dual-Engine Acceleration:** Spice supports both OLAP (DuckDB/Arrow) and OLTP (SQLite/PostgreSQL) databases at the dataset level, providing flexibility for various query workloads.
- **Separation of Materialization and Storage/Compute:** Spice enables data to remain close to its source while materializing working sets for fast access, reducing data movement and query latency.
- **Deployment Flexibility:** Deployable across infrastructure tiers, including edge, on-prem, and cloud environments. Spice can run as a standalone instance, sidecar, microservice, or cluster.

## 4. Can Spice handle federated queries?

Yes. Spice natively supports federated queries across disparate data sources with advanced query push-down capabilities. Spice executes portions of queries directly on source databases, reducing data transfer and improving performance. [Learn More](../features/query-federation).

## 5. Is Spice a cache?

Not solely. Spice functions as an active cache or working dataset prefetcher. A _working dataset_ is a subset of data actively used by an application or model, such as recent records or frequently accessed tables. Unlike traditional caches that fetch data reactively, Spice proactively prefetches and materializes data based on filters, intervals, triggers, or Change Data Capture (CDC), ensuring data readiness for queries. Spice also supports [results caching](../features/caching).

## 6. Is Spice a CDN for databases?

Yes. Spice acts as a CDN for databases by loading and materializing datasets close to applications, reducing latency and improving query efficiency. [Read more](https://materializedview.io/p/building-a-cdn-for-databases-spice-ai).

## 7. How is Spice different from Trino/Presto and Dremio?

Spice is purpose-built for data and AI applications and agents, designed with low-latency access, materialization, and proximity to applications. Trino/Presto and Dremio primarily target big data analytics and rely on centralized clusters. Spice's decentralized approach reduces latency, simplifies deployment, and improves efficiency.

## 8. How does Spice compare to Spark?

Spark excels at distributed batch processing and large-scale transformations. Spice focuses on real-time, low-latency data access and AI inference. Spice materializes data locally and supports tiered storage, optimizing performance for applications requiring fast access and high concurrency.

## 9. How does Spice compare to DuckDB?

DuckDB is an embedded analytics database optimized for OLAP queries. Spice integrates DuckDB for data acceleration, combining DuckDB's analytical capabilities with Spice's broader federation, multi-engine support, and flexible deployment. Spice can be considered an enterprise/production productization of DuckDB for data-intensive applications.

## 10. What AI capabilities does Spice provide?

Spice provides unified APIs for data and AI workflows, including model inference, embeddings, and an AI gateway supporting OpenAI, Anthropic, xAI, and Nvidia NIMs. Spice includes advanced LLM tools such as vector and hybrid search, text-to-SQL, SQL retrieval, data sampling, and context formatting.

## 11. What AI model providers does Spice support?

Spice supports local model serving (e.g., Llama3) and gateways to hosted AI platforms including OpenAI, Anthropic, xAI, and Nvidia NIMs. [Learn More](../features/large-language-models).

## 12. What deployment options does Spice support?

Spice supports multiple deployment configurations:

- Standalone binary
- Sidecar or microservice
- Cluster deployments
- Edge, on-prem, and cloud environments

Spice Cloud Platform (SCP) provides managed, SOC 2 Type II compliant deployments. [Learn More](https://spiceai.org/docs/deployment/architectures).

## 13. Where can developers find examples and recipes?

The [Spice.ai Cookbook](https://github.com/spiceai/cookbook) provides over 65 quickstarts and examples demonstrating Spice capabilities, including federated queries, RAG, text-to-SQL, and more.

## 14. How can developers get started quickly?

Visit the [Spice.ai Getting Started Guide](../getting-started) to install Spice, connect data sources, and begin querying. Spice installs the GPU-accelerated runtime by default (if supported).

## 15. What is Data-grounded AI?

Data-grounded AI anchors models in accurate, current, domain-specific data rather than relying solely on pre-trained knowledge. Spice unifies enterprise data across databases, data lakes, and APIs, dynamically incorporating real-world context at inference time. This helps minimize hallucinations, reduce operational risk, and build trust in AI by delivering reliable, relevant outputs.

## 16. What query engines does Spice support?

Spice uses [Apache DataFusion](https://datafusion.apache.org/) as its primary query execution engine, providing vectorized, multi-threaded query processing with automatic memory management and spilling. DataFusion powers the Arrow and Spice Cayenne (Vortex) accelerators. Spice also supports DuckDB, SQLite, and PostgreSQL as acceleration engines. Developers can select engines based on workload requirements, balancing performance, concurrency, and latency.

## 17. Does Spice support Change Data Capture (CDC)?

Yes. Spice supports streaming ingestion from several sources:

- **Native PostgreSQL logical replication** (recommended for Postgres sources). Spice connects directly to the source using Postgres' `wal_level=logical` + pgoutput and streams `INSERT`/`UPDATE`/`DELETE` events into the accelerator. [Learn more](../features/cdc/postgres-replication.md).
- **[DynamoDB Streams](../components/data-connectors/dynamodb)** for Amazon DynamoDB sources — Spice consumes the table's change stream and applies `INSERT`/`UPDATE`/`DELETE` events to the accelerator with `refresh_mode: changes`.
- **[Apache Kafka](../components/data-connectors/kafka)** for event-streaming topics — Spice consumes records directly with `refresh_mode: append` for real-time, append-only acceleration.
- **[Debezium](../components/data-connectors/debezium)** (over Kafka), for sources where Debezium is already deployed, or for databases without a native Spice CDC path (MySQL, SQL Server, etc.). [Learn more](../features/cdc).

## 18. How do I keep an accelerated dataset incrementally up-to-date?

For sources with a monotonically-increasing version column (e.g. `updated_at`), Spice incrementally ingests new and modified records using [`time_column`](../reference/spicepod/datasets#time_column) + [`refresh_mode: append`](../features/data-acceleration/data-refresh#append), with [`refresh_append_overlap`](../reference/spicepod/datasets#accelerationrefresh_append_overlap) to tolerate clock skew and [`retention_period`](../reference/spicepod/datasets#accelerationretention_period) to evict old or soft-deleted records. Pair with `primary_key` + `on_conflict: upsert` to deduplicate re-read rows within the overlap window. See [Data Refresh](../features/data-acceleration/data-refresh) for configuration details and examples.

## 19. Can Spice integrate with existing BI tools?

Yes. Spice integrates with BI tools through standard SQL interfaces (ODBC, JDBC, Arrow Flight SQL), enabling accelerated, real-time analytics for dashboards and reporting. An official [Tableau Connector](../clients/tableau) is available and a [BI Acceleration](https://www.youtube.com/watch?v=blEtLgRKu0c) demo using Apache Superset.

## 20. How does Spice handle data privacy and compliance?

Spice provides secure, auditable data access through sandboxed runtimes, secure endpoint checks, and detailed telemetry and tracing. The Spice Cloud Platform (SCP) is SOC 2 Type II compliant, meeting enterprise security and compliance requirements.

## 21. Can Spice be used for real-time analytics?

Yes. Spice accelerates data locally using Apache Arrow, Spice Cayenne (Vortex), DuckDB, SQLite, or PostgreSQL, enabling real-time analytics and sub-second query performance for data-intensive applications and dashboards.

## 22. How can developers contribute to Spice?

Developers can contribute by submitting code, documentation, or raising issues on [GitHub](https://github.com/spiceai/spiceai). See [CONTRIBUTING.md](https://github.com/spiceai/spiceai/blob/trunk/CONTRIBUTING) for guidelines.

## 23. Does Spice support schema evolution?

Spice infers the schema for datasets and views at startup and does not apply runtime schema changes by default. If the source schema changes while the runtime is running (for example, columns are added, removed, or their types change), data refreshes will fail with a schema mismatch error rather than silently applying the new schema. This behavior is intentional — it protects against unintentional or breaking schema changes propagating into accelerated tables.

To pick up a new source schema, restart the Spice runtime. On startup, Spice re-infers the schema from the source, and the accelerated table is re-initialized with the updated schema.

Runtime schema evolution controls are planned for a future release but will remain off by default to guard against unexpected schema drift.
