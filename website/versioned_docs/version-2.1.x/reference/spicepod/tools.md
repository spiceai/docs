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
    from: mcp
    description: 'An MCP tool.'
    params:
      mcp_endpoint: http://localhost:3000/sse
```

### `name`

A unique identifier for this tool.

### `from`

Defines the source of the tool, or the specific built-in tool to customise. See [Available Tools](../../components/tools#available-tools) for a list of available tools.

### `description`

Optional. A textual description of the tool's function.

### `params`

Optional. A map of key-value pairs for additional parameters specific to the tool.

### `env`

Optional. A map of key-value pairs of arbitrary environment variables to set when running the tool. Only useable if the tool requires a subprocess to run (e.g. MCP over stdio) .

### `dependsOn`

Optional. A list of dependencies that must be available before this tool can be used.
