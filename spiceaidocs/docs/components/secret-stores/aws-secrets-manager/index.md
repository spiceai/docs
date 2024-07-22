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

## Example

A complete spicepod definition with a dataset that uses a secret from AWS Secrets Manager.

```yaml
version: v1beta1
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

## AWS Secrets Manager Access

To use AWS Secrets Manager, an AWS account and a user in IAM Identity Center with the `secretsmanager:GetSecretValue` permission are required. Read [Authentication and access control for AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access.html) for details.

Use the [AWS CLI](https://docs.aws.amazon.com/cli/v1/userguide/cli-chap-authentication.html) to configure AWS access:

```bash
aws configure
```

Check configuration with:

```bash
aws sts get-caller-identity
aws secretsmanager get-secret-value --secret-id MyTestSecret
```
