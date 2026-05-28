---
title: 'NFS Data Connector'
sidebar_label: 'NFS Data Connector'
description: 'NFS Data Connector Documentation'
---

NFS (Network File System) is a distributed file system protocol that provides transparent remote access to shared files across networks. Originally developed by Sun Microsystems, it is widely used in Unix/Linux environments for sharing files between systems.

The NFS Data Connector enables federated SQL query across [supported file formats](./#file-formats) stored on NFS exports.

:::note[Enterprise edition]
The NFS Data Connector is available in the Spice [Enterprise edition](https://docs.spice.ai/docs/enterprise/getting-started/distributions). It is feature-gated and not included in the default open source build; open source users can build it from source with the `nfs` feature (requires the system `libnfs` library).
:::

:::note[Platform Support]
The NFS Data Connector is available on Linux and macOS. It is not supported on Windows.
:::

## Quickstart

Connect to an NFS export and query Parquet files:

```yaml
datasets:
  - from: nfs://nfs-server.local/exports/data/
    name: data
    params:
      file_format: parquet
```

Query the data using SQL:

```sql
SELECT * FROM data LIMIT 10;
```

## How It Works

Unlike SMB and FTP/SFTP connectors, NFS uses host-based authentication rather than username/password credentials. The NFS server grants access based on the client machine's IP address or hostname, as configured in the server's export rules (typically in `/etc/exports`).

Ensure the host running Spice is authorized to mount the NFS export before configuring the connector.

## Configuration

### `from`

Specifies the NFS server and export path to connect to.

**Format:** `nfs://<host>/<export-path>`

- `<host>`: The server hostname or IP address
- `<export-path>`: The exported directory path on the server

When pointing to a directory, Spice loads all files within that directory recursively.

**Examples:**

```yaml
# Connect to an export root
from: nfs://nfs-server.local/exports/data/

# Connect to a subdirectory within an export
from: nfs://nfs-server.local/exports/data/sales/2024/

# Connect to a specific file
from: nfs://192.168.1.100/data/reports/quarterly.parquet
```

### `name`

The dataset name used as the table name in SQL queries. Cannot be a [reserved keyword](../../reference/spicepod/keywords).

### `params`

| Parameter Name              | Description                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| `file_format`               | Required when connecting to a directory. See [File Formats](./#file-formats).                 |
| `client_timeout`            | Connection timeout duration. E.g. `30s`, `1m`. No timeout when unset.                         |
| `hive_partitioning_enabled` | Enable [Hive-style partitioning](#hive-partitioning) from folder structure. Default: `false`. |

## Examples

### Basic Connection

Connect to an NFS export:

```yaml
datasets:
  - from: nfs://storage.local/exports/analytics/
    name: analytics
    params:
      file_format: parquet
```

### Reading a Single File

When pointing to a specific file, the format is inferred from the file extension:

```yaml
datasets:
  - from: nfs://nfs-server.local/data/reports/summary.parquet
    name: summary
```

### Connection with Timeout

Configure a timeout for slow or unreliable network connections:

```yaml
datasets:
  - from: nfs://remote-nfs.example.com/exports/large-data/
    name: large_data
    params:
      file_format: parquet
      client_timeout: 120s
```

### Reading CSV Files

Connect to an NFS export containing CSV files:

```yaml
datasets:
  - from: nfs://storage.local/exports/csv-data/
    name: csv_data
    params:
      file_format: csv
      csv_has_header: true
```

### Hive Partitioning

Enable Hive-style partitioning to automatically extract partition columns from the folder structure:

```yaml
datasets:
  - from: nfs://datalake.local/warehouse/events/
    name: events
    params:
      file_format: parquet
      hive_partitioning_enabled: true
```

Given a folder structure like:

```text
/events/
  date=2024-01-01/
    data.parquet
  date=2024-01-02/
    data.parquet
  date=2024-01-03/
    data.parquet
```

Queries can filter on partition columns:

```sql
SELECT * FROM events WHERE date = '2024-01-01';
```

### Multiple Exports from One Server

Load different datasets from multiple exports on the same NFS server:

```yaml
datasets:
  - from: nfs://storage.local/exports/sales/
    name: sales
    params:
      file_format: parquet

  - from: nfs://storage.local/exports/inventory/
    name: inventory
    params:
      file_format: csv
```

### Accelerated Dataset

Enable local acceleration for faster repeated queries:

```yaml
datasets:
  - from: nfs://archive.local/historical/
    name: historical_data
    params:
      file_format: parquet
    acceleration:
      enabled: true
      refresh_check_interval: 1h
```

### Combined with Other Data Sources

Join NFS data with other data sources:

```yaml
datasets:
  - from: nfs://datalake.local/exports/transactions/
    name: transactions
    params:
      file_format: parquet

  - from: postgres://db.local/customers
    name: customers

  - from: s3://analytics-bucket/products/
    name: products
    params:
      file_format: parquet
```

```sql
SELECT
  c.name,
  p.product_name,
  t.amount
FROM transactions t
JOIN customers c ON t.customer_id = c.id
JOIN products p ON t.product_id = p.id;
```

## Authentication and Access Control

NFS relies on the server's export configuration for access control. The NFS server administrator must configure the export rules to grant read access to the host running Spice.

**Example NFS server export configuration** (`/etc/exports`):

```text
/exports/data    192.168.1.0/24(ro,sync,no_subtree_check)
/exports/data    spice-host.local(ro,sync,no_subtree_check)
```

This grants read-only access to all hosts on the `192.168.1.0/24` subnet and to `spice-host.local`.

## Troubleshooting

### Connection Errors

If you receive "connection refused" or "mount failed" errors:

- Verify the NFS server is running and accessible from the Spice host
- Check that the export path exists on the server
- Ensure the Spice host is authorized in the server's export configuration
- Verify firewall rules permit NFS traffic (typically TCP/UDP ports 111 and 2049)

### Permission Denied

If you can connect but receive permission errors:

- Verify the export grants read access to the Spice host
- Check file permissions on the exported directory
- Ensure the export uses appropriate UID/GID mapping options

### Timeout Errors

For slow or unreliable network connections, increase the timeout:

```yaml
params:
  client_timeout: 120s
```

### File Format Errors

When connecting to a directory, ensure `file_format` is specified and matches the actual file types in the directory. Spice expects all files in a directory to have the same format.

## Platform Requirements

The NFS connector requires the `libnfs` library to be installed on the system:

**Ubuntu/Debian:**

```bash
sudo apt-get install libnfs-dev
```

**macOS:**

```bash
brew install libnfs
```
