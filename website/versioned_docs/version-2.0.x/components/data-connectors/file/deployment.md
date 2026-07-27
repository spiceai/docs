---
title: 'File Data Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the File data connector in production: permissions, formats, performance, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - file
  - observability
---

Production operating guide for the File data connector (reading files from the local or mounted filesystem).

## Authentication & Secrets

The File connector has no authentication layer. Access control is enforced by the operating system:

- The Spice runtime process must have read permission on the target file or directory.
- For containers, mount source files as read-only volumes.
- For Kubernetes, prefer `ConfigMap` / `Secret` / `PersistentVolumeClaim` mounts over host paths.

For secrets embedded in data files (credentials, tokens), encrypt at rest and restrict filesystem ACLs to the Spice process user.

## Resilience Controls

The File connector reads local files synchronously; there is no network layer, retry, or concurrency semaphore. Failures are filesystem errors (`ENOENT`, `EACCES`, `EIO`) and surface directly to the caller. Filesystem issues (e.g., an NFS mount going stale) must be handled at the infrastructure layer.

For hot-reloading of updated data files, accelerate the dataset and configure a `refresh_interval` — the connector re-reads the file on each refresh.

## Capacity & Sizing

- **Throughput**: Bounded by local disk bandwidth. For NVMe and locally-attached SSDs, expect single-threaded reads of hundreds of MB/s for uncompressed formats and proportionally less for compressed formats due to CPU cost.
- **Memory**: File reads are streamed; memory footprint is bounded by DataFusion's 8192-row record batch size.
- **Directory listings**: Glob patterns and directory paths list the full matching set at plan time. For directories with tens of thousands of files, expect multi-second planning overhead.
- **Hive partitioning**: Enable `hive_partitioning_enabled: true` when reading partitioned directories to prune at plan time.

### File Formats

See [File Formats](../../../reference/file_format) for format-specific parameters. Choose based on access pattern:

- **Parquet**: Best for analytical reads. Column pruning and predicate pushdown apply.
- **CSV**: Text-scan workloads only; set `has_header` and `delimiter` explicitly.
- **JSON (newline-delimited)**: Good for ad-hoc reads; schema inference cost is linear in sampled records.
- **Arrow IPC**: Fastest for Spice-to-Spice data exchange.

## Metrics

The File connector does not register connector-specific instruments. Monitor via Spice's query execution metrics (`query_duration_ms`, `query_returned_rows`). See [Component Metrics](../../../features/observability/component_metrics) for general configuration.

For filesystem-level issues (disk utilization, IOPS), use the underlying OS metrics (Prometheus `node_exporter`, CloudWatch agent, etc.).

## Task History

File reads participate in [task history](../../../reference/task_history) through DataFusion's execution-plan spans. Listings, opens, and reads are attributed to the enclosing `sql_query` or `accelerated_table_refresh` task.

## Known Limitations

- **Read-only**: The File connector cannot write.
- **No file watching**: File updates are not detected automatically; use `refresh_interval` on an accelerated dataset to pick up changes.
- **Container portability**: Hard-coded `file://` paths in a spicepod are non-portable across environments; parameterize via env vars or use network-mounted paths with consistent mount points.
- **Large CSVs**: CSV reads are single-threaded; prefer Parquet for datasets larger than a few GB.

## Troubleshooting

| Symptom                                           | Likely cause                                     | Resolution                                                                                   |
| ------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `No such file or directory`                       | Path typo, wrong working directory, or missing mount. | Verify the file exists from the Spice process context (`ls` inside the container).          |
| `Permission denied`                               | Spice process user lacks read permission.        | Adjust file ACLs or mount with appropriate UID/GID.                                          |
| Schema inference is slow for JSON                 | Large file with sparse fields sampled.           | Provide an explicit `schema`, or sample fewer records.                                       |
| Planning time dominates for glob patterns         | Very large directory listings.                   | Prune with Hive partitioning or break the dataset into narrower prefixes.                    |
| Query returns old data after file was replaced    | No file watch; Spice sees cached schema.         | Set `refresh_interval` on an accelerated dataset, or restart the runtime.                    |
