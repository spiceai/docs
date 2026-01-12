---
title: 'Tools (Function Calling)'
sidebar_label: 'Tools'
description: 'Tools YAML reference'
---

Tools define functions that can be invoked within the Spice runtime, either directly or by a [language model](/docs/features/large-language-models) (LLMs). These tools provide access to different functionalities and can be customized in the `tools` section of `spicepod.yaml`.

## `tools`

The `tools` section in your configuration specifies one or more tools available for use in the runtime.

Example:

```yaml
tools:
  - name: arpanet
    from: websearch
    description: 'Search the web for information.'
    params:
      engine: perplexity
      perplexity_auth_token: ${ secrets:SPICE_PERPLEXITY_AUTH_TOKEN }
```

### `name`

A unique identifier for this tool.

### `from`

Defines the source of the tool, or the specific built-in tool to customise. See [Available Tools](/docs/components/tools#available-tools) for a list of available tools.

### `description`

Optional. A textual description of the tool's function.

### `params`

Optional. A map of key-value pairs for additional parameters specific to the tool.

### `env`

Optional. A map of key-value pairs of arbitrary environment variables to set when running the tool. Only useable if the tool requires a subprocess to run (e.g. MCP over stdio) .

### `dependsOn`

Optional. A list of dependencies that must be available before this tool can be used.

## Mem0 Tool Parameters

When using `from: mem0:memory`, the following parameters are available:

| Parameter           | Type   | Required | Default               | Description                                                                             |
| ------------------- | ------ | -------- | --------------------- | --------------------------------------------------------------------------------------- |
| `mem0_api_key`      | secret | Yes      | -                     | Mem0 Platform API key for authentication                                                |
| `mem0_org_id`       | string | No       | -                     | Organization ID for scoping memories                                                    |
| `mem0_project_id`   | string | No       | -                     | Project ID for scoping memories within an organization                                  |
| `mem0_user_id`      | string | No       | -                     | Default user ID to associate with memories. Can be overridden per-call.                 |
| `mem0_agent_id`     | string | No       | -                     | Default agent ID to associate with memories. Useful for multi-agent systems.            |
| `mem0_base_url`     | string | No       | `https://api.mem0.ai` | Custom API endpoint for self-hosted or enterprise deployments                           |
| `mem0_graph_memory` | string | No       | `disabled`            | Enable graph memory for entity/relationship extraction. Values: `enabled` or `disabled` |

### Example

```yaml
tools:
  - from: mem0:memory
    name: agent_memory
    description: Memory tools for the AI assistant
    params:
      mem0_api_key: ${secrets:MEM0_API_KEY}
      mem0_user_id: ${context:user_id}
      mem0_graph_memory: enabled
```

For more details, see [Mem0 Memory Tool](/docs/components/tools/mem0).
