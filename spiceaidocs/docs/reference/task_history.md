---
title: 'Task History'
sidebar_label: 'Task History'
pagination_prev: 'reference/index'
pagination_next: null
sidebar_position: 4
---

The Spice runtime stores information about completed tasks in the `spice.runtime.task_history` table. A task is a single unit of execution within the runtime, such as a SQL query or an AI chat completion (see [Task Types](#task-types) below). Tasks can be nested, and the runtime will record the parent-child relationship between tasks.

Each task executed has a row in this table, and by default the data is retained for 8 hours. Use a `SELECT` query to return information about each task as shown in this example:

```sql
SELECT
  *
FROM
  spice.runtime.task_history
LIMIT
  100;
```

Output:

```console
+----------------------------------+------------------+----------------+---------------------+----------------------------------------------+-----------------+----------------------------+----------------------------+-----------------------+--------------------------------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------+
| trace_id                         | span_id          | parent_span_id | task                | input                                        | captured_output | start_time                 | end_time                   | execution_duration_ms | error_message                                                | labels                                                                                                                              |
+----------------------------------+------------------+----------------+---------------------+----------------------------------------------+-----------------+----------------------------+----------------------------+-----------------------+--------------------------------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------+
| f94dba6b89de98c6e54b074f2353a897 | 4eb243d9b5347762 |                | accelerated_refresh | runtime.metrics                              |                 | 2024-09-23T23:17:39.907789 | 2024-09-23T23:17:39.917777 | 9.988                 |                                                              | {sql: SELECT * FROM runtime.metrics}                                                                                                |
| 1f1f8305520e15ea7ad9b0a43e5d2c7e | 6aadf7c91caea3c4 |                | accelerated_refresh | runtime.task_history                         |                 | 2024-09-23T23:17:39.907873 | 2024-09-23T23:17:39.917797 | 9.924000000000001     |                                                              | {sql: SELECT * FROM runtime.task_history}                                                                                           |
| 1432e30c5ed7764f4ef35f6508dfd56c | fbb31c60d41d8232 |                | accelerated_refresh | logs_file                                    |                 | 2024-09-23T23:17:40.143699 | 2024-09-23T23:17:40.271678 | 127.97900000000001    |                                                              | {sql: SELECT * FROM logs_file}                                                                                                      |
| fd0b909b789938384d99f0e4e6f4b68b | 624ea4751bb6727a |                | accelerated_refresh | logs                                         |                 | 2024-09-23T23:17:40.676838 | 2024-09-23T23:17:42.345932 | 1669.0939999999998    |                                                              | {sql: SELECT * FROM "logs"}                                                                                                         |
| 3db5488039408825ac0829a3feb49b05 | e3e5ac928b497eef |                | accelerated_refresh | decimal                                      |                 | 2024-09-23T23:17:41.592359 | 2024-09-23T23:17:43.781699 | 2189.34               |                                                              | {sql: SELECT * FROM "decimal"}                                                                                                      |
| 5c5ddd481d1e19df823da74fe33f261f | 6afcfd1e65385a16 |                | sql_query           | select * from runtime.task_history limit 100 |                 | 2024-09-23T23:17:48.305649 | 2024-09-23T23:17:48.307369 | 1.72                  |                                                              | {runtime_query: true, query_execution_duration_ms: 1.429375, protocol: FlightSQL, datasets: runtime.task_history, rows_produced: 5} |
| 4c3dd314b874aa63fcd15023e67fc645 | cab3cdc2d31c1b6a |                | sql_query           | select block_number from logs_file limit 5   |                 | 2024-09-23T23:18:00.267218 | 2024-09-23T23:18:00.269278 | 2.06                  |                                                              | {datasets: logs_file, rows_produced: 5, query_execution_duration_ms: 1.940291, accelerated: true, protocol: FlightSQL}              |
| f135c00df3aecd68dfa4d2360eff78f5 | db3474855449715c |                | sql_query           | select * from foobar                         |                 | 2024-09-23T23:18:12.865122 | 2024-09-23T23:18:12.865196 | 0.074                 | Error during planning: table 'spice.public.foobar' not found | {protocol: FlightSQL, error_code: QueryPlanningError, rows_produced: 0, query_execution_duration_ms: 0.126959, datasets: }          |
+----------------------------------+------------------+----------------+---------------------+----------------------------------------------+-----------------+----------------------------+----------------------------+-----------------------+--------------------------------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------+
```

## Task Types

The following top-level task types are currently recorded:

| Task Type             | Description                   | CLI Command    |
| --------------------- | ----------------------------- | -------------- |
| `sql_query`           | SQL Query                     | `spice sql`    |
| `nsql_query`          | Natural Language to SQL Query |                |
| `ai_chat`             | AI Chat Completion            | `spice chat`   |
| `vector_search`       | Vector Search                 | `spice search` |
| `accelerated_refresh` | Accelerated Table Refresh     |                |
| `text_embed`          | Text Embedding                |                |

## Configuration

Set the following parameters in the `runtime.task_history` section of the `spicepod.yaml` file to configure task history:

- `enabled`: Enable or disable task history. Default: `true`.
- `retention_period`: The duration for which task history data is retained. Default: `8h`.
- `retention_check_interval`: The interval at which the task history retention is checked. Default: `1m`.
- `captured_output`: The level of output captured for tasks. `none` or `truncated`. Default: `none`. `truncated` captures the first 3 rows of the result set for `sql_query` and `nsql_query` task types. Other task types currently capture the entire output even in truncated mode.

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
