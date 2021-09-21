---
type: docs
title: "Dataspaces"
linkTitle: "Dataspaces"
weight: 20
description: "Reference documentation for Spice.ai Dataspaces"
---

- [API Reference]({{<ref "api">}})

A dataspace is a specification on how the Spice.ai runtime and AI engine loads, processes and interacts with data from a single source. A dataspace may contain a single data connector and data processor. There may be multiple dataspace definitions within a pod. The fields specified in the union of dataspaces are used as inputs to the neural networks that Spice.ai trains.

A dataspace that is defined without either a data connector or a data processor must use the [POST /pods/{pod}/observations]({{<ref api>}}) API for data input.

A dataspace defined with both a data connector and data processor will load data automatically using those components. Spice.ai provides an extensible way for anyone to create a new data connector and data processor in the [data-components-contrib](https://github.com/spiceai/data-components-contrib) repo.

A dataspace that is defined without a data connector, but with a data processor can load data by using the [POST /pods/{pod}/dataspaces/{dataspace_from}/{dataspace_name}] API. The data will be parsed by the data processor - using the JSON processor means calling the API with JSON data, and using the CSV processor means calling the API with CSV data.

For more information on the data processors available see the [data-components-contrib dataprocessors](https://github.com/spiceai/data-components-contrib/tree/trunk/dataprocessors).
