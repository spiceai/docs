---
title: 'Debezium Push Ingest (CDC without Kafka)'
sidebar_label: 'Debezium Push Ingest'
description: 'Stream Debezium change events directly into a Spice-accelerated dataset over HTTP — any Debezium source plugin, no Kafka bus required.'
sidebar_position: 7
pagination_prev: null
pagination_next: null
---

Stream change events from **any** [Debezium](https://debezium.io/) source plugin directly into a Spice-accelerated dataset over HTTP, with **no Kafka bus**. The Debezium source (Debezium Server or the Embedded Engine) POSTs change events to `spiced`, which decodes them and applies them to the accelerator.

Spice supports a **dual-path** CDC model:

| Path | When to use |
| ---- | ----------- |
| **Native CDC** | Postgres WAL, MySQL binlog, MongoDB change streams, DynamoDB Streams — Spice captures directly from the database. Prefer this when a native path exists. See [Change Data Capture](./index.md). |
| **Debezium push ingest** | Any database with a Debezium source plugin (Oracle, SQL Server, Db2, …) where you want change capture without running Kafka. |

This page covers the second path: the `cdc:` connector plus `POST /v1/datasets/{name}/cdc`.

If you already operate Debezium **over Kafka**, continue using the [`debezium:` connector](./debezium.md) — the Kafka consumer path is unchanged.

## How it works

```
  OLTP source (Oracle, SQL Server, Db2, Postgres, …)
           │
           ▼
  Debezium source plugin
  (Debezium Server / Embedded Engine)
           │  HTTP POST  (JSON or Avro)
           ▼
  spiced   POST /v1/datasets/{name}/cdc
           │  decode → change batch
           ▼
  accelerator (Cayenne / DuckDB / SQLite / Arrow / …)
```

The Debezium plugin runs as a separate process and pushes change events into Spice. The HTTP request blocks until the batch has been applied to the accelerator (ack), so the capturer can safely commit its source offsets only after a successful response.

## Spicepod configuration

Configure a dataset with `from: cdc:<name>` and an accelerator running in `refresh_mode: changes`:

```yaml
datasets:
  - from: cdc:orders
    name: orders
    columns:
      - name: id
        type: int64
      - name: customer_id
        type: int64
      - name: amount
        type: float64
    acceleration:
      enabled: true
      engine: cayenne # or duckdb, sqlite, arrow, …
      mode: file
      refresh_mode: changes
      primary_key: id
      on_conflict:
        id: upsert
    params:
      # Avro only — Confluent-compatible Schema Registry base URL:
      # cdc_schema_registry_url: https://schema-registry:8081
      # Or, for raw (non-Confluent) Avro bodies, embed the Avro schema:
      # cdc_avro_schema: |
      #   { "type": "record", "name": "Envelope", ... }
```

### Requirements

- `acceleration.enabled: true`
- `acceleration.refresh_mode: changes`
- Explicitly declared `columns` with types — there is no upstream bus or catalog to infer the schema from.
- `primary_key` and an `on_conflict` upsert mapping, except for the append-only [Arrow](../../components/data-accelerators/arrow/index.md) accelerator.

### Parameters

| Parameter                 | Description                                                                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cdc_schema_registry_url` | Confluent-compatible Schema Registry base URL for Avro CDC ingest (Confluent wire format). Avro only.                                                                |
| `cdc_avro_schema`         | Avro schema JSON used when the request body is raw Avro (not Confluent wire format). Can also be sent per-request via the `X-Avro-Schema` header. Avro only.         |

## HTTP API

```http
POST /v1/datasets/{name}/cdc
```

The endpoint accepts JSON or Avro, selected by the `Content-Type` header:

| Content-Type | Body |
| ------------ | ---- |
| `application/json`, `application/vnd.debezium+json` | JSON change event(s) |
| `application/avro`, `application/vnd.debezium+avro` | Avro change event |

Writing to this endpoint requires write access — see [API authentication](../../api/auth/index.md).

### JSON body shapes

A JSON body may be:

- A single Debezium change event (schemaless, or with an embedded `schema`).
- A JSON array of change events.
- Newline-delimited JSON (NDJSON).

Example create event:

```json
{
  "before": null,
  "after": { "id": 1, "customer_id": 9, "amount": 12.5 },
  "source": { "connector": "oracle", "ts_ms": 1710000000000 },
  "op": "c",
  "ts_ms": 1710000000000
}
```

The `op` field maps to a row-level change: `c` create, `u` update, `d` delete, `r` snapshot read, `t` truncate. Internal Debezium `m` (message) events are skipped.

### Avro body

| Mode | How |
| ---- | --- |
| Confluent wire format | Body begins with the magic byte `0` and a 4-byte schema id; set `cdc_schema_registry_url` on the dataset so Spice can resolve the schema. |
| Raw Avro | Body is a single Avro datum; provide the schema via the `cdc_avro_schema` dataset param or the `X-Avro-Schema` request header. |

### Response

On success the endpoint returns the number of applied changes:

```json
{ "applied": 1, "dataset": "orders" }
```

| Status | Meaning |
| ------ | ------- |
| `200 OK` | Batch applied |
| `400 Bad Request` | Malformed body, decode failure, or apply failure |
| `403 Forbidden` | Write access required (see [API authentication](../../api/auth/index.md)) |
| `404 Not Found` | Dataset is not registered for CDC ingest (not yet initialized, or not configured with `from: cdc:…` + `refresh_mode: changes`) |
| `501 Not Implemented` | This `spiced` build was compiled without the `debezium` feature |
| `503 Service Unavailable` | Ingest channel closed (stream stopped) |
| `504 Gateway Timeout` | Apply timed out |

Because the request blocks until the change is applied, a Debezium Server or Embedded sink should commit source offsets only after receiving `200 OK`.

## Debezium Server sink

Point a [Debezium Server](https://debezium.io/documentation/reference/stable/operations/debezium-server.html) HTTP sink at the Spice endpoint. Example `application.properties`:

```properties
debezium.sink.type=http
debezium.sink.http.url=http://spiced:8090/v1/datasets/orders/cdc
debezium.sink.http.headers.Content-Type=application/json

# Source — any Debezium connector
debezium.source.connector.class=io.debezium.connector.oracle.OracleConnector
debezium.source.database.hostname=oracle
# ... connector-specific settings ...
```

For Avro payloads, configure the sink's serializer for Avro and either set `cdc_schema_registry_url` on the Spice dataset (Confluent wire format) or provide `cdc_avro_schema`.

A ready-to-copy example lives in the [`cdc-debezium-ingest`](https://github.com/spiceai/spiceai/tree/trunk/examples/cdc-debezium-ingest) directory of the `spiceai/spiceai` repository.

## Native vs. push

|  | Native (`postgres` / `mysql` / `mongodb` / `dynamodb`) | Push (`cdc`) |
| -- | -- | -- |
| Where capture runs | Inside `spiced` | Debezium plugin process |
| Kafka required | No | No |
| Formats | Internal | JSON + Avro |
| Sources | Those Spice implements natively | Any database with a Debezium source plugin |

Prefer a native path when one exists. Use push ingest for Oracle, SQL Server, Db2, and other engines where Debezium already ships a source connector but Spice has no native capture.

## Feature availability

Push ingest requires the `debezium` feature, which is included in the default `spiced` builds and official container images. A build compiled without it returns `501 Not Implemented` from the ingest endpoint.
