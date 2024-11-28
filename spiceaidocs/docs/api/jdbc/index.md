---
title: 'JDBC: Java Database Connectivity'
sidebar_label: 'JDBC'
sidebar_position: 2
description: 'JDBC API Documentation'
pagination_prev: null
pagination_next: null
---

[JDBC](https://docs.oracle.com/javase/tutorial/jdbc/basics/index.html) (Java Database Connectivity) is a standard API for connecting to and interacting with databases.

Spice supports JDBC clients through a JDBC driver implementation based on the [Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html) protocol. This enables any JDBC-compatible application to connect to Spice, execute queries, and retrieve data.

## Download and install the Flight SQL JDBC driver

### Download the Flight SQL JDBC driver

- Find the appropriate [Flight SQL JDBC driver](https://central.sonatype.com/artifact/org.apache.arrow/flight-sql-jdbc-driver/versions) version.
- Click **Browse** next to the version you want to download
- Click the `flight-sql-jdbc-driver-XX.XX.XX.jar` file (with only the `.jar` file extension) from the list of files to download the driver jar file

### Add the driver to your application

Follow the instructions specific to your application for adding a custom JDBC driver. Examples:

**Tableau**:

- Windows: `C:\Program Files\Tableau\Drivers`
- Mac: `~/Library/Tableau/Drivers`
- Linux: `/opt/tableau/tableau_driver/jdbc`
- Start or restart Tableau

[Full instruction](/clients/tableau)

**JetBrains DataGrip**:

- In Database Explorer menu, select "+" and choose "Driver"
- Follow the steps to add the JDBC `.jar` file

[Full instruction](/clients/jetbrains-datagrip)

**DBeaver**:

- In the DBeaver application menu bar, open the "Database" menu and choose: "Driver Manager"
- Click the "New" button and follow instructions to add JDBC `.jar` file.

[Full instruction](/clients/DBeaver)

## Configure JDBC connection

1. Use the following configuration settings:

- **URL**: `jdbc:arrow-flight-sql://{host}:{port}`
- **Dialect**: `PostgreSQL`

For example:
<img width="400" src="/img/tableau/tableau-jdbc-conn.png"/>

1. **Ensure Spice is running**
1. Click **Connect**

:::info

Spice has [TLS support](/api/tls). For testing or non-production use cases for Spice without TLS, the following JDBC connection URL will bypass TLS `jdbc:arrow-flight-sql://{host}:{port}?useEncryption=false&disableCertificateVerification=true`.

:::

### Authentication

If [API Key authentication](../../api/auth/index.md) is enabled, the API key can be provided in the JDBC connection URL as a query parameter:

`jdbc:arrow-flight-sql://{host}:{port}?user=&password=<enter-api-key-here>`

Replace `<enter-api-key-here>` with the API key value. The `user` and `password` parameters are required by the JDBC driver, but only the `password` parameter is used for the API key.

## Execute Test Query

In the configured application, run a sample query, such as `SELECT * FROM taxi_trips;`

![Query Results](https://imagedelivery.net/HyTs22ttunfIlvyd6vumhQ/0e9f3c0f-2e03-47f9-8d5e-65e078d7e900/public 'Query Results')
