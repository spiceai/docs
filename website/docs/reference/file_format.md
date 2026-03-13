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
| `file_extension`            | String  | Derived        | Overrides the file extension filter used when listing files. Defaults to the extension matching the resolved format.          |
| `schema_infer_max_records`  | Integer | `1000`         | Maximum number of records scanned to infer the schema.                                                                        |
| `file_compression_type`     | String  | `UNCOMPRESSED` | File-level compression for CSV, TSV, and JSON files. Valid values: `GZIP`, `BZIP2`, `XZ`, `ZSTD`, `UNCOMPRESSED`.             |
| `hive_partitioning_enabled` | Boolean | `false`        | Enables Hive-style partition discovery from directory structure.                                                              |

## Supported Formats {#supported-formats}

The `file_format` parameter accepts these values:

| Value     | Reader              | Default Extension | Notes                                       |
| --------- | ------------------- | ----------------- | ------------------------------------------- |
| `parquet` | Apache Parquet      | `.parquet`        |                                             |
| `csv`     | CSV                 | `.csv`            | Uses `csv_*` parameters.                    |
| `tsv`     | TSV (tab-delimited) | `.tsv`            | Uses `tsv_*` parameters. Delimiter is tab.  |
| `json`    | JSON                | `.json`           | Uses `json_format` to control parsing mode. |
| `jsonl`   | JSON Lines          | `.jsonl`          | Line-delimited JSON.                        |

When `file_format` is omitted, Spice infers the format from the dataset path extension. If the extension does not match one of the values above, a configuration error is returned.

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

### Parameters

| Parameter      | Type    | Default | Description                                                                                                       |
| -------------- | ------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `json_format`  | String  | `jsonl` | Parsing mode. `jsonl`, `ndjson`, and `ldjson` produce line-delimited JSON. `array` parses a top-level JSON array. |
| `flatten_json` | Boolean | `false` | When `true`, nested JSON objects are flattened with `.` as a separator (e.g., `address.city`).                    |

Setting `file_format: jsonl` uses the DataFusion JSON Lines reader directly, without `json_format` or `flatten_json` support.
