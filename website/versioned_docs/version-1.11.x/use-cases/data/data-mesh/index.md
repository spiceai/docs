---
title: 'Data Mesh for Unified Data Access'
sidebar_label: 'Data Mesh'
sidebar_position: 4
description: 'Spice.ai enables unified data access across disparate sources for health-tech applications, fostering a data mesh architecture.'
pagination_prev: null
pagination_next: null
---

Spice.ai enables unified data access across disparate sources for health-tech/healthcare applications, fostering a data mesh architecture that empowers domain teams with decentralized, real-time data ownership and access.

Unlike traditional data platforms (e.g., Snowflake, Redshift) that centralize data management and create bottlenecks for domain-specific teams, Spice.ai’s federated query engine and data acceleration support a data mesh approach, allowing health-tech teams to access and manage data autonomously while maintaining governance and performance. This reduces complexity and enhances agility compared to monolithic data warehouse solutions.

## Why Spice.ai?

- **Federated SQL Queries**: Unifies disparate data sources (e.g., PostgreSQL, Databricks, on-premises EHR systems) in a single SQL interface, enabling domain teams to query data without centralized dependencies, unlike traditional platforms requiring complex ETL processes.
- **Data Acceleration**: Materializes domain-specific datasets near applications using Change Data Capture (CDC), delivering low-latency access critical for real-time health-tech applications, surpassing cloud-only solutions with higher latency.
- **Governance**: Integrates with Databricks Unity Catalog for role-based security and credential vendoring, ensuring compliance with healthcare regulations (e.g., HIPAA), unlike generic data mesh tools lacking robust governance.
- **Observability**: Provides end-to-end visibility into data flows and performance, enabling health-tech teams to monitor and optimize domain-specific datasets, reducing debugging overhead compared to fragmented monitoring tools.

## Example

A health-tech platform implements a data mesh to enable clinical teams to access real-time patient data from PostgreSQL, research datasets from Databricks, and regulatory guidelines from cloud storage, all through a unified SQL interface. This empowers teams to develop patient-centric applications, such as real-time treatment recommendation systems, without relying on centralized data teams, improving agility and compliance compared to monolithic data warehouses. The [Federated SQL Query recipe](https://github.com/spiceai/cookbook/blob/trunk/federation/README) demonstrates unified data access patterns for such scenarios.

## Benefits

- **Decentralization**: Empowers health-tech domain teams with autonomous data access, enhancing innovation and agility.
- **Performance**: Low-latency data materialization ensures responsive applications for time-sensitive healthcare needs.
- **Compliance**: Governed access aligns with strict healthcare regulations, ensuring data security and auditability.

### Learn More

- **Federated SQL Queries**: [Documentation](../../features/query-federation/index) and [Federated SQL Query Recipe](https://github.com/spiceai/cookbook/blob/trunk/federation/README).
- **Data Acceleration**: [Documentation](../../features/data-acceleration/index) and [DuckDB Data Accelerator Recipe](https://github.com/spiceai/cookbook/blob/trunk/duckdb/accelerator/README).
- **Observability**: [Documentation](../../features/observability/index).
