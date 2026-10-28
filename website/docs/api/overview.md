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

### Anthropic Messages API

- **HTTP APIs**: `POST /v1/messages` is compatible with Anthropic SDKs and tools such as Claude Code, and is served by any chat model in the Spicepod. For details, see the [Messages API documentation](../features/large-language-models/messages.md).

### Iceberg Catalog REST APIs

- **HTTP APIs**: Unified API for consuming Apache Iceberg catalogs in data lake architectures.

### MCP API

- **HTTP APIs**: The Model Context Protocol (MCP) helps integrate external tools and services into the Spice runtime. MCP tools can be accessed via HTTP APIs for tool integration and orchestration. For details, see the [MCP documentation](../features/large-language-models/mcp).

### Request Correlation

HTTP, Arrow Flight, and Flight SQL requests accept a `spice-trace-id` header (gRPC metadata for Flight) carrying a 32-character hexadecimal trace ID. The runtime records the ID in [`runtime.task_history`](../reference/task_history#correlating-requests-with-spice-trace-id) and prefixes the query's log records with it. SQL query responses return the ID in a `spice-trace-id` header.

### HTTP SQL Response Formats

`POST /v1/sql` returns results in the format named by the `Accept` header: `application/json` (default), `application/vnd.spiceai.sql.v1+json`, `text/csv`, or `text/plain`. `POST /v1/nsql` accepts the same formats.

`application/vnd.spiceai.sql.v1+json` returns a single JSON object with the result schema, the rows, the row count, and, when requested, the SQL that ran. Starting in v2.5, the keys are written in the order `schema`, `data`, `row_count`, `sql`, and the response streams rows as the query produces them, as `application/json` and `text/csv` do. `row_count` follows `data` because the count is known only after the last row is sent. Earlier versions buffered the whole result and wrote `row_count` first.

```json
{
  "schema": {
    "fields": [
      {
        "name": "id",
        "data_type": "Int64",
        "nullable": false,
        "dict_id": 0,
        "dict_is_ordered": false
      }
    ]
  },
  "data": [{ "id": 1 }, { "id": 2 }],
  "row_count": 2
}
```

JSON object keys are unordered, so clients that parse the response as an object, including the Spice SDKs, are unaffected. Clients that read the body as text or match on key positions should parse it as JSON instead. Starting in v2.5, `DECIMAL` values in this format keep their exact digits and scale, the same as `application/json`. Earlier versions converted them to floating-point numbers.
