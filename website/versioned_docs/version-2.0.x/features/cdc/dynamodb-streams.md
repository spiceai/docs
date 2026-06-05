---
title: 'DynamoDB Streams (Native CDC)'
sidebar_label: 'DynamoDB Streams'
description: 'Stream INSERT, UPDATE, and DELETE events from Amazon DynamoDB directly into a Spice-accelerated dataset using DynamoDB Streams.'
sidebar_position: 3
pagination_prev: null
pagination_next: null
---

Stream every `INSERT`, `UPDATE`, and `DELETE` from an Amazon DynamoDB table directly into a Spice-accelerated dataset using [DynamoDB Streams](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html).

This is the recommended way to keep a Spice accelerator ([DuckDB](../../components/data-accelerators/duckdb), [SQLite](../../components/data-accelerators/sqlite), [PostgreSQL](../../components/data-accelerators/postgres), Cayenne) continuously in sync with a DynamoDB source — no Kafka, no Debezium, no Lambda required.

## How it works

```
┌──────────────────┐    DynamoDB Streams    ┌───────────────────┐    ChangeBatch     ┌───────────────┐
│   DynamoDB       │──────────────────────▶│   Spice runtime   │──────────────────▶│  Accelerator  │
│   table          │   shard iterators      │  (dynamodb        │   (INSERT/        │  DuckDB /     │
│   + stream       │                        │   connector)      │    UPDATE /       │  SQLite /     │
│                  │                        │                   │    DELETE)        │  Postgres /   │
└──────────────────┘                        └───────────────────┘                   │  Cayenne      │
                                                                                    └───────────────┘
```

On first start the connector:

1. Bootstraps the accelerator with a full `Scan` of the source table so initial state is captured.
2. Subscribes to each open **stream shard** and begins polling for records.
3. Applies each `INSERT` / `MODIFY` / `REMOVE` event as a row-level change to the accelerator.

The dataset reports `Ready` once stream lag drops below `ready_lag` (default `2s`).

On subsequent restarts, file-backed accelerators resume from the persisted shard checkpoint instead of re-scanning the source table.

## Prerequisites

### 1. Enable Streams on the source table

Streams must be enabled with view type **`NEW_AND_OLD_IMAGES`** so Spice receives both the old and new image of every modified item.

```bash
aws dynamodb update-table \
  --table-name orders \
  --stream-specification StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES
```

### 2. IAM permissions

The credentials Spice uses need both table and stream actions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:DescribeTable",
        "dynamodb:Scan",
        "dynamodb:DescribeStream",
        "dynamodb:GetShardIterator",
        "dynamodb:GetRecords",
        "dynamodb:ListStreams"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/orders",
        "arn:aws:dynamodb:*:*:table/orders/stream/*"
      ]
    }
  ]
}
```

### 3. Acceleration must be enabled with `refresh_mode: changes`

Using DynamoDB Streams **requires** acceleration with `refresh_mode: changes`. Supported engines are `duckdb`, `sqlite`, `postgres`, and `cayenne`.

## Minimal configuration

```yaml
datasets:
  - from: dynamodb:orders
    name: orders_stream
    params:
      dynamodb_aws_region: us-east-1
      dynamodb_aws_access_key_id: ${secrets:aws_access_key_id}
      dynamodb_aws_secret_access_key: ${secrets:aws_secret_access_key}
    acceleration:
      enabled: true
      engine: duckdb
      mode: file              # Persistence is recommended so restarts skip the initial Scan
      refresh_mode: changes
```

## Tuning

```yaml
datasets:
  - from: dynamodb:orders
    name: orders_stream
    params:
      scan_interval: 100ms    # Poll DynamoDB Streams every 100 ms (default 0s)
      ready_lag: 1s           # Report Ready when stream lag drops below 1s (default 2s)
      lag_exceeds_shard_retention_behavior: ready_before_load   # Behavior on > 24h lag
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      refresh_mode: changes
      snapshots: enabled
      snapshots_trigger: stream_batches
      snapshots_trigger_threshold: 5     # Snapshot every 5 batch updates
```

- `scan_interval` — Polling frequency for new records. Lower values give lower latency at the cost of more `GetRecords` API calls.
- `ready_lag` — Maximum stream lag before the dataset is reported `Ready` for queries. Defaults to `2s`.
- `lag_exceeds_shard_retention_behavior` — What to do when stream lag exceeds the DynamoDB shard retention window (24h). One of `error` (default), `ready_before_load`, or `ready_after_load`. See the [connector parameter reference](../../components/data-connectors/dynamodb/index.md#params) for the full description.
- `snapshots_trigger: stream_batches` and `snapshots_trigger_threshold` let you trigger acceleration snapshots based on stream-batch counts rather than wall time. See [Acceleration Snapshots](../data-acceleration/snapshots.md).

## Metrics

The connector exposes the following [component metrics](../observability/component_metrics.md) for monitoring streaming health:

| Metric                                                   | Type    | Description                                                                |
| -------------------------------------------------------- | ------- | -------------------------------------------------------------------------- |
| `shards_active`                                          | Gauge   | Current number of active shards in the stream                              |
| `records_consumed_total`                                 | Counter | Total number of records consumed from the stream                           |
| `lag_ms`                                                 | Gauge   | Current lag in milliseconds between stream watermark and now               |
| `errors_transient_total`                                 | Counter | Total number of transient errors encountered while polling from the stream |
| `reinitializations_on_lag_exceeds_shard_retention_total` | Counter | Total rebootstrap operations triggered due to expired shards               |

These metrics are opt-in. See the [DynamoDB Streams Metrics](../../components/data-connectors/dynamodb/index.md#metrics) section of the connector docs for an example `metrics:` block and a sample Grafana dashboard.

## Limitations

- DynamoDB Streams shards are retained for 24 hours. If Spice falls behind by more than that, the connector follows `lag_exceeds_shard_retention_behavior` (default: `error`).
- `refresh_sql` is not supported with DynamoDB Streams.

## See also

- [DynamoDB Data Connector](../../components/data-connectors/dynamodb/index.md) — complete parameter reference, deployment guide, and supported AWS regions.
- [DynamoDB Streams cookbook recipe](https://github.com/spiceai/cookbook/tree/trunk/dynamodb/streams#readme).
- [`refresh_mode: changes`](../data-acceleration/refresh-modes/changes.md) — refresh-mode reference.
