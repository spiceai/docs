---
title: 'Kubernetes Secret Store'
sidebar_label: 'Kubernetes Secret Store'
sidebar_position: 3
description: 'Kubernetes Secret Store Documentation'
---

The `kubernetes` store supports reading specific secrets using a selector with the secret's name.

## Example

```yaml
secrets:
  - from: kubernetes:my_secret
    name: k8s
```

And the secret can be referenced in parameters:

```yaml
datasets:
  - from: spice.ai/spiceai/quickstart/datasets/taxi_trips
    name: taxi_trips
    params:
      spiceai_api_key: ${k8s:spiceai_api_key} # ${secrets:spiceai_api_key} can also be used to fallback to other secret stores
```

Load secrets from multiple Kubernetes secrets by defining multiple Kubernetes secret stores with the appropriate selectors for the secrets to read:

```yaml
secrets:
  - from: kubernetes:my_secret
    name: k8s
  - from: kubernetes:my_other_secret
    name: k8s_other
```

## Kubernetes Secret Store Configuration

Note: This method requires the Kubernetes service account, which is running the `spiced` pod, to have extended roles for secrets API access. Configure this service account with the necessary permissions to read secrets from the Kubernetes API.

Example of Kubernetes role configuration for a custom service account:

```yaml
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: spiced-account-role
rules:
  - apiGroups: ['']
    resources: ['secrets']
    verbs: ['get']
```
