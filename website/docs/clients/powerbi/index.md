---
title: 'Power BI'
sidebar_label: 'Microsoft Power BI'
sidebar_position: 11
description: 'Use Microsoft Power BI to access, visualize and analyze Spice datasets.'
pagination_prev: 'clients/index'
pagination_next: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Use the instructions below to get started with the **[Spice.ai Power BI Connector](https://github.com/spiceai/powerbi-connector)**—an [ADBC](https://github.com/apache/arrow-adbc)-based connector that enables [Microsoft Power BI](https://www.microsoft.com/en-us/power-platform/products/power-bi) users to easily connect to and visualize data loaded in [Spice.ai Enterprise](https://spiceai.org/) and [Spice Cloud Platform](https://spice.ai/) instances.

## Manual Connector Installation

### Tableau Desktop

1. Download the latest `spice_adbc.mez` file from the [releases page](https://github.com/spiceai/powerbi-connector/releases)
2. Copy to your Power BI `Custom Connectors` directory: `C:\Users\[USERNAME]\Documents\Microsoft Power BI Desktop\Custom Connectors`

    ```powershell
    Invoke-WebRequest -Uri "https://github.com/spiceai/powerbi-connector/releases/latest/download/spice_adbc.mez" -OutFile "C:\Users\[USERNAME]\Documents\Microsoft Power BI Desktop\Custom Connectors\spice_adbc.mez"
    ```

3. [Enable Uncertified Connectors](https://learn.microsoft.com/en-us/power-bi/connect-data/desktop-connector-extensibility#custom-connectors) in Power BI Desktop settings and restart Power BI Desktop.

## Adding Spice as a Data Source

1. Open Power BI Desktop.
2. Click on `Get Data` → `More...`.
3. In the dialog, select `Spice.ai` connector.

   <img width="748" alt="Spice.ai connector" src="/img/powerbi/powerbi-spice-connector.png" />

4. Click `Connect`.
5. Enter the **ADBC (Arrow Flight SQL) Endpoint**:
    - For Spice Cloud Platform:  
      `grpc+tls://flight.spiceai.io:443`  
      *(Use the region-specific address if applicable.)*
    - For on-premises/self-hosted Spice.ai:
        - Without TLS (default): `grpc://<server-ip>:50051`
        - With TLS: `grpc+tls://<server-ip>:50051`

<img width="748" alt="Spice.ai Connection Dialog" src="/img/powerbi/powerbi-spice-connection-dlg.png" />

6. Select the `Data Connectivity` mode:
    - **Import**: Data is loaded into Power BI, enabling extensive functionality but requiring periodic refreshes and sufficient local memory to accommodate the dataset.
    - **DirectQuery**: Queries are executed directly against Spice in real-time, providing fast performance even on large datasets by leveraging Spice's optimized query engine.
7. Click `OK`.
8. Select `Authentication` option:
    - **Anonymous**: Select for unauthenticated on-premises deployments.
    - **API Key**: Your Spice.ai API key for authentication (required for Spice Cloud). Follow the [guide](https://docs.spice.ai/portal/apps/api-keys) to obtain it from the Spice Cloud portal.
  
<img width="748" alt="Spice.ai Authentication" src="/img/powerbi/powerbi-spice-auth-dlg.png" />

9. Click `Connect` to establish the connection.

## Working with Spice datasets

After establishing a connection, Spice datasets appear under their respective schemas, with the default schema being `spice.public`.  When writing native queries, use the `PostgreSQL` dialect, as Spice is built on this standard.

<img width="800" src="/img/powerbi/powerbi-spice-example.png" alt="Spice PowerBI Example"/>


## Supported Data Types

The following Apache Arrow / DataFusion SQL types are supported. Other types will result in a `Unable to understand the type for column` error. Please [report an issue](https://github.com/spiceai/powerbi-connector/issues) if support for additional types is required.

| Arrow Type                                                    | DataFusion SQL Type | Power Query M Type |
|---------------------------------------------------------------|---------------------|--------------------|
| Boolean                                                       | BOOLEAN             | Logical            |
| Int16                                                         | SMALLINT            | Int16              |
| Int32                                                         | INTEGER             | Int32              |
| Int64                                                         | BIGINT              | Int64              |
| Float32                                                       | REAL                | Single             |
| Float64                                                       | DOUBLE              | Double             |
| Decimal128 / Decimal256                                       | DECIMAL             | Decimal            |
| Utf8                                                          | VARCHAR             | Text               |
| Date32 / Date64                                               | DATE                | Date               |
| Time32 / Time64                                               | TIME                | Time               |
| Timestamp                                                     | TIMESTAMP           | DateTime           |
| List / LargeList / FixedSizeList / ListView / LargeListView   | ARRAY               | Text               |
| Interval                                                      | INTERVAL            | Text               |
| Struct                                                        | STRUCT              | Text               |

## Limitations

### LargeUtf8 Data Type Is Not Supported

To work around this limitation, use [views](https://spiceai.org/docs/components/views) to manually convert `LargeUtf8` columns to `Utf8` by casting them with `::TEXT`.

**Example:**

```yaml
views:
    - name: taxi_zone_lookup
        sql: |
            SELECT
                LocationID as LocationID,
                Borough::TEXT as Borough,
                Zone::TEXT as Zone,
                service_zone::TEXT as service_zone
            FROM taxi_zone_lookup_temp;
```

### Date Time Arithmetic Operations Are Not Supported

Due to lack of support for the `timestampdiff` function in the [DataFusion query engine](https://datafusion.apache.org/user-guide/sql/scalar_functions.html), date and time arithmetic operations—such as subtracting or adding timestamps and intervals—are not supported and will result in an error similar to `Invalid function 'timestampdiff'.\nDid you mean 'to_timestamp'? (Internal; ExecuteQuery)`. For example:

```text
(parameter) =>
let
    Sorted = Table.Sort(parameter[taxi_table], {"RecordID"}),
    T2 = Table.SelectColumns(Sorted, {"PULocationID","lpep_pickup_datetime"}),
    T3 = Table.Sort(T2, {"PULocationID"}),
    T4 = Table.AddColumn(T3, "Diff1", each [lpep_pickup_datetime] - #datetime(1999,1,5,0,0,0))
    TA = Table.FirstN(T6, 4)
in
    TA
```

```text
ADBC: InternalError [] [FlightSQL] [FlightSQL] Error during planning: Invalid function 'timestampdiff'.\nDid you mean 'to_timestamp'? (Internal; ExecuteQuery)
```

Please [report an issue](https://github.com/spiceai/powerbi-connector/issues) if support for date or time arithmetic operations is required.