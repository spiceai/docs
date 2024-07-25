---
title: "Query History"
sidebar_label: "Query History"
pagination_prev: 'reference/index'
pagination_next: null
sidebar_position: 6
---

The Spice runtime stores information about completed queries in the `spice.runtime.query_history` table. Each query executed has a row in this table, and the data is retained for one day. Use a `SELECT` query to return information about each query as shown in this example:

```sql
SELECT
  *
FROM
  *
spice.runtime.query_history
LIMIT
  100;
```

## Columns in spice.runtime.query_history

| Column Name       | Data Type                   | Description |
|-------------------|-----------------------------|-------------|
| query_id          | Utf8                        | The unique identifier of the SQL query. |
| schema            | Utf8                        | The Schema of the tables queried.       |
| sql               | Utf8                        | The query text of the SQL statment.     |
| nsql              | Utf8                        | Optional. If the query was generated through the natural langauge to sql api, the natural language text of the query. |
| start_time        | Timestamp(Nanosecond, None) | The query execution start time (UTC).    |
| end_time          | Timestamp(Nanosecond, None) | The query execution end time (UTC).          |
| execution_time    | Float32                     | The total execution time in seconds.          |
| execution_status  | Int8                        | The [status code](query_history.md#execution-status-codes) returned from query execution.     |
| rows_produced     | UInt64                      | The total number of rows returned from the query.           |
| results_cache_hit | Boolean                     | True if the result from the query was returned from the results cache, otherwise false.          |
| error_message     | Utf8                        | The error message that was returned        |

### Execution Status Codes

| Value | Status           | Description |
|-------|-----------------------|-------------|
| 0     | Success               | The query completed with no errors. |
| -10   | Syntax Error          | The SQL query text provided has a syntax error.  For instance, a misspeled SQL statement was in the query. |
| -20   | Query Planning Error  | An error occurred while mapping the SQL query to a query plan. For instance, attempting to call a function that does not exist, or providing a query with unsupported types. |
| -30   | Query Execution Error | An error occurred during en execution due to a malformed input. For instance, passing malformed arguments to a SQL method. |
| -120  | Internal Error        | An internal error occurred within Spice. |
