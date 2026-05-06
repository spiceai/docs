---
title: 'Elasticsearch Data Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the Elasticsearch data connector in production: authentication, TLS, resilience, and operational tuning.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - elasticsearch
  - search
  - observability
---

Production operating guide for the Elasticsearch data connector covering authentication, TLS, resilience, capacity planning, and search routing.

## Authentication & Secrets

The connector uses HTTP Basic authentication. Credentials must be sourced from a [secret store](../../secret-stores/) in production.

| Parameter                | Description                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| `elasticsearch_endpoint` | Cluster URL. Required. Use `https://...` to enable TLS.                                           |
| `elasticsearch_user`     | Username for HTTP Basic authentication. Use `${secrets:...}`.                                     |
| `elasticsearch_pass`     | Password for HTTP Basic authentication. Use `${secrets:...}`.                                     |

Scope the user to the minimum required permissions:

- **Read-only access** to the indexes the connector will query (`read` privilege).
- **`monitor`** cluster privilege if you intend to inspect mappings programmatically.

For Elastic Cloud and self-managed deployments protected by API keys, generate a dedicated user (or service account) for Spice rather than reusing administrative credentials.

### TLS

Use `https://` endpoints in production. TLS is enabled automatically when the endpoint scheme is HTTPS. Self-signed certificates require a trusted CA bundle in the container or host OS trust store.

The connector does not currently expose certificate-pinning or custom CA-bundle parameters — rely on the system trust store, or front the cluster with a TLS-terminating proxy you trust.

## Resilience Controls

### Retries

The Elasticsearch client library includes a retry mechanism with exponential backoff for transient errors (HTTP 429 and 5xx). However, retries are currently only active on the **write path** used by the [Elasticsearch Vector Engine](../../vectors/elasticsearch) (`bulk_index` operations). The data connector's read operations (`_search`, `_mapping`) do **not** retry transient errors — failures are surfaced immediately.

Retry tuning is exposed only on the [Elasticsearch Vector Engine](../../vectors/elasticsearch) (`elasticsearch_max_retries`, `elasticsearch_retry_initial_backoff`).

### Timeouts

| Setting         | Default | Behavior                                                                     |
| --------------- | ------- | ---------------------------------------------------------------------------- |
| Connect timeout | `10s`   | Maximum time to establish a TCP/TLS connection to the cluster.               |
| Request timeout | `30s`   | Maximum time for each individual HTTP request.                               |

Long-running search responses (very large `LIMIT`, deep pagination, or expensive aggregations) may exceed the default request timeout. Either narrow the query, accelerate the dataset, or use the [vector engine](../../vectors/elasticsearch) `client_timeout` parameter when running the workload through the embedding-write path.

## Capacity & Sizing

- **Throughput**: Bounded by the Elasticsearch cluster's request handling and (for kNN) HNSW search cost. Plan refresh intervals and concurrent query load to stay within the cluster's tested capacity.
- **Result size**: Each `_search` request returns up to `size` hits, hard-capped at **10,000** (the Elasticsearch default `index.max_result_window`). The connector translates `LIMIT` to `size` but clamps the value to 10,000; queries without `LIMIT` also default to 10,000. For full-index access, accelerate the dataset into a local engine.
- **Mapping fetches**: At dataset registration the connector fetches the index mapping once via `GET /<index>/_mapping`. Mapping changes after registration are not picked up until the runtime restarts.
- **Pagination**: Spice does not currently use Elasticsearch's `search_after` or scroll APIs from the data connector. For full-table scans of very large indexes, prefer accelerating into a local engine.

## Search Routing

When an index has a `dense_vector` field, Spice's search UDTFs compile to native Elasticsearch queries:

- `vector_search(...)` → kNN query against the `dense_vector` field. By default the candidate pool (`num_candidates`) is twice the requested `k`.
- `text_search(...)` → BM25 `match` query on the specified text field.
- `rrf(...)` → both queries issued in parallel and fused using Reciprocal Rank Fusion. RRF tuning (per-query `rank_weight`, recency decay, smoothing `k`) is evaluated by Spice rather than Elasticsearch.

For more, see [Search Functionality](../../../features/search) and the [SQL search reference](../../../reference/sql/search).

## Pushdown Behavior

| Predicate                                    | Pushdown to ES Query DSL                                              |
| -------------------------------------------- | --------------------------------------------------------------------- |
| `WHERE` equality on `keyword` / numeric fields | Limited — most filters are evaluated locally by DataFusion after fetch. |
| `LIMIT N`                                    | Translated to `size: N`.                                               |
| `ORDER BY`                                   | Evaluated locally unless paired with a search UDTF.                   |
| `vector_search` / `text_search` / `rrf`      | Native — issued as kNN / BM25 query bodies.                           |

For workloads dominated by selective filters, accelerate the dataset (`acceleration.enabled: true`) into DuckDB / SQLite / Cayenne so DataFusion can apply filters at acceleration time rather than fetching unfiltered hits.

## Schema Stability

The connector derives an Arrow schema from `GET /<index>/_mapping` at registration time. Once registered, the schema is locked for the lifetime of the runtime process — adding fields or changing types in Elasticsearch does **not** re-trigger schema inference. Restart the runtime to pick up mapping changes.

For schema-evolution-friendly workloads, prefer accelerating the dataset and refreshing on a schedule against a stable subset of fields.

## Metrics

The Elasticsearch connector does not register connector-specific instruments in the current release. Monitor via:

- Spice query execution metrics (`query_duration_ms`, `query_processed_rows`, `query_failures_total`) from `runtime.metrics`.
- Elasticsearch's own `/_nodes/stats` endpoint and Kibana dashboards for cluster-side request latency, CPU, JVM heap, and shard health.

See [Component Metrics](../../../features/observability/component_metrics) for general configuration.

## Task History

Elasticsearch requests participate in [task history](../../../reference/task_history) through the HTTP client's span. Each `_search` and `_mapping` call is a child of the enclosing `sql_query` or `accelerated_table_refresh` task.

## Known Limitations

- **Read-only**: The connector is read-only. Writes (indexing documents, updating mappings) are not supported. Use the [Elasticsearch Vector Engine](../../vectors/elasticsearch) when Spice should manage an index.
- **Schema is frozen at registration**: Mapping changes after startup are not picked up. Restart the runtime to refresh the schema.
- **`date` and `date_nanos` are strings**: Elasticsearch accepts heterogeneous date formats. The connector preserves them as `Utf8` — cast to `TIMESTAMP` in SQL when comparison is needed.
- **`nested` and `object` are JSON strings**: Nested objects are exposed as `Utf8` JSON, not structured Arrow types.
- **`dense_vector` without `dims`**: Falls back to `Utf8` and is not usable as a vector column. Declare `dims` in the index mapping.
- **Limited filter pushdown**: Most SQL `WHERE` predicates are evaluated locally by DataFusion. For selective filters, accelerate the dataset.
- **Tested against Elasticsearch 8.17**: Other major versions (7.x, 9.x) may work but are not part of the integration test matrix.

## Troubleshooting

| Symptom                                         | Likely cause                                                           | Resolution                                                                                                |
| ----------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `401 Unauthorized` on dataset registration       | Wrong/expired credentials or insufficient privileges.                  | Verify `elasticsearch_user`/`elasticsearch_pass`; confirm the user has `read` on the target index.        |
| `Elasticsearch index 'X' not found in mapping response` | The index does not exist or the user lacks read access.                | Create the index, or grant `view_index_metadata` privilege.                                               |
| `dense_vector` column missing from query results | The mapping omits `dims` for that field.                               | Add `dims` to the index mapping; reconfirm with `GET /<index>/_mapping`.                                  |
| `vector_search` / `text_search` returns nothing | Wrong vector field name, or the index has no documents.                | Verify the field is a populated `dense_vector` / `text` field; check via `GET /<index>/_count`.            |
| Schema drift after deploying mapping changes    | Schema is frozen at registration time.                                  | Restart the runtime to re-infer the schema.                                                               |
| Refresh exceeds `request_timeout`               | Large response or slow cluster.                                        | Narrow the query, accelerate the dataset, or front Elasticsearch with a cache.                             |
| TLS handshake fails with self-signed certificate | The certificate's CA is not in the runtime's trust store.              | Install the CA bundle in the container/host trust store; do not disable TLS verification in production.    |
