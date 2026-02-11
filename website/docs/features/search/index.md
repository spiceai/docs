---
title: 'Search Functionality'
sidebar_label: 'Search'
description: 'Learn how Spice can search across datasets using database-native and vector-search methods.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - search
  - features
  - models
---

import DocCardList from '@theme/DocCardList';

> 🎓 For a practical walkthrough, see the: [Amazon S3 Vectors with Spice](https://spice.ai/blog/amazon-s3-vectors-with-spice) engineering blog post.

Spice provides robust search capabilities enabling developers to query datasets beyond traditional SQL, including semantic (vector-based) search, full-text keyword search, and hybrid search methods.

## Search Methods Overview

Spice supports multiple search methods:

- **Vector Search**: Semantic search using embeddings to retrieve data by meaning and similarity.
- **Full-Text Search**: Keyword-driven search optimized for text data retrieval.
- **Hybrid Search**: Combine multiple search methods using Reciprocal Rank Fusion (RRF) for improved relevance.
- **SQL Search**: Traditional SQL queries for precise and structured searches.

### Vector Search

Vector search uses embeddings—numerical representations of data—to identify similar or related content based on semantic meaning.

**Requirements:**

- Configured data connectors or accelerators
- Defined embeddings for datasets

**Getting Started:**

- [Configure Embeddings](../components/embeddings)
- [Performing Vector Search](./vector-search.md)

**Example SQL Vector Search:**

```sql
SELECT id, extra_column, score
FROM vector_search(my_table, 'search query')
WHERE date_published > '2021-01-01'
ORDER BY score DESC
LIMIT 5
```

For complete SQL UDTF specifications, see [Vector-Based Search SQL UDTF](search/vector-search#sql-udtf).

### Full-Text Search

Full-text search efficiently retrieves records matching specific keywords.

**Requirements:**

- Indexed columns within datasets

**Getting Started:**

- [Full-Text Search Docs](search/full-text)

**Example SQL Full-Text Search:**

```sql
SELECT id, extra_column, score
FROM text_search(my_table, 'search terms')
WHERE date_published > '2021-01-01'
ORDER BY score DESC
LIMIT 5
```

For detailed SQL UDTF instructions, see [Full-Text Search SQL UDTF](search/full-text#searching-with-sql).

### Hybrid Search with RRF

Reciprocal Rank Fusion (RRF) combines results by merging rankings from multiple search methods to improve relevance. This is useful when neither vector search nor full-text search alone provides optimal results.

**Requirements:**

- Multiple search methods configured (vector, full-text, etc.)

**When to use hybrid search:**

- The query contains both semantic concepts and specific keywords.
- Results from a single method are missing relevant documents.
- Improved ranking is needed across diverse content types.

**Example SQL Hybrid Search:**

```sql
SELECT id, title, content, fused_score
FROM rrf(
    vector_search(documents, 'machine learning algorithms'),
    text_search(documents, 'neural networks deep learning', content),
    join_key => 'id'  -- join key for optimal performance
)
ORDER BY fused_score DESC
LIMIT 5
```

For complete RRF syntax and parameters, see [Search SQL Reference](../reference/sql/search#reciprocal-rank-fusion-rrf).

<DocCardList />
