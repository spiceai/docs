---
type: docs
title: "pods"
linkTitle: "pods"
weight: 90
---
Lists Spicepods loaded by the Spice runtime

### Usage:
```shell 
spice pods [flags]
```

#### Flags:
  - `-h`, `--help`   help for pods

### Examples:
```shell 
>>> spice pods

VERSION NAME        DATASETSCOUNT MODELSCOUNT DEPENDENCIESCOUNT
v1beta1 demo        2             1           0
v1beta1 another_pod 3             0           1
```

