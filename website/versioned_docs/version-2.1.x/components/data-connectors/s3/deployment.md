---
title: 'S3 Data Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the S3 data connector in production: IAM, credential chains, file formats, metrics, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - s3
  - observability
---

Production operating guide for the S3 data connector covering IAM authentication, credential chains, file-format tuning, metrics, and observability.

## Authentication & Secrets

S3 authentication is selected via `s3_auth`:

| Value       | Behavior                                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| *(unset)*   | Default AWS credential chain (IAM-based). Equivalent to `iam_role` with `iam_role_source: auto`.             |
| `iam_role`  | Load credentials from the AWS credential chain; the source is further narrowed by `iam_role_source`.         |
| `key`       | Use the explicit `s3_key` / `s3_secret` pair. Required for S3-compatible stores that do not speak IAM (MinIO, Cloudflare R2 with keys, Backblaze B2, etc.). |
| `public`    | Unauthenticated access for public buckets.                                                                   |

### IAM Role Source

When `s3_auth` is unset or `iam_role`, the credential source is controlled by `iam_role_source`:

| Value       | Behavior                                                                                       |
| ----------- | ---------------------------------------------------------------------------------------------- |
| `auto`      | Default AWS credential chain (env vars → shared credentials file → IMDS/ECS/IRSA).              |
| `metadata`  | Restrict to instance/container metadata only: IMDS (EC2), ECS task role, EKS IRSA (pod role).  |
| `env`       | Restrict to environment variables only (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`). |

For production on EKS or ECS, prefer `iam_role_source: metadata` to guarantee the runtime only draws credentials from the workload identity, never from ambient environment variables.

### Key Auth for S3-Compatible Stores

For MinIO, R2, B2, or on-prem S3 gateways:

```yaml
params:
  s3_auth: key
  s3_key: ${secrets:s3_key}
  s3_secret: ${secrets:s3_secret}
  s3_endpoint: https://minio.internal:9000
  s3_region: us-east-1
```

Keys must be sourced from a secret store in production. See [Secret Stores](../../secret-stores/).

### Region Validation

`s3_region` is validated against AWS's known region set. Uppercase regions are auto-corrected to lowercase with a warning. Unrecognized regions produce a startup warning but do not prevent the connector from starting. Custom S3-compatible endpoints still require a valid-looking AWS region code.

## Resilience Controls

### Retry Behavior

S3 I/O uses the AWS SDK's default retry strategy: standard adaptive backoff with retries on throttling (`SlowDown`, `503`) and transient network errors. Per-operation retry parameters are not currently exposed at the Spice layer.

### Permanent Failures

Authentication failures (`401`, `403`) and missing buckets (`404`) surface immediately as query errors. Unlike the Databricks connector, the S3 connector does not permanently disable itself — subsequent queries re-attempt authentication, so transient IAM or network issues self-heal.

## Capacity & Sizing

- **Object store throughput**: S3 scales horizontally per prefix. For large Parquet workloads, partition data by date or tenant to maximize parallel reads.
- **Hive partitioning**: Enable `hive_partitioning_enabled: true` when listing partitioned datasets so DataFusion can prune irrelevant partitions at plan time instead of listing and filtering at execution time.
- **Schema inference cost**: On first registration, Spice samples files to infer schema. Provide an explicit `schema` in the dataset definition for large datasets to avoid repeated list/head operations.
- **DataFusion batch size**: Object-store reads yield 8192-row record batches by default. Increase via runtime tuning for CPU-bound scans over compressed formats.

## Metrics

The `runtime-object-store` layer that performs S3 I/O is not instrumented, so Spice does not emit S3 transport metrics (request counts, retries, bytes read). See [Component Metrics](../../../features/observability/component_metrics) for the metrics that are available.

The connector does not currently register S3-specific dataset-level instruments. Monitor S3 health via:

- Standard AWS CloudWatch metrics on the bucket (`AllRequests`, `4xxErrors`, `5xxErrors`, `TotalRequestLatency`).
- Spice's query-execution metrics (`query_duration_ms`, `query_returned_rows`) from `runtime.metrics`.

## Task History

S3 object reads participate in Spice [task history](../../../reference/task_history) through DataFusion's object-store plan nodes. Individual object GETs are attributed to their enclosing `sql_query` or `accelerated_table_refresh` task via the DataFusion execution plan.

## Known Limitations

- Writes are not supported; the S3 connector is read-only.
- S3 Express One Zone directory buckets are supported transparently via `s3://` URIs when the region and endpoint match.
- Server-side encryption with customer-provided keys (SSE-C) is not exposed; SSE-S3 and SSE-KMS work transparently when the role/user has KMS decrypt permission.
- Requester-pays buckets are not currently supported.
- Cross-region access incurs AWS data-transfer charges; place Spice in the same region as the bucket for best cost and latency.

## Troubleshooting

| Symptom                                         | Likely cause                                                 | Resolution                                                                                        |
| ----------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `The request signature we calculated does not match the signature you provided` | Clock skew or wrong `s3_key`/`s3_secret`. | Verify secret values; check system clock (AWS tolerates only ~15 min drift).                      |
| `Access Denied`                                 | IAM policy lacks `s3:GetObject` or `s3:ListBucket`.          | Attach a policy granting read on the bucket and prefix. Cross-account buckets also need bucket policy. |
| `NoSuchBucket`                                  | Bucket does not exist in the configured region.              | Confirm bucket name and `s3_region`.                                                              |
| `EnvCredentialsNotSet` on EKS                   | `iam_role_source: env` while running under IRSA.             | Set `iam_role_source: metadata` or `auto`.                                                        |
| `InvalidSignatureException` against MinIO/R2    | `s3_endpoint` not set or AWS SDK trying to sign for AWS S3.  | Set `s3_endpoint` and `s3_region` to match the S3-compatible provider.                            |
| Slow queries on large partitioned datasets      | Hive partitioning not enabled; every scan lists all files.   | Set `hive_partitioning_enabled: true` and encode partitions as `key=value/` in the path.          |
