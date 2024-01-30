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
