---
title: 'Caching'
sidebar_label: 'Caching'
sidebar_position: 2
description: 'Caching use cases with Spice.ai, including write-through, read-through, SQL, S3, and HTTP caching.'
pagination_prev: null
pagination_next: null
---

Spice.ai provides two complementary caching layers. Dataset acceleration materializes upstream data into a fast local engine. The SQL results cache stores query output in memory so that identical queries return instantly without re-executing against the accelerator. Both layers are configurable independently and work together to minimize latency and upstream load.

import DocCardList from '@theme/DocCardList';

<DocCardList />
