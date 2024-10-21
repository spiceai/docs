---
title: 'Azure BlobFS Data Connector'
sidebar_label: 'Azure BlobFS Data Connector'
description: 'Azure BlobFS Data Connector Documentation'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The Azure BlobFS (ABFS) Data Connector enables federated SQL query on files stored in Azure Blob-compatible endpoints. This includes Azure BlobFS (`abfss://`) and Azure Data Lake (`adl://`) endpoints.

If a folder path is provided, all child files will be loaded.

File formats are specified using the `file_format` parameter, as described in [Object Store File Formats](/components/data-connectors/index.md#object-store-file-formats).

```yaml
datasets:
  - from: abfs://foocontainer/taxi_sample.csv
    name: azure_test
    params:
      azure_account: spiceadls
      azure_access_key: abc123==
      file_format: csv
```

## Dataset Schema Reference

### `from`

The ABFS-compatible URI to a folder or object in one of two forms:

- `from: abfs://<container>/<path>` with the account name configured using `abfs_account` parameter, or 
- `from: abfs://<container>@<account_name>.dfs.core.windows.net/<path>`

:::note

A valid URI must always be specified in the `from` field, even if you are setting the account or container name using [secrets](/components/secret-stores/index.md). When using secrets use a dummy account/container name and the values will be replaced with the values contained by the secrets at runtime.

See the example [below](#using-secrets-for-container-and-account-name).

:::

### `name`

The dataset name. This will be used as the table name within Spice.

Example: `name: cool_dataset`

```sql
SELECT COUNT(*) FROM cool_dataset
```

```shell
+----------+
| count(*) |
+----------+
| 6001215  |
+----------+
```

### `params`

#### Basic parameters

| Parameter name              | Description                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `abfs_account`              | Azure storage account name                                                              |
| `abfs_container_name`       | Azure storage container name                                                            |
| `abfs_sas_string`           | SAS Token to use for authorization                                                      |
| `abfs_endpoint`             | Storage endpoint to connect to. Defaults to `https://{account}.blob.core.windows.net`   |
| `abfs_use_emulator`         | Connect to a locally-running Azure Storage emulator. Valid values are `true` or `false` |
| `abfs_allow_http`           | Allow insecure HTTP connections                                                         |
| `abfs_authority_host`       | Use an alternative authority host. Defaults to `https://login.microsoftonline.com`      |
| `abfs_proxy_url`            | Proxy URL to use when connecting                                                        |
| `abfs_proxy_ca_certificate` | A trusted CA certificate for the proxy                                                  |
| `abfs_proxy_exludes`        | A list of hosts to exclude from proxy connections                                       |
| `abfs_disable_tagging`      | Ignore any tags provided to `put_opts`                                                  |
| `hive_partitioning_enabled` | Enable partitioning using hive-style partitioning from the folder structure. Defaults to `false` |

#### Authentication parameters

The following parameters are used when authenticating with Azure. Only one of `abfs_access_key`, `abfs_bearer_token`, `abfs_client_secret` or `abfs_skip_signature` can be set at the same time. If none of these are set the connector will default to using a [managed identity](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview)

| Parameter name              | Description                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| `abfs_access_key`           | Secret access key to use when authenticating                                                     |
| `abfs_bearer_token`         | `BEARER` token to use when authenticating                                                        |
| `abfs_client_id`            | Client ID to use with the client authentication flow                                             |
| `abfs_client_secret`        | Client Secret to use with the client authentication flow                                         |
| `abfs_tenant_id`            | Tenant ID to use with client authentication flow                                                 |
| `abfs_skip_signature`       | Skip fetching credentials and skip signing requests. Used for interacting with public containers |
| `abfs_msi_endpoint`         | The endpoing to use for acquiring managed identity tokens                                        |
| `abfs_federated_token_file` | File path for acquiring Azure federated identity token in Kubernetes                             |
| `abfs_use_cli`              | Set to `true` to use the Azure CLI to acquire access tokens                                      |

#### Retry parameters

| Parameter name                  | Description                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| `abfs_max_retries`              | Maximum number of retries                                                                    |
| `abfs_retry_timeout`            | Timeout for all retries. Accepts any duration string (i.e `5s`, `1m`, etc)                   |
| `abfs_backoff_initial_duration` | How long to wait before the initial retry. Accepts any duration string (i.e `5s`, `1m`, etc) |
| `abfs_backoff_max_duration`     | Maximum length to wait for a retry. Accepts any duration string (i.e `5s`, `1m`, etc)        |
| `abfs_backoff_base`             | Floating-point base of the exponential to use when backing off retries                       |

#### File format parameters

File formats are specified using the `file_format` parameter, as described in [Object Store File Formats](/components/data-connectors/index.md#object-store-file-formats).

## Examples

### Reading a CSV file using an Access Key

```yaml
datasets:
  - from: abfs://foocontainer/taxi_sample.csv
    name: azure_test
    params:
      abfs_account: spiceadls
      abfs_access_key: abc123==
      file_format: csv
```

### Reading from a public container

```yaml
datasets:
  - from: abfs://pubcontainer/taxi_sample.csv
    name: pub_data
    params:
      abfs_account: spiceadls
      abfs_skip_signature: true
      file_format: csv
```

### Using secrets for container and account name

```yaml
datasets:
  # dummy_container will be overridden by the value in `abfs_container`
  - from: abfs://dummy_container/my_csv.csv
    name: prod_data
    params:
      abfs_account: ${ secrets:PROD_ACCOUNT }
      abfs_container: ${ secrets:PROD_CONTAINER }
      file_format: csv
```

### Connecting to the Storage Emulator

```yaml
datasets:
  - from: abfs://test_container/test_csv.csv
    name: test_data
    params:
      abfs_use_emulator: true
      file_format: csv
```

### Authenticating using Client Authentication

```yaml
datasets:
  - from: abfs://my_data/input.parquet
    name: my_data
    params:
      abfs_tentant_id: B3E1A8F4-9D5B-4D3B-8D2E-1F4A9D5B4D3B
      abfs_client_id: ${ secrets:MY_CLIENT_ID }
      abfs_client_secret: ${ secrets:MY_CLIENT_SECRET }
```