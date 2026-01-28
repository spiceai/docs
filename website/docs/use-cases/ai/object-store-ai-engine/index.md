---
title: 'Object-Store Based SQL Query, Search, and LLM Inference Engine'
sidebar_label: 'Object-Store AI Engine'
sidebar_position: 14
description: 'Spice.ai enables SQL queries, hybrid search, and LLM inference on object-store data for security applications, delivering real-time insights.'
pagination_prev: null
pagination_next: null
---

Spice.ai enables SQL queries, hybrid search, and large language model (LLM) inference on object-store data for security applications, delivering real-time insights from distributed data sources with minimal infrastructure overhead.

Unlike traditional data platforms (e.g., Snowflake, BigQuery) or separate search and AI frameworks (e.g., Elasticsearch, LangChain) that require complex data pipelines and centralized storage, Spice.ai integrates SQL querying, vector/keyword search, and LLM inference directly on object stores (e.g., S3, Azure Blob). This unified approach reduces latency, simplifies architecture, and ensures compliance for security applications, outperforming fragmented solutions that demand extensive data movement and integration.

## Why Spice.ai?

- **Object-Store SQL Queries**: Executes federated SQL queries directly on object-store data (e.g., S3, Databricks Delta Lake) alongside other sources (e.g., PostgreSQL), eliminating the need for data ingestion into centralized warehouses, reducing costs and complexity.
- **Hybrid Search**: Combines vector similarity search (VSS) for semantic analysis of unstructured data (e.g., security logs, threat reports) with keyword/BM25 search for precise retrieval, delivering context-aware results critical for security investigations.
- **AI Gateway for LLM Inference**: Integrates LLMs (hosted like OpenAI or local like Llama) to process query and search results, generating actionable insights (e.g., threat summaries) with low-latency inference, optimized for object-store data access.
- **Performance and Compliance**: Materializes hot datasets using Change Data Capture (CDC) for low-latency access and leverages Databricks Unity Catalog for governance, ensuring compliance with security regulations (e.g., GDPR, SOC 2) unlike generic platforms.

## Example

A security operations platform uses Spice.ai to query object-store data (e.g., S3-stored network logs), perform hybrid search to identify threat patterns (semantic via VSS, precise via BM25), and run LLM inference to generate real-time threat intelligence reports. This unified workflow detects anomalies in minutes without moving data to a centralized warehouse, outperforming traditional platforms requiring complex ETL pipelines and separate AI tools. The [Vector-Based Search documentation](../../../features/search/) and [Federated SQL Query recipe](https://github.com/spiceai/cookbook/blob/trunk/federation/README.md) provide guidance for implementing search and query workflows on object stores.

## Benefits

- **Efficiency**: Direct querying and inference on object stores eliminate data movement, reducing infrastructure costs and complexity.
- **Real-Time Insights**: Low-latency search and LLM inference deliver rapid threat detection, critical for security applications.
- **Compliance**: Governed data access ensures alignment with security regulations, enhancing trust and auditability.

### Learn More

- **Federated SQL Queries**: [Documentation](../../../features/query-federation/) and [Federated SQL Query Recipe](https://github.com/spiceai/cookbook/blob/trunk/federation/README.md).
- **Vector and Hybrid Search**: [Documentation](../../../features/search/) and [Searching GitHub Files Recipe](https://github.com/spiceai/cookbook/blob/trunk/search_github_files/README.md).
- **AI Gateway**: [Documentation](../../../features/large-language-models/) and [Running Llama3 Locally Recipe](https://github.com/spiceai/cookbook/blob/trunk/llama/README.md).
- **Data Acceleration**: [Documentation](../../../features/data-acceleration/)
