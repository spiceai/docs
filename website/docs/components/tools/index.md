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
| `list_datasets`           | List all available datasets in the runtime.                       | `auto`        |
| `sql`                     | Execute SQL queries on the runtime. Write statements (`INSERT`/`UPDATE`/`DELETE`/DDL) are accepted only when the request is authenticated with a ReadWrite API key and the target dataset is configured `access: read_write`; otherwise the tool runs as read-only. | `auto`        |
| `table_schema`            | Get the schema of a specific SQL table.                           | `auto`        |
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


### Results

The `sql` tool and the sampling tools (`sample_distinct_columns`, `random_sample`, `top_n_sample`) return a result sized for a model's context window:

```json
{"columns": ["d_year", "net_paid"], "rows": [[1998, 1234567.89], [1999, 1301122.07]]}
```

Each row is an array of values in `columns` order. Numbers are JSON numbers, NULL is `null`, a decimal with more than 15 significant digits is a string so that no digit is lost, and `NaN` and `±Infinity` are the strings `"NaN"`, `"Infinity"` and `"-Infinity"`.

A result holds at most 100 rows and at most 10% of the calling model's context window, taken as 4 bytes per token, between 4 KiB and 32 KiB. A call without a model, such as from an MCP client or `POST /v1/tools/{name}`, gets 32 KiB. A result with more rows shows the rows that fit, and says so:

```json
{
  "columns": ["ss_item_sk", "ss_net_paid"],
  "rows": [[1, 12.5], [2, 8.0]],
  "truncated": true,
  "message": "Showing the first 100 rows; the result has more. Do not compute totals, counts, or averages from these rows. Run an aggregate query instead, or narrow the query with a WHERE clause."
}
```

A text value longer than 1,024 characters keeps its first 1,024 followed by `…[+N chars]`, a list longer than 16 elements keeps 16 followed by `"…[+N items]"`, and a binary value is shown as `"<binary N bytes>"`. When a value is shortened, the `message` says so.

Over MCP, these tools declare an `outputSchema` and return the result as `structuredContent`, with the same JSON as text. Programs that need every row use [`/v1/sql`](/docs/api/http/post-sql) instead.

In v2.4.x and earlier, the `sql` tool returned a JSON array of row objects, and the sampling tools a text table, up to 16 MiB.

### Loading and Reloading Tools

Spice registers the built-in tools first, then loads the tools in the Spicepod concurrently. A Spicepod tool that cannot load is logged and left out of the tool list. The built-in tools, such as `sql`, and the other Spicepod tools still register, and `/v1/tools` and the MCP `tools/list` method list them. A Spicepod tool with the same name as a built-in tool is not used: Spice logs a warning and keeps the built-in tool.

Spice waits up to 2 minutes for each tool, then loads models and workers while a tool that has not loaded keeps retrying in the background. A tool whose configuration is invalid is not retried: a `from` that no tool source handles, an invalid `mcp:` directive, or an `mcp_args` value that cannot be parsed. It stays unavailable until its configuration is fixed. A tool that has not loaded keeps `/v1/ready` reporting not ready, like any component that failed to load. When such a tool loads later, Spice reloads the models that use it, so they offer the tool from then on.

With the pods watcher enabled (`spice run`, or `spiced --pods-watcher-enabled`), changes to `tools:` in the Spicepod take effect without a restart. Later requests can no longer see or call a removed tool, and an MCP server that Spice started as a subprocess for it is stopped. A request already in progress keeps the tools it started with and can still call a removed tool, so removing a tool is not an immediate revocation of its access, and a remote MCP server keeps running. A changed tool loads again with its new settings, and an added tool loads as it would at startup. Spice then reloads every model that can use a changed tool: a model whose `tools` parameter names the tool (or `catalog:tool`), or that uses `auto`, `all`, or `search_registry`, alone or in a list such as `auto, my_tool`. Changes to `workers:` also take effect without a restart: a removed worker stops running on its schedule, including a run in progress.

In v2.4.1 and earlier, changes to `tools:` and `workers:` took effect only after a restart, a model did not receive a tool that loaded after the model, an MCP server that never answered kept models, workers, and built-in tools from loading, and a Spicepod tool that failed to load kept retrying and kept the Spicepod tools listed after it, and the built-in tools such as `sql`, from loading.

For details on `auto`, `all`, and `search_registry` tool modes, see [Language Model Tools](../features/large-language-models/tools#tool-modes).
