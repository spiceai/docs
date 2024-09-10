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
| `clickhouse`    | Clickhouse  | Alpha  |                                     | `full`           | ❌               |
| `databricks`    | Databricks  | Alpha  | Spark Connect <br/> S3 / Delta Lake | `full`           | ❌               |
| `delta_lake`    | Delta Lake  | Alpha  | Delta Lake                          | `full`           | ❌               |
| `dremio`        | Dremio      | Alpha  | Arrow Flight SQL                    | `full`           | ❌               |
| `flightsql`     | FlightSQL   | Alpha  | Arrow Flight SQL                    | `full`           | ❌               |
| `ftp`, `sftp`   | FTP/SFTP    | Alpha  | Parquet, CSV                        | `full`           | ❌               |
| `github`        | GitHub      | Alpha  | GraphQL, REST                       | `full`           | ❌               |
| `graphql`       | GraphQL     | Alpha  | GraphQL                             | `full`           | ❌               |
| `http`, `https` | HTTP(s)     | Alpha  | Parquet, CSV                        | `full`           | ❌               |
| `mysql`         | MySQL       | Alpha  |                                     | `full`           | ❌               |
| `odbc`          | ODBC        | Alpha  | ODBC                                | `full`           | ❌               |
| `postgres`      | PostgreSQL  | Alpha  |                                     | `full`           | ❌               |
| `s3`            | S3          | Alpha  | Parquet, CSV                        | `full`           | ❌               |
| `sharepoint`    | SharePoint  | Alpha  |                                     | `full`           | ❌               |
| `snowflake`     | Snowflake   | Alpha  | Arrow                               | `full`           | ❌               |
| `spark`         | Spark       | Alpha  | Spark Connect                       | `full`           | ❌               |
| `spiceai`       | Spice.ai    | Alpha  | Arrow Flight                        | `append`, `full` | ✅               |

## Data Connector Docs

import DocCardList from '@theme/DocCardList';

<DocCardList />
