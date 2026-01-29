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

FROM                                            NAME          REPLICATION ACCELERATION STATUS PROPERTIES 
spice.ai/spiceai/quickstart/datasets/taxi_trips taxi_trips    false       false        Ready  map[]      
spice.ai/spiceai/tpch/datasets/tpch.customer    tpch.customer false       false        Ready  map[]      
spice.ai/spiceai/tpch/datasets/tpch.lineitem    tpch.lineitem false       false        Ready  map[]      
spice.ai/spiceai/tpch/datasets/tpch.nation      tpch.nation   false       false        Ready  map[]      
spice.ai/spiceai/tpch/datasets/tpch.orders      tpch.orders   false       false        Ready  map[]      
spice.ai/spiceai/tpch/datasets/tpch.part        tpch.part     false       false        Ready  map[]      
spice.ai/spiceai/tpch/datasets/tpch.partsupp    tpch.partsupp false       false        Ready  map[]      
spice.ai/spiceai/tpch/datasets/tpch.region      tpch.region   false       false        Ready  map[]      
spice.ai/spiceai/tpch/datasets/tpch.supplier    tpch.supplier false       false        Ready  map[]  
```

### Additional Example

```shell
>>> spice datasets --tls-root-certificate-file /path/to/cert.pem

FROM                                            NAME          REPLICATION ACCELERATION STATUS PROPERTIES 
spice.ai/spiceai/quickstart/datasets/taxi_trips taxi_trips    false       false        Ready  map[]      
spice.ai/spiceai/tpch/datasets/tpch.customer    tpch.customer false       false        Ready  map[]      
spice.ai/spiceai/tpch/datasets/tpch.lineitem    tpch.lineitem false       false        Ready  map[]      
spice.ai/spiceai/tpch/datasets/tpch.nation      tpch.nation   false       false        Ready  map[]      
spice.ai/spiceai/tpch/datasets/tpch.orders      tpch.orders   false       false        Ready  map[]      
spice.ai/spiceai/tpch/datasets/tpch.part        tpch.part     false       false        Ready  map[]      
spice.ai/spiceai/tpch/datasets/tpch.partsupp    tpch.partsupp false       false        Ready  map[]      
spice.ai/spiceai/tpch/datasets/tpch.region      tpch.region   false       false        Ready  map[]      
spice.ai/spiceai/tpch/datasets/tpch.supplier    tpch.supplier false       false        Ready  map[]  
```
