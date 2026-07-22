---
title: 'Full-Text Search'
sidebar_label: 'Full-text Search'
description: 'Learn how Spice can perform full text search'
sidebar_position: 2
tags:
  - search
---

Spice provides full-text search functionality with BM25 scoring. This search method is optimized for keyword-based queries and is useful when:

- Users search for specific terms or phrases
- Exact keyword matching is important
- Searching structured text fields like titles, tags, or names

Datasets can be augmented with a full-text search index that enables efficient search. Dataset columns are included in the full-text index based on the column configuration.

## Engines

Spice supports two full-text search engines:

| Engine | Description |
| --- | --- |
| **Tantivy** (default) | Built-in, in-process BM25 engine. No external dependencies. |
| **Elasticsearch** | Delegates BM25 indexing and search to an external Elasticsearch cluster. Useful when Elasticsearch is already part of the infrastructure or when its operational characteristics (sharding, replication, snapshots) are preferred. |

When no engine is specified, Tantivy is used automatically.

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

In this example, full-text search indexing is enabled on both the `title` and `body` columns using the default Tantivy engine. The `row_id` specifies a unique identifier for referencing search results and retrieving additional data.

## Using Elasticsearch as the FTS Engine

To use Elasticsearch instead of the built-in Tantivy engine, add a dataset-level `full_text_search` block with `engine: elasticsearch` and the connection parameters:

```yaml
datasets:
  - from: file:./articles.parquet
    name: articles
    acceleration:
      enabled: true
      engine: arrow
    full_text_search:
      engine: elasticsearch
      params:
        elasticsearch_endpoint: http://localhost:9200
        elasticsearch_user: ${secrets:ES_USER}
        elasticsearch_pass: ${secrets:ES_PASS}
        elasticsearch_index: articles-fts
    columns:
      - name: title
        full_text_search:
          enabled: true
          row_id:
            - id
      - name: body
        full_text_search:
          enabled: true
          row_id:
            - id
```

The dataset-level `full_text_search` block selects the engine and provides connection parameters. Column-level `full_text_search.enabled` controls which columns are indexed.

:::note[Enterprise edition]
The Elasticsearch full-text search engine is available in the Spice [Enterprise edition](https://docs.spice.ai/docs/enterprise/getting-started/distributions).
:::

### Elasticsearch FTS Parameters

| Parameter | Description | Example |
| --- | --- | --- |
| `elasticsearch_endpoint` | Required. Elasticsearch cluster URL. | `http://localhost:9200` |
| `elasticsearch_user` | Optional. Username for HTTP basic authentication. | `${secrets:ES_USER}` |
| `elasticsearch_pass` | Optional. Password for HTTP basic authentication. | `${secrets:ES_PASS}` |
| `elasticsearch_index` | Optional. ES index name for FTS documents. Defaults to the dataset name. | `articles-fts` |
| `client_timeout` | Optional. Total HTTP request timeout. Default: `30s`. | `30s` |
| `connect_timeout` | Optional. HTTP connect timeout. Default: `10s`. | `10s` |

### Elasticsearch Ingestion Tuning

Optional parameters to control Elasticsearch index creation and write behavior:

| Parameter | Description | Default |
| --- | --- | --- |
| `number_of_shards` | ES `number_of_shards` index setting (applied at index creation). | ES default |
| `number_of_replicas` | ES `number_of_replicas` index setting (applied at index creation). | ES default |
| `refresh_interval` | ES `refresh_interval` index setting (applied at index creation). | ES default |
| `bulk_load_refresh_interval` | Temporary `refresh_interval` during bulk writes. Set to `-1` to disable refresh during loading. | Not set |
| `force_merge_after_write` | Run `_forcemerge` after full/append writes. | `false` |
| `force_merge_segments` | Max segments for `_forcemerge`. Setting this also enables force merge. | `1` (when force merge enabled) |
| `batch_write_rows` | Max rows per `_bulk` request. | `1000` |
| `index_settings` | JSON object passed as ES index settings at creation. | Not set |

### YAML Anchor Reuse

When multiple datasets or columns share the same Elasticsearch connection, use YAML anchors to avoid repeating config:

```yaml
x-elasticsearch-fts: &elasticsearch_fts
  enabled: true
  engine: elasticsearch
  params:
    elasticsearch_endpoint: http://localhost:9200
    elasticsearch_user: ${secrets:ES_USER}
    elasticsearch_pass: ${secrets:ES_PASS}

datasets:
  - from: file:./articles.parquet
    name: articles
    acceleration:
      enabled: true
    full_text_search:
      <<: *elasticsearch_fts
      params:
        elasticsearch_endpoint: http://localhost:9200
        elasticsearch_index: articles-fts
    columns:
      - name: title
        full_text_search:
          enabled: true
          row_id:
            - id
```

### Combining with the Elasticsearch Vector Engine

Elasticsearch can serve as both the vector engine and the FTS engine for the same dataset. Configure `vectors` and `full_text_search` independently:

```yaml
datasets:
  - from: file:./articles.parquet
    name: articles
    acceleration:
      enabled: true
    vectors:
      enabled: true
      engine: elasticsearch
      params:
        elasticsearch_endpoint: http://localhost:9200
        elasticsearch_index: articles-vectors
    full_text_search:
      engine: elasticsearch
      params:
        elasticsearch_endpoint: http://localhost:9200
        elasticsearch_index: articles-fts
    columns:
      - name: body
        embeddings:
          - from: my_embedding_model
            row_id:
              - id
        full_text_search:
          enabled: true
          row_id:
            - id
```

Use [`rrf()`](../../reference/sql/search#reciprocal-rank-fusion-rrf) to combine vector and full-text results with hybrid search.

## Searching with the HTTP API

After enabling indexing, you can perform searches using the HTTP API endpoint `/v1/search`. Results will be ranked based on the relevance to your keyword query across indexed columns (`title` and `body` in this example).

For details on using this endpoint, see the [API reference for `/v1/search`](../../api/HTTP/post-search).

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
  table IDENTIFIER,          -- Dataset name (required, unquoted)
  query STRING,              -- Keyword or phrase to search (required)
  col IDENTIFIER,            -- Column name to search (required if dataset has multiple indexed columns, unquoted)
  limit INTEGER,             -- Maximum results returned (optional, defaults to 1000)
  include_score BOOLEAN      -- Include relevance scores in results (optional, defaults to TRUE)
)
RETURNS TABLE                -- Original table columns plus an optional FLOAT column `score`
```

By default, `text_search` retrieves up to 1000 results. To adjust this, specify the `limit` parameter in the function call.

Use this function to integrate full-text search directly into your data workflows.
