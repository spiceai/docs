---
title: 'Secret Stores'
sidebar_label: 'Secret Stores'
description: ''
sidebar_position: 7
---

A Secret Store is a location where `secret` objects are stored, used to store sensitive data, like passwords, tokens, secret keys.

Spice supports multiple types of secret stores: `file`, `env`, `kubernetes` and `keyring`. The type of secret store is specified in the `store` field of the `secrets` section in the Spicepod manifest.

## Example

```yaml
secrets:
  store: env
```

## Secret Stores

- [Environment Secret Store](env/index.md)
- [File Secret Store](file/index.md)
- [Kubernetes Secret Store](kubernetes/index.md)
- [Keyring Secret Store](keyring/index.md)
