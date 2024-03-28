---
title: "sql"
sidebar_label: "sql"
pagination_prev: null
pagination_next: null
---

Start an interactive SQL query session against the Spice runtime

### Usage:
```shell 
spice sql [flags]
```

#### Flags:
  - `-h`, `--help`   Print this help message


### Examples
```shell 
$ spice sql
Welcome to the interactive Spice.ai SQL Query Utility! Type 'help' for help.

show tables;  -- list available tables
sql> show tables
+---------------+--------------------+---------------+------------+
| table_catalog | table_schema       | table_name    | table_type |
+---------------+--------------------+---------------+------------+
| datafusion    | public             | tmp_view_test | VIEW       |
| datafusion    | information_schema | tables        | VIEW       |
| datafusion    | information_schema | views         | VIEW       |
| datafusion    | information_schema | columns       | VIEW       |
| datafusion    | information_schema | df_settings   | VIEW       |
+---------------+--------------------+---------------+------------+
```
