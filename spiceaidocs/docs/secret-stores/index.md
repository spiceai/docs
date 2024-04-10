---
title: 'Secret Stores'
sidebar_label: 'Secret Stores'
description: ''
sidebar_position: 7
pagination_prev: null
pagination_next: null
---

A Secret Store is a location where `secret` objects are stored, used to store sensitive data, like passwords, tokens, secret keys.

Spice supports multiple types of secret stores: `file`, `env`, `kubernetes`, `keyring` and `aws_secrets_manager`. The type of secret store is specified in the `store` field of the `secrets` section in the Spicepod manifest.

## Example

```yaml
secrets:
  store: env
```

## Secret Stores

import DocCardList from '@theme/DocCardList';

<DocCardList />