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

When used with the `${secrets:<my_key>}` syntax, the `<my_key>` variable is UPPERCASED to follow the convention of environment variables.

Example:
  
```yaml
datasets:
  - from: postgres:my_table
    name: my_table
    params:
      pg_host: localhost
      pg_port: 5432
      pg_user: ${secrets:my_pg_user} # same as ${env:MY_PG_USER}
      pg_pass: ${secrets:my_pg_password} # same as ${env:MY_PG_PASSWORD}
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

For a key such as `my_key`, the `env` store looks up `SPICE_my_key`, `my_key`, `SPICE_MY_KEY`, then `MY_KEY`, and returns the first one defined. Where it looks depends on whether the store sets `file_path`:

| Store                 | Order of lookup                                                    |
| --------------------- | ------------------------------------------------------------------ |
| Default (no `file_path`) | The process environment, then `.env.local`, then `.env`.       |
| With `file_path`      | The file named by `file_path`, then the process environment.      |


### Values Exported to the Process Environment

Before any secret store loads, Spice exports the variables in the project's `.env.local` and `.env` files to the process environment, without overwriting variables already set. Libraries that read the process environment directly, such as the AWS SDK default credential chain, `AWS_REGION`, and `GOOGLE_APPLICATION_CREDENTIALS`, therefore see these values even when no `env` store is configured or the `env` store is not defined first. Because a `file_path` store falls back to the process environment, a key it does not find in its own file can resolve to a value from the project's `.env.local` or `.env` file.

The file named by `file_path` is not exported. Its values are available only through `${env:...}` or `${secrets:...}` references, so a library that reads the process environment does not see them.

