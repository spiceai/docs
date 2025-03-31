---
title: 'LLM Tools (Function Calling)'
sidebar_label: 'LLM Tools'
description: 'Overview of supported LLM tools (function calling) and how to define new tools'
---

A tool is a function or operation that can be called directly or by a [language model](/docs/features/large-language-models) (LLMs). The Spice runtime has several tools available by default, giving LLMs access to various parts of the runtime. Tools can also be added or configured by the user by declaring them in the `tools` section of `spicepod.yaml`.

For details about providing LLMs tool access, see [Language Model Tools](/docs/features/large-language-models/tools).

For details on tool specifications, see the [Tools Spicepod Reference](/docs/reference/spicepod/tools).

### Available Tools

| Name                      | Description                                                       | Default Group |
| ------------------------- | ----------------------------------------------------------------- | ------------- |
| `list_datasets`           | List all available datasets in the runtime.                       | `auto`        |
| `sql`                     | Execute SQL queries on the runtime.                               | `auto`        |
| `table_schema`            | Get the schema of a specific SQL table.                           | `auto`        |
| `document_similarity`     | Retrieve documents based on an input query.                       | `auto`        |
| `sample_distinct_columns` | Generate a synthetic sample of data with distinct values.         | `auto`        |
| `random_sample`           | Sample random rows from a table.                                  | `auto`        |
| `top_n_sample`            | Sample the top N rows from a table based on a specified ordering. | `auto`        |
| `memory:load`             | Retrieve all stored memories from the last time period.           | `memory`      |
| `memory:store`            | Store information from LLM interaction(s) for future reference.   | `memory`      |

### Tool Groups

Tool groups are predefined sets of tools that can be provided to LLMs in a single tool name. For example, the `auto` tool group provides all default tools to the LLM (see above table).

```yaml
models:
  - name: full-runtime
    from: openai:gpt-4o
    params:
      tools: auto # Use all default tools
```

#### Available tool groups

| Name         | Description                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------- |
| `auto`       | All default tools (see above table)                                                          |
| `memory`     | Memory tools for storing and retrieving information across conversations.                    |
| [`MCP`][mcp] | Tools provided from an MCP server. Can be run within Spice, or connected to over HTTP(s) SSE |

[mcp]: /docs/components/tools/mcp
