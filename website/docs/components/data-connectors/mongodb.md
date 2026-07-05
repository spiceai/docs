---
title: 'MongoDB Data Connector'
sidebar_label: 'MongoDB Data Connector'
description: 'MongoDB Data Connector Documentation'
tags:
  - data-connectors
  - mongodb
---

MongoDB is an open-source NoSQL database that stores data in flexible, JSON-like documents, supporting dynamic schemas and easy scalability.

The MongoDB Data Connector enables federated/accelerated SQL queries on data stored in MongoDB databases.

```yaml
datasets:
  - from: mongodb:mytable
    name: my_dataset
    params:
      mongodb_host: localhost
      mongodb_port: 27017
      mongodb_db: my_database
      mongodb_user: my_user
      mongodb_pass: ${secrets:mongodb_pass}
      mongodb_pool_min: 1
      mongodb_pool_max: 10
```

## Configuration

### `from`

The `from` field takes the form `mongodb:{table_name}` where `table_name` is the table identifer in the MongoDB server to read from.

:::info
Unquoted identifiers are normalized to lowercase. To reference a collection with mixed-case characters, wrap it in double quotes: `mongodb:"MixedCaseCollection"`. See [Identifier Case Sensitivity](./index.md#identifier-case-sensitivity-and-quoting).
:::

```yaml
datasets:
  - from: mongodb:mytable
    name: my_dataset
    params:
      mongodb_db: my_database
      ...
```

### `name`

The dataset name. This will be used as the table name within Spice.

Example:

```yaml
datasets:
  - from: mongodb:my_dataset
    name: cool_dataset
    params: ...
```

```sql
SELECT COUNT(*) FROM cool_dataset;
```

```shell
+----------+
| count(*) |
+----------+
| 6001215  |
+----------+
```

The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords)

### `params`

The MongoDB data connector can be configured by providing the following `params`. Use the [secret replacement syntax](../secret-stores) to load the secret from a secret store, e.g. `${secrets:my_mongodb_conn_string}`.

| Parameter Name                     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mongodb_connection_string`        | The connection string to use to connect to the MongoDB server. This can be used instead of providing individual connection parameters.                                                                                                                                                                                                                                                                                                                                                                       |
| `mongodb_user`                     | The MongoDB username.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `mongodb_pass`                     | The password to connect with.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `mongodb_host`                     | The hostname of the MongoDB server. Defaults to `localhost`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `mongodb_port`                     | The port of the MongoDB server. Defaults to `27017`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `mongodb_db`                       | The name of the database to connect to. Defaults to `default`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `mongodb_sslmode`                  | Optional. Specifies the SSL/TLS behavior for the connection, supported values:<br /> <ul><li>`required`: (default) This mode requires an SSL connection. If a secure connection cannot be established, server will not connect.</li><li>`preferred`: Establishes an encrypted TLS/SSL connection but does not validate the server certificate or hostname (accepts invalid or self-signed certificates). If the server does not support TLS, the connection fails; it is never downgraded to plaintext.</li><li>`disabled`: This mode will not attempt to use an SSL connection, even if the server supports it.</li></ul> |
| `mongodb_sslrootcert`              | Optional parameter specifying the path to a custom PEM certificate that the connector will trust.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `mongodb_time_zone`                | Optional. Specifies connection time zone. Default is `UTC`. Accepts: <br /><ul><li>Fixed offsets (e.g., `+02:00`).</li><li>IANA time zone names (e.g., `America/Los_Angeles`)</li></ul>                                                                                                                                                                                                                                                                                                                      |
| `mongodb_auth_source`              | Optional. Authentication source database. Overrides the default auth source in the connection string.                                                                                                                                                                                                                                                                                                                                                                                                        |
| `mongodb_direct_connection`        | Optional. Whether to connect directly to a single MongoDB host instead of discovering the topology. Accepts `true` or `false`.                                                                                                                                                                                                                                                                                                                                                                               |
| `mongodb_srv`                      | Optional. Use the `mongodb+srv://` connection scheme for DNS SRV record discovery (MongoDB Atlas). Auto-detected (and `mongodb_port` is ignored) when `mongodb_host` ends with `.mongodb.net`. Accepts `true` or `false`. Default: `false`.                                                                                                                                                                                                                                                                  |
| `mongodb_unnest_depth`             | Optional. Maximum nesting depth for unnesting embedded documents into a flattened structure. Higher values expand deeper nested fields. Default: `0`                                                                                                                                                                                                                                                                                                                                                         |
| `mongodb_schema_infer_max_records` | Optional. Number of documents to use to infer the schema. Defaults to 400.                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `mongodb_num_docs_to_infer_schema` | Optional. **Deprecated** — use `mongodb_schema_infer_max_records` instead. Number of documents to use to infer the schema. Defaults to 400. If both are set, `mongodb_schema_infer_max_records` takes precedence.                                                                                                                                                                                                                                                                                             |
| `mongodb_pool_min`                 | The minimum number of connections to keep open in the pool, lazily created when requested. Default: `1`                                                                                                                                                                                                                                                                                                                                                                                                      |
| `mongodb_pool_max`                 | The maximum number of connections to allow in the pool. Default: `5`                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `mongodb_resume_token_invalid_behavior` | Optional. Used with `refresh_mode: changes`. Behavior when a persisted Change Stream resume token is rejected by the server (e.g. it is past the oplog window). `error` (default) surfaces a clear error; `rebootstrap` drops the persisted token and re-snapshots the collection. See [Using MongoDB Change Streams](#using-mongodb-change-streams).                                                                                                                                                          |
| `change_stream_batch_max_size`     | Optional. Used with `refresh_mode: changes`. Maximum number of Change Stream events grouped into one CDC batch before applying it. Default: `1000`.                                                                                                                                                                                                                                                                                                                                                          |
| `change_stream_batch_max_duration` | Optional. Used with `refresh_mode: changes`. Maximum time to wait for a Change Stream batch to fill before applying it. Accepts [fundu](https://docs.rs/fundu) duration strings. Default: `1s`.                                                                                                                                                                                                                                                                                                              |
| `change_stream_max_await_time`     | Optional. Used with `refresh_mode: changes`. Maximum time MongoDB waits for new Change Stream events before returning an empty server batch. Accepts [fundu](https://docs.rs/fundu) duration strings. Default: `1s`.                                                                                                                                                                                                                                                                                         |
| `change_stream_batch_size`         | Optional. Used with `refresh_mode: changes`. Number of Change Stream events MongoDB should request from the server per batch. Default: `1000`.                                                                                                                                                                                                                                                                                                                                                               |

## Types

The table below shows the MongoDB data types supported, along with the type mapping to Apache Arrow types in Spice.

| MongoDB Type              | Arrow Type                           |
| ------------------------- | ------------------------------------ |
| `String`                  | `Utf8`                               |
| `Boolean`                 | `Boolean`                            |
| `Int32`                   | `Int32`                              |
| `Int64`                   | `Int64`                              |
| `Double`                  | `Float64`                            |
| `Decimal128`              | `Decimal128`                         |
| `Binary`                  | `Binary`                             |
| `Datetime` without time   | `Date32`                             |
| `Datetime` with time      | `Timestamp(Millisecond, <Timezone>)` |
| `Timestamp`               | `Timestamp(Millisecond, None)`       |
| `Array`                   | `List<Utf8>`                         |
| `Null`                    | `Null`                               |
| `Undefined`               | `Null`                               |
| `RegularExpression`       | `Utf8`                               |
| `JavaScriptCode`          | `Utf8`                               |
| `JavaScriptCodeWithScope` | `Utf8`                               |
| `Symbol`                  | `Utf8`                               |
| `MaxKey`                  | `Utf8`                               |
| `MinKey`                  | `Utf8`                               |
| `DbPointer`               | `Utf8`                               |
| `ObjectId`                | `Utf8`                               |
| `Document`                | See unnesting section                |


:::note

- The MongoDB `Datetime` value is [retrieved as a UTC time value](https://www.mongodb.com/docs/manual/reference/method/Date/) by default. Use the `mongodb_time_zone` configuration parameter to specify the desired time zone for interpreting `TIMESTAMP` values during data retrieval.

:::

## Unnesting

Consider the following document:
```json
{
  "a": 1,
  "b": {
    "x": 2,
    "y": {
      "z": 3
    }
  }
}
```

Using `mongodb_unnest_depth` you can control the unnesting behavior. Here are the examples:

### mongodb_unnest_depth: 0
```sql
sql> select * from test_table;
+-----------+---------------------+
| a (Int32) | b (Utf8)            |
+-----------+---------------------+
| 1         | {"x":2,"y":{"z":3}} |
+---+-----------------------------+
```

### mongodb_unnest_depth: 1
```sql
sql> select * from test_table;
+-----------+-------------+------------+
| a (Int32) | b.x (Int32) | b.y (Utf8) |
+-----------+-------------+------------+
| 1         | 2           | {"z":3}    | 
+-----------+-------------+------------+
```

### mongodb_unnest_depth: 2
```sql
sql> select * from test_table;
+-----------+-------------+---------------+
| a (Int32) | b.x (Int32) | b.y.z (Int32) |
+-----------+-------------+---------------+
| 1         | 2           | 3             |
+-----------+-------------+---------------+
```

## JSON Nesting

When a MongoDB collection has many fields but you only need a few as discrete columns, you can consolidate the rest into a single JSON column using the `json_object` metadata option. Declare the fields you want as top-level columns explicitly in the `columns` list, then add a "catch-all" column with `json_object: "*"` metadata — every field not otherwise listed is nested into it as a JSON object. This applies to both the query (scan) path and the [Change Streams](#using-mongodb-change-streams) (CDC) path.

```yaml
datasets:
  - from: mongodb:orders
    name: orders
    params:
      mongodb_host: localhost
      mongodb_db: shop
    columns:
      - name: _id
      - name: status
      - name: data_json
        metadata:
          json_object: '*'
```

Any field other than `_id`, `status`, and `data_json` is folded into `data_json` as a JSON object. The `_id` field must be declared explicitly and cannot be folded into the catch-all column.

:::warning[Limitations]

- The `json_object` metadata only accepts `"*"` as its value, which captures all unspecified fields.
- Only one column can carry the `json_object` metadata; declaring more than one is an error.

:::

## Examples

### Connecting using username and password and custom auth table

```yaml
datasets:
  - from: mongodb:my_dataset
    name: my_dataset
    params:
      mongodb_host: localhost
      mongodb_port: 27017
      mongodb_db: my_database
      mongodb_user: my_user
      mongodb_pass: ${secrets:mongodb_pass}
      mongodb_auth_source: admin
```

### Connecting using SSL

```yaml
datasets:
  - from: mongodb:my_dataset
    name: my_dataset
    params:
      mongodb_host: localhost
      mongodb_port: 27017
      mongodb_db: my_database
      mongodb_user: my_user
      mongodb_pass: ${secrets:mongodb_pass}
      mongodb_sslmode: preferred
      mongodb_sslrootcert: ./custom_cert.pem
```

### Connecting using a Connection String

```yaml
datasets:
  - from: mongodb:my_dataset
    name: my_dataset
    params:
      mongodb_connection_string: mongodb://${secrets:my_user}:${secrets:my_password}@localhost:27017/my_db?authSource=admin
```

### Connecting to MongoDB Atlas (SRV)

When `mongodb_host` ends with `.mongodb.net`, `mongodb_srv` is automatically enabled and `mongodb_port` is ignored — `mongodb+srv://` discovers host/port via DNS SRV records.

```yaml
datasets:
  - from: mongodb:my_collection
    name: my_dataset
    params:
      mongodb_host: cluster0.abc123.mongodb.net
      mongodb_db: my_database
      mongodb_user: my_user
      mongodb_pass: ${secrets:mongodb_pass}
```

Set `mongodb_srv: true` explicitly for non-Atlas hosts that are configured with SRV records:

```yaml
datasets:
  - from: mongodb:my_collection
    name: my_dataset
    params:
      mongodb_srv: true
      mongodb_host: mongo.example.com
      mongodb_db: my_database
      mongodb_user: my_user
      mongodb_pass: ${secrets:mongodb_pass}
```

### With custom connection pool settings

```yaml
datasets:
  - from: mongodb:my_dataset
    name: my_dataset
    params:
      mongodb_host: localhost
      mongodb_port: 27017
      mongodb_db: my_database
      mongodb_user: my_user
      mongodb_pass: ${secrets:mongodb_pass}
      mongodb_pool_min: 5
      mongodb_pool_max: 10
```

### Using MongoDB Change Streams

Spice supports real-time Change Data Capture (CDC) from MongoDB using native [MongoDB Change Streams](https://www.mongodb.com/docs/manual/changeStreams/). This streams inserts, updates, replacements, deletes, and collection-level invalidation events from MongoDB collections directly into Spice accelerators.

#### How it works

On startup, Spice opens a Change Stream on the source collection (`fullDocument=updateLookup`), emits a CDC `TRUNCATE`, applies a full snapshot of the collection as upsert rows, signals readiness, then processes Change Stream events in batches. Opening the Change Stream before the snapshot prevents gaps between the snapshot and the live stream.

File-accelerated datasets persist resume tokens and resume from the last committed token on restart. In-memory accelerators re-bootstrap from a fresh snapshot.

#### Prerequisites

- MongoDB 4.0+ with Change Streams enabled. MongoDB requires a replica set or sharded cluster for Change Streams.
- The MongoDB user must have `changeStream` privileges.
- The accelerator must support upsert behavior. Use `duckdb`, `sqlite`, `postgres`, `turso`, or `cayenne`.
- `acceleration.primary_key: _id` is required. Delete events only include the document key, so Spice needs `_id` to route deletes.
- `acceleration.on_conflict` must specify `upsert` on `_id` so update and replace events overwrite existing rows.

#### Minimal configuration

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
      refresh_mode: changes
      primary_key: _id
      on_conflict:
        _id: upsert
```

#### Change Stream parameters

These optional runtime parameters live under dataset `params:`. The first four are not prefixed with `mongodb_`.

| Parameter Name                            | Default | Description                                                                                                                                                                                                                                                            |
| ----------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `change_stream_batch_max_size`            | `1000`  | Maximum number of Change Stream events to group into one CDC batch before applying it. Must be greater than 0.                                                                                                                                                         |
| `change_stream_batch_max_duration`        | `1s`    | Maximum time to wait for a Change Stream batch to fill before applying it. Accepts [fundu](https://docs.rs/fundu) duration strings; must be greater than 0.                                                                                                            |
| `change_stream_max_await_time`            | `1s`    | Maximum time MongoDB waits for new Change Stream events before returning an empty server batch. Accepts [fundu](https://docs.rs/fundu) duration strings; must be greater than 0.                                                                                       |
| `change_stream_batch_size`                | `1000`  | Number of Change Stream events MongoDB should request from the server per batch. Must fit in a `u32` and be greater than 0.                                                                                                                                            |
| `mongodb_resume_token_invalid_behavior`   | `error` | Behavior when a persisted Change Stream resume token cannot be honored by the server (e.g. the token is past the oplog retention window). `error` surfaces a clear error so the operator can decide; `rebootstrap` drops the persisted token and re-snapshots the collection. |

The existing `mongodb_unnest_depth` parameter also applies to Change Stream documents, so nested BSON is flattened the same way as normal MongoDB reads.

#### Event mapping

- `insert`: create/upsert, using `fullDocument`.
- `update`: update/upsert, using `fullDocument` from `fullDocument=updateLookup`.
- `replace`: update/upsert, using `fullDocument`.
- `delete`: delete, using `documentKey`; non-key columns are `null`.
- `drop`, `rename`, `dropDatabase`, `invalidate`: truncate, because collection continuity is no longer guaranteed.

If MongoDB does not include `fullDocument` for an update or replace event, Spice fails the stream with a clear error instead of applying a partial row.

#### Resumability across restarts

For file-accelerated datasets (acceleration `mode: file` / `file_create` / `file_update`, or `engine: postgres`), Spice persists the most recent Change Stream resume token in a sidecar table named `spice_sys_mongodb`, stored alongside the accelerator data. The token is committed only after the downstream accelerator write succeeds (at-least-once semantics).

On restart with a persisted token, Spice resumes the Change Stream from that token and skips the collection snapshot. If MongoDB rejects the token (typical codes `ChangeStreamHistoryLost` 286 or `ChangeStreamFatalError` 280, e.g. when the oplog window has rolled past the token's position), the behavior is governed by `mongodb_resume_token_invalid_behavior` above. Re-snapshotting a large collection is opt-in by default.

Datasets that are not file-accelerated (in-memory Arrow, etc.) do not get a sidecar row; restarts re-bootstrap from a fresh snapshot.

---


## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores#using-secrets).

## Cookbook

- A cookbook recipe to configure MongoDB as a data connector in Spice. [MongoDB Data Connector](https://github.com/spiceai/cookbook/tree/trunk/mongodb/connector#readme)
