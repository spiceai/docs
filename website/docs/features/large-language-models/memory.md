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

Spice provides memory persistence tools that help language models store and retrieve information across conversations. These tools are available through the `memory` tool group.

## Enabling Memory Tools

To enable memory tools for Spice models, define a `store` [memory](../../components/data-connectors/memory) dataset and specify `memory` in the model's `tools` parameter.

### Example: Enabling Memory Tools

```yaml
datasets:
  - from: memory:store
    name: llm_memory
    access: read_write

models:
  - name: memory-enabled-model
    from: openai:gpt-4o
    params:
      tools: memory, sql # Can be combined with other tool groups
```

For more information on tools, see [Tool components](../../components/tools).
