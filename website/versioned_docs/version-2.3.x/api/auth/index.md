---
title: 'Authentication'
sidebar_label: 'Authentication'
sidebar_position: 3
desired_sidebar: api
description: 'Authentication documentation'
pagination_prev: null
pagination_next: null
tags:
  - api
  - auth
  - security
---

Spice supports adding optional authentication to its API endpoints via configurable API keys.

Use the `auth` section as a child to `runtime` to provide the API keys. Multiple API keys can be specified, and any of the keys can be used to authenticate requests.

```yaml
runtime:
  auth:
    api-key:
      enabled: true
      keys:
        - ${ secrets:api_key } # Use the secret replacement syntax to load the API key from a secret store
        - 1234567890 # Or specify the API key directly
```

To learn more about secrets, see [Secret Stores](../components/secret-stores).

:::info

The API key authentication is applied on startup and changes will not take effect until the runtime is restarted.

:::

## HTTP

For HTTP routes, the API key can be supplied in either the `X-API-Key` header or the `Authorization: Bearer ${ api_key }` header. The `Bearer` scheme is matched case-insensitively. If both headers are present, `X-API-Key` takes precedence.

```bash
> curl -i "http://localhost:8090/v1/sql" -H "X-API-Key: 1234567890" -d 'SELECT 1'

HTTP/1.1 200 OK
content-type: text/plain; charset=utf-8
x-cache: Miss from spiceai
content-length: 16
date: Fri, 08 Nov 2024 07:14:24 GMT

[{"Int64(1)":1}]
```

Or using `Authorization: Bearer`:

```bash
> curl -i "http://localhost:8090/v1/sql" -H "Authorization: Bearer 1234567890" -d 'SELECT 1'
```

The `/health` and `/v1/ready` endpoints are not protected and can be accessed without an API key.

## Flight SQL

For the Flight SQL endpoint, the API key is expected to be included in the `Authorization` header as a Bearer token, i.e. `Authorization: Bearer ${ api_key }`.

## Spice CLI

When API key authentication is enabled, the Spice CLI can connect to the runtime by specifying the `--api-key` argument.

```bash
spice sql --api-key 1234567890
spice status --api-key 1234567890
spice refresh taxi_trips --api-key 1234567890
# etc.
```
