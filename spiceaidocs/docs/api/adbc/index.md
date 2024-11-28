---
title: 'ADBC: Arrow Database Connectivity'
sidebar_label: 'ADBC'
sidebar_position: 2
description: 'ADBC API Documentation'
pagination_prev: null
pagination_next: null
---

[ADBC](https://arrow.apache.org/adbc) is a set of APIs and libraries for Arrow-native access to databases.

Spice supports ADBC clients using the [FlightSQL driver](https://arrow.apache.org/adbc/current/driver/flight_sql.html).

## Quickstart

Get started with ADBC using Python.

### Installation

Start a Python environment.

```shell
python
```

Install the ADBC driver manager, FlightSQL driver, and PyArrow.

```python
pip install adbc_driver_manager adbc_driver_flightsql pyarrow
```

### Create a connection to Spice over ADBC

```python
>>> import adbc_driver_flightsql.dbapi
>>> conn = adbc_driver_flightsql.dbapi.connect('grpc://localhost:50051')
```

### Create a cursor

```python
>>> cursor = conn.cursor()
```

### Executing a query

DBAPI interface:

```python
>>> cursor.execute("SELECT 1, 2.0, 'Hello, world!'")
>>> cursor.fetchone()
(1, 2.0, 'Hello, world!')
>>> cursor.execute("SHOW TABLES")
>>> cursor.fetchall()
[('spice', 'public', 'messages', 'BASE TABLE'), ('spice', 'runtime', 'task_history', 'BASE TABLE'), ('spice', 'information_schema', 'tables', 'VIEW'), ('spice', 'information_schema', 'views', 'VIEW'), ('spice', 'information_schema', 'columns', 'VIEW'), ('spice', 'information_schema', 'df_settings', 'VIEW'), ('spice', 'information_schema', 'schemata', 'VIEW')]
```

Arrow:

```python
>>> cursor.execute("SELECT 1, 2.0, 'Hello, world!'")
>>> cursor.fetch_arrow_table()
pyarrow.Table
1: int64
2.0: double
'Hello, world!': string
----
1: [[1]]
2.0: [[2]]
'Hello, world!': [["Hello, world!"]]
```
