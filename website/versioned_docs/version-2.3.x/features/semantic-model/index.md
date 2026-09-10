---
title: 'Semantic Model'
sidebar_label: 'Semantic Model'
description: 'Attach descriptions and metadata to datasets, views, and columns in Spice so LLMs, SQL functions, and humans share the same understanding of your data.'
sidebar_position: 12
pagination_prev: null
pagination_next: null
---

The semantic model is the layer that gives every dataset, view, and column a human-readable description plus structured metadata, and exposes that context uniformly to SQL queries, LLM tools, and language models.

Every description ends up in two places at once:

- on the dataset's Arrow schema as `description` metadata — readable from SQL via [`obj_description`](../../reference/sql/scalar_functions.md#obj_description) and [`col_description`](../../reference/sql/scalar_functions.md#col_description); and
- in the LLM tool context — surfaced by the built-in [`list_datasets`](../../components/tools/index.md#available-tools) and [`table_schema`](../../components/tools/index.md#available-tools) tools, so models see your descriptions automatically.

## Defining a Semantic Model

Semantic data models are defined within the `spicepod.yaml` file under the `datasets` section. Each dataset supports `description`, `metadata`, and a `columns` field where individual columns are described with metadata and features for utility and clarity.

### Example Configuration

```yaml
datasets:
  - name: taxi_trips
    description: NYC taxi trip rides
    metadata:
      instructions: Always provide citations with reference URLs.
      reference_url_template: https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_<YYYY-MM>.parquet
    columns:
      - name: tpep_pickup_time
        description: 'The time the passenger was picked up by the taxi'
      - name: notes
        description: 'Optional notes about the trip'
        embeddings:
          - from: hf_minilm # A defined Spice Model
            chunking:
              enabled: true
              target_chunk_size: 512
              overlap_size: 128
              trim_whitespace: true
```

## Dataset Metadata

Datasets can be defined with the following metadata:

- `instructions`: Optional. Instructions to provide to a language model when using this dataset.
- `reference_url_template`: Optional. A URL template for citation links.

Arbitrary additional keys may be added under `metadata:` and are passed through to the Arrow schema unchanged, so anything an LLM tool or downstream consumer expects to find there (e.g. governance labels, owning team, source-of-truth links) can be attached without code changes.

For detailed `metadata` configuration, see the [Dataset Reference](../../reference/spicepod/datasets.md#metadata).

## Column Definitions

Each column can be defined with the following attributes:

- `description`: Optional. A description of the column's contents and purpose.
- `type` (alias `data_type`): Optional. Declared column type (Postgres-style or Arrow display form).
- `nullable`: Optional. Override column nullability.
- `embeddings`: Optional. Vector embeddings configuration for this column.
- `full_text_search`: Optional. Full-text-search configuration.
- `metadata`: Optional. Arbitrary key/value metadata attached to the column.

For detailed `columns` configuration, see the [Dataset Reference](../../reference/spicepod/datasets.md#columns).

## Source-Side Comments

When a dataset is loaded from a source that exposes table or column comments, Spice automatically imports those comments into the Arrow schema metadata under the `description` key. This means database-native `COMMENT ON TABLE` and `COMMENT ON COLUMN` annotations show up alongside Spicepod-defined `description` values, giving the semantic model the same context that already lives in the source database.

Source-side comments are imported automatically from:

| Source                          | What is imported                                                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PostgreSQL**                  | Table and column comments via `obj_description` / `col_description` in `pg_catalog`.                                                                          |
| **MySQL**                       | `information_schema.tables.table_comment` and `information_schema.columns.column_comment`.                                                                    |
| **Snowflake**                   | `information_schema.tables.comment` and `information_schema.columns.comment`.                                                                                  |
| **Databricks SQL Warehouse**    | Table and column comments returned by the SQL Warehouse driver's metadata API.                                                                                |
| **BigQuery** (via ADBC catalog) | `INFORMATION_SCHEMA.TABLE_OPTIONS` (`description`) for the table and `INFORMATION_SCHEMA.COLUMN_FIELD_PATHS.description` for top-level columns.               |

Connectors not listed above (object stores, file formats, HTTP, etc.) do not have a comment concept on the source side; for those datasets, attach descriptions in the Spicepod.

### Precedence

When both a Spicepod `description` and a source-side comment exist for the same table or column, **the Spicepod value wins**. This lets you override unhelpful or out-of-date source comments without round-tripping a DDL change through the upstream database.

If the Spicepod does not set a `description`, the source-side comment passes through unchanged.

## Reading descriptions from SQL

Two PostgreSQL-compatible scalar UDFs read the `description` metadata at query time:

```sql
-- Table-level description
SELECT obj_description('public.taxi_trips');

-- Column-level description (by name or 1-based ordinal)
SELECT col_description('public.taxi_trips', 'fare_amount');
SELECT col_description('public.taxi_trips', 3);
```

Full signatures, including PostgreSQL-shaped `(oid, 'pg_class')` variants and four-part `(catalog, schema, table, column)` forms, are documented in [`obj_description`](../../reference/sql/scalar_functions.md#obj_description) and [`col_description`](../../reference/sql/scalar_functions.md#col_description).

Because these UDFs read the same metadata that source-side comment extraction populates, queries against PostgreSQL or Snowflake datasets that were authored with `COMMENT ON …` will return those comments without any additional configuration.

## How LLMs see the semantic model

The built-in [LLM tools](../../components/tools/index.md) surface descriptions and metadata into the model's context automatically.

### `list_datasets`

Returns every dataset, view, and catalog table visible to the runtime as JSON, with each entry's fully-qualified `table` name, `description`, `metadata`, columns, and capability flags (e.g. `can_search_documents`). Descriptions come from the Spicepod, falling back to source-side comments when no Spicepod description is set.

### `table_schema`

Returns one or more tables' columns as a markdown table. When called with `output: full` (the default), the rendered schema includes a `Metadata:` block at the top with the table-level `description` and any other dataset metadata keys, and a per-column `Metadata` cell containing the column's `description` and any column metadata. With `output: minimal`, only column names, types, and nullability are returned.

```text
**Table: spice.public.taxi_trips**
Metadata:
description: NYC taxi trip rides
instructions: Always provide citations with reference URLs.

| Column           | Sql Type  | Arrow Type             | Nullable | Metadata                                            |
| ---------------- | --------- | ---------------------- | -------- | --------------------------------------------------- |
| tpep_pickup_time | TIMESTAMP | Timestamp(Microsecond) | true     | description: The time the passenger was picked up   |
| notes            | VARCHAR   | Utf8                   | true     | description: Optional notes about the trip          |
```

Because both `list_datasets` and `table_schema` are part of the [`auto` and `all` tool groups](../../components/tools/index.md#tool-groups), no extra configuration is required — every model declared with `tools: auto` (or any explicit list that includes `table_schema` / `list_datasets`) gets the semantic model in its context.

When the [Tool Registry](../tool-registry/index.md) is active, dataset descriptions also feed the hybrid search index used by `tool_search` to match user questions to relevant dataset-bound tools, so well-described datasets are easier for the model to discover at scale.

## End-to-end flow

```text
spicepod.yaml description          source COMMENT ON TABLE / COLUMN
        |                                |
        |    (Spicepod wins on overlap)  |
        +---------------+----------------+
                        v
            Arrow schema metadata (`description` key)
                        |
        +---------------+-----------------+
        v               v                 v
  obj_description    table_schema     list_datasets
  col_description    (LLM context)    (LLM context)
  (SQL)
```
