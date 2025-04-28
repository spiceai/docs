---
title: 'Prepared Statements'
sidebar_label: 'Prepared Statements'
pagination_prev: 'reference/sql/subqueries'
pagination_next: 'reference/sql/explain'
sidebar_position: 4
---

## Inferred Types

When a parameter type is not explicitly specified in a prepared statement, the type is inferred at execution time based on the provided argument. This approach helps simplify statement definitions and supports flexible query execution.

**SQL Example**

To create a prepared statement named `greater_than` that infers the type of its parameter:

```sql
PREPARE greater_than AS SELECT * FROM example WHERE a > $1;
```

To execute the prepared statement with an integer argument:

```sql
EXECUTE greater_than(20);
```

**Python Example**

```python
import adbc_driver_flightsql.dbapi

with adbc_driver_flightsql.dbapi.connect("grpc://localhost:50051") as conn:
    with conn.cursor() as cur:
        cur.execute("PREPARE greater_than AS SELECT * FROM example WHERE a > $1;")
        cur.execute("EXECUTE greater_than(?)", (20,))
        result = cur.fetchall()
        print(result)
```

## Positional Arguments

Prepared statements can use positional arguments to support multiple parameters. Each parameter is referenced by its position in the statement.

**SQL Example**

To create a prepared statement named `greater_than` with two parameters:

```sql
PREPARE greater_than(INT, DOUBLE) AS SELECT * FROM example WHERE a > $1 AND b > $2;
```

To execute the prepared statement with integer and double arguments:

```sql
EXECUTE greater_than(20, 23.3);
```

**Python Example**

```python
import adbc_driver_flightsql.dbapi

with adbc_driver_flightsql.dbapi.connect("grpc://localhost:50051") as conn:
    with conn.cursor() as cur:
        cur.execute("PREPARE greater_than(INT, DOUBLE) AS SELECT * FROM example WHERE a > $1 AND b > $2;")
        cur.execute("EXECUTE greater_than(?, ?)", (20, 23.3))
        result = cur.fetchall()
        print(result)
```
