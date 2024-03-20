---
type: docs
title: 'Data Connectors'
linkTitle: 'Data Connectors'
description: ''
weight: 70
---

Data Connectors provide connections to databases, data warehouses, and data lakes for federated SQL queries and data replication.

Currentlyt supported Data Connectors include:

| Name         | Description | Status       | Protocol/Format  | Refresh Modes    | Supports Inserts |
| ------------ | ----------- | ------------ | ---------------- | ---------------- | ---------------- |
| `databricks` | Databricks  | Alpha        | Delta Lake       | `full`           | ❌               |
| `postgres`   | PostgreSQL  | Alpha        |                  | `full`           | ✅               |
| `spiceai`    | Spice.ai    | Alpha        | Arrow Flight     | `append`, `full` | ✅               |
| `s3`         | S3          | Alpha        | Parquet          | `full`           | ❌               |
| `dremio`     | Dremio      | Alpha        | Arrow Flight SQL | `full`           | ❌               |
| `snowflake`  | Snowflake   | Coming soon! | Arrow Flight SQL | `full`           | ❌               |
| `bigquery`   | BigQuery    | Coming soon! | Arrow Flight SQL | `full`           | ❌               |
| `mysql`      | MySQL       | Coming soon! |                  | `full`           | ❌               |