---
title: 'DynamoDB Data Connector'
sidebar_label: 'DynamoDB Data Connector'
description: 'DynamoDB Data Connector Documentation'
tags:
  - data-connectors
  - dynamodb
  - nosql
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

The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords.md).

### `params`

The DynamoDB data connector supports the following configuration parameters:

| Parameter Name                   | Description                                                                                                                                            |
|----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `dynamodb_aws_region`            | Required. The AWS region containing the DynamoDB table                                                                                                 |
| `dynamodb_aws_access_key_id`     | Optional. AWS access key ID for authentication. If not provided, credentials will be loaded from environment variables or IAM roles                    |
| `dynamodb_aws_secret_access_key` | Optional. AWS secret access key for authentication. If not provided, credentials will be loaded from environment variables or IAM roles                |
| `dynamodb_aws_session_token`     | Optional. AWS session token for authentication                                                                                                         |
| `unnest_depth`                   | Optional. Maximum nesting depth for unnesting embedded documents into a flattened structure. Higher values expand deeper nested fields.                |
| `schema_infer_max_records`       | Optional. The number of documents to use to infer the schema. Defaults to 10                                                                               |
| `scan_segments`                  | Optional. Number of segments for `Scan` request. 'auto' by default, which will calculate number of segments based on number of the records in a table |

### Authentication

If AWS credentials are not explicitly provided in the configuration, the connector will automatically load credentials from the following sources in order.

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
Regardless of the credential source, the IAM role or user must have appropriate S3 permissions (e.g., `s3:ListBucket`, `s3:GetObject`) to access the files. If the Spicepod connects to multiple different AWS services, the permissions should cover all of them.
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
|--------------------------|-------------------------------------------------------------------|
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

| DynamoDB Type | Description | Arrow Type                           | Notes                                                                                                                               |
|---------------|-------------|--------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `Bool`        | Boolean     | `Boolean`                            |                                                                                                                                     |
| `S`           | String      | `Utf8`                               |                                                                                                                                     |
| `S`           | String      | `Timestamp(Millisecond)`             | Naive timestamp if it matches `time_format` without timezone                                                                        |
| `S`           | String      | `Timestamp(Millisecond, <timezone>)` | Timezone-aware timestamp if it matches `time_format` with timezone                                                                  |
| `S`           | String      | `Date32`                             | Date-only string in `YYYY-MM-DD` format (when it does not match `time_format`)                                                      |
| `Ss`          | String Set  | `List<Utf8>`                         |                                                                                                                                     |
| `N`           | Number      | `Int64` \| `Float64`                 |                                                                                                                                     |
| `Ns`          | Number Set  | `List<Int64\|Float64>`               |                                                                                                                                     |
| `B`           | Binary      | `Binary`                             |                                                                                                                                     |
| `Bs`          | Binary Set  | `List<Binary>`                       |                                                                                                                                     |
| `L`           | List        | `List<Utf8>`                         | DynamoDB arrays can be heterogeneous e.g. `[1, "foo", true]`, Arrow arrays must be homogeneous - use strings to preserve all data   |
| `M`           | Map         | `Utf8` or Unflattened                | Depending on `unnest_depth` value                                                                                                   |

## Time format

Since DynamoDB stores timestamps as strings, Spice supports parsing timestamps using a customizable format. By default, Spice will try to parse timestamps using ISO8601 format, but you can provide a custom format using the `time_format` parameter.

Once Spice is able to parse a timestamp, it will convert it to a `Timestamp(Millisecond)` Arrow type, and will use the same format to serialize it back to DynamoDB for filter pushdown.

This parameter uses Go-style time formatting, which uses a reference time of `Mon Jan 2 15:04:05 MST 2006`.

| Format Pattern                  | Example Value                   | Description                                |
|---------------------------------|---------------------------------|--------------------------------------------|
| `2006-01-02T15:04:05.000Z07:00` | `2024-03-15T14:30:00.000Z`      | ISO8601 / RFC3339 with milliseconds and timezone (default) |
| `2006-01-02T15:04:05.999Z07:00` | `2024-03-15T14:30:00.123-07:00` | ISO8601 with milliseconds and timezone     |
| `2006-01-02T15:04:05`           | `2024-03-15T14:30:00`           | ISO8601 without timezone (naive timestamp) |
| `2006-01-02 15:04:05`           | `2024-03-15 14:30:00`           | Date and time with space separator         |
| `01/02/2006 15:04:05`           | `03/15/2024 14:30:00`           | US-style date with time                    |
| `02/01/2006 15:04:05`           | `15/03/2024 14:30:00`           | European-style date with time              |
| `Jan 2, 2006 3:04:05 PM`        | `Mar 15, 2024 2:30:00 PM`       | Human-readable with 12-hour clock          |
| `20060102150405`                | `20240315143000`                | Compact format (no separators)             |

Go's format uses specific reference values that must appear exactly as shown:

| Component    | Reference Value | Alternatives                          |
|--------------|-----------------|---------------------------------------|
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
      dynamodb_aws_access_key_id: ${secrets:aws_access_key_id}
      dynamodb_aws_secret_access_key: ${secrets:aws_secret_access_key}
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
