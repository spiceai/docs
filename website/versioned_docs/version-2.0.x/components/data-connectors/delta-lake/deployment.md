---
title: 'Delta Lake Data Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the Delta Lake data connector in production: object store auth, metadata caching, metrics, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - delta-lake
  - observability
---

Production operating guide for the Delta Lake data connector covering object-store authentication, metadata handling, and operational tuning.

## Authentication & Secrets

The Delta Lake connector reads Delta tables directly from an underlying object store (S3, ABFS/Azure, GCS, or the local filesystem). Authentication parameters depend on the object store:

| Object store            | Auth parameters                                                                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **S3** / S3-compatible  | `delta_lake_aws_region`, `delta_lake_aws_access_key_id`, `delta_lake_aws_secret_access_key`, `delta_lake_aws_session_token`, `delta_lake_aws_endpoint`, `delta_lake_aws_allow_http`. Defaults to the AWS credential chain when unset. |
| **Azure ADLS**          | `delta_lake_azure_storage_account_name`, `delta_lake_azure_storage_account_key`, `delta_lake_azure_storage_client_id`, `delta_lake_azure_storage_client_secret`, `delta_lake_azure_storage_sas_key`, `delta_lake_azure_storage_endpoint`, `delta_lake_azure_storage_tenant_id`. |
| **Google Cloud Storage**| `delta_lake_google_service_account`.                                                                                                                      |
| **Local filesystem**    | No auth. Ensure the Spice process has read permission on the Delta table directory.                                                            |

Credentials must be sourced from a [secret store](../../secret-stores/) in production. For AWS deployments, prefer instance-profile or IRSA-based auth (leave `aws_access_key_id` unset).

### Databricks Unity Catalog

To access Delta tables registered in Unity Catalog, use the [Databricks connector](../databricks) in `mode: delta_lake`. It handles UC metadata resolution automatically — see the [Databricks Deployment Guide](../databricks/deployment) for details.

## Resilience Controls

### Object Store Retry

Object-store I/O uses the AWS/Azure/GCS SDK default retry strategies (adaptive backoff on throttling and transient 5xx responses). Per-operation retry parameters are not exposed at the Spice layer.

### Transaction Log Caching

The Delta Lake connector reads the `_delta_log` transaction log on each query plan. For high-query-rate workloads, accelerate the dataset (see [Acceleration](../../../features/data-acceleration/)) to avoid repeatedly scanning the log on the hot path.

## Capacity & Sizing

- **Metadata cost**: Reading a Delta table requires reading its `_delta_log`, which grows with every commit. Checkpointing (handled by the writer) bounds this cost. Ensure the writer is issuing checkpoints every 10-100 commits for large, high-churn tables.
- **Partition pruning**: The connector prunes partitions using Delta's partition metadata during query planning. Partition datasets by the dominant filter columns (date, tenant) for best performance.
- **Column pruning and predicate pushdown**: Filters and column projections are pushed down into the underlying Parquet readers. Queries over a narrow column set over a large table are efficient without requiring acceleration.
- **Acceleration sizing**: When materializing into DuckDB/SQLite/Postgres, size the target engine to hold the refreshed snapshot plus WAL overhead (typically 1.3–2× the raw Parquet size for row-oriented accelerators).

## Metrics

Object-store I/O metrics are collected via the shared `runtime-object-store` layer and exposed through Spice's runtime metrics. See [Component Metrics](../../../features/observability/component_metrics) for configuration.

The Delta Lake connector does not currently register connector-specific dataset-level instruments. Monitor Delta operations via:

- Query execution metrics (`query_duration_ms`, `query_processed_rows`) from `runtime.metrics`.
- Upstream cloud metrics (S3 request count, Azure blob throughput).
- Acceleration refresh metrics when the dataset is accelerated.

## Task History

Delta Lake reads participate in Spice [task history](../../../reference/task_history) through DataFusion's execution-plan spans. Individual object reads are attributed to their enclosing `sql_query` or `accelerated_table_refresh` task.

## Known Limitations

- **Read-only**: The Delta Lake connector cannot write or update Delta tables.
- **Time travel**: Querying by version or timestamp is not exposed through the connector; only the latest snapshot is read.
- **Drop table features**: Some Delta features (deletion vectors, column mapping, row tracking) may require specific writer protocol versions. See [Databricks docs on dropping Delta table features](https://docs.databricks.com/en/delta/drop-feature.html) when compatibility issues arise.
- **Change Data Feed (CDF)**: CDF is not exposed through the Delta Lake connector. For CDC, use the [Debezium](../debezium) connector against the source database, or use [Databricks](../databricks) mode to federate a CDF-enabled view.

## Troubleshooting

| Symptom                                           | Likely cause                                                        | Resolution                                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `Access Denied` on `_delta_log/` GET              | Role lacks read on the `_delta_log/` prefix.                        | Grant `s3:GetObject` / equivalent on the table root and `_delta_log/` prefix.               |
| Query returns an empty result after a new commit  | Stale transaction-log cache.                                        | Trigger a dataset refresh (acceleration) or re-plan the query.                              |
| `Protocol version unsupported`                    | Writer committed a newer Delta protocol version than the reader supports. | Upgrade Spice to a version with the required Delta protocol reader, or drop the writer feature. |
| Slow queries on very high-commit tables           | Transaction log grown very large without checkpoints.               | Ensure the writer is issuing checkpoints; consider acceleration.                            |
| `No such file or directory` for `_delta_log/...`  | Table is uninitialized or path is incorrect.                        | Confirm the `from:` path points at the Delta table root, not a data subdirectory.           |
