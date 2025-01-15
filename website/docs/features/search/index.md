---
title: 'Search Functionality'
sidebar_label: 'Search'
description: 'Learn how Spice can search across datasets using database-native and vector-search methods.'
sidebar_position: 7
pagination_prev: null
pagination_next: null
tags:
  - search
---

import DocCardList from '@theme/DocCardList';

Spice provides advanced search capabilities that go beyond standard SQL queries, offering both traditional SQL search patterns and vector-based search functionality.

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

## Vector Search

Vector-based search requires configured data sources (connectors or accelerators) in addition to embeddings. These embeddings convert data to numerical representations that can be used by machine learning models, facilitating similarity comparisons for more advanced search capabilities.

Configuring embeddings is crucial for the effectiveness of vector-based search. For detailed instructions on setting up embeddings, refer to [Configured Embeddings](/docs/components/embeddings).

For performing vector-based search, see [Vector-Based Search](/docs/features/search/vector-search).

<DocCardList />
