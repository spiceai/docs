---
title: 'Prepared Statements'
sidebar_label: 'Prepared Statements'
sidebar_position: 4
---

:::info
Spice is built on [Apache DataFusion](https://datafusion.apache.org/) and uses the PostgreSQL dialect, even when querying datasources with different SQL dialects.
:::

## Positional Arguments

Prepared statements bind parameter values to a query when it runs. Each parameter is referenced by its position in the statement, as `$1`, `$2`, and so on, or as `?`. Spice supports two ways to use them:

- **Flight SQL parameter binding.** An [Arrow Flight SQL](../../api/arrow-flight-sql) client, such as ADBC, prepares a query that contains placeholders and sends the values with each execution. This needs no session setup.
- **SQL `PREPARE` and `EXECUTE`.** The statement is named with `PREPARE` and run later with `EXECUTE`. It is stored in a Flight SQL session, so it is only available to later requests in the same session.

### Flight SQL Parameter Binding

Pass the parameter values with the query:

```python
import adbc_driver_flightsql.dbapi

with adbc_driver_flightsql.dbapi.connect("grpc://localhost:50051") as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM example WHERE a > ? AND b > ?", (20, 23.3))
        result = cur.fetchall()
        print(result)
```

### SQL PREPARE and EXECUTE

To create a prepared statement named `greater_than` with two parameters:

```sql
PREPARE greater_than(INT, DOUBLE) AS SELECT * FROM example WHERE a > $1 AND b > $2;
```

To execute the prepared statement with integer and double arguments:

```sql
EXECUTE greater_than(20, 23.3);
```

A prepared statement belongs to the session that created it. A Flight SQL client starts a session with a Flight `Handshake` call. The runtime returns a session ID in the response and in the `x-session-id` response header. The client then sends that ID in the `x-session-id` header on each later request. Sessions expire after one hour of inactivity.

A request that carries no session ID, including every HTTP [`/v1/sql`](../../api/HTTP/post-sql) request, runs in a new context that does not keep the statement. Running `PREPARE` and `EXECUTE` as two separate requests without a session fails on the `EXECUTE`:

```text
Prepared statement 'greater_than' does not exist
```

To run a parameterized query without managing a session, use [Flight SQL parameter binding](#flight-sql-parameter-binding).

:::warning[Limitations]

- Positional arguments are not supported with the `date` keyword to construct a date value, like `date $1`. Specify the date value in the query instead: `l_shipdate > date '1995-01-01'`.

:::
