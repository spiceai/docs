---
title: 'MongoDB Data Connector'
sidebar_label: 'MongoDB Data Connector'
description: 'MongoDB Data Connector Documentation'
tags:
  - data-connectors
  - mongodb
---

MongoDB is an open-source NoSQL database that stores data in flexible, JSON-like documents, allowing for dynamic schemas and easy scalability.

The MongoDB Data Connector enables federated/accelerated SQL queries on data stored in MongoDB databases.

```yaml
datasets:
  - from: mongodb:mytable
    name: my_dataset
    params:
      mongodb_host: localhost
      mongodb_port: 27017
      mongodb_db: my_database
      mongodb_user: my_user
      mongodb_pass: ${secrets:mongodb_pass}
      mongodb_pool_min: 0
      mongodb_pool_max: 10
```

## Configuration

### `from`

The `from` field takes the form `mongodb:{table_name}` where `table_name` is the table identifer in the MongoDB server to read from.

```yaml
datasets:
  - from: mongodb:mytable
    name: my_dataset
    params:
      mongodb_db: my_database
      ...
```

### `name`

The dataset name. This will be used as the table name within Spice.

Example:

```yaml
datasets:
  - from: mongodb:my_dataset
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

The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords)

### `params`

The MongoDB data connector can be configured by providing the following `params`. Use the [secret replacement syntax](../secret-stores) to load the secret from a secret store, e.g. `${secrets:my_mongodb_conn_string}`.

| Parameter Name                     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `mongodb_connection_string`        | The connection string to use to connect to the MongoDB server. This can be used instead of providing individual connection parameters.                                                                                                                                                                                                                                                                                                                                                                       |
| `mongodb_user`                     | The MongoDB username.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `mongodb_pass`                     | The password to connect with.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `mongodb_host`                     | The hostname of the MongoDB server. Defaults to `localhost`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `mongodb_port`                     | The port of the MongoDB server. Defaults to `27017`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `mongodb_db`                       | The name of the database to connect to. Defaults to `default`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `mongodb_sslmode`                  | Optional. Specifies the SSL/TLS behavior for the connection, supported values:<br /> <ul><li>`required`: (default) This mode requires an SSL connection. If a secure connection cannot be established, server will not connect.</li><li>`preferred`: This mode will try to establish a secure SSL connection if possible, but will connect insecurely if the server does not support SSL.</li><li>`disabled`: This mode will not attempt to use an SSL connection, even if the server supports it.</li></ul> |
| `mongodb_sslrootcert`              | Optional parameter specifying the path to a custom PEM certificate that the connector will trust.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `mongodb_time_zone`                | Optional. Specifies connection time zone. Default is `UTC`. Accepts: <br /><ul><li>Fixed offsets (e.g., `+02:00`).</li><li>IANA time zone names (e.g., `America/Los_Angeles`)</li></ul>                                                                                                                                                                                                                                                                                                                      |
| `mongodb_auth_source`              | Optional. Authentication source database. Overrides the default auth source in the connection string.                                                                                                                                                                                                                                                                                                                                                                                                        |
| `mongodb_unnest_depth`             | Optional. Maximum nesting depth for unnesting embedded documents into a flattened structure. Higher values expand deeper nested fields. Default: `0`                                                                                                                                                                                                                                                                                                                                                         |
| `mongodb_num_docs_to_infer_schema` | Optional. Number of documents to use to infer the schema. Defaults to 400.                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `mongodb_pool_min`                 | The minimum number of connections to keep open in the pool, lazily created when requested. Default: `0`                                                                                                                                                                                                                                                                                                                                                                                                      |
| `mongodb_pool_max`                 | The maximum number of connections to allow in the pool. Default: `10`                                                                                                                                                                                                                                                                                                                                                                                                                                        |

## Types

The table below shows the MongoDB data types supported, along with the type mapping to Apache Arrow types in Spice.

| MongoDB Type              | Arrow Type                           |
|---------------------------|--------------------------------------|
| `String`                  | `Utf8`                               |
| `Boolean`                 | `Boolean`                            |
| `Int32`                   | `Int32`                              |
| `Int64`                   | `Int64`                              |
| `Double`                  | `Float64`                            |
| `Decimal128`              | `Decimal128`                         |
| `Binary`                  | `Binary`                             |
| `Datetime` without time   | `Date32`                             |
| `Datetime` with time      | `Timestamp(Millisecond, <Timezone>)` |
| `Timestamp`               | `Timestamp(Millisecond, None)`       |
| `Array`                   | `List<Utf8>`                         |
| `Null`                    | `Null`                               |
| `Undefined`               | `Null`                               |
| `RegularExpression`       | `Utf8`                               |
| `JavaScriptCode`          | `Utf8`                               |
| `JavaScriptCodeWithScope` | `Utf8`                               |
| `Symbol`                  | `Utf8`                               |
| `MaxKey`                  | `Utf8`                               |
| `MinKey`                  | `Utf8`                               |
| `DbPointer`               | `Utf8`                               |
| `ObjectId`                | `Utf8`                               |
| `Document`                | See unnesting section                |


:::note

- The MongoDB `Datetime` value is [retrieved as a UTC time value](https://www.mongodb.com/docs/manual/reference/method/Date/) by default. Use the `mongodb_time_zone` configuration parameter to specify the desired time zone for interpreting `TIMESTAMP` values during data retrieval.

:::

## Unnesting

Consider the following document:
```json
{
  "a": 1,
  "b": {
    "x": 2,
    "y": {
      "z": 3
    }
  }
}
```

Using `mongodb_unnest_depth` you can control the unnesting behavior. Here are the examples:

### mongodb_unnest_depth: 0
```sql
sql> select * from test_table;
+-----------+---------------------+
| a (Int32) | b (Utf8)            |
+-----------+---------------------+
| 1         | {"x":2,"y":{"z":3}} |
+---+-----------------------------+
```

### mongodb_unnest_depth: 1
```sql
sql> select * from test_table;
+-----------+-------------+------------+
| a (Int32) | b.x (Int32) | b.y (Utf8) |
+-----------+-------------+------------+
| 1         | 2           | {"z":3}    | 
+-----------+-------------+------------+
```

### mongodb_unnest_depth: 2
```sql
sql> select * from test_table;
+-----------+-------------+---------------+
| a (Int32) | b.x (Int32) | b.y.z (Int32) |
+-----------+-------------+---------------+
| 1         | 2           | 3             |
+-----------+-------------+---------------+
```

## Examples

### Connecting using username and password and custom auth table

```yaml
datasets:
  - from: mongodb:my_dataset
    name: my_dataset
    params:
      mongodb_host: localhost
      mongodb_port: 27017
      mongodb_db: my_database
      mongodb_user: my_user
      mongodb_pass: ${secrets:mongodb_pass}
      mongodb_auth_source: admin
```

### Connecting using SSL

```yaml
datasets:
  - from: mongodb:my_dataset
    name: my_dataset
    params:
      mongodb_host: localhost
      mongodb_port: 27017
      mongodb_db: my_database
      mongodb_user: my_user
      mongodb_pass: ${secrets:mongodb_pass}
      mongodb_sslmode: preferred
      mongodb_sslrootcert: ./custom_cert.pem
```

### Connecting using a Connection String

```yaml
datasets:
  - from: mongodb:my_dataset
    name: my_dataset
    params:
      mongodb_connection_string: mongodb://${secrets:my_user}:${secrets:my_password}@localhost:27017/my_db?authSource=admin
```


### With custom connection pool settings

```yaml
datasets:
  - from: mongodb:my_dataset
    name: my_dataset
    params:
      mongodb_host: localhost
      mongodb_port: 27017
      mongodb_db: my_database
      mongodb_user: my_user
      mongodb_pass: ${secrets:mongodb_pass}
      mongodb_pool_min: 5
      mongodb_pool_max: 10
```

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../../components/secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../../components/secret-stores#using-secrets).

## Cookbook

- A cookbook recipe to configure MongoDB as a data connector in Spice. [MongoDB Data Connector](https://github.com/spiceai/cookbook/tree/trunk/mongodb/connector#readme)
