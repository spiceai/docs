---
title: 'Vector Engines'
sidebar_label: 'Vector Engines'
description: ''
sidebar_position: 7
pagination_prev: null
pagination_next: null
---

Data sourced by Data Connectors with vector embedding columns can be indexed and efficiently searched using a vector engine.

A vector engine will store all vector embeddings associated to columns in a dataset, provide efficient vector search operations and avoid unnecessary recomputation of embeddings.

A vector engine is configured by setting the `vectors` configuration. E.g.

```yaml
datasets:
  - name: dataset_with_embeddings
    vectors:
      enabled: true

```

For the complete reference specification see [datasets](../../reference/spicepod/datasets).

Supported Vector engines:

| Name                      | Description    |
| ------------------------- | -------------- |
| [`s3_vectors`][s3vectors] | AWS S3 vectors |

[s3vectors]: /docs/components/vectors/s3_vectors

## Vector Engine Docs

import DocCardList from '@theme/DocCardList';

<DocCardList />
