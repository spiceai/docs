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
| **Elasticsearch** | Indexes into an external Elasticsearch cluster, fronted by a local Tantivy warm tier that serves searches. Useful when Elasticsearch is already part of the infrastructure or when its operational characteristics (sharding, replication, snapshots) are preferred. |

When no engine is specified, Tantivy is used automatically.

### Text Analysis

The built-in Tantivy engine indexes text with Tantivy's `en_stem` tokenizer: terms are lowercased and reduced to their English (Snowball) stem, with token positions retained so phrase queries keep working. Query terms are analyzed the same way, so a search for `running` also matches documents containing `run` and `runs`.

Stemming is always on for the built-in engine and has no configuration parameter. It is English-only — text in other languages is still tokenized and lowercased, but not stemmed.

The local warm index used with `engine: elasticsearch` is a Tantivy index and analyzes text the same way. Searches [served directly by Elasticsearch](#warm-tier) — multi-column datasets, a warm index that could not be built, or an `on_zero_results: use_source` fallback — are analyzed by Elasticsearch's own analyzer for that index instead.

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

### Index Storage

By default the built-in Tantivy index is held in memory and rebuilt on every start. Set `index_store: file` on a column to persist it to disk instead, so a restart reopens the existing index rather than re-indexing the dataset:

```yaml
columns:
  - name: body
    full_text_search:
      enabled: true
      index_store: file
      # Optional. Defaults to `.spice/data/fts/<catalog>/<schema>/<table>/`
      index_directory: ./my-index
```

| Field | Default | Description |
| --- | --- | --- |
| `index_store` | `memory` | Where the index lives: `memory` (rebuilt on every start) or `file` (persisted on disk). If any indexed column of a dataset sets `file`, the dataset's index is persisted. |
| `index_directory` | `.spice/data/fts/<catalog>/<schema>/<table>/` | Directory for a persisted index. Only applies with `index_store: file` — combining it with `index_store: memory` logs a warning and keeps the in-memory store. |

#### Changing the configuration of a persisted index

A persisted index records the schema it was built with, and that schema is what serves queries. On start, Spice compares the persisted schema against the current configuration:

- **The index fails to open** — with an error naming the column, how its indexing changed, and the directory to delete so the index is rebuilt — when a configured column is absent from the persisted index, or when a column's value type, indexed flag, or tokenized/untokenized indexing differs. Searches, filters, and primary-key deletes over such a column cannot behave as configured, so this is reported rather than served. Adding a search column to a dataset with a persisted index therefore requires deleting the index directory.
- **A warning is logged** when only the text analysis differs (for example an index built before [stemming](#text-analysis) became the default). Queries stay consistent with what the index actually holds; delete the directory to rebuild with the configured analysis.

`index_store: memory` is never affected — it rebuilds from scratch on every start and so always matches the configuration.

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

#### Warm tier

With `engine: elasticsearch`, Spice maintains a **local Tantivy warm index in front of the Elasticsearch index**:

- **Writes fan out to both tiers** — every indexed row is written to the local Tantivy index and to Elasticsearch.
- **Searches are served from the local warm index.** Elasticsearch is queried only as a fallback, and only when the dataset sets [`acceleration.on_zero_results: use_source`](../../reference/spicepod/datasets.md#accelerationon_zero_results); with the default `return_empty`, searches are served from the warm tier alone.

Two cases fall back to querying Elasticsearch directly, each logged at startup:

- **More than one full-text column on the dataset.** The warm index is single-column, so multi-column datasets keep the Elasticsearch-only behavior.
- **The warm index cannot be built or paired with the Elasticsearch index.** Warm-tier construction never fails dataset load — a warning is logged and Elasticsearch is registered alone. A primary key whose type Elasticsearch normalizes (for example `LargeUtf8` → `Utf8`) is a common cause, because the two tiers must agree on the search column and primary-key fields.

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
