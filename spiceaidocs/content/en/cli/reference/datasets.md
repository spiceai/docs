---
type: docs
title: "datasets"
linkTitle: "add"
weight: 90
---

Lists datasets loaded by the Spice runtime

### Usage:
```shell
spice datasets [flags]
```

#### Flags:
  -h, --help   help for datasets

### Examples:
```shell
>>> spice datasets

FROM                             NAME                      REPLICATION ACCELERATION DEPENDSON STATUS
spice.ai/eth.beacon.recent_slots eth_beacon_recent_slotsss false       false                  Ready
spice.ai/eth.recent_blocks       eth_rec_blocks            false       false                  Initializing
```