---
title: 'Environment Secret Store'
sidebar_label: 'Environment Secret Store'
sidebar_position: 1
description: 'Environment Variables Secret Store Documentation'
---

The `env` store type enables Spice to read secrets from environment variables. Environment variables should be formatted `SPICE_SECRET_<secret-name>_<secret-value-key>`.

All variables with the same prefix `SPICE_SECRET_<secret-name>` are combined into a single secret. This allows grouping of related secret values under a single secret name.

## Example

```yaml
secrets:
  store: env
```

Setting `spiceai` secret with spice.ai API key in `key` secret value:

```bash
SPICE_SECRET_SPICEAI_KEY="343533|**************" \
  spice run
```
