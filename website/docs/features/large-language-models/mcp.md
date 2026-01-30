---
title: 'Model Context Protocol (MCP)'
sidebar_label: 'MCP'
description: 'Learn how to use the Model Context Protocol (MCP) with Spice.'
sidebar_position: 2
pagination_prev: null
pagination_next: null
tags:
  - models
  - tools
  - mcp
---

The Model Context Protocol (MCP) helps integrate external tools and services into the Spice runtime. MCP tools can be run internally or connected over HTTP using the Server-Sent Events (SSE) protocol.

![Spice.ai Open Source Model-Context-Protocol (MCP) support](/img/features/mcp.png)

## Overview

MCP enables Spice to:

1. Run stdio-based MCP servers internally.
2. Connect to external MCP servers over SSE.

This flexibility helps extend the capabilities of language models by providing access to external tools and services.

## Configuring MCP Tools

To configure MCP tools, define them in the `tools` section of your `spicepod.yaml` file. The `from` field specifies the transport mechanism (e.g., `mcp:npx` for stdio or an HTTP URL for SSE).

### Example: Adding an MCP Tool

```yaml
tools:
  - name: google_maps
    from: mcp:npx
    params:
      mcp_args: -y @modelcontextprotocol/server-google-maps
```

### Example: Connecting to an External MCP Server

```yaml
tools:
  - name: external_mcp_server
    from: mcp:http://example.com/v1/mcp/sse
```

## Using MCP Tools with Models

Once configured, MCP tools can be assigned to models via the `tools` parameter.

```yaml
models:
  - name: model_with_mcp
    from: openai:gpt-4o
    params:
      tools: google_maps
```

## Spice as an MCP Server

Spice can also act as an MCP server, exposing its tools over SSE. This enables other Spice instances or external systems to connect and use the tools.

### Example: Connecting to another Spice instance via MCP

```yaml
tools:
  - name: spice_instance
    from: mcp:http://localhost:8090/v1/mcp/sse
```

## Additional Configuration Options

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

For more details, see the [MCP Tools Reference](../../components/tools/mcp.md).
