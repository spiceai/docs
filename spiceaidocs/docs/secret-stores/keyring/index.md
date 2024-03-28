---
title: 'Keyring Secret Store'
sidebar_label: 'Keyring Secret Store'
sidebar_position: 4
description: 'Keyring Secret Store Documentation'
pagination_next: null
---

The `keyring` store enables Spice to access secrets from the secure/credential store of the host operating system:

- Linux: The secret-service and kernel keyutils.
- macOS: The keychain.
- Windows: The Credential Manager.

The Keyring Store will read entries for names formatted as `spice_secret_<secret-name>` and where the entry account or user is set to `spiced`.

Note: For compatibility with Spice secret objects, secret values are required to be stored as JSON strings, as the keyring store only supports string values.

## Example

For setting `spiceai` api key secret using macOS keychain, create new keychain entry, with following JSON string value

```json
"{ key: "<your spice.ai app api key>" }"
```

<img src="/img/secrets-keychain-example.png" alt="" width="800" />

Then set `store` field of the `secrets` section in the Spicepod manifest:

```yaml
secrets:
  store: keyring
```
