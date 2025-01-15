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

### `params`

The DynamoDB data connector supports the following configuration parameters:

| Parameter Name | Description |
| -------------- | ----------- |
| `dynamodb_aws_region` | Required. The AWS region containing the DynamoDB table |
| `dynamodb_aws_access_key_id` | Optional. AWS access key ID for authentication. If not provided, credentials will be loaded from environment variables or IAM roles |
| `dynamodb_aws_secret_access_key` | Optional. AWS secret access key for authentication. If not provided, credentials will be loaded from environment variables or IAM roles |
| `dynamodb_aws_session_token` | Optional. AWS session token for authentication |

### Credential Sources

If AWS credentials are not explicitly provided in the configuration, the connector will automatically load credentials from the following sources in order:

1. **Environment Variables**:
   - `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
   - `AWS_SESSION_TOKEN` (if using temporary credentials)

2. **Shared AWS Config/Credentials Files**:
   - Config file: `~/.aws/config` (Linux/Mac) or `%UserProfile%\.aws\config` (Windows)
   - Credentials file: `~/.aws/credentials` (Linux/Mac) or `%UserProfile%\.aws\credentials` (Windows)
   - The `AWS_PROFILE` environment variable can be used to specify a named profile.
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
   3. Run `aws sso login` to start a new SSO session
   :::

3. **Web Identity Token Credentials**:
   - Used primarily with OpenID Connect (OIDC) and OAuth
   - Common in Kubernetes environments using IAM roles for service accounts (IRSA)

4. **ECS Container Credentials**:
   - Used when running in Amazon ECS containers
   - Automatically uses the task's IAM role
   - Retrieved from the ECS credential provider endpoint

5. **EC2 Instance Metadata Service (IMDSv2)**:
   - Used when running on EC2 instances
   - Automatically uses the instance's IAM role
   - Retrieved securely using IMDSv2

The connector will try each source in order until valid credentials are found. If no valid credentials are found, an authentication error will be returned.

:::note[IAM Permissions]
Regardless of the credential source, the IAM role or user must have appropriate DynamoDB permissions (e.g., `dynamodb:Scan`, `dynamodb:DescribeTable`) to access the table.
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

| Permission | Purpose |
|------------|---------|
| `dynamodb:Scan` | Required. Allows reading all items from the table |
| `dynamodb:DescribeTable` | Required. Allows fetching table metadata and schema information |

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
