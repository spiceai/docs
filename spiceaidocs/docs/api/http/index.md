---
title: 'HTTP API'
sidebar_label: 'HTTP'
sidebar_position: 1
description: ''
pagination_prev: null
pagination_next: null
---

import DocCardList from '@theme/DocCardList';

<DocCardList />

## Authentication

API Key authentication is supported for all HTTP routes. For more details, see [API Key Authentication](../../api/auth/index.md).

## Cross-Origin Resource Sharing (CORS)

CORS is disabled by default. To enable CORS for all origins, add the following configuration to your `spicepod.yaml` file:

```yaml
runtime:
  cors:
    enabled: true
```

See [CORS](/reference/spicepod/index.md#runtimecors) for more details.
