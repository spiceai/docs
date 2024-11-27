---
title: 'Memory Data Connector'
sidebar_label: 'Memory Data Connector'
description: 'Memory Data Connector Documentation'
pagination_prev: null
---

The Memory Data Connector enables configuring an in-memory dataset for tables used, or produced by the Spice runtime. Only certain tables, with predefined schemas, can be defined by the connector. These are:
 - `store`: Defines a table that LLMs, with [memory tooling](/features/large-language-models/memory), can store data in. Requires `mode: read_write`.

### Examples

```yaml
datasets:
- from: memory:store
  name: llm_memory
  mode: read_write
  columns:
    - name: value
      embeddings: # Easily make your LLM learnings searchable.
        - from: all-MiniLM-L6-v2

embeddings:
  - name: all-MiniLM-L6-v2
    from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2
```
