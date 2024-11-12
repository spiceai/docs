---
title: 'SharePoint Data Connector'
sidebar_label: 'SharePoint Data Connector'
description: 'SharePoint Data Connector Documentation'
pagination_prev: null
---

The SharePoint Data Connector enables federated SQL queries on documents stored in SharePoint.

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
SELECT * FROM important_documents limit 1
```
Returns
```json

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
```


:::warning[Limitations]
The sharepoint connector does not yet support creating a dataset from a single file (e.g. an Excel spreadsheet). Datasets must be created from a folder of documents (see [Document Support](/components/data-connectors/index.md#document-support)).
:::


## Configuration
### Parameters

| Name  | Required?  | Description |
|---|---| --- |
| `sharepoint_client_id` | **Yes**  | The client ID of the Azure AD (Entra) application |
| `sharepoint_tenant_id` | **Yes**  | The tenant ID of the Azure AD (Entra) application. |
| `sharepoint_client_secret` | Optional  | For service principal authentication. The client secret of the Azure AD (Entra) application. |
| `sharepoint_auth_code` | Optional  | For user authentication. The authorization code obtained from the OAuth2 flow (see `spice login sharepoint` [docs](/cli/reference/login)). |

:::note
Only one of `sharepoint_client_secret` or `sharepoint_auth_code` is allowed.
:::

### `from` formats

The `from` field in a SharePoint dataset takes the following format:
```yaml
from: 'sharepoint:<drive_type>:<drive_id>/<subpath_type>:<subpath_value>'
```

#### Drives

`drive_type` in a SharePoint Connector `from` field supports the following types:

| Drive Type  | Description  | Example |
|---|---| --- |
| `drive`  | The SharePoint drive's name | `from: sharepoint:drive:Documents/...` |
| `driveID` | The SharePoint drive's ID | `from: sharepoint:driveId:b!Mh8opUGD80ec7zGXgX9r/...` |
| `site` | A SharePoint site's name | `from: sharepoint:site:MySite/...` |
| `siteID` | A SharePoint site's ID | `from: sharepoint:siteId:b!Mh8opUGD80ec7zGXgX9r/...` |
| `group` | A SharePoint group's name | `from: sharepoint:group:MyGroup/...` |
| `groupId` | A SharePoint group's ID | `from: sharepoint:groupId:b!Mh8opUGD80ec7zGXgX9r/...` |
| `me` | A user's OneDrive | `from: sharepoint:me/...` |

:::note
For the `me` drive type the user is identified based on `sharepoint_client_code` and cannot be used with `sharepoint_client_secret`
:::

For a name-based `drive_id`, the connector will attempt to resolve the name to an ID at startup.

#### Subpaths

Within a drive, the SharePoint connector can load documents from:

| Description  | Example |
| ---| --- |
| The root of the drive  | `from: sharepoint:me/root` |
| A specific path within the drive | `from: sharepoint:drive:Documents/path:/top_secrets` |
| A specific folder ID | `from: sharepoint:group:MyGroup/id:01QM2NJSNHBISUGQ52P5AJQ3CBNOXDMVNT` |


## Authentication
As outlined in the [connector parameters](#parameters), the SharePoint connector supports two types of authentication:
 1. Service principal authentication, by setting the `sharepoint_client_secret` parameter.
 2. User authentication, by setting the `sharepoint_auth_code` parameter. Generally this is obtained by running `spice login sharepoint` and following the OAuth2 flow.

### Creating an Enterprise Application
To use the SharePoint connector with service principal authentication, you will need to create an Azure AD application and grant it the necessary permissions. This will also support OAuth2 authentication for users within the tenant (i.e. `sharepoint_auth_code`).

1. Create a new Azure AD application in the [Azure portal](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/Overview).
2. Under the application's `API permissions`, add the following permissions: `Sites.Read.All`, `Files.Read.All`, `User.Read`, `GroupMember.Read.All`
    - For service principal authentication, Application permissions are required. 
    - For user authentication, only delegated permissions are required.
3. Add `sharepoint_client_id` (from the `Application (Client) ID` field) and `sharepoint_tenant_id` to the connector configuration.
4. (For service principal authentication): Under the application's `Certificates & secrets`, create a new client secret. Use this for the `sharepoint_client_secret` parameter.

### Default Spice Application
For your convenience, Spice AI maintains a default Entra (Azure AD) application that can be used for authentication against your SharePoint instance. This application requires OAuth2 authentication. To use it:

```yaml
datasets:
  - from: sharepoint:me/root # Set the drive and subpath as needed.
    name: my_data
    params:
      sharepoint_client_id: f2b3116e-b4c4-464f-80ec-73cd9d9886b4
      sharepoint_tenant_id: #${env:TENANT_ID}
      sharepoint_auth_code: ${secrets:SPICE_SHAREPOINT_AUTH_CODE}
```

And set the `SPICE_SHAREPOINT_AUTH_CODE` secret via:
```shell
spice login sharepoint --tenant-id $TENANT_ID --client-id f2b3116e-b4c4-464f-80ec-73cd9d9886b4
```
