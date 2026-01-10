---
description: Configure local acceleration for datasets in Spice for faster queries (test)
---

# Data Acceleration

Datasets can be locally accelerated by the Spice runtime, pulling data from any [Data Connector](https://docs.spiceai.org/components/data-connectors) and storing it locally in a [Data Accelerator](https://docs.spiceai.org/components/data-accelerators) for faster access. The data can be kept up-to-date in real-time or on a refresh schedule, ensuring users always have the latest data locally for querying.

### Supported Data Accelerators <a href="#example" id="example"></a>

Dataset acceleration is enabled by setting the `acceleration` configuration. Spice currently supports In-Memory Arrow, DuckDB, SQLite, PostgreSQL as accelerators. For engine specific configuration, see [Data Accelerator Documentation](https://docs.spiceai.org/components/data-accelerators)

#### Example - Locally Accelerating taxi\_trips with Arrow Accelerator <a href="#example" id="example"></a>

```yaml
datasets:
  - from: spice.ai/spiceai/quickstart/datasets/taxi_trips
    name: taxi_trips
    acceleration:
      enabled: true
      refresh_mode: full
      refresh_check_interval: 10s
```

### Refresh Modes <a href="#refresh-modes" id="refresh-modes"></a>

Spice supports three modes to refresh/update locally accelerated data from a connected data source. `full` is the default mode. Refer to [Data Refresh](https://docs.spiceai.org/components/data-accelerators/data-refresh) documentation for detailed refresh usage and configuration.

| Mode      | Description                                          | Example                                                          |
| --------- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| `full`    | Replace/overwrite the entire dataset on each refresh | A table of users                                                 |
| `append`  | Append/add data to the dataset on each refresh       | Append-only, immutable datasets, such as time-series or log data |
| `changes` | Apply incremental changes                            | Customer order lifecycle table                                   |

#### Example - Accelerate with arrow accelerator under full refresh mode <a href="#example" id="example"></a>

```yaml
datasets:
  - from: databricks:my_dataset
    name: accelerated_dataset
    acceleration:
      refresh_mode: full
      refresh_check_interval: 10m
```

### Indexes

Database indexes are essential for optimizing query performance. Configure indexes for accelerators via `indexes` field. For detailed configuration, refer to the [index](https://docs.spiceai.org/features/data-acceleration/indexes) documentation.

#### Example - Configure indexes with SQLite Accelerator <a href="#example" id="example"></a>

```yaml
datasets:
  - from: spice.ai/eth.recent_blocks
    name: eth.recent_blocks
    acceleration:
      enabled: true
      engine: sqlite
      indexes:
        number: enabled # Index the `number` column
        '(hash, timestamp)': unique # Add a unique index with a multicolumn key comprised of the `hash` and `timestamp` columns
```

## Constraints

Constraints enforce data integrity in a database. Spice supports constraints on locally accelerated tables to ensure data quality and configure behavior for data updates that violate constraints. 

Constraints are specified using [column references](https://docs.spiceai.org/#column-references) in the Spicepod via the `primary_key` field in the acceleration configuration. Additional unique constraints are specified via the [`indexes`](https://docs.spiceai.org/features/data-acceleration/indexes) field with the value `unique`. Data that violates these constraints will result in a [conflict](https://docs.spiceai.org/#handling-conflicts). For constraints configuration details, visit [Constraints Documentation](https://docs.spiceai.org/features/data-acceleration/constraints).

#### Example - Configure primary key constraints  with SQLite Accelerator <a href="#example" id="example"></a>

```yaml
datasets:
  - from: spice.ai/eth.recent_blocks
    name: eth.recent_blocks
    acceleration:
      enabled: true
      engine: sqlite
      primary_key: hash # Define a primary key on the `hash` column
      indexes:
        '(number, timestamp)': unique # Add a unique index with a multicolumn key comprised of the `number` and `timestamp` columns
```

