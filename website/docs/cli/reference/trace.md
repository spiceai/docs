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

- `ai_chat`
- `ai_completion`
- `sql_query`
- `nsql`
- `tool_use::document_similarity`
- `tool_use::list_datasets`
- `tool_use::sql`
- `tool_use::table_schema`
- `tool_use::sample_data`
- `tool_use::sql_query`
- `tool_use::memory`

These tasks are from the `task` column in the Spice SQL `runtime.task_history` table.

#### Flags

- `--trace-id`  Retrieve the trace with the given trace ID (the column `trace_id` from `runtime.task_history`).
- `--id`  Retrieve the trace with the given `id` label (i.e. the task has a valid `id` within the `labels` column of `runtime.task_history`).
- `--api-key`  Specify the API key for authentication.

### Examples

#### Retrieve the trace for the last text-to-SQL operation
```shell
spice trace nsql
```

#### Retrieve the trace for a specific task by ID
```shell
spice trace ai_chat --id chatcmpl-At6ZmDE8iAYRPeuQLA0FLlWxGKNnM
```

### Output Example

```shell
[d5c6f1eed9f27257] ( 3077.45ms) ai_chat
  ├── [16eb97d757e4ea47] (    0.85ms) tool_use::list_datasets
  ├── [ece97973668bd54a] ( 1651.14ms) ai_completion
  ├── [96fe526b54330e95] (    0.62ms) tool_use::get_readiness
  └── [8aa2bf4c94f42ba2] ( 1420.09ms) ai_completion
```

This output represents a structured trace of executed tasks.

#### Retrieve a trace by `trace-id`
```shell
spice trace sql_query --trace-id d5c6f1eed9f27257
```
