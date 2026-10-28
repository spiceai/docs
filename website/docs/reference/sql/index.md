---
title: 'SQL Reference'
sidebar_label: 'SQL Reference'
description: 'Complete SQL reference for Spice.ai including SELECT syntax, subqueries, DML statements, aggregate functions, AI functions, JSON operators, and search capabilities.'
keywords: [spice.ai, sql reference, sql syntax, select, aggregate functions, ai functions, json, search, datafusion sql]
image: /img/og/spiceai.png
pagination_prev: 'reference/index'
sidebar_position: 2
pagination_next: null
---

This section provides a comprehensive reference for SQL support in Spice.ai, including syntax, data types, operators, functions, and system features. The reference is organized by topic for ease of navigation.

## Table of Contents

### [SELECT Syntax](sql/select)

- [WITH Clause](sql/select#with-clause)
- [SELECT Clause](sql/select#select-clause)
- [FROM Clause](sql/select#from-clause)
- [WHERE Clause](sql/select#where-clause)
- [JOIN Clause](sql/select#join-clause)
- [GROUP BY Clause](sql/select#group-by-clause)
- [HAVING Clause](sql/select#having-clause)
- [QUALIFY Clause](sql/select#qualify-clause)
- [UNION Clause](sql/select#union-clause)
- [ORDER BY Clause](sql/select#order-by-clause)
- [LIMIT Clause](sql/select#limit-clause)
- [EXCLUDE and EXCEPT Clause](sql/select#exclude-except-replace-and-ilike-clauses)

### [DDL](sql/ddl)

- [Options](sql/ddl#options)
- [CREATE TABLE](sql/ddl#create-table)
- [ALTER TABLE](sql/ddl#alter-table)
- [DROP TABLE](sql/ddl#drop-table)
- [SHOW CREATE TABLE](sql/ddl#show-create-table)
- [CREATE, ALTER, DROP, and SHOW CREATE CATALOG](sql/ddl#create-alter-drop-and-show-create-catalog)
- [Who can define datasets and catalogs](sql/ddl#who-can-define-datasets-and-catalogs)

### [Subqueries](sql/subqueries)

- [Subquery Operators](sql/subqueries#subquery-operators)
- [SELECT Clause Subqueries](sql/subqueries#select-clause-subqueries)
- [FROM Clause Subqueries](sql/subqueries#from-clause-subqueries)
- [WHERE Clause Subqueries](sql/subqueries#where-clause-subqueries)
- [HAVING Clause Subqueries](sql/subqueries#having-clause-subqueries)
- [Subquery Categories](sql/subqueries#subquery-categories)

### [EXPLAIN](sql/explain)

- [EXPLAIN ANALYZE](sql/explain#explain-analyze)
- [EXPLAIN Options](sql/explain#explain-options)

### [Information Schema](sql/information_schema)

- [SHOW TABLES](sql/information_schema#show-tables)
- [SHOW COLUMNS](sql/information_schema#show-columns)
- [SHOW ALL (configuration options)](sql/information_schema#show-all-configuration-options)

### [AI Functions](sql/ai)

- [ai (LLM Text Generation)](sql/ai#ai)
- [Decision functions (ai_if, ai_probability, ai_classify, ai_score, ai_decide)](sql/ai#decision-functions)
- [embed (Vector Embeddings)](sql/ai#embed)

### [Operators and Literals](sql/operators)

- [Numerical Operators](sql/operators#numerical-operators)
- [Comparison Operators](sql/operators#comparison-operators)
- [Logical Operators](sql/operators#logical-operators)
- [Bitwise Operators](sql/operators#bitwise-operators)
- [Type Casting Operators](sql/operators#type-casting-operators)
- [Other Operators](sql/operators#other-operators)
- [Literals](sql/operators#literals)

### [Scalar Functions](sql/scalar_functions)

- [Math Functions](sql/scalar_functions#math-functions)
- [Conditional Functions](sql/scalar_functions#conditional-functions)
- [String Functions](sql/scalar_functions#string-functions)
- [Binary String Functions](sql/scalar_functions#binary-string-functions)
- [Regular Expression Functions](sql/scalar_functions#regular-expression-functions)
- [Time and Date Functions](sql/scalar_functions#time-and-date-functions)
- [Array Functions](sql/scalar_functions#array-functions)
- [Struct Functions](sql/scalar_functions#struct-functions)
- [Map Functions](sql/scalar_functions#map-functions)
- [Hashing Functions](sql/scalar_functions#hashing-functions)
- [Encoding Functions](sql/scalar_functions#encoding-functions)
- [Union Functions](sql/scalar_functions#union-functions)
- [Other Functions](sql/scalar_functions#other-functions)

Spark-compatible scalar functions such as `array`, `bit_get`, `date_add`, `like`, and `parse_url` follow the semantics documented in the [Spark SQL built-in function reference](https://spark.apache.org/docs/latest/api/sql/index.html).

### [Aggregate Functions](sql/aggregate_functions)

- [Filter Clause](sql/aggregate_functions#filter-clause)
- [WITHIN GROUP / Ordered-set Aggregates](sql/aggregate_functions#within-group--ordered-set-aggregates)
- [General Aggregate Functions](sql/aggregate_functions#general-functions)
- [Statistical Aggregate Functions](sql/aggregate_functions#statistical-functions)
- [Approximate Aggregate Functions](sql/aggregate_functions#approximate-functions)

### Window Functions

Window functions perform calculations across sets of rows related to the current row. Spice supports window functions using the `OVER` clause with aggregate and ranking functions. See [Aggregate Functions](sql/aggregate_functions) for functions that support the `OVER` clause, including `ROW_NUMBER`, `RANK`, `DENSE_RANK`, `PERCENT_RANK`, `CUME_DIST`, `NTILE`, `LAG`, `LEAD`, `FIRST_VALUE`, `LAST_VALUE`, and `NTH_VALUE`.

**Example:**

```sql
SELECT
  dept_id,
  employee_name,
  salary,
  ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rank
FROM employees;
```

### [JSON Functions and Operators](sql/json)

- [JSON Functions](sql/json#json-functions)
- [JSON Operators](sql/json#json-operators)
- [Usage Examples](sql/json#usage-examples)

### [Search](sql/search)

- [Vector Search (`vector_search`)](sql/search#vector-search-vector_search)
- [Full-Text Search (`text_search`)](sql/search#full-text-search-text_search)
- [Reciprocal Rank Fusion (`rrf`)](sql/search#reciprocal-rank-fusion-rrf)
- [Reranking (`rerank`)](sql/search#reranking-rerank)
- [Lexical Search: LIKE, =, and Regex](sql/search#lexical-search-like--and-regex)

### [Prepared Statements](sql/prepared_statements)

- [Positional Arguments](sql/prepared_statements#positional-arguments)

### [DML (Data Manipulation Language)](sql/dml)

- [INSERT Statement](sql/dml#insert)

### Data Types

Spice uses Apache Arrow data types internally. For data type compatibility with accelerators, see [Data Type Reference](datatypes). Common SQL types include:

| SQL Type          | Description                         |
| ----------------- | ----------------------------------- |
| `INT`, `BIGINT`   | Integer types                       |
| `FLOAT`, `DOUBLE` | Floating-point types                |
| `VARCHAR`, `TEXT` | String types                        |
| `BOOLEAN`         | Boolean type                        |
| `TIMESTAMP`       | Timestamp with nanosecond precision |
| `DATE`            | Date type                           |
| `DECIMAL`         | Arbitrary precision numeric         |

Use `CAST(expression AS type)` or `expression::type` to convert between types.

#### Comparing Decimals with Fractional Literals

A fractional number literal such as `12345678.90` is planned as a `DOUBLE` (`Float64`). When the literal is compared with or cast to a `DECIMAL`, Spice converts it from its decimal digits rather than from its binary floating-point value, within the limits described below, so the comparison matches the value as written:

```sql
SELECT count(*) AS n
FROM (SELECT CAST('12345678.90' AS DECIMAL(10, 2)) AS price) AS t
WHERE price = 12345678.90;
```

```
+---+
| n |
+---+
| 1 |
+---+
```

Bound `Float64` and `Float32` query parameters, such as `$1` in a [prepared statement](sql/prepared_statements), have no written digits, so Spice converts them from the shortest decimal spelling of the value.

For both literals and parameters, the conversion applies when the digits fit: at most 15 significant digits and 15 digits before the decimal point (6 for a `Float32` parameter), no more fraction digits than the decimal's scale, and no more digits than its precision. Any other value keeps the standard floating-point cast, with its rounding and overflow behavior. For example, `CAST(1.234 AS DECIMAL(10, 2))` needs rounding, `CAST(0.30000000000000004 AS DECIMAL(38, 18))` has 17 significant digits, and a bound `1e30` cast to `DECIMAL(38, 0)` has 31 digits before the decimal point, so all three keep the floating-point cast.

As an exception, a literal that a `Float64` stores as a different, shorter number, such as `4.0700000000000003` (stored as `4.07`), is converted from its written digits and rounded half away from zero to the decimal's scale. When one statement writes two different numbers that read as the same `Float64`, such as `price = 4.0700000000000003 OR price = 4.07`, Spice cannot tell those literals apart, and both keep the floating-point cast.

To compare against a value outside these limits exactly, write it as a string cast, for example `CAST('0.30000000000000004' AS DECIMAL(38, 18))`, or pass a `Decimal128` parameter.

Refer to each section for detailed syntax, supported features, and examples.
