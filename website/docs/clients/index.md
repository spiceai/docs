---
title: 'Clients and Tools'
sidebar_label: 'Clients and Tools'
sidebar_position: 10
description: 'Client and tools for connecting to Spice'
pagination_prev: null
pagination_next: null
---

Spice supports a variety of clients and tools for querying data, including SQL clients, BI tools, and programmatic interfaces. Use these integrations to connect applications and dashboards to the Spice runtime.

### Connection Protocols

Most SQL clients connect to Spice using one of the following protocols:

| Protocol         | Endpoint                 | Best For                                          |
| ---------------- | ------------------------ | ------------------------------------------------- |
| Arrow Flight SQL | `grpc://localhost:50051` | High-performance data transfer, JDBC/ODBC drivers |
| HTTP             | `http://localhost:8090`  | REST API calls, curl, web applications            |
| ADBC             | Flight SQL driver        | Python and R data science workflows               |

For programmatic access, see [SDKs](../sdks).

import DocCardList from '@theme/DocCardList';

<DocCardList />
