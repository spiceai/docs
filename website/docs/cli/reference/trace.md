---
title: "trace"
sidebar_label: "trace"
pagination_prev: null
pagination_next: null
---

Provides a user-friendly trace stack into an operation that occurred in Spice. This command retrieves and displays task execution traces from the `runtime.task_history` table.

### Usage

```shell
spice trace [task] [flags]
```

`task` - The name of the task whose trace is requested. Supported tasks include:

- `acceleration_refresh`
- `ai`
- `ai_chat`
- `ai_completion`
- `eval_run`
- `sql_query`
- `nsql`
- `text_embed`
- `tool_use::search`
- `tool_use::list_datasets`
- `tool_use::sql`
- `tool_use::table_schema`
- `tool_use::sample_data`
- `tool_use::load_memory`
- `tool_use::store_memory`
- `search`
- `scheduled_worker`

Tools proxied from MCP servers and custom tools are recorded dynamically as `tool_use::<tool>`. Any such `tool_use::`-prefixed task name can be traced, not just the built-in tools listed above.

A tool that belongs to a non-default tool catalog — which includes every tool proxied from an MCP server — is exposed under a catalog-qualified name joining the catalog and the tool with `__`, for example `github__search_code`. That is the name `/v1/tools` lists and the name `POST /v1/tools/{name}` expects.

:::warning A proxied MCP tool is recorded under two different task names

Which name `runtime.task_history` records depends on how the tool was invoked:

| Invoked via | `task` recorded |
| --- | --- |
| The `/v1/mcp` gateway | `tool_use::github__search_code` (the exposed name) |
| A model-driven tool call, or `POST /v1/tools/github__search_code` | `tool_use::github/search_code` |

`spice trace` matches the task name exactly, so trace both spellings to see every call to the tool. Tracked in [spiceai/spiceai#13338](https://github.com/spiceai/spiceai/issues/13338).

:::

These tasks are from the `task` column in the Spice SQL `runtime.task_history` table.

#### Flags

- `--trace-id`  Retrieve the trace with the given trace ID (the column `trace_id` from `runtime.task_history`).
- `--id`  Retrieve the trace with the given `id` label (i.e. the task has a valid `id` within the `labels` column of `runtime.task_history`).
- `--api-key`  Specify the API key for authentication.
- `--include-output`: Include, as an additional column, the captured output to each span (i.e. the `captured_output` column from `runtime.task_history`). Note: If captured outputs are not being stored, this will return an empty row.
- `--include-input`: Include, as an additional column, the input to each span (i.e. the `input` column from `runtime.task_history`).
- `--truncate [<length>]`  Truncate the `input` and `captured_output` columns to the given number of characters. Defaults to `80` characters when the flag is passed without a value; when omitted, the columns are not truncated.
- `-o`, `--output <format>` Output format: `table` (default) or `json`.

The latest trace for the task will be used if neither `--trace-id` nor `--id` is specified.

### Examples

#### Retrieve the trace for the last text-to-SQL operation

```shell
spice trace nsql
```

#### Retrieve the trace for a specific task by ID

```shell
spice trace ai_chat --id chatcmpl-At6ZmDE8iAYRPeuQLA0FLlWxGKNnM
```

#### Retrieve a trace by `trace-id`

```shell
spice trace sql_query --trace-id d5c6f1eed9f27257
```

### Output Example

```shell
TREE                   STATUS DURATION   TASK
a97f52ccd7687e64       ✅       673.14ms ai_chat
  ├── 4eebde7b04321803 ✅         0.04ms tool_use::list_datasets
  └── 4c9049e1bf1c3500 ✅       671.91ms ai_completion
```

This output represents a structured trace of executed tasks.

### Output Example (with `--include-output`)
```shell
TREE                   STATUS DURATION   TASK                    OUTPUT
a97f52ccd7687e64       ✅       673.14ms ai_chat                 The capital of New York is Albany.
  ├── 4eebde7b04321803 ✅         0.04ms tool_use::list_datasets []
  └── 4c9049e1bf1c3500 ✅       671.91ms ai_completion           [{"content":"The capital of New York is Albany.","refusal":null,"tool_calls":null,"role":"assistant","function_call":null,"audio":null}]
```
