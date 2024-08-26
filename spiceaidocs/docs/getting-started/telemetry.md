---
title: 'Telemetry'
sidebar_label: 'Telemetry'
sidebar_position: 3
description: 'Learn how Spice AI uses anonymous telemetry.'
pagination_next: null
---

Spice collects anonymous telemetry data, which is used to help understand how to improve the product in future versions.

Data collected includes:

- The version of Spice being used (i.e. `v0.17.2-beta`)
- An anonymous identifier for the Spice instance, computed as `sha256(hostname + spicepod.name)`.
- An anonymous identifier for the Spicepod, computed as `sha256(spicepod.name)`.
  - The code to calculate these identifiers is here: <https://github.com/spiceai/spiceai/blob/trunk/crates/telemetry/src/anonymous.rs#L65>
- Various metrics related to usage of features of the runtime, see the full list here: <https://github.com/spiceai/spiceai/blob/trunk/crates/telemetry/src/lib.rs#L32>

Data collected is sent to `https://telemetry.spiceai.org` once every hour.

## Disabling Telemetry

Telemetry can be disabled in one of three ways:

1. Running the Spice runtime with the CLI flag `--telemetry-enabled false`:

  ```bash
  spice run -- --telemetry-enabled false
  ```

  or

  ```bash
  spiced --telemetry-enabled false
  ```

2. Add the following configuration to the Spicepod configuration file (`spicepod.yaml`):

  ```yaml
  runtime:
    telemetry:
      enabled: false
  ```

3. Compile the Spice runtime without the `anonymous_telemetry` default feature:

  ```bash
  cargo build --release --no-default-features --features "<other_default_features>"
  ```

  i.e.

  ```bash
  cargo build --release --no-default-features --features "duckdb,postgres,sqlite,mysql,flightsql,delta_lake,databricks,dremio,clickhouse,spark,snowflake,ftp,debezium"
  ```
