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
    - [Examples](#examples)
- [Lexical Search: LIKE, =, and Regex](#lexical-search-like--and-regex)
  - [LIKE (Pattern Matching)](#like-pattern-matching)
  - [= (Keyword/Exact Match)](#-keywordexact-match)
  - [Regex Filtering](#regex-filtering)
    - [Example](#example-2)

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
- `limit`: Maximum results (optional, default: 1000)
- `include_score`: Include relevance scores (optional, default TRUE)
- `rank_weight`: Result rank weight (optional, named argument, default `score * 1`, only when specified as an argument in [RRF](#reciprocal-rank-fusion-rrf))

By default, `vector_search` retrieves up to 1000 results. To change this, specify a limit parameter in the function call.

#### Example

```sql
SELECT review_id, rating, customer_id, body, score
FROM vector_search(reviews, 'issues with same day shipping', 1500)
WHERE created_at >= to_unixtime(now() - INTERVAL '7 days')
ORDER BY score DESC
LIMIT 2;
```

See [Vector-Based Search](../../features/search/vector-search) for configuration and advanced usage.

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
- `limit`: Maximum results (optional, default: 1000)
- `include_score`: Include relevance scores (optional, default TRUE)
- `rank_weight`: Result rank weight (optional, named argument, default `score * 1`, only when specified as an argument in [RRF](#reciprocal-rank-fusion-rrf))

By default, `text_search` retrieves up to 1000 results. To change this, specify a limit parameter in the function call.

#### Example

```sql
SELECT id, title, score
FROM text_search(doc.pulls, 'search keywords', body)
ORDER BY score DESC
LIMIT 5;
```

See [Full-Text Search](../../features/search/full-text) for configuration and details.

---

## Reciprocal Rank Fusion (`rrf`)

Reciprocal Rank Fusion (RRF) combines results from multiple search queries to improve relevance by merging rankings from different search methods. Advanced features include per-query ranking weights, recency boosting, and flexible decay functions.

### Usage

`rrf` is variadic and takes two or more search UDTF calls as arguments. Named parameters provide advanced control over ranking, recency, and fusion behavior.

:::info
The `rrf` function automatically adds a `fused_score` column to the result set, which contains the combined relevance score from all input search queries. Results are sorted by `fused_score DESC` by default when no explicit `ORDER BY` clause is specified.
:::

```sql
SELECT id, content, fused_score
FROM rrf(
    vector_search(table, 'search query', rank_weight => 20),
    text_search(table, 'search terms', column),
    join_key => 'id',    -- explicit join key for performance
    k => 60.0            -- smoothing parameter
)
ORDER BY fused_score DESC
LIMIT 10;
```

**Arguments:**

Note that `rank_weight` is specified as the last argument to either a `text_search` or `vector_search` UDTF call (as shown above). All other arguments can be specified in any order after the search calls (within an `rrf` invocation).

| Parameter           | Type             | Required | Description                                                        |
| ------------------- | ---------------- | -------- | ------------------------------------------------------------------ |
| `query_1`           | Search UDTF call | Yes      | First search query (e.g., `vector_search`, `text_search`)          |
| `query_2`           | Search UDTF call | Yes      | Second search query                                                |
| `...`               | Search UDTF call | No       | Additional search queries (variadic)                               |
| `join_key`          | String           | No       | Column name to use for joining results (default: auto-hash)        |
| `k`                 | Float            | No       | Smoothing parameter for RRF scoring (default: 60.0)                |
| `time_column`       | String           | No       | Column name containing timestamps for recency boosting             |
| `recency_decay`     | String           | No       | Decay function: 'linear' or 'exponential' (default: 'exponential') |
| `decay_constant`    | Float            | No       | Decay rate for exponential decay (default: 0.01)                   |
| `decay_scale_secs`  | Float            | No       | Time scale in seconds for decay (default: 86400)                   |
| `decay_window_secs` | Float            | No       | Window size for linear decay in seconds (default: 86400)           |
| `rank_weight`       | Float            | No       | Per-query ranking weight (**specified within search functions**)   |

#### Examples

**Basic Hybrid Search:**

```sql
-- Combine vector and text search for enhanced relevance
SELECT id, title, content, fused_score
FROM rrf(
    vector_search(documents, 'machine learning algorithms'),
    text_search(documents, 'neural networks deep learning', content),
    join_key => 'id'  -- explicit join key for performance
)
WHERE fused_score > 0.01
ORDER BY fused_score DESC
LIMIT 5;
```

**Weighted Ranking:**

```sql
-- Boost semantic search over exact text matching
SELECT fused_score, title, content
FROM rrf(
    text_search(posts, 'artificial intelligence', rank_weight => 50.0),
    vector_search(posts, 'AI machine learning', rank_weight => 200.0)
)
ORDER BY fused_score DESC
LIMIT 10;
```

**Recency-Boosted Search:**

```sql
-- Exponential decay favoring recent content
SELECT fused_score, title, created_at
FROM rrf(
    text_search(news, 'breaking news'),
    vector_search(news, 'latest updates'),
    time_column => 'created_at',
    recency_decay => 'exponential',
    decay_constant => 0.05,
    decay_scale_secs => 3600  -- 1 hour scale
)
ORDER BY fused_score DESC
LIMIT 10;
```

**Linear Decay:**

```sql
-- Linear decay over 24 hours
SELECT fused_score, content
FROM rrf(
    text_search(posts, 'trending'),
    vector_search(posts, 'viral popular'),
    time_column => 'created_at',
    recency_decay => 'linear',
    decay_window_secs => 86400
)
ORDER BY fused_score DESC;
```

**How RRF works:**

- Each input query is ranked independently by score
- Rankings are combined using the formula: `RRF Score = Σ(rank_weight / (k + rank))`
- Documents appearing in multiple result sets receive higher scores
- The `k` parameter controls ranking sensitivity (lower = more sensitive to rank position)

**Advanced query tuning**:

- **Rank weighting**: Individual queries can be weighted using `rank_weight` parameter
- **Recency boosting**: When `time_column` is specified, scores are multiplied by a decay factor
  - **Exponential decay**: `e^(-decay_constant * age_in_units)` where age is in `decay_scale_secs`
  - **Linear decay**: `max(0, 1 - (age_in_units / decay_window_secs))`
- **Auto-join**: When no `join_key` is specified, rows are automatically hashed for joining

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

Spice SQL does not support the `~` or `!~` operators for regular expression matching. Instead, use scalar functions such as `regexp_like`, `regexp_match`, and `regexp_replace` for regex-based filtering. For details and examples, see the [Scalar Functions documentation](./scalar_functions#regular-expression-functions).

#### Example

```sql
SELECT * FROM my_table WHERE regexp_like(column, '^spice.*ai$');
```

---

For more on hybrid and advanced search, see [Search Functionality](../../features/search) and [Vector-Based Search](../../features/search/vector-search)
