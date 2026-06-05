---
title: 'Azure Cosmos DB Data Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the Azure Cosmos DB data connector in production: authentication, RU sizing, resilience, metrics, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - cosmosdb
  - azure
  - nosql
  - observability
---

Production operating guide for the Azure Cosmos DB (NoSQL / Core SQL API) data connector covering authentication, Request Unit (RU) cost, resilience tuning, observability, and troubleshooting.

## Authentication & Secrets

The connector currently supports key-based authentication only. Microsoft Entra ID and managed identity are tracked as a post-RC enhancement.

| Parameter                      | Description                                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `cosmosdb_connection_string`   | Full connection string from the Azure portal (`AccountEndpoint=...;AccountKey=...`). Takes precedence.   |
| `cosmosdb_account_endpoint`    | Account endpoint URL when storing endpoint and key separately.                                           |
| `cosmosdb_account_key`         | Primary or secondary account key.                                                                        |

Credentials must be sourced from a [secret store](../../secret-stores/) in production. Prefer the **secondary** account key for Spice and rotate keys via the Azure portal — this lets you revoke access without taking the primary down. Scope read-only RBAC role assignments where possible: the connector only requires **Cosmos DB Built-in Data Reader** at the data plane level.

### TLS

Cosmos DB endpoints are HTTPS-only. The Azure-issued certificate is signed by a public CA, so no extra trust-store configuration is required. Self-hosted gateways or proxies in front of Cosmos must be trusted by the runtime's host OS / container.

## Resilience Controls

### Per-Account Concurrency Budget

The connector enforces a per-account concurrency semaphore that is shared across every dataset targeting the same Cosmos endpoint. This matches Cosmos DB's per-account RU model — multiple datasets pointing at the same account compete for the same backend budget.

| Parameter                  | Default | Notes                                                                                                                |
| -------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| `max_concurrent_requests`  | `4`     | Per-account upper bound. Datasets configured with conflicting values keep the **first-seen** value and log a warning. |

For workloads that fan out across many datasets, raise the budget (e.g. `8`–`16`) only after observing how it affects the account's provisioned RU/s consumption. Datasets that rarely query against the same account can each set their own value.

### Retries and Backoff

Retries apply to the **schema-inference sampling pass** at dataset registration. Errors surfaced *during* a streaming scan propagate immediately — a `FeedPager` cannot be safely rewound after rows have been emitted. Spice's dataset refresh layer handles retry at the query boundary.

| Parameter         | Default       | Behavior                                                                                                                       |
| ----------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `http_max_retries` | `3`           | Retries for HTTP 429, 5xx, and transient network failures. The connector honors `Retry-After` and `x-ms-retry-after-ms` headers; the effective sleep is `max(retry_after, backoff)`. |
| `backoff_method`  | `exponential` | `exponential`: 500ms × 2ⁿ, capped at 30s. `fibonacci`: 500ms × Fₙ, capped at 30s.                                              |

For accounts at provisioned RU limits, prefer `fibonacci` — it grows slower than exponential between attempts 3 and 5 and reduces head-of-line stalls for downstream datasets sharing the budget.

### Permanent-Error Latch

A 401 (unauthorized), 403 (forbidden), or 404 (not found) from any request flips a per-account flag that short-circuits subsequent requests. This avoids a thundering herd of failed calls when credentials are wrong or the database/container has been deleted.

| Parameter                    | Default | Behavior                                                                                                  |
| ---------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `disable_on_permanent_error` | `true`  | When `true`, latches the connector account-wide on 401/403/404 until Spice is restarted.                   |

The latch is per-account-endpoint, not per-dataset — fixing the credentials and restarting clears the state. Set to `false` only in development when you want to see every failure surface immediately.

## Capacity & Sizing

### Request Units (RU)

Every Cosmos DB read consumes RUs from the account's provisioned (or autoscale) budget. The Spice connector contributes RU consumption in three phases:

1. **Dataset registration** — schema inference samples up to `schema_infer_max_records` documents (default `100`).
2. **Per-query scans** — non-accelerated datasets stream the entire `query` result set on each query.
3. **Acceleration refresh** — accelerated datasets stream the entire query at every `refresh_check_interval` (or `refresh_cron`).

For accounts close to their RU ceiling:

- **Accelerate the dataset** (`acceleration.enabled: true`) to amortize RU cost across queries.
- **Narrow the dataset** with a custom `query: SELECT * FROM c WHERE ...` to push the predicate to Cosmos.
- **Tune `refresh_check_interval`** to control how often the connector replays the scan against the account.
- **Lower `schema_infer_max_records`** if the schema is stable and the default sample is an avoidable RU cost on dataset registration.

Cosmos DB exposes RU consumption per query in the response headers. Monitor account-level RU/s in the Azure portal under **Insights → Throughput** — sustained 429 retries indicate the account is undersized for the Spice workload.

### Schema Inference Cost

Each dataset's schema inference samples documents once at registration. The cost is roughly `schema_infer_max_records × per-document RU cost`. For containers with large documents (multi-KB JSON), prefer a smaller sample (e.g. `50`) and pin the schema explicitly via `columns:` if needed.

### Connection Pool

The connector uses a single shared HTTP/2 connection pool to each account endpoint. Cosmos DB's gateway tolerates many concurrent streams over a single connection — the bottleneck is RU/s, not TCP sockets.

## Metrics

The Cosmos DB connector exposes one observable gauge that can be enabled per dataset:

| Metric Name           | Description                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `inflight_operations` | Number of Cosmos DB operations currently holding a concurrency permit. Incremented per operation and held across retry-backoff sleeps. **Per-dataset**, not per-account. |

Enable in the dataset's `metrics` section:

```yaml
datasets:
  - from: cosmosdb:store.products
    name: products
    params:
      cosmosdb_connection_string: ${secrets:COSMOSDB_CONNECTION_STRING}
    metrics:
      - name: inflight_operations
        enabled: true
```

See [Component Metrics](../../../features/observability/component_metrics) for general configuration.

For broader observability, also monitor:

- Spice query execution metrics (`query_duration_ms`, `query_processed_rows`, `query_failures_total`) from `runtime.metrics`.
- Azure portal **Cosmos DB account → Insights → Throughput** for RU/s consumption and 429 rates.
- Account-level Azure Monitor metrics: `TotalRequestUnits`, `TotalRequests`, `MetadataRequests`.

## Task History

Cosmos DB requests participate in [task history](../../../reference/task_history) through the connector span. Each `_search` and `query` call is a child of the enclosing `sql_query` or `accelerated_table_refresh` task.

## Known Limitations

- **Read-only**: Writes (`INSERT` / `UPDATE` / `DELETE`) are not supported.
- **No filter / projection / limit pushdown**: SQL predicates are evaluated locally by DataFusion. Use a custom `query:` to narrow at the Cosmos side.
- **Schema is frozen at registration**: Mapping changes after startup require a runtime restart.
- **No change feed**: `RefreshMode::Changes` is not wired.
- **Mid-stream retries are not safe**: Retries apply to the schema-inference pass only. Errors during a streaming scan propagate immediately; rely on dataset refresh-level retry instead.
- **No fine-grained partition-key routing**: All scans are cross-partition.
- **Microsoft Entra ID / managed identity unsupported**: Key-based auth only.
- **No native temporal / decimal / binary types**: Round-trip as strings; cast in SQL.
- **Cosmos emulator is not used in CI**: Tested against a live account; emulator coverage is tracked as a future enhancement.

## Troubleshooting

| Symptom                                                            | Likely cause                                                                              | Resolution                                                                                                                       |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `EmptyContainer` error at dataset load                             | The container has no documents, or the custom `query` returns zero rows.                  | Populate the container, broaden the `query`, or pin a schema via the dataset `columns:` configuration.                            |
| Connector latched disabled — every query fails immediately         | A 401/403/404 was observed, and `disable_on_permanent_error` is `true` (the default).     | Fix the credential or restore the missing database/container, then restart `spice run`. Or set `disable_on_permanent_error: 'false'` during development. |
| 429 retries dominate the request budget                            | Account RU/s is undersized for the Spice workload.                                        | Increase RU/s in Azure, accelerate the dataset, or lower `max_concurrent_requests` to back off.                                  |
| RU consumption spikes on every restart                             | `schema_infer_max_records` × document size.                                               | Lower the sample size or pin a schema via `columns:`.                                                                            |
| Schema doesn't include a field that exists in production           | The first `schema_infer_max_records` documents had `null` for that field.                  | Increase `schema_infer_max_records`, or pin the schema explicitly.                                                               |
| `Invalid Azure Cosmos DB connection string`                        | Connection string was edited or trimmed.                                                   | Re-copy the full string from the Azure portal — `AccountEndpoint=...;AccountKey=...;` (note the trailing `;`).                    |
| `Invalid dataset path` error at registration                       | `from:` does not match `cosmosdb:database.container`.                                      | Use `cosmosdb:database.container` or `cosmosdb:database/container`, or set `cosmosdb_database` and use `cosmosdb:container`.      |
| Multiple datasets, one with a different `max_concurrent_requests`  | Spice keeps the **first-seen** value across datasets sharing an endpoint.                  | Set the same value on every dataset that targets the same account, or accept the warning logged at startup.                       |
| Mid-stream scan failure leaves dataset partially loaded            | Cosmos returned an error after some rows had been emitted; mid-stream retry is not safe.   | The dataset refresh policy retries at the query boundary. For incidental failures, lower the `query` row count or accelerate.     |
