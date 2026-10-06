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
