---
title: 'API Overview'
sidebar_label: 'Overview'
sidebar_position: 1
description: 'Spice.ai API overview, including SQL query interfaces, OpenAI-compatible endpoints, Iceberg catalog REST APIs, and the Model Context Protocol (MCP) for integrating external tools.'
pagination_prev: null
pagination_next: null
---

Spice provides high-performance, industry-standard APIs:

### SQL Query APIs

- **Arrow Flight** / **Arrow Flight SQL**: High-performance SQL query.
- **ODBC**, **JDBC**, **ADBC**: Standard SQL interfaces for database clients and analytics tools.

### OpenAI-Compatible APIs

- **HTTP APIs**: Compatible with the OpenAI SDK and AI SDK. Supports local model serving (CUDA/Metal accelerated) and gateway to hosted models.

### Iceberg Catalog REST APIs

- **HTTP APIs**: Unified API for consuming Apache Iceberg catalogs in data lake architectures.

### MCP API

- **HTTP APIs**: The Model Context Protocol (MCP) helps integrate external tools and services into the Spice runtime. MCP tools can be accessed via HTTP APIs for tool integration and orchestration. For details, see the [MCP documentation](../features/large-language-models/mcp).

### Request Correlation

HTTP, Arrow Flight, and Flight SQL requests accept a `spice-trace-id` header (gRPC metadata for Flight) carrying a 32-character hexadecimal trace ID. The runtime records the ID in [`runtime.task_history`](../reference/task_history#correlating-requests-with-spice-trace-id) and prefixes the query's log records with it. SQL query responses return the ID in a `spice-trace-id` header.

### Server Timing

SQL query responses report the time the runtime spent on the query in a [`Server-Timing`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server-Timing) field with one `total` metric in milliseconds, so a client can separate server time from network time:

```text
server-timing: total;dur=12.345
```

On HTTP [`/v1/sql`](HTTP/post-sql), a response whose body is complete before it is sent, such as CSV or an error, carries `Server-Timing` as a header. The default streamed JSON body sends it as a trailer after the body, declared by a `Trailer: Server-Timing` header, when the request accepts trailers: over HTTP/2, or over HTTP/1.1 with a `TE: trailers` request header. Otherwise the streamed response has no `Server-Timing` field.

On Arrow Flight and Flight SQL, a query `DoGet` that completes ends with a `server-timing` trailer. When the same runtime served the `GetFlightInfo` that issued the ticket, the value is the sum of the time spent in both calls, not the time between them.
