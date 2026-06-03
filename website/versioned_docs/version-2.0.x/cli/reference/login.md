---
title: 'login'
sidebar_label: 'login'
pagination_prev: null
pagination_next: null
tags:
  - cli
  - authentication
  - login
---

Login to the Spice.ai Platform, or other services with sub-commands.

### Usage

```shell
spice login [command] [flags]
```

### Flags

- `-h`, `--help` Print this help message
- `-k`, `--key` string API key (for spice.ai)

#### Available Commands

- `abfs` Login to a Azure Storage Account
- `databricks` Login to a Databricks instance
- `delta_lake` Configure credentials to access a Delta Lake table
- `dremio` Login to a Dremio instance
- `postgres` Login to a Postgres instance
- `s3` Login to an s3 storage
- `sharepoint` Login to a Microsoft 365 sharepoint account
- `snowflake` Login to a Snowflake warehouse
- `spark` Login to a Spark Connect remote

#### Examples

```shell
spice login
```

### Additional Example

```shell
spice login --key <API_KEY>
```

## `spice cloud login`

Authenticate with the Spice Cloud Platform. Running `spice cloud login` without a subcommand opens an interactive method chooser when stdin is a TTY. Non-interactive callers must specify a method explicitly.

### Methods

#### `spice cloud login subscription`

Browser-based OAuth login flow. Automatically opens a browser for authentication.

```shell
spice cloud login subscription
```

Use `--device` to print the URL and one-time code without opening a browser (useful for SSH/headless environments):

```shell
spice cloud login subscription --device
```

#### `spice cloud login pat`

Authenticate with a personal access token.

```shell
spice cloud login pat --token <TOKEN>
```

The token can also be provided via the `SPICE_CLOUD_PAT` environment variable:

```shell
export SPICE_CLOUD_PAT=<TOKEN>
spice cloud login pat
```

#### `spice cloud login api`

Authenticate using OAuth2 client credentials for CI/automation workflows.

```shell
spice cloud login api --client-id <CLIENT_ID> --client-secret <CLIENT_SECRET>
```

Credentials can also be provided via environment variables:

```shell
export SPICE_CLOUD_CLIENT_ID=<CLIENT_ID>
export SPICE_CLOUD_CLIENT_SECRET=<CLIENT_SECRET>
spice cloud login api
```

### Environment Variables

| Variable | Used by | Description |
| --- | --- | --- |
| `SPICE_CLOUD_PAT` | `login pat` | Personal access token |
| `SPICE_CLOUD_CLIENT_ID` | `login api` | OAuth2 client ID |
| `SPICE_CLOUD_CLIENT_SECRET` | `login api` | OAuth2 client secret |
