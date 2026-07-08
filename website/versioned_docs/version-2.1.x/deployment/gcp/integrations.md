---
title: 'GCP Integrations'
description: 'Spice.ai integrations with Google Cloud Platform, including data connectors, AI models, embeddings, and authentication.'
sidebar_label: 'Integrations'
sidebar_position: 2
pagination_next: null
keywords:
  [
    spice.ai,
    gcp,
    google cloud,
    bigquery,
    cloud storage,
    cloud sql,
    alloydb,
    gemini,
    vertex ai,
    workload identity
  ]
---

Spice.ai integrates with Google Cloud Platform (GCP) for data federation, AI inference, embeddings, and authentication. This page consolidates GCP-compatible components and links to the relevant configuration guides.

## Data Connectors

Data connectors federate SQL queries across GCP data sources without data movement.

| Connector                     | Description                                                                                                                                                                                                                              | Documentation                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **BigQuery** (via ADBC)       | Query [BigQuery](https://cloud.google.com/bigquery) tables using the [BigQuery ADBC driver](https://docs.adbc-drivers.org/drivers/bigquery/index.html). Includes built-in SQL dialect support for federated queries.                     | [ADBC Data Connector](../../components/data-connectors/adbc)             |
| **Cloud Storage** (S3-compat) | Query Parquet, CSV, and JSON objects in [Cloud Storage](https://cloud.google.com/storage) using the S3 connector with HMAC keys against the GCS [interoperability endpoint](https://cloud.google.com/storage/docs/aws-simple-migration). | [S3 Data Connector](../../components/data-connectors/s3)                 |
| **Cloud SQL for PostgreSQL**  | Connect to [Cloud SQL for PostgreSQL](https://cloud.google.com/sql/docs/postgres) directly or through the [Cloud SQL Auth Proxy](https://cloud.google.com/sql/docs/postgres/sql-proxy).                                                  | [PostgreSQL Data Connector](../../components/data-connectors/postgres)   |
| **Cloud SQL for MySQL**       | Connect to [Cloud SQL for MySQL](https://cloud.google.com/sql/docs/mysql) directly or through the Cloud SQL Auth Proxy.                                                                                                                  | [MySQL Data Connector](../../components/data-connectors/mysql)           |
| **Cloud SQL for SQL Server**  | Connect to [Cloud SQL for SQL Server](https://cloud.google.com/sql/docs/sqlserver).                                                                                                                                                      | [MSSQL Data Connector](../../components/data-connectors/mssql)           |
| **AlloyDB for PostgreSQL**    | Connect to [AlloyDB](https://cloud.google.com/alloydb) using the PostgreSQL wire protocol.                                                                                                                                               | [PostgreSQL Data Connector](../../components/data-connectors/postgres)   |
| **Apache Iceberg (GCS)**      | Query Iceberg tables stored in Cloud Storage with REST or Hive metadata. Native GCS authentication via service account credentials or OAuth tokens.                                                                                      | [Iceberg Data Connector](../../components/data-connectors/iceberg)       |
| **Delta Lake (GCS)**          | Query Delta Lake tables stored in Cloud Storage.                                                                                                                                                                                         | [Delta Lake Data Connector](../../components/data-connectors/delta-lake) |
| **GCP databases via ODBC**    | Connect through ODBC drivers for additional GCP-compatible data sources.                                                                                                                                                                 | [ODBC Data Connector](../../components/data-connectors/odbc)             |

### Example: BigQuery via ADBC

```yaml
datasets:
  - from: adbc:my_dataset.orders
    name: orders
    params:
      adbc_driver: bigquery
      adbc_uri: 'bigquery:///my-gcp-project'
      adbc_driver_options: |
        adbc.bigquery.sql.dataset_id=my_dataset
        adbc.bigquery.sql.auth_type=adbc.bigquery.sql.auth_type.json_credential_file
        adbc.bigquery.sql.auth_credentials=/var/run/secrets/gcp/key.json
```

When the runtime uses Workload Identity, omit `auth_type` and `auth_credentials` — the BigQuery driver picks up Application Default Credentials automatically.

### Example: Cloud Storage via S3 connector

Cloud Storage exposes an [S3-compatible interoperability endpoint](https://cloud.google.com/storage/docs/aws-simple-migration). Generate an [HMAC key](https://cloud.google.com/storage/docs/authentication/hmackeys) tied to a service account, then point the S3 connector at `storage.googleapis.com`:

```yaml
datasets:
  - from: s3://my-bucket/path/to/data/
    name: events
    params:
      file_format: parquet
      s3_endpoint: https://storage.googleapis.com
      s3_auth: key
      s3_key: ${ secrets:GCS_HMAC_ACCESS_ID }
      s3_secret: ${ secrets:GCS_HMAC_SECRET }
```

For Iceberg or Delta tables stored in GCS, use the connector's native GCS parameters instead, which support service-account credentials and ADC directly.

### Example: Cloud SQL for PostgreSQL

Run the [Cloud SQL Auth Proxy](https://cloud.google.com/sql/docs/postgres/sql-proxy) as a sidecar (or `127.0.0.1` listener on Compute Engine) and connect over the loopback interface:

```yaml
datasets:
  - from: postgres:public.orders
    name: orders
    params:
      pg_host: 127.0.0.1
      pg_port: '5432'
      pg_db: app
      pg_user: ${ secrets:CLOUDSQL_USER }
      pg_pass: ${ secrets:CLOUDSQL_PASSWORD }
      pg_sslmode: disable
```

For [Postgres replication-based CDC](../../features/cdc/postgres-replication), Cloud SQL requires the `cloudsql.logical_decoding = on` flag.

## AI Models (Google AI)

Spice integrates with [Google AI Studio](https://aistudio.google.com) for chat completion and reasoning models, including the Gemini family.

| Provider      | Supported Models                                                                                            | Documentation                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **Google AI** | Gemini 2.0/2.5/Pro, Gemini Flash, and other models from the [Gemini API](https://ai.google.dev/gemini-api). | [Google AI Models](../../components/models/google) |

### Example: Gemini Chat Model

```yaml
models:
  - from: google:gemini-2.0-flash-exp
    name: gemini
    params:
      google_api_key: ${ secrets:GEMINI_API_KEY }
```

See [Google AI Models](https://ai.google.dev/gemini-api/docs/models/gemini) for the full list of supported model names.

## Embeddings (Google AI)

Generate vector embeddings using Gemini embedding models for semantic search and retrieval-augmented generation (RAG).

| Provider      | Supported Models                                                                                                                        | Documentation                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Google AI** | `text-embedding-004` and other models from [Gemini API embeddings](https://ai.google.dev/gemini-api/docs/models/gemini#text-embedding). | [Google AI Embeddings](../../components/embeddings/google) |

### Example: Google AI Embeddings

```yaml
embeddings:
  - from: google:text-embedding-004
    name: gemini_embeddings
    params:
      google_api_key: ${ secrets:GEMINI_API_KEY }
```

## Snapshots and shared state

[Snapshots](../../features/data-acceleration/snapshots) and the [distributed query](../../features/distributed-query) state location can use Cloud Storage as the shared object store. Configure with the `gs://` scheme:

```yaml
snapshots:
  location: gs://my-bucket/spiceai/snapshots
```

When no explicit credentials are supplied, Spice reads `GOOGLE_APPLICATION_CREDENTIALS` and the Workload Identity-federated token, in that order.

## Authentication

All GCP integrations support the standard [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials) chain. When credentials are not explicitly configured, Spice attempts the following in order:

1. **`GOOGLE_APPLICATION_CREDENTIALS`** — path to a service account JSON key file.
2. **Attached service account** — Compute Engine, Cloud Run, or GKE node default service account.
3. **GKE Workload Identity** — federated tokens for pods bound to a Google service account via the Kubernetes ServiceAccount. See [Workload Identity for GKE](https://cloud.google.com/kubernetes-engine/docs/concepts/workload-identity).
4. **`gcloud` CLI** — cached credentials from `gcloud auth application-default login`.
5. **Workload Identity Federation** — federated identity for workloads running outside GCP (other clouds, on-premises, GitHub Actions). See [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation).

For a deployment-side overview of these mechanisms, see the [Authentication](../gcp#authentication) section of the GCP deployment guide.

### IAM role bindings

Each principal must have the appropriate IAM role for the services it accesses:

| Service                  | Common role(s)                                              |
| ------------------------ | ----------------------------------------------------------- |
| Cloud Storage            | `roles/storage.objectViewer` or `roles/storage.objectAdmin` |
| BigQuery                 | `roles/bigquery.dataViewer` and `roles/bigquery.jobUser`    |
| Cloud SQL                | `roles/cloudsql.client` (proxy) plus database-level grants  |
| Secret Manager           | `roles/secretmanager.secretAccessor`                        |
| Artifact Registry        | `roles/artifactregistry.reader` for image pulls             |
| Cloud Logging/Monitoring | `roles/logging.logWriter`, `roles/monitoring.metricWriter`  |

When a Spicepod connects to multiple GCP services, ensure roles are granted on every resource the runtime touches.
