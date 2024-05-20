---
title: 'Results Caching'
sidebar_label: 'Results Caching'
description: 'Learn how to use Spice in-memory caching of query results'
sidebar_position: 5
pagination_prev: null
pagination_next: null
---

Spice supports in-memory caching of query results.

Results caching can help improve performance for bursts of requests and for non-accelerated results such as refresh data returned [on zero results](/data-accelerators/data-refresh.md#behavior-on-zero-results).

Results caching employs a [least-recently-used (LRU)](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU) cache replacement policy with the ability to specific an item expiry duration which defaults to 1-second.

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
- Results caching for Arrow Flight queries is not currently supported (coming soon).
:::