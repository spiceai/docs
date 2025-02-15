---
title: 'Subqueries'
sidebar_label: 'Subqueries'
pagination_prev: 'reference/sql/select'
pagination_next: null
sidebar_position: 5
---

:::info
Spice is built on [Apache DataFusion](https://datafusion.apache.org/) and uses the PostgreSQL dialect, even when querying datasources with different SQL dialects.  
:::

# Subqueries

A subquery, also known as an inner query or nested query, is a query inside another query. Subqueries can appear in the `SELECT`, `FROM`, `WHERE`, and `HAVING` clauses. The examples below reference these sample tables:

The examples below are based on the following tables.

```sql
SELECT * FROM x;

+----------+----------+
| column_1 | column_2 |
+----------+----------+
| 1        | 2        |
+----------+----------+
| 2        | 4        |
+----------+----------+
```

```sql
SELECT * FROM y;

+--------+--------+
| number | string |
+--------+--------+
| 1      | one    |
+--------+--------+
| 2      | two    |
+--------+--------+
| 3      | three  |
+--------+--------+
| 4      | four   |
+--------+--------+
```

## Subquery operators

- [[ NOT ] EXISTS](#-not--exists)
- [[ NOT ] IN](#-not--in)

### [ NOT ] EXISTS

The `EXISTS` operator returns rows for which a _[correlated subquery](#correlated-subqueries)_ produces one or more matches. The `NOT EXISTS` operator returns rows for which the _correlated subquery_ produces zero matches. Only _correlated subquery_ are supported.

```sql
[NOT] EXISTS (subquery)
```

### [ NOT ] IN

The IN operator returns rows that match any value produced by a _[correlated subquery](#correlated-subqueries)_ or listed values. The NOT IN operator returns rows that do not match any of these values.

```sql
expression [NOT] IN (subquery|list-literal)
```

#### Examples

```sql
SELECT * FROM x WHERE column_1 IN (1,3);

+----------+----------+
| column_1 | column_2 |
+----------+----------+
| 1        | 2        |
+----------+----------+
```

```sql
SELECT * FROM x WHERE column_1 NOT IN (1,3);

+----------+----------+
| column_1 | column_2 |
+----------+----------+
| 2        | 4        |
+----------+----------+
```

## SELECT clause subqueries

`SELECT` clause subqueries use values returned from the inner query as part of the outer query's `SELECT` list.
The `SELECT` clause only supports [scalar subqueries](#scalar-subqueries) that return a single value per execution of the inner query. The returned value can be unique per row.

```sql
SELECT [expression1[, expression2, ..., expressionN],] (<subquery>)
```

**Note**: `SELECT` clause subqueries can be used as an alternative to `JOIN`
operations.

### Example

```sql
SELECT
  column_1,
  (
    SELECT
      first_value(string)
    FROM
      y
    WHERE
      number = x.column_1
  ) AS "numeric string"
FROM
  x;

+----------+----------------+
| column_1 | numeric string |
+----------+----------------+
|        1 | one            |
|        2 | two            |
+----------+----------------+
```

## FROM clause subqueries

A subquery in the `FROM` clause produces a result set that is then referenced by the outer query.

```sql
SELECT expression1[, expression2, ..., expressionN] FROM (<subquery>)
```

### Example

The following query returns the average of maximum values per room.
The inner query returns the maximum value for each field from each room.
The outer query uses the results of the inner query and returns the average
maximum value for each field.

```sql
SELECT
  column_2
FROM
  (
    SELECT
      *
    FROM
      x
    WHERE
      column_1 > 1
  );

+----------+
| column_2 |
+----------+
|        4 |
+----------+
```

## WHERE clause subqueries

A subquery in the `WHERE` clause compares an expression to the subquery result, returning _true_ or _false_. Rows that evaluate to _false_ or NULL are filtered from the final result. Both correlated and non-correlated subqueries are supported in `WHERE` clause subqueries, as well as scalar and non-scalar subqueries (depending on the operator).

```sql
SELECT
  expression1[, expression2, ..., expressionN]
FROM
  <measurement>
WHERE
  expression operator (<subquery>)
```

**Note:** `WHERE` clause subqueries can be used as an alternative to `JOIN`
operations.

### Examples

#### `WHERE` clause with scalar subquery

The following query returns all rows with `column_2` values above the average
of all `number` values in `y`.

```sql
SELECT
  *
FROM
  x
WHERE
  column_2 > (
    SELECT
      AVG(number)
    FROM
      y
  );

+----------+----------+
| column_1 | column_2 |
+----------+----------+
|        2 |        4 |
+----------+----------+
```

#### `WHERE` clause with non-scalar subquery

Non-scalar subqueries must use the `[NOT] IN` or `[NOT] EXISTS` operators and
can only return a single column.
The values in the returned column are evaluated as a list.

The following query returns all rows with `column_2` values in table `x` that
are in the list of numbers with string lengths greater than three from table
`y`.

```sql
SELECT
  *
FROM
  x
WHERE
  column_2 IN (
    SELECT
      number
    FROM
      y
    WHERE
      length(string) > 3
  );

+----------+----------+
| column_1 | column_2 |
+----------+----------+
|        2 |        4 |
+----------+----------+
```

### `WHERE` clause with correlated subquery

The following query returns rows with `column_2` values from table `x` greater
than the average `string` value length from table `y`.
The subquery in the `WHERE` clause uses the `column_1` value from the outer
query to return the average `string` value length for that specific value.

```sql
SELECT
  *
FROM
  x
WHERE
  column_2 > (
    SELECT
      AVG(length(string))
    FROM
      y
    WHERE
      number = x.column_1
  );

+----------+----------+
| column_1 | column_2 |
+----------+----------+
|        2 |        4 |
+----------+----------+
```

## HAVING clause subqueries

A subquery in the `HAVING` clause compares an expression using aggregate functions to the subquery result and returns _true_ or _false_. Rows that evaluate to _false_ are excluded. Both correlated and non-correlated subqueries are possible, as well as scalar and non-scalar subqueries (depending on the operator).

```sql
SELECT
  aggregate_expression1[, aggregate_expression2, ..., aggregate_expressionN]
FROM
  <measurement>
WHERE
  <conditional_expression>
GROUP BY
  column_expression1[, column_expression2, ..., column_expressionN]
HAVING
  expression operator (<subquery>)
```

### Examples

The following query calculates the averages of even and odd numbers in table `y`
and returns the averages that are equal to the maximum value of `column_1`
in table `x`.

#### `HAVING` clause with a scalar subquery

```sql
SELECT
  AVG(number) AS avg,
  (number % 2 = 0) AS even
FROM
  y
GROUP BY
  even
HAVING
  avg = (
    SELECT
      MAX(column_1)
    FROM
      x
  );

+-------+--------+
|   avg | even   |
+-------+--------+
|     2 | false  |
+-------+--------+
```

#### `HAVING` clause with a non-scalar subquery

Non-scalar subqueries must use the `[NOT] IN` or `[NOT] EXISTS` operators and
can only return a single column.
The values in the returned column are evaluated as a list.

The following query calculates the averages of even and odd numbers in table `y`
and returns the averages that are in `column_1` of table `x`.

```sql
SELECT
  AVG(number) AS avg,
  (number % 2 = 0) AS even
FROM
  y
GROUP BY
  even
HAVING
  avg IN (
    SELECT
      column_1
    FROM
      x
  );

+-------+--------+
|   avg | even   |
+-------+--------+
|     2 | false  |
+-------+--------+
```

## Subquery categories

Subqueries can be categorized as one or more of the following based on the
behavior of the subquery:

- [correlated](#correlated-subqueries) or
  [non-correlated](#non-correlated-subqueries)
- [scalar](#scalar-subqueries) or [non-scalar](#non-scalar-subqueries)

### Correlated subqueries

A **correlated** subquery depends on the values of the current row processed by the outer query. Spice uses DataFusion execution engine, which rewrites correlated subqueries into joins to improve performance. Correlated subqueries are typically less performant than non-correlated subqueries.

### Non-correlated subqueries

A **non-correlated** subquery does not depend on the outer query. The inner query runs first and passes its result to the outer query.

### Scalar subqueries

A **scalar** subquery returns exactly one value (one column of one row). If no rows match, the subquery returns NULL.

### Non-scalar subqueries

A **non-scalar** subquery can return 0, 1, or more rows, each potentially containing one or more columns. If no rows qualify, it returns zero rows. If there are no values for a particular column, it returns NULL for that column.
