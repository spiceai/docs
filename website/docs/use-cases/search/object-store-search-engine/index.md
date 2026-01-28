---
title: 'Object-Store Native Search Engine'
sidebar_label: 'Object-Store Search'
sidebar_position: 17
description: 'Spice.ai powers a cloud-native embedded search engine on object-store data for security applications, enabling semantic and precise search.'
pagination_prev: null
pagination_next: null
---

Spice.ai powers a cloud-native embedded search engine on object-store data for security applications, enabling semantic and precise search with real-time insights directly from distributed storage.

Unlike standalone search engines (e.g., Elasticsearch, OpenSearch) that require data ingestion into centralized indexes, Spice.ai leverages object-store native databases (e.g., S3, Azure Blob) with hybrid search (vector + keyword + BM25) and federated data access, eliminating data duplication and reducing infrastructure overhead. This makes it ideal for security applications needing fast, compliant, and context-aware search across vast, distributed datasets, outperforming traditional search platforms with complex ETL requirements.

## Why Spice.ai?

- **Object-Store Native Search**: Executes hybrid search directly on object-store data (e.g., S3-stored logs, Databricks Delta Lake) without moving data to centralized indexes, reducing costs and complexity compared to traditional search engines.
- **Hybrid Search**: Combines vector similarity search (VSS) for semantic analysis (e.g., threat intelligence reports) with keyword/BM25 search for precise retrieval (e.g., specific log entries), delivering comprehensive results for security investigations.
- **Data Federation**: Integrates object-store data with other sources (e.g., PostgreSQL, on-premises systems) via federated SQL queries, providing a unified view without replication, unlike siloed search platforms.
- **Performance and Compliance**: Materializes hot datasets using Change Data Capture (CDC) for low-latency access and integrates with Databricks Unity Catalog for governance, ensuring compliance with security regulations (e.g., GDPR, SOC 2).

## Example

A security operations platform uses Spice.ai to search S3-stored network logs and threat intelligence data, combining semantic VSS for identifying emerging threat patterns with BM25 for precise log entry retrieval. This enables rapid incident analysis without moving data to a centralized index, reducing costs and ensuring compliance compared to ETL-dependent search engines. The [Vector-Based Search documentation](../../../features/search) and [Searching GitHub Files recipe](https://github.com/spiceai/cookbook/blob/trunk/search_github_files/README) provide guidance for implementing hybrid search on object stores.

## Benefits

- **Efficiency**: Direct search on object stores eliminates data movement, reducing infrastructure costs and complexity in security applications.
- **Precision**: Hybrid search delivers relevant, context-aware results for threat detection and analysis.
- **Compliance**: Governed data access aligns with strict security regulations, ensuring trust and auditability.

### Learn More

- **Vector and Hybrid Search**: [Documentation](../../../features/search) and [Searching GitHub Files Recipe](https://github.com/spiceai/cookbook/blob/trunk/search_github_files/README).
- **Federated SQL Queries**: [Documentation](../../../features/query-federation) and [Federated SQL Query Recipe](https://github.com/spiceai/cookbook/blob/trunk/federation/README).
- **Data Acceleration**: [Documentation](../../../features/data-acceleration) and [DuckDB Data Accelerator Recipe](https://github.com/spiceai/cookbook/blob/trunk/duckdb/accelerator/README).
- **Observability**: [Documentation](../../../features/observability).
