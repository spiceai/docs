---
title: 'Results Caching'
sidebar_label: 'Results Caching'
description: 'Learn how to use Spice in-memory caching of query results'
sidebar_position: 5
pagination_prev: null
pagination_next: null
---

Spice supports in-memory caching of query results, which is enabled by default for both the HTTP (`/v1/sql`) and Arrow Flight APIs.

Results caching can help improve performance for bursts of requests and for non-accelerated results such as refresh data returned [on zero results](/components/data-accelerators/data-refresh.md#behavior-on-zero-results).

Results caching employs a [least-recently-used (LRU)](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU) cache replacement policy with the ability to specify an item expiry duration, which defaults to 1-second.

```yaml
version: v1beta1
kind: Spicepod
name: app

runtime:
  results_cache:
    enabled: true
    cache_max_size: 128MiB
    eviction_policy: lru
    item_ttl: 1s
```

- `enabled` - optional, `true` by default
- `cache_max_size` - optional, maximum cache size. Default is `128MiB`
- `eviction_policy` - optional, cache replacement policy when the cached data reaches the `cache_max_size`. Default and only currently supported value is `lru` - [least-recently-used (LRU)](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU)
- `item_ttl` - optional, cache entry expiration duration, 1 second by default.
