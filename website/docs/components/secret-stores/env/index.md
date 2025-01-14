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

### Additional Parameters

To load environment variables from a specific `.env` file, use the `file_path` parameter. When a `file_path` parameter is specified, environment variables from `.env` or `.env.local` will not be loaded.

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
