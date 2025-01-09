---
title: 'Constraints'
sidebar_label: 'Constraints'
sidebar_position: 2
description: 'Learn how to add/configure constraints on local acceleration tables in Spice.'
---

Constraints enforce data integrity in a database. Spice supports constraints on locally accelerated tables to ensure data quality and configure behavior for data updates that violate constraints.

Constraints are specified using [column references](#column-references) in the Spicepod via the `primary_key` field in the acceleration configuration. Additional unique constraints are specified via the [`indexes`](./indexes.md) field with the value `unique`. Data that violates these constraints will result in a [conflict](#handling-conflicts).

If multiple rows in the incoming data violate any constraint, the entire incoming batch of data will be dropped.

Example Spicepod:

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

## Column References

Column references can be used to specify which columns are part of the constraint. The column reference can be a single column name or a multicolumn key. The column reference must be enclosed in parentheses if it is a multicolumn key.

Examples

- `number`: Reference a constraint on the `number` column
- `(hash, timestamp)`: Reference a constraint on the `hash` and `timestamp` columns

## Handling conflicts

The behavior of inserting data that violates the constraint can be configured via the `on_conflict` field to either `drop` the data that violates the constraint or `upsert` that data into the accelerated table (i.e. update all values other than the columns that are part of the constraint to match the incoming data).

:::warning
If there are multiple rows in the incoming data that violate any constraint, the entire incoming batch of data will be dropped.
:::

Example Spicepod:

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
      on_conflict:
        # Upsert the incoming data when the primary key constraint on "hash" is violated,
        # alternatively "drop" can be used instead of "upsert" to drop the data update.
        hash: upsert
```

## Limitations

- **Not supported for in-memory Arrow:** The default in-memory Arrow acceleration engine does not support constraints. Use [DuckDB](/components/data-accelerators/duckdb.md), [SQLite](/components/data-accelerators/duckdb.md), or [PostgreSQL](/components/data-accelerators/postgres/index.md) as the acceleration engine to enable constraint checking.
- **Single on_conflict target supported**: Only a single `on_conflict` target can be specified, unless all `on_conflict` targets are specified with drop.

  - <details>
      <summary>Examples for valid/invalid `on_conflict` targets</summary>
      <div>
        The following Spicepod is invalid because it specifies multiple `on_conflict` targets with `upsert`:

    :::danger[Invalid]

    ```yaml
    datasets:
      - from: spice.ai/eth.recent_blocks
        name: eth.recent_blocks
        acceleration:
          enabled: true
          engine: sqlite
          primary_key: hash
          indexes:
            '(number, timestamp)': unique
          on_conflict:
            hash: upsert
            '(number, timestamp)': upsert
    ```

    :::

          The following Spicepod is valid because it specifies multiple `on_conflict` targets with `drop`, which is allowed:

    :::tip[Valid]

    ```yaml
    datasets:
      - from: spice.ai/eth.recent_blocks
        name: eth.recent_blocks
        acceleration:
          enabled: true
          engine: sqlite
          primary_key: hash
          indexes:
            '(number, timestamp)': unique
          on_conflict:
            hash: drop
            '(number, timestamp)': drop
    ```

    :::

          The following Spicepod is invalid because it specifies multiple `on_conflict` targets with `upsert` and `drop`:

    :::danger[Invalid]

    ```yaml
    datasets:
      - from: spice.ai/eth.recent_blocks
        name: eth.recent_blocks
        acceleration:
          enabled: true
          engine: sqlite
          primary_key: hash
          indexes:
            '(number, timestamp)': unique
          on_conflict:
            hash: upsert
            '(number, timestamp)': drop
    ```

    :::

      </div>
    </details>

- **DuckDB Limitations:**

  - DuckDB does not support `upsert` for datasets with List or Map types.
  - Standard indexes unexpectedly act like unique indexes and block updates when `upsert` is configured.

    - <details>
        <summary>Standard indexes blocking updates</summary>
        <div>
          The following Spicepod specifies a standard index on the `number` column, which blocks updates when `upsert` is configured for the `hash` column:

          ```yaml
          datasets:
            - from: spice.ai/eth.recent_blocks
              name: eth.recent_blocks
              acceleration:
                enabled: true
                engine: duckdb
                primary_key: hash
                indexes:
                  number: enabled
                on_conflict:
                  hash: upsert
          ```

          The following error is returned when attempting to upsert data into the `eth.recent_blocks` table:

          ```bash
          ERROR runtime::accelerated_table::refresh: Error adding data for eth.recent_blocks: External error:
          Unable to insert into duckdb table: Binder Error: Can not assign to column 'number' because
          it has a UNIQUE/PRIMARY KEY constraint
          ```

          This is a limitation of DuckDB.

        </div>
      </details>
