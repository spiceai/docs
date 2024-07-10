---
title: 'Delta Lake Data Connector'
sidebar_label: 'Delta Lake Data Connector'
description: 'Delta Lake Data Connector Documentation'
pagination_prev: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Query/accelerate [Delta Lake](https://delta.io/) tables in Spice.

## Configuration

`spice login delta_lake` can be used to configure the secrets needed for connecting to Delta Lake tables.

<Tabs>
  <TabItem value="delta_lake_s3" label="Delta Lake + S3">
    ```bash
    spice login delta_lake --aws-region <aws-region> --aws-access-key-id <aws-access-key-id> --aws-secret-access-key <aws-secret-access-key>
    ```

  </TabItem>
  <TabItem value="delta_lake_azure" label="Delta Lake + Azure Blob">
    ```bash
    spice login delta_lake --azure-storage-account-name <account-name> --azure-storage-access-key <access-key>
    ```

  </TabItem>
  <TabItem value="delta_lake_gcp" label="Delta Lake + Google Storage">
    ```bash
    spice login delta_lake --google-service-account-path /path/to/service-account.json
    ```

  </TabItem>
</Tabs>

## Example

```yaml
datasets:
  # Example for local Delta Lake
  - from: delta_lake:/path/to/local/delta/table  // A local filesystem path to a Delta Lake table
    name: my_delta_lake_table
  # Example for Delta Lake on S3
  - from: delta_lake:s3://my_bucket/path/to/s3/delta/table/  // A reference to a table in S3
    name: my_delta_lake_table
  # Example for Delta Lake on Azure Blob
  - from: delta_lake:abfss://my_container@my_account.dfs.core.windows.net/path/to/azure/delta/table/  // A reference to a table in Azure Blob
    name: my_delta_lake_table
```

### Auth

Object store credentials are required to access non-public Delta Lake tables.

Check [Secrets Stores](/secret-stores) for more details.

<Tabs>
  <TabItem value="local" label="Local" default>
    ```bash
    spice login delta_lake --aws-region <aws-region> --aws-access-key-id <aws-access-key-id> --aws-secret-access-key <aws-secret-access-key>
    ```

    Learn more about [File Secret Store](/components/secret-stores/file).

  </TabItem>
  <TabItem value="env" label="Env">
    ```bash
    SPICE_SECRET_DELTA_LAKE_AWS_REGION=<aws-region> \
    SPICE_SECRET_DELTA_LAKE_AWS_ACCESS_KEY_ID=<aws-access-key-id> \
    SPICE_SECRET_DELTA_LAKE_AWS_SECRET_ACCESS_KEY=<aws-secret
    spice run
    ```

    `spicepod.yaml`
    ```yaml
    version: v1beta1
    kind: Spicepod
    name: spice-app

    secrets:
      store: env

    # <...>
    ```

    Learn more about [Env Secret Store](/components/secret-stores/env).

  </TabItem>
  <TabItem value="k8s" label="Kubernetes">
    ```bash
    kubectl create secret generic delta_lake \
      --from-literal=aws-region='<aws-region>'
      --from-literal=aws-access-key-id='<aws-access-key-id>'
      --from-literal=aws-secret-access-key='<aws-secret-access-key>'
    ```

    `spicepod.yaml`
    ```yaml
    version: v1beta1
    kind: Spicepod
    name: spice-app

    secrets:
      store: kubernetes

    # <...>
    ```

    Learn more about [Kubernetes Secret Store](/components/secret-stores/kubernetes).

  </TabItem>
  <TabItem value="keyring" label="Keyring">
    Add new keychain entry (macOS), with secrets in JSON string

    ```bash
    security add-generic-password -l "Delta Lake Secret" \
    -a spiced -s spice_secret_delta_lake \
    -w $(echo -n '{"aws-region": "<aws-region>", "aws-access-key-id": "<aws-access-key-id>", "aws-secret-access-key": "<aws-secret-access-key>"}')
    ```

    `spicepod.yaml`
    ```yaml
    version: v1beta1
    kind: Spicepod
    name: spice-app

    secrets:
      store: keyring

    # <...>
    ```

    Learn more about [Keyring Secret Store](/components/secret-stores/keyring).

  </TabItem>
</Tabs>
