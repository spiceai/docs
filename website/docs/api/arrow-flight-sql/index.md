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

Point lookups and other small Flight SQL responses spend more of their time in planning, admission, and the network than in the scan.

- **Prepared statements**, when planning dominates the lookup. `PREPARE` the statement, then `EXECUTE` it with bound parameters ([prepared statements](../reference/sql/prepared_statements)). Preparing saves parsing and planning work, not queueing: `EXECUTE` still takes a [`max_concurrent_queries`](../reference/spicepod/runtime#runtimequerymax_concurrent_queries) slot. Repeated SQL text also hits the [logical plan cache](../features/caching#logical-plan-cache).
- **A low [`target_partitions`](../reference/performance-tuning#query-parallelism)** for a lookup that does not scan in parallel. Confirm the plan with [`EXPLAIN`](../reference/sql/explain).

JDBC, ODBC, and ADBC clients speak this protocol. A statement created with `PREPARE` is visible only in the Flight SQL session that created it, and each handshake starts a new session. In a pool whose connections each authenticate with their own handshake, run `PREPARE` on every connection that calls `EXECUTE`. Size the pools against the admission budget of the whole Spice tier, not one runtime's [`max_concurrent_queries`](../reference/spicepod/runtime#runtimequerymax_concurrent_queries) — see [Client connection pools](../reference/performance-tuning#client-connection-pools).

## Long `DoGet` streams

[`runtime.query.timeout`](../reference/spicepod/runtime#runtimequerytimeout) applies to Flight SQL for the whole query, including result streaming. If the timeout fires after rows have started, the `DoGet` stream ends with an error. Bytes already delivered stay delivered, and the stream does not close as a successful completion. Acceleration refreshes are exempt from that timeout.
