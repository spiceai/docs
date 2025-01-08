---
title: 'DynamoDB Data Connector'
sidebar_label: 'DynamoDB Data Connector'
description: 'DynamoDB Data Connector Documentation'
---

Amazon DynamoDB is a fully managed NoSQL database service that provides fast and predictable performance with seamless scalability. This connector enables using DynamoDB tables as data sources for federated SQL queries in Spice.

```yaml
datasets:
  - from: dynamodb:users
    name: users
    params:
      dynamodb_aws_region: us-west-2
      dynamodb_aws_access_key_id: ${secrets:aws_access_key_id}
      dynamodb_aws_secret_access_key: ${secrets:aws_secret_access_key}
      dynamodb_aws_session_token: ${secrets:aws_session_token} # Optional
```

## Configuration

### `from`

The `from` field should specify the DynamoDB table name:

| `from`           | Description                                        |
| ---------------- | ------------------------------------------------- |
| `dynamodb:table` | Read data from a DynamoDB table named `table`     |

:::note
If an expected table is not found, verify the `dynamodb_aws_region` parameter. DynamoDB tables are region-specific.
:::

### `name`

The dataset name. This will be used as the table name within Spice.

Example:

```yaml
datasets:
  - from: dynamodb:users
    name: my_users
    params: ...
```

```sql
SELECT COUNT(*) FROM my_users;
```

### `params`

The DynamoDB data connector requires the following configuration parameters:

| Parameter Name | Description |
| -------------- | ----------- |
| `dynamodb_aws_region` | Required. The AWS region containing the DynamoDB table |
| `dynamodb_aws_access_key_id` | Required. AWS access key ID for authentication |
| `dynamodb_aws_secret_access_key` | Required. AWS secret access key for authentication |
| `dynamodb_aws_session_token` | Optional. AWS session token for authentication |

## Examples

### Basic Configuration

```yaml
version: v1
kind: Spicepod
name: dynamodb

datasets:
  - from: dynamodb:users
    name: users
    params:
      dynamodb_aws_region: us-west-2
      dynamodb_aws_access_key_id: ${secrets:aws_access_key_id}
      dynamodb_aws_secret_access_key: ${secrets:aws_secret_access_key}
    acceleration:
      enabled: true
```

### Querying Nested Structures

DynamoDB supports complex nested JSON structures. These fields can be queried using SQL:

```sql
-- Query nested structs
SELECT metadata.registration_ip, metadata.user_agent 
FROM users 
LIMIT 5;

-- Query nested structs in arrays
SELECT address.city
FROM (
    SELECT unnest(addresses) AS address 
    FROM users
)
WHERE address.city = 'San Francisco';
```

:::warning[Limitations]

- The DynamoDB connector currently does not support filter push-down optimization. All filtering is performed after data is retrieved from DynamoDB.
- Primary key optimizations are not yet implemented - retrieving items by their primary key will still scan the table.
- The DynamoDB connector will scan the first 10 items to determine the schema of the table. This may miss columns that are not present in the first 10 items.

:::

## Data Types

The DynamoDB connector supports the following data types and mappings:

- Basic scalar types (String, Number, Boolean)
- Lists and Maps
- Nested structures
- Binary data

Example schema from a users table:

```sql
describe users;
```

```bash
+----------------+------------------+-------------+
| column_name    | data_type       | is_nullable |
+----------------+------------------+-------------+
| email          | Utf8            | YES         |
| id             | Int64           | YES         |
| metadata       | Struct          | YES         |
| addresses      | List(Struct)    | YES         |
| preferences    | Struct          | YES         |
| created_at     | Utf8            | YES         |
...
+----------------+------------------+-------------+
```

## Performance Considerations

- Due to limited support for filter push-down, enable acceleration to prevent scanning the entire table on every query.
