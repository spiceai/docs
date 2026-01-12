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

| Parameter           | Type   | Required | Default               | Description                                                                             |
| ------------------- | ------ | -------- | --------------------- | --------------------------------------------------------------------------------------- |
| `mem0_api_key`      | secret | Yes      | -                     | Mem0 Platform API key for authentication                                                |
| `mem0_user_id`      | string | No       | `default-user`        | User identifier for memory scoping                                                      |
| `mem0_agent_id`     | string | No       | -                     | Agent identifier for memory scoping                                                     |
| `mem0_app_id`       | string | No       | -                     | Application identifier for memory scoping                                               |
| `mem0_run_id`       | string | No       | -                     | Run identifier for memory scoping                                                       |
| `mem0_org_id`       | string | No       | -                     | Organization identifier                                                                 |
| `mem0_project_id`   | string | No       | -                     | Project identifier                                                                      |
| `mem0_base_url`     | string | No       | `https://api.mem0.ai` | Custom API base URL for self-hosted or enterprise deployments                           |
| `mem0_graph_memory` | string | No       | `disabled`            | Enable graph memory for entity/relationship extraction. Values: `enabled` or `disabled` |

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

## Error Handling and Retry Logic

The Mem0 client includes automatic retry logic:

| Error Type    | HTTP Codes | Backoff Strategy       | Max Retries |
| ------------- | ---------- | ---------------------- | ----------- |
| Rate Limit    | 429, 408   | Exponential (up to 5m) | 3           |
| Server Error  | 5xx        | Fibonacci              | 3           |
| Network Error | -          | Fibonacci              | 3           |

This ensures reliable operation even under rate limiting or temporary service issues.

## Best Practices

1. **Use secrets for API keys**: Never hardcode API keys in your spicepod.yaml

   ```yaml
   params:
     mem0_api_key: ${secrets:MEM0_API_KEY}  # Good
     mem0_api_key: sk-xxx                    # Bad - exposed in version control
   ```

2. **Scope memories appropriately**: Use `user_id` and `agent_id` to organize and isolate memories

3. **Enable graph memory selectively**: Graph memory adds 2-3 extra LLM calls per memory add operation. Enable it only when relationship tracking is needed.

4. **Use meaningful user IDs**: Use consistent, meaningful user IDs (e.g., email, UUID) for proper memory isolation

## Troubleshooting

### "Missing required parameter: mem0_api_key"

Ensure the `mem0_api_key` parameter is set and the secret is properly configured:

```yaml
secrets:
  - from: env
    name: env

memory:
  engine: mem0
  params:
    mem0_api_key: ${secrets:MEM0_API_KEY}
```

And set the environment variable:

```bash
export MEM0_API_KEY="your-api-key"
```

### "mem0 feature is not enabled"

The Mem0 connector requires the `mem0` feature to be enabled at compile time. If using a pre-built binary, ensure you're using a version with Mem0 support.

### Memories not appearing immediately

Mem0 uses asynchronous processing by default. Memories may take a few seconds to become searchable after being added. The memory tools use synchronous mode to ensure immediate availability.

### Rate limit errors

The client automatically retries on rate limit errors with exponential backoff. If you consistently hit rate limits, consider:

- Reducing the frequency of memory operations
- Upgrading your Mem0 plan for higher limits
- Batching multiple memories into single operations
