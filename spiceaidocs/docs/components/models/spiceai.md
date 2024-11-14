---
title: 'Spice Cloud Platform'
description: 'Instructions for using models hosted on the Spice Cloud Platform with Spice.'
sidebar_label: 'Spice Cloud Platform'
sidebar_position: 2
---

To use a model hosted on the [Spice Cloud Platform](https://docs.spice.ai/building-blocks/spice-models), specify the `spice.ai` path in `from`.

Example:

```yaml
models:
  - from: spice.ai/taxi_tech_co/taxi_drives/models/drive_stats
    name: drive_stats
    datasets:
      - drive_stats_inferencing
```

Specific model versions can be referenced using a version label or Training Run ID.

```yaml
models:
  - from: spice.ai/taxi_tech_co/taxi_drives/models/drive_stats:latest # Label
    name: drive_stats_a
    datasets:
      - drive_stats_inferencing

  - from: spice.ai/taxi_tech_co/taxi_drives/models/drive_stats:60cb80a2-d59b-45c4-9b68-0946303bdcaf # Training Run ID
    name: drive_stats_b
    datasets:
      - drive_stats_inferencing
```

## `from` Format

The from key must conform to the following regex format:

```regex
\A(?:spice\.ai\/)?(?<org>[\w\-]+)\/(?<app>[\w\-]+)(?:\/models)?\/(?<model>[\w\-]+):(?<version>[\w\d\-\.]+)\z
```

Examples:

- `spice.ai/lukekim/smart/models/drive_stats:latest`: Refers to the latest version of the drive_stats model in the smart application by the user or organization lukekim.
- `spice.ai/lukekim/smart/drive_stats:60cb80a2-d59b-45c4-9b68-0946303bdcaf`: Specifies a model with a unique training run ID.

### Specification

1. **Prefix (Optional):** The value must start with `spice.ai/`.
1. **Organization/User:** The name of the organization or user (`org`) hosting the model.
1. **Application Name**: The name of the application (`app`) which the model belongs to.
1. **Model Name:** The name of the model (`model`).
1. **Version (Optional):** A colon (`:`) followed by the version identifier (`version`), which could be a semantic version, `latest` for the most recent version, or a specific training run ID.
