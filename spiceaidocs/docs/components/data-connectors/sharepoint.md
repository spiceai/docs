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
