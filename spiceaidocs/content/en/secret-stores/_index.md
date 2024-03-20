---
type: docs
title: 'Secret Stores'
linkTitle: 'Secret Stores'
description: ''
weight: 40
---

A secret store is a location where `secret` objects are stored, which are used to store sensitive data, like a passwords, a tokens, or keys.

Spice.ai supports four types of secret stores: `file`, `env`, `kubernetes` and `keyring`. The type of secret store is specified in the `store` field of the `secrets` section in the Spicepod manifest.

### File Secret Store

Default secret store uses a file located at `~/.spice/auth`.
The Spice.ai CLI offers the `spice login` command to streamline credential storage. When logging into Spice.ai, it automatically saves credentials in the secret store file under `spiceai` secret.

### Environment Secret Store

The `env` store type allows Spice.ai to read secrets from environment variables. The environment variables should be formatted like `SPICE_SECRET_<secret-name>_<secret-value-key>`.

All variables with the same prefix `SPICE_SECRET_<secret-name>` are combined into a single secret. This allows you to group related secret values under a single secret name.

**Example**

```yaml
secrets:
  store: env
```

Setting `spiceai` secret with spice.ai API key in `key` secret value:

```bash
SPICE_SECRET_SPICEAI_KEY="343533|**************" \
  spice run
```

### Kubernetes Secret Store

The `kubernetes` store type allows Spice.ai to read Kubernetes secrets.

```yaml
secrets:
  store: kubernetes
```

Note: This method requires the Kubernetes service account, which is running the Spice.ai pod, to have extended roles for secrets API access. Make sure to configure this service account with the necessary permissions to read secrets from the Kubernetes API.

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

### Keyring Secret Store

The `keyring` store allows Spice.ai to access secrets from the secure store of the host operating system:

- On Linux, it uses the secret-service and kernel keyutils.
- On macOS, it uses the keychain.
- On Windows, it uses the credential manager.

The keyring store will read entries name to be formatted as `spice_secret_<secret-name>`, and entry account or user should be set to `spiced`.

Note: secret values required to be stored as JSON strings for compatibility with Spice.ai secret objects, as the keyring store supports only string values.

**Example**

For setting `spiceai` api key secret using macOS keychain, create new keychain entry, with following JSON string value

```
"{ key: "<your spice.ai app api key>" }"
```

<img src="/images/secrets-keychain-example.png" alt="" width="800">

Then set `store` field of the `secrets` section in the Spicepod manifest:

```yaml
secrets:
  store: keyring
```
