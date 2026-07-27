---
title: 'Reverse-ETL for Operational Workflows'
sidebar_label: 'Reverse-ETL'
sidebar_position: 1
description: 'Serve enriched data from warehouses and data lakes to operational systems and applications, eliminating complex pipelines.'
pagination_prev: null
pagination_next: null
---

Spice serves enriched data from warehouses and data lakes directly to operational systems and applications, eliminating the need for complex ETL pipelines. By federating queries across warehouse and operational data sources and accelerating results locally, Spice turns warehouse data into a live, queryable resource for applications.

```mermaid
graph LR
    WH[(Warehouse / Data Lake)] -->|CDC / Refresh| Spice[Spice]
    Spice -->|Low-Latency Queries| App[Application]
```

## Why Spice.ai?

- **Unified Query Layer**: Federated SQL queries span Databricks, Snowflake, PostgreSQL, and other sources through a single endpoint, removing the need for separate connectors or pipeline orchestration.
- **Real-Time Sync**: Change Data Capture (CDC) keeps local replicas in sync with upstream sources, so operational systems always reflect the latest warehouse data without scheduled batch jobs.
- **Local Acceleration**: Materializes working sets of warehouse data into fast local engines like DuckDB or SQLite, providing sub-millisecond query latency for application workloads.
- **Governance**: Integrates with Databricks Unity Catalog for role-based access control and credential vendoring across federated sources.

## Example

An application serves customer metrics from a Databricks lakehouse to an internal dashboard, keeping the data locally accelerated for fast queries and automatically refreshed as upstream data changes.

### Example Configuration

```yaml
datasets:
  - from: databricks:catalog.schema.customer_metrics
    name: customer_metrics
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      refresh_mode: changes
      refresh_check_interval: 10s
```

This configuration federates the `customer_metrics` table from Databricks and accelerates it locally in DuckDB. The `refresh_mode: changes` setting uses CDC to sync only changed rows, keeping operational data current. The [DuckDB Data Accelerator recipe](https://github.com/spiceai/cookbook/blob/trunk/duckdb/accelerator/README.md) provides a practical guide to materializing datasets for such workflows.

## Benefits

- **Simplicity**: No pipeline orchestration or ETL infrastructure to maintain — query warehouse data directly.
- **Freshness**: CDC-based refresh keeps operational data current without manual sync.
- **Performance**: Local acceleration delivers low-latency queries for application workloads.

### Learn More

- **Federated SQL Queries**: [Documentation](../../features/query-federation) and [Federated SQL Query Recipe](https://github.com/spiceai/cookbook/blob/trunk/federation/README.md).
- **Data Acceleration**: [Documentation](../../features/data-acceleration) and [DuckDB Data Accelerator Recipe](https://github.com/spiceai/cookbook/blob/trunk/duckdb/accelerator/README.md).
- **Observability**: [Documentation](../../features/observability).
