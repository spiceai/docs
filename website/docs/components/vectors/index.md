---
title: 'Vector Engines'
sidebar_label: 'Vector Engines'
description: 'Configure vector engines for efficient embedding storage and similarity search in Spice.'
sidebar_position: 7
pagination_prev: null
pagination_next: null
---

> 🎓 Learn how it works with the [Amazon S3 Vectors with Spice](https://spice.ai/blog/getting-started-with-amazon-s3-vectors-and-spice) engineering blog post.

Data sourced by Data Connectors, or views built atop them with vector embedding columns can be indexed and efficiently searched using a vector engine.

A vector engine will store all vector embeddings associated with columns in a dataset/view, provide efficient vector search operations and avoid unnecessary recomputation of embeddings.

A vector engine is configured by setting the `vectors` configuration. E.g.

```yaml
datasets:
  - name: dataset_with_embeddings
    vectors:
      enabled: true
```

For the complete reference specification see [datasets(../../reference/spicepod/datasets.md).

Supported Vector engines:

| Name                      | Description    |
| ------------------------- | -------------- |
| [`s3_vectors`][s3vectors] | AWS S3 vectors |

[s3vectors]: /docs/components/vectors/s3_vectors.md

:::warning[Limitations]

- A dataset or view must be accelerated (i.e. `datasets[].acceleration.enabled: true`, see [docs(../../reference/spicepod/datasets#accelerationenabled)) for a vector engine to be provided the appropriate data to ingest.

  :::

## Vector Engine Docs

import DocCardList from '@theme/DocCardList';

<DocCardList />
