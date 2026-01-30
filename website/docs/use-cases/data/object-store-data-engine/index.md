---
title: 'Object-Store Data Engine'
sidebar_label: 'Object-Store Data Federation'
sidebar_position: 5
description: 'Spice.ai federates, accelerates, and queries object-store data for finserv applications, enabling real-time data access without centralized warehouses.'
pagination_prev: null
pagination_next: null
---

Spice.ai federates, accelerates, and queries object-store data for financial services (finserv) applications, enabling real-time data access without the need for centralized data warehouses, streamlining workflows and ensuring compliance.

Unlike traditional data platforms (e.g., Snowflake, BigQuery) that rely on costly data ingestion into centralized repositories, Spice.ai’s federated query engine and data acceleration capabilities operate directly on object stores (e.g., S3, Azure Blob) alongside other sources, reducing infrastructure overhead and latency. This makes it ideal for finserv applications demanding fast, secure, and compliant data access for operational workflows, outperforming solutions dependent on complex ETL pipelines.

## Why Spice.ai?

- **Federated SQL Queries**: Executes SQL queries directly on object-store data (e.g., S3, Databricks Delta Lake) and other sources (e.g., PostgreSQL, on-premises systems) in a unified interface, eliminating data movement and simplifying workflows compared to centralized warehouse solutions.
- **Data Acceleration**: Materializes frequently accessed datasets (e.g., transaction logs) from object stores using Change Data Capture (CDC), delivering low-latency access critical for finserv’s time-sensitive applications, surpassing cloud-only platforms with higher latency.
- **Governance**: Integrates with Databricks Unity Catalog for role-based security and credential vendoring, ensuring compliance with finserv regulations (e.g., GDPR, SEC), unlike generic data federation tools lacking robust governance.
- **Observability**: Provides end-to-end visibility into data flows, query performance, and system health, enabling rapid debugging and optimization, reducing overhead compared to fragmented monitoring in traditional platforms.

## Example

A finserv platform queries transaction logs stored in S3, combines them with real-time market data from PostgreSQL, and materializes high-frequency trading datasets for low-latency portfolio analysis. This approach avoids moving data to a centralized warehouse, reducing costs and ensuring compliance with regulatory requirements, unlike ETL-heavy platforms that introduce delays and complexity. The [Federated SQL Query recipe](https://github.com/spiceai/cookbook/blob/trunk/federation/README) and [DuckDB Data Accelerator recipe](https://github.com/spiceai/cookbook/blob/trunk/duckdb/accelerator/README) provide practical guidance for implementing federated queries and data materialization.

## Benefits

- **Efficiency**: Direct querying on object stores eliminates data movement, reducing infrastructure costs and complexity in finserv.
- **Performance**: Accelerated data access ensures rapid insights for high-speed trading and risk analysis.
- **Compliance**: Governed data access aligns with strict financial regulations, ensuring security and auditability.

### Learn More

- **Federated SQL Queries**: [Documentation](../../../features/query-federation/index) and [Federated SQL Query Recipe](https://github.com/spiceai/cookbook/blob/trunk/federation/README).
- **Data Acceleration**: [Documentation](../../../features/data-acceleration/index) and [DuckDB Data Accelerator Recipe](https://github.com/spiceai/cookbook/blob/trunk/duckdb/accelerator/README).
- **Observability**: [Documentation](../../../features/observability/index).
