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

The Keyring Store will read entries where the entry account or user is set to `spiced`.

## Example

To set the `spiceai` API Key secret using macOS keychain, create a new keychain entry, and set the value with the API Key.

`"<your spice.ai app api key>"`

<img src="/img/secrets-keychain-example.png" alt="" width="800" />

The `keyring` store is configured in the Spicepod manifest:

```yaml
secrets:
  - from: keyring
    name: keyring
```

And the secret can be referenced in parameters:

```yaml
datasets:
  - from: spice.ai/spiceai/quickstart/datasets/taxi_trips
    name: taxi_trips
    params:
      spiceai_api_key: ${keyring:spiceai_api_key} # ${secrets:spiceai_api_key} can also be used
```