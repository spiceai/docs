---
title: 'FTP/SFTP Data Connector'
sidebar_label: 'FTP/SFTP Data Connector'
description: 'FTP/SFTP Data Connector Documentation'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The FTP/SFTP Data Connector enables federated SQL query across files stored in FTP/SFTP servers.

Supports Parquet and CSV file formats.

If a folder is proivided, all child files will be loaded.

To connect to any FTP/SFTP server, specify `ftp` or `sftp` as a selector in the `from` value for the dataset.

<Tabs>
  <TabItem value="ftp" label="FTP" default>
  ```yaml
  datasets:
    - from: ftp://<host>/path/to/folder/
      name: my_dataset
  ```
  </TabItem>
  <TabItem value="sftp" label="SFTP">
  ```yaml
  datasets:
    - from: sftp://<host>/path/to/folder/
      name: my_dataset
  ```
  </TabItem>
</Tabs>

## Configuration

<Tabs>
  <TabItem value="ftp" label="FTP" default>
    - `file_format`: Optional parameter, specifies the requested file format.
      - `parquet`: (default) Parquet file format.
      - `csv`: CSV file format.
    - `ftp_port`: Optional parameter, specifies the port of the FTP server. Default is 21. E.g. `ftp_port: 21`
    - `ftp_user`: The username for the FTP server. E.g. `ftp_user: my-ftp-user`
    - `ftp_pass`: The password for the FTP server. E.g. `ftp_pass: my-ftp-password`
    - `ftp_pass_key`: The secret key container the password to connect with. E.g. `ftp_pass_key: my-ftp-password-key`
  </TabItem>
  <TabItem value="sftp" label="SFTP">
    - `file_format`: Optional parameter, specifies the requested file format.
      - `parquet`: (default) Parquet file format.
      - `csv`: CSV file format.
    - `sftp_port`: Optional parameter, specifies the port of the SFTP server. Default is 22. E.g. `sftp_port: 22`
    - `sftp_user`: The username for the FTP server. E.g. `sftp_user: my-sftp-user`
    - `sftp_pass`: The password for the FTP server. E.g. `sftp_pass: my-sftp-password`
    - `sftp_pass_key`: The secret key container the password to connect with. E.g. `sftp_pass_key: my-sftp-password-key`
  </TabItem>
</Tabs>

Configuration `params` are provided either in the top level `dataset` for a dataset source and federated SQL query.

```yaml
  - from: ftp://remote-ftp-server.com/path/to/folder/
    name: my_dataset
    params:
      file_format: csv
      ftp_user: my-ftp-user
      ftp_pass_key: my-ftp-password
```

```yaml
  - from: sftp://remote-ftp-server.com/path/to/folder/
    name: my_dataset
    params:
      sftp_port: 20
      sftp_user: my-ftp-user
      sftp_pass_key: my-ftp-password
```


