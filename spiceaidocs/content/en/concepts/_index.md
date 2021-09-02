---
type: docs
title: "Spice.ai concepts"
linkTitle: "Concepts"
weight: 10
description: "Learn about Spice.ai"
no_list: true
---

## Main Components

### Spice.ai CLI

The `spice` command line tool for interacting with the Spice.ai runtime.

### Spice.ai Runtime

The Spice.ai core runtime which runs as the daemon `spiced` and includes the AI and Data engines.

### Spice Rack Registry

The AI package registry [spicerack.org](https://spicerack.org) of pods and dataspaces that can be fetched with the Spice.ai CLI.

## AI Development Concepts

### Pod / Pod manifest

A package of configuration and data used to train and deploy Spice.ai with an application.

### Dataspace

A specification on how the Spice.ai runtime and AI engine loads, processes and interacts with data.

### Data Connector

A data connector is a reuseable component that contains logic to fetch or ingest data.

### Data Processor

A data processor is a reusable component, composable with a data connector that contains logic to processor raw connector data into observations and state Spice.ai can use.
