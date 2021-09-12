---
type: docs
no_list: true
---

# Spice.ai

**Spice.ai** is an open source, portable runtime and set of tools that helps developers add AI to their applications by leveraging machine-learning on time-series data.

**The vision for Spice.ai is to make creating intelligent applications as easy as building a modern website.**

Spice.ai focuses on a fast, iterative, inner development loop through simple configuration, REST-like APIs, and the goal of coding in any language or framework.

Spice.ai includes:

- A lightweight, portable ML runtime accessible by simple HTTP APIs
- A developer-friendly CLI
- Simple, git-committable, configuration and code
- Community-driven re-usable components for streaming and processing time-series data
- Re-useable building blocks, sharable through spicerack.org to build upon community work and get started quickly

Spice.ai is written in Golang and Python and runs as a container or microservice. It's deployable to any public cloud, on-premises, and edge.

📢 Read the Spice.ai announcement blog post at [blog.spiceai.org](https://blog.spiceai.org).

📺 View a 60 second demo of Spice.ai in action [here](https://www.youtube.com/watch?v=FPPGyPq41kQ).

### Community-driven data components

The Spice.ai runtime also includes a library of [community-driven data components](https://github.com/spiceai/data-components-contrib) for streaming and processing time series data, enabling developers to quickly and easily combine data with learning to create intelligent models.

### Spice.ai pod registry

Modern developers also build with the community by leveraging registries such as npm, NuGet, and pip. The registry for sharing and using Spice.ai packages is [spicerack.org](https://spicerack.org). As the community shares more and more AI building blocks, developers can quickly build intelligence into their applications, initially with definitions of AI projects and eventually by sharing and reusing fully-trained models.

{{% alert color="primary" %}}
⚠️ Spice.ai is under active alpha stage development and is not intended to be used in production until its 1.0-stable release.
{{% /alert %}}

Spice.ai and spicerack.org are both pre-release, early, alpha software. Spice.ai v0.1-alpha has many gaps, including limited deep learning algorithms and training scale, streaming data, simulated environments, and offline learning modes. Packages aren't searchable or even listed on spicerack.org yet.

The vision to bring intelligent application development to the maturity of modern web development is a vast undertaking. We haven't figured it all out or solved all the problems yet. We're looking for feedback on the direction. It's not finished, in fact, we only just started in June, and we invite you on the journey.

We greatly appreciate and value your feedback. Please feel free to [file an issue](https://github.com/spiceai/spiceai/issues/new) and get in touch with the team through [Discord](https://discord.gg/kZnTfneP5u) or by sending us mail at [team@spiceai.io](mailto:team@spiceai.io).

Thank you for sharing this journey with us! 🙏

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
