---
title: 'Partitioning'
sidebar_label: 'Partitioning'
description: 'Partitioning for accelerated datasets'
sidebar_position: 4
---

Accelerations can be partitioned using an arbitrary expression to group rows together into separate files.
This enables Spice to avoid reading unnecessary partitions, making particular queries faster.
To partition your accelerations, add the `partition_by` acceleration parameter:

```yaml
datasets:
  - from: s3://spiceai-demo-datasets/taxi_trips/2024/
    name: taxi_trips
    params:
      file_format: parquet
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      partition_by:
        - bucket(50, PULocationID)
```

This example uses a `bucket` user-defined function (UDF) to hash the `PULocationID` column and put each row into one of 50 partition files.

This enables partition pruning for queries that filter on the column referenced in the `partition_by` expression:

```sql
SELECT * FROM taxi_trips WHERE PULocationID IN (1, 2, 3, 4, 5);
```

This will result in a scan plan that only reads from the partitions that contain the values from the `IN` list.

:::warning[Limitations]

- Partitioning is currently limited to `engine: duckdb` or `engine: cayenne` with `mode: file`.
- `partition_by` currently only supports 1 expression for partitioning.
- Expression must reference exactly one column from the dataset.
- Expression must produce a scalar value.
- Expression cannot contain a subquery.
- Partition pruning is limited to specific filter expressions such as:
  - `WHERE foo = bar`
  - `WHERE foo IN (bar, baz, ...)`
  - `WHERE foo NOT IN (bar, baz, ...)`

:::
