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

### Package Limits

A Spicepod from spicerack.org is downloaded as an archive and checked before anything is installed. `spice add` refuses an archive that exceeds any of these fixed limits, and installs nothing from it:

| Limit | Value |
| --- | --- |
| Download size | 256 MiB |
| Entries in the archive | 10,000 |
| Total expanded size | 1 GiB |

The archive is extracted in full into a staging directory and then moved into `spicepods/`, so a refused archive leaves no files behind and adds no `dependencies:` entry to `spicepod.yaml`. `spice add` also refuses an archive with an entry outside the Spicepod's directory, such as `../escaped.txt`, and never writes through a symbolic link: when `spicepods/`, the Spicepod's directory, or a directory inside an existing install is a link, the install fails and names the link. For example:

```
ERROR Failed to install Spicepod 'acme/large-pod' from spicerack.org: the archive expands to 3.0 GiB, more than the 1 GiB a Spicepod package may expand to, so nothing was installed. Check the Spicepod name and retry, or install from a local path with `spice add <path>`. See: https://spiceai.org/docs/cli/reference/add
```

### Dependencies That Run Programs

A dependency is added as `restricted`, the default [trust level](../../reference/spicepod/index.md#dependencies), which keeps any of its components that start a program, run a `build:` command, or load a native library on the host from being loaded or built. When the added Spicepod declares such a component, `spice add` prints a note that names it and the `dependencies:` entry that trusts the Spicepod, `- { from: <spicepod>, trust: full }`.
