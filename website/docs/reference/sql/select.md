---
title: 'SELECT'
sidebar_label: 'SELECT'
pagination_prev: 'reference/sql/index'
pagination_next: 'reference/sql/operators'
sidebar_position: 1
---

:::info
Spice is built on [Apache DataFusion](https://datafusion.apache.org/) and uses the PostgreSQL dialect, even when querying datasources with different SQL dialects.
:::

## SELECT syntax

The queries in Spice scan data from tables and return 0 or more rows.

Spice follows PostgreSQL conventions for identifier handling: unquoted identifiers (table and column names) are normalized to lowercase. To reference a table or column with uppercase or mixed-case characters, wrap the identifier in double quotes.

```sql
-- These are equivalent (both reference the lowercase table name)
SELECT * FROM lineitem;
SELECT * FROM LINEITEM;

-- Double quotes preserve the exact casing
SELECT * FROM "LINEITEM";
```

See [dataset `name` configuration](../spicepod/datasets#name) for how to set a case-sensitive dataset name in the Spicepod manifest.

Spice supports the following syntax for queries:

[ [WITH](#with-clause) with_query [, ...] ]  
[SELECT](#select-clause) [ ALL | DISTINCT ] select_expr [, ...]  
[ [FROM](#from-clause) from_item [, ...] ]  
[ [JOIN](#join-clause) join_item [, ...] ]  
[ [WHERE](#where-clause) condition ]  
[ [GROUP BY](#group-by-clause) grouping_element [, ...] ]  
[ [HAVING](#having-clause) condition]  
[ [QUALIFY](#qualify-clause) condition ]  
[ [UNION](#union-clause) [ ALL | select ] ]
[ [ORDER BY](#order-by-clause) expression \[ ASC | DESC \][, ...] ]  
[ [LIMIT](#limit-clause) count ]  
[ [EXCLUDE | EXCEPT](#exclude-and-except-clause) ]

### Window Functions (OVER Clause)

Window functions perform calculations across a set of rows related to the current row. Use the `OVER` clause to define the window:

```sql
SELECT
  employee_id,
  salary,
  ROW_NUMBER() OVER (ORDER BY salary DESC) AS salary_rank,
  SUM(salary) OVER (PARTITION BY dept_id) AS dept_total
FROM employees;
```

The `OVER` clause supports:

- `PARTITION BY`: Divides rows into groups
- `ORDER BY`: Defines row ordering within each partition
- Frame specifications: `ROWS BETWEEN ... AND ...`

### WITH clause

A WITH clause assigns names to subqueries so they can be referenced by name.

```sql
WITH x AS (SELECT a, MAX(b) AS b FROM t GROUP BY a)
SELECT a, b FROM x;
```

### SELECT clause

The `SELECT` clause is used to select data from a database by defining the colummns it returns. Each `select_expr` in the
SELECT list can be an expression or wildcards.

Example:

```sql
SELECT a, b, a + b FROM table
```

The `DISTINCT` quantifier can be added to make the query return all distinct rows.
By default `ALL` will be used, which returns all the rows.

```sql
SELECT DISTINCT person, age FROM employees
```

### FROM clause

The `FROM` clause is used to specify which table to select data from.

Example:

```sql
SELECT t.a FROM table AS t
```

### WHERE clause

The `WHERE` clause is used define the conditions to filter the query results.

Example:

```sql
SELECT a FROM table WHERE a > 10
```

### JOIN clause

Spice supports `INNER JOIN`, `LEFT OUTER JOIN`, `RIGHT OUTER JOIN`, `FULL OUTER JOIN`, `NATURAL JOIN` and `CROSS JOIN`.

The following examples are based on this table:

```sql
select * from x;
+----------+----------+
| column_1 | column_2 |
+----------+----------+
| 1        | 2        |
+----------+----------+
```

#### INNER JOIN

The keywords `JOIN` or `INNER JOIN` define a join that only shows rows where there is a match in both tables.

```sql
select * from x inner join x y ON x.column_1 = y.column_1;
+----------+----------+----------+----------+
| column_1 | column_2 | column_1 | column_2 |
+----------+----------+----------+----------+
| 1        | 2        | 1        | 2        |
+----------+----------+----------+----------+
```

#### LEFT OUTER JOIN

The keywords `LEFT JOIN` or `LEFT OUTER JOIN` define a join that includes all rows from the left table even if there
is not a match in the right table. When there is no match, null values are produced for the right side of the join.

```sql
select * from x left join x y ON x.column_1 = y.column_2;
+----------+----------+----------+----------+
| column_1 | column_2 | column_1 | column_2 |
+----------+----------+----------+----------+
| 1        | 2        |          |          |
+----------+----------+----------+----------+
```

#### RIGHT OUTER JOIN

The keywords `RIGHT JOIN` or `RIGHT OUTER JOIN` define a join that includes all rows from the right table even if there
is not a match in the left table. When there is no match, null values are produced for the left side of the join.

```sql
select * from x right join x y ON x.column_1 = y.column_2;
+----------+----------+----------+----------+
| column_1 | column_2 | column_1 | column_2 |
+----------+----------+----------+----------+
|          |          | 1        | 2        |
+----------+----------+----------+----------+
```

#### FULL OUTER JOIN

The keywords `FULL JOIN` or `FULL OUTER JOIN` define a join that is effectively a union of a `LEFT OUTER JOIN` and
`RIGHT OUTER JOIN`. It will show all rows from the left and right side of the join and will produce null values on
either side of the join where there is not a match.

```sql
select * from x full outer join x y ON x.column_1 = y.column_2;
+----------+----------+----------+----------+
| column_1 | column_2 | column_1 | column_2 |
+----------+----------+----------+----------+
| 1        | 2        |          |          |
|          |          | 1        | 2        |
+----------+----------+----------+----------+
```

#### NATURAL JOIN

A natural join defines an inner join based on common column names found between the input tables. When no common
column names are found, it behaves like a cross join.

```sql
select * from x natural join x y;
+----------+----------+
| column_1 | column_2 |
+----------+----------+
| 1        | 2        |
+----------+----------+
```

#### CROSS JOIN

A cross join produces a cartesian product that matches every row in the left side of the join with every row in the
right side of the join.

```sql
select * from x cross join x y;
+----------+----------+----------+----------+
| column_1 | column_2 | column_1 | column_2 |
+----------+----------+----------+----------+
| 1        | 2        | 1        | 2        |
+----------+----------+----------+----------+
```

### GROUP BY clause

The `GROUP BY` clause groups together input rows that have the same value into summary rows.

`GROUP BY` is typically used with aggregrate functions (`COUNT()`, `MAX()`, `SUM()`), but if no aggregate functions are
included, the query with a `GROUP BY` clause is the same as `SELECT DISTINCT`.

Example:

```sql
SELECT a, b, MAX(c) FROM table GROUP BY a, b
```

Some aggregation functions accept optional ordering requirement, such as `ARRAY_AGG`. If a requirement is given,
aggregation is calculated in the order of the requirement.

Example:

```sql
SELECT a, b, ARRAY_AGG(c, ORDER BY d) FROM table GROUP BY a, b
```

#### `GROUP BY ALL`

Use GROUP BY ALL to group by every column in the SELECT list that isn’t inside an aggregate function. This keeps the column definitions in one place, simplifies the query, and prevents bugs by keeping the SELECT granularity aligned with the GROUP BY granularity (e.g., preventing unintended duplication).

Example:

```sql
SELECT a, b, MAX(c) FROM table GROUP BY ALL
```

### HAVING clause

The `HAVING` clause can be used with `GROUP BY` to eliminate groups that don't satisfy the condition given.

Example:

```sql
SELECT a, b, MAX(c) FROM table GROUP BY a, b HAVING MAX(c) > 10
```

### QUALIFY clause

The `QUALIFY` clause filters the results of window functions. It is evaluated after window functions are computed, similar to how `HAVING` filters results after `GROUP BY`.

Example:

```sql
SELECT
  employee_id,
  dept_id,
  salary,
  ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rank
FROM employees
QUALIFY rank <= 3;
```

This query returns only the top 3 highest-paid employees in each department.

### UNION clause

The `UNION` clause combines the results of two or more `SELECT` statements. By default `UNION` removes
duplicates. To include duplicates, use `UNION ALL`.

Example:

```sql
SELECT
    a,
    b,
    c
FROM table1
UNION ALL
SELECT
    a,
    b,
    c
FROM table2
```

### ORDER BY clause

Orders the results by the referenced expression. By default it uses ascending order (`ASC`).
This order can be changed to descending by adding `DESC` after the order-by expressions.

Examples:

```sql
SELECT age, person FROM table ORDER BY age;
SELECT age, person FROM table ORDER BY age DESC;
SELECT age, person FROM table ORDER BY age, person DESC;
```

#### `ORDER BY ALL`

Order from left to right (by age, then by person) in ascending order:

```sql
SELECT age, person FROM table ORDER BY ALL;
```

### LIMIT clause

Limits the number of rows to be a maximum of `count` rows. `count` should be a non-negative integer.

Example:

```sql
SELECT age, person FROM table
LIMIT 10
```

### EXCLUDE, EXCEPT, REPLACE, and ILIKE clauses

Spice supports the following wildcard modifiers on `SELECT *`:

- `EXCLUDE (col1, col2, ...)` / `EXCEPT (col1, col2, ...)` — omit the named columns.
- `REPLACE (expr AS col, ...)` — substitute the named columns with a new expression.
- `ILIKE 'pattern'` — emit only columns whose names match the case-insensitive pattern.

`RENAME` is parsed but not yet implemented.

Example selecting all columns except for `age` and `person`:

```sql
SELECT * EXCEPT(age, person)
FROM table;
```

```sql
SELECT * EXCLUDE(age, person)
FROM table;
```

Example replacing a column's value while keeping all other columns:

```sql
SELECT * REPLACE (upper(name) AS name)
FROM customers;
```

Example selecting all columns whose names contain "date":

```sql
SELECT * ILIKE '%date%'
FROM events;
```

### Additional Example

```sql
SELECT name, age FROM employees WHERE age > 30 ORDER BY age DESC;
```
