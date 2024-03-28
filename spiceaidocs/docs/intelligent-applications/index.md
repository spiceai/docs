---
title: 'Intelligent Applications'
sidebar_label: 'Intelligent Applications'
sidebar_position: 10
description: 'Building intelligent data and AI-driven applications with Spice.ai'
pagination_prev: null
pagination_next: null
---

As described in the blog post [Making Apps That Learn and Adapt](https://blog.spiceai.org/posts/2021/11/05/making-apps-that-learn-and-adapt/) the long-term vision for Spice.ai is to enable developers to easily build, deploy, and operate intelligent data and AI-driven applications.

With Spice.ai OSS, federated data and ML models are colocated with applications, creating lightweight, high-performance, AI-copilot sidecars.

<img width="600" src="https://user-images.githubusercontent.com/80174/140449760-97974f3c-8a78-4ea2-9ec5-843dc3cff5b6.png" alt="A Spice.ai Intelligent Application" />

## The Intelligent Application Workflow

Dataset definitions and ML Models are packaged as Spicepods and can be published and distributed through the [Spicerack.org](https://spicerack.org) Spicepod registry. Federated datasets are locally materialized, accelerated, and provided to colocated Models. Applications call high-performance, low-latency ML inference APIs for AI generation, insights, recommendations, and forecasts ultimately to make intelligent, AI-driven decisions. Contextual application and environmental data is ingested and replicated back to cloud-scale compute clusters where improved versions of Models are trained and fined-tuned. New versioned Models are automatically deployed to the runtime and are A/B tested and flighted by the application in realtime.

<img width="900" alt="OGP" src="https://github.com/spiceai/docs/assets/80174/22b02c5e-5fcb-4856-b79d-911ac5d084c6" />
