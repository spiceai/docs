---
title: 'AWS Secrets Manager Secret Store'
sidebar_label: 'AWS Secrets Manager Secret Store'
sidebar_position: 3
description: 'AWS Secrets Manager Secret Store Documentation'
---

The `aws_secrets_manager` store enables Spice to read secrets from [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/).

```yaml
version: v1beta1
kind: Spicepod
name: taxi_trips
secrets:
  store: aws_secrets_manager
```
The store reads secrets named as `spice_secret_<secret-name>`, for example `dremio` login and password must be defined as `spice_secret_dremio` secret in [AWS Secrets Manager](https://console.aws.amazon.com/secretsmanager/listsecrets)

<img src="/img/secrets-aws-secrets-manager-dremio-1.png" alt="" width="800" />

<img src="/img/secrets-aws-secrets-manager-dremio-2.png" alt="" width="800" />

A complete spicepod definition with a dataset that uses a secret from AWS Secrets Manager created above.

```yaml
version: v1beta1
kind: Spicepod
name: taxi_trips
secrets:
  store: aws_secrets_manager

datasets:
- from: dremio:datasets.taxi_trips
  name: taxi_trips
  description: dremio taxi trips
  params:
    endpoint: grpc://20.163.171.81:32010
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
