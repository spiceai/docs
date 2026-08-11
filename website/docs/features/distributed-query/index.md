---
title: 'Distributed Query'
sidebar_label: 'Distributed Query'
description: 'Learn how to run Spice in distributed mode for larger scale queries, including the async queries API.'
sidebar_position: 4
pagination_prev: null
pagination_next: null
---

Learn how to configure and run Spice in distributed mode to handle larger scale queries across multiple nodes.

:::info Preview
Multi-node distributed query execution based on Apache Ballista is available as a preview feature in Spice `v1.9.0`.
:::

## Overview

Spice integrates [Apache Ballista](https://github.com/apache/datafusion-ballista) to schedule and coordinate distributed queries across multiple executor nodes. This integration is useful when querying large, partitioned datasets in data lake formats such as Parquet, Delta Lake, or Iceberg. For smaller workloads or non-partitioned data, a single Spice instance is typically sufficient.

## Architecture

A distributed Spice cluster consists of two components:

- **Scheduler** – Plans distributed queries and manages the work queue for the executor fleet. Also manages async query jobs when `scheduler.state_location` is configured.
- **Executors** – One or more nodes responsible for executing physical query plans.

The scheduler holds the cluster-wide configuration for a Spicepod, while executors connect to the scheduler to receive work. A cluster can run with a single scheduler for simplicity, or multiple schedulers for [high availability](#high-availability).

### Network Ports

Spice separates public and internal cluster traffic across different ports:

| Port  | Service         | Description                                                           |
| ----- | --------------- | --------------------------------------------------------------------- |
| 50051 | Flight SQL      | Public query endpoint                                                 |
| 8090  | HTTP API        | Public REST API                                                       |
| 9090  | Prometheus      | Metrics endpoint                                                      |
| 50052 | Cluster Service | Internal scheduler/executor communication (mTLS enforced, by default) |

Internal cluster services are isolated on port 50052 with mTLS enforced by default.

## Secure Cluster Communication (mTLS)

Distributed query cluster mode uses mutual TLS (mTLS) for secure communication between schedulers and executors. Internal cluster communication includes highly privileged RPC calls like fetching Spicepod configuration and expanding secrets. mTLS ensures only authenticated nodes can join the cluster and access sensitive data.

### Certificate Requirements

Each node in the cluster requires:

- A CA certificate (`ca.crt`) trusted by all nodes
- A node certificate with the node's advertise address in the Subject Alternative Names (SANs)
- A private key for the node certificate

Production deployments should use the organization's PKI infrastructure to generate certificates with proper SANs for each node.

### Development Certificates

For local development and testing, the Spice CLI provides commands to generate self-signed certificates:

```bash
# Initialize CA and generate CA certificate
spice cluster tls init

# Generate certificate for the scheduler node
spice cluster tls add scheduler1

# Generate certificate for an executor node
spice cluster tls add executor1
```

Certificates are stored in `~/.spice/pki/` by default.

:::warning
CLI-generated certificates are not intended for production use. Production deployments should use certificates issued by the organization's PKI or a trusted certificate authority.
:::

### Insecure Mode

For local development and testing, mTLS can be disabled using the `--allow-insecure-connections` flag:

```bash
spiced --role scheduler --allow-insecure-connections
```

:::warning
Do not use `--allow-insecure-connections` in production environments. This flag disables authentication and encryption for internal cluster communication.
:::

## Getting Started

Cluster deployment typically starts with a scheduler instance, followed by one or more executors that register with the scheduler.

The following examples use CLI-generated development certificates. For production, substitute certificates from your organization's PKI.

### Generate Development Certificates

```bash
spice cluster tls init
spice cluster tls add scheduler1
spice cluster tls add executor1
```

### Start the Scheduler

The scheduler is the only `spiced` process that needs to be configured (i.e. have a `spicepod.yaml` in the current dir). Override the Flight bind address when it must be reachable outside of `localhost`:

```bash
spiced --role scheduler \
  --flight 0.0.0.0:50051 \
  --node-mtls-ca-certificate-file ~/.spice/pki/ca.crt \
  --node-mtls-certificate-file ~/.spice/pki/scheduler1.crt \
  --node-mtls-key-file ~/.spice/pki/scheduler1.key
```

### Start Executors

Executors connect to the scheduler's internal cluster port (50052) to register and pull work. Executors do not require a `spicepod.yaml`; they fetch the configuration from the scheduler. Each executor automatically selects a free port if the default is unavailable:

```bash
spiced --role executor \
  --scheduler-address https://scheduler1:50052 \
  --node-mtls-ca-certificate-file ~/.spice/pki/ca.crt \
  --node-mtls-certificate-file ~/.spice/pki/executor1.crt \
  --node-mtls-key-file ~/.spice/pki/executor1.key
```

Specifying `--scheduler-address` implies `--role executor`.

## Query Execution

Queries run against the scheduler endpoint. The `EXPLAIN` output confirms that distributed planning is active—Spice includes a `distributed_plan` section showing how stages are split across executors:

```sql
EXPLAIN SELECT count(id) FROM my_dataset;
```

:::warning[Limitations]

- In open source, distributed query targets partitioned data lake sources (e.g. Parquet, Delta Lake, Iceberg). Distributing **accelerated** datasets across executors is a Spice.ai Enterprise feature (see below).
- As a preview feature, clusters may encounter stability or performance issues.

:::

:::tip[Spice.ai Enterprise]

[**Distributed Accelerations**](https://docs.spice.ai/docs/enterprise/features/distributed-accelerations) partition-shard accelerated datasets across executors — each executor materializes and serves only the partitions it owns, with partition-aware read routing and write-through semantics. This is available in [Spice.ai Enterprise](https://spice.ai) and requires a [`SpicepodCluster`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodcluster).

:::

## Async Queries API

For long-running queries, the async queries API enables submitting queries for background execution, polling for status, and retrieving paginated results when ready.

:::warning
The async queries API is experimental and requires `scheduler.state_location` to be configured.
:::

### Prerequisites

- Spice runtime running in cluster mode with `--role scheduler`
- `scheduler.state_location` configured in the Spicepod (see [High Availability > Configuration](#configuration))
- At least one executor node connected to the scheduler

### Enabling Async Queries

Configure `runtime.scheduler.state_location` in your `spicepod.yaml` to enable the async queries API:

```yaml
runtime:
  scheduler:
    state_location: s3://my-bucket/spice-state
    params:
      region: us-east-1
```

The state location is a shared object store (S3, GCS, Azure Blob, or local filesystem via `file://`) used to persist async query job state and result chunks.

For local development:

```yaml
runtime:
  scheduler:
    state_location: "file://.data/scheduler-state"
```

### Query Ownership

A query is owned by the principal that submitted it, and **only that principal can list, poll, fetch results from, or cancel it**. This applies to the HTTP, Arrow Flight, and CLI surfaces alike.

Ownership follows the same principal boundary as [Per-Principal Cache Isolation](../caching/index.md#per-principal-cache-isolation), and is not configurable:

| Caller                                              | Owner scope                                                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Unauthenticated (or [authentication](../../api/auth/index.md) not enabled) | A single shared `public` scope — every caller sees every query, matching pre-isolation behavior. |
| Authenticated principal (e.g., API key)             | The principal's own isolated scope.                                                               |
| Internal / background runtime tasks                 | An internal `system` scope that can never reach a user-submitted query.                            |

There is no administrator or organization-wide scope. Every authenticated principal sees only its own queries; no principal can list, poll, or cancel another's, and there is no role or setting that grants a wider view.

For a query it does not own, a caller always receives **404 Not Found** — never 403, and never 410. Ownership is checked before result expiry, so the response does not reveal that the query exists:

| Caller             | Query is running or complete | Query's results have expired |
| ------------------ | ---------------------------- | ---------------------------- |
| The owner          | `200 OK`                     | `410 Gone`                   |
| Any other principal | `404 Not Found`              | `404 Not Found`              |

Ownership tracking was introduced in **v2.2.0**. A job written by an earlier runtime carries no owner and is treated as belonging to the `public` scope.

### HTTP REST API

Base path: `/v1/queries`

#### Endpoints

| Method | Path                                                  | Description                             |
| ------ | ----------------------------------------------------- | --------------------------------------- |
| `POST` | `/v1/queries`                                         | Submit a query for async execution      |
| `GET`  | `/v1/queries`                                         | List the caller's queries               |
| `GET`  | `/v1/queries/{query_id}`                              | Get query status and first result chunk |
| `GET`  | `/v1/queries/{query_id}/status`                       | Get query status only                   |
| `GET`  | `/v1/queries/{query_id}/results`                      | Get results (with pagination)           |
| `GET`  | `/v1/queries/{query_id}/results/chunks/{chunk_index}` | Get a specific result chunk             |
| `POST` | `/v1/queries/{query_id}/cancel`                       | Cancel a running query                  |

#### Submit Query

`POST /v1/queries`

Submits a SQL query for asynchronous execution and returns immediately with a job ID.

**Request Body** (`application/json`):

| Field             | Type    | Required | Description                                                                      |
| ----------------- | ------- | -------- | -------------------------------------------------------------------------------- |
| `sql`             | string  | Yes      | SQL statement to execute                                                         |
| `parameters`      | array   | No       | Bind variables for parameterized queries (`$1`, `$2`, ...)                       |
| `timeout_seconds` | integer | No       | Maximum execution time in seconds. The query is cancelled and failed on timeout. |
| `maximum_size`    | integer | No       | Maximum result size in bytes. The query is failed if results exceed this limit.  |

**Request Example**:

```json
{
  "sql": "SELECT * FROM large_table WHERE status = $1 AND created_at > $2",
  "parameters": ["active", "2025-01-01"],
  "timeout_seconds": 300,
  "maximum_size": 104857600
}
```

**Response** (HTTP 202 Accepted):

```json
{
  "query_id": "01ABC-DEF-456-7890AB",
  "status": "PENDING",
  "error": null,
  "status_url": "/v1/queries/01ABC-DEF-456-7890AB/status",
  "results_url": "/v1/queries/01ABC-DEF-456-7890AB/results"
}
```

#### Get Query

`GET /v1/queries/{query_id}`

Returns the full query status, result manifest, and the first result chunk (if completed successfully).

**Response** (HTTP 200):

```json
{
  "query_id": "01ABC-DEF-456-7890AB",
  "status": "SUCCEEDED",
  "error": null,
  "manifest": {
    "format": "ARROW_IPC",
    "schema": {
      "column_count": 3,
      "columns": [
        { "name": "id", "type_name": "Int64", "nullable": false, "position": 0 },
        { "name": "status", "type_name": "Utf8", "nullable": true, "position": 1 },
        { "name": "created_at", "type_name": "Timestamp(Microsecond, Some(\"UTC\"))", "nullable": true, "position": 2 }
      ]
    },
    "total_row_count": 25000,
    "total_chunk_count": 3
  },
  "result": {
    "chunk_index": 0,
    "row_offset": 0,
    "row_count": 10000,
    "next_chunk_index": 1,
    "next_chunk_url": "/v1/queries/01ABC-DEF-456-7890AB/results/chunks/1",
    "data_array": [
      { "id": 1, "status": "active", "created_at": "2025-06-15T10:30:00Z" }
    ]
  },
  "created_at": "2026-03-02T12:00:00+00:00",
  "started_at": "2026-03-02T12:00:00.050+00:00",
  "completed_at": "2026-03-02T12:00:05.200+00:00",
  "expires_at": "2026-03-03T00:00:05.200+00:00"
}
```

#### Get Status

`GET /v1/queries/{query_id}/status`

Returns the current status of a query without result data. Use this for lightweight polling.

**Response** (HTTP 200):

```json
{
  "status": "RUNNING",
  "error": null
}
```

When the query has failed:

```json
{
  "status": "FAILED",
  "error": {
    "error_code": "EXECUTION_FAILED",
    "message": "Table 'missing_table' not found",
    "sql_state": null
  }
}
```

#### Get Results

`GET /v1/queries/{query_id}/results`

Returns result data for a completed query. Use the `partition` query parameter to paginate through chunks.

**Query Parameters**:

| Parameter   | Type    | Default | Description                       |
| ----------- | ------- | ------- | --------------------------------- |
| `partition` | integer | `0`     | Chunk index to retrieve (0-based) |

**Response** (HTTP 200):

```json
{
  "chunk_index": 0,
  "row_offset": 0,
  "row_count": 10000,
  "next_chunk_index": 1,
  "next_chunk_url": "/v1/queries/01ABC-DEF-456-7890AB/results/chunks/1",
  "data_array": [
    { "id": 1, "status": "active" }
  ]
}
```

When the last chunk is reached, `next_chunk_index` and `next_chunk_url` are `null`.

#### Get Chunk

`GET /v1/queries/{query_id}/results/chunks/{chunk_index}`

Returns a specific result chunk by index. Same response format as **Get Results**.

#### Cancel Query

`POST /v1/queries/{query_id}/cancel`

Cancels a running query. Also cancels the underlying distributed query on the Ballista scheduler. Only the principal that submitted the query can cancel it; any other caller receives 404 Not Found and the query keeps running — see [Query Ownership](#query-ownership).

**Response** (HTTP 200):

```json
{
  "query_id": "01ABC-DEF-456-7890AB",
  "status": "CANCELLED",
  "error": null,
  "manifest": null,
  "result": null,
  "created_at": "2026-03-02T12:00:00+00:00",
  "started_at": "2026-03-02T12:00:00.050+00:00",
  "completed_at": "2026-03-02T12:00:02.100+00:00",
  "expires_at": null
}
```

#### List Queries

`GET /v1/queries`

Lists the queries submitted by the calling principal, optionally filtered by status. Queries submitted by other principals are never listed — see [Query Ownership](#query-ownership).

**Query Parameters**:

| Parameter | Type    | Default | Description                                                                                               |
| --------- | ------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `status`  | string  | *all*   | Filter by status: `queued`/`pending`, `running`, `completed`/`succeeded`, `failed`, `cancelled`, `closed` |
| `limit`   | integer | `100`   | Maximum number of results                                                                                 |

**Response** (HTTP 200):

```json
{
  "queries": [
    {
      "query_id": "01ABC-DEF-456-7890AB",
      "status": "RUNNING",
      "sql_preview": "SELECT * FROM large_table WHERE status = ...",
      "created_at": "2026-03-02T12:00:00+00:00"
    }
  ],
  "total_count": 1
}
```

The `sql_preview` field contains the first 100 characters of the SQL statement.

#### HTTP Error Responses

| HTTP Status               | Condition                                                              |
| ------------------------- | ---------------------------------------------------------------------- |
| 202 Accepted              | Query successfully submitted                                           |
| 200 OK                    | Status/results retrieved successfully                                  |
| 404 Not Found             | Query ID, chunk, or result not found, or the query was submitted by a different principal |
| 409 Conflict              | Query not yet complete (when fetching results by chunk)                |
| 410 Gone                  | Query results have expired                                             |
| 425 Too Early             | Query still running (results endpoint)                                 |
| 500 Internal Server Error | Execution or serialization failure                                     |
| 503 Service Unavailable   | Not running in scheduler cluster mode, or executor not yet initialized |

### Arrow Flight API

The async query API is also available via Apache Arrow Flight `DoAction` requests. This is more efficient for programmatic access since results are returned in Arrow IPC binary format instead of JSON.

Every action below is scoped to the principal that submitted the query, exactly as the HTTP endpoints are — see [Query Ownership](#query-ownership).

| Action Type           | Request Body (JSON)                     | Response                                                              |
| --------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| `SubmitAsyncQuery`    | `{"sql": "...", "parameters": [...]}`   | JSON: `{"query_id": "...", "status": "PENDING"}`                      |
| `GetAsyncQueryStatus` | `{"query_id": "..."}`                   | JSON: query status with error/result metadata                         |
| `GetAsyncQueryResult` | `{"query_id": "...", "chunk_index": 0}` | Binary: Arrow IPC stream                                              |
| `CancelAsyncQuery`    | `{"query_id": "..."}`                   | JSON: `{"query_id": "...", "cancelled": true, "status": "CANCELLED"}` |

#### SubmitAsyncQuery

**Request**:

```json
{
  "sql": "SELECT * FROM large_table",
  "parameters": []
}
```

**Response** (JSON):

```json
{
  "query_id": "01ABC-DEF-456-7890AB",
  "status": "PENDING"
}
```

#### GetAsyncQueryStatus

**Request**:

```json
{
  "query_id": "01ABC-DEF-456-7890AB"
}
```

**Response** (JSON):

```json
{
  "query_id": "01ABC-DEF-456-7890AB",
  "status": "SUCCEEDED",
  "error": null,
  "result": {
    "total_row_count": 25000,
    "total_chunk_count": 3
  }
}
```

#### GetAsyncQueryResult

**Request**:

```json
{
  "query_id": "01ABC-DEF-456-7890AB",
  "chunk_index": 0
}
```

**Response**: Arrow IPC binary stream containing the `RecordBatch` data for the requested chunk.

#### CancelAsyncQuery

**Request**:

```json
{
  "query_id": "01ABC-DEF-456-7890AB"
}
```

**Response** (JSON):

```json
{
  "query_id": "01ABC-DEF-456-7890AB",
  "cancelled": true,
  "status": "CANCELLED"
}
```

### CLI

The `spice query` command provides a CLI and interactive REPL for the async queries API.

#### Submit and Wait

```bash
spice query "SELECT * FROM orders WHERE total > 100 LIMIT 50;"
```

The CLI auto-polls with a spinner and displays results when ready. Press `Ctrl+C` to stop waiting — the query continues running in the background.

#### Submit Without Waiting

```bash
spice query "SELECT * FROM large_table;" --no-wait
```

#### Options

| Option                  | Default | Description                                                                                       |
| ----------------------- | ------- | ------------------------------------------------------------------------------------------------- |
| `--no-wait`             | `false` | Submit the query and return immediately without waiting for results                               |
| `--timeout <DURATION>`  | *none*  | Maximum client-side wait time (e.g., `30s`, `5m`). The query itself continues running on timeout. |
| `-o, --output <FORMAT>` | `table` | Output format: `table` or `json`                                                                  |

#### Subcommands

```bash
spice query list [--status X] [--limit N]    # List queries
spice query status <query_id>                # Check query status
spice query results <query_id>               # Fetch results of completed query
spice query cancel <query_id>                # Cancel a running query
```

These subcommands reach only the queries submitted with the same credentials — see [Query Ownership](#query-ownership).

#### Interactive REPL

When invoked without arguments, `spice query` starts an interactive REPL:

```
query> SELECT COUNT(*)
     > FROM large_table
     > WHERE status = 'active';
Submitted query: 01ABC-DEF-456-7890AB (PENDING)
Press Ctrl+C to stop waiting (query continues in background)
⠹ RUNNING (2.3s)...
✓ SUCCEEDED (5.1s)
+----------+
| count(*) |
+----------+
| 42000    |
+----------+

Time: 5.10000000 seconds. 1 rows.
```

**REPL Commands**:

| Command                | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `.list`                | List all queries tracked in this REPL session  |
| `.status <id>`         | Show detailed status of a query                |
| `.results <id>`        | Fetch and display results of a completed query |
| `.wait <id>`           | Resume waiting for a query to complete         |
| `.cancel <id>`         | Cancel a running query                         |
| `.clear`               | Clear the local tracked queries list           |
| `.clear history`       | Clear command history                          |
| `.help`                | Show available commands                        |
| `.exit`, `.quit`, `.q` | Exit the REPL                                  |

Query IDs can be abbreviated if they uniquely identify a query within the tracked session.

### Job Lifecycle

```
PENDING → RUNNING → SUCCEEDED → CLOSED (after 12h TTL)
                   → FAILED
                   → CANCELLED
```

| Status      | Description                                          |
| ----------- | ---------------------------------------------------- |
| `PENDING`   | Job is queued but not yet executing                  |
| `RUNNING`   | Job is actively executing on the distributed cluster |
| `SUCCEEDED` | Job completed successfully, results are available    |
| `FAILED`    | Job execution failed (see `error` field for details) |
| `CANCELLED` | Job was cancelled by the user                        |
| `CLOSED`    | Job results have expired and been cleaned up         |

### Error Codes

When a query fails, the `error` object contains an `error_code` field:

| Error Code                 | Description                                             |
| -------------------------- | ------------------------------------------------------- |
| `SCHEDULER_UNAVAILABLE`    | The Ballista scheduler is not reachable                 |
| `SUBMISSION_FAILED`        | Failed to submit the query to the distributed scheduler |
| `EXECUTION_FAILED`         | The query failed during execution                       |
| `FETCHING_RESULTS_FAILED`  | Failed to retrieve results from executor nodes          |
| `CANCELLED`                | The query was explicitly cancelled                      |
| `PARAMETER_BINDING_FAILED` | Failed to bind the provided query parameters            |
| `NOT_FOUND`                | The referenced query or job was not found               |
| `INTERNAL`                 | An unexpected internal error occurred                   |
| `TIMEOUT`                  | The query exceeded the configured `timeout_seconds`     |

### Storage Layout

Job state and result chunks are stored in the shared object store configured via `scheduler.state_location`:

```
{base_prefix}/
├── jobs/
│   ├── {job_id}.json          # Job state (JSON)
│   └── {job_id}/
│       ├── chunk_0.arrow      # Result chunk 0 (Arrow IPC)
│       ├── chunk_1.arrow      # Result chunk 1
│       └── ...
```

### Defaults and Limitations

| Setting    | Default     |
| ---------- | ----------- |
| Chunk size | 10,000 rows |
| Result TTL | 12 hours    |
| List limit | 100 queries |

- Only available in cluster mode with `--role scheduler`
- Requires `scheduler.state_location` to be configured
- The `format` query parameter on the results endpoint is declared but not yet implemented (results are always JSON over HTTP, Arrow IPC over Flight)
- Result TTL is not yet configurable per-query (fixed at 12 hours)
- Chunk size is not yet configurable per-query (fixed at 10,000 rows)

## High Availability

For production deployments, Spice supports running multiple active schedulers in an active/active configuration. This eliminates the scheduler as a single point of failure and enables graceful handling of node failures.

### HA Architecture

In an HA cluster:

- Multiple schedulers run simultaneously, each capable of accepting queries
- Schedulers share state via an S3-compatible object store
- Executors discover all schedulers automatically
- A load balancer distributes client queries across schedulers

```
                    ┌─────────────────────┐
                    │    Load Balancer    │
                    └─────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │ Scheduler  │   │ Scheduler  │   │ Scheduler  │◄──►  Object Store
       │            │   │            │   │            │        (S3)
       └────────────┘   └────────────┘   └────────────┘
              ▲                ▲                ▲
              │    (executor-initiated)         │
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │  Executor  │   │  Executor  │   │  Executor  │
       └────────────┘   └────────────┘   └────────────┘
```

### Configuration

Enable HA by configuring `runtime.scheduler.state_location` in the Spicepod to point to an S3-compatible object store:

```yaml
runtime:
  scheduler:
    state_location: s3://my-bucket/spice-cluster
    params:
      region: us-east-1
```

The object store is used for scheduler registration and discovery, and to persist [async query](#async-queries-api) job state (the execution graph plus its status) so that schedulers are effectively stateless for async queries.

### Scheduler Failover

When `runtime.scheduler.state_location` is configured, each async query's execution graph and status are persisted to the shared object store. If the scheduler driving an async query becomes unavailable, another scheduler detects the orphaned job and resumes it to completion from the persisted execution graph — the query is re-driven rather than replanned, and consumers and executors do not need to know which scheduler is running it. Takeover is single-winner: ownership transfers via a compare-and-set on the job's metadata, and a scheduler never reclaims its own in-flight jobs.

This failover applies to async queries, which require `scheduler.state_location`. Synchronous queries in flight on a scheduler that becomes unavailable are not resumed automatically; the client should retry them against another scheduler. Without `scheduler.state_location`, job state is held in memory and a single-scheduler cluster behaves as before (no failover).

### S3 Configuration

The `runtime.scheduler.params` section supports the following S3 parameters:

| Parameter          | Description                                           | Default    |
|--------------------| ----------------------------------------------------- | ---------- |
| `s3_region`        | AWS region for the S3 bucket                          | -          |
| `s3_endpoint`      | Custom S3-compatible endpoint URL                     | -          |
| `s3_auth`          | Authentication method: `iam_role` or `key`            | `iam_role` |
| `s3_key`           | AWS access key ID (when `auth: key`)                  | -          |
| `s3_secret`        | AWS secret access key (when `auth: key`)              | -          |
| `s3_session_token` | AWS session token for temporary credentials           | -          |
| `client_timeout`   | S3 client timeout                                     | -          |
| `allow_http`       | Allow HTTP (non-TLS) connections to S3 endpoint       | `false`    |

Example with explicit credentials:

```yaml
runtime:
  scheduler:
    state_location: s3://my-bucket/spice-cluster
    params:
      region: us-east-1
      auth: key
      key: ${secrets:aws_access_key}
      secret: ${secrets:aws_secret_key}
```

### Starting an HA Cluster

1. **Configure shared state** in `spicepod.yaml`:

   ```yaml
   runtime:
     scheduler:
       state_location: s3://my-bucket/spice-cluster
       params:
         region: us-east-1
   ```

2. **Start multiple schedulers**, each with unique certificates:

   ```bash
   # Scheduler 1
   spiced --role scheduler \
     --flight 0.0.0.0:50051 \
     --node-mtls-ca-certificate-file ~/.spice/pki/ca.crt \
     --node-mtls-certificate-file ~/.spice/pki/scheduler1.crt \
     --node-mtls-key-file ~/.spice/pki/scheduler1.key

   # Scheduler 2 (on a different node)
   spiced --role scheduler \
     --flight 0.0.0.0:50051 \
     --node-mtls-ca-certificate-file ~/.spice/pki/ca.crt \
     --node-mtls-certificate-file ~/.spice/pki/scheduler2.crt \
     --node-mtls-key-file ~/.spice/pki/scheduler2.key
   ```

3. **Start executors** (they discover all schedulers automatically):

   ```bash
   spiced --role executor \
     --scheduler-address https://scheduler1:50052 \
     --node-mtls-ca-certificate-file ~/.spice/pki/ca.crt \
     --node-mtls-certificate-file ~/.spice/pki/executor1.crt \
     --node-mtls-key-file ~/.spice/pki/executor1.key
   ```

4. **Configure a load balancer** to distribute queries across scheduler Flight SQL endpoints (port 50051).

### HA Considerations

- **Object store latency** – The object store is accessed during scheduler coordination. Use a low-latency object store (e.g., S3 Express One Zone) for best performance.

:::info Object Store Requirements
The object store must support conditional writes (S3 ETags). Most S3-compatible stores support this, including AWS S3, MinIO, and Google Cloud Storage (with S3 compatibility mode).
:::
