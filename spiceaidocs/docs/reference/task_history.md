---
title: 'Task History'
sidebar_label: 'Task History'
pagination_prev: 'reference/index'
pagination_next: null
sidebar_position: 4
---

The Spice runtime stores information about completed tasks in the `spice.runtime.task_history` table. Each task executed has a row in this table, and by default the data is retained for 8 hours. Use a `SELECT` query to return information about each task as shown in this example:

```sql
SELECT
  *
FROM
  spice.runtime.task_history
LIMIT
  100;
```

## Task Types

The following top-level task types are currently recorded:

| Task Type         | Description                        |
| ----------------- | ---------------------------------- |
| `sql_query`       | SQL Query                          |
| `nsql_query`      | Natural Language to SQL Query      |
| `ai_chat`         | AI Chat Completion                 |
| `vector_search`   | Vector Search                      |
| `accelerated_refresh` | Accelerated Table Refresh      |
| `text_embed`      | Text Embedding                     |

## Configuration

Set the following parameters in the `runtime.task_history` section of your `config.yaml` file to configure task history:

- `enabled`: Enable or disable task history.
- `retention_period`: The duration for which task history data is retained.
- `retention_check_interval`: The interval at which the task history retention is checked.
- `captured_output`: The level of output captured for tasks. `none` or `truncated`.

### Examples

Adjust the retention period for task history:

```yaml
runtime:
  task_history:
    retention_period: 1h # Keep tasks for 1 hour
    retention_check_interval: 1m # Check for expired tasks every minute
```

Disable task history:

```yaml
runtime:
  task_history:
    enabled: false
```

Disable capturing output from tasks:

```yaml
runtime:
  task_history:
    captured_output: none # none or truncated
```

## Table Schema

| Column Name           | Data Type                 | Is Nullable | Description                                                                      |
|-----------------------|---------------------------|-------------|----------------------------------------------------------------------------------|
| trace_id              | Utf8                      | NO          | Unique identifier for the entire trace this task happened in                    |
| span_id               | Utf8                      | NO          | Unique identifier for this specific task within the trace                     |
| parent_span_id        | Utf8                      | YES         | Identifier of the parent task, if any                                             |
| task                  | Utf8                      | NO          | Name or description of the task being performed (e.g. `sql_query`)                |
| input                 | Utf8                      | NO          | Input data or parameters for the task                                              |
| captured_output       | Utf8                      | YES         | Output or result of the task, if available                                         |
| start_time            | Timestamp(Nanosecond, None) | NO          | Time when the task started                                                         |
| end_time              | Timestamp(Nanosecond, None) | NO          | Time when the task ended                                                           |
| execution_duration_ms | Float64                     | NO          | Duration of the task execution in milliseconds                                     |
| error_message         | Utf8                        | YES         | Error message if the task failed, otherwise null                                   |
| labels                | Map(Utf8, Utf8)            | NO          | Key-value pairs for additional metadata or attributes associated with the task     |
