---
title: 'Language Model Memory'
sidebar_label: 'Memory'
description: 'Learn how to provide LLMs with memory'
sidebar_position: 3
pagination_prev: null
pagination_next: null
tags:
  - models
  - memory
  - tools
  - persistence
---

Spice provides memory persistence tools that help language models store and retrieve information across conversations. The `memory` tool group provides `store_memory` and `load_memory` tools that can be backed by different storage engines.

## Configuring Memory

Memory is configured in the `memory` section of `spicepod.yaml`. The configuration specifies which engine to use and engine-specific parameters.

### Builtin Engine (Default)

The builtin engine stores memories in an in-memory dataset within the Spice runtime:

```yaml
datasets:
  - from: memory:store
    name: llm_memory
    access: read_write

memory:
  engine: builtin

models:
  - name: memory-enabled-model
    from: openai:gpt-4o
    params:
      tools: memory
```

### Mem0 Engine

The [Mem0](https://mem0.ai) engine provides managed cloud storage with semantic search:

```yaml
memory:
  engine: mem0
  params:
    mem0_api_key: ${secrets:MEM0_API_KEY}
    mem0_user_id: ${context:user_id}

models:
  - name: mem0-enabled-model
    from: openai:gpt-4o
    params:
      tools: memory
```

For detailed configuration options, see the [Memory Reference](/docs/reference/spicepod/memory.md).

## Mem0 Tool Connector

In addition to the `memory` spicepod configuration, Mem0 can be configured as a standalone tool connector that provides additional capabilities like `add_memory`, `search_memory`, `get_memories`, and `delete_memory` tools.

```yaml
tools:
  - from: mem0:memory
    name: agent_memory
    description: Memory tools for the AI assistant
    params:
      mem0_api_key: ${secrets:MEM0_API_KEY}
      mem0_user_id: ${context:user_id}
      mem0_graph_memory: enabled

models:
  - name: mem0-model
    from: openai:gpt-4o
    params:
      tools: agent_memory
```

This approach provides graph memory for entity relationship extraction. For full configuration options, see [Mem0 Memory Tool](/docs/components/tools/mem0).

## Choosing a Memory Backend

| Feature             | Builtin                       | Mem0 (via memory config)      | Mem0 (via tool connector)                                      |
| ------------------- | ----------------------------- | ----------------------------- | -------------------------------------------------------------- |
| Configuration       | `memory.engine`               | `memory.engine`               | `tools` section                                                |
| Persistence         | In-memory (runtime)           | Managed cloud                 | Managed cloud                                                  |
| Semantic Search     | Via embeddings config         | Built-in                      | Built-in                                                       |
| User/Agent Scoping  | Manual                        | Built-in                      | Built-in                                                       |
| Graph Memory        | No                            | No                            | Yes                                                            |
| Available Tools     | `store_memory`, `load_memory` | `store_memory`, `load_memory` | `add_memory`, `search_memory`, `get_memories`, `delete_memory` |
| External Dependency | None                          | Mem0 API                      | Mem0 API                                                       |

For more information on tools, see [Tool components](/docs/components/tools).
