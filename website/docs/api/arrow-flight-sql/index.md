---
title: 'Arrow Flight SQL API'
sidebar_label: 'Arrow Flight SQL'
sidebar_position: 4
desired_sidebar: api
description: 'Query Spice using JDBC/ODBC/ADBC'
tags:
  - api
  - arrow-flight-sql
  - sql
  - jdbc
  - odbc
---

[Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html) is a protocol for interacting with SQL databases using the Arrow in-memory format and the Flight RPC framework.

Spice implements the Flight SQL protocol, enabling querying of the datasets configured in Spice via tools that support connecting via one of the Arrow Flight SQL drivers, such as [DBeaver](https://dbeaver.io), [Tableau](https://www.tableau.com/), or [Power BI](https://www.microsoft.com/en-us/power-platform/products/power-bi).

<img src="https://imagedelivery.net/HyTs22ttunfIlvyd6vumhQ/0a8bc474-03c3-4c1c-8003-d250cd52b300/public" alt="arrow flight and spice" />

## Authentication

API Key authentication is supported for the Arrow Flight SQL endpoint. For more details, see [API Key Authentication](auth).

## Short queries

For point lookups and other small Flight SQL responses, fixed per-query costs (planning, admission, and the network round trip) make up more of the total time than they do for large scans.

- **Prepared statements**, for a lookup that runs often with different parameter values. `PREPARE` the statement, then `EXECUTE` it with bound parameters ([prepared statements](../reference/sql/prepared_statements)). Preparing saves parsing and planning work on each call, not queueing: `EXECUTE` still takes a [`max_concurrent_queries`](../reference/spicepod/runtime#runtimequerymax_concurrent_queries) slot. Repeated SQL text also hits the [logical plan cache](../features/caching#logical-plan-cache).
- **A low [`target_partitions`](../reference/performance-tuning#query-parallelism)** for a lookup that does not scan in parallel. Confirm the plan with [`EXPLAIN`](../reference/sql/explain).

JDBC, ODBC, and ADBC clients connect to Spice over Flight SQL. Set the connection pool size to the sum of [`max_concurrent_queries`](../reference/spicepod/runtime#runtimequerymax_concurrent_queries) across the Spice replicas behind the load balancer, divided by the number of application instances that share them — see [Client connection pools](../reference/performance-tuning#client-connection-pools).

## Long `DoGet` streams

[`runtime.query.timeout`](../reference/spicepod/runtime#runtimequerytimeout) applies to Flight SQL for the whole query, including result streaming. If a query times out while receiving results, the `DoGet` stream ends with an error. Acceleration refreshes are exempt from that timeout.
