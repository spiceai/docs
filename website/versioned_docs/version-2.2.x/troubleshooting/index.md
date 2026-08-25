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

For hands-on examples, see the [Spice.ai Cookbook](https://github.com/spiceai/cookbook) for recipes demonstrating common troubleshooting scenarios.

## Common Issues

### `spice` command not found after installation

The Spice binary directory is not in your `PATH`. Add it:

```bash
# Add to your shell profile (.zshrc, .bashrc, etc.) for persistence
export PATH="$PATH:$HOME/.spice/bin"
```

Verify with `spice version`.

### Dataset fails to load or refresh

Check the runtime output for error messages. Common causes:

- **Incorrect credentials**: Verify connection parameters (`pg_host`, `pg_user`, `pg_pass`, etc.) and that secrets are configured correctly. Use `--verbose` to see secret resolution logs.
- **Network connectivity**: Ensure the Spice runtime can reach the data source. Test with `curl` or `psql` from the same host.
- **Schema mismatch**: If the source schema changed since the last refresh (for example, columns were added, removed, or types changed), the accelerated table will fail to update. Spice infers the dataset schema at startup and intentionally blocks runtime schema evolution to protect against unintentional or breaking changes. Restart the runtime so Spice re-infers the schema from the source. See [Schema Inference](components/data-connectors#schema-inference) for details.

Review the `task_history` table for detailed error messages:

```sql
SELECT task, error_message FROM runtime.task_history WHERE error_message IS NOT NULL ORDER BY start_time DESC LIMIT 5;
```

### Slow query performance

- **Check if acceleration is enabled**: Unaccelerated datasets query the remote source directly, adding network latency. Add `acceleration: enabled: true` to the dataset configuration.
- **Review the query plan**: Run `EXPLAIN` before the query to verify it executes against the local accelerator and not the remote source.
- **Check cache status**: For repeated queries, verify caching is active by inspecting the `Results-Cache-Status` HTTP header. A `MISS` on repeated identical queries may indicate a low `item_ttl`.

### AI chat returns incorrect or empty results

- **Verify model deployment**: Check the runtime logs for `Model [name] deployed, ready for inferencing`. If the model failed to load, review error messages in the logs.
- **Check tools configuration**: Ensure `tools: auto` is set in the model params so the model can discover and query datasets.
- **Use `spice trace ai_chat`**: Inspect the trace output to see which tools the model called and whether SQL queries succeeded or failed.

### Container OOM-killed despite a configured memory limit

`runtime.query.memory_limit` bounds the query execution pool, not the process. Accelerator caches, serialization buffers, embedded engine pools, and allocator retention sit outside it, so a process can be killed while the query pool still reports unused capacity.

- **Compare the pools against actual memory**: if `process_resident_memory_bytes` is far above `query_memory_pool_used_bytes`, the memory is off-pool and lowering the query limit will not recover it.
- **Count the per-dataset baseline**: accelerator caches are allocated per dataset with a floor that does not shrink with the container, so the idle footprint grows with dataset count regardless of data size.
- **Check whether the limit was set explicitly**: when unset, the runtime derives the query limit with the per-dataset reservations subtracted. An explicit value opts out of that and must leave room for the baseline itself.
- **Do not read a flat, high memory graph as a leak**: caches fill to their ceilings and allocators retain freed pages. What matters is whether it plateaus, and how far below the limit.
- **Read the startup warnings before load testing**: the runtime warns at startup when the configured caches cannot fit beside the query pool, which detects an undersized deployment in seconds rather than days.
- **Lowering the query limit is often the wrong lever**: bounding `runtime.query.max_concurrent_queries` reduces the peak directly, whereas lowering `runtime.query.memory_limit` shrinks each query's budget without reducing how many run at once.

See [Managing Memory Usage](../reference/memory.md) for the sizing model and validation guidance.

### Port conflicts on startup

If Spice fails to bind to its default ports (`8090` for HTTP, `50051` for Flight, `9090` for metrics), another process is already using that port. Override the ports:

```bash
spiced --http 0.0.0.0:3000 --flight 0.0.0.0:50052 --metrics 0.0.0.0:9091
```

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

For more information, view the [tracing documentation](../cli/tracing.md)

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

For more information, view the [`spice trace` documentation](../cli/reference/trace.md).

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

For more information, view the [task history documentation](../reference/task_history.md)

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

Plans are captured asynchronously after query completion, ensuring query execution proceeds without blocking. For more details, view the [task history documentation](../reference/task_history.md#sql-query-plan-capture).

## SQL Explain Plans

Spice supports generating `EXPLAIN` plans, which can be used to debug SQL that may not be producing the correct result. An explain plan in Spice can provide information about the data sources the SQL will be executed against, including the re-written SQL that will be executed against that data source (if applicable). For example, an explain plan could be used to debug the SQL that is generated and executed against separate federated sources during an SQL query which joins their results (like a PostgreSQL database and a MySQL database).

Generate an explain plan by adding the `EXPLAIN` keyword before the query:

```sql
explain select * from taxi_trips;
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

If you try to open a shell in a Spice container the way you would with most images, it fails:

**On your machine:**

```console
$ kubectl exec -it my-spicepod -- bash
error: exec: "bash": executable file not found in $PATH
```

The error comes from *inside* the container: `kubectl` reached the pod successfully, then found no `bash` there to execute.

This is expected, not a broken container. The sections below explain why, and give three ways to debug depending on what you need to look at.

### Why there is no shell

The published Spice image is built `FROM scratch` — an empty base image with no Linux userspace at all. It contains only:

- the `spiced` binary
- the shared libraries `spiced` links against
- CA certificates and timezone data

There is no `bash`, no `sh`, not even `ls`, and no package manager — so nothing can be installed into a running container either. `spiced` also runs as the unprivileged user `65534` (`nobody`), whose login shell is set to `/usr/sbin/nologin`.

This is deliberate: an image with no shell and no packages has a far smaller attack surface and far fewer CVEs to patch. The trade-off is that debugging needs the techniques below instead of `kubectl exec ... -- bash`. For background on how this image is built, see the [Docker Sandbox Guide](../deployment/docker/sandbox.md).

### Choosing an approach

| What you need to do                                            | Use                                                                        | Requirements                                                     |
| -------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Run SQL queries against the running runtime                    | [SQL REPL](#sql-repl)                                                      | None — works out of the box                                      |
| Inspect files, processes, or the network of a Kubernetes pod    | [Ephemeral container](#debug-kubernetes-pods-with-ephemeral-containers)     | Kubernetes v1.25+, and permission to create ephemeral containers |
| Get an interactive shell against a local Docker container      | [busybox shell](#debugging-with-a-shell)                                   | Docker, and the container started with an extra volume           |

Start with the SQL REPL if the question is about data or queries. Reach for an ephemeral container when the question is about the environment — config files, mounted volumes, DNS, or connectivity.

### Where commands run

Debugging a container means moving between machines, and the same command can behave differently — or fail — depending on where it is typed. Three contexts appear below, and **every command block states which one it belongs to**:

| Context                        | Where it actually executes                                                                                                                              | How you get there                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **Your machine**               | Your own workstation or CI runner — wherever `kubectl` and `docker` are installed. These commands talk *to* the cluster or Docker daemon, not inside it. | The default; no extra step               |
| **Inside the Spice container** | The sandbox container running `spiced`. No shell here, so only `spiced` itself, or a mounted binary such as `busybox`, can be run.                       | `kubectl exec` / `docker exec`           |
| **Inside the debug container** | A *separate* temporary container in the same pod, with its own filesystem and its own tools. Spice's files are **not** at their usual paths here.        | `kubectl debug` drops you straight in    |

Two consequences that catch people out:

- `kubectl` and `docker` commands are typed on **your machine**, but the part after `--` (or after the container name) executes **inside the container**. In `kubectl exec -it my-pod -- spiced --repl`, `kubectl` runs locally while `spiced --repl` runs in the container — which is why `localhost` in that command means the container's own localhost, not your machine's.
- `kubectl debug` does **not** put you inside the Spice container. It puts you in a new debug container beside it. That is why inspecting Spice's files from there needs the `/proc/1/root` prefix described below.

### SQL REPL

The REPL needs no shell, because `spiced` is itself the binary being executed.

**On your machine** — the `spiced --repl` part after the container name executes **inside the Spice container**:

```console
# Docker
docker exec -it <container_id> spiced --repl

# Kubernetes
kubectl exec -it <pod_name> -- spiced --repl
```

Because `spiced --repl` runs inside the container, it connects to that container's own `http://localhost:50051` Flight endpoint — attaching to the runtime already serving there. The interactive SQL prompt that follows is therefore executing queries **inside the deployment**, not locally.

This is the quickest way to check whether a dataset loaded, inspect a schema, or reproduce a slow query from inside the deployment.

:::note

Running `spiced --repl` on **your machine** instead is a different thing entirely: it would try to reach a runtime on your own `localhost:50051`. To query a remote runtime from your workstation without `kubectl exec`, use `spice sql --endpoint <url>` (it accepts `http://`, `https://`, `grpc://`, and `grpc+tls://`), pointing at an address the runtime is reachable on — for example one published by `kubectl port-forward`.

:::

### Debug Kubernetes Pods with Ephemeral Containers

An [ephemeral container](https://kubernetes.io/docs/concepts/workloads/pods/ephemeral-containers/) is a temporary extra container that Kubernetes adds to a pod that is already running. Because it brings its own image, it can supply all the tools the Spice image lacks — while the Spice process keeps running untouched. The pod is **not** restarted and no configuration is changed.

This is the recommended way to debug Spice on Kubernetes.

#### 1. Find the pod and container names

**On your machine:**

```bash
# List pods in the namespace
kubectl get pods -n <namespace>

# List the container names inside the pod
kubectl get pod <pod_name> -n <namespace> -o jsonpath='{.spec.containers[*].name}'
```

The Helm chart names the Spice container `spiceai`. Run the second command rather than assuming, since a custom manifest may name it something else.

#### 2. Start the debug container

**On your machine:**

```bash
kubectl debug -it my-spicepod-name \
  -n my-spicepod-ns \
  --image=ubuntu:24.04 \
  --target=spiceai \
  --profile=sysadmin
```

This command returns with an interactive prompt, and **from here on you are inside the debug container** — a different filesystem from both your machine and the Spice container.

What each flag does:

| Flag                 | Meaning                                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `-it`                | Attach an interactive terminal, as with `kubectl exec -it`.                                                                                                                     |
| `--image`            | The image providing the debugging tools, and therefore the only source of tools available once inside. `ubuntu:24.04` gives a familiar shell and `apt` to install more; any image works. |
| `--target`           | The container in the pod to attach to, from step 1. This is what makes the Spice process and its filesystem visible — omit it and you get an isolated container that sees nothing of the runtime. |
| `--profile=sysadmin` | Applies the `sysadmin` [static debugging profile](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/#static-profile), which grants the elevated capabilities needed to inspect another container's files and processes. |

#### 3. Inspect the runtime

The debug container has **its own** filesystem — from `ubuntu:24.04`, not from Spice — so `/app` here is empty, and Spice's files are not where you might expect. Because `--target` shares the process namespace, `spiced` is visible as PID 1, and Linux exposes any process's root filesystem at `/proc/<pid>/root`. So everything belonging to Spice is reachable under **`/proc/1/root`**:

**Inside the debug container** (reading the Spice container's files):

```bash
# The Spicepod definition the runtime actually loaded
cat /proc/1/root/app/spicepod.yaml

# The runtime's working directory, including acceleration files
ls -l /proc/1/root/app

# Confirm which process is PID 1 and how it was invoked
cat /proc/1/cmdline | tr '\0' ' '
```

The `/proc/1/root` prefix is what makes the difference: `ls /app` reads the *debug* container's empty directory, while `ls /proc/1/root/app` reads the *Spice* container's real working directory. Dropping the prefix is the most common source of confusion — it does not error, it just shows you the wrong container's filesystem.

Networking is the exception to that rule. All containers in a pod share a single network namespace, so network tools run **inside the debug container** already see exactly what the runtime sees — no `/proc/1/root` prefix applies, and none is needed.

Note that the tools available are whatever the `--image` you chose provides, not what Spice provides. `ubuntu:24.04` is a minimal image, so install what you need first — this is safe, because it modifies only the throwaway debug container:

**Inside the debug container:**

```bash
# Install network tools into the debug container (not into Spice)
apt update && apt install -y curl dnsutils iproute2

# Resolve and reach a data source exactly as the runtime would
dig my-postgres.my-namespace.svc.cluster.local
curl -v telnet://my-postgres.my-namespace.svc.cluster.local:5432

# The runtime's own listening sockets: HTTP 8090, metrics 9090, Flight 50051
ss -ltnp
```

Images purpose-built for network debugging, such as `nicolaka/netshoot`, bundle these tools and skip the install step.

When finished, type `exit` to leave the debug container and return to **your machine**.

:::note

Ephemeral containers require Kubernetes v1.25 or later, and creating one requires permission on the `pods/ephemeralcontainers` subresource — a `Forbidden` error means the account lacks it, not that the command is wrong. An ephemeral container cannot be removed from a pod once added; it remains in the pod spec until the pod is replaced. Some hardened clusters also reject `--profile=sysadmin`; if so, try `--profile=general` (fewer capabilities, so cross-container file inspection may not work).

:::

### Debugging with a shell

For local Docker debugging, a shell can be added from outside the image. [busybox](https://busybox.net/) ships a single *statically compiled* binary containing dozens of standard tools — because it depends on no system libraries, it runs inside the sandbox image even though that image has no userspace of its own. Mounting it as a volume supplies a shell without rebuilding the image.

This technique is for Docker. On Kubernetes, use an [ephemeral container](#debug-kubernetes-pods-with-ephemeral-containers) instead — it needs no volume and no restart.

Note that the volume must be mounted when the container is **created**, so this requires starting a new container rather than attaching to a running one.

**On your machine** (the Docker host) — all four commands:

```bash
# Create a volume for the busybox binary
docker volume create busybox

# Copy the busybox binary to the volume
docker run --rm -v busybox:/data busybox:stable-musl sh -c "mkdir -p /data && cp /bin/busybox /data/busybox"

# Run the Spice.ai container with the busybox binary mounted, ensure that any other volumes are mounted as well (i.e. for spicepod)
docker run -v busybox:/busy -v <path_to_spicepod>:/app/spicepod -d --name spiceai-debug spiceai/spiceai:latest

# Exec into the container — the shell that follows runs INSIDE the Spice container
docker exec -it spiceai-debug /busy/busybox sh
```

That last command hands you a shell **inside the Spice container** itself — unlike `kubectl debug`, there is no separate debug container here, so paths such as `/app` are already Spice's own and need no `/proc/1/root` prefix.

Because the busybox tools are not on `PATH`, every command in that shell must be prefixed with `/busy/busybox`:

**Inside the Spice container:**

```bash
/busy/busybox ls -l /app
/busy/busybox cat /app/spicepod.yaml
```
