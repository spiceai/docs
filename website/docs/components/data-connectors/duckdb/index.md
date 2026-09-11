---
title: 'DuckDB Data Connector'
sidebar_label: 'DuckDB Data Connector'
description: 'DuckDB Data Connector Documentation'
---

DuckDB is an in-process SQL OLAP (Online Analytical Processing) database management system designed for analytical query workloads. It is optimized for fast execution and can be embedded directly into applications, providing efficient data processing without the need for a separate database server.

This connector supports DuckDB [persistent databases](https://duckdb.org/docs/connect/overview#persistent-database) as a data source for federated SQL queries.

```yaml
datasets:
  - from: duckdb:database.schema.table
    name: my_dataset
    params:
      duckdb_open: path/to/duckdb_file.duckdb
```

## Configuration

### `from`

The `from` field supports one of two forms:

| `from`                         | Description                                                                                                                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `duckdb:database.schema.table` | Read data from a table named `database.schema.table` in the DuckDB file                                                                                                                             |
| `duckdb:*`                     | Read data using any DuckDB function that produces a table. For example one of the [data import](https://duckdb.org/docs/data/overview) functions such as `read_json`, `read_parquet` or `read_csv`. |

:::info
Unquoted identifiers are normalized to lowercase. To reference a table or schema with mixed-case characters, wrap each case-sensitive part in double quotes: `duckdb:my_database."MySchema"."MyTable"`. See [Identifier Case Sensitivity](../index.md#identifier-case-sensitivity-and-quoting).
:::

### `name`

The dataset name. This will be used as the table name within Spice.

Example:

```yaml
datasets:
  - from: duckdb:database.schema.table
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

The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords).

### `params`

The DuckDB data connector can be configured by providing the following `params`:

| Parameter Name | Description                              |
| -------------- | ---------------------------------------- |
| `duckdb_open`  | Path to the DuckDB database file to open. |

Configuration `params` are provided either in the top level `dataset` for a dataset source, or in the `acceleration` section for a data store.

:::info[Timestamps are read in UTC]
Spice pins every DuckDB session it opens to `SET TimeZone = 'UTC'`, so a `TIMESTAMPTZ` column always reaches Spice as `Timestamp(us, "UTC")` regardless of the host's timezone. Without this the Arrow schema — and therefore the instant a naive literal such as `WHERE ts > TIMESTAMP '2024-01-15 15:00:00'` denotes — would differ from machine to machine, because DuckDB labels an exported `TIMESTAMPTZ` with the connection's own `TimeZone` setting. Convert in SQL (`ts AT TIME ZONE 'Asia/Tokyo'`) if you need a local-time reading.
:::

## Examples

### Reading from a relative path

A generic example of DuckDB data connector configuration.

```yaml
datasets:
  - from: duckdb:database.schema.table
    name: my_dataset
    params:
      duckdb_open: path/to/duckdb_file.duckdb
```

### Reading from an absolute path

```yaml
datasets:
  - from: duckdb:sample_data.nyc.rideshare
    name: nyc_rideshare
    params:
      duckdb_open: /my/path/my_database.db
```

### DuckDB Functions

Common [data import](https://duckdb.org/docs/data/overview) DuckDB functions can also define datasets. Instead of a fixed table reference (e.g. `database.schema.table`), a DuckDB function is provided in the `from:` key. For example

```yaml
datasets:
  - from: duckdb:database.schema.table
    name: my_dataset
    params:
      duckdb_open: path/to/duckdb_file.duckdb

  - from: duckdb:read_csv('test.csv', header = false)
    name: from_function
```

Datasets created from DuckDB functions are similar to a standard `SELECT` query. For example:

```yaml
datasets:
  - from: duckdb:read_csv('test.csv', header = false)
```

is equivalent to:

```sql
-- from_function
SELECT * FROM read_csv('test.csv', header = false);
```

Many DuckDB data imports can be rewritten as DuckDB functions, making them usable as Spice datasets. For example:

```sql
SELECT * FROM 'todos.json';

-- As a DuckDB function
SELECT * FROM read_json('todos.json');
```

:::warning[Limitations]

- The DuckDB connector does not support enum, dictionary, or map [field types](https://duckdb.org/docs/sql/data_types/overview). For example:
  - Unsupported:
    - `SELECT MAP(['key1', 'key2', 'key3'], [10, 20, 30])`
- The DuckDB connector does not support `Decimal256` (76 digits), as it exceeds DuckDB's maximum Decimal width of 38 digits.

:::

## Regular Expression Functions and Federation

Three of DataFusion's regular-expression built-ins are never sent to DuckDB, because DuckDB cannot answer them the way Spice does. A query using one of them is still valid — the call is evaluated in Spice, above the federated scan — but a plan containing it does not federate, so the scan under it reads its columns out of DuckDB instead of filtering there.

| Function | Why it is not sent to DuckDB |
| --- | --- |
| `regexp_match` | It returns the first match's *capture groups* as a list, and `NULL` when nothing matches. DuckDB has no function with those semantics: `regexp_extract(s, p, 0)` returns the whole match as a plain string, and the empty string — not `NULL` — when nothing matches. |
| `regexp_instr` | DuckDB has no function of that name, so a federated call failed outright with `Catalog Error: Scalar Function with name regexp_instr does not exist!`. |
| `regexp_count` | Its DuckDB rendering, `len(regexp_extract_all(x, p))`, is `NULL` for a `NULL` input, where DataFusion counts zero matches and answers `0`. A `NULL` rather than `0` propagates differently through `SUM`, through `= 0`, and through a `WHERE` built on it. |

**The "does it match at all" idiom still pushes down.** `regexp_match(col, pattern) IS NULL` and `IS NOT NULL` are rewritten into `regexp_like` before the capability check, and `regexp_like` the DuckDB dialect does render natively (as `regexp_matches`), so that shape stays a boolean and federates either way. Prefer it over comparing a `regexp_match` list whenever the question is only whether the pattern matches.

`regexp_like` and `regexp_replace` are the two remaining DataFusion regexp built-ins, and both federate — except when their optional flags argument is a string literal containing `U` or `R`, which DuckDB's regex engine does not support. Such a call is evaluated in Spice instead.

The same rules apply wherever the DuckDB dialect is used: this connector, the [DuckDB data accelerator](../../data-accelerators/duckdb/index.md), the [DuckLake data connector](../ducklake.md) and the [DuckLake catalog connector](../../catalogs/ducklake.md).

## Cookbook

- A cookbook recipe to configure DuckDB as a data connector in Spice. [DuckDB Data Connector](https://github.com/spiceai/cookbook/tree/trunk/duckdb/connector#readme)
