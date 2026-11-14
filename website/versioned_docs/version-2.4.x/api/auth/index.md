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

## Read-only and read-write keys

Each API key is read-only unless it ends in `:rw`. The suffix is not part of the key: clients send the text before it. A `:ro` suffix marks a key as read-only explicitly.

```yaml
runtime:
  auth:
    api-key:
      enabled: true
      keys:
        - ${ secrets:reader_key } # read-only
        - ${ secrets:writer_key }:rw # read-write; clients send the value of writer_key
```

Spice v2.4 recognizes only the `:rw` and `:ro` suffixes. Any other ending after the last `:`, such as `:admin`, is part of the key. That key is read-only, and clients send the full value, including the ending.

### Routes that need a read-write key

These HTTP routes change runtime state or act on other callers' queries, so they need a read-write key, or a verified client certificate when client certificates identify callers:

| Method  | Route                                                |
| ------- | ---------------------------------------------------- |
| `POST`  | `/v1/datasets/{name}/acceleration/refresh`           |
| `PATCH` | `/v1/datasets/{name}/acceleration`                   |
| `POST`  | `/v1/datasets/{name}/acceleration/snapshots/current` |
| `POST`  | `/v1/datasets/{name}/cdc`                            |
| `POST`  | `/v1/packages/generate`                              |
| `GET`   | `/v1/sql/active`                                     |
| `POST`  | `/v1/sql/{query_id}/cancel`                          |
| `POST`  | `/v1/queries/{query_id}/cancel`                      |

A request to one of these routes with a read-only key gets `403 Forbidden` with the body `{"message":"API key does not allow write access"}`. The key is checked before the request body is read, so a read-only key gets `403` even when the body is malformed or has the wrong `Content-Type`, not the route's `400`, `415`, or `422` parsing error. A request without a valid API key gets `401 Unauthorized`.

The OpenTelemetry metrics export service on the Flight port, `MetricsService/Export`, also needs a read-write key. It refuses a read-only key with the gRPC status `PERMISSION_DENIED` and the message `API key does not allow write access`, and stores nothing from that export.

When `runtime.auth` is not configured, a request carries no API key, and none of these routes refuses it for lack of write access.

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

API keys do not protect the Prometheus metrics endpoint. When `spiced` runs with `--metrics`, `/metrics` is served on its own listener without an API key check, and its labels include dataset names and HTTP route templates. Bind the metrics endpoint to a loopback or private interface, as described in [Restrict Access to the Metrics Endpoint](../../features/observability/index.md#restrict-access-to-the-metrics-endpoint).

## Flight SQL

For the Flight SQL endpoint, the API key is expected to be included in the `Authorization` header as a Bearer token, i.e. `Authorization: Bearer ${ api_key }`.

## Spice CLI

When API key authentication is enabled, the Spice CLI can connect to the runtime by specifying the `--api-key` argument. Commands that change runtime state, such as `spice refresh`, need a [read-write key](#read-only-and-read-write-keys). For example, with these keys configured:

```yaml
runtime:
  auth:
    api-key:
      enabled: true
      keys:
        - 1234567890 # read-only
        - 0987654321:rw # read-write; clients send 0987654321
```

```bash
spice sql --api-key 1234567890
spice status --api-key 1234567890
spice refresh taxi_trips --api-key 0987654321 # needs the read-write key
# etc.
```

With the read-only key, `spice refresh` fails, because the runtime returns `403 Forbidden` with `API key does not allow write access`:

```text
spice refresh taxi_trips --api-key 1234567890
 INFO Refreshing dataset taxi_trips ...
ERROR forbidden: your API key is valid but does not have permission for this resource. Check API key scopes or contact your org admin.
```

## Cookbook

- A cookbook recipe to secure the HTTP, Arrow Flight, and OpenTelemetry endpoints with API keys. [Spice.ai API Key Authentication](https://github.com/spiceai/cookbook/tree/trunk/api_key#readme)
