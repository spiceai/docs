---
title: 'FTP/SFTP Data Connector'
sidebar_label: 'FTP/SFTP Data Connector'
description: 'FTP/SFTP Data Connector Documentation'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The FTP/SFTP Data Connector enables federated SQL query across Parquet/CSV files stored in FTP/SFTP servers.

If a folder is provided, all child Parquet/CSV files will be loaded.

## Configuration

<Tabs>
  <TabItem value="ftp" label="FTP" default>
    ### Parameters

    The connection to FTP can be configured by providing the following params:

    - `file_format`: Optional parameter, specifies the requested file format.
      - `parquet`: (default) Parquet file format.
      - `csv`: CSV file format.
    - `ftp_port`: Optional parameter, specifies the port of the FTP server. Default is 21. E.g. `ftp_port: 21`
    - `ftp_user`: The username for the FTP server. E.g. `ftp_user: my-ftp-user`
    - `ftp_pass`: The password for the FTP server. E.g. `ftp_pass: my-ftp-password`
    - `ftp_pass_key`: The secret key container the password to connect with. E.g. `ftp_pass_key: my-ftp-password-key`

    More CSV related parameters can be configured, see [CSV Parameters](../reference/file_format.md#CSV)

    ### Examples
    ```yaml
      - from: ftp://remote-ftp-server.com/path/to/folder/
        name: my_dataset
        params:
          file_format: csv
          ftp_user: my-ftp-user
          ftp_pass_key: my-ftp-password
    ```
  </TabItem>
  <TabItem value="sftp" label="SFTP">
    ### Parameters

    The connection to SFTP can be configured by providing the following params:

    - `file_format`: Optional parameter, specifies the requested file format.
      - `parquet`: (default) Parquet file format.
      - `csv`: CSV file format.
    - `sftp_port`: Optional parameter, specifies the port of the SFTP server. Default is 22. E.g. `sftp_port: 22`
    - `sftp_user`: The username for the SFTP server. E.g. `sftp_user: my-sftp-user`
    - `sftp_pass`: The password for the SFTP server. E.g. `sftp_pass: my-sftp-password`
    - `sftp_pass_key`: The secret key container the password to connect with. E.g. `sftp_pass_key: my-sftp-password-key`

    More CSV related parameters can be configured, see [CSV Parameters](../reference/file_format.md#CSV)

    ### Examples
    ```yaml
      - from: sftp://remote-sftp-server.com/path/to/folder/
        name: my_dataset
        params:
          sftp_port: 20
          sftp_user: my-sftp-user
          sftp_pass_key: my-sftp-password
    ```
  </TabItem>
</Tabs>