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

For a developer-focused walkthrough of when and how to use Spice, see [A Developer's Guide to Understanding Spice.ai](https://spice.ai/blog/a-developers-guide-to-understanding-spice-ai).

## 2. Why should I use Spice?

Spice is primarily used for:

- **Data Federation**: SQL query across any database, data warehouse, or data lake. [Learn More](features/query-federation).
- **Data Materialization and Acceleration**: Materialize, accelerate, and cache database queries. [Read the MaterializedView interview - Building a CDN for Databases](https://materializedview.io/p/building-a-cdn-for-databases-spice-ai)
- **AI apps and agents**: An AI-database powering retrieval-augmented generation (RAG) and intelligent agents. [Learn More](https://github.com/spiceai/cookbook/tree/trunk/rag#readme).

## 3. How is Spice different?

- **Application-Centric Design:** Spice is designed for 1:1 or 1:N mappings between applications and Spice instances, making it flexible for tenant-specific or customer-specific configurations. Unlike traditional databases designed for many applications sharing one data system, Spice often runs one instance per application or tenant.
- **Dual-Engine Acceleration:** Spice supports both OLAP (DuckDB/Arrow) and OLTP (SQLite/PostgreSQL) databases at the dataset level, providing flexibility for various query workloads.
- **Separation of Materialization and Storage/Compute:** Spice enables data to remain close to its source while materializing working sets for fast access, reducing data movement and query latency.
- **Deployment Flexibility:** Deployable across infrastructure tiers, including edge, on-prem, and cloud environments. Spice can run as a standalone instance, sidecar, microservice, or cluster.

## 4. What is Data-grounded AI?

Data-grounded AI anchors models in accurate, current, domain-specific data rather than relying solely on pre-trained knowledge. Spice unifies enterprise data across databases, data lakes, and APIs, dynamically incorporating real-world context at inference time. This helps minimize hallucinations, reduce operational risk, and build trust in AI by delivering reliable, relevant outputs.

## 5. How is Spice different from Trino/Presto and Dremio?

Spice is purpose-built for data and AI applications and agents, designed with low-latency access, materialization, and proximity to applications. Trino/Presto and Dremio primarily target big data analytics and rely on centralized clusters. Spice's decentralized approach reduces latency, simplifies deployment, and improves efficiency.

## 6. How does Spice compare to Spark?

Spark excels at distributed batch processing and large-scale transformations. Spice focuses on real-time, low-latency data access and AI inference. Spice materializes data locally and supports tiered storage, optimizing performance for applications requiring fast access and high concurrency.

Starting with v1.9 (preview), Spice also supports multi-node [Distributed Query](features/distributed-query) execution based on [Apache Ballista](https://datafusion.apache.org/ballista/), splitting a single query across scheduler and executor nodes for partitioned data lake sources. This closes much of the gap with Spark for large analytical scans while keeping Spice's low-latency, materialization-first model for application and agent workloads. See [Apache Ballista at Spice AI](https://spice.ai/blog/apache-ballista-at-spice-ai) for the architecture and [Operationalizing Amazon S3 for AI](https://spice.ai/blog/operationalizing-amazon-s3-for-ai) for a data-lake example.

## 7. How does Spice compare to DuckDB?

DuckDB is an embedded analytics database optimized for OLAP queries. Spice integrates DuckDB for data acceleration, combining DuckDB's analytical capabilities with Spice's broader federation, multi-engine support, and flexible deployment. Spice can be considered an enterprise/production productization of DuckDB for data-intensive applications.

## 8. Can Spice handle federated queries?

Yes. Spice natively supports federated queries across disparate data sources with advanced query push-down capabilities. Spice executes portions of queries directly on source databases, reducing data transfer and improving performance. [Learn More](features/query-federation).

## 9. Can Spice federate joins across many tables and data sources?

Yes, but performance degrades as the number of sources and tables grows because the slowest source bounds end-to-end latency. For workloads that join across many tables or many heterogeneous sources, the recommended pattern is to **materialize the join into an accelerated dataset or [accelerated view](components/views)**. This converts a multi-source federated join into a single local scan, making latency predictable and decoupling query performance from any one source's availability.

Plan acceleration of hot joins proactively rather than waiting to discover them under load. See [Query Federation](features/query-federation), [Data Acceleration](features/data-acceleration), and [Performance Tuning](reference/performance-tuning) for tradeoffs and configuration. The [Multi-Tenancy for AI Agents without the Pipelines](https://spice.ai/blog/multi-tenancy-for-ai-agents-without-pipelines) blog post walks through a concrete federation + acceleration example.

## 10. Can Spice query nested fields (JSON / struct columns)?

Yes. Spice supports querying nested data through both native nested types (struct, list, map) and JSON-encoded text columns.

For nested types, use standard field access (e.g. `column.field.subfield`). For JSON-encoded text columns, Spice provides a family of [JSON SQL functions](reference/sql/json) including `json_get`, `json_get_str`, `json_get_int`, `json_get_float`, `json_get_bool`, `json_get_json`, and `json_get_array`, plus the `->` operator.

Spice pushes JSON predicates down to the underlying engine (e.g. DuckDB) where supported. When pushdown is not viable for a particular expression, Spice transparently evaluates the predicate in [DataFusion](features/query-federation) so queries always execute correctly. If a query against a nested field is unexpectedly slow or fails, prefer the typed `json_get_*` variants over generic extraction so the planner can reason about types.

## 11. What query engines does Spice support?

Spice uses [Apache DataFusion](https://datafusion.apache.org/) as its primary query execution engine, providing vectorized, multi-threaded query processing with automatic memory management and spilling. DataFusion powers the Arrow and Spice Cayenne (Vortex) accelerators. Spice also supports DuckDB, SQLite, and PostgreSQL as acceleration engines. Developers can select engines based on workload requirements, balancing performance, concurrency, and latency.

See [Performance Tuning](reference/performance-tuning) for sizing guidance and the [Memory](reference/memory) reference for how Spice manages query memory and spilling under load. For deeper context, see [How we use Apache DataFusion at Spice AI](https://spice.ai/blog/how-we-use-apache-datafusion-at-spice-ai) and [Vortex at Spice AI](https://spice.ai/blog/vortex-at-spice-ai-the-columnar-format-for-data-intensive-workloads) on the Cayenne columnar format.

## 12. Is Spice a cache?

Not solely. Spice functions as an active cache or working dataset prefetcher. A _working dataset_ is a subset of data actively used by an application or model, such as recent records or frequently accessed tables. Unlike traditional caches that fetch data reactively, Spice proactively prefetches and materializes data based on filters, intervals, triggers, or Change Data Capture (CDC), ensuring data readiness for queries. Spice also supports [results caching](features/caching).

## 13. Is Spice a CDN for databases?

Yes. Spice acts as a CDN for databases by loading and materializing datasets close to applications, reducing latency and improving query efficiency. [Read more](https://materializedview.io/p/building-a-cdn-for-databases-spice-ai).

## 14. Can Spice be used for real-time analytics?

Yes. Spice accelerates data locally using Apache Arrow, Spice Cayenne (Vortex), DuckDB, SQLite, or PostgreSQL, enabling real-time analytics and sub-second query performance for data-intensive applications and dashboards.

## 15. Does Spice support Change Data Capture (CDC)?

Yes. Spice supports streaming ingestion from several sources:

- **Native PostgreSQL logical replication** (recommended for Postgres sources). Spice connects directly to the source using Postgres' `wal_level=logical` + pgoutput and streams `INSERT`/`UPDATE`/`DELETE` events into the accelerator. [Learn more](features/cdc/postgres-replication.md).
- **[DynamoDB Streams](components/data-connectors/dynamodb)** for Amazon DynamoDB sources — Spice consumes the table's change stream and applies `INSERT`/`UPDATE`/`DELETE` events to the accelerator with `refresh_mode: changes`.
- **[Apache Kafka](components/data-connectors/kafka)** for event-streaming topics — Spice consumes records directly with `refresh_mode: append` for real-time, append-only acceleration.
- **[Debezium](components/data-connectors/debezium)** (over Kafka), for sources where Debezium is already deployed, or for databases without a native Spice CDC path (MySQL, SQL Server, etc.). [Learn more](features/cdc).

For a real-world architecture using DynamoDB Streams to sync data to thousands of nodes, see [Real-Time Control Plane Acceleration with DynamoDB Streams](https://spice.ai/blog/real-time-acceleration-with-dynamodb-streams).

## 16. How do I keep an accelerated dataset incrementally up-to-date?

For sources with a monotonically-increasing version column (e.g. `updated_at`), Spice incrementally ingests new and modified records using [`time_column`](reference/spicepod/datasets#time_column) + [`refresh_mode: append`](features/data-acceleration/data-refresh#append), with [`refresh_append_overlap`](reference/spicepod/datasets#accelerationrefresh_append_overlap) to tolerate clock skew and [`retention_period`](reference/spicepod/datasets#accelerationretention_period) to evict old or soft-deleted records. Pair with `primary_key` + `on_conflict: upsert` to deduplicate re-read rows within the overlap window. See [Data Refresh](features/data-acceleration/data-refresh) for configuration details and examples.

## 17. How can I control the load Spice puts on a source system during refresh?

Spice provides several controls for tuning ingestion pressure:

- **Incremental refresh** with [`refresh_mode: append`](features/data-acceleration/data-refresh#append) and a [`time_column`](reference/spicepod/datasets#time_column) to fetch only new or changed rows instead of reloading the full dataset.
- **Per-connector concurrency, connection pooling, backoff, and retry**. For example, the [Databricks connector](components/data-connectors/databricks/deployment) exposes `max_concurrent_requests` (shared per SQL Warehouse), and the [GitHub connector](components/data-connectors/github) exposes `github_max_concurrent_connections` (shared per token / app installation). Most connectors also expose pool and timeout parameters.
- **Runtime-level parallel dataset loading** via [`runtime.num_of_parallel_loading_at_start_up`](reference/spicepod/runtime) to bound how many datasets initialize concurrently at startup.
- **Refresh scheduling controls** — `refresh_check_interval`, `refresh_jitter`, and `refresh_retry_*` parameters in [Data Refresh](features/data-acceleration/data-refresh) — to spread load over time and avoid thundering-herd patterns.

Lowering concurrency and increasing intervals reduces source load but increases the time required to reach steady-state freshness; tune iteratively against your source's RPS and concurrency limits. See [Performance Tuning](reference/performance-tuning) and the [Memory](reference/memory) reference for guidance on balancing throughput and resource usage.

## 18. Can Spice load data on demand instead of proactively refreshing every dataset?

Yes. Several patterns help avoid eagerly refreshing datasets that may never be queried:

- **Deferred readiness** with [`ready_state: on_registration`](features/data-acceleration/data-refresh#ready-state) — Spice marks the dataset ready before any data has been loaded, so the dataset is registered immediately and the first refresh is initiated lazily.
- **On-demand refresh** via the [`POST /v1/datasets/:name/acceleration/refresh`](api/HTTP/post-dataset-refresh) endpoint to trigger a refresh from an external scheduler, webhook, or first-query signal.
- **Stale-while-revalidate caching** for HTTP-backed and connector-backed datasets via [`refresh_mode: caching`](features/data-acceleration/refresh-modes/caching), which fetches on first request and revalidates in the background.
- **Federated fallback** with [`on_zero_results: use_source`](features/data-acceleration/data-refresh#behavior-on-zero-results) so queries that miss the acceleration transparently fall through to the source.

These patterns combine well in multi-tenant deployments where only a fraction of tenants are active at any given time. See [Multi-Tenancy for AI Agents without the Pipelines](https://spice.ai/blog/multi-tenancy-for-ai-agents-without-pipelines) for a worked example.

## 19. Does Spice support schema evolution?

Spice infers the schema for datasets and views at startup and does not apply runtime schema changes by default. If the source schema changes while the runtime is running (for example, columns are added, removed, or their types change), data refreshes will fail with a schema mismatch error rather than silently applying the new schema. This behavior is intentional — it protects against unintentional or breaking schema changes propagating into accelerated tables.

To pick up a new source schema, restart the Spice runtime. On startup, Spice re-infers the schema from the source, and the accelerated table is re-initialized with the updated schema.

Runtime schema evolution controls are planned for a future release but will remain off by default to guard against unexpected schema drift.

## 20. What AI capabilities does Spice provide?

Spice provides unified APIs for data and AI workflows, including model inference, embeddings, and an AI gateway supporting OpenAI, Anthropic, xAI, and Nvidia NIMs. Spice includes advanced LLM tools such as vector and hybrid search, text-to-SQL, SQL retrieval, data sampling, and context formatting.

## 21. What AI model providers does Spice support?

Spice supports local model serving (e.g., Llama3) and gateways to hosted AI platforms including OpenAI, Anthropic, xAI, and Nvidia NIMs. [Learn More](features/large-language-models).

## 22. Where should I run embedding models — co-located with each replica or in a central cluster?

For most deployments, the recommended pattern is to **embed in the central ingestion tier** with GPU-equipped nodes: the embedding model runs once per row during ingestion, vectors are stored in the acceleration, and read-tier replicas access them via [snapshots](features/data-acceleration/snapshots) or direct query. This minimizes data movement and keeps the read tier inexpensive to scale.

When embeddings must be computed at query time (e.g. user-supplied queries for [vector search](features/search/vector-search)), dedicated embedding instances co-located with the read tier — or a shared, horizontally-scaled embedding service — provide better latency than per-replica GPUs. See the [Local](components/embeddings/local/deployment) and [Hugging Face TEI](components/embeddings/huggingface/deployment) deployment guides for sizing.

## 23. How does Spice handle vector / hybrid search at scale?

Spice supports [vector search](features/search/vector-search), [full-text search](features/search/full-text), [multi-vector search](features/search/multi-vector), and [reranking](features/search/rerank) over accelerated datasets. Vectors are stored in the acceleration alongside the source data, so search executes locally without round-tripping to a separate vector database.

For best performance, store accelerated vector datasets in **file-mode DuckDB or Spice Cayenne (Vortex)** — file-mode is often faster than in-memory due to columnar compression and dictionary encoding — and configure [acceleration indexes](features/data-acceleration/indexes) on filter columns to narrow brute-force scans. See [Performance Tuning](reference/performance-tuning) and the [Memory](reference/memory) reference for sizing accelerated vector workloads, and [Vortex at Spice AI](https://spice.ai/blog/vortex-at-spice-ai-the-columnar-format-for-data-intensive-workloads) for the storage format underpinning Cayenne. Expanded HNSW and other approximate-nearest-neighbor index types are tracked for future releases.

## 24. What search APIs does Spice provide?

Spice exposes search through both an HTTP API and SQL table-valued functions:

- **[`POST /v1/search`](api/HTTP/post-search)** — a unified HTTP endpoint that performs vector, full-text, multi-vector, and hybrid search across configured datasets. Requests specify the dataset(s), search text, optional filters, and limit; the response returns ranked rows with relevance scores and any requested passthrough columns. Embeddings are computed automatically when an embedding model is configured on the dataset.
- **SQL UDTFs** for in-query search — `vector_search(table, 'query')` and related functions can be composed with standard SQL `JOIN`, `WHERE`, and `ORDER BY` for hybrid filtering and ranking. See [Vector Search](features/search/vector-search), [Full-Text Search](features/search/full-text), [Multi-Vector Search](features/search/multi-vector), and [Reranking](features/search/rerank).
- **MCP tools** — the search APIs are also exposed to AI agents through Spice's [MCP server](features/large-language-models), so agents can issue search queries without writing SQL.

For an end-to-end example, see the [Search](features/search) overview and the [Amazon S3 Vectors with Spice](https://spice.ai/blog/amazon-s3-vectors-with-spice) blog post.

## 25. What deployment options does Spice support?

Spice supports multiple deployment configurations:

- Standalone binary
- Sidecar or microservice
- Cluster deployments
- Edge, on-prem, and cloud environments

Spice Cloud Platform (SCP) provides managed, SOC 2 Type II compliant deployments. [Learn More](https://spiceai.org/docs/deployment/architectures).

For moving a deployment to production, see the [Production Readiness](https://docs.spice.ai/docs/enterprise/production/production) guide and the [Enterprise Distribution Comparison](https://docs.spice.ai/docs/enterprise/getting-started/distributions) for choosing between OSS and Enterprise distributions.

## 26. Which deployment patterns are open source vs. Enterprise?

The sidecar model, cluster model, [snapshot bootstrapping](features/data-acceleration/snapshots), and pointing instances at each other for tiered fallback are all open source. The [Distributed Query](features/distributed-query) feature — splitting a single query across multiple scheduler/executor nodes (Apache Ballista) — is available as a preview starting in v1.9. The [Spice.ai Enterprise](https://spice.ai) Kubernetes Operator additionally provides the [`SpicepodSet`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodset) and [`SpicepodCluster`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodcluster) CRDs for declarative replica management, automatic PVC resizing, mTLS, and scheduler/executor topology.

Distributed query is only required for large single-query workloads (TB/PB-scale scans, heavy embedding/indexing). See the [Enterprise Distribution Comparison](https://docs.spice.ai/docs/enterprise/getting-started/distributions) for a feature-by-feature breakdown.

## 27. How does fallback work in tiered (sidecar + central cluster) deployments?

Reads fall through a layered chain. A request first checks the local sidecar's results cache and acceleration. On a miss, the request is delegated to the central cluster, which checks its own results cache and acceleration. If both miss, the cluster federates back to the original data source. The full chain is **results cache → acceleration → federated source**, applied at each tier.

For details, see the [Sidecar](deployment/architectures/sidecar), [Cluster](deployment/architectures/cluster), and [Tiered](deployment/architectures/tiered) architecture guides, along with [Caching](features/caching), [Data Acceleration](features/data-acceleration), and [Query Federation](features/query-federation). See the [Cluster-Sidecar Architecture](https://spice.ai/blog/cluster-sidecar-architecture) blog post for a deeper walkthrough of the pattern.

## 28. How do I run multiple Spice replicas for HA without each replica pulling from the source?

Separate the **ingestion (write) tier** from the **query (read) tier**:

- A small ingestion tier (typically 1–3 instances) connects to the source, builds accelerations, and publishes [snapshots](features/data-acceleration/snapshots).
- The read tier scales horizontally and bootstraps from snapshots, so replicas never connect directly to the source.

If the ingestion tier is temporarily unavailable, read replicas continue serving (potentially stale) data from snapshots, providing a recovery window measured in hours rather than minutes. The Enterprise [`SpicepodSet`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodset) resource manages replica sets declaratively with rolling/parallel update strategies, automatic PVC resizing, and crashloop protection. See [Cluster](deployment/architectures/cluster) and the [Cluster-Sidecar Architecture](https://spice.ai/blog/cluster-sidecar-architecture) blog post for the open-source pattern, and the [Production Readiness](https://docs.spice.ai/docs/enterprise/production/production) guide for HA checklists.

## 29. How should I shard Spice for very large multi-tenant workloads?

Shards are independent groups of Spice instances, each with its own Spicepod configuration. Strategies that scale well:

- **Bucket multiple tenants per shard** using a deterministic bucket UDF (e.g. `bucket(org_id, N)`) instead of one partition per tenant. ACLs are still enforced at query time, and operational complexity is bounded by `N` rather than tenant count.
- **Use [acceleration partitioning](features/data-acceleration/partitioning)** to control physical layout within a shard.
- **Manage shards declaratively with the Enterprise Operator** using [`SpicepodSet`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodset) (and [`SpicepodCluster`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodcluster) for distributed query) with rollout strategies, mTLS, and OIDC.

See the [Sharded](deployment/architectures/sharded) deployment architecture for guidance, and [Multi-Tenancy for AI Agents without the Pipelines](https://spice.ai/blog/multi-tenancy-for-ai-agents-without-pipelines) for a multi-tenant blueprint.

## 30. Which secret stores does Spice support?

Spice supports [Kubernetes Secrets](components/secret-stores/kubernetes), [AWS Secrets Manager](components/secret-stores/aws-secrets-manager), [Azure Key Vault](components/secret-stores/azure-keyvault), [environment variables](components/secret-stores/env), and the local OS [keyring](components/secret-stores/keyring). See the [secret stores overview](components/secret-stores) for configuration and selectors.

Additional secret backends — including HashiCorp Vault — are tracked as planned additions. Open or upvote an issue at [github.com/spiceai/spiceai](https://github.com/spiceai/spiceai/issues) to influence prioritization.

## 31. How does Spice handle data privacy and compliance?

Spice provides secure, auditable data access through sandboxed runtimes, secure endpoint checks, and detailed telemetry and tracing. The Spice Cloud Platform (SCP) is SOC 2 Type II compliant, meeting enterprise security and compliance requirements. See the [Production Readiness](https://docs.spice.ai/docs/enterprise/production/production) guide for hardening recommendations.

## 32. Can Spice integrate with existing BI tools?

Yes. Spice integrates with BI tools through standard SQL interfaces (ODBC, JDBC, Arrow Flight SQL), enabling accelerated, real-time analytics for dashboards and reporting. An official [Tableau Connector](clients/tableau) is available and a [BI Acceleration](https://www.youtube.com/watch?v=blEtLgRKu0c) demo using Apache Superset.

## 33. Where can developers find examples and recipes?

The [Spice.ai Cookbook](https://github.com/spiceai/cookbook) provides over 65 quickstarts and examples demonstrating Spice capabilities, including federated queries, RAG, text-to-SQL, and more.

## 34. How can developers get started quickly?

Visit the [Spice.ai Getting Started Guide](getting-started) to install Spice, connect data sources, and begin querying. Spice installs the GPU-accelerated runtime by default (if supported).

## 35. How can developers contribute to Spice?

Developers can contribute by submitting code, documentation, or raising issues on [GitHub](https://github.com/spiceai/spiceai). See [CONTRIBUTING.md](https://github.com/spiceai/spiceai/blob/trunk/CONTRIBUTING) for guidelines.
