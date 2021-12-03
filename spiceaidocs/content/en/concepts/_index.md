---
type: docs
title: "Spice.ai Core Concepts"
linkTitle: "Core Concepts"
weight: 10
no_list: true
---

## Spice.ai CLI

The `spice` command line tool for interacting with the Spice.ai runtime during development. View the [CLI reference]({{<ref "cli">}}) to learn more.

## Spice.ai Runtime

The Spice.ai core runtime which runs as the daemon `spiced` and includes the AI and Data engines. The runtime also serves the [Spice.ai API]({{<ref "api">}}).

## [spicerack.org](https://spicerack.org)

The registry [spicerack.org](https://spicerack.org) of Spice.ai pods that can be fetched with the Spice.ai CLI.

## Pod

A `Pod` is a package of configuration and data used to train and deploy Spice.ai with an application.

A `Pod manifest` is a YAML file that describes how to connect data with a learning environment.

A Pod is constructed from the following components:

### Dataspace

A [dataspace]({{<ref "concepts/dataspaces">}}) is a specification on how the Spice.ai runtime and AI engine loads, processes and interacts with data from a single source. A dataspace may contain a single data connector and data processor. There may be multiple dataspace definitions within a pod. The fields specified in the union of dataspaces are used as inputs to the neural networks that Spice.ai trains.

A dataspace that doesn't contain a data connector/processor means that the observation data for this dataspace will be provided by calling [POST /pods/{pod}/observations]({{<ref api>}}).

### Data Connector

A [data connector]({{<ref "reference/pod#data-connector">}}) is a reuseable component that contains logic to fetch or ingest data from an external source. Spice.ai provides a general interface that anyone can implement to create a data connector, see the [data-components-contrib](https://github.com/spiceai/data-components-contrib/tree/trunk/dataconnectors) repo for more information.

### Data Processor

A [data processor]({{<ref "reference/pod#data-processor">}}) is a reusable component, composable with a data connector that contains logic to process raw connector data into [observations]({{<ref "api#observations">}}) and state Spice.ai can use.

Spice.ai provides a general interface that anyone can implement to create a data processor, see the [data-components-contrib](https://github.com/spiceai/data-components-contrib/tree/trunk/dataprocessors) repo for more information.

### Actions

[Actions]({{<ref "reference/pod#actions">}}) are the set of actions the Spice.ai runtime can recommend for a pod.

### Recommendations

To intelligently adapt its behavior, an application should query the Spice.ai runtime for which [action]({{<ref "reference/pod#actions">}}) it recommends to take given a specified time. The result of this query is a [recommendation]({{<ref "concepts/recommendations">}}).

If a time is not specified, the resulting recommendation query time will default to the time of the most recently ingested observation.

### Training Rewards

[Training Rewards]({{<ref "reference/pod#rewards">}}) are code definitions in Python that tell the Spice.ai AI Engine how to train the neural networks to achieve the desired goal. A reward is defined for each action specified in the pod.

In the future we will expand the languages we support for writing the reward functions in. [Let us know](mailto:hey@spiceai.io) which language you want to be able to write your reward functions in!
