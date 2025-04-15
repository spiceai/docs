---
title: 'Tableau'
sidebar_label: 'Tableau'
sidebar_position: 10
description: 'Use Tableau to to access, visualise and analyse datasets loaded in Spice.'
pagination_prev: 'clients/index'
pagination_next: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Use instructions below to install the **Spice.ai Tableau Connector** that enables [Tableau](https://www.tableau.com/) users to easily connect to and visualize data loaded in Spice.

> Tableau is the world's leading analytics platform. Tableau is the broadest and deepest end-to-end data and analytics platform. Ensure the responsible use of data and drive better business outcomes with fully integrated data management and governance, visual analytics and data storytelling, and collaboration – all with Salesforce’s industry-leading Einstein built right in.
>
> – [The Tableau platform](https://www.tableau.com/)

## Step 1. Install the Arrow Flight SQL JDBC Driver

[JDBC](https://docs.oracle.com/javase/tutorial/jdbc/basics/index.html) (Java Database Connectivity) is a standard interface for connecting to and interacting with databases. The Flight SQL driver is a JDBC driver implementation based on the [Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html) protocol. As Spice supports the Flight SQL protocol, the driver helps establish a connection between Tableau and Spice, enabling Tableau to execute queries and retrieve data from Spice efficiently.

Download the [flight-sql-jdbc-driver.jar](https://repo1.maven.org/maven2/org/apache/arrow/flight-sql-jdbc-driver/) file to the Tableau drivers folder:

<Tabs>
  <TabItem value="windows" label="Windows" default>
    **PowerShell Install Script**

    ```powershell
    Invoke-WebRequest -Uri "https://repo1.maven.org/maven2/org/apache/arrow/flight-sql-jdbc-driver/16.1.0/flight-sql-jdbc-driver-16.1.0.jar" -OutFile "C:\Program Files\Tableau\Drivers\flight-sql-jdbc-driver-16.1.0.jar"
    ```
  </TabItem>
  <TabItem value="macos" label="macOS">
    **Install Script**

    ```bash
    curl -L https://repo1.maven.org/maven2/org/apache/arrow/flight-sql-jdbc-driver/16.1.0/flight-sql-jdbc-driver-16.1.0.jar -o ~/Library/Tableau/Drivers/flight-sql-jdbc-driver-16.1.0.jar
    ```
  </TabItem>
  <TabItem value="linux" label="Linux">
    **Install Script**

    ```bash
    curl -L https://repo1.maven.org/maven2/org/apache/arrow/flight-sql-jdbc-driver/16.1.0/flight-sql-jdbc-driver-16.1.0.jar -o /opt/tableau/tableau_driver/jdbc/flight-sql-jdbc-driver-16.1.0.jar
    ```
  </TabItem>
</Tabs>

## Step 2. Install Spice.ai Tableau Connector

### Tableau Server

1. Download the latest `spiceai.taco` file from [Releases](https://github.com/spicehq/tableau-connector/releases)
2. Copy to the Tableau connectors directory

  <Tabs>
    <TabItem value="windows" label="Windows" default>
      **PowerShell Install Script**

      ```powershell
      Invoke-WebRequest -Uri "https://github.com/spicehq/tableau-connector/releases/latest/download/spiceai.taco" -OutFile "C:\Program Files\Tableau\Connectors\spiceai.taco"
      ```
    </TabItem>
    <TabItem value="linux" label="Linux">
      **Install Script**

      ```bash
      curl -L https://github.com/spicehq/tableau-connector/releases/latest/download/spiceai.taco -o /opt/tableau/connectors/spiceai.taco
      ```
    </TabItem>
  </Tabs>

3. Restart server: `tsm restart`

### Tableau Desktop

1. Download the latest `spiceai.taco` file from [Releases](https://github.com/spiceai/tableau-connector/releases)
2. Copy to the Tableau connectors directory

  <Tabs>
    <TabItem value="windows" label="Windows" default>
      **PowerShell Install Script**

      ```powershell
      Invoke-WebRequest -Uri "https://github.com/spicehq/tableau-connector/releases/latest/download/spiceai.taco" -OutFile "C:\Users\[USERNAME]\Documents\My Tableau Repository\Connectors\spiceai.taco"
      ```
    </TabItem>
    <TabItem value="macos" label="macOS">
      **Install Script**

      ```bash
      curl -L https://github.com/spicehq/tableau-connector/releases/latest/download/spiceai.taco -o ~/Documents/My\ Tableau\ Repository/Connectors/spiceai.taco
      ```
    </TabItem>
    <TabItem value="linux" label="Linux">
      **Install Script**

      ```bash
      curl -L https://github.com/spicehq/tableau-connector/releases/latest/download/spiceai.taco -o /opt/tableau/connectors/spiceai.taco
      ```
    </TabItem>
  </Tabs>

## Configure a Spice connection

1. Open **Tableau**
2. In the **Connect** column, under **To a Server**, select **Spice by Spice.ai, Inc**.
3. Configure a Spice connection to **Spice.ai OSS Self-Hosted** instance or to **Spice Cloud Platform**.
  <img width="400" src="/img/tableau/tableau-spice-dialog.png" alt="Spice Tableau Connection Dialog" />

4. Click **Sign In**

## Working with Spice datasets

After establishing a connection, Spice datasets appear under their respective schemas, with the default schema being `spice.public`.  When writing queries, use the `PostgreSQL` dialect, as Spice is built on this standard.

<img width="800" src="/img/tableau/tableau-spice-example.png" alt="Spice Tableau Example"/>
