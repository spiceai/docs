---
title: 'Kubernetes Secret Store'
sidebar_label: 'Kubernetes Secret Store'
sidebar_position: 3
description: 'Kubernetes Secret Store Documentation'
---

The `kubernetes` store enables Spice to read Kubernetes secrets.

## Example

```yaml
secrets:
  store: kubernetes
```

Note: This method requires the Kubernetes service account, which is running the `spiced` pod, to have extended roles for secrets API access. Make sure to configure this service account with the necessary permissions to read secrets from the Kubernetes API.

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
