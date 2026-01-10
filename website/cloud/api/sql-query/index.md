---
description: SQL Query (Cloud Data Warehouse) API
---

# SQL Query API

The SQL Query API provides powerful capabilities for querying data managed by the Spice.ai Cloud Data Warehouse and connected external data sources using federated SQL queries. Results can be fetched through either the high-performance Apache Arrow Flight API or a standard HTTP API.

### Production Query Endpoints

#### Apache Arrow Flight API

For production use, leverage the high-performance Apache Arrow Flight API, which is optimized for large-scale data workloads. The Spice SDKs default to querying via Arrow Flight.

• Endpoint: `grpc+tls://flight.spiceai.io`

• For additional details, refer to the [Apache Arrow Flight API documentation](apache-arrow-flight-api.md).

#### HTTP API

The SQL Query API is also accessible via HTTP, offering standard integration for web applications.

• Core Endpoint: `https://data.spiceai.io/v1/sql`

• For more details, consult the [HTTP SQL API documentation](http-api.md).



