---
title: "add"
sidebar_label: "add"
pagination_prev: null
pagination_next: null
---

Add a Spicepod to the project.

### Usage

```shell
spice add [spicepod path] [flags]
```

- `spicepod path`: Either a [spicerack.org](https://spicerack.org) slug (optionally pinned to a version with `@`), or a path to a Spicepod directory on the local filesystem.

| Form                        | Example                       | Resolves to                                                     |
| --------------------------- | ----------------------------- | --------------------------------------------------------------- |
| Spicerack slug              | `spiceai/quickstart`          | The latest published version of the Spicepod on spicerack.org.  |
| Spicerack slug with version | `spiceai/quickstart@v1.0`     | The `v1.0` version of that Spicepod.                            |
| Local directory             | `../shared/pods/analytics`    | A Spicepod directory copied from the local filesystem.          |
| Local `file://` URL         | `file:///srv/pods/analytics`  | The same, written as a URL.                                     |

A path is treated as local when it starts with `/`, `../`, or `file://`, or when it already exists on disk; anything else is fetched from spicerack.org.

#### Flags

- `-h`, `--help`   Print this help message

### Examples

Adding a Spicepod from Spicerack (like `spiceai/quickstart`):


```shell
> spice add spiceai/quickstart
```

Pinning a published Spicepod to a version:

```shell
> spice add spiceai/quickstart@v1.0
```

Adding a Spicepod from a local directory:

```shell
> spice add ../shared/pods/analytics
```

A local Spicepod is copied into `spicepods/[pod-name]`, where `pod-name` is the source directory's name lowercased, and the root `spicepod.yaml` records the dependency as a path relative to the app directory rather than as a slug.

**Directory Structure**: 
The command makes two main modifications to the directory structure:
1. It creates the `spicepods` directory in the project root if it does not exist.
2. It adds the Spicepod defined by the Spicerack Slug in the relative path in the `spicepods` directory. For this example, the command would create the directories `spicepods/spiceai` and `spicepods/spiceai/quickstart`, instantiating a Spicepod under the latter. More generally, the Spicepod is placed under `spicepods/[slug]`, where `slug` is the Spicerack slug associated with that Spicepod.

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

 version: v1
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