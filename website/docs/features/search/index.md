---
title: 'Search Functionality'
sidebar_label: 'Search'
description: 'Learn how Spice can search across datasets using database-native and vector-search methods.'
sidebar_position: 8
pagination_prev: null
pagination_next: null
tags:
  - search
  - features
  - models
---

import DocCardList from '@theme/DocCardList';

> 🎓 Learn how it works with the [Amazon S3 Vectors with Spice](/blog/2025/amazon-s3-vectors-with-spice.mdx) engineering blog post.

Spice provides advanced search capabilities that go beyond standard SQL queries, offering both traditional SQL search patterns, semantic (vector-based) search, and full text search functionality.

## Vector Search

Vector-based search requires configured data sources (connectors or accelerators) in addition to embeddings. These embeddings convert data to numerical representations that can be used by machine learning models, facilitating similarity comparisons for more advanced search capabilities.

Configuring embeddings is required for vector-based search. For detailed instructions on setting up embeddings, refer to [Configured Embeddings](/docs/components/embeddings).

For performing vector-based search, see [Vector-Based Search](/docs/features/search/vector-search).

## Full Text Search

Full text search provides keyword based retrieval for a dataset. Search specific indexes are required to be added to the underlying columns of importance. This provides an efficient lookup and counting of words within rows and the table more broadly.

For performing full text search, see [Full text Search](/docs/features/search/full-text).

## Hybrid Search

Spice supports hybrid search utilizing [full-text search](#full-text-search) and [vector search](#vector-search) functionality.

The `v1/search` endpoint will automatically use hybrid search when configured with both full-text & vector search.

## SQL Search

SQL-based search requires the integration of data connectors or data accelerators. For more information on setting up data connectors and accelerators, see [Data Connectors](/docs/components/data-connectors) and [Data Accelerators](/docs/components/data-accelerators).

Spice supports basic search patterns directly through SQL, leveraging its SQL query features. For example, you can perform a text search within a table using SQL's `LIKE` clause:

```sql
SELECT id, text_column
FROM my_table
WHERE
    LOWER(text_column) LIKE '%search_term%'
  AND
    date_published > '2021-01-01'
```

### SQL UDTFs

Similar to the above mentioned [vector search](#vector-search) and [full text search](#full-text-search), Spice supports SQL equivalent user-defined table functions (UDTF).

To perform a vector search

```sql
SELECT id, extra_column, score
FROM vector_search(my_table, 'search query')
WHERE date_published > '2021-01-01'
ORDER BY score desc
LIMIT 5
```

For an entire specification of the `vector_search` UDTF, see [Vector-Based Search](/docs/features/search/vector-search#sql-udtf).

Similarly, for full text search use the `text_search` UDTF

```sql
SELECT id, extra_column, score
FROM text_search(my_table, 'search terms')
WHERE date_published > '2021-01-01'
ORDER BY score desc
LIMIT 5
```

For an entire specification of the `text_search` UDTF, see [Full text Search](/docs/features/search/full-text#sql-udtf).

<DocCardList />
