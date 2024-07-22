---
title: 'Secret Stores'
sidebar_label: 'Secret Stores'
description: ''
sidebar_position: 4
pagination_prev: null
pagination_next: null
---

A Secret Store is a location where `secrets` are stored and can be used to store sensitive data, like passwords, tokens, and secret keys.

Spice supports several secret stores: `env`, `kubernetes`, `keyring` and `aws_secrets_manager`. The `env` secret store is loaded by default.

### Default

The `env` secret store is loaded by default. It reads secrets from environment variables and any `.env.local` or `.env` files in the project directory.

```yaml
secrets:
  - from: env
    name: env
```

## Define secret stores

Define secret stores in the `secrets` section of the configuration file. The `from` field specifies the secret store type, and the `name` field specifies the name of the secret store to be referenced in the parameters. Some secret store types support adding a `:` to the end of the field, as an additional selector. For example, `from: kubernetes:my_secret` would select the `my_secret` secret in the Kubernetes secret store, and look for keys within that Kubernetes secret only.

Additional parameters can also be specified in the `params` field. The parameters are specific to the secret store type.

Example:
```yaml
secrets:
  - from: kubernetes:my_secret
    name: k8s
  - from: env
    name: env
```

## Reference secrets in parameters

Reference secrets defined in a secret store by using the syntax `${<secret_store_name>:<key_name>}`. For example, to reference a secret stored as an environment variable named `MY_SECRET` in the `env` secret store, use `${env:MY_SECRET}`.

Example:
```yaml
datasets:
  - from: postgres:my_table
    name: my_table
    params:
      pg_host: localhost
      pg_port: 5432
      pg_user: ${env:PG_USER}
      pg_pass: ${env:FOO_PASSWORD} # The environment variable doesn't need to be named the same as the parameter.
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

Spice allows configuring multiple secret stores in the `secrets` section. The secret stores are loaded in the order they are defined in the configuration file. If a secret is defined in multiple secret stores, the secret store defined last will take precedence.

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

This example would look for `pg_user` and `pg_pass` in the `keyring` secret store first, and then in the `env` secret store. The `<key_name>` value in `${secrets:<key_name>}` is automatically uppercased for the `env` secret store.

In this example, to allow environment variables to override the `keyring` secret store, change the order of the secret stores in the configuration file:

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
