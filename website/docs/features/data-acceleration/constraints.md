---
title: 'Constraints'
sidebar_label: 'Constraints'
sidebar_position: 2
description: 'Learn how to add/configure constraints on local acceleration tables in Spice.'
---

Constraints enforce data integrity in a database. Spice supports constraints on locally accelerated tables to ensure data quality and configure behavior for data updates that violate constraints.

Constraints are specified using [column references](#column-references) in the Spicepod via the `primary_key` field in the acceleration configuration. Additional unique constraints are specified via the [`indexes`](./indexes) field with the value `unique`. Data that violates these constraints will result in a [conflict](#handling-conflicts).

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

Column references can be used to specify which columns are part of the constraint. The column reference can be a single column name or a multicolumn key. A multicolumn key is a comma-separated list of column names, and the enclosing parentheses are optional.

Examples

- `number`: Reference a constraint on the `number` column
- `(hash, timestamp)`: Reference a constraint on the `hash` and `timestamp` columns
- `hash, timestamp`: The same multicolumn key, written without parentheses

### Column names

The names in a column reference are matched against the schema's field names as written — they are not SQL identifiers, so a name that SQL would read as a qualifier chain (`service.instance.id`) or reject outright (`sentry-environment`, `2xx_count`) is a single column name here and needs no special treatment.

A name may also be double-quoted the way SQL writes it. The quotes are not part of the name, and any whitespace or casing inside them is preserved:

- `service.instance.id` and `"service.instance.id"` both reference the same column
- `(time_unix_nano, "service.instance.id")`: A multicolumn key mixing both forms

A column whose name contains `,`, `;`, `:`, `(`, `)` or `"` cannot be referenced. Each of those characters separates fields in the strings a column reference is carried in, so such a name cannot be read back unambiguously; the runtime refuses it at load with a configuration error naming the column and the character, rather than silently splitting it.

### Primary key columns must be non-null

Every column named by `primary_key` must be populated in the incoming data. On the [Spice Cayenne](../../components/data-accelerators/cayenne) accelerator a batch carrying a null in any primary key column is rejected with an error naming the offending column(s), for example:

```text
Primary key column 'region' has null values. Every primary key column must be non-null: populate it in the source data, or set `primary_key` to columns that are always present.
```

Either populate the column in the source data, or choose a `primary_key` made only of columns that are always present.

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

### Advanced Upsert Options

By default, even when `upsert` is configured, if there are constraint violations, such as duplicates within the same batch of ingested data, it will result in a constraint violation - as attempting to upsert data into the target acceleration engine results in an error if done in a single statement. (i.e. [PostgreSQL does not allow the same row to be proposed for insertion more than once](https://www.postgresql.org/docs/18/sql-insert.html))

Spice provides two `upsert` options to resolve duplicates within a single update:

- `upsert_dedup`: Removes exact duplicates in the incoming batch if there is a constraint violation. (i.e. the equivalent of running `SELECT DISTINCT * FROM [batch]`)
- `upsert_dedup_by_row_id`: Resolves conflicts by taking the row with the greatest row id. This is the behavior that would occur if the upsert were applied row-by-row. This guarantees that no constraint violations would result in an error, but it has the tradeoff of being effectively "random" if the incoming data is not ordered.

The new behavior is only triggered when an incoming batch has a constraint violation, minimizing the effect of applying these computations to only when its necessary. However, they can have a performance impact and are not enabled by default.

Full configuration example:

```yaml
acceleration:
  enabled: true
  engine: duckdb
  mode: file
  primary_key: id
  on_conflict:
    id: upsert_dedup # upsert_dedup_by_row_id
```

<details>
      <summary>Examples for advanced upsert behavior</summary>
      <div>

        Take these two CSV files:

        `one.csv`:
        ```csv
        foo,bar
        a,1
        b,2
        a,1
        ```

        Behavior on `one.csv` with a primary key on `foo` and `on_conflict` set to:
        - `upsert`: Will error with: `Constraint Violation: Incoming data violates uniqueness constraint on column(s): foo`
        - `upsert_dedup`: Will succeed in loading 2 rows, the `a,1` row is reduced to a single instance.
        - `upsert_dedup_by_row_id`: Same as `upsert_dedup`

        `two.csv`:
        ```csv
        foo,bar
        a,1
        b,2
        a,10
        ```

        Behavior on `one.csv` with a primary key on `foo` and `on_conflict` set to:
        - `upsert`: Will error with: `Constraint Violation: Incoming data violates uniqueness constraint on column(s): foo`
        - `upsert_dedup`: Will error with: `Constraint Violation: Incoming data violates uniqueness constraint on column(s): foo`
        - `upsert_dedup_by_row_id`: Will succeed in loading 2 rows, `a,10` and `b,2`. The primary key violation is resolved to the row that occurred later.
      </div>
    </details>

## Limitations

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
