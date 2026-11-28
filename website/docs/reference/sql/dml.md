---
title: 'DML (Data Manipulation Language)'
sidebar_label: 'DML'
description: 'Data Manipulation Language (DML) statements for inserting and modifying data in Spice.'
sidebar_position: 30
---

Data Manipulation Language (DML) statements are used to insert, update, and delete data in tables. Spice supports DML operations on [write-capable data connectors](../../tags/write) configured with `access: read_write`. An accelerated dataset over a source that accepts only reads can also take DML with [`acceleration.write_mode: acceleration`](../spicepod/datasets.md#accelerationwrite_mode), which keeps the writes in the acceleration.

:::warning[Supported Operations]
Spice supports `INSERT` for write-capable connectors and `MERGE INTO` for [Spice Cayenne](../../components/data-accelerators/cayenne) catalog tables. Whether a dataset takes standalone `UPDATE` and `DELETE` depends on its connector or accelerator; each component's page lists the statements it supports. A dataset with `write_mode: acceleration` takes the statements its accelerator engine supports; on Spice Cayenne, that includes `UPDATE` and `DELETE`.
:::

:::info
Spice is built on [Apache DataFusion](https://datafusion.apache.org/) and uses the PostgreSQL dialect, even when querying datasources with different SQL dialects.
:::

## INSERT

Insert new rows into a table.

### Syntax

```sql
INSERT INTO table_name [ ( column_name [, ...] ) ]
{ VALUES ( expression [, ...] ) [, ...] | query }
```

### Parameters

- **`table_name`**: The name of the target table
- **`column_name`**: Optional list of column names to insert into. If omitted, values must be provided for all columns in table order
- **`expression`**: Values to insert into the corresponding columns
- **`query`**: A SELECT statement to insert results from another table or query

### Examples

#### Insert Single or Multiple Rows

```sql
INSERT INTO customers (id, name, email)
VALUES (1, 'Alice Smith', 'alice@example.com');
```

```text
+-------+
| count |
+-------+
| 1     |
+-------+
```

```sql
INSERT INTO customers (id, name, email)
VALUES
  (2, 'Bob Johnson', 'bob@example.com'),
  (3, 'Carol Wilson', 'carol@example.com'),
  (4, 'David Brown', 'david@example.com');
```

```text
+-------+
| count |
+-------+
| 3     |
+-------+
```

#### Insert All Columns (Optional Column List)

```sql
INSERT INTO products
VALUES (101, 'Laptop', 999.99, 'Electronics');
```

#### Insert from Query

```sql
INSERT INTO archive_orders (order_id, customer_id, total, order_date)
SELECT order_id, customer_id, total, order_date
FROM orders
WHERE order_date < '2024-01-01';
```

## UPDATE and DELETE conditions

Spice passes the `WHERE` condition of an `UPDATE` or `DELETE` to the table as a condition on each row. A statement whose condition cannot be reduced to a condition on one row of the target table is refused before it changes any row. This covers a condition with a subquery, such as `IN (SELECT ...)` or `EXISTS (...)`, a grouping or window computed across rows, and an ordering or row limit. For example:

```sql
DELETE FROM orders WHERE customer_id IN (SELECT customer_id FROM churned_customers);
```

fails with:

```text
Failed to delete from table '<table>': the statement is restricted by a subquery, which cannot be carried to the table as a row condition, so more rows would be deleted than the condition selected. Run the subquery first and give the values it returns as a literal condition. See: https://spiceai.org/docs/reference/sql
```

To delete those rows, run the subquery first and list the values it returns:

```sql
DELETE FROM orders WHERE customer_id IN (17, 42);
```

A condition must also read only the target table's own columns, directly or through an alias given to the table. A condition on a value computed for each row, such as the result of a model call like `ai_if`, or on a column of another relation, such as a view's base table, is refused while the statement is planned, before any row changes. For example:

```sql
DELETE FROM messages WHERE ai_if(body, 'is spam');
```

fails with an error that names the computed column:

```text
Failed to delete from table '<table>': the condition reads `<column>`, a value computed for each row, such as the result of a model call (ai_if). The table cannot evaluate a condition on it. Select the rows to affect first, then name them by a condition on the table's own columns. See: https://spiceai.org/docs/reference/sql
```

To delete those rows, select their keys first, for example with `SELECT id FROM messages WHERE ai_if(body, 'is spam')`, then delete them by key, as in `DELETE FROM messages WHERE id IN (3, 8)`. A model call in an `UPDATE`'s assigned value, rather than its condition, is outside this check, and the table refuses it with its own error. In v2.4.3 and earlier, each table refused a condition on a computed column with its own error, such as `No field named ...`, and a federated SQL source could receive the statement first.

`EXPLAIN` and `EXPLAIN ANALYZE` of a refused statement return the same error. A condition that selects no row, such as `WHERE false` or `WHERE 1 = 0`, changes no row and returns a count of `0`. In v2.4.3 and earlier, such statements were not refused and could change rows the condition did not select.
