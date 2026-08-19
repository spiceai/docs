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
- `-o`, `--output` string Where to store the resulting credentials. One of `env` (default; appends to a local `.env` file), `json` (prints the credentials as JSON to stdout), or `keychain` (stores them in the platform keychain, e.g. macOS Keychain).

:::note
`--output` applies to `spice login` itself (the Spice.ai login, with or without `--key`). The provider subcommands below always write to `.env`.
:::

#### Available Commands

- `abfs` Login to a Azure Storage Account
- `databricks` Login to a Databricks instance
- `delta-lake` Configure credentials to access a Delta Lake table
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

### Browser Login Flow

Running `spice login` without `--key` prints an auth code, opens the Spice.ai authorization page, and then polls the token exchange once per second while the browser flow is completed.

- **The wait is bounded at 5 minutes.** If the authorization is not completed in that window, the command exits with `Authentication timed out. Please try again.` — followed by the last retryable error, when there was one. It does not poll indefinitely.
- **A refusal stops immediately.** An explicitly denied authorization exits with `Access denied` without waiting out the deadline, as does a rejection the endpoint cannot answer differently on a retry (for example `400`, `401`, `403`, or `410`).
- **Transient failures keep polling.** Server errors (`5xx`), `408`, `429`, and network failures are retried until the deadline. So is `404`, which is the normal answer while the auth code has not been authorized yet — but an endpoint that answers `404` for the whole 5 minutes (typically a `SPICE_BASE_URL` pointing at the wrong deployment) stops at the deadline and says so.

`spice cloud login subscription` polls the same endpoint under the same 5-minute deadline.

### Credentials Stay on Their Origin

The auth code, device code, and access token in these flows are sent in the **request body**, which an HTTP `307` or `308` redirect replays verbatim to the redirect target. The CLI's credential-bearing HTTP clients therefore follow redirects only **within the same origin** (scheme, host, and port), and refuse any hop that leaves it rather than forwarding the credential to another host. This applies to the `spice login` flows, the Spice Cloud client, and the CLI's own runtime and Cloud Platform requests made with `--api-key`.

An off-origin redirect surfaces as the `3xx` response itself rather than as a transport error, so a misconfigured endpoint stays diagnosable.

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
