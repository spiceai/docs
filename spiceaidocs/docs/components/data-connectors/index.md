---
title: 'Data Connectors'
sidebar_label: 'Data Connectors'
description: ''
sidebar_position: 1
pagination_prev: null
pagination_next: null
---

Data Connectors provide connections to databases, data warehouses, and data lakes for federated SQL queries and data replication.

Currently supported Data Connectors include:

| Name            | Description | Status | Protocol/Format                     | Refresh Modes    | Supports Inserts |
| --------------- | ----------- | ------ | ----------------------------------- | ---------------- | ---------------- |
| `databricks`    | Databricks  | Alpha  | Spark Connect <br/> S3 / Delta Lake | `full`           | ❌               |
| `delta_lake`    | Delta Lake  | Alpha  | Delta Lake                          | `full`           | ❌               |
| `postgres`      | PostgreSQL  | Alpha  |                                     | `full`           | ❌               |
| `spiceai`       | Spice.ai    | Alpha  | Arrow Flight                        | `append`, `full` | ✅               |
| `s3`            | S3          | Alpha  | Parquet, CSV                        | `full`           | ❌               |
| `dremio`        | Dremio      | Alpha  | Arrow Flight SQL                    | `full`           | ❌               |
| `flightsql`     | FlightSQL   | Alpha  | Arrow Flight SQL                    | `full`           | ❌               |
| `snowflake`     | Snowflake   | Alpha  | Arrow                               | `full`           | ❌               |
| `mysql`         | MySQL       | Alpha  |                                     | `full`           | ❌               |
| `clickhouse`    | Clickhouse  | Alpha  |                                     | `full`           | ❌               |
| `spark`         | Spark       | Alpha  | Spark Connect                       | `full`           | ❌               |
| `ftp`, `sftp`   | FTP/SFTP    | Alpha  | Parquet, CSV                        | `full`           | ❌               |
| `graphql`       | GraphQL     | Alpha  | GraphQL                             | `full`           | ❌               |
| `odbc`          | ODBC        | Alpha  | ODBC                                | `full`           | ❌               |
| `http`, `https` | HTTP(s)     | Alpha  | Parquet, CSV                        | `full`           | ❌               |

## Data Connector Docs

import DocCardList from '@theme/DocCardList';

<DocCardList />
