---
title: 'ScyllaDB Data Connector'
sidebar_label: 'ScyllaDB Data Connector'
description: 'ScyllaDB Data Connector Documentation'
tags:
  - data-connectors
  - scylladb
---

The ScyllaDB Data Connector enables federated SQL queries on data stored in [ScyllaDB](https://www.scylladb.com/) clusters using CQL (Cassandra Query Language).

```yaml
datasets:
  - from: scylladb:users
    name: users
    params:
      scylladb_host: localhost
      scylladb_port: 9042
      scylladb_keyspace: my_app
```

## Configuration

### `from`

The `from` field takes the form `scylladb:{table_name}` where `table_name` is the table identifier in the ScyllaDB keyspace to read from.

```yaml
datasets:
  - from: scylladb:users
    name: users
    params:
      scylladb_keyspace: my_app
      ...
```

### `name`

The dataset name. This will be used as the table name within Spice.

Example:

```yaml
datasets:
  - from: scylladb:users
    name: app_users
    params: ...
```

```sql
SELECT COUNT(*) FROM app_users;
```

```shell
+----------+
| count(*) |
+----------+
| 6001215  |
+----------+
```

The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords).

### `params`

The ScyllaDB data connector can be configured by providing the following `params`. Use the [secret replacement syntax](../secret-stores) to load the secret from a secret store, e.g. `${secrets:scylladb_pass}`.

| Parameter Name        | Description                                                        | Required | Default |
| --------------------- | ------------------------------------------------------------------ | -------- | ------- |
| `scylladb_host`       | Hostname(s) of ScyllaDB nodes. Comma-separated for multiple nodes. Either `scylladb_host` or `scylladb_hosts` must be provided. | Yes*     | -       |
| `scylladb_hosts`      | Alternative to `scylladb_host`. Comma-separated list of hostnames. Either `scylladb_host` or `scylladb_hosts` must be provided. | Yes*     | -       |
| `scylladb_port`       | ScyllaDB CQL native transport port.                                | No       | `9042`  |
| `scylladb_keyspace`   | The keyspace to use for queries.                                   | Yes      | -       |
| `scylladb_user`       | Username for authentication.                                       | No       | -       |
| `scylladb_pass`       | Password for authentication.                                       | No       | -       |
| `scylladb_datacenter` | Preferred datacenter for connection routing.                       | No       | -       |
| `scylladb_ssl`        | Enable SSL/TLS for connections. Not yet implemented — the parameter is accepted but has no effect. | No       | -       |
| `connection_timeout`  | Connection timeout in milliseconds.                                | No       | `10000` |

## Types

The table below shows the CQL data types supported, along with the type mapping to Apache Arrow types in Spice.

| CQL Type                        | Arrow Type                     | Notes                                 |
| ------------------------------- | ------------------------------ | ------------------------------------- |
| `boolean`                       | `Boolean`                      |                                       |
| `tinyint`                       | `Int8`                         |                                       |
| `smallint`                      | `Int16`                        |                                       |
| `int`                           | `Int32`                        |                                       |
| `bigint`                        | `Int64`                        |                                       |
| `counter`                       | `Int64`                        | Cassandra counter type                |
| `float`                         | `Float32`                      |                                       |
| `double`                        | `Float64`                      |                                       |
| `decimal`                       | `Decimal128(38, 2)`            | Arbitrary precision → fixed precision |
| `blob`                          | `Binary`                       |                                       |
| `date`                          | `Date32`                       | Days since epoch                      |
| `timestamp`                     | `Timestamp(Millisecond, None)` | Milliseconds since epoch              |
| `time`                          | `Timestamp(Microsecond, None)` | Time of day                           |
| `text`, `varchar`, `ascii`      | `Utf8`                         |                                       |
| `uuid`, `timeuuid`              | `Utf8`                         | String representation                 |
| `inet`                          | `Utf8`                         | IP address as string                  |
| `varint`                        | `Utf8`                         | Arbitrary precision integer as string |
| `duration`                      | `Utf8`                         | ISO 8601 duration string              |
| `list<T>`, `set<T>`, `map<K,V>` | `Utf8`                         | JSON string representation            |
| `tuple<...>`                    | `Utf8`                         | String representation                 |
| `frozen<T>`                     | `Utf8`                         | Same as underlying collection         |
| User-Defined Types              | `Utf8`                         | String representation                 |

### Decimal Handling

CQL `decimal` is an arbitrary-precision type, while Arrow `Decimal128` has a maximum precision of 38 digits. The connector uses:

- **Precision**: 38 (maximum for Decimal128)
- **Scale**: 2 (suitable for monetary/financial data)

For decimals that exceed this precision, values may be truncated or rounded.

### Date/Time Handling

- **CQL `date`**: Stored as days since epoch with a 2^31 offset. Converted to Arrow `Date32` (signed days since 1970-01-01).
- **CQL `timestamp`**: Milliseconds since Unix epoch. Directly mapped to Arrow `Timestamp(Millisecond)`.
- **CQL `time`**: Nanoseconds since midnight. Converted to Arrow `Timestamp(Microsecond)` with nanosecond truncation.

## Query Execution

The connector pushes down partition key and clustering key filters to CQL where possible. Filters that CQL cannot express are evaluated locally by DataFusion after data retrieval. Joins, aggregations, and other SQL operations are always performed locally.

### Filter Pushdown

The following filters are pushed down to ScyllaDB:

| Filter type | Operators | Pushdown behavior |
| --- | --- | --- |
| Partition key equality | `=` | Always pushed down (Exact) |
| Clustering key comparison | `=`, `<`, `<=`, `>`, `>=` | Pushed down when a partition key equality filter is present (Inexact) |
| Regular column filters | Any | Not pushed down — evaluated locally by DataFusion |
| OR conditions, complex expressions | Any | Not pushed down — evaluated locally by DataFusion |

Clustering key filters are marked as **Inexact**, meaning DataFusion re-checks them after retrieval to ensure correctness.

### CQL vs SQL

CQL lacks many SQL constructs, which is why most filter types cannot be pushed down:

| Feature          | SQL | CQL |
| ---------------- | --- | --- |
| CASE WHEN        | ✅   | ❌   |
| Subqueries       | ✅   | ❌   |
| Complex JOINs    | ✅   | ❌   |
| CAST expressions | ✅   | ❌   |
| INTERVAL         | ✅   | ❌   |
| Window functions | ✅   | ❌   |
| NULLS FIRST/LAST | ✅   | ❌   |
| COUNT(DISTINCT)  | ✅   | ❌   |
| Arbitrary WHERE  | ✅   | ❌   |

### Projection Pushdown

Projection pushdown is supported — only the columns referenced in the query are fetched from ScyllaDB.

### Streaming Execution

Query results are streamed using the scylla driver's paging mechanism in batches of 8192 rows, minimizing memory usage for large result sets.

## Performance Considerations

Partition key and clustering key filters reduce the amount of data transferred from ScyllaDB, but queries without these filters fetch all table data. Consider the following optimizations:

### Enable Acceleration

For frequently queried data, enable Spice acceleration to cache data locally:

```yaml
datasets:
  - from: scylladb:products
    name: products
    params:
      scylladb_host: ${env:SCYLLADB_HOST}
      scylladb_keyspace: catalog
    acceleration:
      enabled: true
      engine: duckdb
      refresh_check_interval: 1h
```

### Configure Datacenter Locality

Set the datacenter preference to route queries to the nearest nodes:

```yaml
params:
  scylladb_datacenter: us-east-1
```

### Adjust Connection Timeout

Set connection timeouts appropriately for your network:

```yaml
params:
  connection_timeout: 30000  # 30 seconds
```

## Examples

### Basic Federated Query

```yaml
datasets:
  - from: scylladb:users
    name: users
    params:
      scylladb_host: localhost
      scylladb_port: 9042
      scylladb_keyspace: my_app
```

### With Authentication

```yaml
datasets:
  - from: scylladb:orders
    name: orders
    params:
      scylladb_host: scylla-cluster.example.com
      scylladb_keyspace: ecommerce
      scylladb_user: app_user
      scylladb_pass: ${secrets:SCYLLA_PASSWORD}
```

### Multi-Node Cluster

```yaml
datasets:
  - from: scylladb:events
    name: events
    params:
      scylladb_hosts: node1.scylla.local,node2.scylla.local,node3.scylla.local
      scylladb_keyspace: analytics
      scylladb_datacenter: us-west-2
```

### With Acceleration

```yaml
datasets:
  - from: scylladb:products
    name: products
    params:
      scylladb_host: ${env:SCYLLADB_HOST}
      scylladb_keyspace: catalog
    acceleration:
      enabled: true
      engine: duckdb
      refresh_check_interval: 1h
```

### Using Environment Variables

```yaml
datasets:
  - from: scylladb:customer
    name: customer
    params:
      scylladb_host: ${env:SCYLLADB_HOST}
      scylladb_port: ${env:SCYLLADB_PORT}
      scylladb_keyspace: ${env:SCYLLADB_KEYSPACE}
```

## Limitations

### CQL Limitations

The following SQL operations cannot be pushed down to ScyllaDB and are performed locally:

- **JOINs**: All joins are performed locally by DataFusion
- **Aggregations**: COUNT, SUM, AVG, etc. are computed locally
- **Subqueries**: Nested queries are not supported in CQL
- **Window functions**: RANK, ROW_NUMBER, etc. not supported
- **Complex WHERE clauses**: Only partition key equality and clustering key comparisons are pushed down; other filters are evaluated locally
- **ORDER BY**: Sorting is done locally

### Connector Limitations

- **Read-only**: The connector does not support INSERT, UPDATE, or DELETE operations
- **Decimal precision**: Fixed at precision=38, scale=2; may not suit all use cases
- **Collection types**: Lists, sets, and maps are converted to JSON string representation
- **Large tables**: Without acceleration, large tables cause significant data transfer

### Data Type Limitations

- **varint**: Arbitrary-precision integers are converted to strings
- **duration**: CQL durations are converted to string representation
- **UDTs**: User-defined types are converted to string representation
- **Nested collections**: Deeply nested collections become complex JSON strings

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores#using-secrets).

## Cookbook

- A cookbook recipe to configure ScyllaDB as a data connector in Spice. [ScyllaDB Data Connector](https://github.com/spiceai/cookbook/tree/trunk/scylladb#readme)

## See Also

- [ScyllaDB Documentation](https://docs.scylladb.com/)
- [ScyllaDB CQL Reference](https://opensource.docs.scylladb.com/stable/cql/)
- [Data Acceleration](../../features/data-acceleration)
