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

For a list of available tools, or how to define additional tools, see [Tool Components(../../components/tools).

### Example: Specifying Tools for a Model

```yaml
models:
  - name: sql-model
    from: openai:gpt-4o
    params:
      tools: list_datasets, sql, table_schema
```

### Example: Specifying tools via a Tool Group

```yaml
- name: full-runtime
  from: openai:gpt-4o
  params:
    tools: auto # Use all default tools
```

For details on tool groups, see [Tool Components(../../components/tools#tool-groups).

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
