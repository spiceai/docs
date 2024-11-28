---
title: 'ODBC: Open Database Connectivity'
sidebar_label: 'ODBC'
sidebar_position: 4
description: 'ODBC API Documentation'
pagination_prev: null
pagination_next: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[ODBC](https://learn.microsoft.com/en-us/sql/odbc/microsoft-open-database-connectivity-odbc) (Open Database Connectivity) is a low-level, high-performance interface that is designed specifically for relational data stores as a standard way to connect to, and interact with a database.

Spice supports ODBC clients through an ODBC driver implementation based on the [Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html) protocol. This enables ODBC-compatible applications to connect to Spice, execute queries, and retrieve data.

:::warning[Limitations]

1. ODBC support is currently in alpha, and not all functionality is supported
1. The Arrow Flight SQL ODBC driver is not available for 32-bit Windows versions
1. The Arrow Flight SQL ODBC driver is not supported on the Apple ARM architecture

:::

## Install and configure the Flight SQL ODBC driver

### Download and install the Flight SQL ODBC driver

- Download and install the driver from the [ODBC driver download page](https://www.dremio.com/drivers/odbc/)
  - [Windows instructions](https://docs.dremio.com/current/sonar/client-applications/drivers/arrow-flight-sql-odbc-driver/#downloading-and-installing-on-windows)
  - [Linux](https://docs.dremio.com/current/sonar/client-applications/drivers/arrow-flight-sql-odbc-driver/#downloading-and-installing-on-linux)
  - [macOS instructions](https://docs.dremio.com/current/sonar/client-applications/drivers/arrow-flight-sql-odbc-driver/#downloading-and-installing-on-macos)

### Configure Flight SQL ODBC driver

<Tabs>
  <TabItem value="default" label="Windows" default>
    - Open **Start Menu** -> **Windows Administrative Tools** -> click **ODBC Data Sources (64-bit)**
    - In the **ODBC Data Source Administrator (64-bit)** dialog, click **System DSN**
     <img width="600" alt="ODBC Data Source Administrator" src="/img/odbc/spice-odbc-windows-config.png" />
    - Select **Arrow Flight SQL ODBC DSN** and click **Configure**
    - Specify Spice.ai OSS runtime `HOST`, `PORT`, in the `UseEncryption` field, specify one of these values:
      - `true`, if [Spice is configured for encrypted communication (TLS)](https://docs.spiceai.org/api/tls)
      - `false`, otherwise
    - For descriptions of all the parameters, see [ODBC Connection Parameters](#odbc-connection-parameters).

  </TabItem>
  <TabItem value="linux" label="Linux" default>

    - Ensure that `unixODBC` is installed. To verify whether `unixODBC` is installed, execute the following commands:

    ```shell
    which odbcinst
    which isql
    ```

    - Copy the content of the `odbc.ini` and `odbcinst.ini` from the `/opt/arrow-flight-sql-odbc-driver/conf` and paste into your system `/etc/odbc.ini` and `/etc/odbcinst.ini` files
    - Edit `odbc.ini`: specify Spice.ai OSS runtime `HOST`, `PORT`, in the `UseEncryption` field, specify one of these values:
      - `true`, if [Spice is configured for encrypted communication (TLS)](https://docs.spiceai.org/api/tls)
      - `false`, otherwise
    - For descriptions of all the parameters, see [ODBC Connection Parameters](#odbc-connection-parameters)
    - Run this command to verify `unixODBC` configuration

    ```shell
    odbcinst -j
    ```

  </TabItem>
  <TabItem value="macos" label="macOS">
  
    - Ensure that [ODBC Manager](http://www.odbcmanager.net/) is installed.
    - Launch **ODBC Manager** -> **System DSN** page, select **Arrow Flight SQL ODBC DSN** and click **Configure**.
    - Specify Spice.ai OSS runtime `HOST`, `PORT`, in the `UseEncryption` field, specify one of these values:
      - `true`, if [Spice is configured for encrypted communication (TLS)](https://docs.spiceai.org/api/tls)
      - `false`, otherwise
    <img width="600" alt="ODBC Data Source Administrator" src="/img/odbc/spice-odbc-macos-config.png" />
    - For descriptions of all the parameters, see [ODBC Connection Parameters](#odbc-connection-parameters).

  </TabItem>
</Tabs>

### ODBC Connection Parameters

| Name                           | Type    | Description                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| host                           | string  | The IP address or hostname for the Spice runtime.                                                                                                                                                                                                                                                                                                                            |
| port                           | integer | The Spice runtime Arrow Flight endpoint port number                                                                                                                                                                                                                                                                                                                          |
| useEncryption                  | integer | Configures the driver to use an SSL-encrypted connection. Accepted values: `true` (default) - The client communicates with the Spice runtime only using SSL encryption and `false` - SSL encryption is disabled.                                                                                                                                                             |
| disableCertificateVerification | integer | Specifies whether the driver should verify the host certificate against the trust store. Default is `false`                                                                                                                                                                                                                                                                  |
| useSystemTrustStore            | integer | Controls whether to use a CA certificate from the system's trust store, or from a specified .pem file. If `true` - The driver verifies the connection using a certificate in the system trust store. IF `false` - The driver verifies the connection using the .pem file specified by the `trustedCerts` parameter. `true` on Windows and macOS, `false` on Linux by default |
| trustedCerts                   | string  | The full path of the .pem file containing certificates trusted by a CA, for the purpose of verifying the server. If this option is not set, then the driver defaults to using the trusted CA certificates .pem file installed by the driver.                                                                                                                                 |

:::note
The ODBC driver for Arrow Flight SQL does not support password-protected `.pem/.crt` files or multiple `.crt` certificates in a single `.pem/.crt` file.
:::

## Execute Test Query

Ensure Spice runtime has started:

```shell
spiced --flight 0.0.0.0:50051
```

```shell
2024-10-06T20:06:50.084017Z  INFO runtime::opentelemetry: Spice Runtime OpenTelemetry listening on 127.0.0.1:50052
2024-10-06T20:06:50.084015Z  INFO runtime::flight: Spice Runtime Flight listening on 0.0.0.0:50051
2024-10-06T20:06:50.086948Z  INFO runtime::http: Spice Runtime HTTP listening on 127.0.0.1:8090
2024-10-06T20:06:50.297512Z  INFO runtime: Initialized results cache; max size: 128.00 MiB, item ttl: 1s
2024-10-06T20:06:50.308775Z  INFO runtime: Tool [document_similarity] ready to use
2024-10-06T20:06:50.308803Z  INFO runtime: Tool [table_schema] ready to use
2024-10-06T20:06:50.308814Z  INFO runtime: Tool [sql] ready to use
2024-10-06T20:06:50.308829Z  INFO runtime: Tool [list_datasets] ready to use
2024-10-06T20:06:50.921420Z  INFO runtime: Dataset taxi_trips registered (s3://spiceai-demo-datasets/taxi_trips/2024/), results cache enabled.
```

Configure the client app to use `Arrow Flight SQL ODBC Driver`.

<img width="800" alt="Example ODBC Client Configuration" src="/img/odbc/spice-odbc-example-config.png" />

Run a sample query, such as

```sql
SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;
```

<img width="800" alt="Example Query Results" src="/img/odbc/spice-odbc-example-query.png" />
