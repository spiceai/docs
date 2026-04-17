---
title: 'DynamoDB Data Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the DynamoDB data connector in production: IAM, streams, checkpointing, lag behavior, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - dynamodb
  - observability
---

Production operating guide for the DynamoDB data connector covering IAM, DynamoDB Streams CDC, checkpointing, and lag handling.

## Authentication & Secrets

DynamoDB authentication uses the standard AWS credential chain. Configure via the same parameters as the [S3 connector](../s3/deployment#authentication--secrets):

| Parameter             | Description                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| `dynamodb_region`     | AWS region of the DynamoDB table.                                                                        |
| `dynamodb_access_key_id` | Explicit access key (optional; falls back to the credential chain when unset).                       |
| `dynamodb_secret_access_key` | Explicit secret key (optional).                                                                   |
| `dynamodb_session_token` | Session token for temporary credentials (optional).                                                  |

For production on EKS/ECS, leave access-key parameters unset and rely on instance-profile, IRSA, or ECS task-role credentials. Grant the role `dynamodb:Scan`, `dynamodb:Query`, and `dynamodb:DescribeTable` on the table; for streams, additionally grant `dynamodb:DescribeStream`, `dynamodb:GetShardIterator`, `dynamodb:GetRecords`, and `dynamodb:ListStreams`.

Secrets should be sourced from a [secret store](../../secret-stores/) when not using IAM role auth.

## Resilience Controls

### Streams and Checkpointing

The DynamoDB connector supports CDC via DynamoDB Streams with an accelerated dataset as the sink. Stream state is persisted as a checkpoint alongside the accelerator, allowing resumption after a restart.

| Parameter                      | Default  | Description                                                                                                              |
| ------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `dynamodb_stream_poll_interval_ms` | *(stream-dependent)* | Interval between polls for new records in a DynamoDB stream.                                                 |
| `dynamodb_stream_ready_lag_ms` | *(stream-dependent)* | Once lag falls below this threshold, the dataset is reported as `Ready`.                                                 |
| `dynamodb_stream_shard_not_found_behavior` | `error` | Behavior when stream lag exceeds shard retention (24h): `error`, `ready_before_load`, or `ready_after_load`. |

### Shard Retention and Lag

DynamoDB Streams retain records for 24 hours. If Spice is offline longer than the retention window, the checkpoint becomes stale and the next stream open returns `ShardNotFound`. Behavior is controlled by `dynamodb_stream_shard_not_found_behavior`:

- **`error`** (default): Mark the dataset `Error`. Requires operator intervention to re-bootstrap.
- **`ready_before_load`**: Mark the dataset `Ready` immediately, then re-bootstrap the accelerated dataset in the background. Queries see stale data until the bootstrap completes.
- **`ready_after_load`**: Re-bootstrap the accelerated dataset, then mark it `Ready`. Queries block / return `Error` during bootstrap.

A checkpoint older than **18 hours** is treated as near-expired and triggers the same recovery path even if the shard has not yet been dropped by DynamoDB.

## Capacity & Sizing

- **Read capacity**: Full-table scans consume provisioned read capacity. Use on-demand billing or reserve sufficient RCU for refresh windows to avoid throttling.
- **Stream throughput**: DynamoDB Streams shards cap at 1000 records/sec and 2 MB/sec each. Wide or high-write tables automatically partition into more shards.
- **Checkpoint storage**: Checkpoint records live in the acceleration engine and add roughly one row per stream shard. Negligible for sizing.

## Metrics

The DynamoDB connector collects stream metrics via the embedded `MetricsCollector`. Metrics include:

| Metric                               | Description                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| `dynamodb_stream_records_total`      | Total stream records processed.                                                 |
| `dynamodb_stream_lag_ms`             | Current lag behind the stream head (approximate, per shard).                    |
| `dynamodb_stream_shard_count`        | Active shard count.                                                             |
| `dynamodb_stream_errors_total`       | Stream read errors.                                                             |
| `dynamodb_stream_checkpoint_age_ms`  | Time since the last successful checkpoint.                                      |

Metric names are exposed with the prefix `dataset_dynamodb_`. Monitor `dynamodb_stream_lag_ms` and `dynamodb_stream_checkpoint_age_ms` together — a climbing lag with a stale checkpoint indicates the connector is falling behind retention.

See [Component Metrics](../../../features/observability/component_metrics) for enabling and exporting metrics.

## Task History

Stream polling and bootstrap operations emit spans that participate in [task history](../../../reference/task_history) under the enclosing `accelerated_table_refresh` and changes-stream tasks.

## Known Limitations

- **Global Secondary Indexes**: Not exposed as separate datasets. Query the base table and let DataFusion filter.
- **Conditional writes / writes**: Read-only connector; writes are not supported.
- **Cross-region streams**: Must configure `dynamodb_region` to match the region of the source table; cross-region access requires resource policies and is not recommended.
- **Table with `StreamSpecification` disabled**: CDC mode is unavailable; fall back to full-table refresh.

## Troubleshooting

| Symptom                                         | Likely cause                                                           | Resolution                                                                                                       |
| ----------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Dataset stuck in `Error` after restart with stream enabled | Checkpoint older than 18h or exceeded 24h retention.              | Set `dynamodb_stream_shard_not_found_behavior: ready_after_load` to auto-recover, or trigger a manual refresh.   |
| `ProvisionedThroughputExceededException`         | RCU exhausted during initial scan.                                     | Switch to on-demand billing, raise RCU for the refresh window, or slow the refresh via acceleration settings.    |
| `TrimmedDataAccessException`                     | Records trimmed from the stream before they could be processed.        | Same recovery path as `ShardNotFound` — re-bootstrap. Reduce bootstrap duration via parallel segments if supported. |
| `AccessDeniedException` on `DescribeStream`      | IAM role lacks stream permissions.                                     | Add `dynamodb:DescribeStream`, `GetShardIterator`, `GetRecords`, `ListStreams` to the role.                     |
| `ResourceNotFoundException` on stream start      | Stream not enabled on the table.                                       | Enable streams on the DynamoDB table (`NEW_AND_OLD_IMAGES` recommended).                                         |
