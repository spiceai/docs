---
title: 'Model Context Protocol Tools'
sidebar_label: 'MCP tools'
---

Spice can find and use tools from [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) servers. This includes both:
1. Running stdio-based MCP servers internally
2. Connecting to MCP servers over SSE protocol.

## Usage
```yaml
tools:
  - name: google_maps
    from: mcp:npx
    params:
      mcp_args: -y @modelcontextprotocol/server-google-maps
```

## Spice as an MCP server
The tools available, or loaded into, Spice can be connected to over the MCP protocol. Spice exposes the necessary SSE endpoints. For example, connecting to the tools of another Spice instance can be configured like any other MCP server.
```yaml
tools:
  - name: another_spice_instance
    from: mcp:http://localhost:8090/v1/mcp/sse
```

# Configuration
## `from`

The `from` field is used to specify the tool to use. The value to use is based on the transport mechanism:
 - SSE: Specify the HTTP URL where to connect over, including the `/sse` path, e.g. `http://localhost::8090/v1/mcp/sse`.
 - stdio: Specify the command to run to initialise the MCP server. E.g. `from: mcp:docker`, `from: mcp:npx`. Additional arguments to the command are specified in [params](#params) (specifically `params.mcp_args`).

## `name`

The `name` field is used to specify the name of tool group. This name is used:
 - To reference the tool in the model's `params.tools` field
 - To make HTTP requests to the tool via the [API](/docs/api/HTTP/post), i.e. `v1/tools/{name}/{tool_name}`. where `tool_name` is the name of the tool from within the MCP server. e.g `v1/tools/google_maps/maps_geocode`.
 - Provided to any language model that uses the tool.

## `description`

The `description` field is used to provide a description of the tool. This description is provided to any language model that uses the tool.

## `params`

The following parameters are supported for configuring the connection to the MCP server:

| Parameter Name | Definition |
|---------------|------------|
| `mcp_args`    | Only for stdio MCP servers. Specify the additional arguments to instantiate the MCP server. e.g. `-y @modelcontextprotocol/server-google-maps` (for `from: mcp:npx`). |
