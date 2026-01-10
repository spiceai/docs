---
title: 'File Formats'
sidebar_label: 'File Formats'
sidebar_position: 7
pagination_prev: 'reference/index'
pagination_next: null
---

Spice currently supports CSV and Parquet data file-formats for data connectors that can read files from a file system or cloud object storage (i.e. [`s3://`](../components/data-connectors/s3.md), [`abfs://`](../components/data-connectors/abfs.md), [`file://`](../components/data-connectors/file.md), etc.). Support for Iceberg and other file-formats are on the roadmap.

The parameters supported for specific file-formats are detailed on this page.

## Parquet

Spice automatically supports reading any Parquet file, regardless of the compression codec or data encoding used.

Compression codecs:

- [`UNCOMPRESSED`](https://parquet.apache.org/docs/file-format/data-pages/compression/#uncompressed)
- [`SNAPPY`](https://parquet.apache.org/docs/file-format/data-pages/compression/#snappy)
- [`GZIP`](https://parquet.apache.org/docs/file-format/data-pages/compression/#gzip)
- [`LZO`](https://parquet.apache.org/docs/file-format/data-pages/compression/#lzo)
- [`BROTLI`](https://parquet.apache.org/docs/file-format/data-pages/compression/#brotli)
- [`LZ4`](https://parquet.apache.org/docs/file-format/data-pages/compression/#lz4) (deprecated in favor of `LZ4_RAW`)
- [`LZ4_RAW`](https://parquet.apache.org/docs/file-format/data-pages/compression/#lz4_raw)
- [`ZSTD`](https://parquet.apache.org/docs/file-format/data-pages/compression/#zstd)

Data encodings:

- [`PLAIN`](https://parquet.apache.org/docs/file-format/data-pages/encodings/#plain-plain--0)
- [`PLAIN_DICTIONARY` / `RLE_DICTIONARY`](https://parquet.apache.org/docs/file-format/data-pages/encodings/#dictionary-encoding-plain_dictionary--2-and-rle_dictionary--8)
- [`RLE`](https://parquet.apache.org/docs/file-format/data-pages/encodings/#run-length-encoding--bit-packing-hybrid-rle--3)
- [`BIT_PACKED`](https://parquet.apache.org/docs/file-format/data-pages/encodings/#bit-packed-deprecated-bit_packed--4) (deprecated in favor of `RLE`)
- [`DELTA_BINARY_PACKED`](https://parquet.apache.org/docs/file-format/data-pages/encodings/#delta-binary-packing-delta_binary_packed--5)
- [`DELTA_LENGTH_BYTE_ARRAY`](https://parquet.apache.org/docs/file-format/data-pages/encodings/#delta-length-byte-array-delta_length_byte_array--6)
- [`DELTA_BYTE_ARRAY`](https://parquet.apache.org/docs/file-format/data-pages/encodings/#delta-strings-delta_byte_array--7)
- [`BYTE_STREAM_SPLIT`](https://parquet.apache.org/docs/file-format/data-pages/encodings/#byte-stream-split-byte_stream_split--9)

## CSV

### Parameters

- `csv_has_header`: Optional. Indicate if the CSV file has header row. Defaults to `true`
- `csv_quote`: Optional. A one-character string used to quote fields containing special characters. Defaults to `"`
- `csv_escape`: Optional. A one-character string used to represent special characters or to include characters that would normally be interpreted as delimiters or new line characters within a field value. Defaults to `null`
- `csv_schema_infer_max_records`: Optional. A number used to set the limit in terms of records to scan to infer the schema. Defaults to `1000`
- `csv_delimiter`: Optional. A one-character string used to separate individual fields. Defaults to `,`
