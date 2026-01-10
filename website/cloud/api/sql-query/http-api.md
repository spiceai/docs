---
description: Query with SQL via the HTTP API
---

# HTTP API

Data may be queried by posting SQL to the `/v1/sql` API and `/v1/firesql` API for Firecached data. For documentation on the Spice Firecache see [Broken link](# "mention").

See [Tables](#) for a list of tables to query or browse the example queries listed in the menu.

#### Requirements and limitations

* An API key is required for all SQL queries.
* Results are limited to 500 rows. Use the [Apache Arrow Flight API](apache-arrow-flight-api.md) to fetch up to 1M rows in a single query or the [Async HTTP API](#) to fetch results with paging.
* Requests are limited to 90 seconds.

**POST /v1/sql**

Refer to the [API documentation](/cloud/api) for details.
