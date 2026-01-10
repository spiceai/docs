---
description: Monthly release notes for the Spice.ai Cloud Platform
---

# Release Notes

## October 2025

### Highlights

* **Iceberg Table Write Support (Preview)** – Write directly to Iceberg tables using standard SQL `INSERT INTO` commands, no Spark required.
* **Acceleration Snapshots** – Faster startup with cached acceleration states from S3.
* **Partitioned** [**S3 Vector Indexes**](../building-blocks/data-connectors/s3.md) – Improved scalability and query performance for large datasets.
* **AI SQL Function (Preview)** – Query LLMs directly in [SQL](../portal/playground/sql-query-editor.md) with `ai()` for summarization, classification, or translation.
* **Remote CLI Execution** – Run `spice sql`, `spice search`, and `spice chat` against remote endpoints.
* **Spice.js SDK v3.0.3** – Updated SDK for Node.js and browsers with simplified query APIs and better compatibility.

### Bug Fixes

* Improved reliability for Iceberg writes and acceleration snapshots.
* Fixed partition pruning and empty partition handling in queries.
* Enhanced [vector search](../use-cases/enterprise-search.md#vector-similarity-search-across-disparate-and-legacy-data-systems) stability and default limits (now up to 1,000 results).
* Improved AI [SQL query](../portal/playground/sql-query-editor.md) consistency and async handling.
* General performance and startup time optimizations across data connectors and runtime.

## September 2025

### Highlights

* [**Hybrid Search (RRF)**](../use-cases/enterprise-search.md)**:** Combine [`vector_search`](../features/search-and-retrieval.md#vector-search) and `text_search` using the new Reciprocal Rank Fusion (UDTF) for more relevant results; supports per-query rank weights, recency boosting, and configurable decay (`k` = 60.0).
* **Acceleration Metrics:** Added detailed Prometheus metrics for dataset refresh and ingestion lag:\
  `dataset_acceleration_max_timestamp_before_refresh_ms`,\
  `dataset_acceleration_max_timestamp_after_refresh_ms`,\
  `dataset_acceleration_refresh_lag_ms`,\
  `dataset_acceleration_ingestion_lag_ms`.
* **Search Defaults & Indexing:** Default result limit increased to **1,000** for both Full-Text and Vector Search; persistent on-disk FTS indexes improve reliability and restart time.
* **DataFusion v49 Upgrade:** Faster planning for queries with many columns, dynamic filters & TopK pushdown, compressed spill files, and more. 
* **Embeddings Improvements:** Support for EmbeddingGemma (Google's embedding model for text and documents) and embedding request cashing. 
* **Runtime Reliability:** Improved AI model diagnostics, clearer error messages, and stronger hybrid-query stability.

### Bug Fixes

* **Full-Text Search:** Fixed JOIN-level filter columns, corrected metadata projections, stabilized persistent indexes.
* **Vector Search:** Fixed embedding-column removal and improved concurrency handling.
* **Connectors:** Enhanced SQL warehouse error handling and async-query reliability.
* **Model Integrations:** Corrected regex validation; improved health-check accuracy and error clarity.
* **Query Engine:** Fixed RRF edge cases with disjoint results, removed duplicate fused entries, and improved case-sensitive column handling.

## August 2025

### Highlights

* **Amazon Bedrock Integration:** Added support for Nova-compatible models via the new Bedrock LLM provider. Configure directly in `Spicepod.yaml` using the `bedrock:` prefix and AWS credentials.
*   **AWS Redshift Support:** Connect Redshift clusters using the [PostgreSQL ](../building-blocks/data-connectors/postgres.md)data connector (`from: postgres:<schema.table>`).

    Full support for Redshift’s columnar storage and PostgreSQL-compatible types.
* **Hadoop Catalog for Iceberg:** Added support for Hadoop-based Iceberg catalogs on local (`file://`) or S3 (`s3://`, `s3a://`) storage.
*   **New** [**Data Connectors**](../building-blocks/data-connectors/)**:** Kafka Connector for real-time stream ingestion (`from: kafka:<topic>`).

    MongoDB Connector for querying NoSQL collections (`from: mongodb:<dataset>`).
* **DataFusion v48 Upgrade:** Performance improvements with DataFusion v48 — 50% smaller expression memory footprint and 10–20% faster query planning. Optimized string and window functions; up to 5.6× faster aggregate queries.
* **Model2Vec Embeddings:** Introduced optimized embeddings engine — 500× faster inference, 15× smaller model size.

### Bug Fixes

* Fixed [Amazon S3 Vectors](../building-blocks/data-connectors/s3.md) API compatibility issue when projecting embedding columns.
* Improved AWS authentication and retry logic for Bedrock providers.
* Fixed Databricks OpenAI token compatibility.
* Enhanced Parquet Reader to support files missing page indexes (`parquet_page_index: auto`).
* Improved error messages and stability across data connectors and model integrations

## July 2025

### Highlights

* **App Settings**\
  Region and storage information is now available in App Settings.
* **Spicepod Editor**\
  Editor now includes additional YAML safety checks and supports detached editing (even when repository is not connected).
* **User Experience**\
  Improved error messages, compact S3 Vectors engine input handling, and more consistent display of app/component status.

### Bug Fixes

* Fixed crash handling for app config errors—users now see a specific error explaining the issue.
* Editor’s YAML validation improved, warning users before saving malformed files.

## June 2025

### Highlights

* **New Data Connectors**\
  Access [Iceberg](https://spiceai.org/docs/components/data-connectors/iceberg) and [Glue](https://spiceai.org/docs/components/data-connectors/glue) data sources directly; step-by-step documentation provided.
* **Databricks Integration**\
  OAuth for [Databricks](../integrations/databricks.md) is fully automatic; your tokens are handled behind the scenes for all catalog, SQL, and chat actions.
* **Organization Flexibility**\
  Invite members with any email connected to a GitHub account; set specific app limits (e.g., 5 apps per org for Community, 20 for Enterprise).
* **Observability**\
  Supports up to 1,000 tasks in [Observability](../features/observability/).
* **Data & Secrets**\
  [All secret](../portal/apps/secrets.md) names must be uppercase—system now enforces this for new and updated secrets.

### Bug Fixes

* Query type detection for legacy SQL fixed for over 50 legacy formats.
* Organization invitation email bug resolved (GitHub-linked addresses only).
* Sticky UI headers now work in all supported browsers.

## May 2025

### Highlights

* **Smart Resource Usage**\
  Workspace owners can now set exact CPU and memory limits for each deployment. Minimum: 0.5 CPUs and 1GB RAM; Maximum: 16 CPUs and 128 GB RAM, configurable in settings.
* **Code & Editor Improvements**\
  The code editor supports copyable YAML examples, inline rendering of markdown/code blocks, and syntax highlighting for spicepod schemas.
* **Models & AI Upgrades**\
  [Claude opus-4 and Sonnet-4 ](https://spiceai.org/docs/components/models/anthropic)models are now available to all users. The model selector interface shows the version number and model status.
* **Editor Experience**\
  Live YAML validation and safety features have been implemented—invalid configurations are flagged instantly before saving.

### Bug Fixes

* Editor no longer drops indentation or list formatting when pasting code blocks.
* Model names and token handling have been corrected for export and import.

## April 2025

### Highlights

* **Resource Management**\
  Users can now set and adjust storage quotas up to 256 GB per workspace, and view usage directly from the app’s dashboard. Storage alerts notify you once you reach 90% of quota.
* **AI Model Support**\
  Added [Grok-3 series](https://spiceai.org/docs/components/models/xai) and [GPT-4.1](https://spiceai.org/docs/components/models/openai) support for all users. Models are selectable in the Spicepod and chat interface as soon as they become available.
* **Activity Analytics**\
  [Integration with Google Analytics](#) allows users to track app activity (sessions, completions, and installations) directly in the usage dashboard. UTM parameters for app installs are automatically recorded.
* **User Interface Experience**\
  Simplified error messages and cleaned up UI for benchmark reports, progress views, and data display.

### Bug Fixes

* Benchmarks section now returns exact inferences count for up to 30 days of data.
* Fixed occasional YAML validation errors in the Spicepod editor.

## March 2025

### Highlights

* **System Performance**\
  Concurrency limits raised to 100 parallel active queries per workspace. Workspace owners can now monitor live query queues. 
* **Custom Query Handling**\
  Query arguments included in all GET requests are now passed transparently to downstream systems for more granular filtering and control.
* **AI Chat Logs & History**\
  Improved loading and navigation for chat logs; message skeletons, progress bars, and artifact previews added. Message history now supports up to 500 prior messages.
* **Monitoring Enhancements**\
  [New app and model performance views](../portal/monitoring-and-request-logs.md) allow users to see live status and recent activity for the apps and models they own.

### Bug Fixes

* Resolved autoscroll issues when reviewing long chat histories.
* Fixed metric display errors for query queues when over 100 items were present.

## February 2025

### Highlights

* **AI Chat & Playground**\
  New session handling: users can revisit prior conversations and access a catalog explorer from [Playground](../portal/playground/ai-chat.md). Improvements to chat UI display make longer chat sessions and code completions easier to review. Markdown and progress rendering are now supported in chat.
* **Spicepod Editor**\
  Choose from multiple AI models and tools directly in the editor sidebar. YAML safety checks alert users about indentation or formatting issues before saving.

### Bug Fixes

* Fixed chat session loading delays for conversations over 50 messages.
* Dashboard graphs now update within 10 seconds of new data becoming available.
* Resolved error messages when switching between model and tool selections in the Spicepod editor.

## January 2025

### Highlights

* **Spicepod Experience Improvements**\
  When deploying an app, the system automatically selects the latest available patch version for your Spicepod (e.g., 1.0.3 will be chosen if your app currently uses 1.0.2). The Spicepod editor now provides clearer navigation and indicates which version is being deployed.
* **Performance & User Interface**\
  Member management, dataset, and model lists in the user interface are now more responsive and display item status in real time.

### Bug Fixes

* Deployment flow issues resolved for navigating between editing and deploying a Spicepod.
* Improved error feedback when users enter invalid configuration values.

## December 2024

### Highlights

* **Spicepod.yaml Configuration**\
  [Spicepods](../portal/app-spicepod/spicepod-configuration.md) now display unique content identifiers (CIDs) for each version deployed, and retaining CID tracking improves history and rollback accuracy. The editor sidebar is more intuitive, supports flexible editing even if no repository is connected, and surfaces volume claim template types.
* **Status & History**\
  Deployment status, history, and new monitoring tab allow users to see all current and prior deployments and their identifiers.
* **User Interface Updates**\
  Improved empty state displays, clearer descriptions, and smarter menu layouts for public apps. Datasets, app code, and models now have more granular state visibility.

### Bug Fixes

* Fixed anonymous viewer errors for public app pages.
* Fixed edge case in flavor selection and visibility for newly created Spicepods.

## November 2024

### Highlights

* **Dashboard Expansion**\
  Added the Models Benchmarks dashboard, including reference scores for popular datasets. Refined UI for performance and alert dashboards, ensuring users see the correct score for each model and configuration on every run.
* **Spicepod Management**\
  You can now view the full list of your managed spicepods, with creation, update, and removal activity tracked in the app. Use the `/v1/activity` endpoint to see app activity logs by timestamp. 
* **User Experience Improvements**\
  Streamlined editor: new saving, reset and validation logic. Deleted apps automatically remove their attached spicepods. Default datasets and version fallback logic improved for all new apps.

### Bug Fixes

* Improved dashboard data accuracy for benchmarks and metrics.
* Fixed bug with SQL result filters that caused stale data to appear in model dashboards.
* Activity and log endpoints now reliably return the most recent 1000 entries.

## October 2024

### Highlights

* **Copilot & Spicepod Integration**\
  [The Copilot onboarding flow](../integrations/github-copilot.md) is now unified and leverages shared spicepod instances for organizational consistency. Deployment status and logs are directly viewable in the Copilot UI.
* **Editor Enhancements**\
  The code editor now highlights YAML formatting errors and enables editing even when a repository isn’t connected. Sample dataset previews and component mapping have been improved. Side panel includes quick access to all relevant settings.
* **Model & Activity Tracking**\
  The models view now shows the current version, tool status, and last update date. Only relevant models are visible; deprecated items are automatically hidden.

### Bug Fixes

* Fixed chat history scroll and response display for long sessions.
* Editor bugs related to line numbering, case handling, and switching between specs have been resolved.
* Fixed edge cases in deployment status and activity notifications.

## September 2024

### Highlights

* **Operator Scale Set**\
  Spicepods now support explicit scale configuration: users can specify up to 50 concurrent instances per spicepod.
* **User Flows**\
  All setup flows are now handled from a streamlined single location, with improved deployment selection and history.
* **Observability Dashboards**\
  [Model and dataset metrics](https://spiceai.org/docs/features/observability) are now presented with sortable columns and trendline charts for the last 60 days. Task history and dataset refresh logic have been made transparent.

### Bug Fixes

* Fixed activity endpoint latency for organizations with more than 25 datasets.
* Improved logging to prevent duplicate error messages in UI.
* Fixed model filtering and sorting in deployment lists.

### August 2024

### What's New

#### Features

* **Schema Integration**: Added functionality to pipe `GetSchema` from API to spiced backend when using PATH type.
* **Enhanced Spicepod Functionality**: Streamlined setup flow using `spicepod.yaml` from GitHub and support for custom registries and images. Improved task history monitoring and deployment logic.

#### Reliability

* **Error Handling**: Improved error handling in Copilot agent and chat completions.

#### User Interface Updates

* **SQL Playground Improvements**: Enabled new features such as default queries, table formatting, and JSON parsing. Updated SQL Explorer with a streamlined layout and new tools.
* **Chat and Layout Enhancements**: Added multiline chat input, improved layout consistency, and table formatting in chat.

### Fixes and Improvements

* Fixed chat completion streaming and cleaned up Copilot agent handler.
* Updated SQL Explorer and trace views with better handling of inputs, outputs, and errors.

### July 2024

#### New Features

**Spicepod Deployment Enhancements:**

* Added support for deploying Spicepods directly from GitHub repositories.
* Introduced new flows for provisioning and configuring Spicepods, including updated formats and integration with external connections.
* Unified Spicepod setup for both general and GitHub Copilot-specific use cases.

**AI Chat Playground Updates:**

* Launched an improved playground for AI chat applications.
* /v1/chat/completions now supports streaming responses compatible with OpenAI SDK.

**SQL Explorer:**

* Introduced a unified SQL Explorer playground with enhanced query capabilities and debugging tools.
* Improved SQL support for managed spiced instances, including better routing and error handling.
* Added SQL error marker detection with line and column details.

#### **Enhancements**

**UI and UX Refinements:**

* Updated rounded corners, button radii, and other style tweaks for a more consistent look.
* Enhanced chat UI and added new interactive features like chat spinners and error markers for SQL.

#### **Bug Fixes**

* Fixed inconsistencies in Copilot configuration, ensuring seamless provisioning and deployment.

### June 2024

The June release included a [C# SDK](../sdks/dotnet-sdk.md) for Spice AI and Spice OSS to allow for development using .Net Standard 2.0 and .Net 6.0 or greater.

**Changes**

1. \[Dotnet SDK] Released v0.1.0
