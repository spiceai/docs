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

`application/json`, `application/vnd.spiceai.sql.v1+json`, and `text/csv` responses stream. A `text/plain` response, a `text/csv` response whose result has a nested column such as a list or struct, a response in any format whose result has a union column, and the final result of a `BEGIN … COMMIT` [transaction](../components/data-accelerators/cayenne/index.md#transactions) body are buffered: the whole result is collected before the body is written. A buffered result, and for `text/plain` an estimate of the rendered table, is reserved from the query memory pool that [`runtime.query.memory_limit`](../reference/memory.md#memory-limit-configuration) bounds. When the pool cannot hold it, the request fails with `503 Service Unavailable` and a body that starts with `The query result is too large to buffer in memory for this response.`, and a transaction is aborted before any of its writes are committed. For a large result, request `application/json` or `text/csv` rather than `text/plain`, and `application/json` when the result has nested columns, which CSV cannot represent. In v2.4.1 and earlier, buffered results are not reserved from the pool and can use memory beyond `runtime.query.memory_limit`.

### Text-to-SQL Context

`GET /v1/nsql/context` returns the context that [`POST /v1/nsql`](./HTTP/post-nsql) gives a model to generate SQL: the datasets in scope and their schemas, the Spice-specific SQL functions, registered user-defined functions, and, when requested, sample data. It builds the context without calling the model, so it helps inspect what a text-to-SQL model sees or supply the same context to a model outside Spice.

```bash
curl "http://localhost:8090/v1/nsql/context?include_sampling=true" -H "Accept: application/json"
```

The `Accept` header selects Markdown (`text/markdown`, the default), plain text (`text/plain`), or a structured JSON object (`application/json`). Any other type returns `406`. The `model` query parameter names the model whose dataset allowlist applies. When it is omitted and the Spicepod has exactly one model, Spice uses that model; with no models or several, the request returns `400`. Sample data is off by default: `include_sampling=true` adds distinct-value samples, and `include_examples` adds example rows and defaults to the value of `include_sampling`. `sampling_limit` and `examples_limit` set the rows per sample, default to 3, and accept at most 100.
