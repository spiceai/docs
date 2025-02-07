---
title: 'Subqueries'
sidebar_label: 'Subqueries'
pagination_prev: 'reference/sql/explain'
pagination_next: 'reference/sql/explain'
sidebar_position: 1
---

:::info
Spice is built on [Apache DataFusion](https://datafusion.apache.org/) and uses the PostgreSQL dialect, even when querying datasources with different SQL dialects.  
:::

# Information Schema

Spice supports display metadata about available tables and views. This information is accessible through the ISO SQL `information_schema` schema or the `SHOW TABLES` and `SHOW COLUMNS` commands.

## `SHOW TABLES`

Use `SHOW TABLES` or query `information_schema.tables` to list the tables in the Spice catalog:

```sql
> show tables;
or
> select * from information_schema.tables;
+---------------+--------------------+------------+------------+
| table_catalog | table_schema       | table_name | table_type |
+---------------+--------------------+------------+------------+
| datafusion    | public             | t          | BASE TABLE |
| datafusion    | information_schema | tables     | VIEW       |
| datafusion    | information_schema | views      | VIEW       |
| datafusion    | information_schema | columns    | VIEW       |
+---------------+--------------------+------------+------------+

```

## `SHOW COLUMNS`

Use `SHOW COLUMNS` or query `information_schema.columns` to see a table’s column definitions:

```sql
> show columns from t;
or
> select table_catalog, table_schema, table_name, column_name, data_type, is_nullable from information_schema.columns;
+---------------+--------------+------------+-------------+-----------+-------------+
| table_catalog | table_schema | table_name | column_name | data_type | is_nullable |
+---------------+--------------+------------+-------------+-----------+-------------+
| datafusion    | public       | t          | Int64(1)    | Int64     | NO          |
+---------------+--------------+------------+-------------+-----------+-------------+
```

## `SHOW ALL` (configuration options)

Use `SHOW ALL` or query `information_schema.df_settings` to view current session configuration parameters:

```sql
select * from information_schema.df_settings;

+-------------------------------------------------+---------+
| name                                            | setting |
+-------------------------------------------------+---------+
| datafusion.execution.batch_size                 | 8192    |
| datafusion.execution.coalesce_batches           | true    |
| datafusion.execution.time_zone                  | UTC     |
| datafusion.explain.logical_plan_only            | false   |
| datafusion.explain.physical_plan_only           | false   |
...
| datafusion.optimizer.filter_null_join_keys      | false   |
| datafusion.optimizer.skip_failed_rules          | true    |
+-------------------------------------------------+---------+
```
