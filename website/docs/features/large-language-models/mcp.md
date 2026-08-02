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

### Authentication

The `/v1/mcp` endpoint requires [`runtime.auth`](../../reference/spicepod/runtime#runtimeauth) to be configured. Without it, every request is rejected with `401 Unauthorized`, including requests from local clients:

```yaml
runtime:
  auth:
    api_key:
      enabled: true
      keys:
        - ${secrets:SPICE_API_KEY}
```

Clients then authenticate with an `X-API-KEY` header.

### Example: Connecting to another Spice instance via MCP

Because the remote endpoint requires authentication, pass credentials with `mcp_headers` — or `mcp_auth_token` to send `Authorization: Bearer`. See [Connecting to an Auth-Enabled MCP Server](../../components/tools/mcp#example-connecting-to-an-auth-enabled-mcp-server-streamable-http).

```yaml
tools:
  - name: spice_instance
    from: mcp:http://localhost:8090/v1/mcp
    params:
      mcp_headers: 'X-API-KEY: ${secrets:SPICE_API_KEY}'
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

# Required — /v1/mcp returns 401 to every request without runtime.auth
runtime:
  auth:
    api_key:
      enabled: true
      keys:
        - ${secrets:SPICE_API_KEY}

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
- GitHub MCP tools: `github__create_issue`, `github__list_pull_requests`, `github__search_code`, and more
- Jira MCP tools: `jira__jira_get_issue`, `jira__jira_search`, `jira__jira_create_issue`, and more

### Proxied tool names

A proxied tool is exposed as `<tool-name>__<upstream-tool-name>`, joined by a **double underscore**. The `tool-name` is the `name` given in the `tools` section, so renaming the tool renames every tool it proxies.

The separator is not a `/`, because MCP clients such as Claude and Cursor reject any tool name that does not match `^[a-zA-Z0-9_-]{1,64}$`.

Where an upstream server already namespaces its own tools, the prefix appears doubled — `mcp-atlassian` exposes `jira_get_issue`, so a tool named `jira` yields `jira__jira_get_issue`. This is expected.

### Jira credentials

The `jira` tool contributes **no tools at all** unless all three `JIRA_*` values resolve. `mcp-atlassian` starts successfully without them, registers nothing, and Spice logs no tool-loading error — the runtime reports healthy with Jira silently missing from the catalog. Check the startup log for `runtime_secrets` errors if `jira__*` tools do not appear.

`JIRA_URL` depends on which kind of API token is used, and a mismatch is the most common cause of an empty Jira catalog:

| Token type | `JIRA_URL` |
| --- | --- |
| Classic (unscoped) API token | `https://your-org.atlassian.net` |
| Scoped API token | `https://api.atlassian.com/ex/jira/<cloud-id>` |

Scoped tokens authenticate only against the `api.atlassian.com` gateway and return `401` against the site URL. Retrieve the cloud ID for a site from `https://your-org.atlassian.net/_edge/tenant_info`, which requires no authentication. Both token types use `JIRA_USERNAME` (the account email address) with HTTP basic auth.

### Connecting a client

Connect Claude Code to this gateway with a single command, using a key from `runtime.auth`:

```bash
claude mcp add --transport http spice http://localhost:8090/v1/mcp --header "X-API-KEY: <key>"
```

:::warning Large tool catalogs

The two servers above expose close to 100 tools between them, which degrades tool selection in most MCP clients. Restrict each server to the tools actually needed — for `mcp-atlassian`, set `TOOLSETS` in its `env` block.

:::

See the [mcp-server cookbook](https://github.com/spiceai/cookbook/tree/trunk/mcp-server) for a complete runnable example.

## Troubleshooting

### A tool is missing from the catalog

A failing MCP server does not stop the runtime. Spice logs a warning, retries the connection in the background, and reports healthy — the tool is simply absent from `tools/list`. Verify the runtime log at startup:

```bash
grep "Unable to load tool" <log>
```

A server that starts but authenticates with empty or invalid credentials is harder to spot: it registers zero tools without producing that warning. Check for `runtime_secrets` errors, which indicate a `${secrets:...}` reference that did not resolve.

### Every request returns `401`

`/v1/mcp` requires [`runtime.auth`](#authentication). The response body names the missing configuration:

```json
{ "message": "MCP endpoint (/v1/mcp) requires `runtime.auth` to be configured. ..." }
```

### Every request returns `403`

The `Host` header is not in [`runtime.mcp.allowed_hosts`](#allowed-hosts). This is the DNS-rebinding guard, and it applies to any host other than `localhost`, `127.0.0.1`, or `::1`.

### Listing the catalog directly

To confirm what a client actually sees, call `tools/list` over the Streamable HTTP transport. The `Accept` header must offer both content types, and the session ID returned by `initialize` is required on subsequent requests:

```bash
curl -sS -D headers.txt -X POST http://localhost:8090/v1/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'X-API-KEY: <key>' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"1"}}}'

SID=$(grep -i mcp-session-id headers.txt | tr -d '\r' | awk '{print $2}')

curl -sS -X POST http://localhost:8090/v1/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'X-API-KEY: <key>' \
  -H "Mcp-Session-Id: $SID" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

Responses are returned as SSE frames prefixed with `data:`.
