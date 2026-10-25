---
title: 'Environment Secret Store'
sidebar_label: 'Environment Secret Store'
sidebar_position: 1
description: 'Environment Variables Secret Store Documentation'
pagination_prev: null
---

The `env` store type enables Spice to read secrets from environment variables and any `.env.local` or `.env` files in the project directory. This is the default secret store and is loaded automatically as:

```yaml
secrets:
  - from: env
    name: env
```

Reference secrets directly in parameters using the syntax `${env:MY_ENV_VAR}`. This will load the value of the environment variable `MY_ENV_VAR` into the parameter.

Example:

```yaml
datasets:
  - from: postgres:my_table
    name: my_table
    params:
      pg_host: localhost
      pg_port: 5432
      pg_user: ${env:MY_PG_USER}
      pg_pass: ${env:MY_PG_PASSWORD}
```

The `${}` replacement syntax also works within a larger string, like a connection string:

```yaml
datasets:
  - from: mysql:my_table
    name: my_table
    params:
      connection_string: mysql://${env:MY_USER}:${env:MY_PASSWORD}@localhost:3306/my_db
```

Keys are matched case-sensitively, and the store also tries the UPPERCASED key to follow the convention of environment variables, so `${secrets:my_pg_user}` finds `MY_PG_USER` when none of `SPICE_my_pg_user`, `my_pg_user`, or `SPICE_MY_PG_USER` is set. See [Precedence](#precedence) for the full lookup order.

Example:
  
```yaml
datasets:
  - from: postgres:my_table
    name: my_table
    params:
      pg_host: localhost
      pg_port: 5432
      pg_user: ${secrets:my_pg_user} # MY_PG_USER, unless a higher-priority spelling is set
      pg_pass: ${secrets:my_pg_password} # MY_PG_PASSWORD, unless a higher-priority spelling is set
```

## .env Files

The `env` secret store reads secrets from any `.env.local` or `.env` files in the project directory. The `.env.local` file takes precedence over the `.env` file. This enables defining template secrets in the `.env` file which can be checked into source control and overriding them with local secrets in the `.env.local` file.

Example `.env` file:

```env
MY_PG_USER=postgres
MY_PG_PASSWORD=postgres
```

### Parameters

| Parameter Name | Description                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| `file_path`    | Optional. Path to a specific `.env` file to load. When set, the store reads this file instead of `.env` and `.env.local` in the project directory. |

To load environment variables from a specific `.env` file, use the `file_path` parameter. A store with `file_path` reads only that file, and looks up a key in the process environment when the file does not define it.

```yaml
secrets:
  - from: env
    name: env
    params:
      file_path: ./custom/path/to/.env
```

To continue loading `.env` or `.env.local`, specify them as additional secret stores:

```yaml
secrets:
  - from: env
    name: env
  - from: env
    name: env
    params:
      file_path: ./custom/path/to/.env
```

## Precedence

For a key such as `my_key`, the `env` store tries four spellings in order: `SPICE_my_key`, `my_key`, `SPICE_MY_KEY`, then `MY_KEY`. Where it looks depends on whether the store sets `file_path`:

| Store                    | Lookup                                                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Default (no `file_path`) | Each spelling in turn in the process environment, which includes the exported `.env.local` and `.env` values (see below). The first spelling found wins. |
| With `file_path`         | Every spelling in the file named by `file_path` first, then every spelling in the process environment.                                   |

For the same variable name, a value set in the process environment wins over `.env.local`, and `.env.local` wins over `.env`, because exporting a file never overwrites a variable that is already set. Spelling order applies across sources: if the process environment sets `MY_KEY=prod` and `.env.local` sets `SPICE_MY_KEY=staging`, then `${secrets:my_key}` resolves to `staging`, because `SPICE_MY_KEY` is tried before `MY_KEY`. To make a process environment value win, set it under the same spelling the file uses.

### Values Exported to the Process Environment

Before any secret store loads, Spice exports the variables in the project's `.env.local` and `.env` files to the process environment, without overwriting variables already set. Libraries that read the process environment directly, such as the AWS SDK default credential chain, `AWS_REGION`, and `GOOGLE_APPLICATION_CREDENTIALS`, therefore see these values even when no `env` store is configured or the `env` store is not defined first. Because a `file_path` store falls back to the process environment, a key it does not find in its own file can resolve to a value from the project's `.env.local` or `.env` file.

The file named by `file_path` is not exported by its store. Unless it is the project's `.env.local` or `.env` file, which Spice exports regardless of the store configuration, its values are available only through `${env:...}` or `${secrets:...}` references, and a library that reads the process environment does not see them.

