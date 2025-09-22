---
title: 'Search in SQL'
sidebar_label: 'Search'
description: 'Reference for search functions and filtering in Spice SQL.'
sidebar_position: 20
---

This section documents search capabilities in Spice SQL, including vector search, full-text search, and lexical filtering methods. These features help retrieve relevant data using semantic similarity, keyword matching, and pattern-based filtering.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Vector Search (`vector_search`)](#vector-search-vector_search)
  - [Usage](#usage)
    - [Example](#example)
- [Full-Text Search (`text_search`)](#full-text-search-text_search)
  - [Usage](#usage-1)
    - [Example](#example-1)
- [Reciprocal Rank Fusion (`rrf`)](#reciprocal-rank-fusion-rrf)
  - [Usage](#usage-2)
    - [Example](#example-2)
- [Lexical Search: LIKE, =, and Regex](#lexical-search-like--and-regex)
  - [LIKE (Pattern Matching)](#like-pattern-matching)
  - [= (Keyword/Exact Match)](#-keywordexact-match)
  - [Regex Filtering](#regex-filtering)
    - [Example](#example-3)

---

## Vector Search (`vector_search`)

Vector search retrieves records by semantic similarity using embeddings. It is ideal for finding related content even when exact keywords differ.

### Usage

```sql
SELECT id, score
FROM vector_search(table, 'search query')
ORDER BY score DESC
LIMIT 5;
```

- `table`: Dataset name (required)
- `query`: Search text (required)
- `col`: Column name (optional if only one embedding column)
- `limit`: Maximum results (optional)
- `include_score`: Include relevance scores (optional, default TRUE)

#### Example

```sql
SELECT review_id, rating, customer_id, body, score
FROM vector_search(reviews, 'issues with same day shipping')
WHERE created_at >= to_unixtime(now() - INTERVAL '7 days')
ORDER BY score DESC
LIMIT 2;
```

See [Vector-Based Search](/docs/features/search/vector-search) for configuration and advanced usage.

---

## Full-Text Search (`text_search`)

Full-text search uses BM25 scoring to retrieve records matching keywords in indexed columns.

### Usage

```sql
SELECT id, score
FROM text_search(table, 'search terms', col)
ORDER BY score DESC
LIMIT 5;
```

- `table`: Dataset name (required)
- `query`: Keyword or phrase (required)
- `col`: Column to search (required if multiple indexed columns)
- `limit`: Maximum results (optional)
- `include_score`: Include relevance scores (optional, default TRUE)

#### Example

```sql
SELECT id, title, score
FROM text_search(doc.pulls, 'search keywords', body)
ORDER BY score DESC
LIMIT 5;
```

See [Full-Text Search](/docs/features/search/full-text) for configuration and details.

---

## Reciprocal Rank Fusion (`rrf`)

Reciprocal Rank Fusion (RRF) combines results from multiple search queries to improve relevance by merging rankings from different search methods.

### Usage

`rrf` is varadic and takes two or more search UDTF calls as arguments. An optional join key column and smoothing parameter can be provided. When no join key is specified, Spice will compute a JOIN key on-the-fly (by hashing rows) in order to fuse the results. Specifying an explicit JOIN key is recommended for optimal performance.

```sql
SELECT id, content, fused_score
FROM rrf(
    vector_search(table, 'search query'),
    text_search(table, 'search terms', column),
    id,    -- optional join key column
    60.0   -- optional k parameter (smoothing factor)
)
ORDER BY fused_score DESC
LIMIT 10;
```

**Arguments:**

| Parameter  | Type             | Required | Description                                               |
|------------|------------------|----------|-----------------------------------------------------------|
| `query_1`  | Search UDTF call | Yes      | First search query (e.g., `vector_search`, `text_search`) |
| `query_2`  | Search UDTF call | Yes      | Second search query                                       |
| `...`      | Search UDTF call | No       | Additional search queries (variadic)                      |
| `join_key` | Column           | No       | Column name to use for joining results across queries     |
| `k`        | Float            | No       | Smoothing parameter for RRF scoring (default: 60)         |

#### Example

```sql
-- Combine vector and text search for enhanced relevance
SELECT id, title, content, fused_score
FROM rrf(
    vector_search(documents, 'machine learning algorithms'),
    text_search(documents, 'neural networks deep learning', content),
    id  -- use 'id' column as join key for better performance
)
WHERE fused_score > 0.01
ORDER BY fused_score DESC
LIMIT 5;
```

**How RRF works:**
- Each input query is ranked independently by score
- Rankings are combined using the formula: `RRF Score = Σ(1 / (k + rank))`
- Documents appearing in multiple result sets receive higher scores
- The `k` parameter controls ranking sensitivity (lower = more sensitive to rank position)

---

## Lexical Search: LIKE, =, and Regex

Spice SQL supports traditional filtering for exact and pattern-based matches:

### LIKE (Pattern Matching)

```sql
SELECT * FROM my_table WHERE column LIKE '%substring%';
```

- `%` matches any sequence of characters.
- `_` matches a single character.

### = (Keyword/Exact Match)

```sql
SELECT * FROM my_table WHERE column = 'exact value';
```

Returns rows where the column exactly matches the value.

### Regex Filtering

Spice SQL does not support the `~` or `!~` operators for regular expression matching. Instead, use scalar functions such as `regexp_like`, `regexp_match`, and `regexp_replace` for regex-based filtering. For details and examples, see the [Scalar Functions documentation](/docs/reference/sql/scalar_functions#regular-expression-functions).

#### Example

```sql
SELECT * FROM my_table WHERE regexp_like(column, '^spice.*ai$');
```

---

For more on hybrid and advanced search, see [Search Functionality](/docs/features/search) and [Vector-Based Search](/docs/features/search/vector-search).
