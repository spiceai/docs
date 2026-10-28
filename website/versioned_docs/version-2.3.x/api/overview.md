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

### Text-to-SQL Context

`GET /v1/nsql/context` returns the context that [`POST /v1/nsql`](./HTTP/post-nsql) gives a model to generate SQL: the datasets in scope and their schemas, the Spice-specific SQL functions, registered user-defined functions, and, when requested, sample data. It builds the context without calling the model, so it helps inspect what a text-to-SQL model sees or supply the same context to a model outside Spice.

```bash
curl "http://localhost:8090/v1/nsql/context?include_sampling=true" -H "Accept: application/json"
```

The `Accept` header selects Markdown (`text/markdown`, the default), plain text (`text/plain`), or a structured JSON object (`application/json`). Any other type returns `406`. The `model` query parameter names the model whose dataset allowlist applies. When it is omitted and the Spicepod has exactly one model, Spice uses that model; with no models or several, the request returns `400`. Sample data is off by default: `include_sampling=true` adds distinct-value samples, and `include_examples` adds example rows and defaults to the value of `include_sampling`. `sampling_limit` and `examples_limit` set the rows per sample, default to 3, and accept at most 100.
