---
title: 'Azure BlobFS Data Connector'
sidebar_label: 'Azure BlobFS Data Connector'
description: 'Azure BlobFS Data Connector Documentation'
---

The Azure BlobFS (ABFS) Data Connector enables federated/accelerated SQL queries on files stored in Azure Blob-compatible endpoints. This includes Azure BlobFS (`abfss://`) and Azure Data Lake (`adl://`) endpoints.

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

### `name`

Defines the dataset name, which is used as the table name within Spice.

Example:

```yaml
datasets:
  - from: abfs://foocontainer/taxi_sample.csv
    name: cool_dataset
    params: ...
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

| Parameter name              | Description                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| `file_format`               | Specifies the data format. Required if not inferrable from `from`. Options: `parquet`, `csv`.    |
| `abfs_account`              | Azure storage account name                                                                       |
| `abfs_sas_string`           | SAS (Shared Access Signature) Token to use for authorization                                     |
| `abfs_endpoint`             | Storage endpoint, default: `https://{account}.blob.core.windows.net`                             |
| `abfs_use_emulator`         | Use `true` or `false` to connect to a local emulator                                             |
| `abfs_allow_http`           | Allow insecure HTTP connections                                                                  |
| `abfs_authority_host`       | Alternative authority host, default: `https://login.microsoftonline.com`                         |
| `abfs_proxy_url`            | Proxy URL                                                                                        |
| `abfs_proxy_ca_certificate` | CA certificate for the proxy                                                                     |
| `abfs_proxy_exludes`        | A list of hosts to exclude from proxy connections                                                |
| `abfs_disable_tagging`      | Disable tagging objects. Use this if your backing store doesn't support tags                     |
| `hive_partitioning_enabled` | Enable partitioning using hive-style partitioning from the folder structure. Defaults to `false` |

#### Authentication parameters

The following parameters are used when authenticating with Azure. Only one of these parameters can be used at a time:

- `abfs_access_key`
- `abfs_bearer_token`
- `abfs_client_secret`
- `abfs_skip_signature`

If none of these are set the connector will default to using a [managed identity](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview)

| Parameter name              | Description                                                                                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `abfs_access_key`           | Secret access key                                                                                                                                                |
| `abfs_bearer_token`         | `BEARER` access token for user authentication. The token can be obtained from the OAuth2 flow (see [access token authentication](#access-token-authentication)). |
| `abfs_client_id`            | Client ID for client authentication flow                                                                                                                         |
| `abfs_client_secret`        | Client Secret to use for client authentication flow                                                                                                              |
| `abfs_tenant_id`            | Tenant ID to use for client authentication flow                                                                                                                  |
| `abfs_skip_signature`       | Skip credentials and request signing for public containers                                                                                                       |
| `abfs_msi_endpoint`         | Endpoint for managed identity tokens                                                                                                                             |
| `abfs_federated_token_file` | File path for federated identity token in Kubernetes                                                                                                             |
| `abfs_use_cli`              | Set to `true` to use the Azure CLI to acquire access tokens                                                                                                      |

#### Retry parameters

| Parameter name                  | Description                                  |
| ------------------------------- | -------------------------------------------- |
| `abfs_max_retries`              | Maximum retries                              |
| `abfs_retry_timeout`            | Total timeout for retries (e.g., `5s`, `1m`) |
| `abfs_backoff_initial_duration` | Initial retry delay (e.g., `5s`)             |
| `abfs_backoff_max_duration`     | Maximum retry delay (e.g., `1m`)             |
| `abfs_backoff_base`             | Exponential backoff base (e.g., `0.1`)       |

## Authentication

ABFS connector supports three types of authentication, as detailed in the [authentication parameters](#authentication-parameters)

### Service principal authentication

Configure service principal authentication by setting the `abfs_client_secret` parameter.

1. Create a new Azure AD application in the [Azure portal](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/Overview) and generate a `client secret` under `Certificates & secrets`.
2. Grant the Azure AD application read access to the storage account under `Access Control (IAM)`, this can typically be done using the `Storage Blob Data Reader` built-in role.

### Access key authentication

Configure service principal authentication by setting the `abfs_access_key` parameter to [Azure Storage Account Access Key](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal)

### Access token authentication

Configure access token authentication by setting the `abfs_bearer_token` parameter, typically obtained through the following the OAuth2 flow with `spice login abfs`.

1. Create a new Azure AD application in the [Azure portal](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/Overview).
2. Under the application's `API permissions`, add the permission: `Azure Storage - user_impersonation`.
3. Under the applications's `Authentication`, add `http://localhost` as Mobile and desktop applications redirect URI.
4. Grant the user read access to the storage account under `Access Control (IAM)`, this can typically be done using the `Storage Blob Data Reader` built-in role.
5. Obtain the `abfs_bearer_token` using the following command. The `abfs_bearer_token`, `abfs_client_id`, `abfs_tenant_id` will be automatically filled in environment secret after login. Refere to [`spice login`](/cli/reference/login) documentation for more details.

```shell
spice login abfs --tenant-id $TENANT_ID --client-id $CLIENT_ID
```

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
      abfs_access_key: ${ secrets:ACCESS_KEY }
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

### Using secrets for Account name

```yaml
datasets:
  - from: abfs://my_container/my_csv.csv
    name: prod_data
    params:
      abfs_account: ${ secrets:PROD_ACCOUNT }
      file_format: csv
```

### Authenticating using Client Authentication

```yaml
datasets:
  - from: abfs://my_data/input.parquet
    name: my_data
    params:
      abfs_tenant_id: ${ secrets:MY_TENANT_ID }
      abfs_client_id: ${ secrets:MY_CLIENT_ID }
      abfs_client_secret: ${ secrets:MY_CLIENT_SECRET }
```

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](/components/secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](/components/secret-stores#using-secrets).
