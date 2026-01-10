---
description: Using Spice.ai for Agentic AI Applications
---

# Agentic AI Apps

Build intelligent autonomous agents that act contextually by grounding AI models in secure, full-knowledge datasets with fast, iterative feedback loops.

Spice.ai helps in building intelligent autonomous agents by leveraging several key features:

### Federated SQL Query

Spice.ai enables federated querying across databases, data warehouses, and lakes. With advanced query push-down optimizations, it ensures efficient retrieval and processing of data across disparate sources, reducing latency and operational complexity. [Learn more about Federated SQL Query](https://github.com/spiceai/docs/blob/trunk/spiceaidocs/docs/features/federated-queries/index.md). For practical implementation, refer to the [Federated SQL Query recipe](https://github.com/spiceai/cookbook/blob/trunk/federation/README.md).

### Data Acceleration & Materialization with Change Data Capture (CDC)

Spice.ai materializes application-specific datasets close to the point of use, reducing query and thus retrieval times, and infrastructure costs. It supports Change Data Capture (CDC), keeping materialized data sets up-to-date with minimal overhead and enabling real-time, reliable data access. [Learn more about Data Acceleration](https://github.com/spiceai/docs/blob/trunk/spiceaidocs/docs/features/data-acceleration/index.md). See the [DuckDB Data Accelerator recipe](https://github.com/spiceai/cookbook/blob/trunk/duckdb/accelerator/README.md) for an example.

### AI Gateway

Integrate AI into your applications with Spice.ai’s AI Gateway. It supports hosted models like OpenAI and Anthropic and local models such as OSS Llama and NVIDIA NIM. Fine-tuning and model distillation are simplified, helping faster cycles of development and deployment. [Learn more about AI Gateway](https://github.com/spiceai/docs/blob/trunk/spiceaidocs/docs/features/large-language-models/index.md). Refer to the [Running Llama3 Locally recipe](https://github.com/spiceai/cookbook/blob/trunk/llama/README.md) for details.

### Search with Vector Similarity Search (VSS)

Spice.ai provides advanced search capabilities, including vector similarity search (VSS), enabling efficient retrieval of unstructured data, embeddings, and AI model outputs. This is critical for applications like RAG and intelligent search systems. [Learn more about Vector Similarity Search](https://github.com/spiceai/docs/blob/trunk/spiceaidocs/docs/features/search/index.md). For implementation, see the [Searching GitHub Files recipe](https://github.com/spiceai/cookbook/blob/trunk/search_github_files/README.md).

### Semantic Model for AI

Built-in semantic models allow Spice.ai to align AI operations with enterprise data, ensuring that applications are grounded in contextual, full-knowledge datasets. This enhances the accuracy and reliability of AI outputs while reducing risks of irrelevant or untrustworthy results. [Learn more about Semantic Model for AI](https://github.com/spiceai/docs/blob/trunk/spiceaidocs/docs/features/semantic-model/index.md).

### Monitoring and Observability

Spice.ai includes robust monitoring and observability tools tailored for AI applications. These tools provide end-to-end visibility into data flows and AI workflows, LLM-specific observability to monitor model performance, track usage, and manage drift, and security and compliance auditing for data and model interactions. [Learn more about Monitoring and Observability](https://github.com/spiceai/docs/blob/trunk/spiceaidocs/docs/features/monitoring/index.md).
