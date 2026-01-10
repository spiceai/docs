---
description: Federated SQL Query documentation
---

# Federated SQL Query

![image](/img/cloud/Spice.ai Federation and Acceleration .png)

Spice supports federated queries, enabling you to join and combine data from multiple sources, including databases (PostgreSQL, MySQL), data warehouses (Databricks, Snowflake, BigQuery), and data lakes (S3, MinIO). For a full list of supported sources, see [Data Connectors](https://docs.spiceai.org/components/data-connectors).

## SQL Query

### Playground SQL Explorer

The Playground SQL Explorer is the fastest way to get started with federated queries, debugging queries, and iterating quickly. The SQL Query Editor be accessed by clicking on the **SQL Explorer** tab after selecting **Playground** in the app navigation bar.

![The Playground SQL Query Editor.](/img/cloud/CleanShot%202026-01-09%20at%2000.43.27@2x.png)

*The Playground SQL Query Editor.*

See [sql-query-editor.md](../portal/playground/sql-query-editor.md "mention") for further documentation on using the SQL Query Editor.

### Apache Arrow Flight API

For production applications, leveraging the high-performance [Apache Arrow Flight](../api/sql-query/apache-arrow-flight-api.md) endpoint is recommended. The Spice SDKs always query using Arrow Flight.

See [apache-arrow-flight-api.md](../api/sql-query/apache-arrow-flight-api.md "mention") for further documentation on using Apache Arrow Flight APIs.

### HTTP API

SQL Query is also accessible via a standard HTTP API.

See [http-api.md](../api/sql-query/http-api.md "mention") for further documentation on using the HTTP SQL API.
