# Task History

The Spice runtime stores information about completed tasks in the `spice.runtime.task_history` table. A task is a single unit of execution within the runtime, such as a SQL query or an AI chat completion (see Task Types below). Tasks can be nested, and the runtime will record the parent-child relationship between tasks.

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

### Task Types

The following top-level task types are currently recorded:

| Task Type             | Description                   | CLI Command    |
| --------------------- | ----------------------------- | -------------- |
| `sql_query`           | SQL Query                     | `spice sql`    |
| `nsql_query`          | Natural Language to SQL Query |                |
| `ai_chat`             | AI Chat Completion            | `spice chat`   |
| `vector_search`       | Vector Search                 | `spice search` |
| `accelerated_refresh` | Accelerated Table Refresh     |                |
| `text_embed`          | Text Embedding                |                |

### Configuration

Set the following parameters in the `runtime.task_history` section of the `spicepod.yaml` file to configure task history:

* `enabled`: Enable or disable task history. Default: `true`.
* `retention_period`: The duration for which task history data is retained. Default: `8h`.
* `retention_check_interval`: The interval at which the task history retention is checked. Default: `1m`.
* `captured_output`: The level of output captured for tasks. `none` or `truncated`. Default: `none`. `truncated` captures the first 3 rows of the result set for `sql_query` and `nsql_query` task types. Other task types currently capture the entire output even in truncated mode.

#### Examples

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

### Table Schema

| Column Name             | Data Type                   | Is Nullable | Description                                                                    |
| ----------------------- | --------------------------- | ----------- | ------------------------------------------------------------------------------ |
| trace\_id               | Utf8                        | NO          | Unique identifier for the entire trace this task happened in                   |
| span\_id                | Utf8                        | NO          | Unique identifier for this specific task within the trace                      |
| parent\_span\_id        | Utf8                        | YES         | Identifier of the parent task, if any                                          |
| task                    | Utf8                        | NO          | Name or description of the task being performed (e.g. `sql_query`)             |
| input                   | Utf8                        | NO          | Input data or parameters for the task                                          |
| captured\_output        | Utf8                        | YES         | Output or result of the task, if available                                     |
| start\_time             | Timestamp(Nanosecond, None) | NO          | Time when the task started                                                     |
| end\_time               | Timestamp(Nanosecond, None) | NO          | Time when the task ended                                                       |
| execution\_duration\_ms | Float64                     | NO          | Duration of the task execution in milliseconds                                 |
| error\_message          | Utf8                        | YES         | Error message if the task failed, otherwise null                               |
| labels                  | Map(Utf8, Utf8)             | NO          | Key-value pairs for additional metadata or attributes associated with the task |

### Example Queries

#### Retrieve all tasks within a specific timeframe

```sql
SELECT 
    trace_id,
    span_id,
    task,
    start_time,
    end_time,
    execution_duration_ms,
    error_message
FROM spice.runtime.task_history
WHERE start_time >= NOW() - INTERVAL '10 MINUTES'
  AND end_time <= NOW();
```

Example output:

```console
+----------------------------------+------------------+---------------------+----------------------------+----------------------------+-----------------------+---------------------------------------------------------------------------------------------+
| trace_id                         | span_id          | task                | start_time                 | end_time                   | execution_duration_ms | error_message                                                                               |
+----------------------------------+------------------+---------------------+----------------------------+----------------------------+-----------------------+---------------------------------------------------------------------------------------------+
| 687e0970f8c49d19c5a08764ea2d4dc1 | f4f52ed29db8b151 | text_embed          | 2024-11-25T05:39:37.444749 | 2024-11-25T05:39:53.577195 | 16132.446000000002    |                                                                                             |
| 687e0970f8c49d19c5a08764ea2d4dc1 | e47b17bd9fd9fe37 | accelerated_refresh | 2024-11-25T05:39:31.112504 | 2024-11-25T05:39:53.579933 | 22467.429             |                                                                                             |
| 1e881188e5fd252b26adb8a8d838efb8 | 532b0019ad778094 | sql_query           | 2024-11-25T05:40:38.864982 | 2024-11-25T05:40:38.871090 | 6.108                 |                                                                                             |
| 2ee1c700b450034bb6c2da3de2e2386c | 235dafed1e7d8c02 | sql_query           | 2024-11-25T05:39:38.249113 | 2024-11-25T05:39:39.387258 | 1138.145              |                                                                                             |
| 20e75df9ea77ba1c8cb99a2632cdd091 | d07551cd172ffa80 | sql_query           | 2024-11-25T05:39:39.458135 | 2024-11-25T05:39:39.482181 | 24.046000000000003    |                                                                                             |
| ca1d470b12191726b61d825df6f2ce2a | 65597a0bc0a4fde3 | sql_query           | 2024-11-25T05:39:39.675726 | 2024-11-25T05:39:39.822479 | 146.753               |                                                                                             |
| ac5abd8bfec7e5aa7c19fc84772c55f1 | 316622ac359e3c00 | sql_query           | 2024-11-25T05:39:39.872946 | 2024-11-25T05:39:39.872994 | 0.048                 | This feature is not implemented: The context currently only supports a single SQL statement |
| 1c640298e248ba297a12b1e3b59fffc7 | 031c3a25dc56d8e9 | sql_query           | 2024-11-25T05:39:40.467032 | 2024-11-25T05:39:40.486156 | 19.124                |                                                                                             |
| 2c4d9abee740ced8ae423e0eb4fcff6b | a324b699b8bcf338 | sql_query           | 2024-11-25T05:39:40.525506 | 2024-11-25T05:39:40.525526 | 0.02                  | This feature is not implemented: The context currently only supports a single SQL statement |
| e5ed7f7a98e62f493ef8af2e0cd7734e | e84c30862a546bb5 | sql_query           | 2024-11-25T05:39:40.560891 | 2024-11-25T05:39:40.560911 | 0.02                  | This feature is not implemented: The context currently only supports a single SQL statement |
| d471f83092a95bde8663438cda74627f | 3dd9c4d4ebff4cb9 | sql_query           | 2024-11-25T05:39:40.600892 | 2024-11-25T05:39:40.647092 | 46.199999999999996    |                                                                                             |
| 701874d7282dd47791e7519b343a9694 | 5dacf75c4537ee0e | accelerated_refresh | 2024-11-25T05:39:30.452534 | 2024-11-25T05:39:30.452900 | 0.366                 |                                                                                             |
| 2e6b672a49a8cd5f0862a760661dc846 | f813941e0699e783 | accelerated_refresh | 2024-11-25T05:39:30.848425 | 2024-11-25T05:39:30.857242 | 8.817                 |                                                                                             |
| 18d76b6389898cc5253a49294607477d | cc0d06a4e69cbcd5 | health              | 2024-11-25T05:39:30.451626 | 2024-11-25T05:39:31.563876 | 1112.25               |                                                                                             |
| c75af81360e8962639faa64e6804b830 | 1ea2c95b243a5717 | accelerated_refresh | 2024-11-25T05:39:31.036470 | 2024-11-25T05:39:31.607845 | 571.375               |                                                                                             |
| 817d88778e91322640414263779ce7f1 | 513a58d83f0416a7 | accelerated_refresh | 2024-11-25T05:39:30.998455 | 2024-11-25T05:39:32.076359 | 1077.904              |                                                                                             |
| 3c507ee30211e6fab7d8a2eaf686e451 | d9be117925fb6d42 | accelerated_refresh | 2024-11-25T05:39:31.061851 | 2024-11-25T05:39:32.078412 | 1016.561              |                                                                                             |
| aa6010405a12a14b6afaf76e9fabedb8 | 1f50a2b177003c54 | accelerated_refresh | 2024-11-25T05:39:30.933543 | 2024-11-25T05:39:32.476197 | 1542.654              |                                                                                             |
| 3c75d16b6b4b8da98c551d115e1c049c | 9a16dc065a95236a | sql_query           | 2024-11-25T05:42:27.386754 | 2024-11-25T05:42:27.386859 | 0.10500000000000001   | SQL error: ParserError("Expected: an SQL statement, found: ELECT")                          |
+----------------------------------+------------------+---------------------+----------------------------+----------------------------+-----------------------+---------------------------------------------------------------------------------------------+
```

#### Retrieve the most recent error messages

```sql
SELECT 
    trace_id, 
    task, 
    error_message, 
    SUBSTRING(input, 1, 100) AS input_preview, 
    start_time
FROM spice.runtime.task_history
WHERE error_message IS NOT NULL
ORDER BY start_time DESC
LIMIT 5;
```

```console
+----------------------------------+-----------+---------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+----------------------------+
| trace_id                         | task      | error_message                                                                               | input_preview                                                                                        | start_time                 |
+----------------------------------+-----------+---------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+----------------------------+
| 352539e75fdb1a3d5fc3b48bfd4b4bae | sql_query | Error during planning: Invalid function 'date'.                                             | SELECT DATE(start_time) AS task_date, COUNT(*) AS task_count                                         | 2024-11-25T06:17:40.573970 |
|                                  |           | Did you mean 'tanh'?                                                                        | FROM spice.runtime.task_history                                                                      |                            |
|                                  |           |                                                                                             | GROUP B                                                                                              |                            |
| f6672d562ad97dde0bb4db428723461f | sql_query | This feature is not implemented: The context currently only supports a single SQL statement | with ssales as (select c_last_name       ,c_first_name       ,s_store_name       ,ca_state       ,s_ | 2024-11-25T06:06:39.800900 |
| b16fa36e5a2f7f119fc3834875f6bdee | sql_query | This feature is not implemented: The context currently only supports a single SQL statement | with frequent_ss_items as  (select substr(i_item_desc,1,30) itemdesc,i_item_sk item_sk,d_date soldda | 2024-11-25T06:06:39.760532 |
| 8d126ea506a374c0c6239c11ee5cbe5a | sql_query | This feature is not implemented: The context currently only supports a single SQL statement | with  cross_items as  (select i_item_sk ss_item_sk  from item,  (select iss.i_brand_id brand_id      | 2024-11-25T06:06:39.118422 |
| 198a9dcc496f0435cff69de61cc07874 | sql_query | This feature is not implemented: The context currently only supports a single SQL statement | with ssales as (select c_last_name       ,c_first_name       ,s_store_name       ,ca_state       ,s_ | 2024-11-25T06:04:11.317419 |
+----------------------------------+-----------+---------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+----------------------------+
```

#### Summarize number of tasks by type

```sql
SELECT task, COUNT(*) AS task_count, AVG(execution_duration_ms) AS avg_duration_ms
FROM spice.runtime.task_history
GROUP BY task
ORDER BY task_count DESC;
```

Example output:

```console
+-------------------------------+------------+---------------------+
| task                          | task_count | avg_duration_ms     |
+-------------------------------+------------+---------------------+
| sql_query                     | 65         | 55.10198461538462   |
| accelerated_refresh           | 27         | 749.1187407407407   |
| ai_completion                 | 9          | 5026.337888888888   |
| tool_use::list_datasets       | 4          | 0.16899999999999998 |
| text_embed                    | 4          | 3341.08975          |
| ai_chat                       | 4          | 7151.03675          |
| vector_search                 | 3          | 384.376             |
| tool_use::document_similarity | 3          | 385.0406666666667   |
| tool_use::get_readiness       | 1          | 0.12999999999999998 |
| tool_use::sample_data         | 1          | 2.275               |
| health                        | 1          | 661.0169999999999   |
+-------------------------------+------------+---------------------+
```

#### Identify the longest-running tasks

```sql
SELECT 
    task, 
    trace_id, 
    parent_span_id, 
    execution_duration_ms,
    labels 
FROM spice.runtime.task_history
ORDER BY execution_duration_ms DESC
LIMIT 10;
```

Example output:

```console
+---------------------+----------------------------------+------------------+-----------------------+------------------------------------------------------------------------------------------------+
| task                | trace_id                         | parent_span_id   | execution_duration_ms | labels                                                                                         |
+---------------------+----------------------------------+------------------+-----------------------+------------------------------------------------------------------------------------------------+
| accelerated_refresh | d9c38c7e58a02ec939240385a4a25a04 |                  | 1093711.474           | {sql: SELECT * FROM react.issues}                                                              |
| ai_chat             | 7a6427313880942316bf3018cd23a198 |                  | 17202.836000000003    | {model: gpt-4o}                                                                                |
| ai_completion       | 7a6427313880942316bf3018cd23a198 | 59b1fd88c8397e3f | 17202.475             | {model: gpt-4o, total_tokens: 2673, prompt_tokens: 1807, completion_tokens: 866, stream: true} |
| accelerated_refresh | 96758c1132164204a68e1a7234a06cda |                  | 15660.023000000001    | {sql: SELECT * FROM react.docs}                                                                |
| text_embed          | 96758c1132164204a68e1a7234a06cda | 109c489b24602356 | 12406.787             | {outputs_produced: 2086}                                                                       |
| ai_chat             | b2a69503a1b83215603ead321eea6f61 |                  | 6445.162              | {model: gpt-4o}                                                                                |
| ai_completion       | b2a69503a1b83215603ead321eea6f61 | 95411c59fc9c8cb8 | 6444.1990000000005    | {prompt_tokens: 1454, stream: true, total_tokens: 1484, model: gpt-4o, completion_tokens: 30}  |
| ai_completion       | b2a69503a1b83215603ead321eea6f61 | 95411c59fc9c8cb8 | 5608.6359999999995    | {prompt_tokens: 1529, total_tokens: 1559, model: gpt-4o, completion_tokens: 30, stream: true}  |
| text_embed          | 65880ecfc884a41555ac4d21ceef9aef |                  | 5143.494000000001     | {outputs_produced: 1}                                                                          |
| text_embed          | f51e5e9d4e26de31a2f7d5e9286dd8f4 |                  | 4769.832              | {outputs_produced: 1}                                                                          |
+---------------------+----------------------------------+------------------+-----------------------+------------------------------------------------------------------------------------------------+
```

#### Retrieve details of all tasks associated with a specific trace

```sql
SELECT 
    task, 
    trace_id, 
    parent_span_id, 
    span_id, 
    execution_duration_ms,
    start_time, 
    end_time,
    SUBSTRING(input, 1, 100) AS input_preview,
    SUBSTRING(captured_output, 1, 100) AS output_preview,
    error_message,
    labels
FROM spice.runtime.task_history
WHERE trace_id = 'b2a69503a1b83215603ead321eea6f61'
ORDER BY start_time;
```

Example output:

```console
+-------------------------------+----------------------------------+------------------+------------------+-----------------------+----------------------------+----------------------------+------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------+
| task                          | trace_id                         | parent_span_id   | span_id          | execution_duration_ms | start_time                 | end_time                   | input_preview                                                                                        | output_preview                                                                                       | error_message                                                                                                                                      | labels                                                                                                                                        |
+-------------------------------+----------------------------------+------------------+------------------+-----------------------+----------------------------+----------------------------+------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------+
| ai_chat                       | b2a69503a1b83215603ead321eea6f61 |                  | 95411c59fc9c8cb8 | 6445.162              | 2024-11-25T06:03:31.197980 | 2024-11-25T06:03:37.643142 | {"messages":[{"role":"user","content":"how to install react"},{"role":"user","content":"top 3 recent | It seems that the dataset containing the recent React issues is currently being refreshed and is not |                                                                                                                                                    | {model: gpt-4o}                                                                                                                               |
| tool_use::list_datasets       | b2a69503a1b83215603ead321eea6f61 | 95411c59fc9c8cb8 | aa5ba649da3f0581 | 0.367                 | 2024-11-25T06:03:31.198139 | 2024-11-25T06:03:31.198506 |                                                                                                      | [{"can_search_documents":true,"description":"React.js documentation and reference, from https://reac |                                                                                                                                                    | {tool: list_datasets}                                                                                                                         |
| ai_completion                 | b2a69503a1b83215603ead321eea6f61 | 95411c59fc9c8cb8 | 8bd67a43da1b4312 | 6444.1990000000005    | 2024-11-25T06:03:31.198906 | 2024-11-25T06:03:37.643105 | {"messages":[{"role":"assistant","tool_calls":[{"id":"initial_list_datasets","type":"function","func |                                                                                                      |                                                                                                                                                    | {prompt_tokens: 1454, stream: true, total_tokens: 1484, model: gpt-4o, completion_tokens: 30}                                                 |
| tool_use::document_similarity | b2a69503a1b83215603ead321eea6f61 | 95411c59fc9c8cb8 | 49b25ff51580d4fa | 140.337               | 2024-11-25T06:03:31.893913 | 2024-11-25T06:03:32.034250 | {"text":"how to install react","datasets":["spice.react.issues"],"limit":3}                          |                                                                                                      | Error occurred interacting with datafusion: Failed to execute query: External error: Acceleration not ready; loading initial data for react.issues | {tool: document_similarity}                                                                                                                   |
| vector_search                 | b2a69503a1b83215603ead321eea6f61 | 49b25ff51580d4fa | 9feb8c9a54079cbd | 140.24200000000002    | 2024-11-25T06:03:31.894    | 2024-11-25T06:03:32.034242 | how to install react                                                                                 |                                                                                                      | Error occurred interacting with datafusion: Failed to execute query: External error: Acceleration not ready; loading initial data for react.issues | {limit: 3, tables: spice.react.issues}                                                                                                        |
| text_embed                    | b2a69503a1b83215603ead321eea6f61 | 9feb8c9a54079cbd | 7f18fd8d96a1baeb | 122.771               | 2024-11-25T06:03:31.894072 | 2024-11-25T06:03:32.016843 | "how to install react"                                                                               |                                                                                                      |                                                                                                                                                    | {outputs_produced: 1}                                                                                                                         |
| sql_query                     | b2a69503a1b83215603ead321eea6f61 | 9feb8c9a54079cbd | 025f6b1e5cd502a6 | 16.892                | 2024-11-25T06:03:32.017320 | 2024-11-25T06:03:32.034212 | WITH ranked_docs as (                                                                                |                                                                                                      | Failed to execute query: External error: Acceleration not ready; loading initial data for react.issues                                             | {error_code: QueryExecutionError, protocol: Internal, query_execution_duration_ms: 8.20325, datasets: spice.react.issues, rows_produced: 0}   |
|                               |                                  |                  |                  |                       |                            |                            |                 SELECT id, dist, offset FROM (                                                       |                                                                                                      |                                                                                                                                                    |                                                                                                                                               |
|                               |                                  |                  |                  |                       |                            |                            |                     SELECT                                                                           |                                                                                                      |                                                                                                                                                    |                                                                                                                                               |
|                               |                                  |                  |                  |                       |                            |                            |                                                                                                      |                                                                                                      |                                                                                                                                                    |                                                                                                                                               |
| ai_completion                 | b2a69503a1b83215603ead321eea6f61 | 95411c59fc9c8cb8 | 1b2a3273a1dc4cdf | 5608.6359999999995    | 2024-11-25T06:03:32.034451 | 2024-11-25T06:03:37.643087 | {"messages":[{"role":"assistant","tool_calls":[{"id":"initial_list_datasets","type":"function","func |                                                                                                      |                                                                                                                                                    | {prompt_tokens: 1529, total_tokens: 1559, model: gpt-4o, completion_tokens: 30, stream: true}                                                 |
| tool_use::sample_data         | b2a69503a1b83215603ead321eea6f61 | 95411c59fc9c8cb8 | 8bd10431fb18df87 | 2.275                 | 2024-11-25T06:03:33.039583 | 2024-11-25T06:03:33.041858 | TopNSample({"dataset":"spice.react.issues","limit":3,"order_by":"created_at DESC"})                  |                                                                                                      |                                                                                                                                                    | {sample_method: top_n_sample, tool: top_n_sample}                                                                                             |
| sql_query                     | b2a69503a1b83215603ead321eea6f61 | 8bd10431fb18df87 | f1b2e06225aa2ba3 | 2.193                 | 2024-11-25T06:03:33.039625 | 2024-11-25T06:03:33.041818 | SELECT * FROM spice.react.issues ORDER BY created_at DESC LIMIT 3                                    |                                                                                                      | Failed to execute query: External error: Acceleration not ready; loading initial data for react.issues                                             | {query_execution_duration_ms: 1.5519999, datasets: spice.react.issues, protocol: Internal, error_code: QueryExecutionError, rows_produced: 0} |
| ai_completion                 | b2a69503a1b83215603ead321eea6f61 | 95411c59fc9c8cb8 | b649e4bbe8aac7a3 | 4601.02               | 2024-11-25T06:03:33.042037 | 2024-11-25T06:03:37.643057 | {"messages":[{"role":"assistant","tool_calls":[{"id":"initial_list_datasets","type":"function","func |                                                                                                      |                                                                                                                                                    | {prompt_tokens: 1599, completion_tokens: 11, model: gpt-4o, stream: true, total_tokens: 1610}                                                 |
| tool_use::get_readiness       | b2a69503a1b83215603ead321eea6f61 | 95411c59fc9c8cb8 | f40f0b4cd608de8b | 0.12999999999999998   | 2024-11-25T06:03:33.499867 | 2024-11-25T06:03:33.499997 |                                                                                                      | {"dataset:call_center":"Ready","dataset:catalog_page":"Ready","dataset:catalog_returns":"Ready","dat |                                                                                                                                                    | {tool: get_readiness}                                                                                                                         |
| ai_completion                 | b2a69503a1b83215603ead321eea6f61 | 95411c59fc9c8cb8 | e018a56742b5064f | 4142.789              | 2024-11-25T06:03:33.500219 | 2024-11-25T06:03:37.643008 | {"messages":[{"role":"assistant","tool_calls":[{"id":"initial_list_datasets","type":"function","func |                                                                                                      |                                                                                                                                                    | {stream: true, completion_tokens: 254, prompt_tokens: 1920, model: gpt-4o, total_tokens: 2174}                                                |
+-------------------------------+----------------------------------+------------------+------------------+-----------------------+----------------------------+----------------------------+------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------+
```

#### Retrieve details of most recent chat query

```sql
SELECT 
    task, 
    trace_id, 
    execution_duration_ms,
    start_time, 
    SUBSTRING(input, 1, 100) AS input_preview,
    SUBSTRING(captured_output, 1, 100) AS output_preview,
    error_message,
    labels
FROM spice.runtime.task_history
WHERE trace_id = (
    SELECT trace_id
    FROM spice.runtime.task_history
    WHERE task = 'ai_chat'
    ORDER BY start_time DESC
    LIMIT 1
)
ORDER BY start_time;
```

```console
-----------------+------------------------------------------------------------------------------------------------------+---------------+--------------------------------------------------------------------------------------------------------------+
| task                          | trace_id                         | execution_duration_ms | start_time                 | input_preview                                                                                        | output_preview                                                                                       | error_message | labels                                                                                                       |
+-------------------------------+----------------------------------+-----------------------+----------------------------+------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+---------------+--------------------------------------------------------------------------------------------------------------+
| ai_chat                       | bb2de94b6f575b6c001f39cfded8bff4 | 5665.4169999999995    | 2024-11-25T07:02:43.240005 | {"messages":[{"role":"user","content":"how to install react"},{"role":"user","content":"top 3 recent | Here are the three most recent issues related to React, along with their summaries and links:        |               | {model: gpt-4o}                                                                                              |
|                               |                                  |                       |                            |                                                                                                      |                                                                                                      |               |                                                                                                              |
|                               |                                  |                       |                            |                                                                                                      | 1. **                                                                                                |               |                                                                                                              |
| tool_use::list_datasets       | bb2de94b6f575b6c001f39cfded8bff4 | 0.157                 | 2024-11-25T07:02:43.240048 |                                                                                                      | [{"can_search_documents":true,"description":"React.js documentation and reference, from https://reac |               | {tool: list_datasets}                                                                                        |
| ai_completion                 | bb2de94b6f575b6c001f39cfded8bff4 | 5664.964              | 2024-11-25T07:02:43.240416 | {"messages":[{"role":"assistant","tool_calls":[{"id":"initial_list_datasets","type":"function","func |                                                                                                      |               | {prompt_tokens: 2688, total_tokens: 2716, completion_tokens: 28, model: gpt-4o, stream: true}                |
| tool_use::document_similarity | bb2de94b6f575b6c001f39cfded8bff4 | 710.9609999999999     | 2024-11-25T07:02:44.344935 | {"text":"recent issues","datasets":["spice.react.issues"],"limit":3}                                 |                                                                                                      |               | {tool: document_similarity}                                                                                  |
| vector_search                 | bb2de94b6f575b6c001f39cfded8bff4 | 710.842               | 2024-11-25T07:02:44.345018 | recent issues                                                                                        | {Full { catalog: "spice", schema: "react", table: "issues" }: VectorSearchTableResult { data: [Recor |               | {limit: 3, tables: spice.react.issues}                                                                       |
| text_embed                    | bb2de94b6f575b6c001f39cfded8bff4 | 562.453               | 2024-11-25T07:02:44.345072 | "recent issues"                                                                                      |                                                                                                      |               | {outputs_produced: 1}                                                                                        |
| sql_query                     | bb2de94b6f575b6c001f39cfded8bff4 | 147.672               | 2024-11-25T07:02:44.908148 | WITH ranked_docs as (                                                                                | [{"title_chunk":"app:lintVitalReleaseBug issu","id":"I_kwDOAJy2Ks47fqsI","title":"app:lintVitalRelea |               | {datasets: spice.react.issues, protocol: Internal, query_execution_duration_ms: 139.69496, rows_produced: 3} |
|                               |                                  |                       |                            |                 SELECT id, dist, offset FROM (                                                       |                                                                                                      |               |                                                                                                              |
|                               |                                  |                       |                            |                     SELECT                                                                           |                                                                                                      |               |                                                                                                              |
|                               |                                  |                       |                            |                                                                                                      |                                                                                                      |               |                                                                                                              |
| ai_completion                 | bb2de94b6f575b6c001f39cfded8bff4 | 3849.3140000000003    | 2024-11-25T07:02:45.055985 | {"messages":[{"role":"assistant","tool_calls":[{"id":"initial_list_datasets","type":"function","func |                                                                                                      |               | {model: gpt-4o, total_tokens: 3240, stream: true, completion_tokens: 271, prompt_tokens: 2969}               |
+-------------------------------+----------------------------------+-----------------------+----------------------------+------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------+---------------+--------------------------------------------------------------------------------------------------------------+
```

#### Retrieve Recent Queries for Specific Dataset

```sql
SELECT 
    task,
    start_time,
    execution_duration_ms,
    SUBSTRING(input, 1, 100) AS input_preview, 
    error_message, 
    labels
FROM spice.runtime.task_history
WHERE 'catalog_sales' = ANY(string_to_array(labels['datasets'], ','))
ORDER BY start_time DESC
LIMIT 5;
```

Example output:

```console
+-----------+----------------------------+-----------------------+------------------------------------------------------------------------------------------------------+---------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| task      | start_time                 | execution_duration_ms | input_preview                                                                                        | error_message | labels                                                                                                                                                                            |
+-----------+----------------------------+-----------------------+------------------------------------------------------------------------------------------------------+---------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| sql_query | 2024-11-25T07:15:31.278018 | 19.424                | with ss as (  select           i_manufact_id,sum(ss_ext_sales_price) total_sales  from  	store_sales |               | {accelerated: true, protocol: FlightSQL, query_execution_duration_ms: 18.765831, rows_produced: 15, datasets: store_sales,customer_address,item,date_dim,web_sales,catalog_sales} |
| sql_query | 2024-11-25T07:15:31.233147 | 1.661                 | select  sum(cs_ext_discount_amt)  as "excess discount amount" from    catalog_sales    ,item    ,dat |               | {query_execution_duration_ms: 1.380667, accelerated: true, datasets: date_dim,catalog_sales,item, rows_produced: 1, protocol: FlightSQL}                                          |
| sql_query | 2024-11-25T07:15:30.889905 | 30.101                | select      i_item_id     ,i_item_desc     ,s_store_id     ,s_store_name     ,stddev_samp(ss_quantit |               | {query_execution_duration_ms: 29.511086, datasets: store_sales,store,item,date_dim,store_returns,catalog_sales, rows_produced: 0, protocol: FlightSQL, accelerated: true}         |
| sql_query | 2024-11-25T07:15:30.658339 | 24.942                | select  i_item_id,         avg(cs_quantity) agg1,         avg(cs_list_price) agg2,         avg(cs_co |               | {query_execution_duration_ms: 24.620039, protocol: FlightSQL, datasets: item,date_dim,catalog_sales,promotion,customer_demographics, accelerated: true, rows_produced: 73}        |
| sql_query | 2024-11-25T07:15:30.574257 | 40.908                | select  i_item_id  ,i_item_desc  ,s_store_id  ,s_store_name  ,min(ss_net_profit) as store_sales_prof |               | {protocol: FlightSQL, rows_produced: 0, accelerated: true, datasets: store_returns,date_dim,store,store_sales,item,catalog_sales, query_execution_duration_ms: 40.29496}          |
+-----------+----------------------------+-----------------------+------------------------------------------------------------------------------------------------------+---------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

