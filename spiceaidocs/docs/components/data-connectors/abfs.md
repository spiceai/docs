---
title: 'Azure BlobFS Data Connector'
sidebar_label: 'Azure BlobFS Data Connector'
description: 'Azure BlobFS Data Connector Documentation'
---

The Azure BlobFS (ABFS) Data Connector enables federated SQL queries on files stored in Azure Blob-compatible endpoints. This includes Azure BlobFS (`abfss://`) and Azure Data Lake (`adl://`) endpoints.

When a folder path is provided, all the contained files will be loaded.

File formats are specified using the `file_format` parameter, as described in [Object Store File Formats](/components/data-connectors/index.md#object-store-file-formats).

```yaml
datasets:
  - from: abfs://foocontainer/taxi_sample.csv
    name: azure_test
    params:
      abfs_account: spiceadls
      abfs_access_key: ${ secrets:access_key }
      file_format: csv
```

## Configuration

### `from`

Defines the ABFS-compatible URI to a folder or object:

- `from: abfs://<container>/<path>` with the account name configured using `abfs_account` parameter, or 
- `from: abfs://<container>@<account_name>.dfs.core.windows.net/<path>`

:::note

A valid URI must always be specified in the `from` field, even if you are setting the account or container name using [secrets](/components/secret-stores/index.md). When using secrets, a dummy account/container name must be used. The values will be replaced at runtime with the values contained in the secrets.

See the example [below](#using-secrets).

:::

### `name`

Defines the dataset name, which is used as the table name within Spice.

Example:
```yaml
datasets:
  - from: abfs://foocontainer/taxi_sample.csv
    name: cool_dataset
    params:
      ...
```

```sql
SELECT COUNT(*) FROM cool_dataset;
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

| Parameter name              | Description                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| `file_format`               | Specifies the data format. Required if not inferrable from `from`. Options: `parquet`, `csv`. |
| `abfs_account`              | Azure storage account name                                                                    |
| `abfs_container_name`       | Azure storage container name                                                                  |
| `abfs_sas_string`           | SAS (Shared Access Signature) Token to use for authorization                                  |
| `abfs_endpoint`             | Storage endpoint, default: `https://{account}.blob.core.windows.net`                          |
| `abfs_use_emulator`         | Use `true` or `false` to connect to a local emulator                                          |
| `abfs_allow_http`           | Allow insecure HTTP connections                                                               |
| `abfs_authority_host`       | Alternative authority host, default: `https://login.microsoftonline.com`                      |
| `abfs_proxy_url`            | Proxy URL                                                                                     |
| `abfs_proxy_ca_certificate` | CA certificate for the proxy                                                                  |
| `abfs_proxy_exludes`        | A list of hosts to exclude from proxy connections                                             |
| `abfs_disable_tagging`      | Ignore tags in `put_opts`                                                                     |


#### Authentication parameters

The following parameters are used when authenticating with Azure. Only one of these parameters can be used at a time:

* `abfs_access_key`
* `abfs_bearer_token`
* `abfs_client_secret`
* `abfs_skip_signature`

If none of these are set the connector will default to using a [managed identity](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview)

| Parameter name              | Description                                                 |
| --------------------------- | ----------------------------------------------------------- |
| `abfs_access_key`           | Secret access key                                           |
| `abfs_bearer_token`         | `BEARER` token                                              |
| `abfs_client_id`            | Client ID for client authentication flow                    |
| `abfs_client_secret`        | Client Secret to use for client authentication flow         |
| `abfs_tenant_id`            | Tenant ID to use for client authentication flow             |
| `abfs_skip_signature`       | Skip credentials and request signing for public containers  |
| `abfs_msi_endpoint`         | Endpoint for managed identity tokens                        |
| `abfs_federated_token_file` | File path for federated identity token in Kubernetes        |
| `abfs_use_cli`              | Set to `true` to use the Azure CLI to acquire access tokens |

#### Retry parameters

| Parameter name                  | Description                                  |
| ------------------------------- | -------------------------------------------- |
| `abfs_max_retries`              | Maximum retries                              |
| `abfs_retry_timeout`            | Total timeout for retries (e.g., `5s`, `1m`) |
| `abfs_backoff_initial_duration` | Initial retry delay (e.g., `5s`)             |
| `abfs_backoff_max_duration`     | Maximum retry delay (e.g., `1m`)             |
| `abfs_backoff_base`             | Exponential backoff base (e.g., `0.1`)       |

## Supported file formats

Specify the file format using `file_format` parameter. More details in [Object Store File Formats](/components/data-connectors/index.md#object-store-file-formats).

## Examples

### Reading a CSV file with an Access Key

```yaml
datasets:
  - from: abfs://foocontainer/taxi_sample.csv
    name: azure_test
    params:
      abfs_account: spiceadls
      abfs_access_key: abc123==
      file_format: csv
```

### Using Public Containers

```yaml
datasets:
  - from: abfs://pubcontainer/taxi_sample.csv
    name: pub_data
    params:
      abfs_account: spiceadls
      abfs_skip_signature: true
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

### Using secrets for Account and Container

When using secrets for `abfs_container`, a dummy container name needs to be provided in the `from` field. This dummy value will be replaced by the value in the secret at runtime.

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

### Authenticating using Client Authentication

```yaml
datasets:
  - from: abfs://my_data/input.parquet
    name: my_data
    params:
      abfs_tentant_id: B3E1A8F4-9D5B-4D3B-8D2E-1F4A9D5B4D3B
      abfs_client_id: A587D13A-7E4E-46AB-BB87-E7A8AAFB42F3
      abfs_client_secret: qoiwdjqidj213094103213o0~!!
```

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](/components/secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](/components/secret-stores#using-secrets).