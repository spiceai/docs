---
title: 'Azure Integrations'
description: 'Spice.ai integrations with Microsoft Azure, including data connectors, AI models, embeddings, and authentication.'
sidebar_label: 'Integrations'
sidebar_position: 2
pagination_next: null
keywords:
  [
    spice.ai,
    azure,
    blob storage,
    adls,
    azure sql,
    azure openai,
    databricks,
    aks,
    container apps,
    sharepoint,
    microsoft entra,
  ]
---

Spice.ai integrates with Microsoft Azure for data federation, AI inference, embeddings, and authentication. This page consolidates Azure-compatible components and links to the relevant configuration guides.

## Data Connectors

Data connectors federate SQL queries across Azure data sources without data movement.

| Connector                           | Description                                                                                                                                                                                                               | Documentation                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Azure Blob Storage / ADLS Gen2**  | Query Parquet, CSV, and JSON files in [Azure Blob Storage](https://azure.microsoft.com/products/storage/blobs) or [ADLS Gen2](https://azure.microsoft.com/products/storage/data-lake-storage) using the `abfs://` scheme. | [ABFS Data Connector](../../components/data-connectors/abfs)             |
| **Azure SQL Database / SQL Server** | Connect to [Azure SQL Database](https://azure.microsoft.com/products/azure-sql/database/), [Azure SQL Managed Instance](https://azure.microsoft.com/products/azure-sql/managed-instance/), and SQL Server VMs.            | [MSSQL Data Connector](../../components/data-connectors/mssql)           |
| **Azure Database for PostgreSQL**   | Connect to flexible server and single server deployments using the PostgreSQL connector.                                                                                                                                  | [PostgreSQL Data Connector](../../components/data-connectors/postgres)   |
| **Azure Database for MySQL**        | Connect to flexible server deployments using the MySQL connector.                                                                                                                                                         | [MySQL Data Connector](../../components/data-connectors/mysql)           |
| **Azure Databricks**                | Query Databricks tables on Azure using SQL Warehouse or Spark Connect.                                                                                                                                                    | [Databricks Data Connector](../../components/data-connectors/databricks) |
| **Apache Iceberg (ADLS)**           | Query Iceberg tables stored in ADLS Gen2 with REST or Unity Catalog metadata.                                                                                                                                             | [Iceberg Data Connector](../../components/data-connectors/iceberg)       |
| **Delta Lake (ADLS)**               | Query Delta Lake tables stored in ADLS Gen2 or Azure Blob Storage.                                                                                                                                                        | [Delta Lake Data Connector](../../components/data-connectors/delta-lake) |
| **Microsoft SharePoint**            | Index and query documents from SharePoint sites and OneDrive for Business with Microsoft Entra ID authentication.                                                                                                         | [SharePoint Data Connector](../../components/data-connectors/sharepoint) |
| **Azure-hosted databases via ODBC** | Connect through ODBC drivers for additional Azure-compatible data sources.                                                                                                                                                | [ODBC Data Connector](../../components/data-connectors/odbc)             |

### Example: Azure Blob Storage (ABFS)

```yaml
datasets:
  - from: abfs://container@account.dfs.core.windows.net/path/to/data/
    name: events
    params:
      file_format: parquet
      abfs_account: account
      abfs_use_emulator: 'false'
```

### Example: Azure SQL Database

```yaml
datasets:
  - from: mssql:dbo.orders
    name: orders
    params:
      mssql_host: my-server.database.windows.net
      mssql_port: 1433
      mssql_database: mydb
      mssql_username: ${ secrets:MSSQL_USER }
      mssql_password: ${ secrets:MSSQL_PASSWORD }
```

The connector authenticates with a SQL Server login and encrypts the connection by default. It does not support Microsoft Entra ID authentication: an `Authentication=` keyword in `mssql_connection_string` is ignored, and the connection is attempted as a SQL Server login.

### Example: Azure Databricks

```yaml
datasets:
  - from: databricks:catalog.schema.table
    name: orders
    params:
      mode: spark_connect
      databricks_endpoint: my-workspace.azuredatabricks.net
      databricks_cluster_id: 1234-567890-abcde123
      databricks_token: ${ secrets:DATABRICKS_TOKEN }
```

## Catalog Connectors

Catalog connectors provide schema discovery and unified access to tables in Azure data catalogs.

| Connector                    | Description                                                                                                                 | Documentation                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Databricks Unity Catalog** | Discover and query tables governed by Unity Catalog on Azure Databricks. Supports Azure Blob authentication for table data. | [Unity Catalog](../../components/catalogs/unity-catalog)   |
| **Databricks Catalog**       | Connect to Azure Databricks as a catalog source for federated queries.                                                      | [Databricks Catalog](../../components/catalogs/databricks) |

### Example: Unity Catalog with Azure Blob

```yaml
catalogs:
  - from: unity_catalog:https://my-workspace.azuredatabricks.net/api/2.1/unity-catalog/catalogs/my_catalog
    name: my_catalog
    params:
      unity_catalog_token: ${ secrets:DATABRICKS_TOKEN }
      unity_catalog_azure_storage_account_name: mystorageacct
      unity_catalog_azure_storage_client_id: ${ secrets:AZURE_CLIENT_ID }
      unity_catalog_azure_storage_client_secret: ${ secrets:AZURE_CLIENT_SECRET }
```

## AI Models (Azure OpenAI)

Spice integrates with [Azure OpenAI Service](https://azure.microsoft.com/products/ai-services/openai-service) for chat completion and reasoning models, including GPT-4 family, GPT-5, and o-series models.

| Provider         | Supported Models                                       | Documentation                                        |
| ---------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| **Azure OpenAI** | GPT-4, GPT-4o, GPT-5, o-series, and other deployments. | [Azure OpenAI Models](../../components/models/azure) |

### Example: Azure OpenAI Chat Model

```yaml
models:
  - from: azure:gpt-4o
    name: gpt
    params:
      endpoint: ${ secrets:SPICE_AZURE_AI_ENDPOINT }
      azure_deployment_name: gpt-4o
      azure_api_version: 2024-08-01-preview
      azure_api_key: ${ secrets:SPICE_AZURE_API_KEY }
```

For Microsoft Entra ID authentication instead of an API key, set `azure_entra_token` in place of `azure_api_key`.

## Secret Stores

Spice resolves secrets at runtime from configured [secret stores](../../components/secret-stores). For Azure deployments, the [`azure_keyvault`](../../components/secret-stores/azure-keyvault) store reads secrets directly from [Azure Key Vault](https://azure.microsoft.com/products/key-vault/), so Spicepods can reference connector and model credentials without baking them into environment variables or `values.yaml`.

| Provider            | Supported Auth Methods                                                          | Documentation                                                                 |
| ------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Azure Key Vault** | `service_principal`, `managed_identity`, `workload_identity`, `cli`, `default`. | [Azure Key Vault Secret Store](../../components/secret-stores/azure-keyvault) |

### Example: Azure Key Vault Secret Store

```yaml
secrets:
  - from: azure_keyvault:prod-vault
    name: azure
    params:
      auth_method: workload_identity

datasets:
  - from: postgres:public.taxi_trips
    name: taxi_trips
    params:
      pg_host: postgres.example.com
      pg_user: ${azure:postgres_user}
      pg_pass: ${azure:postgres_password}
```

Logical key names use underscores; the store automatically translates them to Key Vault names like `spice-postgres-user` (with a fallback to `postgres-user`). Pair `azure_keyvault` with [AKS workload identity](../azure) or a [Container Apps managed identity](../azure) so the runtime authenticates without long-lived credentials.

## Embeddings (Azure OpenAI)

Generate vector embeddings using Azure OpenAI deployments for semantic search and retrieval-augmented generation (RAG).

| Provider         | Supported Models                                                              | Documentation                                                |
| ---------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **Azure OpenAI** | `text-embedding-3-small`, `text-embedding-3-large`, `text-embedding-ada-002`. | [Azure OpenAI Embeddings](../../components/embeddings/azure) |

### Example: Azure OpenAI Embeddings

```yaml
embeddings:
  - from: azure:text-embedding-3-small
    name: azure_embed
    params:
      endpoint: ${ secrets:SPICE_AZURE_AI_ENDPOINT }
      azure_deployment_name: text-embedding-3-small
      azure_api_version: 2023-05-15
      azure_api_key: ${ secrets:SPICE_AZURE_API_KEY }
```

Refer to the [Azure OpenAI Service models](https://learn.microsoft.com/azure/ai-services/openai/concepts/models) for the full list of supported models and regions.

## Authentication

Spice does not use the Azure Identity [`DefaultAzureCredential`](https://learn.microsoft.com/dotnet/api/azure.identity.defaultazurecredential) chain. Each integration resolves Azure credentials on its own:

| Integration                    | Credentials                                                                                                                                                                                                                                                                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Azure Blob Storage / ADLS Gen2 | `abfs_*` parameters and `AZURE_*` environment variables. The first complete credential wins: bearer token, account key, workload identity (`AZURE_FEDERATED_TOKEN_FILE`), service principal secret, SAS token, Azure CLI (only with `abfs_use_cli: true`), then managed identity. Certificate and username/password credentials are not used. |
| Azure Key Vault                | Chosen by `auth_method`. `default` uses a service principal when `client_secret` is set, and otherwise the Azure CLI or Azure Developer CLI login. Managed and workload identity require `auth_method: managed_identity` or `auth_method: workload_identity`.                                                                       |
| Azure SQL Database             | A SQL Server login in `mssql_connection_string`, or `mssql_username` and `mssql_password`. Microsoft Entra ID authentication is not supported.                                                                                                                                                                                    |
| Azure OpenAI                   | `azure_api_key` or `azure_entra_token`.                                                                                                                                                                                                                                                                                           |

For the order in detail, see the [Authentication](../azure#authentication) section of the Azure deployment guide.

### Role Assignments

Each principal must have the appropriate Azure RBAC role for the services it accesses:

| Service                        | Common role(s)                                                 |
| ------------------------------ | -------------------------------------------------------------- |
| Azure Blob Storage / ADLS Gen2 | `Storage Blob Data Reader` or `Storage Blob Data Contributor`  |
| Azure Key Vault                | `Key Vault Secrets User` (data plane) or RBAC equivalent       |
| Azure SQL Database             | Database permissions granted to the SQL login                  |
| Azure OpenAI                   | `Cognitive Services OpenAI User`                               |
| Azure Container Registry       | `AcrPull` for image pulls                                      |

When a Spicepod connects to multiple Azure services, ensure roles are granted on every resource the runtime touches.

## Cookbooks

- [Azure OpenAI Models](https://github.com/spiceai/cookbook/tree/trunk/azure_openai) — vector search and chat over structured and unstructured data with Azure OpenAI.
