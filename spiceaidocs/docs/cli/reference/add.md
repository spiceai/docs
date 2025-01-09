---
title: "add"
sidebar_label: "add"
pagination_prev: null
pagination_next: null
---

Add a Spicepod to the project.

### Usage

```shell
spice add [spicerack slug] [flags]
```

- `spicerack slug`: The slug to the Spicepod on Spicerack.


#### Flags

- `-h`, `--help`   Print this help message

### Examples

Adding a Spicepod from Spicerack (like `spiceai/quickstart`):


```shell
> spice add spiceai/quickstart
```

**Directory Structure**: 
The command makes two main modifications to the directory structure:
1. It creates the `spicepods` directory in the project root if it does not exist.
2. It adds a Spicepod in the `spicepods` directory relative to the path defined by the Spicerack Slug. For this example, the command would create the directories `spicepods/spiceai` and `spicepods/spiceai/quickstart`, instantiating a Spicepod under the latter. More generally, the Spicepod is placed under `spicepods/[slug]`, where `slug` is the Spicerack slug associated with that Spicepod.

After running the command, the directory structure looks like this:
```
├── spicepods/
│   ├── spiceai/
│       ├── quickstart/
│           ├── spicepod.yaml
├── spicepod.yaml
└── ...
```

Any other Spicepods added using `spice add` are placed in the `spicepods` directory.


`spice add` also creates the appropriate Spicepod for the given Spicerack slug. For this example with `spiceai/quickstart`, the command creates the following the Spicepod under `spicepods/spiceai/quickstart`:
```yaml
# File: ./spicepods/spiceai/quickstart/spicepod.yaml

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

The `add` command also includes the above Spicepod as a dependency in the root `spicepod.yaml`, creating this file if it does not exist:
```yaml
# File: ./spicepod.yaml

version: v1
kind: Spicepod
name: Spice AI quickstart
dependencies:
    - spiceai/quickstart
```