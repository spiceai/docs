---
description: Connect external data sources to Spice.ai
hidden: true
---

# External Data Sources

Access and query external data sources in addition to community datasets including the ability to execute SQL joins across both by [creating custom datasets](datasets-and-views.md).

External Data Sources initially supports connecting to [PostgreSQL](https://www.postgresql.org/) and [MySQL](https://www.mysql.com/) with more data sources coming soon.

### Adding an External Data Source

External Data Sources are added and managed through [organizations](organizations.md) and are available to all Spice applications within the organization. They are private and are not visible or accessible to applications in other organizations.

Navigate to the organization's **Settings** and then the **Data Sources** section.

![Adding a new External Data Source to Spice.ai](/img/cloud/Screenshot%202023-10-26%20at%2012.38.12%20AM.png)

*Adding a new External Data Source to Spice.ai*

Click **Add Data Source** to show the **New Data Source** dialog.

![List of available External Data Sources.](/img/cloud/Screenshot%202023-11-29%20at%203.22.26 PM.png)

*List of available External Data Sources.*

Select the data source and then complete the required connection details.

![Adding a PostgreSQL Data Source.](/img/cloud/Screenshot%202023-10-26%20at%204.55.03%20PM.png)

*Adding a PostgreSQL Data Source.*

Once the data source is connected the data source will be made available through its **name**, which will be the schema name for SQL queries. E.g. naming the data source connection "**mydb**" will enable selecting tables with the SQL `SELECT * FROM`` `**`mydb`**`.{table}.`, click the vertical dots to the right of the connection to edit or delete it.

To edit or delete the data source, click the vertical ellipses menu.

![Managing an existing data source](/img/cloud/Screenshot%202023-10-26%20at%204.59.58%20PM.png)

*Managing an existing data source*
