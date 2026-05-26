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

The Model Context Protocol (MCP) helps integrate external tools and services into the Spice runtime. MCP tools can be run internally or connected over HTTP using the [Streamable HTTP](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http) transport.

![Spice.ai Open Source Model-Context-Protocol (MCP) support](/img/features/mcp.png)

## Overview

MCP enables Spice to:

1. Run stdio-based MCP servers internally.
2. Connect to external MCP servers over Streamable HTTP.

This flexibility helps extend the capabilities of language models by providing access to external tools and services.

## Configuring MCP Tools

To configure MCP tools, define them in the `tools` section of your `spicepod.yaml` file. The `from` field specifies the transport mechanism (e.g., `mcp:npx` for stdio or an HTTP URL for Streamable HTTP).

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
    from: mcp:http://example.com/v1/mcp
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

Spice can also act as an MCP server, exposing its tools over Streamable HTTP. This enables other Spice instances or external systems to connect and use the tools.

### Example: Connecting to another Spice instance via MCP

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

## Additional Configuration Options

### `from`

The `from` field specifies the transport mechanism for the MCP tool:

- **Streamable HTTP**: Use an HTTP URL pointing to the MCP endpoint (e.g., `http://localhost:8090/v1/mcp`).
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

For more details, see the [MCP Tools Reference](../../components/tools/mcp).

## Example: Spice as an MCP gateway for GitHub and Jira

Spice can act as a unified MCP gateway, proxying multiple external MCP servers alongside its own built-in tools. Clients connect to a single `/v1/mcp` endpoint and see one combined tool catalog.

```yaml
version: v1
kind: Spicepod
name: mcp-gateway

# GitHub issues and PRs accelerated in-memory for fast SQL queries
datasets:
  - from: github:github.com/your-org/your-repo/issues
    name: github_issues
    description: GitHub issues — filterable by state, label, assignee, or milestone
    params:
      github_token: ${secrets:GITHUB_PERSONAL_ACCESS_TOKEN}
      github_query_mode: search
    time_column: updated_at
    acceleration:
      enabled: true
      refresh_check_interval: 5m

  - from: github:github.com/your-org/your-repo/pulls
    name: github_pulls
    description: GitHub pull requests — open, merged, or closed
    params:
      github_token: ${secrets:GITHUB_PERSONAL_ACCESS_TOKEN}
      github_query_mode: search
    time_column: updated_at
    acceleration:
      enabled: true
      refresh_check_interval: 5m

# MCP servers proxied through Spice's /v1/mcp endpoint
tools:
  - name: github
    from: mcp:npx
    description: GitHub tools — create issues, review PRs, search code
    params:
      mcp_args: -y @modelcontextprotocol/server-github
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: ${secrets:GITHUB_PERSONAL_ACCESS_TOKEN}

  - name: jira
    from: mcp:uvx
    description: Jira and Confluence tools — query tickets, update status, search projects
    params:
      mcp_args: mcp-atlassian
    env:
      JIRA_URL: ${secrets:JIRA_URL}
      JIRA_USERNAME: ${secrets:JIRA_USERNAME}
      JIRA_API_TOKEN: ${secrets:JIRA_API_TOKEN}
```

With this configuration, clients connecting to `/v1/mcp` see a single catalog that includes:

- Spice built-in tools: `sql`, `list_datasets`, `table_schema`, `search`, and more
- GitHub MCP tools: `github/create_issue`, `github/list_pull_requests`, `github/search_code`, and more
- Jira MCP tools: `jira/get_issue`, `jira/search_issues`, `jira/create_issue`, and more

Connect Claude Code to this gateway with a single command:

```bash
claude mcp add --transport http spice http://localhost:8090/v1/mcp --header "X-API-KEY: <key>"
```

See the [mcp-server cookbook](https://github.com/spiceai/cookbook/tree/trunk/mcp-server) for a complete runnable example.
