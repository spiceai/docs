---
title: 'Language Model Memory'
sidebar_label: 'Memory'
description: 'Learn how to provide LLMs with memory'
sidebar_position: 2
pagination_prev: null
pagination_next: null
---

Spice provides memory persistence tools that help language models store and retrieve information across conversations. These tools are available through the `memory` tool group.

## Enabling Memory Tools

To enable memory tools for Spice models, define a `store` [memory](/docs/components/data-connectors/memory.md) dataset and specify `memory` in the model's `tools` parameter.

### Example: Enabling Memory Tools

```yaml
datasets:
  - from: memory:store
    name: llm_memory
    mode: read_write

models:
  - name: memory-enabled-model
    from: openai:gpt-4o
    params:
      tools: memory, sql # Can be combined with other tool groups
```

## Available Tools

- `store_memory`: Store important information for future reference
- `load_memory`: Retrieve previously stored memories from the last time period.
