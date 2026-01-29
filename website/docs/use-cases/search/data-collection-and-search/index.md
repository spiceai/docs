---
title: 'Simplifying Real-Time Data Collection and Search'
sidebar_label: 'Real-Time Data Collection'
sidebar_position: 4
description: 'Spice.ai processes streaming and static data with integrated search for real-time insights, focusing on application logic.'
pagination_prev: null
pagination_next: null
---

Spice.ai processes streaming and static data with integrated search capabilities for real-time insights, focusing on application logic and enabling rapid development of data-driven features.

Unlike complex streaming platforms (e.g., Apache Flink) that require extensive infrastructure, Spice.ai unifies streaming and static data with vector and hybrid search for developers. This simplifies real-time data workflows and research-driven applications, minimizing setup and maintenance overhead compared to fragmented streaming and search solutions.

## Why Spice.ai?

- **Streamlined Access**: Queries streaming (e.g., Kafka, Databricks Delta Live Tables) and static sources in a single SQL interface, reducing pipeline complexity compared to tools requiring separate stream and batch processing.
- **Low Latency**: Materializes real-time datasets near applications using Change Data Capture (CDC), delivering faster insights than cloud-based streaming solutions with network latency.
- **Hybrid Search**: Combines vector similarity search (VSS) for semantic research with keyword and BM25 scoring for precise data retrieval, enabling rich, context-aware applications unlike standalone streaming platforms.
- **Observability**: Built-in monitoring simplifies debugging of data flows and search performance, providing end-to-end visibility absent in fragmented streaming and search tools.

## Example

A gaming platform processes live player activity from Kafka streams to power in-game leaderboards and personalized challenges, while using hybrid search to enable players to research game strategies by querying unstructured content (e.g., guides, forums) and structured metadata. This unified approach bypasses the infrastructure overhead of separate streaming pipelines and search engines, enhancing player engagement and feature delivery. The [Searching GitHub Files recipe](https://github.com/spiceai/cookbook/blob/trunk/search_github_files/README.md) demonstrates real-time data processing and search patterns adaptable to such use cases.

## Benefits

- **Developer Focus**: Shifts effort from pipeline and search infrastructure management to application development.
- **Responsiveness**: Delivers real-time insights and search results critical for user engagement.
- **Versatility**: Integrates streaming data with semantic and precise search for diverse application needs.

### Learn More

- **Federated SQL Queries**: [Documentation](../../../features/query-federation) and [Federated SQL Query Recipe](https://github.com/spiceai/cookbook/blob/trunk/federation/README.md).
- **Data Acceleration**: [Documentation](../../../features/data-acceleration) and [DuckDB Data Accelerator Recipe](https://github.com/spiceai/cookbook/blob/trunk/duckdb/accelerator/README.md).
- **Vector and Hybrid Search**: [Documentation](../../../features/search) and [Searching GitHub Files Recipe](https://github.com/spiceai/cookbook/blob/trunk/search_github_files/README.md).
- **Observability**: [Documentation](../../../features/observability).
