---
title: 'DynamoDB Data Connector'
sidebar_label: 'DynamoDB Data Connector'
description: 'DynamoDB Data Connector Documentation'
tags:
  - data-connectors
  - dynamodb
  - nosql
  - component-metrics
---

Amazon DynamoDB is a fully managed NoSQL database service that provides fast and predictable performance with seamless scalability. This connector enables using DynamoDB tables as data sources for federated SQL queries in Spice.

```yaml
datasets:
  - from: dynamodb:users
    name: users
    params:
      dynamodb_aws_region: us-west-2
      dynamodb_aws_access_key_id: ${secrets:aws_access_key_id} # Optional
      dynamodb_aws_secret_access_key: ${secrets:aws_secret_access_key} # Optional
      dynamodb_aws_session_token: ${secrets:aws_session_token} # Optional
```

## Configuration

### `from`

The `from` field should specify the DynamoDB table name:

| `from`           | Description                                   |
| ---------------- | --------------------------------------------- |
| `dynamodb:table` | Read data from a DynamoDB table named `table` |

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

The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords).

### `params`

The DynamoDB data connector supports the following configuration parameters:

| Parameter Name                   | Description                                                                                                                                                                                                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dynamodb_aws_region`            | Required. The AWS region containing the DynamoDB table                                                                                                                                                                                                     |
| `dynamodb_aws_access_key_id`     | Optional. AWS access key ID for authentication. If not provided, credentials will be loaded from environment variables or IAM roles                                                                                                                        |
| `dynamodb_aws_secret_access_key` | Optional. AWS secret access key for authentication. If not provided, credentials will be loaded from environment variables or IAM roles                                                                                                                    |
| `dynamodb_aws_session_token`     | Optional. AWS session token for authentication                                                                                                                                                                                                             |
| `dynamodb_aws_auth`              | Optional. Authentication method. Use `iam_role` (default) for IAM role-based authentication or `key` for explicit access key credentials.                                                                                                                  |
| `dynamodb_aws_iam_role_source`   | Optional. IAM role credential source (only used when `dynamodb_aws_auth: iam_role`). `auto` (default) uses the default AWS credential chain, `metadata` uses only instance/container metadata (IMDS, ECS, EKS/IRSA), `env` uses only environment variables |
| `unnest_depth`                   | Optional. Maximum nesting depth for unnesting embedded documents into a flattened structure. Higher values expand deeper nested fields.                                                                                                                    |
| `schema_infer_max_records`       | Optional. The number of documents to use to infer the schema. Defaults to 10                                                                                                                                                                               |
| `scan_segments`                  | Optional. Number of segments for `Scan` request. 'auto' by default, which will calculate number of segments based on number of the records in a table                                                                                                      |
| `time_format`                    | Optional. Go-style time format used for parsing/formatting timestamps. See [Time Format](#time-format)                                                                                                                                                     |

### Authentication

The DynamoDB connector supports two authentication methods controlled by the `dynamodb_aws_auth` parameter:

```yaml
datasets:
  - from: dynamodb:my_table
    params:
      dynamodb_aws_auth: iam_role | key                   # iam_role is default
      dynamodb_aws_iam_role_source: auto | metadata | env # auto is default (only used with iam_role)
```

#### IAM Role Authentication (`dynamodb_aws_auth: iam_role`)

This is the default authentication method. When using IAM role authentication, the `dynamodb_aws_iam_role_source` parameter controls which credential sources are used:

| Source Value      | Description                           | Credential Sources                                                            |
| ----------------- | ------------------------------------- | ----------------------------------------------------------------------------- |
| `auto`  (default) | Uses the default AWS credential chain | All sources listed below, in order                                            |
| `metadata`        | Uses only instance/container metadata | Web Identity Token, ECS Container Credentials, EC2 Instance Metadata (IMDSv2) |
| `env`             | Uses only environment variables       | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`             |

:::note
When using `iam_role` authentication, any explicitly provided access keys (`dynamodb_aws_access_key_id`, `dynamodb_aws_secret_access_key`) are ignored.
:::

#### Key-Based Authentication (`dynamodb_aws_auth: key`)

When `dynamodb_aws_auth` is set to `key`, credentials must be provided explicitly:

```yaml
datasets:
  - from: dynamodb:my_table
    params:
      dynamodb_aws_auth: key
      dynamodb_aws_access_key_id: ${secrets:aws_access_key_id}
      dynamodb_aws_secret_access_key: ${secrets:aws_secret_access_key}
      dynamodb_aws_session_token: ${secrets:aws_session_token}  # Optional, for temporary credentials
```

#### Default Credential Chain (`auto`)

When using `dynamodb_aws_auth: iam_role` with `dynamodb_aws_iam_role_source: auto` (or when both parameters are omitted), credentials are loaded from the following sources in order:

1. **Environment Variables**:
   - `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
   - `AWS_SESSION_TOKEN` (if using temporary credentials)

2. **Shared AWS Config/Credentials Files**:
   - Config file: `~/.aws/config` (Linux/Mac) or `%UserProfile%\.aws\config` (Windows)
   - Credentials file: `~/.aws/credentials` (Linux/Mac) or `%UserProfile%\.aws\credentials` (Windows)
   - The `AWS_PROFILE` environment variable can be used to specify a named profile, otherwise the `[default]` profile is used.
   - Supports both static credentials and SSO sessions
   - Example credentials file:

     ```ini
     # Static credentials
     [default]
     aws_access_key_id = YOUR_ACCESS_KEY
     aws_secret_access_key = YOUR_SECRET_KEY

     # SSO profile
     [profile sso-profile]
     sso_start_url = https://my-sso-portal.awsapps.com/start
     sso_region = us-west-2
     sso_account_id = 123456789012
     sso_role_name = MyRole
     region = us-west-2
     ```

   :::tip
   To set up SSO authentication:
   1. Run `aws configure sso` to configure a new SSO profile
   2. Use the profile by setting `AWS_PROFILE=sso-profile`
   3. Run `aws sso login --profile sso-profile` to start a new SSO session
   :::

3. **AWS STS Web Identity Token Credentials**:
   - Used primarily with OpenID Connect (OIDC) and OAuth
   - Common in Kubernetes environments using IAM roles for service accounts (IRSA)

4. **ECS Container Credentials**:
   - Used when running in Amazon ECS containers
   - Automatically uses the task's IAM role
   - Retrieved from the ECS credential provider endpoint
   - Relies on the environment variable `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` or `AWS_CONTAINER_CREDENTIALS_FULL_URI` which are automatically injected by ECS.

5. **AWS EC2 Instance Metadata Service (IMDSv2)**:
   - Used when running on EC2 instances.
   - Automatically uses the instance's IAM role.
   - Retrieved securely using [IMDSv2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html).

The connector will try each source in order until valid credentials are found. If no valid credentials are found, an authentication error will be returned.

:::note[IAM Permissions]
Regardless of the credential source, the IAM role or user must have appropriate DynamoDB permissions (e.g., `dynamodb:Scan`, `dynamodb:Query`, `dynamodb:DescribeTable`) to access the tables. If the Spicepod connects to multiple different AWS services, the permissions should cover all of them.
:::

## Required IAM Permissions

The IAM role or user needs the following permissions to access DynamoDB tables:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:Scan",
                "dynamodb:Query",
                "dynamodb:DescribeTable"
            ],
            "Resource": [
                "arn:aws:dynamodb:*:*:table/YOUR_TABLE_NAME"
            ]
        }
    ]
}
```

### Permission Details

| Permission               | Purpose                                                           |
| ------------------------ | ----------------------------------------------------------------- |
| `dynamodb:Scan`          | Required. Allows reading all items from the table                 |
| `dynamodb:Query`         | Required. Allows reading items from the table using partition key |
| `dynamodb:DescribeTable` | Required. Allows fetching table metadata and schema information   |

### Example IAM Policies

#### Minimal Policy (Read-only access to specific table)

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:Scan",
                "dynamodb:Query",
                "dynamodb:DescribeTable"
            ],
            "Resource": "arn:aws:dynamodb:us-west-2:123456789012:table/users"
        }
    ]
}
```

#### Access to Multiple Tables

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:Scan",
                "dynamodb:Query",
                "dynamodb:DescribeTable"
            ],
            "Resource": [
                "arn:aws:dynamodb:us-west-2:123456789012:table/users",
                "arn:aws:dynamodb:us-west-2:123456789012:table/orders"
            ]
        }
    ]
}
```

#### Access to All Tables in a Region

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:Scan",
                "dynamodb:Query",
                "dynamodb:DescribeTable"
            ],
            "Resource": "arn:aws:dynamodb:us-west-2:123456789012:table/*"
        }
    ]
}
```

:::warning[Security Considerations]

- Avoid using `dynamodb:*` permissions as it grants more access than necessary.
- Consider using more restrictive policies in production environments.
- When using IAM roles with EKS, ensure the [service account is properly configured with IRSA](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html).

:::

## Data Types

The table below shows the DynamoDB data types supported, along with the type mapping to Apache Arrow types in Spice.

| DynamoDB Type | Description | Arrow Type                           | Notes                                                                                                                             |
| ------------- | ----------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `Bool`        | Boolean     | `Boolean`                            |                                                                                                                                   |
| `S`           | String      | `Utf8`                               |                                                                                                                                   |
| `S`           | String      | `Timestamp(Millisecond)`             | Naive timestamp if it matches `time_format` without timezone                                                                      |
| `S`           | String      | `Timestamp(Millisecond, <timezone>)` | Timezone-aware timestamp if it matches `time_format` with timezone                                                                |
| `Ss`          | String Set  | `List<Utf8>`                         |                                                                                                                                   |
| `N`           | Number      | `Int64` \| `Float64`                 |                                                                                                                                   |
| `Ns`          | Number Set  | `List<Int64\|Float64>`               |                                                                                                                                   |
| `B`           | Binary      | `Binary`                             |                                                                                                                                   |
| `Bs`          | Binary Set  | `List<Binary>`                       |                                                                                                                                   |
| `L`           | List        | `List<Utf8>`                         | DynamoDB arrays can be heterogeneous e.g. `[1, "foo", true]`, Arrow arrays must be homogeneous - use strings to preserve all data |
| `M`           | Map         | `Utf8` or Unflattened                | Depending on `unnest_depth` value                                                                                                 |

## Time format

Since DynamoDB stores timestamps as strings, Spice supports parsing timestamps using a customizable format. By default, Spice will try to parse timestamps using ISO8601 format, but you can provide a custom format using the `time_format` parameter.

Once Spice is able to parse a timestamp, it will convert it to a `Timestamp(Millisecond)` Arrow type, and will use the same format to serialize it back to DynamoDB for filter pushdown.

This parameter uses Go-style time formatting, which uses a reference time of `Mon Jan 2 15:04:05 MST 2006`.

| Format Pattern                  | Example Value                   | Description                                |
| ------------------------------- | ------------------------------- | ------------------------------------------ |
| `2006-01-02T15:04:05Z07:00`     | `2024-03-15T14:30:00Z`          | ISO8601 / RFC3339 with timezone (default)  |
| `2006-01-02T15:04:05.999Z07:00` | `2024-03-15T14:30:00.123-07:00` | ISO8601 with milliseconds and timezone     |
| `2006-01-02T15:04:05`           | `2024-03-15T14:30:00`           | ISO8601 without timezone (naive timestamp) |
| `2006-01-02 15:04:05`           | `2024-03-15 14:30:00`           | Date and time with space separator         |
| `01/02/2006 15:04:05`           | `03/15/2024 14:30:00`           | US-style date with time                    |
| `02/01/2006 15:04:05`           | `15/03/2024 14:30:00`           | European-style date with time              |
| `Jan 2, 2006 3:04:05 PM`        | `Mar 15, 2024 2:30:00 PM`       | Human-readable with 12-hour clock          |
| `20060102150405`                | `20240315143000`                | Compact format (no separators)             |

Go's format uses specific reference values that must appear exactly as shown:

| Component    | Reference Value | Alternatives                          |
| ------------ | --------------- | ------------------------------------- |
| Year         | `2006`          | `06` (2-digit)                        |
| Month        | `01`            | `1`, `Jan`, `January`                 |
| Day          | `02`            | `2`                                   |
| Hour (24h)   | `15`            | —                                     |
| Hour (12h)   | `03`            | `3`                                   |
| Minute       | `04`            | `4`                                   |
| Second       | `05`            | `5`                                   |
| AM/PM        | `PM`            | `pm`                                  |
| Timezone     | `Z07:00`        | `-0700`, `MST`                        |
| Milliseconds | `.000`          | `.999` (trailing zeros trimmed)       |
| Microseconds | `.000000`       | `.999999` (trailing zeros trimmed)    |
| Nanoseconds  | `.000000000`    | `.999999999` (trailing zeros trimmed) |

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

Using `unnest_depth` you can control the unnesting behavior. Here are the examples:

### unnest_depth: 0
```sql
sql> select * from test_table;
+-----------+---------------------+
| a (Int32) | b (Utf8)            |
+-----------+---------------------+
| 1         | {"x":2,"y":{"z":3}} |
+---+-----------------------------+
```

### unnest_depth: 1
```sql
sql> select * from test_table;
+-----------+-------------+------------+
| a (Int32) | b.x (Int32) | b.y (Utf8) |
+-----------+-------------+------------+
| 1         | 2           | {"z":3}    | 
+-----------+-------------+------------+
```

### unnest_depth: 2
```sql
sql> select * from test_table;
+-----------+-------------+---------------+
| a (Int32) | b.x (Int32) | b.y.z (Int32) |
+-----------+-------------+---------------+
| 1         | 2           | 3             |
+-----------+-------------+---------------+
```

## JSON Nesting

When working with DynamoDB tables that have many columns, you can consolidate unspecified columns into a single JSON column using the `json_object` metadata option. This is useful when you only need a few columns as discrete fields and want to bundle the remaining columns into a single JSON structure.

### Configuration

To use JSON nesting, define your desired columns explicitly in the `columns` list and add a "catch-all" column with `json_object: "*"` metadata. Any columns from the source table that are not explicitly listed will be nested into this JSON column.
```yaml
datasets:
  - from: dynamodb:my_table
    name: my_table
    params:
      dynamodb_aws_region: us-west-2
    columns:
      - name: PK
      - name: SK
      - name: Baz
      - name: data_json
        metadata:
          json_object: "*"
```

### Example

Given a DynamoDB table with this schema:

| Column | Type   |
| ------ | ------ |
| PK     | String |
| SK     | String |
| Foo    | Map    |
| Bar    | List   |
| Baz    | String |

The configuration above produces:

| Column    | Type                                   |
| --------- | -------------------------------------- |
| PK        | String                                 |
| SK        | String                                 |
| Baz       | String                                 |
| data_json | JSON (`{"Foo": <map>, "Bar": <list>}`) |

The `Foo` and `Bar` columns, which were not explicitly listed, are automatically nested into the `data_json` column as a JSON object.

### Interaction with `unnest_depth`

When both `unnest_depth` and `json_object` are specified, the operations are applied in this order:

1. **Unnesting first**: Nested structures are flattened according to the `unnest_depth` value
2. **JSON nesting second**: Unspecified columns are then consolidated into the `json_object` column

Consider this DynamoDB dataset:
```
+----+------+-------------------+------------------------------------------------------+
| PK | SK   | Baz               | Foo                                                  | 
+----+------+-------------------+------------------------------------------------------+
| 1  | 200  | some_string_value | { "Age" : { "N" : "35" }, "Name" : { "S" : "Joe" } } |
+----+------+-------------------+------------------------------------------------------+
```

And this configuration
```yaml
datasets:
  - from: dynamodb:my_table
    name: my_table
    params:
      dynamodb_aws_region: us-west-2
      unnest_depth: 1
    columns:
      - name: PK
      - name: SK
        metadata:
          json_object: "*"
```

Will produce the following Spice dataset:
```
+----+-----+---------------------------------------------------------+
| PK | SK  | json_data                                               |
+----+-----+---------------------------------------------------------+
| 1  | 200 | {"Baz":"some_string", "Foo.Age":35.0, "Foo.Name":"Joe"} |
+----+-----+---------------------------------------------------------+
```

:::warning[Limitations]

- The `json_object` metadata only accepts `"*"` as its value, which captures all unspecified columns
- Only one column can have the `json_object` metadata. Specifying multiple columns with `json_object` will result in an error

:::

## Examples

### Basic Configuration with Environment Credentials

```yaml
version: v1
kind: Spicepod
name: dynamodb

datasets:
  - from: dynamodb:users
    name: users
    params:
      dynamodb_aws_region: us-west-2
    acceleration:
      enabled: true
```

### Configuration with Explicit Credentials

```yaml
version: v1
kind: Spicepod
name: dynamodb

datasets:
  - from: dynamodb:users
    name: users
    params:
      dynamodb_aws_region: us-west-2
      dynamodb_aws_auth: key
      dynamodb_aws_access_key_id: ${secrets:aws_access_key_id}
      dynamodb_aws_secret_access_key: ${secrets:aws_secret_access_key}
    acceleration:
      enabled: true
```

### Configuration with Metadata-Only Credentials (ECS/EKS)

```yaml
version: v1
kind: Spicepod
name: dynamodb

datasets:
  - from: dynamodb:users
    name: users
    params:
      dynamodb_aws_region: us-west-2
      dynamodb_aws_auth: iam_role
      dynamodb_aws_iam_role_source: metadata
    acceleration:
      enabled: true
```

### Configuration with time_format

```yaml
version: v1
kind: Spicepod
name: dynamodb

datasets:
  - from: dynamodb:users
    name: users
    params:
      dynamodb_aws_region: us-west-2
      time_format: 2006-01-02 15:04:05
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

### 

:::warning[Limitations]

- The DynamoDB connector will scan the first 10 items to determine the schema of the table. This may miss columns that are not present in the first 10 items.
- The DynamoDB connector does not support Decimal type.

:::

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

## Streams

The DynamoDB Data Connector integrates with [DynamoDB Streams](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html) to enable real-time streaming of table changes. This feature supports both initial table bootstrapping and continuous change data capture (CDC), allowing Spice to automatically detect and stream inserts, updates, and deletes from DynamoDB tables.

:::warning

Using DynamoDB Streams **requires** [acceleration](../data-accelerators) with `refresh_mode: changes`.

:::

### Basic Configuration

To enable streaming from DynamoDB, enable acceleration and set the `refresh_mode` to `changes` in your dataset configuration.

```yaml
datasets:
  - from: dynamodb:my_table
    name: orders_stream
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      refresh_mode: changes
```

### Configuration Parameters

#### Dataset Parameters

- **`ready_lag`** - Defines the maximum lag threshold before the dataset is reported as "Ready". Once the stream lag falls below this value, queries can be executed against the dataset. Default behavior reports ready immediately after bootstrap completes.

- **`scan_interval`** - Controls the polling frequency for checking new records in the DynamoDB stream. Lower values provide more real-time updates but increase API calls. Higher values reduce API usage but may introduce additional latency.

#### Acceleration Parameters

- **`snapshots`** - Optional. Controls snapshots behavior. Supported values are `disabled` (default), `enabled`, `create_only`, `bootstrap_only`.
- **`snapshots_trigger`** - Optional. Determines type of trigger for creating snapshots. Supported values are `time_interval` (default) and `stream_batches`.
- **`snapshots_trigger_threshold`** - Optional. Threshold value for snapshot creation. The format depends on the `snapshots_trigger` type:
   - When `snapshots_trigger` is `stream_batches`: a raw integer specifying the number of batches (e.g., `100`, `1000`).
   - When `snapshots_trigger` is `time_interval`: an integer with a time unit suffix (e.g., `10m`, `30s`, `1h`).

See [Acceleration snapshots](../../features/data-acceleration/snapshots) for more details.

### Metrics

The following [Component Metrics](../../features/observability/component_metrics) are provided for monitoring streaming performance and health:

| Metric                   | Type    | Description                                                                |
| ------------------------ | ------- | -------------------------------------------------------------------------- |
| `shards_active`          | Gauge   | Current number of active shards in the stream                              |
| `records_consumed_total` | Counter | Total number of records consumed from the stream                           |
| `lag_ms`                 | Gauge   | Current lag in milliseconds between stream watermark and the current time  |
| `errors_transient_total` | Counter | Total number of transient errors encountered while polling from the stream |

These metrics are not enabled by default, enable them by setting the metrics parameter:
```yaml
datasets:
- from: dynamodb:user_events
  name: events
  acceleration:
    enabled: true
    refresh_mode: changes
  metrics:
   - name: shards_active
   - name: records_consumed_total
   - name: lag_ms
   - name: errors_transient_total
```

You can find an example dashboard for DynamoDB Streams in [monitoring/grafana-dashboard.json](https://github.com/spiceai/spiceai/blob/trunk/monitoring/grafana-dashboard.json).

## Advanced Configuration

For production workloads requiring fine-tuned control over streaming behavior and performance characteristics:
```yaml
datasets:
   - from: dynamodb:my_table
     name: orders_stream
     params:
        ready_lag: 1s          # Dataset reports as Ready when lag is below 1 second
        scan_interval: 100ms   # Poll for new stream records every 100 milliseconds
     acceleration:
        enabled: true
        engine: duckdb
        mode: file
        refresh_mode: changes
        snapshots: enabled
        snapshots_trigger: stream_batches
        snapshots_trigger_threshold: 5  # Create snapshots every 5 batch updates
     metrics:
     - name: shards_active
     - name: records_consumed_total
     - name: lag_ms
     - name: errors_transient_total
```

:::warning[Limitations]

- DynamoDB Streams connector does not support `refresh_sql`.

:::

## Cookbooks

- A cookbook recipe to configure DynamoDB as a data connector in Spice. [DynamoDB Data Connector](https://github.com/spiceai/cookbook/tree/trunk/dynamodb#readme)
- A cookbook recipe to configure DynamoDB Streams as a data connector in Spice. [DynamoDB Streams Data Connector](https://github.com/spiceai/cookbook/tree/trunk/dynamodb/streams#readme)
