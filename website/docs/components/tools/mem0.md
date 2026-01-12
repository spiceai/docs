---
title: 'Mem0 Memory Tool'
sidebar_label: 'Mem0'
description: 'Enable LLM agents to store, search, and retrieve memories using the Mem0 Platform'
---

The Mem0 connector enables LLM agents to store, search, and retrieve memories using the [Mem0 Platform](https://mem0.ai). This provides AI agents with persistent context across conversations and sessions.

## Features

- **Memory Storage**: Store observations, facts, and conversation context as searchable memories
- **Semantic Search**: Find relevant memories using natural language queries
- **User/Agent Scoping**: Scope memories to specific users or agents for isolation
- **Graph Memory**: Extract and query relationships between entities (people, places, organizations)
- **Metadata Support**: Attach custom metadata to memories for filtering and organization
- **Automatic Retry**: Built-in retry logic with adaptive backoff for rate limits and errors

## Prerequisites

1. Sign up for a [Mem0 Platform account](https://app.mem0.ai/)
2. Create an API key from the [dashboard settings](https://app.mem0.ai/dashboard/settings?tab=api-keys)
3. Optionally, create an Organization and Project for scoping

## Configuration

### Basic Usage

```yaml
tools:
  - from: mem0:memory
    name: agent_memory
    description: Memory tools for the AI assistant
    params:
      mem0_api_key: ${secrets:MEM0_API_KEY}
```

### With User Scoping

```yaml
tools:
  - from: mem0:memory
    name: user_memory
    description: User-specific memory tools
    params:
      mem0_api_key: ${secrets:MEM0_API_KEY}
      mem0_user_id: ${context:user_id}
```

### With Graph Memory Enabled

```yaml
tools:
  - from: mem0:memory
    name: relationship_memory
    description: Memory tools with entity relationship extraction
    params:
      mem0_api_key: ${secrets:MEM0_API_KEY}
      mem0_user_id: default-user
      mem0_graph_memory: enabled
```

### Full Configuration

```yaml
tools:
  - from: mem0:memory
    name: enterprise_memory
    description: Enterprise memory with full configuration
    params:
      mem0_api_key: ${secrets:MEM0_API_KEY}
      mem0_org_id: org_123456
      mem0_project_id: proj_789
      mem0_user_id: user_default
      mem0_agent_id: assistant_v1
      mem0_graph_memory: enabled
```

## Parameters

| Parameter           | Type   | Required | Default               | Description                                                                             |
| ------------------- | ------ | -------- | --------------------- | --------------------------------------------------------------------------------------- |
| `mem0_api_key`      | secret | Yes      | -                     | Mem0 Platform API key for authentication                                                |
| `mem0_org_id`       | string | No       | -                     | Organization ID for scoping memories                                                    |
| `mem0_project_id`   | string | No       | -                     | Project ID for scoping memories within an organization                                  |
| `mem0_user_id`      | string | No       | -                     | Default user ID to associate with memories. Can be overridden per-call.                 |
| `mem0_agent_id`     | string | No       | -                     | Default agent ID to associate with memories. Useful for multi-agent systems.            |
| `mem0_base_url`     | string | No       | `https://api.mem0.ai` | Custom API endpoint for self-hosted or enterprise deployments                           |
| `mem0_graph_memory` | string | No       | `disabled`            | Enable graph memory for entity/relationship extraction. Values: `enabled` or `disabled` |

## Available Tools

The Mem0 connector provides four LLM-callable tools:

### `add_memory`

Store a new memory or observation.

| Parameter  | Type   | Required | Description                                  |
| ---------- | ------ | -------- | -------------------------------------------- |
| `content`  | string | Yes      | The content to store as a memory             |
| `role`     | string | No       | Message role (default: "user")               |
| `user_id`  | string | No       | Override the default user ID for this memory |
| `metadata` | object | No       | Custom metadata to attach to the memory      |

**Example LLM call:**

```json
{
  "content": "The user prefers dark mode and uses VS Code as their editor",
  "metadata": { "category": "preferences" }
}
```

### `search_memory`

Search memories using a natural language query.

| Parameter   | Type   | Required | Description                             |
| ----------- | ------ | -------- | --------------------------------------- |
| `query`     | string | Yes      | Natural language search query           |
| `user_id`   | string | No       | Filter memories by user ID              |
| `top_k`     | number | No       | Maximum number of results (default: 10) |
| `threshold` | number | No       | Minimum similarity score (0.0-1.0)      |

**Example LLM call:**

```json
{
  "query": "What are the user's editor preferences?",
  "top_k": 5
}
```

### `get_memories`

Retrieve all memories for a user with optional pagination.

| Parameter   | Type   | Required | Description                             |
| ----------- | ------ | -------- | --------------------------------------- |
| `user_id`   | string | No       | Filter memories by user ID              |
| `page`      | number | No       | Page number for pagination (default: 1) |
| `page_size` | number | No       | Results per page (default: 100)         |

**Example LLM call:**

```json
{
  "user_id": "user_123",
  "page": 1,
  "page_size": 20
}
```

### `delete_memory`

Delete a specific memory by ID.

| Parameter   | Type   | Required | Description                    |
| ----------- | ------ | -------- | ------------------------------ |
| `memory_id` | string | Yes      | The ID of the memory to delete |

**Example LLM call:**

```json
{
  "memory_id": "mem_01JF8ZS4Y0R0SPM13R5R6H32CJ"
}
```

## Graph Memory

When `mem0_graph_memory: enabled` is set, Mem0 automatically extracts entities and relationships from stored memories.

### How It Works

1. **Entity Extraction**: When memories are added, Mem0's extraction LLM identifies people, places, organizations, and other entities
2. **Relationship Mapping**: Connections between entities are stored as graph edges (e.g., "Alice works_at Acme Corp")
3. **Graph-Aware Search**: Search results include related entities from the knowledge graph

### Example Usage

```yaml
tools:
  - from: mem0:memory
    name: relationship_tracker
    params:
      mem0_api_key: ${secrets:MEM0_API_KEY}
      mem0_graph_memory: enabled
```

When the LLM stores: "Alice is the CTO at TechCorp and met Bob at the AI conference in San Francisco"

Mem0 extracts:

- **Entities**: Alice (Person), TechCorp (Organization), Bob (Person), AI conference (Event), San Francisco (Location)
- **Relationships**: Alice → CTO_of → TechCorp, Alice → met → Bob, AI conference → located_in → San Francisco

### Graph Memory Response

When graph memory is enabled, search and get responses may include a `relations` field:

```json
{
  "id": "mem_xyz",
  "memory": "Alice works at TechCorp as CTO",
  "relations": [
    {
      "source": "Alice",
      "relation": "works_at",
      "target": "TechCorp"
    },
    {
      "source": "Alice",
      "relation": "has_role",
      "target": "CTO"
    }
  ]
}
```

## Error Handling

The Mem0 connector includes robust error handling with automatic retries.

### Automatic Retries

| Error Type    | HTTP Codes | Backoff Strategy    | Max Retries |
| ------------- | ---------- | ------------------- | ----------- |
| Rate Limit    | 429, 408   | Exponential (5 min) | 3           |
| Server Error  | 5xx        | Fibonacci           | 3           |
| Network Error | -          | Fibonacci           | 3           |

### Error Messages

Errors include actionable information:

```text
Mem0 API rate limit exceeded after 3 retries.
Consider reducing request frequency.
See: https://docs.mem0.ai/platform/quickstart
```

## Use Cases

### Personal AI Assistant

Store user preferences and conversation history:

```yaml
tools:
  - from: mem0:memory
    name: personal_assistant_memory
    params:
      mem0_api_key: ${secrets:MEM0_API_KEY}
      mem0_user_id: ${context:user_id}
```

### Multi-Agent System

Isolate memories by agent while sharing user context:

```yaml
tools:
  - from: mem0:memory
    name: research_agent_memory
    params:
      mem0_api_key: ${secrets:MEM0_API_KEY}
      mem0_user_id: ${context:user_id}
      mem0_agent_id: research_agent

  - from: mem0:memory
    name: coding_agent_memory
    params:
      mem0_api_key: ${secrets:MEM0_API_KEY}
      mem0_user_id: ${context:user_id}
      mem0_agent_id: coding_agent
```

### Customer Support Bot

Track customer interactions and preferences:

```yaml
tools:
  - from: mem0:memory
    name: support_memory
    params:
      mem0_api_key: ${secrets:MEM0_API_KEY}
      mem0_org_id: ${env:ORG_ID}
      mem0_project_id: support_bot
      mem0_user_id: ${context:customer_id}
      mem0_graph_memory: enabled
```

### Knowledge Base Agent

Build a searchable knowledge base with relationship tracking:

```yaml
tools:
  - from: mem0:memory
    name: knowledge_base
    params:
      mem0_api_key: ${secrets:MEM0_API_KEY}
      mem0_graph_memory: enabled
```

## Best Practices

1. **Scope Memories Appropriately**: Use `user_id` and `agent_id` to prevent memory pollution between users or agents

2. **Use Metadata**: Attach metadata for better organization and filtering:

   ```json
   { "category": "preferences", "source": "onboarding" }
   ```

3. **Enable Graph Memory Selectively**: Graph memory adds processing overhead. Enable it when relationship tracking is valuable.

4. **Handle Rate Limits**: The connector automatically retries, but design your application to handle rate limit scenarios gracefully

5. **Clean Up Old Memories**: Periodically use `delete_memory` to remove outdated or irrelevant memories

## Limitations

- Memories are processed asynchronously by default; there may be a brief delay before new memories appear in search results
- Graph memory extraction quality depends on the clarity of the stored content
- API rate limits apply based on your Mem0 plan
- Memory content should be UTF-8 text

## Troubleshooting

### Memories Not Found After Adding

Mem0 processes memories asynchronously. Wait 1-3 seconds after adding before searching.

### Rate Limit Errors

If you see rate limit errors despite automatic retries:

1. Reduce the frequency of memory operations
2. Batch multiple pieces of information into single `add_memory` calls
3. Consider upgrading your Mem0 plan

### Graph Relationships Not Appearing

1. Ensure `mem0_graph_memory: enabled` is set
2. Provide clear, well-structured content for entity extraction
3. Check that graph memory is enabled in your Mem0 project settings

## Mem0 Tool Catalog

For more granular control over memory operations, individual Mem0 tools can be configured separately:

```yaml
tools:
  - from: mem0:add
    name: mem0_add
    description: Add a memory to the knowledge base
    params:
      mem0_api_key: ${secrets:MEM0_API_KEY}
      mem0_user_id: user-12345
      mem0_graph_memory: enabled

  - from: mem0:search
    name: mem0_search
    description: Search for relevant memories
    params:
      mem0_api_key: ${secrets:MEM0_API_KEY}
      mem0_user_id: user-12345
      mem0_graph_memory: enabled

  - from: mem0:get
    name: mem0_get_all
    description: Get all memories for the user
    params:
      mem0_api_key: ${secrets:MEM0_API_KEY}
      mem0_user_id: user-12345

  - from: mem0:delete
    name: mem0_delete
    description: Delete a memory
    params:
      mem0_api_key: ${secrets:MEM0_API_KEY}
      mem0_user_id: user-12345
```

### Tool Catalog Summary

| Tool          | Description                                         |
| ------------- | --------------------------------------------------- |
| `mem0:add`    | Add memories from user messages                     |
| `mem0:search` | Search memories using semantic search               |
| `mem0:get`    | Get all memories for a user/agent                   |
| `mem0:delete` | Delete a specific memory or all memories for a user |

This approach provides finer control compared to using `mem0:memory`, which bundles all four tools together.

## Related Resources

- [Mem0 Platform Documentation](https://docs.mem0.ai)
- [Mem0 API Reference](https://docs.mem0.ai/api-reference)
- [Graph Memory Guide](https://docs.mem0.ai/platform/features/graph-memory)
- [Spice Tools Documentation](/docs/components/tools)
- [Memory Reference](/docs/reference/spicepod/memory)
