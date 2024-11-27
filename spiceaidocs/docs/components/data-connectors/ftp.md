---
title: 'FTP/SFTP Data Connector'
sidebar_label: 'FTP/SFTP Data Connector'
description: 'FTP/SFTP Data Connector Documentation'
---

FTP (File Transfer Protocol) and SFTP (SSH File Transfer Protocol) are network protocols used for transferring files between a client and server, with FTP being less secure and SFTP providing encrypted file transfer over SSH.

The FTP/SFTP Data Connector enables federated/accelerated SQL query across [supported file formats](/components/data-connectors/index.md#object-store-file-formats) stored in FTP/SFTP servers.

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

The dataset name. This will be used as the table name within Spice.

Example:
```yaml
datasets:
  - from: sftp://remote-sftp-server.com/path/to/folder/
    name: cool_dataset
    params:
      ...
```

```sql
SELECT COUNT(*) FROM cool_dataset;
```

```shell
+----------+
| count(*) |
+----------+
| 6001215  |
+----------+
```

### `params`

#### FTP

| Parameter Name              | Description                                                                                                                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `file_format`               | Specifies the data file format. Required if the format cannot be inferred by from the `from` path. See [Object Store File Formats](/components/data-connectors/index.md#object-store-file-formats). |
| `ftp_port`                  | Optional, specifies the port of the FTP server. Default is 21. E.g. `ftp_port: 21`                                                                                                                  |
| `ftp_user`                  | The username for the FTP server. E.g. `ftp_user: my-ftp-user`                                                                                                                                       |
| `ftp_pass`                  | The password for the FTP server. Use the [secret replacement syntax](../secret-stores/index.md) to load the password from a secret store, e.g. `${secrets:my_ftp_pass}`.                            |
| `client_timeout`            | Optional. Specifies timeout for FTP connection. E.g. `client_timeout: 30s`. When not set, no timeout will be configured for FTP client.                                                             |
| `hive_partitioning_enabled` | Optional. Enable partitioning using hive-style partitioning from the folder structure. Defaults to `false`                                                                                          |

#### SFTP
| Parameter Name              | Description                                                                                                                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `file_format`               | Specifies the data file format. Required if the format cannot be inferred by from the `from` path. See [Object Store File Formats](/components/data-connectors/index.md#object-store-file-formats). |
| `sftp_port`                 | Optional, specifies the port of the SFTP server. Default is 22. E.g. `sftp_port: 22`                                                                                                                |
| `sftp_user`                 | The username for the SFTP server. E.g. `sftp_user: my-sftp-user`                                                                                                                                    |
| `sftp_pass`                 | The password for the SFTP server. Use the [secret replacement syntax](../secret-stores/index.md) to load the password from a secret store, e.g. `${secrets:my_sftp_pass}`.                          |
| `client_timeout`            | Optional. Specifies timeout for SFTP connection. E.g. `client_timeout: 30s`. When not set, no timeout will be configured for SFTP client.                                                           |
| `hive_partitioning_enabled` | Optional. Enable partitioning using hive-style partitioning from the folder structure. Defaults to `false`                                                                                          |

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

## Quickstarts and Samples

Refer to the [FTP quickstart](https://github.com/spiceai/quickstarts/tree/trunk/ftp) to see an example of the FTP connector in use.

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](/components/secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](/components/secret-stores#using-secrets).