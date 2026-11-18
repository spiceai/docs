---
title: 'Tools (Function Calling)'
sidebar_label: 'Tools'
description: 'Tools YAML reference'
---

Tools define functions that can be invoked within the Spice runtime, either directly or by a [language model](../../features/large-language-models) (LLMs). These tools provide access to different functionalities and can be customized in the `tools` section of `spicepod.yaml`.

## `tools`

The `tools` section in your configuration specifies one or more tools available for use in the runtime.

Example:

```yaml
tools:
  - name: my_mcp_tool
    from: mcp:http://localhost:8090/v1/mcp
    description: 'An MCP tool.'
```

### `name`

A unique identifier for this tool.

### `from`

Defines the source of the tool, or the specific built-in tool to customise. See [Available Tools](../../components/tools#available-tools) for a list of available tools.

For [MCP tools](../../components/tools/mcp), the target is part of the `from` value itself, in the form `mcp:<target>`:

- `mcp:<url>` connects to an MCP server over Streamable HTTP, e.g. `mcp:http://localhost:8090/v1/mcp`.
- `mcp:<command>` runs a stdio-based MCP server as a subprocess, e.g. `mcp:npx`.

A bare `from: mcp` (without a `:<target>` suffix) is rejected when the spicepod is loaded.

### `description`

Optional. A textual description of the tool's function.

### `params`

Optional. A map of key-value pairs for additional parameters specific to the tool. For MCP tools these are `mcp_args` (stdio), and `mcp_auth_token` / `mcp_headers` (Streamable HTTP) — see [MCP Tools](../../components/tools/mcp#params). The MCP server address is set via `from`, not via `params`.

### `env`

Optional. A map of key-value pairs of arbitrary environment variables to set when running the tool. Only useable if the tool requires a subprocess to run (e.g. MCP over stdio) .

### `as_sql`

Optional. Whether the tool is also registered as a SQL scalar function that calls the tool once per row. Defaults to `false`. Requires [`signature`](#signature) and [`runtime.functions.enabled: true`](./runtime.md#runtimefunctions). A tool registered this way also appears in the [tool registry](../../features/tool-registry/index.md).

Only a single tool can be registered. A `tools` entry that provides several tools, such as an [MCP server](../../components/tools/mcp), is not registered as a SQL function. When registration is not possible, because `runtime.functions.enabled` is not set, `signature` is missing, the entry is a tool catalog, or the signature uses an unsupported type, Spice logs a warning and loads the tool without a SQL function.

### `signature`

Optional. The typed arguments and return type of the SQL function that `as_sql` registers, in the same form as a [function's `signature`](./functions.md#signature). A tool's JSON Schema does not map to a single SQL signature, so `as_sql` needs the types set here. Ignored unless `as_sql` is `true`.

A tool's arguments and return value pass through JSON, so a tool signature accepts only these types: `int8`, `int16`, `int32`, `int64`, and `int`, which all become `Int64`; `float32`, `float64`, `float`, and `double`, which all become `Float64`; `utf8` and `string`; and `boolean` and `bool`. Other types that a function signature accepts, such as lists, decimals, and timestamps, are not supported for tools.

### `dependsOn`

Optional. A list of dependencies that must be available before this tool can be used.
