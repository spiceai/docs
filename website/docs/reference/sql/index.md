---
title: 'SQL Reference'
sidebar_label: 'SQL Reference'
pagination_prev: 'reference/index'
sidebar_position: 2
pagination_next: null
---

This section provides a comprehensive reference for SQL support in Spice.ai, including syntax, data types, operators, functions, and system features. The reference is organized by topic for ease of navigation.

## Table of Contents

### [SELECT Syntax](/docs/reference/sql/select)

- [WITH Clause](/docs/reference/sql/select#with-clause)
- [SELECT Clause](/docs/reference/sql/select#select-clause)
- [FROM Clause](/docs/reference/sql/select#from-clause)
- [WHERE Clause](/docs/reference/sql/select#where-clause)
- [JOIN Clause](/docs/reference/sql/select#join-clause)
- [GROUP BY Clause](/docs/reference/sql/select#group-by-clause)
- [HAVING Clause](/docs/reference/sql/select#having-clause)
- [UNION Clause](/docs/reference/sql/select#union-clause)
- [ORDER BY Clause](/docs/reference/sql/select#order-by-clause)
- [LIMIT Clause](/docs/reference/sql/select#limit-clause)
- [EXCLUDE and EXCEPT Clause](/docs/reference/sql/select#exclude-and-except-clause)

### [Subqueries](/docs/reference/sql/subqueries)

- [Subquery Operators](/docs/reference/sql/subqueries#subquery-operators)
- [SELECT Clause Subqueries](/docs/reference/sql/subqueries#select-clause-subqueries)
- [FROM Clause Subqueries](/docs/reference/sql/subqueries#from-clause-subqueries)
- [WHERE Clause Subqueries](/docs/reference/sql/subqueries#where-clause-subqueries)
- [HAVING Clause Subqueries](/docs/reference/sql/subqueries#having-clause-subqueries)
- [Subquery Categories](/docs/reference/sql/subqueries#subquery-categories)

### [EXPLAIN](/docs/reference/sql/explain)

- [EXPLAIN ANALYZE](/docs/reference/sql/explain#explain-analyze)

### [Information Schema](/docs/reference/sql/information_schema)

- [SHOW TABLES](/docs/reference/sql/information_schema#show-tables)
- [SHOW COLUMNS](/docs/reference/sql/information_schema#show-columns)
- [SHOW ALL (configuration options)](/docs/reference/sql/information_schema#show-all-configuration-options)

### [AI Functions](/docs/reference/sql/ai)

- [ai (LLM Text Generation)](/docs/reference/sql/ai#ai)
- [embed (Vector Embeddings)](/docs/reference/sql/ai#embed)

### [Operators and Literals](/docs/reference/sql/operators)

- [Numerical Operators](/docs/reference/sql/operators#numerical-operators)
- [Comparison Operators](/docs/reference/sql/operators#comparison-operators)
- [Logical Operators](/docs/reference/sql/operators#logical-operators)
- [Bitwise Operators](/docs/reference/sql/operators#bitwise-operators)
- [Other Operators](/docs/reference/sql/operators#other-operators)

### [Scalar Functions](/docs/reference/sql/scalar_functions)

- [Math Functions](/docs/reference/sql/scalar_functions#math-functions)
- [Conditional Functions](/docs/reference/sql/scalar_functions#conditional-functions)
- [String Functions](/docs/reference/sql/scalar_functions#string-functions)
- [Binary String Functions](/docs/reference/sql/scalar_functions#binary-string-functions)
- [Regular Expression Functions](/docs/reference/sql/scalar_functions#regular-expression-functions)
- [Time and Date Functions](/docs/reference/sql/scalar_functions#time-and-date-functions)
- [Array Functions](/docs/reference/sql/scalar_functions#array-functions)
- [Struct Functions](/docs/reference/sql/scalar_functions#struct-functions)
- [Map Functions](/docs/reference/sql/scalar_functions#map-functions)
- [Hashing Functions](/docs/reference/sql/scalar_functions#hashing-functions)
- [Union Functions](/docs/reference/sql/scalar_functions#union-functions)
- [Other Functions](/docs/reference/sql/scalar_functions#other-functions)

Spark-compatible scalar functions such as `array`, `bit_get`, `date_add`, `like`, and `parse_url` follow the semantics documented in the [Spark SQL built-in function reference](https://spark.apache.org/docs/latest/api/sql/index.html).

### [Aggregate Functions](/docs/reference/sql/aggregate_functions)

- [General Aggregate Functions](/docs/reference/sql/aggregate_functions#general-functions)
- [Statistical Aggregate Functions](/docs/reference/sql/aggregate_functions#statistical-functions)
- [Approximate Aggregate Functions](/docs/reference/sql/aggregate_functions#approximate-functions)

### [JSON Functions and Operators](/docs/reference/sql/json)

- [JSON Functions](/docs/reference/sql/json#json-functions)
- [JSON Operators](/docs/reference/sql/json#json-operators)
- [Usage Examples](/docs/reference/sql/json#usage-examples)

### [Search](/docs/reference/sql/search)

- [Vector Search (`vector_search`)](/docs/reference/sql/search#vector-search-vector_search)
- [Full-Text Search (`text_search`)](/docs/reference/sql/search#full-text-search-text_search)
- [Lexical Search: LIKE, =, and Regex](/docs/reference/sql/search#lexical-search-like--and-regex)

### [Prepared Statements](/docs/reference/sql/prepared_statements)

- [Positional Arguments](/docs/reference/sql/prepared_statements#positional-arguments)

### [DML (Data Manipulation Language)](/docs/reference/sql/dml)

- [INSERT Statement](/docs/reference/sql/dml#insert)

### Data Types

Spice uses Apache Arrow data types internally. Common SQL types include:

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
