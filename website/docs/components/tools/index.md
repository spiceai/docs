---
title: 'LLM Tools (Function Calling)'
sidebar_label: 'LLM Tools'
description: 'Overview of supported LLM tools (function calling) and how to define new tools'
---

A tool is a function or operation that can be called directly or by a [language model](/docs/features/large-language-models) (LLMs). The Spice runtime has several tools available by default, giving LLMs access to various parts of the runtime. Tools can also be added or configured by the user by declaring them in the `tools` section of `spicepod.yaml`.

For details about providing LLMs tool access, see [Language Model Tools](/docs/features/large-language-models/tools).

**Example**

```yaml
tools:
  - name: arpanet
    from: websearch
    description: 'Search the web for information.'
    params:
      engine: perplexity
      perplexity_auth_token: ${ secrets:SPICE_PERPLEXITY_AUTH_TOKEN }
```

For details on tool specifications, see the [Tools Spicepod Reference](/docs/reference/spicepod/tools).

### Available Tools

| Name                      | Description                                                       | Default Group | Supports `table_allowlist` |
| ------------------------- | ----------------------------------------------------------------- | ------------- | -------------------------- |
| `list_datasets`           | List all available datasets in the runtime.                       | `auto`        | ✓                          |
| `sql`                     | Execute SQL queries on the runtime.                               | `auto`        | ✓                          |
| `table_schema`            | Get the schema of a specific SQL table.                           | `auto`        | ✓                          |
| `search`                  | Searches a configured dataset based on an input query.            | `auto`        | ✓                          |
| `sample_distinct_columns` | Generate a synthetic sample of data with distinct values.         | `auto`        |                            |
| `random_sample`           | Sample random rows from a table.                                  | `auto`        |                            |
| `top_n_sample`            | Sample the top N rows from a table based on a specified ordering. | `auto`        |                            |
| `memory:load`             | Retrieve all stored memories from the last time period.           | `memory`      |                            |
| `memory:store`            | Store information from LLM interaction(s) for future reference.   | `memory`      |                            |
| [`websearch`][websearch]  | Search the web for information.                                   | -             |                            |

[websearch]: /docs/components/tools/websearch

### Restricting Table Access with `table_allowlist`

Several builtin tools support restricting access to specific datasets and tables via the `table_allowlist` parameter. This parameter accepts a comma-delimited list of glob patterns that determine which tables the tool can access.

When `table_allowlist` is configured, the tool operates as if only the matching datasets and tables exist in the runtime. This restriction helps create focused tools for specific subsets of data.

**Example**: Restricting tools to specific datasets

```yaml
tools:
  - name: sales_sql
    from: builtin:sql
    params:
      table_allowlist: sales.*,analytics.customer_metrics

  - name: sales_list_datasets
    from: builtin:list_datasets
    params:
      table_allowlist: sales.*

  - name: analytics_search
    from: builtin:search
    params:
      table_allowlist: analytics.*

  - name: sales_table_schema
    from: builtin:table_schema
    params:
      table_allowlist: sales.*,analytics.products

datasets:
  - from: file:./data/sales.jsonl
    name: sales.transactions
    acceleration:
      enabled: true

  - from: file:./data/users.jsonl
    name: analytics.customers
    acceleration:
      enabled: true
```

In this configuration, `sales_sql` can only execute queries on tables matching the `sales.*` pattern and the specific table `analytics.customer_metrics`. The `sales_list_datasets` tool lists only datasets in the `sales` schema.

**Glob Pattern Support**

The `table_allowlist` parameter supports glob patterns for flexible matching:

- `sales.*` matches all tables in the `sales` schema
- `*.customers` matches any `customers` table across all catalogs and schemas
- `catalog.schema.table` matches a specific fully-qualified table
- Patterns are case-sensitive for quoted identifiers but case-insensitive otherwise
- Multiple patterns can be combined with commas: `sales.*,analytics.table1,marketing.table2`

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
