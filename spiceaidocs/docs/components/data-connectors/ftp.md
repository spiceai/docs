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

    - `file_format`: Specifies the data file format. Required if the format cannot be inferred by from the `from` path.
      - `parquet`: Parquet file format.
      - `csv`: CSV file format.
    - `ftp_port`: Optional, specifies the port of the FTP server. Default is 21. E.g. `ftp_port: 21`
    - `ftp_user`: The username for the FTP server. E.g. `ftp_user: my-ftp-user`
    - `ftp_pass`: The password for the FTP server. Use the [secret replacement syntax](../secret-stores/index.md) to load the password from a secret store, e.g. `${secrets:my_dremio_pass}`.
    - `client_timeout`: Specifies timeout for FTP operations. Default value is `30s` E.g. `client_timeout: 60s`

    More CSV related parameters can be configured, see [CSV Parameters](/reference/file_format.md#csv)

    ### Examples
    ```yaml
      - from: ftp://remote-ftp-server.com/path/to/folder/
        name: my_dataset
        params:
          file_format: csv
          ftp_user: my-ftp-user
          ftp_pass: ${secrets:my_ftp_password}
    ```

  </TabItem>
  <TabItem value="sftp" label="SFTP">
    ### Parameters

    The connection to SFTP can be configured by providing the following params:

    - `file_format`: Optional, specifies the requested file format.
      - `parquet`: (default) Parquet file format.
      - `csv`: CSV file format.
    - `sftp_port`: Optional, specifies the port of the SFTP server. Default is 22. E.g. `sftp_port: 22`
    - `sftp_user`: The username for the SFTP server. E.g. `sftp_user: my-sftp-user`
    - `sftp_pass`: The password for the SFTP server. Use the [secret replacement syntax](../secret-stores/index.md) to load the password from a secret store, e.g. `${secrets:my_dremio_pass}`.
    - `client_timeout`: Specifies timeout for FTP operations. Default value is `30s` E.g. `client_timeout: 60s`

    More CSV related parameters can be configured, see [CSV Parameters](/reference/file_format.md#csv)

    ### Examples
    ```yaml
      - from: sftp://remote-sftp-server.com/path/to/folder/
        name: my_dataset
        params:
          file_format: csv
          sftp_port: 20
          sftp_user: my-sftp-user
          sftp_pass: ${secrets:my_sftp_password}
    ```

  </TabItem>
</Tabs>
