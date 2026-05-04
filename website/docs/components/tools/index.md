---
title: 'LLM Tools (Function Calling)'
sidebar_label: 'LLM Tools'
description: 'Overview of supported LLM tools (function calling) and how to define new tools'
---

A tool is a function or operation that can be called directly or by a [language model](../features/large-language-models) (LLMs). The Spice runtime has several tools available by default, giving LLMs access to various parts of the runtime. Tools can also be added or configured by the user by declaring them in the `tools` section of `spicepod.yaml`.

For details about providing LLMs tool access, see [Language Model Tools](../features/large-language-models/tools).

For details on tool specifications, see the [Tools Spicepod Reference](../reference/spicepod/tools).

### Available Tools

| Name                      | Description                                                       | Default Group |
| ------------------------- | ----------------------------------------------------------------- | ------------- |
| `list_datasets`           | List all available datasets in the runtime.                       | `auto`        |
| `sql`                     | Execute SQL queries on the runtime.                               | `auto`        |
| `table_schema`            | Get the schema of a specific SQL table.                           | `auto`        |
| `search`                  | Searches a configured dataset based on an input query.            | `auto`        |
| `sample_distinct_columns` | Generate a synthetic sample of data with distinct values.         | `auto`        |
| `random_sample`           | Sample random rows from a table.                                  | `auto`        |
| `top_n_sample`            | Sample the top N rows from a table based on a specified ordering. | `auto`        |
| `memory:load`             | Retrieve all stored memories from the last time period.           | `memory`      |
| `memory:store`            | Store information from LLM interaction(s) for future reference.   | `memory`      |
| ~~[`websearch`][websearch]~~ | ~~Search the web for information.~~ (Deprecated)               | -             |

[websearch]: tools/websearch

### Tool Groups

Tool groups are predefined sets of tools that can be provided to LLMs in a single tool name. For example, the `auto` tool group provides all default tools to the LLM (see above table).

```yaml
models:
  - name: full-runtime
    from: openai:gpt-4o
    params:
      tools: auto # Automatically choose direct or registry-based discovery
```

#### Available tool groups

| Name              | Description                                                                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auto`            | Automatically choose between direct tools and searchable registry discovery based on the number of tools and embedding model availability.           |
| `all`             | All built-in and Spicepod-configured tools, provided directly to the LLM.                                                                           |
| `search_registry` | Use searchable tool registry discovery via `tool_search` and `tool_invoke` meta-tools. Requires an embedding model (see `tool_embedding_model`).    |
| `memory`          | Memory tools for storing and retrieving information across conversations.                                                                            |
| [`MCP`][mcp]      | Tools provided from an MCP server. Can be run within Spice, or connected to over HTTP(s) SSE                                                        |

[mcp]: tools/mcp

For details on `auto`, `all`, and `search_registry` tool modes, see [Language Model Tools](../features/large-language-models/tools#tool-modes).
