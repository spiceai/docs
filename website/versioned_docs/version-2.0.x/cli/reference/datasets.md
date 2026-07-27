---
title: "datasets"
sidebar_label: "datasets"
pagination_prev: null
pagination_next: null
---

Lists datasets loaded by the Spice runtime

### Usage

```shell
spice datasets [flags]
```

#### Flags

- `--tls-root-certificate-file`   The path to the root certificate file used to verify the Spice.ai runtime server certificate
- `-h`, `--help`   help for datasets

### Examples:

```shell
>>> spice datasets

NAME          FROM                                            REPLICATION ACCELERATION STATUS ERROR
taxi_trips    spice.ai/spiceai/quickstart/datasets/taxi_trips false       false        Ready
tpch.customer spice.ai/spiceai/tpch/datasets/tpch.customer   false       false        Ready
tpch.lineitem spice.ai/spiceai/tpch/datasets/tpch.lineitem   false       false        Ready
tpch.nation   spice.ai/spiceai/tpch/datasets/tpch.nation     false       false        Ready
tpch.orders   spice.ai/spiceai/tpch/datasets/tpch.orders     false       false        Ready
tpch.part     spice.ai/spiceai/tpch/datasets/tpch.part       false       false        Ready
tpch.partsupp spice.ai/spiceai/tpch/datasets/tpch.partsupp   false       false        Ready
tpch.region   spice.ai/spiceai/tpch/datasets/tpch.region     false       false        Ready
tpch.supplier spice.ai/spiceai/tpch/datasets/tpch.supplier   false       false        Ready
```

### Additional Example

```shell
>>> spice datasets --tls-root-certificate-file /path/to/cert.pem

NAME          FROM                                            REPLICATION ACCELERATION STATUS ERROR
taxi_trips    spice.ai/spiceai/quickstart/datasets/taxi_trips false       false        Ready
tpch.customer spice.ai/spiceai/tpch/datasets/tpch.customer   false       false        Ready
tpch.lineitem spice.ai/spiceai/tpch/datasets/tpch.lineitem   false       false        Ready
tpch.nation   spice.ai/spiceai/tpch/datasets/tpch.nation     false       false        Ready
tpch.orders   spice.ai/spiceai/tpch/datasets/tpch.orders     false       false        Ready
tpch.part     spice.ai/spiceai/tpch/datasets/tpch.part       false       false        Ready
tpch.partsupp spice.ai/spiceai/tpch/datasets/tpch.partsupp   false       false        Ready
tpch.region   spice.ai/spiceai/tpch/datasets/tpch.region     false       false        Ready
tpch.supplier spice.ai/spiceai/tpch/datasets/tpch.supplier   false       false        Ready
```
