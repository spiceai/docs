---
title: 'Model Context Protocol Tools'
sidebar_label: 'MCP Tools'
---

Spice integrates with tools and services using the [Model Context Protocol](https://modelcontextprotocol.io/) (MCP). MCP tools can be configured to run internally or connect to external servers over HTTP using the Server-Sent Events (SSE) protocol.

## Overview

MCP helps extend the capabilities of the Spice runtime by enabling integration with external tools and services. This includes:

1. Running stdio-based MCP servers internally.
2. Connecting to external MCP servers over SSE.

## Configuring MCP Tools

To configure MCP tools, define them in the `tools` section of your `spicepod.yaml` file. The `from` field specifies the transport mechanism, such as `mcp:npx` for stdio-based tools or an HTTP URL for SSE-based tools.

### Example: Adding an MCP Tool (Stdio)

The following example demonstrates how to configure an MCP tool using `npx` to run a Google Maps MCP server:

```yaml
tools:
  - name: google_maps
    from: mcp:npx
    params:
      mcp_args: -y @modelcontextprotocol/server-google-maps
```

### Example: Connecting to an External MCP Server (SSE)

This example shows how to connect to an external MCP server over SSE:

```yaml
tools:
  - name: external_mcp_server
    from: mcp:http://example.com/v1/mcp/sse
```

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

Spice can also act as an MCP server, exposing its tools over SSE. This enables other Spice instances or external systems to connect and use the tools.

### Example: Connecting to Another Spice Instance via MCP

```yaml
tools:
  - name: spice_instance
    from: mcp:http://localhost:8090/v1/mcp/sse
```

## Configuration Options

### `from`

The `from` field specifies the transport mechanism for the MCP tool:

- **SSE**: Use an HTTP URL ending with `/sse` (e.g., `http://localhost:8090/v1/mcp/sse`).
- **Stdio**: Use commands like `mcp:npx` or `mcp:docker`. Additional arguments can be passed via `params.mcp_args`.

### `params`

The `params` field provides additional configuration for MCP tools. For stdio-based tools, use `mcp_args` to specify command-line arguments.

```yaml
tools:
  - name: custom_tool
    from: mcp:npx
    params:
      mcp_args: -y @custom/tool
```

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

For more details, see the [MCP Tools Reference](../../reference/spicepod/tools.md).
