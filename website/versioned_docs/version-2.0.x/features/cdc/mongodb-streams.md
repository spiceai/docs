---
title: 'MongoDB Change Streams (Native CDC)'
sidebar_label: 'MongoDB Change Streams'
description: 'Stream insert, update, replace, and delete events from MongoDB directly into a Spice-accelerated dataset using MongoDB Change Streams.'
sidebar_position: 4
pagination_prev: null
pagination_next: null
---

Stream every insert, update, replace, and delete from a MongoDB collection directly into a Spice-accelerated dataset using native [MongoDB Change Streams](https://www.mongodb.com/docs/manual/changeStreams/).

This is the recommended way to keep a Spice accelerator ([DuckDB](../../components/data-accelerators/duckdb), [SQLite](../../components/data-accelerators/sqlite), [PostgreSQL](../../components/data-accelerators/postgres), [Turso](../../components/data-accelerators/turso), Cayenne) continuously in sync with a MongoDB source — no Kafka, no Debezium, no external services.

## How it works

```
┌──────────────────┐     Change Streams       ┌───────────────────┐    ChangeBatch     ┌───────────────┐
│   MongoDB        │ ───────────────────────▶│   Spice runtime   │──────────────────▶│  Accelerator  │
│   replica set /  │  fullDocument=           │  (mongodb         │   (INSERT/        │  DuckDB /     │
│   sharded        │    updateLookup          │   connector)      │    UPDATE /       │  SQLite /     │
│   cluster        │  + resume tokens         │                   │    DELETE)        │  Postgres /   │
└──────────────────┘                          └───────────────────┘                   │  Turso /      │
                                                                                      │  Cayenne      │
                                                                                      └───────────────┘
```

On first start the connector:

1. Opens a Change Stream on the source collection with `fullDocument=updateLookup`.
2. Emits a CDC `TRUNCATE` and applies a full snapshot of the collection as upsert rows.
3. Signals readiness, then processes Change Stream events in batches.

Opening the Change Stream **before** the snapshot prevents gaps between the snapshot and the live stream.

For file-backed accelerators (acceleration `mode: file` / `file_create` / `file_update`, or `engine: postgres`), Spice persists the most recent Change Stream resume token in a sidecar table named `spice_sys_mongodb` alongside the accelerator data. The token is committed only after the downstream accelerator write succeeds (at-least-once semantics). On restart, Spice resumes from the persisted token and skips the snapshot.

In-memory accelerators do not persist a resume token; restarts re-bootstrap from a fresh snapshot.

## Prerequisites

- **MongoDB 4.0+** with Change Streams enabled. MongoDB requires a **replica set** or **sharded cluster** — single-node `mongod` deployments do not support Change Streams.
- The MongoDB user must have the `changeStream` privilege on the source collection.
- The accelerator must support upsert behavior — use `duckdb`, `sqlite`, `postgres`, `turso`, or `cayenne`.
- `acceleration.primary_key: _id` is required. Delete events only include the document key, so Spice needs `_id` to route deletes.
- `acceleration.on_conflict` must specify `upsert` on `_id` so update and replace events overwrite existing rows.

## Minimal configuration

```yaml
datasets:
  - from: mongodb:users
    name: users
    params:
      mongodb_host: localhost
      mongodb_port: '27017'
      mongodb_db: my_database
      mongodb_user: my_user
      mongodb_pass: ${secrets:mongodb_pass}
    acceleration:
      enabled: true
      engine: duckdb
      mode: file              # Persist resume tokens so restarts skip the snapshot
      refresh_mode: changes
      primary_key: _id
      on_conflict:
        _id: upsert
```

## Tuning

These optional runtime parameters live under dataset `params:`. Defaults are reasonable; tune only when you have a specific batching or oplog-window concern.

| Parameter Name                            | Default | Description                                                                                                                          |
| ----------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `change_stream_batch_max_size`            | `1000`  | Max number of Change Stream events to group into one CDC batch before applying it.                                                   |
| `change_stream_batch_max_duration`        | `1s`    | Max time to wait for a Change Stream batch to fill before applying it. Accepts [fundu](https://docs.rs/fundu) duration strings.       |
| `change_stream_max_await_time`            | `1s`    | Max time MongoDB waits for new events before returning an empty server batch. Accepts fundu duration strings.                        |
| `change_stream_batch_size`                | `1000`  | Number of Change Stream events MongoDB should request from the server per batch.                                                     |
| `mongodb_resume_token_invalid_behavior`   | `error` | Behavior when a persisted resume token is rejected (e.g. past the oplog window). `error` surfaces the failure; `rebootstrap` drops the token and re-snapshots. |

The existing `mongodb_unnest_depth` parameter applies to Change Stream documents too, so nested BSON is flattened the same way as normal MongoDB reads.

## Event mapping

| MongoDB event   | Applied as              | Notes                                                                                       |
| --------------- | ----------------------- | ------------------------------------------------------------------------------------------- |
| `insert`        | create / upsert         | Uses `fullDocument`.                                                                        |
| `update`        | update / upsert         | Uses `fullDocument` from `fullDocument=updateLookup`.                                       |
| `replace`       | update / upsert         | Uses `fullDocument`.                                                                        |
| `delete`        | delete                  | Uses `documentKey`; non-key columns are `null`.                                             |
| `drop`, `rename`, `dropDatabase`, `invalidate` | truncate | Collection continuity is no longer guaranteed; the accelerator is reset and re-bootstrapped. |

If MongoDB does not include `fullDocument` for an update or replace event, Spice fails the stream with a clear error instead of applying a partial row.

## Resumability across restarts

For file-accelerated datasets, the persisted resume token lets Spice resume from where it left off without re-snapshotting. When MongoDB rejects the token (typical codes `ChangeStreamHistoryLost` 286 or `ChangeStreamFatalError` 280 — usually when the oplog window has rolled past the token's position), the behavior is governed by `mongodb_resume_token_invalid_behavior`:

- `error` (default) — Spice surfaces a clear error and stops; the operator decides what to do.
- `rebootstrap` — Spice drops the persisted token and re-snapshots the collection.

Re-snapshotting a large collection is opt-in by default to prevent silent expensive rebootstraps.

## Limitations

- Change Streams require a replica set or sharded cluster — they do not work against a single-node `mongod`.
- `refresh_sql` is not supported with Change Streams.
- In-memory accelerators do not persist resume tokens; every restart re-snapshots.

## See also

- [MongoDB Data Connector](../../components/data-connectors/mongodb.md) — complete parameter reference and connection options.
- [`refresh_mode: changes`](../data-acceleration/refresh-modes/changes.md) — refresh-mode reference.
