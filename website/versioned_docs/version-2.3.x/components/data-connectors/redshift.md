---
title: 'Amazon Redshift Data Connector'
description: 'Connect to Amazon Redshift using the PostgreSQL connector in Spice.'
sidebar_label: 'Redshift Data Connector'
sidebar_position: 10
---

Amazon Redshift is a columnar OLAP database compatible with PostgreSQL. To connect Redshift to Spice, use the [PostgreSQL data connector](./postgres) and specify the Redshift cluster connection parameters.

## Configuration

### `from`

Use the format `postgres:schema.table` to reference a Redshift table. The connector parameters should match your Redshift cluster settings.

### Example Spicepod

```yaml
version: v1
kind: Spicepod
name: tpch-read
datasets:
  - from: postgres:public.customer
    name: customer
    params:
      pg_host: ${secrets:PG_HOST}
      pg_port: 5439
      pg_sslmode: prefer
      pg_db: dev
      pg_user: ${secrets:PG_USER}
      pg_pass: ${secrets:PG_PASS}
    acceleration:
      enabled: true

  - from: postgres:public.lineitem
    name: lineitem
    params:
      pg_host: ${secrets:PG_HOST}
      pg_port: 5439
      pg_sslmode: prefer
      pg_db: dev
      pg_user: ${secrets:PG_USER}
      pg_pass: ${secrets:PG_PASS}
    acceleration:
      enabled: true

  - from: postgres:public.nation
    name: nation
    params:
      pg_host: ${secrets:PG_HOST}
      pg_port: 5439
      pg_sslmode: prefer
      pg_db: dev
      pg_user: ${secrets:PG_USER}
      pg_pass: ${secrets:PG_PASS}
    acceleration:
      enabled: true

  - from: postgres:public.orders
    name: orders
    params:
      pg_host: ${secrets:PG_HOST}
      pg_port: 5439
      pg_sslmode: prefer
      pg_db: dev
      pg_user: ${secrets:PG_USER}
      pg_pass: ${secrets:PG_PASS}
    acceleration:
      enabled: true

  - from: postgres:public.part
    name: part
    params:
      pg_host: ${secrets:PG_HOST}
      pg_port: 5439
      pg_sslmode: prefer
      pg_db: dev
      pg_user: ${secrets:PG_USER}
      pg_pass: ${secrets:PG_PASS}
    acceleration:
      enabled: true

  - from: postgres:public.partsupp
    name: partsupp
    params:
      pg_host: ${secrets:PG_HOST}
      pg_port: 5439
      pg_sslmode: prefer
      pg_db: dev
      pg_user: ${secrets:PG_USER}
      pg_pass: ${secrets:PG_PASS}
    acceleration:
      enabled: true

  - from: postgres:public.region
    name: region
    params:
      pg_host: ${secrets:PG_HOST}
      pg_port: 5439
      pg_sslmode: prefer
      pg_db: dev
      pg_user: ${secrets:PG_USER}
      pg_pass: ${secrets:PG_PASS}
    acceleration:
      enabled: true

  - from: postgres:public.supplier
    name: supplier
    params:
      pg_host: ${secrets:PG_HOST}
      pg_port: 5439
      pg_sslmode: prefer
      pg_db: dev
      pg_user: ${secrets:PG_USER}
      pg_pass: ${secrets:PG_PASS}
    acceleration:
      enabled: true
```

### Parameters

| Parameter Name              | Description                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `pg_connection_string`      | Optional. A [PostgreSQL connection string](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING). Overrides individual connection parameters when provided. |
| `pg_host`                   | Hostname or IP address of the Redshift cluster                                                                    |
| `pg_port`                   | The PostgreSQL TCP port. Redshift uses port `5439` by default — set this explicitly.                              |
| `pg_db`                     | Database name                                                                                                     |
| `pg_user`                   | Username for authentication                                                                                       |
| `pg_pass`                   | Password for authentication (use secret reference)                                                                |
| `pg_sslmode`                | SSL mode. Default `verify-full`. Supported values: `disable`, `prefer`, `require`, `verify-ca`, `verify-full`.    |
| `pg_sslrootcert`            | Optional. Path to a custom root certificate for SSL verification                                                  |
| `pg_connection_pool_min_idle` | Optional. The minimum number of idle connections to keep open in the pool. Default is `1`.                       |
| `connection_pool_size`      | Optional. The maximum number of connections in the connection pool. Default is `5`.                               |

## Supported Types

Redshift types are mapped to PostgreSQL types. See the [PostgreSQL connector documentation](./postgres) for details on supported types and configuration.

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For details, see the [secret stores documentation](../secret-stores/) and [using referenced secrets guide](../secret-stores/#using-secrets).

## Cookbook

- A cookbook recipe to configure Amazon Redshift as a data connector in Spice. [Redshift Data Connector](https://github.com/spiceai/cookbook/tree/trunk/redshift#readme)

## References

- [Amazon Redshift Documentation](https://docs.aws.amazon.com/redshift/latest/mgmt/welcome.html)
- [PostgreSQL Connector Documentation](./postgres)
