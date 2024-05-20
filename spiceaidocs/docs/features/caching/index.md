---
title: 'Results Caching'
sidebar_label: 'Results Caching'
description: 'Learn how to use Spice in-memory caching of query results'
sidebar_position: 5
pagination_prev: null
pagination_next: null
---

Spice supports in-memory LRU caching of query results.  This can improve performance for redundant queries over a small period of time.

```yaml
version: v1beta1
kind: Spicepod
name: app

runtime:
  results_cache:
    enabled: true
    cache_max_size: 128mb
    item_expire: 1s
```

- `enabled` - optional, `true` by default (if there is a non-empty `results_cache` section defined)
- `cache_max_size` - optional, maximum cache size. Default is `128MB`
- `item_expire` - optional, cache entry expiration time, 1 second by default.

:::warning[Limitations]
- Caching of Arrow Flight queries is not currently supported (coming soon).
:::