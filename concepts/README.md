# Core Concepts

## Main Components

### Spice CLI

The `spice` command line tool for interacting with Spice AI.

### Spice Runtime

The Spice AI core runtime which runs as the daemon `spiced` and includes the AI and Data engines.

### Spice Registry

The registry of pods and datasources that can be fetched with the Spice CLI.

## AI Development Concepts

### Pod

A collection of configuration and data used to train and deploy AI with an application

### Datasource

A specification on how to load and process data

### Data Connector

Paired with a datasource, a data connector contains the logic necessary to ingest the data from wherever it lives
