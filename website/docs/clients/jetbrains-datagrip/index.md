---
title: 'JetBrains DataGrip'
sidebar_label: 'JetBrains DataGrip'
description: 'Configure JetBrains Datagrip to query Spice via JDBC'
sidebar_position: 3
pagination_prev: 'clients/index'
pagination_next: null
---

1. Start the Spice runtime with a dataset loaded. Follow the [quickstart guide](/getting-started) to get started.

2. Download [JetBrains DataGrip](https://www.jetbrains.com/datagrip).

3. Download the [Apache Arrow Flight SQL JDBC driver](https://search.maven.org/search?q=a:flight-sql-jdbc-driver) - Select "Versions", tab click "Browse" on most recent version and then download `flight-sql-jdbc-driver-<version>.jar`.

4. Launch DataGrip

5. In Database Explorer menu, select "+" and choose "Driver"
   ![Data Sources and Drivers menu option](./img/datagrip-1.png 'Data Sources and Drivers menu option')

6. Add the JSBC jar file:

   1. Click the "+" button in "Driver Files" selection
   1. Click the "Custom JARs" button
   1. Choose the `flight-sql-jdbc-driver-<version>.jar` jar file (the file downloaded in step 3 above) - and click "Open"
   1. Click the "Class:" selector
   1. Select `org.apache.arrow.driver.jdbc.ArrowFlightJdbcDriver`
      ![Driver Class selector](./img/datagrip-3.png 'Driver Class selector')

7. Enter the driver settings:

   1. In the "Name" field - enter: `Apache Arrow Flight SQL`
   1. Add "URL Template" Default: `jdbc:arrow-flight-sql://{host}:{port}\?useEncryption=false&disableCertificateVerification=true`
   1. Click "Ok"
      ![Driver creation window](./img/datagrip-4.png 'Driver creation window')

8. Create a new Database Connection:
   1. In Database Explorer menu, select "+", choose "Data Source" > "Arrow Flight JDBC"
   2. Set the host to `localhost` and the port to `50051`
   3. In "Authentication" select "No auth"
   4. Click "Test Connection" to verify

![New Data Source](./img/datagrip-5.png 'New Data Source')

10. Run a query:
    1. Right-click on the connection in Database Explorer and choose "New" > "Query Console"
       ![Create new Query Console](./img/datagrip-6.png 'Create new Query Console')
    1. In the Console window - add a query - something like: `SELECT * FROM taxi_trips;` and click the triangle button to execute the SQL statement
    1. See the query results:
       ![Query Results](./img/datagrip-7.png 'Query Results')

DataGrip is now configured to query the Spice runtime using SQL! 🎉
