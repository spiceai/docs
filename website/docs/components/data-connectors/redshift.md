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
version: v1beta1
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

| Parameter Name | Description                                        |
| -------------- | -------------------------------------------------- |
| `pg_host`      | Hostname or IP address of the Redshift cluster     |
| `pg_port`      | Port for Redshift (default: 5439)                  |
| `pg_sslmode`   | SSL mode (e.g., `prefer`)                          |
| `pg_db`        | Database name                                      |
| `pg_user`      | Username for authentication                        |
| `pg_pass`      | Password for authentication (use secret reference) |

## Supported Types

Redshift types are mapped to PostgreSQL types. See the [PostgreSQL connector documentation](./postgres) for details on supported types and configuration.

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For details, see the [secret stores documentation](../secret-stores) and [using referenced secrets guide](../secret-stores#using-secrets).

## References

- [Amazon Redshift Documentation](https://docs.aws.amazon.com/redshift/latest/mgmt/welcome.html)
- [PostgreSQL Connector Documentation](./postgres)
