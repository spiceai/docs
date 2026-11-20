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
spice login --key "<API_KEY>"
```

### Browser Login Flow

Running `spice login` without `--key` in an interactive terminal offers the same choices as [`spice cloud login`](#spice-cloud-login). **Login with a web browser** runs `spice cloud login subscription`, which signs in to Spice Cloud with the [OAuth 2.0 authorization code flow](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1), [PKCE](https://datatracker.ietf.org/doc/html/rfc7636) (`S256`), and a [loopback redirect](https://datatracker.ietf.org/doc/html/rfc8252#section-7.3):

1. On the first sign-in, the CLI registers itself with Spice Cloud as a public client, with no client secret, and stores the client ID as `SPICE_SPICEAI_CLIENT_ID`. Later sign-ins reuse it.
2. The CLI listens on `127.0.0.1` on a random port and opens the Spice Cloud authorization page in a browser. Each sign-in uses a new PKCE verifier and `state` value.
3. After the sign-in is approved in the browser, the browser is redirected to `http://127.0.0.1:<port>/callback`. The CLI accepts the first redirect, closes the listener, and exchanges the authorization code for an access token and a refresh token.

The CLI asks only for the scopes its Spice Cloud commands use: `apps:read apps:write apps:delete deployments:read deployments:write secrets:read secrets:write instances:write`.

- **The wait is bounded at 5 minutes.** If the sign-in is not completed in that window, the command exits with `Timed out waiting for the browser sign-in. If the browser showed an error, run 'spice cloud logout', then 'spice login' again.` When a shared user credential is stored, `spice cloud logout` refuses the default `--scope active`; run `spice cloud logout --scope all` instead, which discards every stored Spice Cloud session and the stored OAuth client ID, so the next sign-in registers the CLI again.
- **A refused or mismatched response stops the sign-in.** An `error=` redirect, such as a denied sign-in, exits with `Spice Cloud refused the sign-in: <detail>`. A redirect whose `state` does not match this sign-in is refused.
- **A browser on another machine.** The loopback redirect only reaches a browser on the machine that runs the CLI. With `--device`, the CLI prints the authorization URL instead of opening it. After signing in on another machine, paste the address of the page the browser was redirected to, which fails to load there, into the terminal. The CLI also reads a pasted address without `--device` when stdin is a terminal.

The access token is short-lived. Before each `spice cloud` command except `login` and `logout`, the CLI renews a stored sign-in whose access token has less than 15 minutes left, using the refresh token stored beside it as `SPICE_SPICEAI_REFRESH_TOKEN`.

In Spice v2.4.3 and earlier, the browser login printed an auth code and polled a token exchange until the browser flow completed.

### Credentials Stay on Their Origin

The auth code, device code, and access token in these flows are sent in the **request body**, which an HTTP `307` or `308` redirect replays verbatim to the redirect target. The CLI's credential-bearing HTTP clients therefore follow redirects only **within the same origin** (scheme, host, and port), and refuse any hop that leaves it rather than forwarding the credential to another host. This applies to the `spice login` flows, the Spice Cloud client, and the CLI's own runtime and Cloud Platform requests made with `--api-key`.

An off-origin redirect surfaces as the `3xx` response itself rather than as a transport error, so a misconfigured endpoint stays diagnosable.

## `spice cloud login`

Authenticate with the Spice Cloud Platform. See [`spice cloud`](./cloud#login) for the rest of the Spice Cloud command surface.

Running `spice cloud login` with no subcommand offers two choices — **Login with a web browser** and **Paste an access token** — which run `subscription` and `token` respectively. The chooser needs an interactive terminal; non-interactive callers must name a method. `api` is not offered in the chooser and is always named explicitly.

### Methods

#### `spice cloud login subscription`

Browser-based OAuth login flow. Automatically opens a browser for authentication.

```shell
spice cloud login subscription
```

Use `--device` to print the URL without opening a browser (useful for SSH/headless environments), then paste the address the browser was redirected to after signing in. See [Browser Login Flow](#browser-login-flow):

```shell
spice cloud login subscription --device
```

#### `spice cloud login token`

Authenticate with a Spice Cloud access token. Alias: `pat`.

```shell
spice cloud login token --token "<TOKEN>"
```

Omit `--token` to enter the token at a secure prompt. Generate one at `/account/tokens` in the Spice Cloud portal.

The token can also be provided via the `SPICE_CLOUD_PAT` environment variable:

```shell
export SPICE_CLOUD_PAT="<TOKEN>"
spice cloud login token
```

#### `spice cloud login api`

Authenticate using OAuth2 client credentials for CI/automation workflows.

```shell
spice cloud login api --client-id "<CLIENT_ID>" --client-secret "<CLIENT_SECRET>"
```

Credentials can also be provided via environment variables:

```shell
export SPICE_CLOUD_CLIENT_ID="<CLIENT_ID>"
export SPICE_CLOUD_CLIENT_SECRET="<CLIENT_SECRET>"
spice cloud login api
```

### Environment Variables

| Variable | Used by | Description |
| --- | --- | --- |
| `SPICE_CLOUD_PAT` | `login token` | Spice Cloud access token |
| `SPICE_CLOUD_CLIENT_ID` | `login api` | OAuth2 client ID |
| `SPICE_CLOUD_CLIENT_SECRET` | `login api` | OAuth2 client secret |
