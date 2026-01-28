---
title: 'Full-Text Search'
sidebar_label: 'Full-text Search'
description: 'Learn how Spice can perform full text search'
sidebar_position: 2
tags:
  - search
---

Spice provides full text search functionality with BM25 scoring. Datasets can be augmented with a full-text search index that enables efficient search. Dataset columns are included in the full-text index based on the column configuration. For example:

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

Search results (from `v1/search`) will retrieve results based on the keyword similarity of fields `title` & `body`. For more details, see the [API reference for /v1/search](../../api/HTTP/post-search).

### SQL UDTF
The full text search index can also be used to perform search in SQL, via a user-defined table function (UDTF).
```sql
SELECT id, extra_column, score
FROM text_search(doc.pulls, 'search terms', body)
ORDER BY score desc
LIMIT 5
```

The function signature of `text_search` is
```sql
text_search(
  table STRING,              -- Dataset name (required)
  query STRING,              -- Search query expression (required)
  col STRING,                -- Column name to search in (required if multiple full text indices exist)
  limit INTEGER,             -- Maximum number of results to return (optional, default: all)
  include_score BOOLEAN      -- Whether to include relevance score (optional, default: TRUE)
)
RETURNS TABLE                -- The original table and an additional FLOAT column `score` (if `include_score`).
```
