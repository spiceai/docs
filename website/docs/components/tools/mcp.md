---
title: 'Model Context Protocol Tools'
sidebar_label: 'MCP Tools'
---

Spice integrates with tools and services using the [Model Context Protocol](https://modelcontextprotocol.io/) (MCP). MCP tools can be configured to run internally or connect to external servers over HTTP using the [Streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports#streamable-http) transport.

## Overview

MCP helps extend the capabilities of the Spice runtime by enabling integration with external tools and services. This includes:

1. Running stdio-based MCP servers internally.
2. Connecting to external MCP servers over Streamable HTTP.

## Protocol Versions

Spice is dual-era. It serves the [`2026-07-28`](https://modelcontextprotocol.io/specification/2026-07-28/) revision and still answers the legacy `initialize` handshake, so existing clients on earlier revisions — including [`2025-03-26`](https://modelcontextprotocol.io/specification/2025-03-26/) — keep working unchanged.

| Era | How a client talks to Spice | Session |
| --- | --- | --- |
| **Modern** (`2026-07-28`) | `server/discover`, then `tools/list` and `tools/call` with per-request `_meta` — no `initialize` first | Sessionless. No `Mcp-Session-Id`. |
| **Legacy** (`2025-11-25` and earlier, including `2025-03-26`) | `initialize`, then `notifications/initialized` | Spice mints an `Mcp-Session-Id` and requires it on subsequent requests. |

Spice advertises `2026-07-28`; a legacy client negotiates the revision it requests in `initialize`.

Modern clients send the `MCP-Protocol-Version`, `Mcp-Method`, and — for `tools/call` — `Mcp-Name` Streamable HTTP headers. A tool argument annotated with `x-mcp-header` additionally requires a matching `Mcp-Param-<name>` header whose value equals that argument in the JSON-RPC body.

| Condition | Response |
| --- | --- |
| A protocol version this runtime does not support | JSON-RPC `-32022`; `data.supported` lists the revisions it accepts |
| A Streamable HTTP header that disagrees with the JSON-RPC body | HTTP `400` with JSON-RPC `-32020` |

`GET /v1/mcp` (the server-to-client SSE stream) and `DELETE /v1/mcp` (session teardown) are legacy-era only — both act on an `Mcp-Session-Id`. A `2026-07-28` client POSTs `subscriptions/listen` instead of opening a GET stream.

When Spice connects _to_ another MCP server (`from: mcp:<url>`, or a stdio server), it negotiates the same two eras automatically: it prefers `server/discover` at `2026-07-28` and falls back to `initialize` at `2025-03-26` when the peer is pre-2026. Liveness is probed with `ping`, and — because `2026-07-28` has no `ping` — a failed ping is retried as an uncached `tools/list` before the connection is treated as dead.

## Configuring MCP Tools

To configure MCP tools, define them in the `tools` section of your `spicepod.yaml` file. The `from` field specifies the transport mechanism, such as `mcp:npx` for stdio-based tools or an HTTP URL for Streamable HTTP-based tools.

### Example: Adding an MCP Tool (Stdio)

The following example demonstrates how to configure an MCP tool using `npx` to run a Google Maps MCP server:

```yaml
tools:
  - name: google_maps
    from: mcp:npx
    params:
      mcp_args: -y @modelcontextprotocol/server-google-maps
```

### Example: Connecting to an External MCP Server (Streamable HTTP)

This example shows how to connect to an external MCP server over Streamable HTTP:

```yaml
tools:
  - name: external_mcp_server
    from: mcp:http://example.com/v1/mcp
```

### Example: Connecting to an Auth-Enabled MCP Server (Streamable HTTP)

Streamable HTTP MCP tools support sending an `Authorization: Bearer` token via `mcp_auth_token`, or arbitrary HTTP headers via `mcp_headers`. Both parameters resolve [secret references](../secret-stores/) before the MCP client is constructed.

Sending a bearer token:

```yaml
tools:
  - name: remote_spice
    from: mcp:https://my-spice.example.com/v1/mcp
    params:
      # Sends: Authorization: Bearer <expanded secret value>
      mcp_auth_token: ${ secrets:MCP_SERVER_API_KEY }
```

Sending a custom header (e.g., API key):

```yaml
tools:
  - name: remote_spice
    from: mcp:https://my-spice.example.com/v1/mcp
    params:
      # Sends: X-API-Key: <expanded secret value>
      mcp_headers: 'X-API-Key: ${ secrets:MCP_SERVER_API_KEY }'
```

If both `mcp_auth_token` and a custom `Authorization` header in `mcp_headers` are set, `mcp_auth_token` wins and a warning is logged.

## Using MCP Tools with Models

Once configured, MCP tools can be assigned to models via the `tools` parameter. For example:

```yaml
models:
  - name: model_with_mcp
    from: openai:gpt-4o
    params:
      tools: google_maps
```

## Spice as an MCP Server

Spice can also act as an MCP server, exposing its tools over Streamable HTTP. This enables other Spice instances or external systems to connect and use the tools.

### Example: Connecting to Another Spice Instance via MCP

```yaml
tools:
  - name: spice_instance
    from: mcp:http://localhost:8090/v1/mcp
```

### Allowed Hosts

By default the `/v1/mcp` endpoint only accepts requests with a `Host` header matching `localhost`, `127.0.0.1`, or `::1` to prevent DNS rebinding attacks. To allow additional hosts, configure [`runtime.mcp.allowed_hosts`](../../reference/spicepod/runtime#runtimemcp):

```yaml
runtime:
  mcp:
    allowed_hosts:
      - localhost
      - my-host.internal:8090
```

Set `allowed_hosts: ["*"]` to disable host checking entirely.

## Configuration Options

### `from`

The `from` field specifies the transport mechanism for the MCP tool:

- **Streamable HTTP**: Use an HTTP URL pointing to the MCP endpoint (e.g., `http://localhost:8090/v1/mcp`).
- **Stdio**: Use commands like `mcp:npx` or `mcp:docker`. Additional arguments can be passed via `params.mcp_args`.

### `params`

The `params` field provides additional configuration for MCP tools.

For stdio-based tools, use `mcp_args` to specify command-line arguments:

```yaml
tools:
  - name: custom_tool
    from: mcp:npx
    params:
      mcp_args: -y @custom/tool
```

For Streamable HTTP tools, the following auth parameters are supported:

- `mcp_auth_token` — Sends `Authorization: Bearer <token>` on every request to the MCP server.
- `mcp_headers` — Sends additional HTTP headers using the same `Header: Value` comma- or semicolon-delimited format as the [HTTP data connector's `http_headers`](../data-connectors/https). Header values are marked sensitive.

Both parameters support [secret expansion](../secret-stores/). When `mcp_auth_token` is set, an `Authorization` header in `mcp_headers` is ignored and a warning is logged to avoid duplicate auth headers.

### `env`

For stdio-based MCP tools, environment variables can be set using the `env` field.

```yaml
tools:
  - name: tool_with_env
    from: mcp:docker
    env:
      API_KEY: your_api_key
```

### `description`

The `description` field provides a textual description of the tool. This description is passed to any language model that uses the tool.

```yaml
tools:
  - name: google_maps
    from: mcp:npx
    description: Provides geocoding and mapping capabilities.
```

For more details, see the [MCP Tools Reference](../../reference/spicepod/tools).
