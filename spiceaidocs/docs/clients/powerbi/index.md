---
title: 'Power BI'
sidebar_label: 'Power BI'
sidebar_position: 10
description: 'Use Microsoft Power BI to access, visualise and analyse datasets loaded in Spice.'
pagination_prev: 'clients/index'
pagination_next: null
---

Use [Microsoft Power BI](https://www.microsoft.com/en-us/power-platform/products/power-bi) to access, visualise and analyse datasets loaded in Spice.

## Install Power BI Desktop

Download and install [Power BI Desktop](https://powerbi.microsoft.com/en-us/desktop/).

## Download and install the Arrow Flight SQL ODBC driver

ODBC (Open Database Connectivity) is low-level, high-performance interface that is designed specifically for relational data stores as a standard way to connect to, and interact with a database. The Flight SQL ODBC driver is an ODBC driver implementation that utilizes the underlying [Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html) protocol, allowing any program that connects via ODBC to seamlessly connect and interact with databases that support Flight SQL. Because Spice supports Flight SQL, this driver acts as a bridge, enabling Power BI to establish a connection with Spice, execute queries, and retrieve data.

 - Download the Windows 64-bit version of the driver from the [ODBC driver download page](https://www.dremio.com/drivers/odbc/).
 - Run the installer.
 - (Optional) In the **User Account Control page**, click **Yes**. This page appears only if there is user account control configured on your Windows machine.
 - Click **Install**.
 - In the **Installation Complete** page, click **Next**.
 - In the **Completing Arrow Flight SQL ODBC Driver Setup Wizard** page, click **Finish**.

## Configure a Spice connection

 - Open **Power BI Desktop**
 - Click **Get Data**, then select **More** > **ODBC** category. 
 - Click **Connect**.
 - Select **Arrow Flight SQL ODBC DSN**.
 - Expand **Advanced options**:
 - **Connection string**: `host=spiceai_host;port=50051;useEncryption=false`
<img width="400" src="/img/powerbi/pbi-odbc-conn.png" />
 - Ensure Spice is running
 - Click **OK**
