---
title: 'Giving Language Models Runtime Tools'
sidebar_label: 'Runtime tools'
description: 'Learn how LLMs can interact with the spice runtime.'
sidebar_position: 2
pagination_prev: null
pagination_next: null
---

Spice provides a fully OpenAI compatible [`v1/chat/completion`](/api/http/chat-completions)] endpoint.
In addition to user-provided tools (in the request payload), Spice provides a set of tools to let LLM interact with the runtime. To provide these tools to a Spice model, specify them in its `params.spice_tools`.
```yaml
models:
  - name: sql-model
    from: openai/gpt-4o
    params:
      spice_tools: list_datasets, sql, table_schema

  - name: full-runtime
    from: openai/gpt-4o
    params:
      spice_tools: auto # Use all available tools
```

## Available tools
 - `list_datasets`: List all available datasets in the runtime.
 - `sql`: Execute SQL queries on the runtime.
 - `table_schema`: Get the schema of a specific SQL table.
 - `document_similarity`: For a datasets with an embedding column, retrieve documents based on an input query. It is equivalent to [/v1/search](/api/http/search).
