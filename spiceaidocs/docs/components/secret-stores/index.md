---
title: 'Secret Stores'
sidebar_label: 'Secret Stores'
description: ''
sidebar_position: 3
pagination_prev: null
pagination_next: null
---

A Secret Store is a location where `secrets` are stored and can be used to store sensitive data, like passwords, tokens, and secret keys.

Spice supports secret stores: [`env`](./env/index.md), [`kubernetes`](./kubernetes/index.md), [`keyring`](./keyring/index.md) and [`aws_secrets_manager`](./aws-secrets-manager/index.md). The `env` secret store is loaded by default.

### Default

The `env` secret store is loaded by default. It reads secrets from environment variables and any `.env.local` or `.env` files in the project directory.

```yaml
secrets:
  - from: env
    name: env
```

## Configured Secret Stores

Secret Stores can be configured using the `secrets` section of the `spicepod.yml` file.

The Secret Store type and name are specified using the `from` and `name` fields. The `name` can be referenced by other components, like datasets or models. Some Secret Stores support adding a selector delimited by a colon (`:`), For example, when using the Kubernetes Secret Store, `from: kubernetes:my_secret` selects and enables the `my_secret` secret only to be referenced.

Additional parameters may be specified in the `params` field, which are typically specific to the secret store type.

Example:
```yaml
secrets:
  - from: kubernetes:my_secret
    name: k8s
  - from: env
    name: env
```

## Using referenced secrets in component parameters

Secrets may be used by components with the syntax `${<secret_store_name>:<key_name>}`. For example, to reference a secret stored as an environment variable named `MY_SECRET` in the `env` secret store, use `${env:MY_SECRET}`.

Example:
```yaml
datasets:
  - from: postgres:my_table
    name: my_table
    params:
      pg_host: localhost
      pg_port: 5432
      pg_user: ${env:PG_USER}
      pg_pass: ${env:FOO_PASSWORD} # The environment variable name may differ from the parameter name.
```

This syntax also works within a larger string, like a connection string:

```yaml
datasets:
  - from: mysql:my_table
    name: my_table
    params:
      mysql_connection_string: mysql://${env:USER}:${env:PASSWORD}@localhost:3306/mysql_db
```

The `<secret_store_name>` value in `${<secret_store_name>:<key_name>}` is the `name` value defined in the secret store configuration. This can be renamed to any value.

Example:
```yaml
secrets:
  - from: env
    name: my_env
```

```yaml
datasets:
  - from: postgres:my_table
    name: my_table
    params:
      pg_host: localhost
      pg_port: 5432
      pg_user: ${my_env:PG_USER}
      pg_pass: ${my_env:PG_PASS}
```

## Load secrets from multiple secret stores

Spice supports configuring multiple secret stores which are loaded in the order they are defined in the `secrets` section of the `spicepod.yml` configuration file. If a secret is defined in multiple secret stores, the secret store defined last will take precedence.

To load a secret from any of the configured secret stores in precedence order, use the `${secrets:<key_name>}` syntax.

Example:
```yaml
secrets:
  - from: env
    name: env
  - from: keyring
    name: keyring
```

```yaml
datasets:
  - from: postgres:my_table
    name: my_table
    params:
      pg_host: localhost
      pg_port: 5432
      pg_user: ${secrets:pg_user}
      pg_pass: ${secrets:pg_pass}
```

In this example, the runtime would look for `pg_user` and `pg_pass` in the `keyring` secret store first and then in the `env` secret store. The `<key_name>` value in `${secrets:<key_name>}` is automatically uppercased for the `env` secret store.

To override the `keyring` secret store secrets with environment variables, re-order the secret stores in the configuration file:

```yaml
secrets:
  - from: keyring
    name: keyring
  - from: env
    name: env
```

## Secret Stores

import DocCardList from '@theme/DocCardList';

<DocCardList />
