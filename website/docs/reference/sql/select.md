---
title: 'SELECT'
sidebar_label: 'SELECT'
pagination_prev: 'reference/sql/index'
pagination_next: 'reference/sql/task_history'
sidebar_position: 1
---

:::info
Spice is built on [Apache DataFusion](https://datafusion.apache.org/) and uses the PostgreSQL dialect, even when querying datasources with different SQL dialects.  
:::

## SELECT syntax

The queries in Spice scan data from tables and return 0 or more rows.
Please be aware that column names in queries are made lower-case, but not on the inferred schema. Accordingly, if you want to query against a capitalized field, make sure to use double quotes.

Spice supports the following syntax for queries:

[ [WITH](#with-clause) with_query [, ...] ]  
[SELECT](#select-clause) [ ALL | DISTINCT ] select_expr [, ...]  
[ [FROM](#from-clause) from_item [, ...] ]  
[ [JOIN](#join-clause) join_item [, ...] ]  
[ [WHERE](#where-clause) condition ]  
[ [GROUP BY](#group-by-clause) grouping_element [, ...] ]  
[ [HAVING](#having-clause) condition]  
[ [UNION](#union-clause) [ ALL | select ]  
[ [ORDER BY](#order-by-clause) expression \[ ASC | DESC \][, ...] ]  
[ [LIMIT](#limit-clause) count ]  
[ [EXCLUDE | EXCEPT](#exclude-and-except-clause) ]

### WITH clause

A with clause allows to give names for queries and reference them by name.

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

### HAVING clause

The `HAVING` clause can be used with `GROUP BY` to eliminate groups that don't satisfy the condition given.

Example:

```sql
SELECT a, b, MAX(c) FROM table GROUP BY a, b HAVING MAX(c) > 10
```

### UNION clause

The `UNION` clause combines the results of two or more `SELECT` statments. By default `UNION` removes
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

### LIMIT clause

Limits the number of rows to be a maximum of `count` rows. `count` should be a non-negative integer.

Example:

```sql
SELECT age, person FROM table
LIMIT 10
```

### EXCLUDE and EXCEPT clause

Excluded named columns from query results.

Example selecting all columns except for `age` and `person`:

```sql
SELECT * EXCEPT(age, person)
FROM table;
```

```sql
SELECT * EXCLUDE(age, person)
FROM table;
```

### Additional Example

```sql
SELECT name, age FROM employees WHERE age > 30 ORDER BY age DESC;
```
