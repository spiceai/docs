---
title: 'SharePoint Data Connector'
sidebar_label: 'SharePoint Data Connector'
description: 'SharePoint Data Connector Documentation'
pagination_prev: null
---

The SharePoint Data Connector enables federated SQL queries on documents and tabular data stored in SharePoint or OneDrive.

```yaml
datasets:
  - from: sharepoint:drive:Documents/path:/top_secrets/
    name: important_documents
    params:
      sharepoint_client_id: ${secrets:SPICE_SHAREPOINT_CLIENT_ID}
      sharepoint_tenant_id: ${secrets:SPICE_SHAREPOINT_TENANT_ID}
      sharepoint_client_secret: ${secrets:SPICE_SHAREPOINT_CLIENT_SECRET}
```

#### Example

```sql
SELECT * FROM important_documents limit 1;
```

Returns

````json
[
  {
    "created_by_id": "cbccd193-f9f1-4603-b01d-ff6f3e6f2108",
    "created_by_name": "Jack Eadie",
    "created_at": "2024-09-09T04:57:00",
    "c_tag": "\"c:{BD4D130F-2C95-4E59-9F93-85BD0A9E1B19},1\"",
    "e_tag": "\"{BD4D130F-2C95-4E59-9F93-85BD0A9E1B19},1\"",
    "id": "01YRH3MPAPCNG33FJMLFHJ7E4FXUFJ4GYZ",
    "last_modified_by_id": "cbccd193-f9f1-4603-b01d-ff6f3e6f2108",
    "last_modified_by_name": "Jack Eadie",
    "last_modified_at": "2024-09-09T04:57:00",
    "name": "ngx_google_perftools_module.md",
    "size": 959,
    "web_url": "https://spiceai.sharepoint.com/Shared%20Documents/md/ngx_google_perftools_module.md",
    "content": "# Module ngx_google_perftools_module\n\nThe `ngx_google_perftools_module` module (0.6.29) enables profiling of nginx worker processes using [Google Performance Tools](https://github.com/gperftools/gperftools). The module is intended for nginx developers.\n\nThis module is not built by default, it should be enabled with the `--with-google_perftools_module` configuration parameter.\n\n> **Note:** This module requires the [gperftools](https://github.com/gperftools/gperftools) library.\n\n## Example Configuration\n\n```nginx\ngoogle_perftools_profiles /path/to/profile;\n```\n\nProfiles will be stored as `/path/to/profile.<worker_pid>`.\n\n## Directives\n\n### google_perftools_profiles\n\n- **Syntax:** `google_perftools_profiles file;`\n- **Default:** —\n- **Context:** `main`\n\nSets a file name that keeps profiling information of nginx worker process. The ID of the worker process is always a part of the file name and is appended to the end of the file name, after a dot.\n"
  }
]
````

The SharePoint connector supports two `from:` URL styles:

- **Metadata listing** (`sharepoint:…` — single colon): one row per drive item with optional file content. Best for browsing folders of PDFs, PPTX, DOCX, etc. as document tables.
- **Object-store** (`sharepoint://…` — double slash): tabular access via DataFusion's `ListingTable`. Enables `SELECT`, `INSERT INTO`, `COPY TO`, `COPY FROM`, and `CREATE EXTERNAL TABLE` against CSV, JSON, NDJSON, Parquet, and similar formats stored on SharePoint.

## Configuration

### Parameters

| Name                            | Required?      | Description                                                                                                                                                                                                                                                       |
| ------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sharepoint_client_id`          | Conditional    | The client ID of the Azure AD (Entra) application. Required for every flow except `sharepoint_bearer_token`.                                                                                                                                                      |
| `sharepoint_tenant_id`          | Conditional    | The tenant ID of the Azure AD (Entra) application. Required for every flow except `sharepoint_bearer_token`.                                                                                                                                                      |
| `sharepoint_client_secret`      | Conditional    | The client secret of the Azure AD (Entra) application. Required for client-credentials, authorization-code, and refresh-token flows.                                                                                                                              |
| `sharepoint_bearer_token`       | Conditional    | A pre-acquired bearer access token. Generally obtained via `spice login sharepoint` (see [docs](../../cli/reference/login)).                                                                                                                                      |
| `sharepoint_auth_code`          | Conditional    | OAuth2 authorization code (`auth_code` flow). Requires `sharepoint_client_secret` and `sharepoint_redirect_uri`.                                                                                                                                                  |
| `sharepoint_refresh_token`      | Conditional    | OAuth2 refresh token. Requires `sharepoint_client_secret`.                                                                                                                                                                                                        |
| `sharepoint_device_code`        | Conditional    | A pre-acquired OAuth2 device code (`device_code` flow).                                                                                                                                                                                                           |
| `sharepoint_saml_assertion`     | Conditional    | SAML 2.0 bearer assertion ([RFC 7522](https://datatracker.ietf.org/doc/html/rfc7522)) — exchanges a federated IdP assertion for an Azure AD token.                                                                                                                |
| `sharepoint_redirect_uri`       | Conditional    | OAuth2 redirect URI. Required when using `sharepoint_auth_code`.                                                                                                                                                                                                  |
| `sharepoint_scope`              | Optional       | OAuth2 scope. Defaults to `https://graph.microsoft.com/.default`.                                                                                                                                                                                                 |
| `sharepoint_conflict_behavior`  | Optional       | How writes to an existing path are handled. One of `replace` (default; SharePoint stores a new version), `fail` (reject), or `rename` (write under a unique name). Only `replace` is compatible with `INSERT INTO` / `COPY TO`. Applies only to `sharepoint://`. |
| `sharepoint_max_put_bytes`      | Optional       | Hard cap, in bytes, on a single `put`/multipart upload. Writes above this size are rejected rather than silently buffered. Default: `1073741824` (1 GiB). Applies only to `sharepoint://`.                                                                       |

:::note
Exactly one of `sharepoint_client_secret` (alone, for client-credentials), `sharepoint_bearer_token`, `sharepoint_auth_code` (with `sharepoint_client_secret` + `sharepoint_redirect_uri`), `sharepoint_refresh_token` (with `sharepoint_client_secret`), `sharepoint_device_code`, or `sharepoint_saml_assertion` must be supplied. Combining unrelated auth credentials is rejected at startup.
:::

When using the `sharepoint://` URL scheme, the standard listing-table parameters (`file_format`, `csv_has_header`, `csv_delimiter`, `json_pointer`, `hive_partitioning_enabled`, etc.) all apply — see [File Formats](./#file-formats) and the [Object Store File Formats](./#object-store-file-formats) reference for the full list.

### `from` formats

The SharePoint connector accepts two `from:` URL styles.

#### Metadata listing — `sharepoint:` (single colon)

Returns one row per drive item, optionally with the parsed `content` column. Use for document workflows over folders of PDF, PPTX, DOCX, XLSX, etc.

```yaml
from: 'sharepoint:<drive_type>:<drive_id>/<subpath_type>:<subpath_value>'
```

`drive_type` supports the following types:

| Drive Type | Description                 | Example                                                          |
| ---------- | --------------------------- | ---------------------------------------------------------------- |
| `drive`    | The SharePoint drive's name | `from: sharepoint:drive:Documents/...`                           |
| `driveId`  | The SharePoint drive's ID   | `from: sharepoint:driveId:b!Mh8opUGD80ec7zGXgX9r/...`            |
| `site`     | A SharePoint site's name    | `from: sharepoint:site:MySite/...`                               |
| `siteId`   | A SharePoint site's ID      | `from: sharepoint:siteId:b!Mh8opUGD80ec7zGXgX9r/...`             |
| `group`    | A SharePoint group's name   | `from: sharepoint:group:MyGroup/...`                             |
| `groupId`  | A SharePoint group's ID     | `from: sharepoint:groupId:b!Mh8opUGD80ec7zGXgX9r/...`            |
| `user`     | A user's drive by user ID   | `from: sharepoint:user:48d31887-5fad-4d73-a9f5-3c356e68a038/...` |
| `me`       | A user's OneDrive           | `from: sharepoint:me/...`                                        |

:::note
For the `me` drive type the user is identified based on `sharepoint_bearer_token` and cannot be used with `sharepoint_client_secret`.
:::

For a name-based `drive_id`, the connector will attempt to resolve the name to an ID at startup.

Within a drive, the SharePoint connector can load documents from:

| Description                      | Example                                                                |
| -------------------------------- | ---------------------------------------------------------------------- |
| The root of the drive            | `from: sharepoint:me/root`                                             |
| A specific path within the drive | `from: sharepoint:drive:Documents/path:/top_secrets`                   |
| A specific folder ID             | `from: sharepoint:group:MyGroup/id:01QM2NJSNHBISUGQ52P5AJQ3CBNOXDMVNT` |

#### Object-store — `sharepoint://` (double slash)

Routes through an `ObjectStore` plus DataFusion's `ListingTable`. Enables `SELECT`, `INSERT INTO`, `COPY TO`, `COPY FROM`, and `CREATE EXTERNAL TABLE` for CSV, JSON, NDJSON, Parquet, and other tabular formats — and binary round-trips for blobs (PDF, etc.) via `(FORMAT binary)`.

| URL form                                       | Description                       |
| ---------------------------------------------- | --------------------------------- |
| `sharepoint://me/{item-path}`                  | The authenticated user's OneDrive |
| `sharepoint://drives/{drive-id}/{item-path}`   | A specific drive by ID            |
| `sharepoint://sites/{site-id}/{item-path}`     | A site's default document library |
| `sharepoint://users/{user-id}/{item-path}`     | A user's default drive            |
| `sharepoint://groups/{group-id}/{item-path}`   | A group's default drive           |

Path segments are percent-decoded, so site IDs containing `,` (e.g. `contoso.sharepoint.com,abc-def,ghi-jkl`) and file paths containing spaces work without extra escaping beyond standard URL encoding.

`file_format` is auto-inferred from the URL extension when omitted, so `from: sharepoint://me/Documents/Q4.xlsx` resolves without specifying `file_format: xlsx`.

## Authentication

The SharePoint connector supports six authentication flows. Configure exactly one — the connector picks the flow based on which auth parameter is set. See the [Required Microsoft Graph permissions](#required-microsoft-graph-permissions) section below for the API permissions each flow requires.

| Flow                            | Parameters                                                                                          | Notes                                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Client credentials              | `sharepoint_client_secret`                                                                          | Service principal / daemon workloads.                                                       |
| Bearer token (passthrough)      | `sharepoint_bearer_token`                                                                           | Short-lived broker-minted token. Typically obtained via `spice login sharepoint`.           |
| Authorization code              | `sharepoint_auth_code` + `sharepoint_client_secret` + `sharepoint_redirect_uri`                     | Caller has already completed the user-agent redirect and captured the `auth_code`.          |
| Refresh token                   | `sharepoint_refresh_token` + `sharepoint_client_secret`                                             | Renewal from a prior grant.                                                                 |
| Device code                     | `sharepoint_device_code`                                                                            | Caller has already obtained a device code.                                                  |
| SAML 2.0 bearer ([RFC 7522](https://datatracker.ietf.org/doc/html/rfc7522)) | `sharepoint_saml_assertion`                                                                         | Federated IdP (Okta, Ping, ADFS, …) assertion → Azure AD token.                             |

### Creating an Enterprise Application

To use the SharePoint connector with service principal authentication, create an Azure AD application and grant it the necessary permissions. This same app registration also supports the OAuth2 user flows above.

1. Create a new Azure AD application in the [Azure portal](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/Overview).
2. Under the application's `API permissions`, add the permissions listed in [Required Microsoft Graph permissions](#required-microsoft-graph-permissions).
   - For service principal authentication, Application permissions are required.
   - For user authentication, only delegated permissions are required.
3. (For user authentication): Under the application's `Authentication`, add `http://localhost` as a Mobile and desktop applications redirect URI.
4. Add `sharepoint_client_id` (from the `Application (Client) ID` field) and `sharepoint_tenant_id` to the connector configuration.
5. (For service principal authentication): Under the application's `Certificates & secrets`, create a new client secret. Use this for the `sharepoint_client_secret` parameter.

### Required Microsoft Graph permissions

Read-only workflows require:

- `Sites.Read.All`
- `Files.Read.All`
- `User.Read`
- `GroupMember.Read.All`

Write workflows (`INSERT INTO`, `COPY TO`, `CREATE EXTERNAL TABLE` over `sharepoint://`) additionally require:

- `Files.ReadWrite` (for personal drive / specific drive writes), and
- `Sites.ReadWrite.All` (for site-scoped writes).

### Default Spice Application

For your convenience, Spice AI maintains a default Entra (Azure AD) application that can be used for authentication against your SharePoint instance. This application requires OAuth2 authentication. To use it:

```yaml
datasets:
  - from: sharepoint:me/root # Set the drive and subpath as needed.
    name: my_data
    params:
      sharepoint_client_id: f2b3116e-b4c4-464f-80ec-73cd9d9886b4
      sharepoint_tenant_id: #${env:TENANT_ID}
      sharepoint_bearer_token: ${secrets:SPICE_SHAREPOINT_BEARER_TOKEN}
```

And set the `SPICE_SHAREPOINT_BEARER_TOKEN` secret via:

```shell
spice login sharepoint --tenant-id $TENANT_ID --client-id f2b3116e-b4c4-464f-80ec-73cd9d9886b4
```

## Read/write examples (`sharepoint://`)

Reading a CSV from a site library:

```yaml
datasets:
  - from: sharepoint://sites/contoso.sharepoint.com,11111111-2222-3333-4444-555555555555,66666666-7777-8888-9999-aaaaaaaaaaaa/Shared%20Documents/reports/sales.csv
    name: sales
    params:
      sharepoint_client_id: ${secrets:SPICE_SHAREPOINT_CLIENT_ID}
      sharepoint_tenant_id: ${secrets:SPICE_SHAREPOINT_TENANT_ID}
      sharepoint_client_secret: ${secrets:SPICE_SHAREPOINT_CLIENT_SECRET}
      file_format: csv
      csv_has_header: 'true'
```

Inserting rows:

```sql
INSERT INTO sales VALUES ('Q2', 123456.78);
```

Copying a query result out as Parquet:

```sql
COPY (SELECT * FROM orders WHERE year = 2026)
TO 'sharepoint://me/Documents/exports/orders-2026.parquet'
(FORMAT parquet);
```

Creating an external table over a folder of Parquet files:

```sql
CREATE EXTERNAL TABLE reports
STORED AS PARQUET
LOCATION 'sharepoint://sites/{site-id}/Shared%20Documents/reports/';
```

Round-tripping a binary blob (e.g. a PDF):

```sql
COPY (SELECT content FROM cache WHERE name = 'Q2-report.pdf')
TO 'sharepoint://me/Documents/Q2-report.pdf'
(FORMAT binary);
```

:::warning[Limitations]
- The `sharepoint:` (metadata-listing) syntax cannot create a dataset from a single file (e.g. an Excel spreadsheet) — datasets must be created from a folder of documents. Use the `sharepoint://` object-store syntax for single-file workflows.
- For `INSERT INTO` and `COPY TO`, only `sharepoint_conflict_behavior=replace` is supported. `fail` and `rename` cause writes to be rejected with a clear error.
:::

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores/). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores/#using-secrets).

## Cookbook

- A cookbook recipe to configure Sharepoint as a data connector in Spice. [SharePoint Data Connector](https://github.com/spiceai/cookbook/tree/trunk/sharepoint#readme)
