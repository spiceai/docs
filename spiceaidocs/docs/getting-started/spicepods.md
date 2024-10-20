---
title: 'Spicepods'
sidebar_label: 'Spicepods'
sidebar_position: 1
description: 'An introduction to Spicepods'
pagination_next: null
---

## Overview

A **Spicepod** is a package that encapsulates application-centric datasets and machine learning (ML) models.

Spicepods are analogous to code packaging systems, like NPM, however differ by expanding the concepts to data and ML models.

## Structure

A Spicepod is described by a YAML manifest file, typically named `spicepod.yaml`, which includes the following key sections:

- **Metadata:** Basic information about the Spicepod, such as its name and version.
- **Datasets:** Definitions of datasets that are used or produced within the Spicepod.
- **Catalogs:** Definitions of catalogs that are used within the Spicepod.
- **Models:** Definitions of ML models that the Spicepod manages, including their sources and associated datasets.
- **Secrets:** Configuration for any secret stores used within the Spicepod.

## Example Manifest

```yaml
version: v1beta1
kind: Spicepod
name: my_spicepod

datasets:
  - from: spice.ai/spiceai/quickstart
    name: qs
    acceleration:
      enabled: true
      refresh_mode: append

models:
  - from: file://model_path.onnx
    name: my_model
    datasets:
      - qs

secrets:
  - from: env
    name: env
```

### Additional Example

```yaml
version: v1beta1
kind: Spicepod
name: another_spicepod

datasets:
  - from: spice.ai/spiceai/sample
    name: sample_ds
    acceleration:
      enabled: true
      refresh_mode: full

models:
  - from: file://another_model_path.onnx
    name: another_model
    datasets:
      - sample_ds

secrets:
  - from: env
    name: env
```

## Key Components

### Datasets

Datasets in a Spicepod can be sourced from various locations, including local files or remote databases. They can be materialized and accelerated using different engines such as DuckDB, SQLite, or PostgreSQL to optimize performance.

Learn more at [Datasets](/reference/spicepod/datasets.md).

### Catalogs

Catalogs in a Spicepod can contain multiple schemas. Each schema, in turn, contains multiple tables where the actual data is stored.

Learn more at [Catalogs](/reference/spicepod/catalogs.md).

### Models

ML models are integrated into the Spicepod similarly to datasets. The models can be specified using paths to local files or remote locations. ML inference can be performed using the models and datasets defined within the Spicepod.

Learn more at [Models](/reference/spicepod/models.md).

### Secrets

Spice.ai supports various secret stores to manage sensitive information such as API keys or database credentials. Supported secret store types include environment variables, files, AWS Secrets Manager, Kubernetes secrets, and keyrings.

Learn more at [Secret Stores](/components/secret-stores/index.md)
