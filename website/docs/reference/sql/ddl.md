---
title: 'DDL (Data Definition Language)'
sidebar_label: 'DDL'
description: 'Define, change, inspect, and remove Spice datasets and catalogs with SQL: CREATE TABLE, ALTER TABLE, DROP TABLE, SHOW CREATE TABLE, and the CATALOG statements.'
sidebar_position: 25
---

Data Definition Language (DDL) statements define the datasets and catalogs Spice serves, with the same capabilities and the same names as a [Spicepod](../spicepod/index.md). A dataset or catalog defined with SQL is kept across restarts, loads exactly as a Spicepod one does, and takes [DML](dml.md) as its `access` allows. These statements are available from v2.5.

```sql
CREATE TABLE orders WITH (
  from = 'postgres:public.orders',
  pg_host = 'db.internal',
  pg_user = 'app',
  pg_pass = '${secrets:pg_pass}',
  acceleration.refresh_mode = 'changes'
);
```

is the SQL for this Spicepod dataset:

```yaml
datasets:
  - from: postgres:public.orders
    name: orders
    params:
      pg_host: db.internal
      pg_user: app
      pg_pass: ${secrets:pg_pass}
    acceleration:
      refresh_mode: changes
```

## Options

A statement's `WITH (...)` options are its Spicepod fields:

- **A key is a field name.** Nested fields join with `.`: `acceleration.engine`, `metadata.owner`, `acceleration.params.cayenne_file_path`. A key with a `.` may be written quoted (`"acceleration.engine"`) or not.
- **A column's fields** are addressed by the column's name: `columns.body.description = 'The post body'`.
- **Any other key is a parameter** of the connector `from` names, as written under `params:` (`pg_host`). When a key is both a field and a parameter of the connector, the statement is refused; write `"params.<key>"` to set the parameter.
- **A value means what it means in YAML:** `'30s'`, `30`, `true`, `ARRAY['a', 'b']` for a list, and `JSON '<json>'` for any structured value, for example `columns.body.embeddings = JSON '[{"from": "openai"}]'`.
- **Secrets** are written as references, `'${secrets:pg_pass}'` or `'${env:PG_PASS}'`, and resolved when the dataset loads, as in a Spicepod.

The options are read by the Spicepod's own types, so every field, default, and validation is the Spicepod's. See the [datasets](../spicepod/datasets.md) and [catalogs](../spicepod/catalogs.md) references for the fields.

## CREATE TABLE

Define a dataset.

```sql
CREATE [OR REPLACE] TABLE [IF NOT EXISTS] name
  [ ( column_name data_type [NOT NULL] [COMMENT 'text'] [, ...] [, PRIMARY KEY (column [, ...])] ) ]
  WITH ( from = '<connector>:<path>' [, key = value ...] )
  [ PARTITION BY expression ]
  [ CLUSTER BY ( column [, ...] ) ]
```

- The column list declares `columns[].type`, `nullable`, and `description`. `PRIMARY KEY` sets `acceleration.primary_key`, `PARTITION BY` sets `acceleration.partition_by`, and `CLUSTER BY` sets `acceleration.params.cayenne_cluster_by`.
- `CREATE TABLE` returns once the definition is valid and the dataset is registered: the connector exists, it reads every parameter given, and its source answers with a schema (unless `ready_state` is `on_registration`). A definition that fails to validate is not kept. An accelerated dataset then loads as its `ready_state` says.
- `OR REPLACE` replaces a dataset SQL defined. Its acceleration data is deleted, so the new definition loads from its source.
- `IF NOT EXISTS` keeps an existing dataset.

```sql
CREATE TABLE events (
  id BIGINT NOT NULL,
  region TEXT,
  ts TIMESTAMP,
  PRIMARY KEY (id)
) WITH (
  from = 's3://my-bucket/events/',
  file_format = 'parquet',
  acceleration.engine = 'cayenne',
  acceleration.mode = 'file'
)
PARTITION BY region;
```

## ALTER TABLE

Change a dataset SQL defined. It reloads as it would after the same Spicepod edit.

```sql
ALTER TABLE name SET ( key = value [, ...] );
ALTER TABLE name RESET ( key [, ...] );
```

`RESET` removes a key, so the field takes its default; `RESET (acceleration)` removes the acceleration. A new `from` deletes the acceleration data, so the dataset loads from its new source.

## DROP TABLE

Remove a dataset SQL defined, and its acceleration data.

```sql
DROP TABLE [IF EXISTS] name;
```

## SHOW CREATE TABLE

Print the statement that recreates any dataset, whether SQL or a Spicepod defined it.

```sql
SHOW CREATE TABLE orders;
```

A parameter's value is printed only when the component that reads it declares it non-secret: this holds for every parameters map, including `acceleration.params`, `acceleration.snapshots_params`, a catalog's `dataset_params`, and the `params` of a vector or full-text engine. Every other value, a secret or an unknown parameter, is printed as `'<redacted>'`. A value that is a secret reference and nothing else, such as `'${secrets:pg_pass}'`, is printed as written; a value such as `'${pg_pass}'`, which Spice does not resolve as a reference, is redacted. A statement that sets any value to `'<redacted>'` is refused, so replaying the output never stores the placeholder: replace each placeholder with the value, or with a reference to a secret, before running it. Parameters, `metadata`, `indexes`, and `on_conflict` print in name order, so the output is the same every time.

## CREATE, ALTER, DROP, and SHOW CREATE CATALOG

```sql
CREATE [OR REPLACE] CATALOG [IF NOT EXISTS] name WITH ( from = '<connector>' [, key = value ...] );
ALTER CATALOG name SET ( key = value [, ...] );
ALTER CATALOG name RESET ( key [, ...] );
DROP CATALOG [IF EXISTS] name;
SHOW CREATE CATALOG name;
```

```sql
CREATE CATALOG lake WITH (
  from = 'iceberg:https://catalog.example.com/v1/namespaces',
  include = ARRAY['sales.*'],
  iceberg_s3_region = 'us-west-2'
);
```

`DROP CATALOG` unloads the catalog while Spice runs. An accelerated catalog (`acceleration` on a PostgreSQL catalog) keeps its tables queryable until Spice restarts, and the statement says so. Its acceleration data is not deleted, as when it is removed from the Spicepod.

## Who can define datasets and catalogs

Defining a source can use any configured secret, read local files, and reach any host, so it is reserved:

- **With [API key authentication](../../api/auth/index.md)**, the key must end in `:admin`. A `:rw` key writes data but does not define sources; a read-only key does neither. Either is refused with: `Defining a dataset with SQL requires an API key ending in ':admin'; the key used can only read or write data. Add one to runtime.auth.api-key.keys.`

  ```yaml
  runtime:
    auth:
      api-key:
        keys:
          - ${ secrets:ingest_key }:rw
          - ${ secrets:admin_key }:admin
  ```

- **Without authentication**, only a caller on the same machine can define them: Spice must listen on loopback only (the default `127.0.0.1`), and a request over HTTP must not come from a web page on another site.

[Task history](../task_history.md) records these statements with the value of each parameter not declared non-secret replaced by `'<redacted>'`, as `SHOW CREATE` prints it. So that a mistyped statement records no more than a correct one, every statement with the keyword `CREATE`, `ALTER`, or `ATTACH`, such as `CREATE VIEW`, is recorded without its comments and with every literal outside a well-formed `key = value` option, such as a column's `COMMENT`, also replaced by `'<redacted>'`. Spice does not run `ATTACH`, but other engines connect a database with it. SQL that fails to parse is recorded the same way, whatever its first word, such as a mistyped `CRATE TABLE`, and SQL that cannot even be read into words, such as text with an unterminated quote, is recorded as `<redacted: the statement could not be parsed>`. The error a statement fails with is recorded without the values its text had redacted. The `sql` tool records the statements an agent runs through it the same way, with every parameter's value redacted, and arguments that are not the tool's JSON as `<redacted: the statement could not be parsed>`; `tool_invoke`, which a model that searches for tools calls, records a call to `sql` as `sql` does.

The list of running queries (`GET /v1/sql/active`) shows each API key only the statements it ran, and shows a statement with the keyword `CREATE`, `ALTER`, or `ATTACH` as task history records it. It shows any other statement as it was sent, including one that will fail to parse; task history then records that statement redacted, as above.

A statement runs to the end even when its client disconnects first, and task history records its outcome.

## Where definitions are kept

Definitions keep each value as written, so write a credential as a reference to a secret, such as `'${secrets:pg_pass}'`, rather than as its value. What SQL defines is kept in `sql-definitions/definitions.json` in [`runtime.state.location`](../spicepod/runtime.md#runtimestate) when it is set, and otherwise in the instance directory (`.spice/`, or `$SPICE_CONFIG_DIR`). In the instance directory, the `sql-definitions` folder is readable by its owner only. On Kubernetes, set `runtime.state.location` or put the instance directory on a volume, or the definitions are lost when the container restarts.

Instances that share `runtime.state.location` serve the same definitions: each applies a change another instance made within 10 seconds, and a statement applies any change its instance has not seen before it runs. When two instances change the definitions at once, a statement whose dataset or catalog the other change left as it was is planned again and applied; one that changes the same dataset or catalog fails with a conflict that names it: run `SHOW CREATE TABLE` or `SHOW CREATE CATALOG` to see the other change, then run the statement again if it still applies. A statement that deletes acceleration data, a `DROP TABLE`, a replacement, or a new `from`, deletes it before it stores the change, so when it fails with a conflict, the error says the data was deleted, and the dataset loads again from its source.

An instance applies the definitions as it reads them, so a dataset that another instance drops and defines again the same way between two reads is unchanged on the instance that did not read the drop, and keeps its acceleration data.

When the definitions cannot be read at startup, no dataset or catalog defined with SQL is served, and these statements are refused, until a retry every 10 seconds reads them. With `runtime.ready_state: on_load`, the default, Spice is not ready (`GET /v1/ready`) until then.

## Spicepod and SQL definitions

SQL changes only what SQL defined. `ALTER TABLE` and `DROP TABLE` on a dataset a Spicepod declares are refused; change it in the Spicepod. If a Spicepod later declares a name SQL defined, the Spicepod's dataset is served, a warning names both, and `DROP TABLE` removes only the SQL definition.

## Limitations

- In a cluster, these statements are refused; define datasets and catalogs in the Spicepod.
- A table with no source, where Spice is the system of record, is not yet supported.
- Dropping, replacing, or re-pointing an accelerated catalog does not delete its acceleration data, as when it is removed from or changed in the Spicepod.
