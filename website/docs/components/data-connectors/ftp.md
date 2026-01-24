---
title: 'FTP/SFTP Data Connector'
sidebar_label: 'FTP/SFTP Data Connector'
description: 'FTP/SFTP Data Connector Documentation'
---

FTP (File Transfer Protocol) and SFTP (SSH File Transfer Protocol) are network protocols for transferring files between a client and server. FTP transmits data in plain text, while SFTP provides encrypted file transfer over SSH, making it the preferred choice for secure environments.

The FTP/SFTP Data Connector enables federated SQL query across [supported file formats](/docs/components/data-connectors#file-formats) stored on FTP/SFTP servers.

## Quickstart

Connect to an SFTP server and query CSV files:

```yaml
datasets:
  - from: sftp://files.example.com/data/sales/
    name: sales
    params:
      file_format: csv
      sftp_user: ${secrets:sftp_user}
      sftp_pass: ${secrets:sftp_pass}
```

Query the data using SQL:

```sql
SELECT * FROM sales LIMIT 10;
```

## FTP vs SFTP

| Feature         | FTP                       | SFTP                           |
| --------------- | ------------------------- | ------------------------------ |
| Default Port    | 21                        | 22                             |
| Encryption      | None (plain text)         | SSH encryption                 |
| Authentication  | Username/password         | Username/password or SSH keys  |
| Recommended Use | Internal/trusted networks | Production and public networks |

:::tip[Security Recommendation]
Use SFTP instead of FTP whenever possible. FTP transmits credentials and data in plain text, making it vulnerable to interception.
:::

## Configuration

### `from`

Specifies the FTP or SFTP server and path to connect to.

**Format:** `ftp://<host>/<path>` or `sftp://<host>/<path>`

- `<host>`: The server hostname or IP address
- `<path>`: Path to a file or directory on the server

When pointing to a directory, Spice loads all files within that directory recursively.

**Examples:**

```yaml
# Connect to a specific file
from: sftp://files.example.com/data/customers.parquet

# Connect to a directory (loads all files)
from: sftp://files.example.com/data/sales/

# FTP connection
from: ftp://ftp.example.com/exports/reports/
```

### `name`

The dataset name used as the table name in SQL queries. Cannot be a [reserved keyword](/docs/reference/spicepod/keywords).

### `params`

#### FTP Parameters

| Parameter Name              | Description                                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `file_format`               | Required when connecting to a directory. See [File Formats](/docs/components/data-connectors#file-formats).      |
| `ftp_user`                  | Username for FTP authentication.                                                                                 |
| `ftp_pass`                  | Password for FTP authentication. Use [secrets](/docs/components/secret-stores) syntax: `${secrets:my_ftp_pass}`. |
| `ftp_port`                  | FTP server port. Default: `21`.                                                                                  |
| `client_timeout`            | Connection timeout duration. E.g. `30s`, `1m`. No timeout when unset.                                            |
| `hive_partitioning_enabled` | Enable [Hive-style partitioning](#hive-partitioning) from folder structure. Default: `false`.                    |

#### SFTP Parameters

| Parameter Name              | Description                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `file_format`               | Required when connecting to a directory. See [File Formats](/docs/components/data-connectors#file-formats).        |
| `sftp_user`                 | Username for SFTP authentication.                                                                                  |
| `sftp_pass`                 | Password for SFTP authentication. Use [secrets](/docs/components/secret-stores) syntax: `${secrets:my_sftp_pass}`. |
| `sftp_port`                 | SFTP server port. Default: `22`.                                                                                   |
| `client_timeout`            | Connection timeout duration. E.g. `30s`, `1m`. No timeout when unset.                                              |
| `hive_partitioning_enabled` | Enable [Hive-style partitioning](#hive-partitioning) from folder structure. Default: `false`.                      |

## Examples

### Basic SFTP Connection

Connect to an SFTP server with username and password authentication:

```yaml
datasets:
  - from: sftp://sftp.example.com/data/transactions/
    name: transactions
    params:
      file_format: parquet
      sftp_user: datauser
      sftp_pass: ${secrets:sftp_password}
```

### Basic FTP Connection

Connect to an FTP server for internal file access:

```yaml
datasets:
  - from: ftp://ftp.internal.local/exports/daily/
    name: daily_exports
    params:
      file_format: csv
      ftp_user: ftpuser
      ftp_pass: ${secrets:ftp_password}
```

### Reading a Single File

When pointing to a specific file, the format is inferred from the file extension:

```yaml
datasets:
  - from: sftp://files.example.com/reports/quarterly_summary.parquet
    name: quarterly_summary
    params:
      sftp_user: ${secrets:sftp_user}
      sftp_pass: ${secrets:sftp_pass}
```

### Connection with Timeout

Configure a timeout for slow or unreliable connections:

```yaml
datasets:
  - from: sftp://remote-server.example.com/large-datasets/
    name: large_dataset
    params:
      file_format: parquet
      sftp_user: ${secrets:sftp_user}
      sftp_pass: ${secrets:sftp_pass}
      client_timeout: 120s
```

### Custom Port Configuration

Connect to servers running on non-standard ports:

```yaml
datasets:
  - from: sftp://secure.example.com/data/
    name: secure_data
    params:
      file_format: parquet
      sftp_port: 2222
      sftp_user: ${secrets:sftp_user}
      sftp_pass: ${secrets:sftp_pass}
```

### Hive Partitioning

Enable Hive-style partitioning to automatically extract partition columns from the folder structure:

```yaml
datasets:
  - from: sftp://datalake.example.com/events/
    name: events
    params:
      file_format: parquet
      sftp_user: ${secrets:sftp_user}
      sftp_pass: ${secrets:sftp_pass}
      hive_partitioning_enabled: true
```

Given a folder structure like:

```text
/events/
  year=2024/
    month=01/
      data.parquet
    month=02/
      data.parquet
  year=2025/
    month=01/
      data.parquet
```

Queries can filter on partition columns:

```sql
SELECT * FROM events WHERE year = '2024' AND month = '01';
```

### Multiple Datasets from One Server

Load different datasets from the same SFTP server:

```yaml
datasets:
  - from: sftp://data.example.com/sales/
    name: sales
    params:
      file_format: parquet
      sftp_user: ${secrets:sftp_user}
      sftp_pass: ${secrets:sftp_pass}

  - from: sftp://data.example.com/inventory/
    name: inventory
    params:
      file_format: csv
      sftp_user: ${secrets:sftp_user}
      sftp_pass: ${secrets:sftp_pass}
```

### Accelerated Dataset

Enable local acceleration for faster repeated queries:

```yaml
datasets:
  - from: sftp://archive.example.com/historical/
    name: historical_data
    params:
      file_format: parquet
      sftp_user: ${secrets:sftp_user}
      sftp_pass: ${secrets:sftp_pass}
    acceleration:
      enabled: true
      refresh_check_interval: 1h
```

## Secrets

Spice integrates with multiple secret stores for secure credential management. Store FTP/SFTP credentials in a secret store and reference them using the `${secrets:key}` syntax.

```yaml
datasets:
  - from: sftp://files.example.com/data/
    name: secure_data
    params:
      file_format: parquet
      sftp_user: ${secrets:sftp_username}
      sftp_pass: ${secrets:sftp_password}
```

For detailed information, refer to the [secret stores documentation](/docs/components/secret-stores).

## Troubleshooting

### Connection Timeouts

If connections frequently timeout, increase the `client_timeout` value:

```yaml
params:
  client_timeout: 120s
```

### Authentication Failures

Verify credentials are correctly stored in your secret store and that the user has read access to the specified path on the server.

### File Format Errors

When connecting to a directory, ensure `file_format` is specified and matches the actual file types in the directory. Spice expects all files in a directory to have the same format.

## Cookbook

Refer to the [FTP cookbook recipe](https://github.com/spiceai/cookbook/tree/trunk/ftp) for a complete working example.
