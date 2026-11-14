---
title: 'LLM Tools (Function Calling)'
sidebar_label: 'LLM Tools'
description: 'Overview of supported LLM tools (function calling) and how to define new tools'
sidebar_position: 7
---

A tool is a function or operation that can be called directly or by a [language model](../features/large-language-models) (LLMs). The Spice runtime has several tools available by default, giving LLMs access to various parts of the runtime. Tools can also be added or configured by the user by declaring them in the `tools` section of `spicepod.yaml`.

For details about providing LLMs tool access, see [Language Model Tools](../features/large-language-models/tools).

For details on tool specifications, see the [Tools Spicepod Reference](../reference/spicepod/tools).

### Available Tools

| Name                      | Description                                                       | Default Group |
| ------------------------- | ----------------------------------------------------------------- | ------------- |
| `list_datasets`           | List the datasets the runtime can query, 50 at a time, optionally searched by name, description, and columns. | `auto`        |
| `sql`                     | Execute SQL queries on the runtime. Write statements (`INSERT`/`UPDATE`/`DELETE`/DDL) are accepted only when the request is authenticated with a ReadWrite API key and the target dataset is configured `access: read_write`; otherwise the tool runs as read-only. | `auto`        |
| `table_schema`            | List a table's columns with their SQL types, descriptions, and keys, optionally only the columns matching a search. | `auto`        |
| `search`                  | Searches a configured dataset based on an input query.            | `auto`        |
| `get_readiness`           | Report the readiness state of every runtime component (datasets, accelerators, models, embeddings, catalogs). | `auto`        |
| `get_current_datetime`    | Return the current UTC date and time as an ISO 8601 timestamp.    | `auto`        |
| `sample_distinct_columns` | Generate a synthetic sample of data with distinct values.         | `all`         |
| `random_sample`           | Sample random rows from a table.                                  | `all`         |
| `top_n_sample`            | Sample the top N rows from a table based on a specified ordering. | `all`         |
| `memory:load`             | Retrieve all stored memories from the last time period.           | `memory`      |
| `memory:store`            | Store information from LLM interaction(s) for future reference.   | `memory`      |
| ~~[`websearch`][websearch]~~ | ~~Search the web for information.~~ (Deprecated)               | -             |

[websearch]: tools/websearch

The `auto` group is a subset of `all`: the sampling tools (`sample_distinct_columns`, `random_sample`, `top_n_sample`) are provided only by the `all` (and `nsql`) groups, or by naming them individually.

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
| `nsql`            | Built-in tools relevant to text-to-SQL: `table_schema`, `sql`, `list_datasets`, `get_current_datetime`, and the sampling tools.                     |
| `disabled`        | Provide no tools to the LLM.                                                                                                                        |
| [`MCP`][mcp]      | Tools provided from an MCP server. Can be run within Spice, or connected to over HTTP(s) SSE                                                        |

[mcp]: tools/mcp


### Result Size Limit

The `sql` tool fails when its result, written as JSON, is larger than 16 MiB, and the sampling tools (`sample_distinct_columns`, `random_sample`, `top_n_sample`) fail when the rows they collect take more than 16 MiB of memory. The limit is fixed and has no setting. The error tells the model how to ask for less, for example:

```text
The result is larger than 16 MiB, the size limit for this request. Add a LIMIT clause, select fewer columns, or aggregate the rows.
```

Tools served by an MCP server have the same [16 MiB limit](./mcp.md#tool-result-size-limit). In v2.4.1 and earlier, the `sql` and sampling tools returned results of any size.

### Datasets and Schemas

A model with Spice's tools is told which datasets it can query in a system message, after the Spicepod `system_prompt` and the client's own system messages:

```text
Datasets (use these names in sql, search, and table_schema):
- spice.public.orders: Customer orders
- spice.docs.pages: Product docs [searchable]
```

On `/v1/responses`, the list goes at the end of the request's `instructions` instead, after the client's. A response that continues a conversation with `previous_response_id` does not carry instructions over, so the conversation holds one copy of the list, not one per turn.

When the list would take more than about 2,000 tokens (8 KiB), the message instead says how many datasets there are and to find them with `list_datasets`:

```text
992 datasets are available. Call list_datasets with search to find the ones relevant to the question.
```

`list_datasets` takes optional `search`, `limit` (default 50, at most 200), and `offset`. `search` matches dataset names, descriptions, column names, and column descriptions, best match first:

```json
{"datasets": [{"table": "spice.docs.pages", "description": "Product docs", "can_search_documents": true}], "total": 992, "has_more": true}
```

`can_search_documents` appears only when `search` can query the dataset, and `description` and `metadata` only when the dataset has them.

`table_schema` lists each table's columns, one per line, with its SQL type and `NOT NULL`. With `output: full` (the default), it adds column descriptions and the table's keys:

```text
spice.tpcds.store_sales: TPC-DS store_sales table
  ss_item_sk BIGINT NOT NULL
  ss_net_paid DECIMAL(7,2) -- Net paid
  primary key (ss_item_sk, ss_ticket_number)
```

A column name that SQL must quote, such as one with capitals or spaces, is listed in double quotes, as a query writes it: `"Net Paid" DOUBLE`.

For a wide table, `search` lists only the columns whose names or descriptions match, followed by a count of the others. `output: minimal` lists names and types only.

In v2.4.x and earlier, Spice added a `list_datasets` call and its result to every chat request, `list_datasets` returned every dataset at once, and `table_schema` returned a Markdown table.

### Loading and Reloading Tools

Spice registers the built-in tools first, then loads the tools in the Spicepod concurrently. A Spicepod tool that cannot load is logged and left out of the tool list. The built-in tools, such as `sql`, and the other Spicepod tools still register, and `/v1/tools` and the MCP `tools/list` method list them. A Spicepod tool with the same name as a built-in tool is not used: Spice logs a warning and keeps the built-in tool.

Spice waits up to 2 minutes for each tool, then loads models and workers while a tool that has not loaded keeps retrying in the background. A tool whose configuration is invalid is not retried: a `from` that no tool source handles, an invalid `mcp:` directive, or an `mcp_args` value that cannot be parsed. It stays unavailable until its configuration is fixed. A tool that has not loaded keeps `/v1/ready` reporting not ready, like any component that failed to load. When such a tool loads later, Spice reloads the models that use it, so they offer the tool from then on.

With the pods watcher enabled (`spice run`, or `spiced --pods-watcher-enabled`), changes to `tools:` in the Spicepod take effect without a restart. Later requests can no longer see or call a removed tool, and an MCP server that Spice started as a subprocess for it is stopped. A request already in progress keeps the tools it started with and can still call a removed tool, so removing a tool is not an immediate revocation of its access, and a remote MCP server keeps running. A changed tool loads again with its new settings, and an added tool loads as it would at startup. Spice then reloads every model that can use a changed tool: a model whose `tools` parameter names the tool (or `catalog:tool`), or that uses `auto`, `all`, or `search_registry`, alone or in a list such as `auto, my_tool`. Changes to `workers:` also take effect without a restart: a removed worker stops running on its schedule, including a run in progress.

In v2.4.1 and earlier, changes to `tools:` and `workers:` took effect only after a restart, a model did not receive a tool that loaded after the model, an MCP server that never answered kept models, workers, and built-in tools from loading, and a Spicepod tool that failed to load kept retrying and kept the Spicepod tools listed after it, and the built-in tools such as `sql`, from loading.

For details on `auto`, `all`, and `search_registry` tool modes, see [Language Model Tools](../features/large-language-models/tools#tool-modes).
