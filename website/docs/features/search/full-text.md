---
title: 'Full-Text Search'
sidebar_label: 'Full-text Search'
description: 'Learn how Spice can perform full text search'
sidebar_position: 2
tags:
  - search
---

Spice provides full text search functionality with BM25 scoring. Datasets can be augmented with a full-text search index that enables efficient search. Dataset columns are included in the full-text index based on the column configuration.

## Enabling Full-Text Search

To enable full-text search, configure your dataset columns within your dataset definition as follows:

```yaml
datasets:
  - from: github:github.com/spiceai/docs/pulls
    name: doc.pulls
    params:
      github_token: ${secrets:GITHUB_TOKEN}
    acceleration:
      enabled: true
    columns:
      - name: title
        full_text_search:
          enabled: true
          row_id:
            - id
      - name: body
        full_text_search:
          enabled: true
```

In this example, full-text search indexing is enabled on both the `title` and `body` columns. The `row_id` specifies a unique identifier for referencing search results and retrieving additional data.

## Searching with the HTTP API

After enabling indexing, you can perform searches using the HTTP API endpoint `/v1/search`. Results will be ranked based on the relevance to your keyword query across indexed columns (`title` and `body` in this example).

For details on using this endpoint, see the [API reference for `/v1/search`(../../api/HTTP/post-search).

## Searching with SQL

Spice also provides full-text search through SQL using a user-defined table function (UDTF), `text_search()`.

### Example SQL Query

Here's how you can query using SQL:

```sql
SELECT id, title, score
FROM text_search(doc.pulls, 'search keywords', body)
ORDER BY score DESC
LIMIT 5;
```

This returns the top 5 results from the `doc.pulls` dataset that best match your search keywords within the `body` column.

### Function Signature

The `text_search()` function has the following signature:

```sql
text_search(
  table STRING,              -- Dataset name (required)
  query STRING,              -- Keyword or phrase to search (required)
  col STRING,                -- Specific column to search (required if dataset has multiple indexed columns)
  limit INTEGER,             -- Maximum results returned (optional, defaults to 1000)
  include_score BOOLEAN      -- Include relevance scores in results (optional, defaults to TRUE)
)
RETURNS TABLE                -- Original table columns plus an optional FLOAT column `score`
```

By default, `text_search` retrieves up to 1000 results. To adjust this, specify the `limit` parameter in the function call.

Use this function to integrate robust full-text search directly into your data workflows with minimal setup.
