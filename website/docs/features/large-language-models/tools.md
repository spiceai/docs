---
title: 'Language Models Tools'
sidebar_label: 'Tools'
description: 'Learn how LLMs interact with the Spice runtime.'
sidebar_position: 1
pagination_prev: null
pagination_next: null
tags:
  - models
  - tools
  - runtime
---

Spice provides tools that help LLMs interact with the runtime. To specify these tools for a Spice model, include them in its `params.tools`.

For a list of available tools, or how to define additional tools, see [Tool Components](../../components/tools).

### Tool Modes

The `tools` parameter on a model controls how tools are provided to the LLM:

| Value | Description |
| --- | --- |
| `auto` | Automatically choose between direct tools and searchable registry discovery. When the number of available tools exceeds 20 and an embedding model is available, `auto` switches to registry-based discovery; otherwise it uses direct tools. |
| `all` | Provide all built-in and Spicepod-configured tools directly to the LLM. |
| `search_registry` | Use searchable registry discovery. The LLM receives `tool_search` and `tool_invoke` meta-tools instead of individual tool definitions. Requires an embedding model (see `tool_embedding_model`). |
| `<tool1>, <tool2>, ...` | Provide only the named tools directly. |

### Example: Specifying Tools for a Model

```yaml
models:
  - name: sql-model
    from: openai:gpt-4o
    params:
      tools: list_datasets, sql, table_schema
```

### Example: Using all default tools directly

```yaml
models:
  - name: full-runtime
    from: openai:gpt-4o
    params:
      tools: all
```

### Example: Using auto mode (default)

```yaml
models:
  - name: full-runtime
    from: openai:gpt-4o
    params:
      tools: auto
```

For details on tool groups, see [Tool Components](../../components/tools#tool-groups).

### Searchable Tool Registry

When many tools are available, passing all tool definitions directly to the LLM can consume a large portion of the context window and reduce response quality. The searchable tool registry addresses this by replacing individual tool definitions with two meta-tools:

- **`tool_search`** — Searches the registry for tools relevant to a query, returning the top matches with descriptions and parameter schemas.
- **`tool_invoke`** — Invokes a tool returned by `tool_search` by name with the provided arguments.

The registry uses hybrid search (full-text, keyword, parameter schema, and vector similarity) to find the most relevant tools for each query.

#### Configuring `tool_embedding_model`

When using `tools: search_registry`, an embedding model must be available. You can specify which embedding model to use with the `tool_embedding_model` parameter. If only one embedding model is configured in the Spicepod, it is used automatically.

```yaml
embeddings:
  - name: tool_embeddings
    from: openai:text-embedding-3-small

models:
  - name: my-model
    from: openai:gpt-4o
    params:
      tools: search_registry
      tool_embedding_model: tool_embeddings
```

When using `tools: auto`, the registry is used opportunistically — if an embedding model is available and the number of tools exceeds 20, `auto` switches to registry-based discovery. If no embedding model is configured, `auto` falls back to providing tools directly.

### Example: Specifying tools and tool groups

```yaml
models:
  - name: full-runtime
    from: openai:gpt-4o
    params:
      tools: memory, sql
```

### Tool Recursion Limit

When a model requests to call a runtime tool, Spice runs the tool internally and feeds the result back to the model. The model may then request another tool call based on the result, creating a chain of tool invocations. The `tool_recursion_limit` parameter limits the depth of this internal recursion. By default, this limit is set to 10.

Lowering the limit can help prevent runaway tool chains in cases where a model repeatedly invokes tools without converging on a final answer.

```yaml
models:
  - name: my-model
    from: openai
    params:
      tool_recursion_limit: 3
```
