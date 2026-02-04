---
title: "catalogs"
sidebar_label: "catalogs"
pagination_prev: null
pagination_next: null
---

List [catalogs](../../components/catalogs) currently loaded by the Spice runtime.

### Requirements

- Spice runtime must be running

### Usage

```shell
> spice catalogs [flags]
```

#### Flags

- `--tls-root-certificate-file` The path to the root certificate file used to verify the Spice.ai runtime server certificate

### Example

```shell
> spice catalogs

FROM         NAME
spiceai      spiceai
databricks   us_census_data
```
