---
title: 'DDL (Data Definition Language)'
sidebar_label: 'DDL'
description: 'Define, change, inspect, and remove Spice datasets and catalogs with SQL: CREATE TABLE, ALTER TABLE, DROP TABLE, SHOW CREATE TABLE, and the CATALOG statements.'
sidebar_position: 25
---

Data Definition Language (DDL) statements define the datasets and catalogs Spice serves, with the same capabilities and the same names as a [Spicepod](../spicepod/index.md). A dataset or catalog defined with SQL is kept across restarts, loads exactly as a Spicepod one does, and takes [DML](dml.md) as its `access` allows. Spice v2.4 and earlier do not support these statements.

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
- `OR REPLACE` replaces a dataset SQL defined. Its acceleration data is deleted, so the new definition loads from its source. A statement that repeats the current definition changes nothing and keeps the data (`Dataset 'orders' is unchanged.`).
- `IF NOT EXISTS` keeps an existing dataset.
- A name that starts with `__catalog_accel_`, `__data_`, or `spice_sys_`, in any case, is refused: Spice keeps tables of its own under such names, for an accelerated catalog's tables, a DuckDB acceleration's data, and the state it keeps beside an acceleration.

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

`RESET` removes a key, so the field takes its default; `RESET (acceleration)` removes the acceleration. A new `from`, or a new value of any connector parameter, deletes the acceleration data, so the dataset loads from its new source: a parameter can name another database, file, or table. Turning acceleration on, or keeping its data somewhere else, with another `engine`, memory or a file, or another file location, starts it from the source as well: what that store holds under the dataset's name, which an earlier definition left there, is deleted first. In memory mode, DuckDB, SQLite, and Turso keep every dataset in one instance while Spice runs, so their memory acceleration counts as such a store. A change that leaves the data where it is, such as a tuning parameter, naming the engine already used, or another spelling of the same file or folder (relative, or with `./`), keeps it, also rows its source no longer holds. A `CREATE TABLE` of a name that an earlier definition, or a Spicepod, accelerated starts from the source the same way. A statement that would give a dataset the acceleration table of another dataset or view is refused before anything is deleted. An engine names a table after the name its dataset prints as, so `"s1.t1"`, one name, and `s1.t1`, table `t1` in schema `s1`, would share one in any engine; DuckDB, SQLite, and Turso also read names that differ only in case, such as `"Orders"` and `orders`, as one table in a file or memory instance. Give one of them another name, or, in DuckDB, SQLite, or Turso, its own file or the `cayenne` engine.

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

- **With [API key authentication](../../api/auth/index.md)**, the key must end in `:admin`. A `:rw` key writes data but does not define sources; a read-only key does neither. Either is refused with: ``Defining a dataset with SQL requires an API key ending in ':admin'; the key used can only read or write data. Add one to `runtime.auth.api-key.keys`. See https://spiceai.org/docs/api/auth``

  ```yaml
  runtime:
    auth:
      api-key:
        keys:
          - ${ secrets:ingest_key }:rw
          - ${ secrets:admin_key }:admin
  ```

- **Without authentication**, only a caller on the same machine can define them: Spice must listen on loopback only (the default `127.0.0.1`), and a request over HTTP must not come from a web page on another site.

[Task history](../task_history.md) records these statements with the value of each parameter not declared non-secret replaced by `'<redacted>'`, as `SHOW CREATE` prints it. So that a mistyped statement records no more than a correct one, every statement with the keyword `CREATE`, `ALTER`, or `ATTACH`, such as `CREATE VIEW`, is recorded without its comments and with every literal outside a well-formed `key = value` option, such as a column's `COMMENT`, also replaced by `'<redacted>'`. Spice does not run `ATTACH`, but other engines connect a database with it. SQL that fails to parse is recorded the same way, whatever its first word, such as a mistyped `CRATE TABLE`, and SQL that cannot even be read into words, such as text with an unterminated quote, is recorded as `<redacted: the statement could not be parsed>`. The error a statement fails with is recorded without the values its text had redacted. The `sql` tool records the statements an agent runs through it the same way, with every parameter's value redacted, and arguments that are not the tool's JSON as `<redacted: the statement could not be parsed>`; `tool_invoke`, which a model that searches for tools calls, records a call to `sql` as `sql` does. A call to any other tool, under any name, is recorded the same way when its arguments hold a statement with one of these keywords: for example, a call to another Spice's `sql` tool through an [MCP tool](../../components/tools/mcp.md), such as `remote_spice__sql`, or a call under an MCP client's own name for Spice's `sql` tool, such as `mcp__spice__sql`. The tool's own row records its input the same way, with the call's other arguments, such as a confirmation, a number, or an object key, and its result and error without the values that took out. Conversations, which task history records as `ai_chat`, `ai_completion`, and `responses` tasks, hold each such call as it is recorded, in any shape the Chat Completions, Responses, and Messages APIs write one, including the legacy `function_call` and an MCP approval request, whoever made the call: a model Spice runs tools for, a client that sends the conversation back on its next turn, or an agent that runs its own tool loop and sends the call to any model. The rest of the same request or response, such as the call's result, another call's input, the model's reply, or a person's words, is recorded without the values those calls took out, also where it repeats one as a number or an object key. A request or response that repeats a value without the call that set it is recorded as written: for example, a model's answer that repeats a password, which a client sends back on its next turn after Spice ran the call. A statement that cannot be read into tokens is recorded as `<redacted: the statement could not be parsed>`, and each part of it that may be a value is left out of what quotes it back, such as a tool's error: each quoted literal, whole, even one the end of the text cuts short, with an escape string's escaped quote (`E'…\'…'`) inside it, and each word of four or more characters that is quoted or is not a keyword. Keep credentials in references to secrets.

Other statements, such as `SET` or `COPY`, are recorded as sent, so do not write a credential into them; write a dataset's credentials into its parameters, where a reference to a secret keeps them out of every record.

The list of running queries (`GET /v1/sql/active`) shows each API key only the statements it ran, and shows a statement with the keyword `CREATE`, `ALTER`, or `ATTACH` as task history records it. It shows any other statement as it was sent, including one that will fail to parse; task history then records that statement redacted, as above.

A statement that defines, changes, or removes a dataset or catalog runs to its end once it starts, because a change cannot stop partway: neither a client that disconnects, nor `runtime.query.timeout`, nor a cancel request stops it. `POST /v1/sql/{query_id}/cancel` answers such a statement with `409 Conflict`, and the Flight `CancelQuery` action with `cancelled: false`. Its client gets its outcome, task history records it, and when its client disconnected first, the Spice log reports it. When Spice shuts down while such a statement runs, the statement is refused if it has not yet stored its change (`… was not applied: Spice is shutting down. Run the statement again once it has started.`), with HTTP status `503` (gRPC `UNAVAILABLE`), so a client may run it again; once the change is stored, the statement reports that it takes effect when Spice starts again, which on Kubernetes without `runtime.state.location` holds only if the definitions file is kept (see [Where definitions are kept](#where-definitions-are-kept)).

## Where definitions are kept

Definitions keep each value as written, so write a credential as a reference to a secret, such as `'${secrets:pg_pass}'`, rather than as its value. What SQL defines is kept in `sql-definitions/definitions.json` in [`runtime.state.location`](../spicepod/runtime.md#runtimestate) when it is set, and otherwise in the instance directory (`.spice/`, or `$SPICE_CONFIG_DIR`). In the instance directory, the `sql-definitions` folder is readable by its owner only; in a local `runtime.state.location`, such as a `file://` path, Spice keeps the folder's permissions as they are, so restrict them as you would for a Spicepod that holds credentials. `SHOW CREATE` prints `from` as written, as `GET /v1/datasets` and `GET /v1/catalogs` do, and task history records it so, so put no credential in `from`, such as a password in a URL or in a DuckLake connection string: set it in a parameter, as a reference to a secret. On Kubernetes, set `runtime.state.location` or put the instance directory on a volume, or the definitions are lost when the container restarts.

Instances that share `runtime.state.location` serve the same definitions: each applies a change another instance made within 10 seconds, and a statement applies any change its instance has not seen before it runs. When two instances change the definitions at once, a statement whose dataset or catalog the other change left as it was is planned again and applied; one that changes the same dataset or catalog fails with a conflict that names it: run `SHOW CREATE TABLE` or `SHOW CREATE CATALOG` to see the other change, then run the statement again if it still applies. If the instance could not apply the other change, the error says so, and the instance keeps serving its earlier definitions until a retry, every 10 seconds, applies it. When the instance fails to delete the acceleration data of a dataset that a change another instance made drops or points at another source, whether or not a statement raced it, it serves the rest of that change without the dataset, refuses statements that name the dataset, and runs other statements, until a retry deletes the data; it logs both. A statement that deletes acceleration data, a `DROP TABLE`, a replacement, or a new `from` or connector parameter, deletes it before it stores the change, so when it fails with a conflict, the error says the data was deleted, and the dataset loads again from its source.

An instance applies the definitions as it reads them, so a dataset that another instance drops and defines again the same way between two reads is unchanged on the instance that did not read the drop, and keeps its acceleration data.

When the definitions cannot be read at startup, no dataset or catalog defined with SQL is served, and these statements are refused, until a retry every 10 seconds reads them. With `runtime.ready_state: on_load`, the default, Spice is not ready (`GET /v1/ready`) until then.

## Spicepod and SQL definitions

SQL changes only what SQL defined. `ALTER TABLE` and `DROP TABLE` on a dataset a Spicepod declares are refused; change it in the Spicepod. If a Spicepod later declares a name SQL defined, the Spicepod's dataset is served, a warning names both, and `DROP TABLE` removes only the SQL definition. When a name moves between the Spicepod and SQL, while Spice runs or across a restart, the acceleration data the earlier definition loaded is deleted first, so the dataset loads from the source of the definition now served. If that data cannot be deleted, the instance does not serve the dataset until a retry, every 10 seconds, deletes it, and it logs both.

Each instance records what it serves under each name SQL defined, and what it withholds, in `sql-definitions/served.json` in its instance directory, so once restarted it first deletes the acceleration data of each dataset changed while it was stopped, by another instance or by a Spicepod that started or stopped declaring its name. The record holds those definitions as written, and is readable by its owner only.

## Limitations

- In a cluster, these statements are refused; define datasets and catalogs in the Spicepod.
- A table with no source, where Spice is the system of record, is not yet supported.
- Dropping, replacing, or re-pointing an accelerated catalog does not delete its acceleration data, as when it is removed from or changed in the Spicepod.
