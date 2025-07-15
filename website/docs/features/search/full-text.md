---
title: 'Full-Text Search'
sidebar_label: 'Full-text Search'
description: 'Learn how Spice can perform full text search'
sidebar_position: 2
tags:
  - search
---

Spice provides full text search functionality with BM25 scoring. Datasets can be augmented with a full-text search index that enables efficient search. Dataset columns are included in the full-text index based on the column configuration. For example
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

Search results (from `v1/search`) will retrieve results based on the keyword similarity of fields `title` & `body`. For more details, see the [API reference for /v1/search](/docs/api/HTTP/post-search).
