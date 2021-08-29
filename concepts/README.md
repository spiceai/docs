# Core Concepts

## Main Components

### Spice CLI

The `spice` command line tool for interacting with Spice.ai.

### Spice Runtime

The Spice.ai core runtime which runs as the daemon `spiced` and includes the AI and Data engines.

### Spice Registry

The registry of pods and datasources that can be fetched with the Spice CLI.

## AI Development Concepts

### Pod / Pod manifest

A collection of configuration and data used to train and deploy AI with an application.

### Datasource

A specification on how to load and process data.

### Data Connector

A data connector is a reuseable component that contains logic to fetch or ingest data.

### Data Processor

A data processor is a reusable component, composable with a data connector that contains logic to processor raw connector data into observations and state Spice.ai can use.
