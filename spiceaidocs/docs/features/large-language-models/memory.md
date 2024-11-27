---
title: 'Language Model Memories'
sidebar_label: 'Memory'
description: 'Learn how LLMs can interact with the spice runtime.'
sidebar_position: 3
pagination_prev: null
pagination_next: null
---

# Memory Tools

Spice provides memory persistence tools that allow language models to store and retrieve information across conversations. These tools are available through the `memory` tool group.

## Enabling Memory Tools

To enable memory tools for Spice models you need to:
 1. Define a `store` [memory](/components/data-connectors/memory.md) dataset.
 2. Specify `memory` in the model's `tools` parameter.

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
