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
  - [Multi-Query (Late-Interaction) Form](#multi-query-late-interaction-form)
- [Full-Text Search (`text_search`)](#full-text-search-text_search)
  - [Usage](#usage-1)
    - [Example](#example-1)
- [Reciprocal Rank Fusion (`rrf`)](#reciprocal-rank-fusion-rrf)
  - [Usage](#usage-2)
    - [Examples](#examples)
- [Reranking (`rerank`)](#reranking-rerank)
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
- `query`: Search text, or an array of strings for [multi-query](#multi-query-late-interaction-form) search (required)
- `column`: Column name (optional if only one embedding column; required when the table has multiple embedded columns)
- `limit`: Maximum results (optional). When omitted, the engine-defined maximum is used.
- `include_score`: Include relevance scores (optional, default `TRUE`)
- `distance_metric`: Similarity metric used to rank candidate vectors (optional, named argument). Supported values: `'cosine'` (default) and `'l2'` (negated Euclidean distance). `'dot'` is parsed but not yet wired through the scan path.
- `rank_weight`: Per-query ranking weight (optional, named argument). Only meaningful when `vector_search` is passed as a subquery to [`rrf`](#reciprocal-rank-fusion-rrf).

#### Filter Pushdown

`WHERE` predicates on base table columns (e.g., `created_at`, `product_category`) are pushed down as **pre-filters** — they are applied before the similarity ranking, so only matching rows are scored and returned. This means results reflect the top-K _within the filtered set_, not the top-K of the entire table filtered afterward.

Predicates on computed columns like `score` are applied as post-filters after ranking.

#### Example

```sql
-- Filters on created_at are pushed down before ranking
SELECT review_id, rating, customer_id, body, score
FROM vector_search(reviews, 'issues with same day shipping', 1500)
WHERE created_at >= to_unixtime(now() - INTERVAL '7 days')
ORDER BY score DESC
LIMIT 2;
```

To override the similarity metric, pass `distance_metric` as a named argument:

```sql
SELECT id, body, score
FROM vector_search(reviews, 'issues with shipping', distance_metric => 'l2')
ORDER BY score DESC
LIMIT 10;
```

See [Vector-Based Search](../../features/search/vector-search) for configuration and advanced usage.

### Multi-Query (Late-Interaction) Form

When the target column is a [multi-vector column](../../features/search/multi-vector), `vector_search` also accepts an array of query strings. Each query is embedded independently and the per-row score is `Σ_q max_e cos(q, e)` — ColBERT-style late interaction. Passing an array to a scalar or chunked column returns an error. At most 32 query strings are accepted per call.

```sql
SELECT product_id, name, score
FROM vector_search(products, ['hiking', 'waterproof', 'lightweight'], tags)
ORDER BY score DESC
LIMIT 10;
```

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
- `column`: Column to search (optional if the table has a single full-text index; required when multiple columns are indexed)
- `limit`: Maximum results (optional). Defaults to 1000, which is the maximum supported.
- `include_score`: Include relevance scores (optional, default `TRUE`)
- `rank_weight`: Per-query ranking weight (optional, named argument). Only meaningful when `text_search` is passed as a subquery to [`rrf`](#reciprocal-rank-fusion-rrf).

By default, `text_search` retrieves up to 1000 results. To request fewer, specify a smaller `limit`.

#### Filter Pushdown {#full-text-filter-pushdown}

With the built-in Tantivy engine, `WHERE` predicates on columns carried in the full-text index are pushed into the index scan as **pre-filters** — they are applied before the top-K limit, so the results are the top-K _within the filtered set_ rather than the filtered remainder of an unfiltered top-K. A predicate the index cannot apply is left to Spice's query engine above the scan, and one the index applies only approximately is re-checked there, so results are the same either way; only how many rows survive the limit changes.

```sql
-- state and additions are applied inside the index, before the limit of 5
SELECT id, title, score
FROM text_search(doc.pulls, 'search keywords', body, 5)
WHERE state = 'open' AND additions > 100;
```

Filterable columns are the dataset's primary key (or [`full_text_search.row_id`](../spicepod/datasets#columnsfull_text_searchrow_id)) and any column declared with [`metadata.vectors`](../spicepod/datasets#columnsmetadatavectors), whose values are carried into the index alongside the searched text. Columns of a type the index cannot represent — dates and timestamps — are skipped, with a warning logged at startup naming the column.

Predicates that push down: `=`, `!=`, `<`, `<=`, `>`, `>=`, `BETWEEN`, `IN`, a prefix `LIKE 'x%'` on a string column, and `AND` / `OR` / `NOT` combinations of them. Predicates that do not, and are applied above the scan instead: anything on the searched text column itself (it is tokenized), on a floating-point column, or on a binary column; a case-insensitive or negated `LIKE`; an `IN` list containing `NULL`; and any comparison whose operands are not a column and a literal.

The Tantivy warm tier used with [`engine: elasticsearch`](../../features/search/full-text#warm-tier) is built without those extra columns — its schema is the primary key and `_score` alone — so only primary-key predicates push into it.

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

| Parameter           | Type             | Required | Description                                                                                                                                  |
| ------------------- | ---------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `query_1`           | Search UDTF call | Yes      | First search query (e.g., `vector_search`, `text_search`)                                                                                    |
| `query_2`           | Search UDTF call | Yes      | Second search query. `rrf` requires at least two subqueries.                                                                                 |
| `...`               | Search UDTF call | No       | Additional search queries (variadic)                                                                                                         |
| `join_key`          | String           | No       | Column name to use for joining subquery results. If omitted, the primary key is inferred from the underlying tables; otherwise rows are auto-hashed. |
| `k`                 | Float            | No       | Smoothing parameter for RRF scoring (default: 60.0)                                                                                          |
| `limit`             | Integer          | No       | Upper bound on the fused result set. Also propagated as a default limit to any nested search subquery that does not specify its own.         |
| `time_column`       | String           | No       | Column name containing timestamps for recency boosting                                                                                       |
| `recency_decay`     | String           | No       | Decay function: 'linear' or 'exponential' (default: 'exponential')                                                                           |
| `decay_constant`    | Float            | No       | Decay rate for exponential decay (default: 0.01)                                                                                             |
| `decay_scale_secs`  | Float            | No       | Time scale in seconds for decay (default: 86400)                                                                                             |
| `decay_window_secs` | Float            | No       | Window size for linear decay in seconds (default: 86400)                                                                                     |
| `rank_weight`       | Float            | No       | Per-query ranking weight (**specified within the individual search subquery call**)                                                          |

#### Filter Pushdown

`WHERE` predicates on base table columns (e.g., `review_date`, `product_category`) are pushed down into each nested search subquery as **pre-filters** — they are applied before ranking and fusion, so each subquery only considers matching rows. This means the fused results reflect the top-K _within the filtered set_, not a post-filtered slice of unfiltered rankings.

Predicates on computed columns like `fused_score` are applied as post-filters after fusion.

```sql
-- review_date and product_category are pushed into each vector_search before ranking
SELECT review_id, review_headline
FROM rrf(
    vector_search(amazon_reviews, 'cannot exit the app', rank_weight => 20),
    vector_search(amazon_reviews, 'app not working', rank_weight => 10),
    join_key => 'review_id',
    k => 60.0
)
WHERE review_date > '2015-06-15' AND product_category = 'Mobile_Apps'
LIMIT 10;
```

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
- **Auto-join**: When no `join_key` is specified, `rrf` infers the primary key from the underlying tables; if none is available, rows are joined by an auto-generated row identifier

---

## Reranking (`rerank`)

Reranking reorders candidate results using a dedicated reranker model or an LLM-as-reranker for improved relevance. The input can be any search UDTF (`vector_search`, `text_search`, `rrf`) or a plain table.

### Usage

```sql
SELECT *
FROM rerank(
    <input>,
    document => 'column_name',
    model    => 'reranker_name',
    limit    => 10
)
```

**Arguments:**

| Parameter         | Type              | Required | Description |
| ----------------- | ----------------- | -------- | ----------- |
| `input`           | Table or UDTF     | Yes      | Input rows to rerank. Can be a search UDTF call (`vector_search`, `text_search`, `rrf`) or a table name. |
| `model`           | String            | No       | Name of a registered reranker or chat model. Optional only when exactly one reranker or chat model is registered, in which case that one is used; with none configured, or more than one, the query fails and `model` must be given. |
| `document`        | String            | Yes      | Column containing the text to send to the reranker for scoring. |
| `query`           | String            | No       | Query string for relevance scoring. Auto-extracted from nested search UDTFs when omitted; required for bare-table inputs. |
| `limit`           | Integer           | No       | Maximum number of rows returned. It caps the **output** only and never shrinks the candidate pool, so every candidate is still scored by the reranker — narrow the inner search's own `limit` to reduce reranker calls. |
| `strategy`        | String            | No       | LLM reranking strategy: `'listwise'` (default) or `'pointwise'`. Only applies when the model resolves to a chat model. |
| `prompt_template` | String            | No       | Custom prompt template for LLM-as-reranker. Use `{query}` and `{document}` placeholders. Only applies when the model resolves to a chat model. |

#### Candidate Pool

`rerank` scores every row its input produces, so the input decides the reranker cost:

- **Nested search UDTF** — the inner UDTF's own `limit` bounds the candidate pool. `rerank`'s `limit` is not pushed into it, which is what lets the recall-then-rerank pattern pass a large inner `limit` and a small outer one.
- **Bare table** — there is no inner limit, so a fixed ceiling of **1000 candidate rows** is applied to the scan. A larger table is silently truncated to the first 1000 rows reaching the reranker; use a nested search UDTF, or a subquery with its own filter, when the table is bigger than that.

#### Query Auto-Propagation

When the input is a search UDTF (`vector_search`, `text_search`, or `rrf` wrapping search UDTFs), the query string is automatically extracted from the nested call. Single-string, `make_array(...)`, and `ARRAY[...]` query forms are all supported. For multi-query inputs, the first query string is used.

For bare-table inputs, `query` must be provided explicitly.

#### Examples

**Rerank hybrid search results:**

```sql
SELECT * FROM rerank(
    rrf(
        vector_search(docs, 'delta lake time travel', limit => 50),
        text_search(docs, 'delta lake time travel', limit => 50)
    ),
    document => 'content',
    model    => 'cohere_rr',
    limit    => 10
);
```

**Rerank a plain table with an explicit query:**

```sql
SELECT * FROM rerank(
    tickets,
    query    => 'auth failures',
    document => 'body',
    model    => 'voyage_rr',
    limit    => 5
);
```

**LLM-as-reranker with custom prompt:**

```sql
SELECT * FROM rerank(
    vector_search(kb, 'onboarding checklist', limit => 40),
    document        => 'content',
    model           => 'gpt_mini',
    strategy        => 'pointwise',
    prompt_template => 'Rate 0-1: is this useful for a new hire?\nQuery: {query}\nDoc: {document}',
    limit           => 10
);
```

See [Reranking](../../features/search/rerank) for configuration, provider setup, and additional examples.

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

Spice SQL supports the PostgreSQL regex operators `~` (match), `~*` (case-insensitive match), `!~` (not match), and `!~*` (case-insensitive not match) — see [Operators](./operators#op_re_match). Alternatively, use scalar functions such as `regexp_like`, `regexp_match`, and `regexp_replace`. For details and examples, see the [Scalar Functions documentation](./scalar_functions#regular-expression-functions).

#### Example

```sql
SELECT * FROM my_table WHERE column ~ '^spice.*ai$';
-- Or, equivalently:
SELECT * FROM my_table WHERE regexp_like(column, '^spice.*ai$');
```

---

For more on hybrid and advanced search, see [Search Functionality](../../features/search) and [Vector-Based Search](../../features/search/vector-search)
