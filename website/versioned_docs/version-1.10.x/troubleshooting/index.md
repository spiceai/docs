---
title: Troubleshooting Spice
sidebar_label: Troubleshooting
sidebar_position: 99
description: 'Review and debug runtime tasks, logs, and diagnostic steps in Spice.'
pagination_prev: null
pagination_next: null
tags:
  - troubleshooting
  - debugging
---

Spice provides a number of methods to support debugging Runtime operations, including capturing verbose logs and reviewing task history in SQL queries or AI completions.

## Verbose Logging

Running `spiced` with `--verbose` produces immediate debug logs for diagnosing issues in real time. Running `spiced` with `--very-verbose` captures trace logs, which are useful for examining function outputs and other low-level details. The verbosity flags are also available for `spice run`, providing consistent behavior during local testing or production operation.

Example `--verbose` output:

```console
2025-02-07T00:24:46.590576Z DEBUG runtime::secrets: Found secret replacement: Store name: secrets, Key: OPENAI_KEY, Span: 0..21
2025-02-07T00:24:46.592381Z DEBUG runtime::accelerated_table::refresh: Starting scheduled refresh
2025-02-07T00:24:46.592664Z DEBUG runtime::accelerated_table::refresh_task: Loading data for dataset runtime.task_history
2025-02-07T00:24:46.592844Z DEBUG runtime::accelerated_table: [retention] Evicting data for runtime.task_history where start_time < 2025-02-06T16:24:46+00:00...
2025-02-07T00:24:46.592859Z DEBUG runtime::accelerated_table: [retention] Expr BinaryExpr(BinaryExpr { left: Cast(Cast { expr: Column(Column { relation: None, name: "start_time" }), data_type: Timestamp(Nanosecond, None) }), op: Lt, right: Literal(TimestampNanosecond(1738859086592808104, None)) })
2025-02-07T00:24:46.595460Z DEBUG runtime::accelerated_table::refresh_task: Loaded 0 rows for dataset runtime.task_history in 2ms.
2025-02-07T00:24:46.595591Z DEBUG runtime::accelerated_table::refresh_task_runner: Refresh task successfully completed for dataset runtime.task_history
2025-02-07T00:24:46.595623Z DEBUG runtime::accelerated_table::refresh: Received refresh task completion callback: Ok(())
2025-02-07T00:24:46.599033Z DEBUG runtime::model::wrapper: Ignoring unknown default key: api_key
2025-02-07T00:24:46.599526Z DEBUG runtime::embeddings::table: Column 'content' does not have needed embeddings in base table. Will augment with model xl_embed.
2025-02-07T00:24:46.601038Z DEBUG runtime::accelerated_table: [retention] Evicted 0 records for runtime.task_history
2025-02-07T00:24:46.790058Z DEBUG runtime::datafusion: Creating accelerated table Dataset { <... dataset configuration ...> }
2025-02-07T00:24:46.869373Z  INFO runtime::init::dataset: Dataset emails registered (*****), acceleration (duckdb), results cache enabled.
2025-02-07T00:24:46.870623Z DEBUG runtime::accelerated_table::refresh: Starting scheduled refresh
2025-02-07T00:24:46.870857Z  INFO runtime::accelerated_table::refresh_task: Loading data for dataset emails
2025-02-07T00:24:49.087869Z  INFO runtime::init::model: Model [openai] deployed, ready for inferencing
2025-02-07T00:24:52.196121Z  INFO runtime::accelerated_table::refresh_task: Loaded 10 rows (1.77 MiB) for dataset emails in 5s 325ms.
2025-02-07T00:24:52.196303Z DEBUG runtime::accelerated_table::refresh_task_runner: Refresh task successfully completed for dataset emails
2025-02-07T00:24:52.196344Z DEBUG runtime::accelerated_table::refresh: Received refresh task completion callback: Ok(())
```

Example `--very-verbose` output:

```console
2025-02-07T00:26:16.153386Z TRACE runtime::embeddings::table: For `EmbeddingTable`, additional embedding columns to compute: ["content"]
2025-02-07T00:26:16.433905Z TRACE runtime::embeddings::execution_plan: Of embedding columns: ["content"], only need to create embeddings for columns: ["content"]
2025-02-07T00:26:16.433990Z TRACE runtime::embeddings::execution_plan: Embedding column 'content' with model xl_embed
2025-02-07T00:26:16.434713Z DEBUG datafusion_table_providers::duckdb::write: Deleting all data from table.
2025-02-07T00:26:18.368600Z DEBUG hyper_util::client::legacy::pool: reuse idle connection for ("https", api.openai.com)
2025-02-07T00:26:18.369335Z DEBUG hyper_util::client::legacy::pool: pooling idle connection for ("https", api.openai.com)
2025-02-07T00:26:18.369652Z  INFO runtime::init::model: Model [openai] deployed, ready for inferencing
2025-02-07T00:26:21.311004Z DEBUG hyper_util::client::legacy::pool: pooling idle connection for ("https", api.openai.com)
2025-02-07T00:26:21.426867Z TRACE runtime::embeddings::execution_plan: Successfully embedded column 'content' with chunking
2025-02-07T00:26:21.426981Z TRACE runtime::accelerated_table::refresh_task: [refresh] Received 10 rows for dataset: emails
```

For more information, view the [tracing documentation](../cli/tracing)

## Use `spice trace` for task tracing

Use the `spice trace ai_chat` command to inspect processes involved in generating AI chat responses. The `spice trace` command supports tracing any task type, like `spice trace sql_query`:

```console
[d06e1fb508e009eb] (    1.84ms) sql_query
```

This step is helpful for reviewing any tool usage or tasks invoked during AI completions, providing more information on the steps an AI took to arrive at a result.

For example, running a chat using the `taxi_trips` dataset:

```console
Using model: openai
chat> When was the last taxi trip completed?
The last taxi trip was completed on January 12, 2024, at 12:49:45 PM.

Time: 4.24s (first token 3.85s). Tokens: 826. Prompt: 793. Completion: 33 (85.50/s).
```

To inspect the last chat, run `spice trace ai_chat`, producing an AI chat trace output:

```console
[8153c6563c7f9d88] ( 4234.38ms) ai_chat
  ├── [8656eaacb6c7a57d] (    0.13ms) tool_use::list_datasets
  ├── [3873d8257d8ea30c] ( 4233.47ms) ai_completion
  ├── [02f2def1712f1473] (    1.11ms) tool_use::sql
  │ └── [1e4e5f4e79e74e5e] (    0.91ms) sql_query
  ├── [8d1db4d4db80c021] ( 3185.46ms) ai_completion
  ├── [0c7b421812ca8180] (    0.17ms) tool_use::table_schema
  ├── [a49553aca9f19384] ( 2166.24ms) ai_completion
  ├── [ec69ce81b3d71b1a] (    3.38ms) tool_use::sql
  │ └── [24769e9b068656ed] (    3.33ms) sql_query
  └── [6ff16c04ecf6f6ff] (  961.39ms) ai_completion
```

In this example, the trace logs show that the model attempted an SQL query twice - getting the first query incorrect, due to a syntax issue in the SQL the model generated. Before running the second query, it retrieved the table schema - which it used for the second query to successfully retrieve the last taxi trip time.

For more information, view the [`spice trace` documentation](../cli/reference/trace).

## Reviewing the Task History

Query the `task_history` table to review completed tasks handled by the Runtime. Results in this table can include tasks for accelerator refresh, SQL queries, text embedding, AI calls, and more. Reviewing this table can provide information on SQL query issues or other processes that may produce errors.

Example `task_history` query:

```sql
select start_time, end_time, task, captured_output, error_message from runtime.task_history;
```

The `task_history` table also includes start and end times, including execution duration and any error messages during the operation. An example `task_history` output with a failed SQL query:

```console
+-------------------------------+-------------------------------+---------------------+-----------------+-------------------------------------------------------------------+
| start_time                    | end_time                      | task                | captured_output | error_message                                                     |
+-------------------------------+-------------------------------+---------------------+-----------------+-------------------------------------------------------------------+
| 2025-02-07T00:29:13.429351004 | 2025-02-07T00:29:13.432404760 | accelerated_refresh |                 |                                                                   |
| 2025-02-07T00:29:13.429022167 | 2025-02-07T00:29:13.432472389 | accelerated_refresh |                 |                                                                   |
| 2025-02-07T00:29:19.313382657 | 2025-02-07T00:29:19.313648021 | sql_query           |                 | Error during planning: table 'spice.public.not_a_table' not found |
+-------------------------------+-------------------------------+---------------------+-----------------+-------------------------------------------------------------------+
```

For more information, view the [task history documentation](../../reference/task_history)

## Logging Additional Captured Output

Set `runtime.task_history.captured_output` to `truncated` to store summarized SQL query information in the `captured_output` `task_history` column. Enable captured output by running `spiced` with `--set-runtime task_history.captured_output=truncated` or adjusting the Spicepod parameter `runtime.task_history.captured_output`.

Example Spicepod excerpt:

```yaml
runtime:
  task_history:
    captured_output: truncated
```

Example captured output:

```console
+-------------------------------+-------------------------------+---------------------+-------------------------------+---------------+
| start_time                    | end_time                      | task                | captured_output               | error_message |
+-------------------------------+-------------------------------+---------------------+-------------------------------+---------------+
| 2025-02-07T00:17:41.999469156 | 2025-02-07T00:17:42.002922183 | accelerated_refresh |                               |               |
| 2025-02-07T00:17:42.007874330 | 2025-02-07T00:17:44.512541448 | health              |                               |               |
| 2025-02-07T00:17:44.510484956 | 2025-02-07T00:17:48.889947970 | text_embed          |                               |               |
| 2025-02-07T00:17:42.278785968 | 2025-02-07T00:17:48.913729643 | accelerated_refresh |                               |               |
| 2025-02-07T00:17:54.717312222 | 2025-02-07T00:17:54.728507220 | sql_query           | [{"subject":"Hello, world!"}] |               |
+-------------------------------+-------------------------------+---------------------+-------------------------------+---------------+
```

## Capturing SQL Query Plans in Task History

Configure Spice to automatically capture SQL query plans (`EXPLAIN` or `EXPLAIN ANALYZE`) in the task history. This feature captures query execution information asynchronously, storing results in the `captured_output` column for later analysis without impacting query performance.

Configure plan capture using the `runtime.task_history` settings:

```yaml
runtime:
  task_history:
    captured_plan: explain analyze
    min_sql_duration: 5s
    min_plan_duration: 10s
```

### Configuration Parameters

- **`captured_plan`**: Determines the type of plan captured:
  - `none` (default): No plans are captured
  - `explain`: Captures logical and physical query plans
  - `explain analyze`: Captures plans with actual execution metrics
- **`min_sql_duration`**: Minimum query duration before plan capture. Only queries exceeding this threshold generate a plan.
- **`min_plan_duration`**: Minimum plan execution duration before storage. Plans that execute faster than this threshold are discarded.

### Query Examples

Review captured plans for slow queries:

```sql
SELECT
    start_time,
    execution_duration_ms,
    SUBSTRING(input, 1, 80) AS query_preview,
    captured_output
FROM spice.runtime.task_history
WHERE task = 'sql_query'
  AND captured_output IS NOT NULL
ORDER BY execution_duration_ms DESC
LIMIT 5;
```

Plans are captured asynchronously after query completion, ensuring query execution proceeds without blocking. For more details, view the [task history documentation](../../reference/task_history#sql-query-plan-capture).

## SQL Explain Plans

Spice supports generating `EXPLAIN` plans, which can be used to debug SQL that may not be producing the correct result. An explain plan in Spice can provide information about the data sources the SQL will be executed against, including the re-written SQL that will be executed against that data source (if applicable). For example, an explain plan could be used to debug the SQL that is generated and executed against separate federated sources during an SQL query which joins their results (like a PostgreSQL database and a MySQL database).

Generate an explain plan by adding the `EXPLAIN` keyword before the query:

```sql
explain select * from taxi_trips
```

```console
+---------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| plan_type     | plan                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
+---------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| logical_plan  | BytesProcessedNode                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|               |   Federated                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|               |  Projection: taxi_trips.VendorID, taxi_trips.tpep_pickup_datetime, taxi_trips.tpep_dropoff_datetime, taxi_trips.passenger_count, taxi_trips.trip_distance, taxi_trips.RatecodeID, taxi_trips.store_and_fwd_flag, taxi_trips.PULocationID, taxi_trips.DOLocationID, taxi_trips.payment_type, taxi_trips.fare_amount, taxi_trips.extra, taxi_trips.mta_tax, taxi_trips.tip_amount, taxi_trips.tolls_amount, taxi_trips.improvement_surcharge, taxi_trips.total_amount, taxi_trips.congestion_surcharge, taxi_trips.Airport_fee                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
|               |   TableScan: taxi_trips projection=[VendorID, tpep_pickup_datetime, tpep_dropoff_datetime, passenger_count, trip_distance, RatecodeID, store_and_fwd_flag, PULocationID, DOLocationID, payment_type, fare_amount, extra, mta_tax, tip_amount, tolls_amount, improvement_surcharge, total_amount, congestion_surcharge, Airport_fee]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| physical_plan | BytesProcessedExec                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|               |   SchemaCastScanExec                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|               |     VirtualExecutionPlan name=duckdb compute_context=:memory: sql=SELECT taxi_trips.VendorID, taxi_trips.tpep_pickup_datetime, taxi_trips.tpep_dropoff_datetime, taxi_trips.passenger_count, taxi_trips.trip_distance, taxi_trips.RatecodeID, taxi_trips.store_and_fwd_flag, taxi_trips.PULocationID, taxi_trips.DOLocationID, taxi_trips.payment_type, taxi_trips.fare_amount, taxi_trips.extra, taxi_trips.mta_tax, taxi_trips.tip_amount, taxi_trips.tolls_amount, taxi_trips.improvement_surcharge, taxi_trips.total_amount, taxi_trips.congestion_surcharge, taxi_trips.Airport_fee FROM taxi_trips rewritten_sql=SELECT "taxi_trips"."VendorID", "taxi_trips"."tpep_pickup_datetime", "taxi_trips"."tpep_dropoff_datetime", "taxi_trips"."passenger_count", "taxi_trips"."trip_distance", "taxi_trips"."RatecodeID", "taxi_trips"."store_and_fwd_flag", "taxi_trips"."PULocationID", "taxi_trips"."DOLocationID", "taxi_trips"."payment_type", "taxi_trips"."fare_amount", "taxi_trips"."extra", "taxi_trips"."mta_tax", "taxi_trips"."tip_amount", "taxi_trips"."tolls_amount", "taxi_trips"."improvement_surcharge", "taxi_trips"."total_amount", "taxi_trips"."congestion_surcharge", "taxi_trips"."Airport_fee" FROM "taxi_trips" |
|               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
+---------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

## Debugging Sandbox Container

The Spice sandbox container is a minimal container that doesn't include standard Linux tools like `bash`. This can make it difficult to debug issues in the container itself.

### SQL REPL

It's possible to run the SQL REPL from the container to debug SQL queries:

```console
docker exec -it <container_id> spiced --repl
```

Or from `kubectl`:

```console
kubectl exec -it <pod_name> -- spiced --repl
```

### Debug Kubernetes Pods with Ephemeral Containers

Attach an [ephemeral container](https://kubernetes.io/docs/concepts/workloads/pods/ephemeral-containers/) to inspect a running Spice pod without restarting it. The helper container shares the runtime container's namespaces, so diagnostics reflect the live workload.

1. List pods in the relevant namespace: `kubectl get pods -n <namespace>`
2. Start the debugger:

   ```bash
   kubectl debug -it my-spicepod-name \
     -n my-spicepod-ns \
     --image=ubuntu:24.04 \
     --target=spiceai \
     --profile=sysadmin
   ```

   `--target` names the container inside the pod; Helm installs the Spice container as `spiceai` by default. `--profile` applies a [static debugging profile](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/#static-profile); the `sysadmin` preset adds root-level capabilities. With `--profile=sysadmin` and `--target=spiceai`, the Spice filesystem mounts at `/proc/1/root` inside the debugger for direct inspection.

3. Run the required commands and exit. For example, review the deployed Spicepod definition:

   ```bash
   cat /proc/1/root/app/spicepod.yaml
   ```

Ephemeral containers require Kubernetes v1.25+.

### Debugging with a shell

To debug issues using a shell, mount a volume that has a statically compiled `busybox` binary, and exec into the container using the `busybox sh` command. Here is an example in Docker:

```bash
# Create a volume for the busybox binary
docker volume create busybox

# Copy the busybox binary to the volume
docker run --rm -v busybox:/data busybox:stable-musl sh -c "mkdir -p /data && cp /bin/busybox /data/busybox"

# Run the Spice.ai container with the busybox binary mounted, ensure that any other volumes are mounted as well (i.e. for spicepod)
docker run -v busybox:/busy -v <path_to_spicepod>:/app/spicepod -d --name spiceai-debug spiceai/spiceai:1.3.0

# Exec into the container
docker exec -it spiceai-debug /busy/busybox sh

# At this point, a shell with standard Linux tools is available via the busybox binary.
# However, commands must be prefixed with `/busy/busybox`, for example: `/busy/busybox ls -l /app`.
```
