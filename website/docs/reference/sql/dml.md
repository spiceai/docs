---
title: 'DML (Data Manipulation Language)'
sidebar_label: 'DML'
description: 'Data Manipulation Language (DML) statements for inserting and modifying data in Spice.'
sidebar_position: 30
---

Data Manipulation Language (DML) statements are used to insert, update, and delete data in tables. Spice supports DML operations on [write-capable data connectors](/docs/tags/write) configured with `access: read_write`.

:::warning[Supported Operations]
Spice currently supports `INSERT` statements for write-capable connectors. `UPDATE` and `DELETE` statements are not yet supported. For data modifications, use the source database directly or re-insert the corrected data.
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
