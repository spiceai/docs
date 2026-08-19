---
title: 'Databricks Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the Databricks connector in production: resilience controls, Unity Catalog behavior, metrics, and observability.'
sidebar_position: 1
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - databricks
  - observability
---

Production operating guide for the Databricks connector covering resilience tuning, Unity Catalog awareness, metrics, and observability. These features apply primarily to `sql_warehouse` mode unless noted otherwise.

## Resilience Controls

### Retry and Concurrency Parameters

When using `mode: sql_warehouse`, the following parameters control HTTP retry behavior and concurrency limits for the Databricks SQL Statements API.

| Parameter                    | Type     | Default     | Description                                                                |
| ---------------------------- | -------- | ----------- | -------------------------------------------------------------------------- |
| `connect_timeout`            | duration | `10s`       | Timeout for establishing TCP/TLS connections to the Databricks API.        |
| `client_timeout`             | duration | `30s`       | Per-HTTP-call timeout (statement submit, status poll, chunk fetch). Set to the longest expected single call, not total query duration. |
| `max_concurrent_requests`    | integer  | `8`         | Maximum concurrent HTTP requests to the SQL Warehouse API.                 |
| `http_max_retries`           | integer  | `3`         | Maximum HTTP-level retries for transient failures (429, 5xx).              |
| `backoff_method`             | string   | `fibonacci` | Backoff strategy for transient HTTP retries: `fibonacci` or `exponential`. |
| `statement_max_retries`      | integer  | `14`        | Maximum poll retries when waiting for an async SQL statement to complete.  |
| `disable_on_permanent_error` | boolean  | `true`      | Permanently disable the connector on non-retryable errors (401, 403, 404). |

#### Example

```yaml
catalogs:
  - from: databricks:my_catalog
    name: my_catalog
    params:
      databricks_endpoint: my-workspace.cloud.databricks.com
      mode: sql_warehouse
      databricks_sql_warehouse_id: abc123def456
      databricks_client_id: ${env:DBX_CLIENT_ID}
      databricks_client_secret: ${env:DBX_CLIENT_SECRET}
      connect_timeout: 10s
      client_timeout: 2m
      max_concurrent_requests: '4'
      http_max_retries: '5'
      backoff_method: exponential
      statement_max_retries: '20'
      disable_on_permanent_error: 'true'
```

### Shared Concurrency Semaphore

When multiple datasets or catalog-discovery paths target the same SQL Warehouse (same `endpoint` + `sql_warehouse_id`), a single concurrency semaphore is shared across all of them. The `max_concurrent_requests` limit is enforced globally for that warehouse, not per dataset or per catalog.

Every dataset and catalog entry that targets the same warehouse must resolve to the **same** `max_concurrent_requests` value. A component that omits the parameter resolves to the default `8`, so setting a non-default limit on one entry and leaving it off another is itself a conflict — set the same value on every component that shares the warehouse.

A mismatch fails at load with an error naming the requested and existing limits (`Conflicting Databricks SQL Warehouse concurrency limits for endpoint ... requested 4, existing 8`). A value of `0` or a non-numeric value is not applied: the runtime logs a warning and uses the default `8`.

### Permanent-Disable Behavior

When `disable_on_permanent_error` is `true` (default), non-retryable HTTP status codes on statement-execution requests permanently disable the connector. Subsequent queries immediately return a `PermanentlyDisabled` error instead of issuing further HTTP requests.

The following errors trigger permanent disable:

- **401 Unauthorized** — expired or invalid credentials.
- **403 Forbidden** — the service principal or token lacks permission to execute statements on the warehouse.
- **404 Not Found** — the SQL Warehouse has been deleted or the endpoint is incorrect.

This prevents cascading failures (e.g., every dataset refresh hammering a warehouse that will never accept the request).

:::info
Permanent-disable detection is **not** applied to statement-poll or result-fetch requests. Transient 403/404 responses on those paths (e.g., expired pre-signed URLs or purged statement results) do not indicate a configuration problem.
:::

To recover from a permanent-disable state, fix the underlying issue (e.g., renew credentials, restore the warehouse) and restart the Spice runtime.

### Retry Behavior

The SQL Warehouse connector has two retry layers:

1. **HTTP-level retries** retries on 408 (request timeout), 429 (rate-limit), and 5xx (server error) responses, as well as transient network and connection errors. Respects `Retry-After`, `retry-after-ms`, and `x-retry-after-ms` headers. Uses the configured `backoff_method` with a maximum backoff of 300 seconds.

2. **Statement poll retries** when a SQL statement enters PENDING or RUNNING state, the connector polls for completion using fibonacci backoff up to `statement_max_retries` times. If the statement does not reach a terminal state within the retry budget, a `QueryStillRunning` or `InvalidWarehouseState` error is returned.

## Unity Catalog Awareness

### Table Type Filtering

The connector checks each table's type against Unity Catalog metadata before creating a table provider. The following table types are supported:

| Table Type          | Supported | Notes                                  |
| ------------------- | --------- | -------------------------------------- |
| `MANAGED`           | Yes       | Standard Delta tables                  |
| `EXTERNAL`          | Yes       | Tables with external storage locations |
| `FOREIGN`           | Yes       | Lakehouse Federation foreign tables    |
| `MATERIALIZED_VIEW` | Yes       | Materialized views                     |
| `VIEW`              | No        | Skipped during discovery               |
| `STREAMING_TABLE`   | No        | Skipped during discovery               |

Unsupported table types are silently skipped during catalog discovery. When referenced directly (e.g., `databricks:catalog.schema.view_name`), an error is returned.

### Permission Checking

Before creating a table provider, the connector verifies the current principal has a read-compatible privilege on the table using the Unity Catalog Effective Permissions API. The following privileges grant read access: `SELECT`, `ALL_PRIVILEGES`, `ALL PRIVILEGES`, `OWNER`, and `OWNERSHIP`.

**Catalog discovery**: Tables without read permissions are skipped.

**Direct table references**: An `InsufficientPermissions` error is returned.

**Foreign tables**: `FOREIGN` tables skip the table-level permission precheck because Lakehouse Federation access can be valid even when the effective-permissions endpoint does not report a table-level read privilege. Access is still enforced by Databricks at query time.

**Graceful degradation**: If the Unity Catalog API is unreachable or the table is not found in UC, the connector logs a warning and proceeds without validation.

## Metrics

The SQL Warehouse connector exposes per-dataset operational metrics. Most metrics must be explicitly enabled in the dataset's `metrics` section. The `inflight_operations` metric is auto-registered and always available.

For general information about component metrics, see [Component Metrics](/docs/features/observability/component_metrics).

### Available Metrics

| Metric Name                   | Type    | Category        | Description                                                              |
| ----------------------------- | ------- | --------------- | ------------------------------------------------------------------------ |
| `requests_total`              | Counter | Requests        | Total HTTP requests issued (excluding retries).                          |
| `retries_total`               | Counter | Requests        | Total HTTP retries for transient failures.                               |
| `permanent_errors_total`      | Counter | Requests        | Total non-retryable errors (401, 403, 404).                              |
| `inflight_operations`         | Gauge   | Requests        | Current in-flight operations holding a concurrency permit. Global across datasets sharing the same warehouse. **Auto-registered.** |
| `statements_executed_total`   | Counter | Statements      | Total SQL statements submitted.                                          |
| `statement_polls_total`       | Counter | Statements      | Total polls for async statement completion.                              |
| `statements_failed_total`     | Counter | Statements      | Total SQL statements that completed with FAILED status.                  |
| `pool_connections_total`      | Counter | Connection Pool | Total pool `connect()` calls.                                            |
| `pool_active_connections`     | Gauge   | Connection Pool | Current active connection handles.                                       |
| `semaphore_available_permits` | Gauge   | Concurrency     | Available permits in the request concurrency semaphore.                   |
| `chunks_fetched_total`        | Counter | Data Transfer   | Total Arrow result chunks fetched.                                       |
| `connector_disabled`          | Gauge   | Connector State | Whether the connector is permanently disabled (`1` = yes, `0` = no).     |

### Enabling Metrics

Add a `metrics` list to the dataset definition in your spicepod:

```yaml
datasets:
  - from: databricks:my_catalog.my_schema.my_table
    name: my_table
    params:
      mode: sql_warehouse
      databricks_sql_warehouse_id: abc123def456
      databricks_endpoint: my-workspace.cloud.databricks.com
      databricks_client_id: ${env:DBX_CLIENT_ID}
      databricks_client_secret: ${env:DBX_CLIENT_SECRET}
    metrics:
      - name: requests_total
      - name: retries_total
      - name: permanent_errors_total
      - name: statements_executed_total
      - name: statements_failed_total
      - name: pool_active_connections
      - name: semaphore_available_permits
      - name: chunks_fetched_total
      - name: connector_disabled
```

Individual metrics can be disabled by setting `enabled: false`. This includes auto-registered metrics:

```yaml
    metrics:
      - name: inflight_operations
        enabled: false
```

### Metric Naming

Metrics are exposed as OpenTelemetry instruments with the naming convention:

```text
dataset_databricks_{metric_name}
```

For example, `requests_total` becomes `dataset_databricks_requests_total`. Each instrument carries a `name` attribute set to the dataset instance name, so metrics from multiple datasets sharing the same warehouse can be distinguished.

### Shared Warehouse Attribution

When multiple datasets share the same SQL Warehouse, compare `dataset_databricks_*` metrics by their `name` attribute to understand per-dataset load. The `semaphore_available_permits` metric reflects the shared semaphore, so all datasets targeting the same warehouse observe the same underlying concurrency budget.

### Accessing Metrics

Registered metrics are available through:

- **Prometheus endpoint**: `GET /metrics` when the metrics server is enabled.
- **`runtime.metrics` SQL table**: `SELECT * FROM runtime.metrics WHERE name LIKE 'dataset_databricks_%'`.
- **OTLP push exporter**: Pushed to any configured OpenTelemetry collector.

## Task History

All major Databricks operations are instrumented with tracing spans for the Spice [task history](/docs/reference/task_history) system. This applies to both `sql_warehouse` and `delta_lake` modes.

### SQL Warehouse Spans

| Span Name                      | Input Field  | Description                                           |
| ------------------------------ | ------------ | ----------------------------------------------------- |
| `databricks_get_schema`        | Table name   | Schema inference via `information_schema` or `DESCRIBE` |
| `databricks_execute_statement` | SQL text     | SQL statement execution via the Statements API        |
| `databricks_poll_statement`    | Statement ID | Polling for async statement completion                |

### Unity Catalog Spans

| Span Name                      | Input Field                | Description                             |
| ------------------------------ | -------------------------- | --------------------------------------- |
| `uc_get_table`                 | Fully-qualified table name | Fetch table metadata from Unity Catalog |
| `uc_get_catalog`               | Catalog ID                 | Fetch catalog metadata                  |
| `uc_list_schemas`              | Catalog ID                 | List schemas in a catalog               |
| `uc_list_tables`               | `catalog_id.schema_name`   | List tables in a schema                 |
| `uc_get_effective_permissions` | Fully-qualified table name | Check effective permissions for a table |

All SQL Warehouse spans include a `warehouse_id` field. Unity Catalog spans include the table or catalog identifier as the `input` field.

## Token Management

How authentication tokens are managed depends on the authentication method:

- **Service Principal (M2M OAuth)**: A background task refreshes the OAuth2 token 5 minutes before expiry. Refresh failures use fibonacci backoff capped at 5 minutes.
- **Personal Access Token**: Used as-is with no automatic refresh.
