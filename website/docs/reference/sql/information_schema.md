---
title: 'Information Schema'
sidebar_label: 'Information Schema'
pagination_prev: 'reference/sql/explain'
pagination_next: null
sidebar_position: 5
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
+---------------+--------------+--------------+------------+
| table_catalog | table_schema | table_name   | table_type |
+---------------+--------------+--------------+------------+
| spice         | runtime      | task_history | BASE TABLE |
| spice         | runtime      | metrics      | BASE TABLE |
+---------------+--------------+--------------+------------+

```

## `SHOW COLUMNS`

Use `SHOW COLUMNS` or query `information_schema.columns` to see a table’s column definitions:

```sql
> show columns from t;
or
> select table_catalog, table_schema, table_name, column_name, data_type, is_nullable from information_schema.columns;
+---------------+--------------+--------------+-----------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-------------+
| table_catalog | table_schema | table_name   | column_name           | data_type                                                                                                                                                                                                                                                                                                                                               | is_nullable |
+---------------+--------------+--------------+-----------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-------------+
| spice         | runtime      | task_history | trace_id              | Utf8                                                                                                                                                                                                                                                                                                                                                    | NO          |
| spice         | runtime      | task_history | span_id               | Utf8                                                                                                                                                                                                                                                                                                                                                    | NO          |
| spice         | runtime      | task_history | parent_span_id        | Utf8                                                                                                                                                                                                                                                                                                                                                    | YES         |
| spice         | runtime      | task_history | task                  | Utf8                                                                                                                                                                                                                                                                                                                                                    | NO          |
| spice         | runtime      | task_history | input                 | Utf8                                                                                                                                                                                                                                                                                                                                                    | NO          |
| spice         | runtime      | task_history | captured_output       | Utf8                                                                                                                                                                                                                                                                                                                                                    | YES         |
| spice         | runtime      | task_history | start_time            | Timestamp(Nanosecond, None)                                                                                                                                                                                                                                                                                                                             | NO          |
| spice         | runtime      | task_history | end_time              | Timestamp(Nanosecond, None)                                                                                                                                                                                                                                                                                                                             | NO          |
| spice         | runtime      | task_history | execution_duration_ms | Float64                                                                                                                                                                                                                                                                                                                                                 | NO          |
| spice         | runtime      | task_history | error_message         | Utf8                                                                                                                                                                                                                                                                                                                                                    | YES         |
| spice         | runtime      | task_history | labels                | Map(Field { name: "entries", data_type: Struct([Field { name: "keys", data_type: Utf8, nullable: false, dict_id: 0, dict_is_ordered: false, metadata: {} }, Field { name: "values", data_type: Utf8, nullable: false, dict_id: 0, dict_is_ordered: false, metadata: {} }]), nullable: false, dict_id: 0, dict_is_ordered: false, metadata: {} }, false) | NO          |
+---------------+--------------+--------------+-----------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-------------+
```

## `SHOW ALL` (configuration options)

Use `SHOW ALL` or query `information_schema.df_settings` to view current session configuration parameters:

```sql
select * from information_schema.df_settings;

+-------------------------------------------------------------------------+---------------------------+
| name                                                                    | value                     |
+-------------------------------------------------------------------------+---------------------------+
| datafusion.catalog.create_default_catalog_and_schema                    | false                     |
| datafusion.catalog.default_catalog                                      | spice                     |
| datafusion.catalog.default_schema                                       | public                    |
| datafusion.catalog.format                                               |                           |
| datafusion.catalog.has_header                                           | true                      |
| datafusion.catalog.information_schema                                   | true                      |
| datafusion.catalog.location                                             |                           |
| datafusion.catalog.newlines_in_values                                   | false                     |
| datafusion.execution.batch_size                                         | 8192                      |
...
| datafusion.sql_parser.parse_float_as_decimal                            | false                     |
| datafusion.sql_parser.support_varchar_with_length                       | true                      |
+-------------------------------------------------------------------------+---------------------------+
```
