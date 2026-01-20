---
title: 'SMB Data Connector'
sidebar_label: 'SMB Data Connector'
description: 'SMB Data Connector Documentation'
---

SMB (Server Message Block) is a network file sharing protocol that provides shared access to files, printers, and serial ports. It is commonly used in Windows environments for network shares but is also supported on Linux (via Samba) and macOS.

The SMB Data Connector enables federated SQL query across [supported file formats](/docs/components/data-connectors/index.md#file-formats) stored on SMB/CIFS network shares. It supports SMB 2.0, 2.1, 3.0, and 3.1.1 protocols, compatible with Windows Server file shares, Samba servers, NAS devices (Synology, QNAP, etc.), and Azure Files.

## Quickstart

Connect to an SMB share and query Parquet files:

```yaml
datasets:
  - from: smb://fileserver/data/sales/
    name: sales
    params:
      file_format: parquet
      smb_user: ${secrets:smb_user}
      smb_pass: ${secrets:smb_pass}
```

Query the data using SQL:

```sql
SELECT * FROM sales LIMIT 10;
```

## Configuration

### `from`

Specifies the SMB server, share, and path to connect to.

**Format:** `smb://<host>/<share>/<path>`

- `<host>`: The server hostname or IP address
- `<share>`: The share name on the server
- `<path>`: Path to a file or directory within the share (optional)

When pointing to a directory, Spice loads all files within that directory recursively.

**Examples:**

```yaml
# Connect to a specific file
from: smb://fileserver/data/reports/quarterly.parquet

# Connect to a directory (loads all files)
from: smb://fileserver/data/sales/

# Connect to share root
from: smb://fileserver/data/

# Using IP address
from: smb://192.168.1.100/share/data.parquet
```

### `name`

The dataset name used as the table name in SQL queries. Cannot be a [reserved keyword](/docs/reference/spicepod/keywords.md).

### `params`

| Parameter Name              | Description                                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `file_format`               | Required when connecting to a directory. See [File Formats](/docs/components/data-connectors/index.md#file-formats). |
| `smb_user`                  | Username for SMB authentication. Use [secrets](../secret-stores/index.md) syntax: `${secrets:smb_user}`.             |
| `smb_pass`                  | Password for SMB authentication. Use [secrets](../secret-stores/index.md) syntax: `${secrets:smb_pass}`.             |
| `smb_port`                  | SMB server port. Default: `445`.                                                                                     |
| `client_timeout`            | Connection timeout duration. E.g. `30s`, `1m`. No timeout when unset.                                                |
| `hive_partitioning_enabled` | Enable [Hive-style partitioning](#hive-partitioning) from folder structure. Default: `false`.                        |

## Examples

### Basic Connection

Connect to a Windows file share with domain credentials:

```yaml
datasets:
  - from: smb://fileserver.corp.local/shared/analytics/
    name: analytics
    params:
      file_format: parquet
      smb_user: ${secrets:smb_user}
      smb_pass: ${secrets:smb_pass}
```

### Domain Authentication

For Windows domain environments, include the domain in the username:

```yaml
datasets:
  - from: smb://fileserver/data/reports/
    name: reports
    params:
      file_format: csv
      csv_has_header: true
      smb_user: DOMAIN\username
      smb_pass: ${secrets:smb_pass}
```

The domain can be specified as `DOMAIN\user` or `user@domain`.

### Reading a Single File

When pointing to a specific file, the format is inferred from the file extension:

```yaml
datasets:
  - from: smb://nas.local/backups/database_export.parquet
    name: database_export
    params:
      smb_user: ${secrets:smb_user}
      smb_pass: ${secrets:smb_pass}
```

### Connection with Timeout

Configure a timeout for slow or unreliable network connections:

```yaml
datasets:
  - from: smb://remote-server.example.com/data/
    name: remote_data
    params:
      file_format: parquet
      smb_user: ${secrets:smb_user}
      smb_pass: ${secrets:smb_pass}
      client_timeout: 60s
```

### Custom Port Configuration

Connect to SMB servers running on non-standard ports:

```yaml
datasets:
  - from: smb://custom-server.local/share/
    name: custom_data
    params:
      file_format: parquet
      smb_port: 4450
      smb_user: ${secrets:smb_user}
      smb_pass: ${secrets:smb_pass}
```

### Hive Partitioning

Enable Hive-style partitioning to automatically extract partition columns from the folder structure:

```yaml
datasets:
  - from: smb://datalake.corp.local/warehouse/events/
    name: events
    params:
      file_format: parquet
      smb_user: ${secrets:smb_user}
      smb_pass: ${secrets:smb_pass}
      hive_partitioning_enabled: true
```

Given a folder structure like:

```text
/events/
  region=us/
    year=2024/
      data.parquet
  region=eu/
    year=2024/
      data.parquet
```

Queries can filter on partition columns:

```sql
SELECT * FROM events WHERE region = 'us' AND year = '2024';
```

### Multiple Shares from One Server

Load different datasets from multiple shares on the same server:

```yaml
datasets:
  - from: smb://fileserver/sales/
    name: sales
    params:
      file_format: parquet
      smb_user: ${secrets:smb_user}
      smb_pass: ${secrets:smb_pass}

  - from: smb://fileserver/inventory/
    name: inventory
    params:
      file_format: csv
      smb_user: ${secrets:smb_user}
      smb_pass: ${secrets:smb_pass}
```

### Accelerated Dataset

Enable local acceleration for faster repeated queries:

```yaml
datasets:
  - from: smb://archive.corp.local/historical/
    name: historical_data
    params:
      file_format: parquet
      smb_user: ${secrets:smb_user}
      smb_pass: ${secrets:smb_pass}
    acceleration:
      enabled: true
      engine: duckdb
      refresh_check_interval: 1h
```

Acceleration is recommended for frequently queried data, as SMB operations involve network round-trips for directory listing and file reads.

### TPC-H Benchmark Example

For benchmark configurations with multiple related tables, use YAML anchors to avoid repeating parameters:

```yaml
datasets:
  - from: smb://192.168.1.100/data/benchmarks/tpch/customer.parquet
    name: customer
    params: &smb_params
      file_format: parquet
      smb_user: ${secrets:smb_user}
      smb_pass: ${secrets:smb_pass}

  - from: smb://192.168.1.100/data/benchmarks/tpch/lineitem.parquet
    name: lineitem
    params: *smb_params

  - from: smb://192.168.1.100/data/benchmarks/tpch/orders.parquet
    name: orders
    params: *smb_params
```

## Secrets

Spice integrates with multiple secret stores for secure credential management. Store SMB credentials in a secret store and reference them using the `${secrets:key}` syntax.

```yaml
datasets:
  - from: smb://fileserver/data/
    name: secure_data
    params:
      file_format: parquet
      smb_user: ${secrets:smb_username}
      smb_pass: ${secrets:smb_password}
```

For detailed information, refer to the [secret stores documentation](/docs/components/secret-stores).

## Limitations

The SMB connector is read-only. Write operations such as `put`, `delete`, and `copy` are not supported.

Only username/password authentication is supported. Kerberos and NTLM ticket-based authentication are not available.

Direct network access to the SMB server is required; proxy connections are not supported. The firewall must permit SMB traffic (port 445 by default).

## Troubleshooting

### Connection Timeouts

If connections frequently timeout, increase the `client_timeout` value:

```yaml
params:
  client_timeout: 120s
```

Verify network connectivity to the server and check that firewall rules permit port 445.

### Authentication Failures

Common causes of authentication failures:

- **Domain not specified**: For domain-joined servers, include the domain: `DOMAIN\username` or `username@domain`
- **Incorrect credentials**: Verify username and password are correctly stored in your secret store
- **Permission denied**: Ensure the user has read access to the share and files
- **Account locked**: Check if the SMB account is not locked on the server

### Share Access Errors

If you receive "share not found" errors:

- Verify the share name is correct (share names are case-insensitive on Windows)
- Ensure the share exists and is accessible from the network where Spice is running
- Check firewall rules: SMB uses TCP port 445
- Confirm the user has permission to access the share

### File Format Errors

When connecting to a directory, ensure `file_format` is specified and matches the actual file types in the directory. Spice expects all files in a directory to have the same format.

### Debug Logging

Enable debug logging to diagnose SMB connection issues:

```bash
RUST_LOG=runtime_object_store::store::smb=debug spiced
```
