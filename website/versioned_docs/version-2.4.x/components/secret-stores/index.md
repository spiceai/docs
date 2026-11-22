---
title: 'Secret Stores'
sidebar_label: 'Secret Stores'
description: 'Configure secret stores to manage sensitive data like passwords, tokens, and API keys.'
image: /img/og/secret-stores.png
sidebar_position: 3
pagination_prev: null
pagination_next: null
---

A Secret Store is a secure location where secrets (such as passwords, tokens, and API keys) are stored. Spice retrieves secrets from configured stores at runtime and injects them into component parameters.

Supported secret stores include: [`env`](secret-stores/env), [`kubernetes`](secret-stores/kubernetes), [`keyring`](secret-stores/keyring), [`aws_secrets_manager`](secret-stores/aws-secrets-manager), [`azure_keyvault`](secret-stores/azure-keyvault), and [`hashicorp_vault`](secret-stores/hashicorp-vault) (Spice.ai Enterprise). The `env` secret store is loaded by default.

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

Additional parameters may be specified in the `params` field, which are specific to the secret store type. Unknown parameters are rejected with an error listing the supported parameter names, helping catch typos early.

Parameter values support `${ env:KEY }` references to load values from environment variables at startup.

Example:

```yaml
secrets:
  - from: kubernetes:my_secret
    name: k8s
  - from: env
    name: env
```

## Using referenced secrets in component parameters {#using-secrets}

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

## Unresolved Secret References

Every secret reference in a dataset's or catalog's `params` must resolve. When a reference does not resolve, the runtime does not load that dataset or catalog: its status is `Error`, and the error names each parameter and reference that did not resolve, without any secret value. Other datasets and catalogs keep loading. For example, with `file_format: ${secrets:FMT}` and no store holding `FMT`:

```text
Unable to resolve secret reference(s): parameter `file_format`: Secret `${ secrets:FMT }` not found in any configured secret store (searched: [env]). The component was not loaded, instead of loading with an empty value. Define the secret in a configured secret store (an empty value is accepted for an intentionally optional secret), or remove the reference. Docs: https://spiceai.org/docs/components/secret-stores
```

A reference does not resolve when no configured store holds the key, when it names a store that is not configured, or when a store fails while looking it up, for example because of an expired token or a network error. The first two are configuration errors, and the runtime does not retry the load. A store failure is retried, because the key may exist in the store that failed.

A secret defined with an empty value, such as an environment variable set to an empty string, resolves to that empty value. To keep a parameter optional, define its secret as empty.

Only dataset and catalog `params` are checked this way. An unresolved reference elsewhere, such as in a model's `params` or an acceleration's `params`, logs an error and is replaced with an empty string. In v2.4.2 and earlier, dataset and catalog `params` behaved the same way, so a dataset could load and report ready with an empty parameter value.

## Secret Stores

import DocCardList from '@theme/DocCardList';

<DocCardList />
