---
title: 'Microsoft SQL Server Data Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the Microsoft SQL Server data connector in production: authentication, TLS, connection pooling and timeouts, observability, and known limitations.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - mssql
  - observability
---

Production operating guide for the [Microsoft SQL Server data connector](./index.md) covering authentication, TLS, connection pooling and timeouts, observability, and known limitations. For the full parameter list, see [`params`](./index.md#params).

## Authentication and Secrets

The connector supports SQL Server authentication (a SQL login and password) only. A dataset supplies credentials in one of two ways:

- `mssql_connection_string`, an [ADO.NET connection string](https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/connection-strings).
- The individual parameters `mssql_host`, `mssql_username`, and `mssql_password`, with optional `mssql_port` (default `1433`) and `mssql_database`.

When `mssql_connection_string` is set, the individual parameters are ignored, including `mssql_encrypt` and `mssql_trust_server_certificate`. Without a connection string, `mssql_host`, `mssql_username`, and `mssql_password` are required, and a missing one fails the dataset with an error that names it.

`mssql_connection_string`, `mssql_username`, and `mssql_password` are secret parameters. Resolve them from a [secret store](../../secret-stores/) with `${secrets:...}` rather than writing them into `spicepod.yaml`:

```yaml
datasets:
  - from: mssql:"SalesLT"."Customer"
    name: customer
    params:
      mssql_connection_string: ${secrets:mssql_connection_string}
```

The default build does not support Windows or Kerberos authentication: an `Integrated Security` key in the connection string is ignored, and the login uses the `User ID` and `Password` keys as SQL Server authentication. A `spiced` binary built with the opt-in `mssql-kerberos-unix` Cargo feature (not part of the default build) accepts `Integrated Security=true` (or `SSPI`) in `mssql_connection_string` and authenticates with Kerberos through GSSAPI. The individual parameters always use SQL Server authentication.

## TLS

How TLS is configured depends on which form of connection settings the dataset uses, and the two forms have different defaults.

### Individual Parameters

With individual parameters, `mssql_encrypt` defaults to `true`, which requires an encrypted connection and fails if one cannot be established. `false` (or `disable`) encrypts only the login exchange.

The server certificate is validated against the operating system's certificate store. `mssql_trust_server_certificate: true` accepts any certificate without validation, and the connector logs `Trusting the server certificate without validation.` at `WARN` for each connection. The individual parameters have no option for a custom CA certificate; use a connection string for that.

### Connection String

In a connection string, encryption is off when the `Encrypt` key is absent, so only the login exchange is encrypted. Set `Encrypt=true` explicitly in production:

```text
Server=tcp:sql.example.com,1433;Database=Sales;User ID=spice_reader;Password=<password>;Encrypt=true
```

The connection string accepts these TLS keys:

| Key                        | Values                                  | Behavior                                                                                                   |
| -------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `Encrypt`                  | `true`, `yes`, `false`, `no`, `DANGER_PLAINTEXT` | `true` requires encryption. `false` encrypts only the login. `DANGER_PLAINTEXT` encrypts nothing. Default: `false`. |
| `TrustServerCertificate`   | `true`, `yes`, `false`, `no`            | `true` accepts the server certificate without validation. Default: `false`.                               |
| `TrustServerCertificateCA` | Path to a `.pem`, `.crt`, or `.der` file | Validates the server certificate against this CA certificate instead of the operating system's store. A `.pem` or `.crt` file must contain exactly one certificate; a file with a certificate chain or bundle fails every connection attempt. |

`TrustServerCertificate=true` and `TrustServerCertificateCA` cannot be combined. For a server with a certificate from a private CA, use `TrustServerCertificateCA` rather than disabling validation. See [Configure SQL Server Database Engine for encrypting connections](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/configure-sql-server-encryption) for the server side.

## Connection Pooling and Timeouts

Each dataset opens its own connection pool, built on [bb8](https://docs.rs/bb8/0.9.1/bb8/struct.Builder.html). The connector exposes no pool parameters, so every dataset uses these settings:

| Setting                    | Value      | Behavior                                                                                                  |
| -------------------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| Maximum connections        | `10`       | The most connections one dataset holds open.                                                              |
| Minimum idle connections   | None       | Connections are opened on demand; none are held open in advance.                                         |
| Idle timeout               | 10 minutes | An idle connection is closed after this long.                                                             |
| Maximum lifetime           | 30 minutes | A connection is closed and replaced after this long.                                                      |
| Checkout validation        | `SELECT 1` | Each connection is checked with `SELECT 1` before it is handed to a query.                               |
| Pool wait timeout          | 30 seconds | How long a query waits for a connection before it fails.                                                  |
| Connection attempt timeout | 20 seconds | The limit for one connection attempt, covering DNS, TCP, TLS, login, and any read-only routing redirects. |

A connection attempt that fails is retried until the 30-second pool wait timeout expires. Each failed attempt is logged at `WARN`, so a rejected login or an unreachable replica appears in the log rather than only as a timeout:

```text
Failed to connect to SQL Server: <error>. Retrying.
```

An attempt that reaches the 20-second limit fails with an error naming the address it was dialing, which can be a replica named by a [read-only routing redirect](./index.md#availability-groups-and-read-only-routing) rather than the configured host.

### Sizing

Because every dataset has its own pool of up to 10 connections, the connections Spice can open to one server are up to 10 times the number of datasets that point at it. Plan the server's connection and worker budget with that total, plus other clients. To reduce load on the server, [accelerate](../../../features/data-acceleration/) frequently queried tables so that queries run against the local copy, and see [Performance](./performance.md) for pushdown and read-routing guidance.

## Metrics

The connector does not register component metrics. If a dataset enables metrics in its `metrics` section, the runtime logs `Dataset <name> does not support metrics. Skipping metric registration for <metrics>.` at `WARN` and continues. See [Component Metrics](../../../features/observability/component_metrics) for the connectors that do.

## Observability and Task History

Queries and acceleration refreshes against SQL Server datasets are recorded in [task history](../../../reference/task_history) as their enclosing query and refresh tasks. The connector does not add spans of its own.

The connector writes these log lines, which are the main signals for connection problems:

| Level   | Message                                                                                          | Meaning                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `WARN`  | `Failed to connect to SQL Server: <error>. Retrying.`                                            | A connection attempt failed and the pool is retrying it.                                 |
| `WARN`  | `Trusting the server certificate without validation.`                                            | Certificate validation is turned off for the connection.                                 |
| `WARN`  | `Column '<column>' of table '<table>' has unsupported data type '<type>' and will be ignored`     | The dataset's schema omits a column whose SQL Server type the connector cannot map.     |
| `DEBUG` | `SQL Server routed the connection to <host>:<port>`                                              | An availability group listener redirected a read-intent login to a secondary replica.   |

## Known Limitations

- The default build supports only SQL Server authentication. Windows and Microsoft Entra ID authentication are not available, and Kerberos requires a build with the opt-in `mssql-kerberos-unix` feature.
- Pool size, lifetimes, and timeouts are fixed and cannot be changed per dataset.
- The `MultiSubnetFailover` connection string key is ignored. When an availability group listener resolves to several addresses, the connector tries them one at a time, so an unreachable address listed first can stall the connection attempt until it times out ([spiceai/spiceai#12605](https://github.com/spiceai/spiceai/issues/12605)). See Microsoft's [listener connectivity guidance](https://learn.microsoft.com/en-us/sql/database-engine/availability-groups/windows/listeners-client-connectivity-application-failover) for how `MultiSubnetFailover` is meant to behave.
- A custom CA certificate can only be configured through `mssql_connection_string`.

## Troubleshooting

| Symptom                                                                 | Likely cause                                                            | Resolution                                                                                                     |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Repeated `Failed to connect to SQL Server: ... Retrying.` warnings      | Wrong credentials, an unreachable host, or a TLS failure.               | Read the error in the warning; it carries the server's reason.                                                 |
| A certificate validation error                                          | The server certificate is not issued by a CA in the operating system's store. | Use `TrustServerCertificateCA` in the connection string, or install the CA on the host running Spice.   |
| An error naming a redirect limit and the read-only routing list         | The availability group's routing list points back at the listener.      | Fix the read-only routing list. See [Availability groups and read-only routing](./index.md#availability-groups-and-read-only-routing). |
| Connections time out against a multi-subnet availability group listener | An unreachable listener address is tried first.                         | See the `MultiSubnetFailover` limitation above.                                                                |
| Traffic is not encrypted although `mssql_encrypt` is unset              | The dataset uses `mssql_connection_string`, where encryption defaults to off. | Add `Encrypt=true` to the connection string.                                                              |
