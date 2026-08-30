---
title: 'File Formats'
sidebar_label: 'File Formats'
sidebar_position: 7
pagination_prev: 'reference/index'
pagination_next: null
---

File-based [data connectors](../components/data-connectors/index.md) — including [`s3://`](../components/data-connectors/s3), [`abfs://`](../components/data-connectors/abfs), [`file://`](../components/data-connectors/file), [`ftp://`](../components/data-connectors/ftp), [`sftp://`](../components/data-connectors/ftp), and others — support multiple structured and document file formats. This page details the format-specific parameters available for each.

## Common Parameters

These parameters apply across multiple file formats.

| Parameter                   | Type    | Default        | Description                                                                                                                   |
| --------------------------- | ------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `file_format`               | String  | Inferred       | Selects the file reader. If omitted, format is inferred from the file extension. See [Supported Formats](#supported-formats). |
| `file_extension`            | String  | Derived        | Overrides the file extension filter used when listing files. Defaults to the extension matching the resolved format. Compound extensions like `.csv.gz` set both format and compression at once. |
| `schema_infer_max_records`  | Integer | `1000`         | Maximum number of records scanned to infer the schema.                                                                        |
| `file_compression_type`     | String  | Inferred       | File-level compression for CSV, TSV, and JSON files. Valid values: `GZIP`, `BZIP2`, `XZ`, `ZSTD`, `UNCOMPRESSED`. If unset, Spice infers compression from compound file extensions such as `.gz`, `.bz2`, `.xz`, and `.zst` (see [Compressed File Extensions](#compressed-file-extensions)). |
| `hive_partitioning_enabled` | Boolean | `false`        | Enables Hive-style partition discovery from directory structure.                                                              |

## Supported Formats {#supported-formats}

The `file_format` parameter accepts these values:

| Value     | Reader              | Default Extension | Notes                                       |
| --------- | ------------------- | ----------------- | ------------------------------------------- |
| `parquet` | Apache Parquet      | `.parquet`        |                                             |
| `csv`     | CSV                 | `.csv`            | Uses `csv_*` parameters.                    |
| `tsv`     | TSV (tab-delimited) | `.tsv`            | Uses `tsv_*` parameters. Delimiter is tab.  |
| `json`    | JSON                | `.json`           | Auto-detects format. Uses `json_format` to control parsing mode. |
| `jsonl`   | JSON Lines          | `.jsonl`          | Line-delimited JSON.                        |

When `file_format` is omitted, Spice infers the format from the dataset path extension. If the extension does not match one of the values above, a configuration error is returned.

## Compressed File Extensions {#compressed-file-extensions}

For CSV, TSV, JSON, and JSONL files, Spice auto-detects both the file format and the compression codec from compound file extensions. Files matching one of the recognized format extensions followed by a recognized compression suffix are read transparently — no `file_compression_type` parameter is required.

Recognized compression suffixes: `.gz` (GZIP), `.bz2` (BZIP2), `.xz` (XZ), `.zst` (ZSTD).

| Path / extension       | Format inferred | Compression inferred |
| ---------------------- | --------------- | -------------------- |
| `data.csv.gz`          | `csv`           | `GZIP`               |
| `events.jsonl.zst`     | `jsonl`         | `ZSTD`               |
| `report.tsv.xz`        | `tsv`           | `XZ`                 |
| `data.json.bz2`        | `json`          | `BZIP2`              |
| `data.csv`             | `csv`           | `UNCOMPRESSED`       |

The `.ndjson` and `.ldjson` extensions are also accepted as JSON Lines aliases — `events.ndjson.gz` is read as JSONL with GZIP compression.

Auto-detection works the same way when reading a single file or listing a directory: object-store listings are filtered by the compound extension, and the same compression codec is applied to every file matched.

To override auto-detection — for example, to force a specific compression codec — set `file_compression_type` explicitly. Explicit values always take precedence over the inferred value.

```yaml
datasets:
  - from: s3://my-bucket/exports/
    name: exports
    params:
      file_format: csv          # Listing only includes matching files
      file_extension: .csv.gz   # Reads gzipped CSVs in the directory
```

Auto-detection applies to listing data connectors (S3, ABFS, GCS, HTTP/HTTPS, FTP, SFTP, SMB, NFS, file) and to the HTTPS connector's auto-format detection. Parquet handles compression internally and is not affected by this setting — see [Parquet](#parquet) for the codecs Parquet supports natively.

## Parquet

Spice reads any Parquet file regardless of the compression codec or data encoding.

Supported compression codecs:

- [`UNCOMPRESSED`](https://parquet.apache.org/docs/file-format/data-pages/compression/#uncompressed)
- [`SNAPPY`](https://parquet.apache.org/docs/file-format/data-pages/compression/#snappy)
- [`GZIP`](https://parquet.apache.org/docs/file-format/data-pages/compression/#gzip)
- [`LZO`](https://parquet.apache.org/docs/file-format/data-pages/compression/#lzo)
- [`BROTLI`](https://parquet.apache.org/docs/file-format/data-pages/compression/#brotli)
- [`LZ4`](https://parquet.apache.org/docs/file-format/data-pages/compression/#lz4) (deprecated in favor of `LZ4_RAW`)
- [`LZ4_RAW`](https://parquet.apache.org/docs/file-format/data-pages/compression/#lz4_raw)
- [`ZSTD`](https://parquet.apache.org/docs/file-format/data-pages/compression/#zstd)

Supported data encodings:

- [`PLAIN`](https://parquet.apache.org/docs/file-format/data-pages/encodings/#plain-plain--0)
- [`PLAIN_DICTIONARY` / `RLE_DICTIONARY`](https://parquet.apache.org/docs/file-format/data-pages/encodings/#dictionary-encoding-plain_dictionary--2-and-rle_dictionary--8)
- [`RLE`](https://parquet.apache.org/docs/file-format/data-pages/encodings/#run-length-encoding--bit-packing-hybrid-rle--3)
- [`BIT_PACKED`](https://parquet.apache.org/docs/file-format/data-pages/encodings/#bit-packed-deprecated-bit_packed--4) (deprecated in favor of `RLE`)
- [`DELTA_BINARY_PACKED`](https://parquet.apache.org/docs/file-format/data-pages/encodings/#delta-binary-packing-delta_binary_packed--5)
- [`DELTA_LENGTH_BYTE_ARRAY`](https://parquet.apache.org/docs/file-format/data-pages/encodings/#delta-length-byte-array-delta_length_byte_array--6)
- [`DELTA_BYTE_ARRAY`](https://parquet.apache.org/docs/file-format/data-pages/encodings/#delta-strings-delta_byte_array--7)
- [`BYTE_STREAM_SPLIT`](https://parquet.apache.org/docs/file-format/data-pages/encodings/#byte-stream-split-byte_stream_split--9)

## CSV

### Parameters {#csv}

| Parameter                      | Type    | Default | Description                                                                                           |
| ------------------------------ | ------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `csv_has_header`               | Boolean | `true`  | Whether the first row contains column headers.                                                        |
| `csv_quote`                    | Char    | `"`     | Character used to quote fields containing special characters.                                         |
| `csv_escape`                   | Char    | _none_  | Character used to escape special characters within a field.                                           |
| `csv_delimiter`                | Char    | `,`     | Character used to separate fields.                                                                    |
| `csv_schema_infer_max_records` | Integer | `1000`  | **Deprecated.** Use `schema_infer_max_records` instead. Maximum records scanned for schema inference. |

## TSV

TSV (tab-separated values) is a first-class format. Set `file_format: tsv` or use a `.tsv` file extension. The delimiter is always tab and cannot be changed.

### Parameters

| Parameter                      | Type    | Default | Description                                                                                           |
| ------------------------------ | ------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `tsv_has_header`               | Boolean | `true`  | Whether the first row contains column headers.                                                        |
| `tsv_quote`                    | Char    | `"`     | Character used to quote fields containing special characters.                                         |
| `tsv_escape`                   | Char    | _none_  | Character used to escape special characters within a field.                                           |
| `tsv_schema_infer_max_records` | Integer | `1000`  | **Deprecated.** Use `schema_infer_max_records` instead. Maximum records scanned for schema inference. |

## JSON

Set `file_format: json` for JSON files. Use the `json_format` parameter to select the parsing mode.

### Parsing Modes {#json-parsing-modes}

The `json_format` parameter controls how JSON content is interpreted.

| Value                          | Description                                                                                                                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auto`                         | Default. Auto-detects the format by inspecting content. Detects SODA responses, JSON arrays, single objects, and line-delimited JSON.                                             |
| `json`                         | Auto-detects array vs line-delimited JSON by peeking at the first byte, but does not perform SODA auto-detection. Used implicitly when `file_format: json` is set explicitly. |
| `jsonl`, `ndjson`, `ldjson`    | Line-delimited JSON. Each line contains one JSON value.                                                                                                                           |
| `array`                        | The file contains a single top-level JSON array. Each element becomes a row.                                                                                                      |
| `object`                       | The file contains a single JSON object, producing one row.                                                                                                                        |
| `soda`, `socrata`              | [Socrata Open Data API (SODA)](https://dev.socrata.com/docs/endpoints.html) format. Schema is derived from `meta.view.columns` in the response. Cannot be combined with `json_pointer`.    |

When `file_format` is omitted and the file extension is `.json`, the default parsing mode is `auto`, which includes SODA auto-detection. When `file_format: json` is set explicitly, the default mode is `json`, which skips SODA auto-detection.

### Parameters

| Parameter       | Type    | Default    | Description                                                                                                                                      |
| --------------- | ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `json_format`   | String  | `auto`     | Parsing mode. See [Parsing Modes](#json-parsing-modes).                                                                                          |
| `json_pointer`  | String  | _none_     | Extracts a sub-value from the document before parsing. Alias: `json_path`. Cannot be used with `soda` format. |
| `flatten_json`  | Boolean | `false`    | When `true`, nested JSON objects are flattened with `.` as a separator (e.g., `address.city`).                                                   |
| `soda_metadata` | String  | `disabled` | When `enabled`, includes Socrata metadata columns (`:sid`, `:id`, `:position`, `:created_at`, `:created_meta`, `:updated_at`, `:updated_meta`, `:meta`) in the output. Only applies when parsing SODA format data. |

Setting `file_format: jsonl` (or `ndjson` / `ldjson`) normally uses the DataFusion JSON Lines reader directly, so `json_format` and `flatten_json` are ignored. Setting a non-empty `json_pointer` (or its `json_path` alias) routes the dataset through Spice's JSON reader instead: the pointer is applied, and `json_format` and `flatten_json` take effect. On that path the parsing mode starts at `auto` — the extracted sub-value is re-detected as an array, a single object, or line-delimited JSON — rather than being forced to JSON Lines, so set `json_format: jsonl` explicitly if the sub-value must be read line-delimited.

### Examples

Extract a nested value from a JSON document using `json_pointer`:

```yaml
datasets:
  - from: s3://my-bucket/data/
    name: events
    params:
      file_format: json
      json_pointer: /results/events
```

Read a SODA response with metadata columns included:

```bash
curl -sL "https://data.ct.gov/api/views/kf98-j89e/rows.json?accessType=DOWNLOAD" -o house_price_index.json
```

```yaml
datasets:
  - from: file:house_price_index.json
    name: house_price_index
    params:
      json_format: soda
      soda_metadata: enabled
```

```sql
sql> select * from house_price_index limit 5;

+--------------------+--------------------------------------+-----------+-------------+---------------+-------------+---------------+-------+---------------------+---------+
|        :sid        |                  :id                 | :position | :created_at | :created_meta | :updated_at | :updated_meta | :meta |   observation_date  | ctsthpi |
|       varchar      |                varchar               |   int64   |    int64    |    varchar    |    int64    |    varchar    |varchar|     timestamp[s]    | float64 |
+--------------------+--------------------------------------+-----------+-------------+---------------+-------------+---------------+-------+---------------------+---------+
| row-r4ag~gfrd~dqcz | 00000000-0000-0000-6A52-5730E0309BF7 | 0         | 1768216213  |               | 1768216213  |               | { }   | 1975-01-01T00:00:00 | 62.9    |
| row-65s5_stm6-jbjc | 00000000-0000-0000-3B25-D45DF23837A7 | 0         | 1768216213  |               | 1768216213  |               | { }   | 1975-04-01T00:00:00 | 62.94   |
| row-buhc_mzb7.95pa | 00000000-0000-0000-A414-989C0238E96F | 0         | 1768216213  |               | 1768216213  |               | { }   | 1975-07-01T00:00:00 | 61.93   |
| row-3fp4~bx38-mwgi | 00000000-0000-0000-58CE-D4AF76C589B0 | 0         | 1768216213  |               | 1768216213  |               | { }   | 1975-10-01T00:00:00 | 61.85   |
| row-khut~7dd3-vi9e | 00000000-0000-0000-A274-646F4876CC81 | 0         | 1768216213  |               | 1768216213  |               | { }   | 1976-01-01T00:00:00 | 64.83   |
+--------------------+--------------------------------------+-----------+-------------+---------------+-------------+---------------+-------+---------------------+---------+

Time: 0.0028895 seconds. 5 rows.
```
