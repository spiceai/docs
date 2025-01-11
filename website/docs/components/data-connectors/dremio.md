---
title: 'Dremio Data Connector'
sidebar_label: 'Dremio Data Connector'
description: 'Dremio Data Connector Documentation'
---

[Dremio](https://www.dremio.com/) is a data lake engine that enables high-performance SQL queries directly on data lake storage. It provides a unified interface for querying and analyzing data from various sources without the need for complex data movement or transformation.

This connector enables using Dremio as a data source for federated SQL queries.

```yaml
- from: dremio:datasets.dremio_dataset
  name: dremio_dataset
  params:
    dremio_endpoint: grpc://127.0.0.1:32010
    dremio_username: demo
    dremio_password: ${secrets:my_dremio_pass}
```

## Configuration

### `from`

The `from` field takes the form `dremio:dataset` where `dataset` is the fully qualified name of the dataset to read from.

:::warning [Limitations]

Currently, only up to three levels of nesting are supported for dataset names (e.g., a.b.c). Additional levels are not supported at this time.

:::

### `name`

The dataset name. This will be used as the table name within Spice.

Example:

```yaml
datasets:
  - from: dremio:datasets.dremio_dataset
    name: cool_dataset
    params: ...
```

```sql
SELECT COUNT(*) FROM cool_dataset;
```

```shell
+----------+
| count(*) |
+----------+
| 6001215  |
+----------+
```

### `params`

| Parameter Name    | Description                                                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `dremio_endpoint` | The endpoint used to connect to the Dremio server.                                                                                                                             |
| `dremio_username` | The username used to connect to the Dremio endpoint.                                                                                                                           |
| `dremio_password` | The password used to connect to the Dremio endpoint. Use the [secret replacement syntax](#secrets) to load the password from a secret store, e.g. `${secrets:my_dremio_pass}`. |

## Examples

### Connecting to a GRPC endpoint

```yaml
- from: dremio:datasets.dremio_dataset
  name: dremio_dataset
  params:
    dremio_endpoint: grpc://127.0.0.1:32010
    dremio_username: demo
    dremio_password: ${secrets:my_dremio_pass}
```

## Types

The table below shows the Dremio data types supported, along with the type mapping to Apache Arrow types in Spice.

| Dremio Type | Arrow Type                     |
| ----------- | ------------------------------ |
| `INT`       | `Int32`                        |
| `BIGINT`    | `Int64`                        |
| `FLOAT`     | `Float32`                      |
| `DOUBLE`    | `Float64`                      |
| `DECIMAL`   | `Decimal128`                   |
| `VARCHAR`   | `Utf8`                         |
| `VARBINARY` | `Binary`                       |
| `BOOL`      | `Boolean`                      |
| `DATE`      | `Date64`                       |
| `TIME`      | `Time32`                       |
| `TIMESTAMP` | `Timestamp(Millisecond, None)` |
| `INTERVAL`  | `Interval`                     |
| `LIST`      | `List`                         |
| `STRUCT`    | `Struct`                       |
| `MAP`       | `Map`                          |

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](/docs/components/secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](/docs/components/secret-stores#using-secrets).

## Limitations

- Dremio connector does not support queries with the EXCEPT and INTERSECT keywords in Spice REPL. Use DISTINCT and IN/NOT IN instead. See the example below.

```SQL
# fail
SELECT ws_item_sk FROM web_sales
INTERSECT
SELECT ss_item_sk FROM store_sales;

# success
SELECT DISTINCT ws_item_sk FROM web_sales
WHERE ws_item_sk IN (
    SELECT DISTINCT ss_item_sk FROM store_sales
);

# fail
SELECT ws_item_sk FROM web_sales
EXCEPT
SELECT ss_item_sk FROM store_sales;

# success
SELECT DISTINCT ws_item_sk FROM web_sales
WHERE ws_item_sk NOT IN (
    SELECT DISTINCT ss_item_sk FROM store_sales
);
```

:::

## Cookbook

- A cookbook recipe to configure Dremio as data connector in Spice. [Dremio Data Connector](https://github.com/spiceai/cookbook/tree/trunk/dremio#readme)
