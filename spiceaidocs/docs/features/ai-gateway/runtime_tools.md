---
title: 'Giving Language Models Runtime Tools'
sidebar_label: 'Runtime tools'
description: 'Learn how LLMs can interact with the spice runtime.'
sidebar_position: 2
pagination_prev: null
pagination_next: null
---

Spice provides a set of tools that let LLMs interact with the runtime. To provide these tools to a Spice model, specify them in its `params.spice_tools`.
```yaml
models:
  - name: sql-model
    from: openai:gpt-4o
    params:
      spice_tools: list_datasets, sql, table_schema

  - name: full-runtime
    from: openai:gpt-4o
    params:
      spice_tools: auto # Use all available tools
```

### Tool Recursion Limit
When a model requests to call a runtime tool, Spice runs the tool internally and feeds it back to the model. The `tool_recursion_limit` parameter limits the depth of internal recursion Spice will undertake. By default, Spice can infinitely recurse if the model requests to do so. 

```yaml
models:
 - name: my-model
   from: openai
   params:
     tool_recursion_limit: 3
```

## Available tools
 - `list_datasets`: List all available datasets in the runtime.
 - `sql`: Execute SQL queries on the runtime.
 - `table_schema`: Get the schema of a specific SQL table.
 - `document_similarity`: For datasets with an embedding column, retrieve documents based on an input query. It is equivalent to [/v1/search](/api/http/search).
 - `sample_distinct_columns`: For a dataset, generate a synthetic sample of data whereby each column has at least a number of distinct values.
 - `random_sample`: Sample random rows from a table.
 - `top_n_sample`: Sample the top N rows from a table based on a specified ordering.
