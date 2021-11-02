---
type: docs
title: "Dataspaces"
linkTitle: "Dataspaces"
weight: 20
description: "Reference documentation for Spice.ai Dataspaces"
---

A **dataspace** is a logical grouping of data with definitions of how that data should be loaded and processed, usually from a single source.

A combination of its [data source](https://github.com/spiceai/data-components-contrib/tree/trunk/dataprocessors) and its [name](https://github.com/spiceai/data-components-contrib/tree/trunk/dataprocessors) identifies it, for example, `nasdaq/msft` or `twitter/tweets`.

The [dataspaces node](https://github.com/spiceai/data-components-contrib/tree/trunk/dataprocessors) of the [Spicepod manifest](https://docs.spiceai.org/reference/pod/) may hold one or more dataspace definitions. The runtime will merge data from all pod dataspaces into observations.

Each dataspace encapsulates definitions for its core data primitives, such as [measurements](https://docs.spiceai.org/reference/pod/#dataspacesmeasurements) (numerical data), [categories](https://docs.spiceai.org/reference/pod/#dataspacescategories) (string-based categorical data), and [tags](https://docs.spiceai.org/reference/pod/#dataspacestags) (string-based tags). It also includes configuration for data connector and data processor components to load and process data into those primitives.

While measurements and categories are scoped to the dataspace namespace, tags are aggregated with tags from other dataspaces to the pod scope.

Dataspaces may load data through a [data connector](https://docs.spiceai.org/concepts/#data-connector) and [processor](https://docs.spiceai.org/concepts/#data-processor) or through the POST [/pods/{pod}/observations]({{<ref api>}}) API. The API accepts JSON or CSV data and uses the appropriate [JSON](https://github.com/spiceai/data-components-contrib/blob/trunk/dataprocessors/json/README.md) or [CSV](https://github.com/spiceai/data-components-contrib/tree/trunk/dataprocessors/csv) data processor. 

Data connectors and processors are community-maintained components for streaming and processing time-series data. More information can be found in the [data-components-contrib](https://github.com/spiceai/data-components-contrib) repository.

### Reference

- List of [supported data connectors](https://github.com/spiceai/data-components-contrib/tree/trunk/dataconnectors/README.md)
- List of [supported data processors](https://github.com/spiceai/data-components-contrib/blob/trunk/dataprocessors/README.md)
- [API Reference]({{<ref "api">}})