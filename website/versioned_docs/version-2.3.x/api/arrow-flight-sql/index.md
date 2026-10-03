---
title: 'Arrow Flight SQL API'
sidebar_label: 'Arrow Flight SQL'
sidebar_position: 4
desired_sidebar: api
description: 'Query Spice using JDBC/ODBC/ADBC'
tags:
  - api
  - arrow-flight-sql
  - sql
  - jdbc
  - odbc
---

[Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html) is a protocol for interacting with SQL databases using the Arrow in-memory format and the Flight RPC framework.

Spice implements the Flight SQL protocol, enabling querying of the datasets configured in Spice via tools that support connecting via one of the Arrow Flight SQL drivers, such as [DBeaver](https://dbeaver.io), [Tableau](https://www.tableau.com/), or [Power BI](https://www.microsoft.com/en-us/power-platform/products/power-bi).

<img src="https://imagedelivery.net/HyTs22ttunfIlvyd6vumhQ/0a8bc474-03c3-4c1c-8003-d250cd52b300/public" alt="arrow flight and spice" />

## Authentication

API Key authentication is supported for the Arrow Flight SQL endpoint. For more details, see [API Key Authentication](auth).

## Correlation IDs

Send a `spice-trace-id` gRPC metadata entry with a 32-character hexadecimal ID to set the trace ID for a query. The runtime records it in the `trace_id` column of [`runtime.task_history`](../reference/task_history#correlating-requests-with-spice-trace-id), and returns the query's trace ID in `spice-trace-id` response metadata.

With ADBC, set the header through the `adbc.flight.sql.rpc.call_header.` option prefix:

```python
import adbc_driver_flightsql.dbapi as flightsql

conn = flightsql.connect("grpc://localhost:50051", db_kwargs={
    "adbc.flight.sql.rpc.call_header.spice-trace-id": "7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c",
})
cur = conn.cursor()
cur.execute("SELECT count(*) FROM taxi_trips")
print(cur.fetchall())
```

With PyArrow Flight, pass it as a call header:

```python
import pyarrow.flight as flight

client = flight.FlightClient("grpc://localhost:50051")
options = flight.FlightCallOptions(headers=[(b"spice-trace-id", b"5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a")])
info = client.get_flight_info(flight.FlightDescriptor.for_command(b"SELECT count(*) FROM taxi_trips"), options)
print(client.do_get(info.endpoints[0].ticket, options).read_all())
```
