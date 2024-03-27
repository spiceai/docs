---
title: "SpiceAI"
sidebar_label: "SpiceAI"
sidebar_position: 2
---

### Example
To run a model trained on the Spice.AI platform, specifiy it in the `from` key.
```yaml
models:
  - from: spice.ai/taxi_tech_co/taxi_drives/models/drive_stats
    name: drive_stats
    datasets:
      - drive_stats_inferencing
```

This configuration allows for specifying models hosted by Spice AI, including their versions or specific training run IDs.
```yaml
models:
  - from: spice.ai/taxi_tech_co/taxi_drives/models/drive_stats:latest # Git-like tagging
    name: drive_stats_a
    datasets:
      - drive_stats_inferencing

  - from: spice.ai/taxi_tech_co/taxi_drives/models/drive_stats:60cb80a2-d59b-45c4-9b68-0946303bdcaf # Specific training run ID
    name: drive_stats_b
    datasets:
      - drive_stats_inferencing
```

### `from` Format
The from key must conform to the following regex format:
```regex
\A(?:spice\.ai\/)?(?<org>[\w\-]+)\/(?<app>[\w\-]+)(?:\/models)?\/(?<model>[\w\-]+):(?<version>[\w\d\-\.]+)\z
```

#### Examples
- `spice.ai/lukekim/smart/models/drive_stats:latest`: Refers to the latest version of the drive_stats model in the smart application by the user or organization lukekim.
- `spice.ai/lukekim/smart/drive_stats:60cb80a2-d59b-45c4-9b68-0946303bdcaf`: Specifies a model with a unique training run ID, bypassing the /models path for conciseness.

#### Specification
1. **Prefix (Optional):** The value must start with `spice.ai/`.
1. **Organization/User:** The name of the organization or user (`org`) hosting the model.
1. **Application Name**: The name of the application (`app`) which the model belongs to.
4. **Model Name:** The name of the model (`model`).
5. **Version (Optional):** A colon (`:`) followed by the version identifier (`version`), which could be a semantic version, `latest` for the most recent version, or a specific training run ID.