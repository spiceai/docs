---
title: "add"
sidebar_label: "add"
pagination_prev: null
pagination_next: null
---

Adds a Spicepod to the project.

### Usage

```shell
spice add [spicerack slug] [flags]
```

- `spicerack slug`: The slug to the Spicepod on Spicerack.


#### Flags

- `-h`, `--help`   Print this help message

### Examples

**Adding a Spicepod from Spicerack (like `spiceai/quickstart`):**

```shell
> spice add spiceai/quickstart
```

This adds the following Spicepod under `spicepods/spiceai/quickstart`:
```yaml
 version: v1beta1
 kind: Spicepod
 name: quickstart

 datasets:
   - from: s3://spiceai-demo-datasets/taxi_trips/2024/
     name: taxi_trips
     description: taxi trips in s3
     params:
       file_format: parquet
     acceleration:
       enabled: true
 ```

It also includes this Spicepod as a dependency in the root `spicepod.yaml`:
```yaml
version: v1
kind: Spicepod
name: Spice AI quickstart
dependencies:
    - spiceai/quickstart
```