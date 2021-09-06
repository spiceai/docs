---
type: docs
title: "Spice.ai concepts"
linkTitle: "Concepts"
weight: 10
no_list: true
---

## Components

### Spice.ai CLI

The `spice` command line tool for interacting with the Spice.ai runtime during development. View the [CLI reference]({{<ref "cli">}}) to learn more.

### Spice.ai Runtime

The Spice.ai core runtime which runs as the daemon `spiced` and includes the AI and Data engines. The runtime provides the [Spice.ai API]({{<ref "api">}}).

### [spicerack.org](https://spicerack.org)

The AI package registry [spicerack.org](https://spicerack.org) of pods that can be fetched with the Spice.ai CLI.

## Pod / Pod manifest

A `Pod` is a package of configuration and data used to train and deploy Spice.ai with an application.

A `Pod manifest` is a YAML file that describes how to connect data with a learning environment.

A Pod is constructed from the following components:

### Dataspace

A [dataspace]({{<ref "reference/pod#dataspace">}}) is a specification on how the Spice.ai runtime and AI engine loads, processes and interacts with data from a single source. A dataspace may contain a single data connector and data processor. There may be multiple dataspace definitions within a pod. The fields specified in the union of dataspaces are used as inputs to the neural networks that Spice.ai trains.

A dataspace that doesn't contain a data connector/processor means that the observation data for this dataspace will be provided by calling [POST /pods/{pod}/observations]({{<ref api>}}).

### Data Connector

A [data connector]({{<ref "reference/pod#data-connector">}}) is a reuseable component that contains logic to fetch or ingest data from an external source. Spice.ai provides a general interface that anyone can implement to create a data connector, see the [data-components-contrib](https://github.com/spiceai/data-components-contrib/tree/trunk/dataconnectors) repo for more information.

### Data Processor

A [data processor]({{<ref "reference/pod#data-processor">}}) is a reusable component, composable with a data connector that contains logic to process raw connector data into [observations]({{<ref "api#observations">}}) and state Spice.ai can use.

Spice.ai provides a general interface that anyone can implement to create a data processor, see the [data-components-contrib](https://github.com/spiceai/data-components-contrib/tree/trunk/dataprocessors) repo for more information.

### Actions

[Actions]({{<ref "reference/pod#actions">}}) are the set of actions the Spice.ai runtime can recommend for a pod.

### Training Rewards

[Training Rewards]({{<ref "reference/pod#rewards">}}) are code definitions in Python that tell the Spice.ai AI Engine how to train the neural networks to achieve the desired goal. A reward is defined for each action specified in the pod.

In the future we will expand the languages we support for writing the reward functions in. [Let us know](mailto:team@spiceai.io) which language you want to be able to write your reward functions in!

## Time

Time is a fundamental building block for the Spice.ai project. Spice.ai can natively understand how to process time series data, whether that data is streamed in a continuous manner or is batched into larger timeframes.

Taking a pod manifest and creating multiple pods with different time parameters will result in pods that can learn how to give recommendations for actions at different time frames. (i.e. should an action be taken once every second or once every day)

### Epoch

An epoch defines the beginning, or start, of the data stream. If Spice.ai receives data from before the epoch time, it is not used during training. If the epoch is omitted, the epoch is inferred to be `now` - `period`.

### Period

A period is the total span of time that is considered for a pod. The end of the data stream that Spice.ai will look at is the `epoch` + `period`.

### Interval

The interval is the time span that Spice.ai uses as a single input to the neural networks that power Spice.ai. Attempting to get a recommendation without Spice.ai having at least one intervals worth of data will result in an error.

### Granularity

The granularity is the smallest unit of time that specifies how many timesteps there are in an interval. The granularity cannot be larger than the interval. When streaming data in a continuous manner, the Spice.ai runtime can give a new recommendation for action after each new granularity's worth of data is collected.
