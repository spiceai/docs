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

## Read-only, read-write, and admin keys

Each API key is read-only unless it ends in `:rw` or `:admin`. The suffix is not part of the key: clients send the text before it. A `:ro` suffix marks a key as read-only explicitly.

```yaml
runtime:
  auth:
    api-key:
      enabled: true
      keys:
        - ${ secrets:reader_key } # read-only
        - ${ secrets:writer_key }:rw # read-write; clients send the value of writer_key
        - ${ secrets:admin_key }:admin # admin; clients send the value of admin_key
```

An `:admin` key can do everything a read-write key can, and can also define, change, and remove datasets and catalogs with [SQL DDL](../../reference/sql/ddl.md). Defining a source can use any configured secret, read local files, and reach any host, so a read-write key, such as one an OpenTelemetry exporter uses, cannot do it.

:::warning[Breaking change]

In Spice v2.4 and earlier, a key written with a literal `:admin` ending is a read-only key whose value includes `:admin`. In later releases, it is an admin key whose value is the text before `:admin`.

:::

The built-in [`sql` tool](../../components/tools/index.md) writes data only for a request authenticated with a read-write key, or with a verified client certificate when client certificates identify callers, and only to a dataset or catalog configured with write access, such as `access: read_write`. Every other request, including a request to a runtime without `runtime.auth`, runs the tool read-only. This applies to tool calls a model makes from `/v1/chat/completions`, `/v1/responses`, [`/v1/messages`](../../features/large-language-models/messages.md), and the `ai()` SQL function, to `/v1/tools`, and to [MCP](../../features/large-language-models/mcp.md). Scheduled [worker](../../reference/spicepod/workers.md) prompts run as the runtime acting for the operator, with write access, so their `sql` tool calls can write. In v2.4.3 and earlier, worker prompts ran without an API key, and their `sql` tool calls were read-only.

### Tools that need a read-write key

Every tool is either read-only or read-write. A read-write tool can change data or act outside Spice: the `store_memory` tool and every tool of an [MCP server](../../components/tools/mcp.md) are read-write, because Spice cannot verify what an MCP server's tool does. The other built-in tools are read-only, and any caller may call them.

On a runtime with `runtime.auth`, only a request authenticated with a read-write key, or with a verified client certificate when client certificates identify callers, may call a read-write tool. The check applies on every path that runs a tool: `POST /v1/tools/{name}`, MCP `tools/call` and its pass-through to an MCP server, and the tool calls a model makes from `/v1/chat/completions`, `/v1/responses`, `/v1/messages`, and the `ai()` SQL function. A refused call is recorded in `runtime.task_history` as a failed `tool_use::<tool>` task. `POST /v1/tools/{name}` answers it with `403 Forbidden`:

```json
{"message":"Failed to call tool 'store_memory': the tool can change data or act outside Spice, and the credentials on this request do not allow write access. Retry with a read-write API key (a `runtime.auth.api-key.keys` entry ending in `:rw`). See https://spiceai.org/docs/api/auth"}
```

MCP returns the same message in the tool result with `isError: true`, and a model receives it as the tool's result. On a runtime without `runtime.auth`, the tool check refuses no caller, so a model's tool calls may use read-write tools. The [`/v1/mcp`](../../features/large-language-models/mcp.md) endpoint is separate: it rejects every request with `401 Unauthorized` when `runtime.auth` is not configured.

In v2.4.3 and earlier, a read-only key could call an MCP server's tools, and `POST /v1/tools/store_memory` with a read-only key answered `500`. Give callers that need MCP tools a read-write key.

### Routes that need a read-write key

These HTTP routes change runtime state or act on other callers' queries, so they need a read-write key, or a verified client certificate when client certificates identify callers:

| Method  | Route                                                 |
| ------- | ----------------------------------------------------- |
| `POST`  | `/v1/datasets/{name}/acceleration/refresh`            |
| `PATCH` | `/v1/datasets/{name}/acceleration`                    |
| `POST`  | `/v1/datasets/{name}/acceleration/snapshots/current`  |
| `POST`  | `/v1/datasets/{name}/cdc`                             |
| `POST`  | `/v1/metrics`                                         |
| `POST`  | `/v1/logs`                                            |
| `POST`  | `/v1/packages/generate`                               |
| `GET`   | `/v1/sql/active`                                      |
| `POST`  | `/v1/sql/{query_id}/cancel`                           |
| `POST`  | `/v1/queries/{query_id}/cancel`                       |

A request to one of these routes with a read-only key gets `403 Forbidden` with the body `{"message":"API key does not allow write access"}`. The key is checked before the request body is read, so a read-only key gets `403` even when the body is malformed or has the wrong `Content-Type`, not the route's `400`, `415`, or `422` parsing error. `/v1/metrics` and `/v1/logs` return the same message as a `google.rpc.Status`, as described in [OpenTelemetry Data Ingestion](../../features/data-ingestion/index.md#opentelemetry-data-ingestion). A request without an API key gets `401 Unauthorized`.

The OpenTelemetry gRPC export services on the Flight port, `MetricsService/Export` and `LogsService/Export`, also need a read-write key. They refuse a read-only key with the gRPC status `PERMISSION_DENIED` and the message `API key does not allow write access`, and store nothing from that export.

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

When API key authentication is enabled, the Spice CLI can connect to the runtime by specifying the `--api-key` argument.

```bash
spice sql --api-key 1234567890
spice status --api-key 1234567890
spice refresh taxi_trips --api-key 1234567890
# etc.
```

## Runtimes without authentication

When `runtime.auth` is not configured, `spiced` logs a warning at startup if the Spicepod has data that callers can change. The warning names each dataset or catalog with `access: read_write` or `access: read_write_create`, and each accelerated dataset, which callers can change, for example by requesting a refresh. For a Spicepod with a dataset `orders` that has `access: read_write`, an accelerated dataset `trips`, and a catalog `lake` that has `access: read_write_create`, the message reads:

```text
`runtime.auth` is not configured, so any caller who can reach this runtime can modify dataset 'orders' (`access: read_write`), dataset 'trips' (accelerated), catalog 'lake' (`access: read_write_create`). Configure `runtime.auth` with a read-write API key, or restrict network access to authorized callers. See https://spiceai.org/docs/api/auth
```

The warning itself does not change runtime behavior. It is not logged when [`runtime.tls.client_auth_mode`](../../reference/spicepod/runtime.md#runtimetlsclient_auth_mode) is `required`. To resolve it, configure `runtime.auth` with a [read-write key](#read-only-read-write-and-admin-keys) for callers that need to write, or restrict network access to the runtime to authorized callers.

## Cookbook

- A cookbook recipe to secure the HTTP, Arrow Flight, and OpenTelemetry endpoints with API keys. [Spice.ai API Key Authentication](https://github.com/spiceai/cookbook/tree/trunk/api_key#readme)
