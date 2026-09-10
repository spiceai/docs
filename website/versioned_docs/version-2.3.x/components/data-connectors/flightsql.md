---
title: 'Flight SQL Data Connector'
sidebar_label: 'Flight SQL Data Connector'
description: 'Flight SQL Data Connector Documentation'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Connect to any Flight SQL compatible server (e.g. Influx 3.0, CnosDB, other Spice runtimes!) as a connector for federated SQL queries.

```yaml
- from: flightsql:my_catalog.good_schemas.cool_dataset
  name: cool_dataset
  params:
    flightsql_endpoint: http://127.0.0.1:50051
    flightsql_username: spicy
    flightsql_password: ${secrets:my_flightsql_pass}
```

## Configuration

### `from`

The `from` field takes the form `flightsql:dataset` where `dataset` is the fully qualified name of the dataset to read from.

:::info
Unquoted identifiers are normalized to lowercase. To reference a dataset with mixed-case characters, wrap each case-sensitive part in double quotes: `flightsql:my_catalog."MySchema"."MyTable"`. See [Identifier Case Sensitivity](./index.md#identifier-case-sensitivity-and-quoting).
:::

### `name`

The dataset name. This will be used as the table name within Spice. The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords).

### `params`

| Parameter name       | Description                                                                                                                                                                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `flightsql_endpoint` | Required. The Apache Flight endpoint used to connect to the Flight SQL server.                                                                                                                                                                                 |
| `flightsql_username` | Optional. The username to use in the underlying Apache flight Handshake Request to authenticate to the server (see [reference](https://arrow.apache.org/docs/format/Flight.html#authentication)).                                                    |
| `flightsql_password` | Optional. The password to use in the underlying Apache flight Handshake Request to authenticate to the server. Use the [secret replacement syntax](../secret-stores/) to load the password from a secret store, e.g. `${secrets:my_flightsql_pass}`. |
| `flightsql_tls_ca_certificate_file` | Optional. Path to a CA certificate file (PEM format) to use for TLS verification instead of system certificates. |
| `flightsql_tls_client_certificate_file` | Optional. Path to a PEM client certificate chain for mutual TLS (mTLS). Must be set together with `flightsql_tls_client_key_file`. Mutually exclusive with `flightsql_tls_client_certificate`. |
| `flightsql_tls_client_key_file` | Optional. Path to the PEM private key matching `flightsql_tls_client_certificate_file`. Must be set together with `flightsql_tls_client_certificate_file`. Mutually exclusive with `flightsql_tls_client_key`. |
| `flightsql_tls_client_certificate` | Optional. Inline PEM client certificate chain for mutual TLS (mTLS). Use the [secret replacement syntax](../secret-stores/) to load from a secret store, e.g. `${secrets:my_cert}`. Must be set together with `flightsql_tls_client_key`. Mutually exclusive with `flightsql_tls_client_certificate_file`. |
| `flightsql_tls_client_key` | Optional. Inline PEM private key for mutual TLS (mTLS). Use the [secret replacement syntax](../secret-stores/) to load from a secret store, e.g. `${secrets:my_key}`. Must be set together with `flightsql_tls_client_certificate`. Mutually exclusive with `flightsql_tls_client_key_file`. |

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores/). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores/#using-secrets).
