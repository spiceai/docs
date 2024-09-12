---
title: 'Sharepoint Data Connector'
sidebar_label: 'Sharepoint Data Connector'
description: 'Sharepoint Data Connector Documentation'
pagination_prev: null
---

The Sharepoint Data Connector enables federated SQL queries on documents stored in Sharepoint.

```yaml
datasets:
  - from: sharepoint:drive:Documents/path:/nuclear_secrets/
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
        "created_date_time": "2024-09-09T04:57:00",
        "c_tag": "\"c:{BD4D130F-2C95-4E59-9F93-85BD0A9E1B19},1\"",
        "e_tag": "\"{BD4D130F-2C95-4E59-9F93-85BD0A9E1B19},1\"",
        "id": "01YRH3MPAPCNG33FJMLFHJ7E4FXUFJ4GYZ",
        "last_modified_by_id": "cbccd193-f9f1-4603-b01d-ff6f3e6f2108",
        "last_modified_by_name": "Jack Eadie",
        "last_modified_date_time": "2024-09-09T04:57:00",
        "name": "ngx_google_perftools_module.md",
        "size": 959,
        "web_url": "https://spiceai.sharepoint.com/Shared%20Documents/md/ngx_google_perftools_module.md",
        "content": "# Module ngx_google_perftools_module\n\nThe `ngx_google_perftools_module` module (0.6.29) enables profiling of nginx worker processes using [Google Performance Tools](https://github.com/gperftools/gperftools). The module is intended for nginx developers.\n\nThis module is not built by default, it should be enabled with the `--with-google_perftools_module` configuration parameter.\n\n> **Note:** This module requires the [gperftools](https://github.com/gperftools/gperftools) library.\n\n## Example Configuration\n\n```nginx\ngoogle_perftools_profiles /path/to/profile;\n```\n\nProfiles will be stored as `/path/to/profile.<worker_pid>`.\n\n## Directives\n\n### google_perftools_profiles\n\n- **Syntax:** `google_perftools_profiles file;`\n- **Default:** —\n- **Context:** `main`\n\nSets a file name that keeps profiling information of nginx worker process. The ID of the worker process is always a part of the file name and is appended to the end of the file name, after a dot.\n"
    }
]
```


:::warning[Limitations]
The sharepoint connector does not yet support creating a dataset from a single file (e.g. an Excel spreadsheet). Datasets must be created from a folder of documents.
:::



## Configuration
### Parameters

- `sharepoint_client_id`: Required. The client ID of the Azure AD (Entra) application.
- `sharepoint_tenant_id`: Required. The tenant ID of the Azure AD (Entra) application.
- `sharepoint_client_secret`: Optional. For service principal authentication. The client secret of the Azure AD (Entra) application.
- `sharepoint_auth_code`: Optional. For user authentication. The authorization code obtained from the OAuth2 flow (see `spice login sharepoint` [docs](cli/reference/login)).

Note: Only one of `sharepoint_client_secret` or `sharepoint_authorization_code` is allowed.

### `from` formats

The `from` field in a Sharepoint dataset takes the following format:
```yaml
from: 'sharepoint:<drive_type>:<drive_id>/<subpath_type>:<subpath_value>'
```

#### Drives

The sharepoint connector supports datasets from a variety of sources:
 - Drives: A user's OneDrive or a document library in SharePoint.
  - From the drive's name: `from: sharepoint:drive:Documents/...`
  - From the drive's ID: `from: sharepoint:driveId:b!Mh8opUGD80ec7zGXgX9r/...`
 - Sites: A SharePoint site's default document library.
  - From the site's name: `from: sharepoint:site:MySite/...`
  - From the site's ID: `from: sharepoint:siteId:b!Mh8opUGD80ec7zGXgX9r/...`
 - User Drives: A user's OneDrive, `from: sharepoint:me/...`. In this case, no `drive_id` is specified. The user is identified based on the provided authentication.
 - Group Drives: A Group's default document library ( a Microsoft Entra, 365 group, or security group).
  - From the group's name: `from: sharepoint:group:MyGroup/...`
  - From the group's ID: `from: sharepoint:groupId:b!Mh8opUGD80ec7zGXgX9r/...`

For a name-based `drive_id`, the connector will attempt to resolve the name to an ID at startup.

#### Subpaths

Within a drive, the sharepoint connector can load documents from:
 - The root folder: `from: sharepoint:me/root`. In this case, no `subpath_value` is specified.
 - A specific path: `from: sharepoint:me/path:/nuclear_secrets` (`path` being the keyword).
 - A specific folder ID: `from: sharepoint:me/id:01QM2NJSNHBISUGQ52P5AJQ3CBNOXDMVNT`
