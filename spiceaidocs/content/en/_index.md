---
type: docs
no_list: true
---

# Spice.ai

**Spice.ai** makes it easy for developers to build apps that learn and adapt by streamlining the use of machine learning (ML) in software. Combined with time-series data, developers can create applications that continuously improve using ML recommendations.

Spice.ai takes a developer-first approach, and is focused on a fast, iterative, inner development loop, enabling developers to get started with ML in minutes instead of months.

📢 Read the Spice.ai announcement blog post at [blog.spiceai.org](https://blog.spiceai.org).

📺 View a getting started walkthrough of Spice.ai in action [here](https://www.youtube.com/watch?v=DKBLjuAz_lI).

## Features

The Spice.ai runtime is written in Golang and Python and runs as a container or microservice. It's deployable to any public cloud, on-premises, and edge. It is configured with a simple manifest and accessed by HTTP APIs.

Spice.ai includes:

- A lightweight, portable ML runtime accessible by simple HTTP APIs, allowing developers to use their preferred languages and frameworks
- A dashboard to visualize data and learning
- A developer-friendly CLI
- Simple, git-committable, configuration and code

### Community-Driven Data Components

Spice.ai also includes a library of community-driven [data components](https://github.com/spiceai/data-components-contrib) for streaming and processing time series data, enabling developers to quickly and easily combine data with learning to create intelligent models.

### Spicepod registry

Modern developers build with the community by leveraging registries such as npm, NuGet, and pip. The Spice.ai platform includes [spicerack.org](https://spicerack.org), the registry for ML building blocks.

As the community shares their ML building blocks (aka Spicepods, or pods for short), developers can quickly add them to their Spice.ai applications enabling them to stream data and build learning into their applications quickly and easily. Initially, Spicepods contain simple definitions of how the app should learn, and eventually will enable the sharing and use of fully-trained models.

<p align="center">
  <img src="https://user-images.githubusercontent.com/80174/132382372-c32cc8b7-25f2-4f82-8f9f-e4778fb69254.png" width="600" />
</p>

## Why Spice.ai?

Spice.ai is for developers who want to build intelligent applications but don't have the time or resources to learn, build and integrate the required ML to do so.

Imagine you have timestamped measurements of the room temperature and access to air-conditioning controls. If you had a time-series ML engine, your application could optimize when the A/C activates. You could reduce energy usage by not overcooling the room as the temperature drops.

Now imagine learning Python or R, neural networks, deep-learning algorithms and building a system that streams and processes time-series data to do that. With Spice.ai — which includes a time-series ML engine accessible over HTTP APIs, a library of community-driven components for data streaming and processing, and an ecosystem of pre-created ML configurations — you can build upon the experience of the community instead of doing it all yourself. You can focus on business logic and building your application instead of the ML.

### Pre-release software

⚠️ The vision to make it easy to build intelligent applications that learn is a vast undertaking. We haven't figured it all out or solved all the problems yet (we only started in June 2021!), so we’re inviting you on this journey and are looking for feedback the direction.

Spice.ai and spicerack.org are both pre-release, early, alpha software. Until v1.0, Spice.ai may have gaps, including limited deep learning algorithms, training-at-scale, and simulated environments. Also, Spicepods aren't searchable or listed on spicerack.org yet.

Our intention with this preview is to work with developers early to define and create the developer experience together. 🚀 See the [Roadmap to v1.0-stable](https://github.com/spiceai/spiceai/blob/trunk/docs/ROADMAP.md#spice-ai-v10-stable-roadmap) for upcoming features.

### Join us!

We greatly appreciate and value your support! You can help Spice.ai in a number of ways:

- ⭐️ Star this repo.
- Build an app with Spice.ai and send us feedback and suggestions at [hey@spiceai.io](mailto:hey@spiceai.io) or on [Discord](https://discord.gg/kZnTfneP5u).
- [File an issue](https://github.com/spiceai/spiceai/issues/new) if you see something not quite working correctly.
- Follow us on [Reddit](https://www.reddit.com/r/spiceai), [Twitter](https://twitter.com/SpiceAIHQ), and [LinkedIn](https://www.linkedin.com/company/74148478).
- Join our team ([We’re hiring!](https://spiceai.io/careers))
- Contribute code or documentation to the project (see [CONTRIBUTING.md](CONTRIBUTING.md)).

We’re also starting a community call series soon!

Thank you for sharing this journey with us. 🙏

### Sections

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Concepts</b></h5>
      <p class="card-text">Learn about Spice.ai concepts and terminology.</p>
      <a href="{{< ref concepts >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Getting started</b></h5>
      <p class="card-text">How to get up and running with Spice.ai in your environment in minutes.</p>
      <a href="{{< ref getting-started >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Quickstarts</b></h5>
      <p class="card-text">Quickstart tutorials to get started with Spice.ai quickly. 🚀</p>
      <a href="{{< ref quickstarts >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Samples</b></h5>
      <p class="card-text">Learn about Spice.ai with in-depth samples.</p>
      <a href="{{< ref samples >}}" class="stretched-link"></a>
    </div>
  </div>
</div>
<br />
<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>API</b></h5>
      <p class="card-text">Documentation on the Spice.ai API.</p>
      <a href="{{< ref api >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>CLI</b></h5>
      <p class="card-text">Documentation on the Spice.ai CLI.</p>
      <a href="{{< ref cli >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Reference</b></h5>
      <p class="card-text">Reference documentation on the Pod specification.</p>
      <a href="{{< ref reference >}}" class="stretched-link"></a>
    </div>
  </div>
</div>
