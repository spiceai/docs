---
title: 'FTP/SFTP Data Connector'
sidebar_label: 'FTP/SFTP Data Connector'
description: 'FTP/SFTP Data Connector Documentation'
---

FTP (File Transfer Protocol) and SFTP (SSH File Transfer Protocol) are network protocols used for transferring files between a client and server, with FTP being less secure and SFTP providing encrypted file transfer over SSH.

The FTP/SFTP Data Connector enables federated SQL query across [supported file formats(./index.md#file-formats) stored on FTP/SFTP servers.

## Quickstart

Connect to an SFTP server and query CSV files:

```yaml
datasets:
  - from: sftp://remote-sftp-server.com/path/to/folder/
    name: my_dataset
    params:
      file_format: csv
      sftp_port: 22
      sftp_user: my-sftp-user
      sftp_pass: ${secrets:my_sftp_password}
```

## Configuration

### `from`

The `from` field takes one of two forms: `ftp://<host>/<path>` or `sftp://<host>/<path>` where `<host>` is the host to connect to and `<path>` is the path to the file or directory to read from.

If a folder is provided, all child files will be loaded.

### `name`

The dataset name used as the table name in SQL queries. Cannot be a [reserved keyword(../../reference/spicepod/keywords.md).

### `params`

#### FTP

| Parameter Name              | Description                                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `file_format`               | Required when connecting to a directory. See [File Formats(./index.md#file-formats). |
| `ftp_user`                  | Username for FTP authentication.                                                                                     |
| `ftp_pass`                  | Password for FTP authentication. Use [secrets](../secret-stores/index.md) syntax: `${secrets:my_ftp_pass}`.          |
| `ftp_port`                  | FTP server port. Default: `21`.                                                                                      |
| `client_timeout`            | Connection timeout duration. E.g. `30s`, `1m`. No timeout when unset.                                                |
| `hive_partitioning_enabled` | Enable [Hive-style partitioning](#hive-partitioning) from folder structure. Default: `false`.                        |

#### SFTP

| Parameter Name              | Description                                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `file_format`               | Required when connecting to a directory. See [File Formats(./index.md#file-formats). |
| `sftp_user`                 | Username for SFTP authentication.                                                                                    |
| `sftp_pass`                 | Password for SFTP authentication. Use [secrets](../secret-stores/index.md) syntax: `${secrets:my_sftp_pass}`.        |
| `sftp_port`                 | SFTP server port. Default: `22`.                                                                                     |
| `client_timeout`            | Connection timeout duration. E.g. `30s`, `1m`. No timeout when unset.                                                |
| `hive_partitioning_enabled` | Enable [Hive-style partitioning](#hive-partitioning) from folder structure. Default: `false`.                        |

## Examples

### Connecting to FTP

```yaml
- from: ftp://remote-ftp-server.com/path/to/folder/
  name: my_dataset
  params:
    file_format: csv
    ftp_user: my-ftp-user
    ftp_pass: ${secrets:my_ftp_password}
    hive_partitioning_enabled: false
```

### Connecting to SFTP

```yaml
- from: sftp://remote-sftp-server.com/path/to/folder/
  name: my_dataset
  params:
    file_format: csv
    sftp_port: 22
    sftp_user: my-sftp-user
    sftp_pass: ${secrets:my_sftp_password}
    hive_partitioning_enabled: false
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

For detailed information, refer to the [secret stores documentation(../secret-stores).

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

Refer to the [FTP cookbook recipe](https://github.com/spiceai/cookbook/tree/trunk/ftp) to see an example of the FTP connector in use.
