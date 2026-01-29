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

### [SELECT Syntax](./select)

- [WITH Clause](./select#with-clause)
- [SELECT Clause](./select#select-clause)
- [FROM Clause](./select#from-clause)
- [WHERE Clause](./select#where-clause)
- [JOIN Clause](./select#join-clause)
- [GROUP BY Clause](./select#group-by-clause)
- [HAVING Clause](./select#having-clause)
- [QUALIFY Clause](./select#qualify-clause)
- [UNION Clause](./select#union-clause)
- [ORDER BY Clause](./select#order-by-clause)
- [LIMIT Clause](./select#limit-clause)
- [EXCLUDE and EXCEPT Clause](./select#exclude-and-except-clause)

### [Subqueries](./subqueries)

- [Subquery Operators](./subqueries#subquery-operators)
- [SELECT Clause Subqueries](./subqueries#select-clause-subqueries)
- [FROM Clause Subqueries](./subqueries#from-clause-subqueries)
- [WHERE Clause Subqueries](./subqueries#where-clause-subqueries)
- [HAVING Clause Subqueries](./subqueries#having-clause-subqueries)
- [Subquery Categories](./subqueries#subquery-categories)

### [EXPLAIN](./explain)

- [EXPLAIN ANALYZE](./explain#explain-analyze)

### [Information Schema](./information_schema)

- [SHOW TABLES](./information_schema#show-tables)
- [SHOW COLUMNS](./information_schema#show-columns)
- [SHOW ALL (configuration options)](./information_schema#show-all-configuration-options)

### [AI Functions](./ai)

- [ai (LLM Text Generation)](./ai#ai)
- [embed (Vector Embeddings)](./ai#embed)

### [Operators and Literals](./operators)

- [Numerical Operators](./operators#numerical-operators)
- [Comparison Operators](./operators#comparison-operators)
- [Logical Operators](./operators#logical-operators)
- [Bitwise Operators](./operators#bitwise-operators)
- [Type Casting Operators](./operators#type-casting-operators)
- [Other Operators](./operators#other-operators)
- [Literals](./operators#literals)

### [Scalar Functions](./scalar_functions)

- [Math Functions](./scalar_functions#math-functions)
- [Conditional Functions](./scalar_functions#conditional-functions)
- [String Functions](./scalar_functions#string-functions)
- [Binary String Functions](./scalar_functions#binary-string-functions)
- [Regular Expression Functions](./scalar_functions#regular-expression-functions)
- [Time and Date Functions](./scalar_functions#time-and-date-functions)
- [Array Functions](./scalar_functions#array-functions)
- [Struct Functions](./scalar_functions#struct-functions)
- [Map Functions](./scalar_functions#map-functions)
- [Hashing Functions](./scalar_functions#hashing-functions)
- [Union Functions](./scalar_functions#union-functions)
- [Other Functions](./scalar_functions#other-functions)

Spark-compatible scalar functions such as `array`, `bit_get`, `date_add`, `like`, and `parse_url` follow the semantics documented in the [Spark SQL built-in function reference](https://spark.apache.org/docs/latest/api/sql/index.html).

### [Aggregate Functions](./aggregate_functions)

- [Filter Clause](./aggregate_functions#filter-clause)
- [WITHIN GROUP / Ordered-set Aggregates](./aggregate_functions#within-group--ordered-set-aggregates)
- [General Aggregate Functions](./aggregate_functions#general-functions)
- [Statistical Aggregate Functions](./aggregate_functions#statistical-functions)
- [Approximate Aggregate Functions](./aggregate_functions#approximate-functions)

### Window Functions

Window functions perform calculations across sets of rows related to the current row. Spice supports window functions using the `OVER` clause with aggregate and ranking functions. See [Aggregate Functions](./aggregate_functions) for functions that support the `OVER` clause, including `ROW_NUMBER`, `RANK`, `DENSE_RANK`, `LAG`, `LEAD`, `FIRST_VALUE`, `LAST_VALUE`, and `NTH_VALUE`.

**Example:**

```sql
SELECT
  dept_id,
  employee_name,
  salary,
  ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rank
FROM employees;
```

### [JSON Functions and Operators](./json)

- [JSON Functions](./json#json-functions)
- [JSON Operators](./json#json-operators)
- [Usage Examples](./json#usage-examples)

### [Search](./search)

- [Vector Search (`vector_search`)](./search#vector-search-vector_search)
- [Full-Text Search (`text_search`)](./search#full-text-search-text_search)
- [Lexical Search: LIKE, =, and Regex](./search#lexical-search-like--and-regex)

### [Prepared Statements](./prepared_statements)

- [Positional Arguments](./prepared_statements#positional-arguments)

### [DML (Data Manipulation Language)](./dml)

- [INSERT Statement](./dml#insert)

### Data Types

Spice uses Apache Arrow data types internally. For data type compatibility with accelerators, see [Data Type Reference](../datatypes). Common SQL types include:

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

Refer to each section for detailed syntax, supported features, and examples.
