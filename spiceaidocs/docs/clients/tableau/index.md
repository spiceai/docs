---
title: 'Tableau'
sidebar_label: 'Tableau'
sidebar_position: 10
description: 'Use Tableau to to access, visualise and analyse datasets loaded in Spice.'
pagination_prev: 'clients/index'
pagination_next: null
---

Use [Tableau](https://www.tableau.com/) to access, visualise and analyse datasets loaded in Spice.

> The world's leading analytics platform. Tableau is the broadest and deepest end-to-end data and analytics platform. Ensure the responsible use of data and drive better business outcomes with fully integrated data management and governance, visual analytics and data storytelling, and collaboration – all with Salesforce’s industry-leading Einstein built right in.
>
> – [The Tableau platform](https://www.tableau.com/)

## Install Tableau Desktop

Download and install [Tableau Desktop](https://www.tableau.com/products/desktop/download).

## Download and install the Flight SQL JDBC driver

[JDBC](https://docs.oracle.com/javase/tutorial/jdbc/basics/index.html) (Java Database Connectivity) is a standard way to connect to, and interact with a database. The Flight SQL driver is a JDBC driver implementation that utilizes the underlying [Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html) protocol, allowing any program that connects via JDBC to seamlessly connect and interact with databases that support Flight SQL. Because Spice supports Flight SQL, this driver acts as a bridge, enabling Tableau to establish a connection with Spice, execute queries, and retrieve data.

1. **Download the Flight SQL JDBC driver**

- Visit the [Flight SQL JDBC driver](https://central.sonatype.com/artifact/org.apache.arrow/flight-sql-jdbc-driver/) page
- Select the **Versions** tab
- Click **Browse** next to the version you want to download
- Click the `flight-sql-jdbc-driver-XX.XX.XX.jar` file (with only the `.jar` file extension) from the list of files to download the driver jar file

2. **Copy the downloaded jar file into the following directory based on your operating system**

- Windows: `C:\Program Files\Tableau\Drivers`
- Mac: `~/Library/Tableau/Drivers`
- Linux: `/opt/tableau/tableau_driver/jdbc` - Start or restart Tableau

## Configure a Spice connection

1. Open **Tableau**
2. In the **Connect** column, under **To a Server**, select **Other Databases (JDBC)**.
3. Provide the following configuration:

- **URL**: `jdbc:arrow-flight-sql://127.0.0.1:50051?useEncryption=false`
- **Dialect**: `PostgreSQL`
  <img width="400" src="/img/tableau/tableau-jdbc-conn.png" />

4. Ensure Spice is running
5. Click **Sign In**

## Working with Spice datasets

Once connected, Spice datasets will be listed under the `datafusion.public` schema.

:::note

Tableau support is currently in alpha, and not all functionality is supported. Use **New Custom SQL** to start working with Spice datasets as shown below.

:::

<img width="800" src="/img/tableau/tableau-tables-list.png" />

<img width="800" src="/img/tableau/tableau-custom-sql.png" />

<img width="800" src="/img/tableau/tableau-spice-chart.png" />
