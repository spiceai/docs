---
title: 'DML (Data Manipulation Language)'
sidebar_label: 'DML'
description: 'Data Manipulation Language (DML) statements for inserting and modifying data in Spice.'
sidebar_position: 30
---

Data Manipulation Language (DML) statements are used to insert, update, and delete data in tables. Spice supports DML operations on [write-capable data connectors](../../tags/write) configured with `access: read_write`.

:::warning[Supported Operations]
Spice supports `INSERT` for write-capable connectors and `MERGE INTO` for [Spice Cayenne](../../components/data-accelerators/cayenne) catalog tables. `UPDATE` and `DELETE` statements are not yet supported as standalone operations. For data modifications, use `MERGE INTO` or the source database directly.

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

## MERGE INTO

Update rows in a target table based on matching rows from a source table. Currently supported for [Spice Cayenne](../../components/data-accelerators/cayenne) catalog tables only.

### Syntax

```sql
MERGE INTO target [AS alias]
USING source [AS alias]
ON <join_condition>
WHEN MATCHED THEN UPDATE SET column1 = expr1 [, column2 = expr2, ...]
```

### Parameters

- **`target`**: The table to update. Must be a Cayenne catalog table.
- **`source`**: The table containing new values. Must be a Cayenne catalog table.
- **`join_condition`**: A conjunction of equality predicates (e.g., `target.id = source.id AND target.region = source.region`).
- **`column = expr`**: Column assignments applied to matched rows. Expressions can reference columns from both target and source tables using aliases.

### Constraints

- Only `WHEN MATCHED THEN UPDATE SET` is supported (no `INSERT`, `DELETE`, or `NOT MATCHED` clauses).
- The `ON` clause must use equality predicates only, joined with `AND`.
- The target table must not have `primary_key` or `on_conflict` configured.
- The source table must not contain duplicate rows for the same join key(s). If duplicates are detected, the MERGE operation fails with an error to prevent data loss. Deduplicate the source table before running MERGE.
- In distributed deployments, both source and target tables must be partitioned by the same column, and the partition column must appear in the `ON` clause join keys. Use [`CREATE TABLE ... LIKE`](../../components/catalogs/cayenne#create-table--like) to create staging tables that share partition routing with the target table.

### Examples

#### Update Matching Rows

```sql
MERGE INTO catalog.schema.customers AS t
USING catalog.schema.customer_updates AS s
ON t.id = s.id
WHEN MATCHED THEN UPDATE SET name = s.name, email = s.email;
```

```text
+-------+
| count |
+-------+
| 42    |
+-------+
```

#### Composite Join Keys

```sql
MERGE INTO catalog.schema.inventory AS t
USING catalog.schema.new_stock AS s
ON t.product_id = s.product_id AND t.warehouse_id = s.warehouse_id
WHEN MATCHED THEN UPDATE SET quantity = s.quantity, updated_at = s.updated_at;
```
