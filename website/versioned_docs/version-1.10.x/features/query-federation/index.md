---
title: 'Query Federation'
sidebar_label: 'Query Federation'
description: 'Learn how to use federated SQL queries in Spice.ai Open Source'
sidebar_position: 1
pagination_prev: null
pagination_next: null
---

Spice supports query federation, enabling you to join, combine, and query data using SQL from multiple sources, including databases (PostgreSQL, MySQL), data warehouses (Databricks, Snowflake, BigQuery), and data lakes (S3, MinIO).

![Spice.ai Open Source Query Federation](/img/features/query-federation.png)

For a full list of supported sources, see [Data Connectors](../components/data-connectors).

## Getting Started

To start using federated queries in Spice, follow these steps from the [Federated SQL Query](https://github.com/spiceai/cookbook/tree/trunk/federation#readme) cookbook recipe, which joins NYC taxi trips stored in S3 with taxi zone names stored in PostgreSQL:

**Step 1.** Install Spice by following the [installation instructions](../getting-started).

**Step 2.** Clone the Spice Cookbook repository and navigate to the `federation` directory.

```bash
git clone https://github.com/spiceai/cookbook.git
cd cookbook/federation
```

**Step 3.** Start a local PostgreSQL instance and load the NYC taxi zone lookup table. This step requires [Docker](https://docs.docker.com/get-docker/).

```bash
make
```

`make` starts PostgreSQL in Docker on host port `15432`, loads the `taxi_zones` table, and prints its row count:

```bash
 taxi_zones
------------
        265
(1 row)
```

**Step 4.** Store the PostgreSQL password. Run this command in the `federation` directory.

```bash
spice login postgres -p postgres
```

The password is written to a local `.env` file, which the Spice runtime reads on startup.

**Step 5.** Start the Spice runtime.

```bash
spice run
```

The recipe's `spicepod.yaml` defines four datasets:

| Dataset                  | Data                                                             |
| ------------------------ | ---------------------------------------------------------------- |
| `taxi_trips`             | 2,964,624 NYC yellow taxi trips, stored as Parquet in public S3 |
| `taxi_zones`             | NYC taxi zone lookup table, stored in PostgreSQL                 |
| `taxi_trips_accelerated` | `taxi_trips`, accelerated locally in memory with Arrow           |
| `taxi_zones_accelerated` | `taxi_zones`, accelerated locally in memory with Arrow           |

Wait for `Spice runtime is ready!` in the runtime output before querying. Loading the accelerated copy of `taxi_trips` takes several seconds, depending on network speed.

**Step 6.** In another terminal, start the Spice SQL REPL.

```bash
spice sql
```

Join trips in S3 with zone names in PostgreSQL to find the 10 busiest pickup zones. The trip data uses mixed-case column names, so `"PULocationID"` is quoted.

```sql
SELECT z.zone,
       z.borough,
       COUNT(*) AS trips,
       ROUND(AVG(t.fare_amount), 2) AS avg_fare,
       ROUND(AVG(t.tip_amount), 2) AS avg_tip
FROM taxi_trips t
JOIN taxi_zones z ON t."PULocationID" = z.location_id
GROUP BY z.zone, z.borough
ORDER BY trips DESC
LIMIT 10;
```

```bash
+------------------------------+-----------+--------+----------+---------+
|             zone             |  borough  |  trips | avg_fare | avg_tip |
|            varchar           |  varchar  |  int64 |  float64 | float64 |
+------------------------------+-----------+--------+----------+---------+
| JFK Airport                  | Queens    | 145240 | 59.4     | 8.86    |
| Midtown Center               | Manhattan | 143471 | 15.21    | 3.08    |
| Upper East Side South        | Manhattan | 142708 | 12.18    | 2.59    |
| Upper East Side North        | Manhattan | 136465 | 12.71    | 2.64    |
| Midtown East                 | Manhattan | 106717 | 14.79    | 3.02    |
| Times Sq/Theatre District    | Manhattan | 106324 | 17.54    | 3.3     |
| Penn Station/Madison Sq West | Manhattan | 104523 | 15.79    | 3.09    |
| Lincoln Square East          | Manhattan | 104080 | 13.43    | 2.79    |
| LaGuardia Airport            | Queens    | 89533  | 41.46    | 8.67    |
| Upper West Side South        | Manhattan | 88474  | 13.45    | 2.79    |
+------------------------------+-----------+--------+----------+---------+

Time: 4.922428459 seconds. 10 rows.
```

**Step 7.** Run the same join against the locally accelerated datasets.

```sql
SELECT z.zone,
       z.borough,
       COUNT(*) AS trips,
       ROUND(AVG(t.fare_amount), 2) AS avg_fare,
       ROUND(AVG(t.tip_amount), 2) AS avg_tip
FROM taxi_trips_accelerated t
JOIN taxi_zones_accelerated z ON t."PULocationID" = z.location_id
GROUP BY z.zone, z.borough
ORDER BY trips DESC
LIMIT 10;
```

The query returns the same 10 rows without contacting S3 or PostgreSQL:

```bash
Time: 0.022001709 seconds. 10 rows.
```

Query times vary between runs, and federated query times depend on network latency to S3.

**Step 8.** Stop the Spice runtime with `Ctrl+C`. Then stop PostgreSQL and remove its container and volume.

```bash
make clean
```

### Acceleration

The join in step 6 reads trips from S3 and zones from PostgreSQL at query time, so its response time includes network latency and data transfer.

Step 7 runs the same join against copies of both datasets materialized locally with [Data Accelerators](../../components/data-accelerators/index.md). Because the query reads only local data, it returns the same rows in milliseconds instead of seconds.

:::warning[Limitations]

- **Query Performance:** Without acceleration, federated queries will be slower than local queries due to network latency and data transfer.
- **Query Capabilities:** Not all SQL features and data types are supported across all data sources. More complex data type queries may not work as expected.

:::

## Related Topics

- [Distributed Query](distributed-query) - Scale queries across multiple nodes
- [Results Caching](caching) - Cache query results for improved performance
- [Arrow Flight SQL API](../api/arrow-flight-sql) - High-performance query protocol
- [ADBC](../api/adbc) - Arrow Database Connectivity
