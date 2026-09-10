---
title: 'Unity Catalog Catalog Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the Unity Catalog catalog connector in production: workspace authentication, table-type filtering, effective-permissions flow, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - catalogs
  - unity-catalog
  - observability
---

Production operating guide for the Unity Catalog catalog connector — discovering Databricks Unity Catalog tables and federating them through Spice.

For Databricks-specific operational concerns (SQL Warehouse resilience, metrics, permissions flow as applied to Databricks workspaces), see the [Databricks Deployment Guide](../../data-connectors/databricks/deployment) — the Unity Catalog logic described there applies directly when the catalog connector targets a Databricks workspace.

## Authentication & Secrets

| Parameter              | Description                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `unity_catalog_token`  | Bearer token for the Unity Catalog API. Use `${secrets:...}` from a secret store.     |

The catalog URL must match the pattern `https://<host>/api/2.1/unity-catalog/catalogs/<catalog_id>` and is parsed into the endpoint and catalog identifier at startup. Mismatched URLs are rejected as configuration errors.

The token is optional — when unset, the catalog connector issues unauthenticated requests, suitable for locally-hosted Unity Catalog deployments (OSS UC) with permissive access. For Databricks workspaces, the token is always required.

Secrets must be sourced from a [secret store](../../secret-stores/) in production. Rotate tokens from the UC / Databricks console and update the secret store.

## Resilience Controls

### HTTP Retry Policy

The Unity Catalog client uses the shared `resilient_http` helper with these defaults:

- Maximum retries: **3**
- Backoff: fibonacci
- Retriable conditions: HTTP `408`, `429`, `5xx`, and transient network errors (connect, timeout)
- Respects `Retry-After`, `retry-after-ms`, `x-retry-after-ms` headers
- Maximum backoff: 300 seconds

These are not exposed as user-tunable parameters on the Unity Catalog connector itself.

### Discovery Concurrency

The connector fans out schema and table enumeration with bounded concurrency to avoid thundering-herd on the UC API:

- Schema refresh: up to **5** concurrent requests (`buffer_unordered(5)`)
- Permission checks: up to **5** concurrent requests (`buffer_unordered(5)`)

For catalogs with thousands of tables, initial discovery can take minutes while the connector respects these limits.

## Table Type and Permission Handling

### Table Type Filtering

| Table Type          | Supported | Notes                                  |
| ------------------- | --------- | -------------------------------------- |
| `MANAGED`           | Yes       | Standard Delta tables                  |
| `EXTERNAL`          | Yes       | Tables with external storage locations |
| `FOREIGN`           | Yes       | Lakehouse Federation foreign tables    |
| `MATERIALIZED_VIEW` | Yes       | Materialized views                     |
| `VIEW`              | No        | Skipped during discovery               |
| `STREAMING_TABLE`   | No        | Skipped during discovery               |

Unsupported table types are skipped during catalog discovery. When referenced directly, an error is returned.

### Effective Permissions

Before creating a table provider, the connector checks permissions via `GET /api/2.1/unity-catalog/effective-permissions/table/{catalog.schema.table}`. The following privileges grant read access:

- `SELECT`
- `ALL_PRIVILEGES` / `ALL PRIVILEGES`
- `OWNER` / `OWNERSHIP`

**Behavior**:

- **Discovery**: Tables without read permission are skipped.
- **Direct reference**: An `InsufficientPermissions` error is returned.
- **Foreign tables**: The precheck is skipped (`requires_read_permission_validation = false`) because Lakehouse Federation access can be valid when the UC effective-permissions endpoint does not report a table-level privilege. Access is still enforced by Databricks at query time.
- **Graceful degradation**: If the UC API is unreachable or returns an error for the permissions endpoint, discovery proceeds with a warning — table providers are still created, and any per-query authorization failures surface at query time.

## Capacity & Sizing

- **Initial discovery**: Scales with the number of schemas × tables. Bounded concurrency caps throughput; plan 5–30 minutes for catalogs with thousands of tables on a cold start.
- **Refresh**: The catalog waits **60 seconds**, then re-lists the tables of each schema it discovered at startup, adding and dropping table providers as the source changes. The wait begins after the previous pass finishes, so passes start 60 seconds apart *plus* the time a pass takes — for a catalog of thousands of tables, that pass time dominates the interval. The wait is not configurable, so the cadence cannot be lengthened for very large catalogs. The schema list itself is built once when the catalog first loads and is never re-listed, so a schema created in Unity Catalog after Spice started is not picked up until Spice restarts.
- **Permission-check cost**: One API call per table. The buffer of 5 caps concurrency.

## Metrics

The Unity Catalog connector does not currently register UC-specific OpenTelemetry metric instruments. When used via the Databricks connector, the shared SQL Warehouse and UC spans produce task-history records that can be aggregated for operational insight.

Monitor via:

- Spice query execution metrics (`query_duration_ms`, `query_returned_rows`) from `runtime.metrics`.
- Task-history spans listed below.
- Databricks / UC workspace audit logs for API-level visibility.

See [Component Metrics](../../../features/observability/component_metrics) for general configuration.

## Task History

Unity Catalog operations emit the following [task history](../../../reference/task_history) spans:

| Span                           | Input                         | Description                              |
| ------------------------------ | ----------------------------- | ---------------------------------------- |
| `uc_get_table`                 | Fully-qualified table name    | Fetch table metadata from Unity Catalog. |
| `uc_get_catalog`               | Catalog ID                    | Fetch catalog metadata.                  |
| `uc_list_schemas`              | Catalog ID                    | List schemas in a catalog.               |
| `uc_list_tables`               | `catalog_id.schema_name`      | List tables in a schema.                 |
| `uc_get_effective_permissions` | Fully-qualified table name    | Check effective permissions for a table. |

## Known Limitations

- **VIEW and STREAMING_TABLE are skipped**: Only queryable table types are exposed.
- **Refresh cadence is fixed**: The 60-second wait between refresh passes is not user-configurable, and because it is a wait *between* passes, the effective interval is 60 seconds plus the duration of a pass.
- **New schemas need a restart**: Refresh re-lists tables inside the schemas found at startup; a schema added to the catalog afterwards appears only after Spice restarts.
- **No UC write-back**: The connector is read-only; writes to UC are not supported through Spice.
- **HTTP retry/concurrency parameters not exposed**: The resilient-HTTP defaults (3 retries, fibonacci backoff, concurrency 5) are not currently user-tunable on the UC connector.
- **Graceful degradation on permission-endpoint failures**: If UC effective-permissions is unreachable, Spice proceeds; authorization errors surface at query time rather than discovery time.

## Troubleshooting

| Symptom                                                                 | Likely cause                                                       | Resolution                                                                                                                  |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `401 Unauthorized` on catalog list                                      | Missing, expired, or wrong-workspace token.                        | Regenerate token in UC / Databricks; update secret store.                                                                   |
| Table visible in UC but missing from the Spice catalog                  | Table type is VIEW / STREAMING_TABLE, permissions were denied, or its schema was created after Spice started. | Confirm the table type is supported and that the principal has `SELECT` (or equivalent); restart Spice to pick up a schema created after startup. |
| `InsufficientPermissions` on direct table reference                     | Role lacks read privilege on the table.                            | Grant `SELECT` on the table in UC.                                                                                          |
| Slow catalog discovery on thousands of tables                           | Bounded concurrency + permission checks per table.                 | Expected behavior; schedule discovery during low-traffic windows and cache via accelerated datasets.                         |
| Tables from a Lakehouse Federation source missing                       | FOREIGN precheck passed but Databricks denied at query time.       | Verify the Databricks workspace has federation privileges granted to the principal.                                          |
