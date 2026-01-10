# Limitations

:::info
For higher limits, contact Spice AI support.
:::

Spice.ai Cloud has a number of limitations, including:

#### Global API Limits

* 10 apps per account.
* 10 request-per-second (rps).
* 90-second request/query timeout.
* 500 row limit for HTTP API results (use the [Apache Arrow API](api/sql-query/apache-arrow-flight-api.md) for unlimited results).

#### Guest API Limits - No API Key

* 4 request-per-minute SQL API limit.
* 10 row result limit.

#### **Apache Flight Endpoint**

* API Key (provided as gRPC password) is required.

#### **SQL Query Limits**

* 3 concurrent requests.
