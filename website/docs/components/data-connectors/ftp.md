---
title: 'FTP/SFTP Data Connector'
sidebar_label: 'FTP/SFTP Data Connector'
description: 'FTP/SFTP Data Connector Documentation'
---

FTP (File Transfer Protocol) and SFTP (SSH File Transfer Protocol) are network protocols for transferring files between a client and server. FTP transmits data in plain text, while SFTP provides encrypted file transfer over SSH, making it the preferred choice for secure environments.

The FTP/SFTP Data Connector enables federated SQL query across [supported file formats](./#file-formats) stored on FTP/SFTP servers.

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
      sftp_host_key_fingerprint: SHA256:TTwqJr9zBNKiSdnBNNsNAP4XxPAg8xyxKU2toj1Vhdk
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
| Authentication  | Username/password         | Username/password              |
| Server identity | Not verified              | Host key fingerprint           |
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

The dataset name used as the table name in SQL queries. Cannot be a [reserved keyword](../../reference/spicepod/keywords).

### `params`

#### FTP Parameters

| Parameter Name              | Description                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `file_format`               | Required when connecting to a directory. See [File Formats](./#file-formats).                                |
| `ftp_user`                  | Required. Username for FTP authentication.                                                                   |
| `ftp_pass`                  | Required. Password for FTP authentication. Use [secrets](../secret-stores) syntax: `${secrets:my_ftp_pass}`. |
| `ftp_port`                  | FTP server port. Default: `21`.                                                                              |
| `client_timeout`            | Wall-clock bound for one connection attempt — TCP connect, server greeting and login together. E.g. `30s`, `1m`. Default: `20s`. |
| `hive_partitioning_enabled` | Enable [Hive-style partitioning](#hive-partitioning) from folder structure. Default: `false`.                |

#### SFTP Parameters

| Parameter Name              | Description                                                                                                    |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `file_format`               | Required when connecting to a directory. See [File Formats](./#file-formats).                                  |
| `sftp_user`                 | Required. Username for SFTP authentication.                                                                    |
| `sftp_pass`                 | Required. Password for SFTP authentication. Use [secrets](../secret-stores) syntax: `${secrets:my_sftp_pass}`. |
| `sftp_host_key_fingerprint` | Required. SHA256 fingerprint of the server's host key, in the form `SHA256:<base64>`. See [SFTP Host Key Verification](#sftp-host-key-verification). |
| `sftp_port`                 | SFTP server port. Default: `22`.                                                                               |
| `client_timeout`            | Wall-clock bound for one connection attempt — name resolution, TCP connect, SSH handshake and password authentication together. E.g. `30s`, `1m`. Default: `20s`. |
| `hive_partitioning_enabled` | Enable [Hive-style partitioning](#hive-partitioning) from folder structure. Default: `false`.                  |

### SFTP Host Key Verification

Spice verifies the identity of the SFTP server before it sends credentials. After the SSH handshake, Spice compares the host key the server presents with `sftp_host_key_fingerprint`. If they differ, Spice closes the connection before authentication, and the dataset fails to load with an error that names the key type and fingerprint the server presented. A dataset without `sftp_host_key_fingerprint` does not load.

To list the fingerprints of the server's host keys, run `ssh-keyscan` and `ssh-keygen`:

```bash
ssh-keyscan -p 22 files.example.com | ssh-keygen -lf -
```

```text
3072 SHA256:yJ4VCOIOOWvxDlYmmCuu5w/Cx6xrOdTOLTS6tjAws0g files.example.com (RSA)
256 SHA256:TTwqJr9zBNKiSdnBNNsNAP4XxPAg8xyxKU2toj1Vhdk files.example.com (ECDSA)
256 SHA256:+d5F7o6yAKJ9uQ+8Vz3YTnl9xsi9BHBBL2nqptG1pVc files.example.com (ED25519)
```

A server usually has more than one host key. Spice uses the first key type the server has in this order: ECDSA, ED25519, RSA. Set `sftp_host_key_fingerprint` to the fingerprint on the line for that key type. In the output above, that is the ECDSA line.

`ssh-keyscan` does not authenticate the server. Confirm the fingerprint with the server administrator, or run the command from a network path you trust.

## Examples

### Basic SFTP Connection

Connect to an SFTP server with username and password authentication, and verify the server's host key:

```yaml
datasets:
  - from: sftp://sftp.example.com/data/transactions/
    name: transactions
    params:
      file_format: parquet
      sftp_user: datauser
      sftp_pass: ${secrets:sftp_password}
      sftp_host_key_fingerprint: SHA256:TTwqJr9zBNKiSdnBNNsNAP4XxPAg8xyxKU2toj1Vhdk
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
      sftp_host_key_fingerprint: SHA256:TTwqJr9zBNKiSdnBNNsNAP4XxPAg8xyxKU2toj1Vhdk
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
      sftp_host_key_fingerprint: SHA256:TTwqJr9zBNKiSdnBNNsNAP4XxPAg8xyxKU2toj1Vhdk
      client_timeout: 120s
```

`client_timeout` bounds a connection attempt as a whole, not each stage of it, so a server that accepts the TCP connection and then stops responding — during the FTP greeting or login, or the SSH handshake or authentication — is abandoned once the bound expires rather than waiting indefinitely. When `client_timeout` is not set, a `20s` bound applies.

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
      sftp_host_key_fingerprint: SHA256:TTwqJr9zBNKiSdnBNNsNAP4XxPAg8xyxKU2toj1Vhdk
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
      sftp_host_key_fingerprint: SHA256:TTwqJr9zBNKiSdnBNNsNAP4XxPAg8xyxKU2toj1Vhdk
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
      sftp_host_key_fingerprint: SHA256:TTwqJr9zBNKiSdnBNNsNAP4XxPAg8xyxKU2toj1Vhdk

  - from: sftp://data.example.com/inventory/
    name: inventory
    params:
      file_format: csv
      sftp_user: ${secrets:sftp_user}
      sftp_pass: ${secrets:sftp_pass}
      sftp_host_key_fingerprint: SHA256:TTwqJr9zBNKiSdnBNNsNAP4XxPAg8xyxKU2toj1Vhdk
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
      sftp_host_key_fingerprint: SHA256:TTwqJr9zBNKiSdnBNNsNAP4XxPAg8xyxKU2toj1Vhdk
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
      sftp_host_key_fingerprint: SHA256:TTwqJr9zBNKiSdnBNNsNAP4XxPAg8xyxKU2toj1Vhdk
```

For detailed information, refer to the [secret stores documentation](../secret-stores).

## Troubleshooting

### Connection Timeouts

Connection attempts are bounded at `20s` by default. If a server is reachable but slow to complete the greeting, login, or SSH handshake, raise `client_timeout`:

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
