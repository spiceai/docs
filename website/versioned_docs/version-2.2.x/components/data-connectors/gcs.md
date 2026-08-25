---
title: 'GCS Data Connector'
sidebar_label: 'GCS Data Connector'
description: 'GCS (Google Cloud Storage) Data Connector Documentation'
tags:
  - data-connectors
  - blob-storage
---

The GCS Data Connector enables federated SQL queries on files stored in Google Cloud Storage. Both `gcs://` and `gs://` URI schemes are accepted.

When a folder path is provided, all the contained files will be loaded.

File formats are specified using the `file_format` parameter, as described in [File Formats](./#file-formats).

```yaml
datasets:
  - from: gs://my-bucket/taxi_sample.csv
    name: gcs_test
    params:
      gcs_service_account_path: /etc/spice/gcs-key.json
      file_format: csv
```

## Configuration

### `from`

Defines the GCS URI to a folder or object. Both schemes are supported and equivalent:

- `from: gs://<bucket>/<path>`
- `from: gcs://<bucket>/<path>`

Example: `from: gs://my-bucket/path/to/file.parquet`

### `name`

Defines the dataset name, which is used as the table name within Spice.

Example:

```yaml
datasets:
  - from: gs://my-bucket/taxi_sample.csv
    name: cool_dataset
    params:
      file_format: csv
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

The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords).

### `params`

#### Basic parameters

| Parameter name              | Description                                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `file_format`               | Specifies the data format. Required if it cannot be inferred from the object URI. Options: `parquet`, `csv`, `json`. Refer to [File Formats](./#file-formats) for details. |
| `allow_http`                | Allow insecure HTTP connections. Defaults to `false`.                                                                                                                    |
| `client_timeout`            | Optional. Timeout for GCS client operations.                                                                                                                             |
| `hive_partitioning_enabled` | Enable partitioning using hive-style partitioning from the folder structure. Defaults to `false`.                                                                        |
| `schema_source_path`        | Specifies the URL used to infer the dataset schema. Defaults to the most recently modified file.                                                                         |

#### Authentication parameters

The following authentication methods are mutually exclusive — only one can be set at a time. The runtime will fail to start if more than one is specified.

- `gcs_service_account_path`
- `gcs_service_account_key`
- `gcs_application_default_credentials`
- `gcs_skip_signature`

If none of these are set, the connector accesses the bucket without explicit credentials. For public buckets, set `gcs_skip_signature: true` to skip request signing.

| Parameter name                        | Description                                                                                                                                                |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gcs_service_account_path`            | Path to a GCS service account JSON key file.                                                                                                               |
| `gcs_service_account_key`             | GCS service account JSON key as a string.                                                                                                                  |
| `gcs_application_default_credentials` | Set to `true` to use Google [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials). If `GOOGLE_APPLICATION_CREDENTIALS` is set, that path is used. Defaults to `false`. |
| `gcs_skip_signature`                  | Set to `true` to skip signing requests. Use for public buckets.                                                                                            |

#### Retry parameters

| Parameter name                 | Description                                  |
| ------------------------------ | -------------------------------------------- |
| `gcs_max_retries`              | Maximum number of retries. Defaults to `3`.  |
| `gcs_retry_timeout`            | Total timeout for retries (e.g., `5s`, `1m`). |
| `gcs_backoff_initial_duration` | Initial retry delay (e.g., `5s`).            |
| `gcs_backoff_max_duration`     | Maximum retry delay (e.g., `1m`).            |
| `gcs_backoff_base`             | Exponential backoff base (e.g., `0.1`).      |

## Authentication

GCS connector supports four mutually-exclusive authentication modes, as detailed in the [authentication parameters](#authentication-parameters).

### Service account JSON file

Configure a service account by setting `gcs_service_account_path` to the file path of a downloaded service account JSON key:

```yaml
datasets:
  - from: gs://my-bucket/data/
    name: my_data
    params:
      gcs_service_account_path: /etc/spice/gcs-key.json
      file_format: parquet
```

To create the key file, follow the [Google Cloud documentation for service account keys](https://cloud.google.com/iam/docs/keys-create-delete) and grant the service account `roles/storage.objectViewer` (or higher) on the bucket via the [Cloud Storage IAM](https://cloud.google.com/storage/docs/access-control/iam) settings.

### Service account JSON content

When mounting a key file is not practical (e.g., when keying off a secret store), pass the JSON contents directly via `gcs_service_account_key`:

```yaml
datasets:
  - from: gs://my-bucket/data/
    name: my_data
    params:
      gcs_service_account_key: ${secrets:GCS_SERVICE_ACCOUNT_JSON}
      file_format: parquet
```

The value should be the full JSON key as a single string, ideally provided through a [supported secret store](../secret-stores).

### Application Default Credentials (ADC)

To use [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials) — for example, when running inside Google Cloud with attached service accounts (GKE Workload Identity, Compute Engine metadata, etc.) or when using `gcloud auth application-default login` locally — set `gcs_application_default_credentials: true`:

```yaml
datasets:
  - from: gs://my-bucket/data/
    name: my_data
    params:
      gcs_application_default_credentials: true
      file_format: parquet
```

If the `GOOGLE_APPLICATION_CREDENTIALS` environment variable is set to a service account JSON key path, that file is used. Otherwise, the ADC chain searches the well-known locations described in the Google Cloud documentation.

### Public buckets

For unauthenticated access to a public bucket, set `gcs_skip_signature: true`:

```yaml
datasets:
  - from: gs://public-bucket/data/
    name: public_data
    params:
      gcs_skip_signature: true
      file_format: parquet
```

## Supported file formats

Specify the file format using the `file_format` parameter. More details in [File Formats](./#file-formats).

## Examples

### Reading a Parquet folder with a service account key file

```yaml
datasets:
  - from: gs://my-bucket/trips/2024/
    name: taxi_trips
    params:
      gcs_service_account_path: /etc/spice/gcs-key.json
      file_format: parquet
```

### Reading a CSV file with the service account JSON inlined from a secret

```yaml
datasets:
  - from: gs://my-bucket/taxi_sample.csv
    name: taxi_sample
    params:
      gcs_service_account_key: ${secrets:GCS_SERVICE_ACCOUNT_JSON}
      file_format: csv
```

### Reading from a public bucket

```yaml
datasets:
  - from: gs://public-bucket/sample.parquet
    name: sample
    params:
      gcs_skip_signature: true
      file_format: parquet
```

### Hive-partitioned dataset

```yaml
datasets:
  - from: gs://my-bucket/events/
    name: events
    params:
      gcs_application_default_credentials: true
      file_format: parquet
      hive_partitioning_enabled: true
```

## Secrets

Spice integrates with multiple [secret stores](../secret-stores) to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores).

`gcs_service_account_path` and `gcs_service_account_key` are marked as secrets and can be supplied through any supported secret store using the `${secrets:KEY}` replacement syntax.
