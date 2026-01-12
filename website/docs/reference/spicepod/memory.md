---
title: 'Memory'
sidebar_label: 'Memory'
description: 'Memory configuration YAML reference'
---

The `memory` section configures the memory engine used by the `store_memory` and `load_memory` tools. Memory persistence enables LLMs to store and retrieve information across tool calls, maintaining context from previous interactions.

## `memory`

Optional. Configures the memory backend for the built-in memory tools.

```yaml
memory:
  engine: builtin
```

### `memory.engine`

The memory engine to use. Supported values:

- `builtin` (default): In-memory storage using a configured memory dataset. Requires a dataset with `from: memory:store` to be defined.
- `mem0`: External memory service via the [Mem0 Platform](https://mem0.ai) API.

### `memory.params`

Engine-specific parameters. Parameters are prefixed with the engine name (e.g., `mem0_api_key` for the Mem0 engine).

## Builtin Engine

The builtin engine stores memories in a DataFusion table configured with the memory data connector. This engine requires no external dependencies but memories are not persisted across runtime restarts unless acceleration snapshots are enabled.

```yaml
datasets:
  - from: memory:store
    name: llm_memory
    access: read_write

memory:
  engine: builtin
```

No additional parameters are required for the builtin engine.

## Mem0 Engine

The Mem0 engine uses the [Mem0 Platform](https://mem0.ai) for external memory storage with semantic search capabilities.

```yaml
memory:
  engine: mem0
  params:
    mem0_api_key: ${secrets:MEM0_API_KEY}
    mem0_user_id: default-user
```

### Mem0 Parameters

| Parameter         | Type   | Required | Default               | Description                                                   |
| ----------------- | ------ | -------- | --------------------- | ------------------------------------------------------------- |
| `mem0_api_key`    | secret | Yes      | -                     | Mem0 Platform API key for authentication                      |
| `mem0_user_id`    | string | No       | `default-user`        | User identifier for memory scoping                            |
| `mem0_agent_id`   | string | No       | -                     | Agent identifier for memory scoping                           |
| `mem0_app_id`     | string | No       | -                     | Application identifier for memory scoping                     |
| `mem0_run_id`     | string | No       | -                     | Run identifier for memory scoping                             |
| `mem0_org_id`     | string | No       | -                     | Organization identifier                                       |
| `mem0_project_id` | string | No       | -                     | Project identifier                                            |
| `mem0_base_url`   | string | No       | `https://api.mem0.ai` | Custom API base URL for self-hosted or enterprise deployments |

### Full Mem0 Example

```yaml
memory:
  engine: mem0
  params:
    mem0_api_key: ${secrets:MEM0_API_KEY}
    mem0_org_id: org_123456
    mem0_project_id: proj_789
    mem0_user_id: ${context:user_id}
    mem0_agent_id: assistant_v1
```

## Using Memory Tools

Once memory is configured, enable the `memory` tool group for models:

```yaml
memory:
  engine: mem0
  params:
    mem0_api_key: ${secrets:MEM0_API_KEY}

models:
  - name: assistant
    from: openai:gpt-4o
    params:
      tools: memory, sql
```

The memory tools available are:

- `memory:store` - Store information from LLM interactions for future reference
- `memory:load` - Retrieve stored memories from a specified time period

For more information, see [Language Model Memory](/docs/features/large-language-models/memory).
