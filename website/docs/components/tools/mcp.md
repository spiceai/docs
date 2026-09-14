---
title: 'Model Context Protocol Tools'
sidebar_label: 'MCP Tools'
---

Spice integrates with tools and services using the [Model Context Protocol](https://modelcontextprotocol.io/) (MCP). MCP tools can be configured to run internally or connect to external servers over HTTP using the [Streamable HTTP](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http) transport.

## Overview

MCP helps extend the capabilities of the Spice runtime by enabling integration with external tools and services. This includes:

1. Running stdio-based MCP servers internally.
2. Connecting to external MCP servers over Streamable HTTP.

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

### Allowed Origins

Separately from the `Host` check, `/v1/mcp` validates the browser `Origin` header against [`runtime.cors.allowed_origins`](../../reference/spicepod/runtime#runtimecorsallowed_origins) — there is no MCP-specific origin setting.

| `runtime.cors.allowed_origins` | Effect on `/v1/mcp` |
| --- | --- |
| **Default** (`["*"]`) or an empty list | Expands to the localhost origins `http://localhost`, `http://127.0.0.1`, `http://[::1]` and their `https://` forms. Entries carry no port, so any port on those hosts matches. |
| **Explicit list** | Only the listed origins are accepted. A request whose `Origin` is not on the list receives `403 Forbidden`. |

A request that sends no `Origin` header at all is accepted in every case, which is why MCP clients such as Cursor and Claude Desktop are unaffected.

:::warning

`["*"]` does **not** accept every `Origin` on `/v1/mcp`. `*` is not a valid [RFC 6454](https://datatracker.ietf.org/doc/html/rfc6454) origin, so it expands to the localhost defaults above rather than disabling the check — unlike [`runtime.mcp.allowed_hosts`](../../reference/spicepod/runtime#runtimemcpallowed_hosts), where `["*"]` does disable the `Host` check. A remote browser-based MCP client must be given a concrete `runtime.cors.allowed_origins` list:

```yaml
runtime:
  cors:
    allowed_origins:
      - https://app.example.com
```

:::

This affects only MCP `Origin` validation. Browser CORS on the other HTTP endpoints is unchanged: `allowed_origins: ["*"]` remains allow-all there.

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
