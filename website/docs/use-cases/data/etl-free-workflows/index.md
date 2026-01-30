---
title: 'ETL-free Workflows and Data Migrations'
sidebar_label: 'ETL-free Workflows'
sidebar_position: 2
description: 'Spice.ai enables data migrations and workflows without ETL by federating legacy and modern systems for seamless transitions.'
pagination_prev: null
pagination_next: null
---

Spice.ai enables data migrations and workflows without ETL by federating legacy and modern systems for seamless transitions.

Unlike legacy ETL platforms (e.g., Informatica) that require heavy infrastructure, Spice.ai offers a drop-in solution for developers modernizing applications. Its ability to query across systems without data movement provides a lightweight alternative to data replication tools, reducing complexity and costs.

## Why Spice.ai?

- **Drop-In Solution**: Provides a single endpoint for legacy (e.g., Oracle) and modern (e.g., Snowflake) systems, avoiding application rewrites required by migration frameworks.
- **Data Federation**: Queries on-premises, cloud, and edge sources without moving data, minimizing costs and risks compared to data replication approaches.
- **Performance Optimization**: Materializes frequently accessed data for low-latency queries, outperforming traditional query federation with high overhead.
- **Monitoring**: Built-in observability tracks migration progress and performance, ensuring reliability and transparency.

## Example

A fintech firm migrates from an Oracle database to a cloud-native stack, querying both systems simultaneously to ensure zero downtime. This approach avoids the staged migrations and data duplication of ETL tools, maintaining service continuity for customers. The [CQRS Cookbook](https://github.com/spiceai/cookbook/tree/trunk/cqrs#readme) illustrates how to implement unified data access patterns for such scenarios.

## Benefits

- **Agility**: Accelerates modernization projects without disrupting existing applications.
- **Cost Savings**: Minimizes data movement and infrastructure costs.
- **Reliability**: Ensures data consistency during migrations with real-time federation.

### Learn More

- **Federated SQL Queries**: [Documentation](../../../features/query-federation/index) and [Federated SQL Query Recipe](https://github.com/spiceai/cookbook/blob/trunk/federation/README).
- **Data Acceleration**: [Documentation](../../../features/data-acceleration/index) and [DuckDB Data Accelerator Recipe](https://github.com/spiceai/cookbook/blob/trunk/duckdb/accelerator/README).
- **Observability**: [Documentation](../../../features/observability/index).
