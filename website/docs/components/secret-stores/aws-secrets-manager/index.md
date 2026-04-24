---
title: 'AWS Secrets Manager Secret Store'
sidebar_label: 'AWS Secrets Manager Secret Store'
sidebar_position: 3
description: 'AWS Secrets Manager Secret Store Documentation'
---

The `aws_secrets_manager` store enables Spice to read secrets from [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) by specifying the secret’s name with a selector.

```yaml
secrets:
  from: aws_secrets_manager:my_secret_name
  name: aws
```

The store reads keys from the secret named in the selector. In the above example `my_secret_name` must be defined in [AWS Secrets Manager](https://console.aws.amazon.com/secretsmanager/listsecrets), and any keys referenced using `${aws:my_key}` will look for a key `my_key` within `my_secret_name`.

<img src="/img/secrets-aws-secrets-manager-1.png" alt="" width="800" />

<img src="/img/secrets-aws-secrets-manager-2.png" alt="" width="800" />

## Parameters

| Parameter Name   | Description                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| `region`         | Optional. The AWS region for the Secrets Manager API. Falls back to the SDK default credential chain if not set. |
| `endpoint_url`   | Optional. Custom endpoint URL for the Secrets Manager API (e.g., for VPC endpoints, FIPS, or LocalStack).        |
| `key`            | Optional. AWS access key ID. Must be set together with `secret`. Overrides the default credential chain.         |
| `secret`         | Optional. AWS secret access key. Must be set together with `key`. Overrides the default credential chain.        |
| `session_token`  | Optional. AWS session token for temporary (STS-issued) credentials. Only used when `key` and `secret` are set.   |

Parameter values support `${ env:KEY }` references to load values from environment variables.

```yaml
secrets:
  - from: aws_secrets_manager:my_secret_name
    name: aws
    params:
      region: ${ env:AWS_REGION }
      key: ${ env:AWS_ACCESS_KEY_ID }
      secret: ${ env:AWS_SECRET_ACCESS_KEY }
```

:::note
Unknown parameters are rejected with an error listing the supported parameter names. This helps catch typos — e.g., `regoin` instead of `region` will produce an immediate error instead of being silently ignored.
:::

## Example

A complete spicepod definition with a dataset that uses a secret from AWS Secrets Manager.

```yaml
version: v1
kind: Spicepod
name: taxi_trips
secrets:
  - from: aws_secrets_manager:dremio
    name: dremio

datasets:
- from: dremio:datasets.taxi_trips
  name: taxi_trips
  description: dremio taxi trips
  params:
    dremio_endpoint: grpc://20.163.171.81:32010
    dremio_username: ${dremio:username}
    dremio_password: ${dremio:password}
```

### Authentication

Spice will automatically load credentials to connect to AWS Secrets Manager from the following sources in order.

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
Regardless of the credential source, the IAM role or user must have appropriate secretsmanager permissions (e.g., `secretsmanager:GetSecretValue`) to access the secrets. If the Spicepod connects to multiple different AWS services, the permissions should cover all of them.
:::

## Required IAM Permissions

The IAM role or user needs the following permissions to access secrets in Secrets Manager:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue"
            ],
            "Resource": [
                "arn:aws:secretsmanager:us-east-1:123456789012:secret:TestEnv/*"
            ]
        }
    ]
}
```

### Permission Details

| Permission | Purpose |
|------------|---------|
| `secretsmanager:GetSecretValue` | Required. Allows reading secret values. |
