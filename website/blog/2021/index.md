---
date: 2021-09-07
title: 'Introducing Spice.ai - open source, time series AI for developers'
type: blog
linkTitle: 'Introducing Spice.ai - open source, time series AI for developers'
notoc: true
authors: [lukekim]
---

AI has recently seen some impressive advances, like with OpenAI [Codex](https://openai.com/blog/openai-codex/) and DeepMind [AlphaFold 2](https://deepmind.com/blog/article/alphafold-a-solution-to-a-50-year-old-grand-challenge-in-biology). And at the same time, for most developers, leveraging AI to create intelligent applications is still way too hard. The [Data Science Hierarchy of Needs](https://hackernoon.com/the-ai-hierarchy-of-needs-18f111fcc007) pyramid from 2017 _still_ illustrates it well; there are too many unmet needs in applying ML in applications.

We faced the same AI development challenges many developers do, even though we had years of engineering experience at Microsoft and GitHub, there was too much to learn and build. And we simply didn't have the time, resources, or tools to learn and utilize AI effectively in the project. After experiencing this pain ourselves, we saw an opportunity to make it better for everyone.

Today, we are making [Spice.ai](https://spiceai.org/) available on GitHub, a new open source project that helps developers use deep learning to create intelligent applications. We're looking for feedback on the direction. It's not finished, in fact, we only started this summer, and we invite you to try out the alpha.

<div style="display: flex; justify-content: center;">
<img style="max-width: 600px;" width="100%" src="https://res.craft.do/user/full/f6ea57b9-4723-ca7b-aa16-e2a916601d59/doc/E951CFE6-D24A-4C02-A796-FFFCFC5FD5A9/A1AAFFBD-0AE9-47B5-AC9C-D37A6932CE5B_2/screen.png" />

</div>

<p style="text-align: center;">
<i>Figure 1. Adding a Spice.ai pod, training and getting a recommendation in three commands</i>
</p>

Like many developer stories, it all started with a side-project. We were interested in [neurofeedback](https://en.wikipedia.org/wiki/Neurofeedback), a type of biofeedback therapy that reinforces healthy brain function but can cost up to $15,000. We wanted to make it accessible to more people, so we set out to build a system that leverages AI to deliver neurofeedback more cost-effectively. Using AI for the application was much more challenging than expected, and this sparked the inspiration for Spice.ai.

In the neurofeedback project, we worked with brain activity [EEG](https://en.wikipedia.org/wiki/Electroencephalographyhttps://en.wikipedia.org/wiki/Electroencephalography) data - time series data. We realized that time series data applies to many domains, from health and biometrics to finance, sales, logistics, security, IoT, and application monitoring. The amount of time series data in these fields is growing exponentially, and extracting insights from this data to make more intelligent software will determine the success of the next generation of applications.

We also realized that handling time series data is often sensitive, such as with health, financial, and security data. Instead of sending all data into a 3rd-party AI service, we needed the choice to bring the AI runtime to wherever our data and compute lived, either in the cloud, on-premises or on edge devices.

### Spice.ai - a modern development experience and open source runtime for deep learning on time series data

Spice.ai is an open source, portable runtime for training and using deep learning on time series data. It's written in Golang and Python and runs as a container or microservice with applications calling a simple HTTP API. It's deployable to any public cloud, on-premises, and edge.

The vision for Spice.ai is to make creating intelligent applications as easy as possible for developers in their development environment of choice. Spice.ai brings AI development to their editor in any language or framework with a fast, iterative, inner development loop, continuous-integration (CI), and continuous-deployment (CD) workflows.

The Spice.ai runtime also includes a library of [community-driven components](https://github.com/spiceai/data-components-contrib) for streaming and processing time series data, enabling developers to quickly and easily combine data with learning to create intelligent models.

Developers can write easy-to-understand and re-useable, "pods," with manifests that connect these data components with a simple definition of the learning environment. These pods also serve as a package for the resulting trained model.

Modern developers build together with the community by leveraging registries such as npm, NuGet, and pip. The registry for sharing and using pods is [spicerack.org](https://spicerack.org). As the community shares more and more pods, developers can quickly build upon each others' work, initially by sharing manifests and eventually by reusing fully-trained models.

### Applying Spice.ai to real-world problems

We are currently piloting Spice.ai with several companies to create the next generation of modern applications, such as optimizing in-store pickups for a large online retailer or scheduling optimizations for healthcare workers and resources. We've already seen some cool use cases, including suspicious login detection, intelligent cloud-spend analysis, and order routing for a food delivery app.

### Learn more and contribute

Building intelligent apps that leverage AI is still way too hard, even for advanced developers. Our mission is to make this as easy as creating a modern web page.

This mission is a huge undertaking and Spice.ai v0.1-alpha has many gaps, including limited deep learning algorithms and training scale, streaming data, simulated environments, and offline learning modes. Pods aren't searchable or even listed on [spicerack.org](http://spicerack.org) yet. But if the vision resonates with you, join us! Our [Spice.ai Roadmap](https://github.com/spiceai/spiceai/blob/trunk/docs/ROADMAP.md) is public, and now that we have launched, the project and work are open for collaboration.

If you are interested in partnering, we'd love to talk. Try out [Spice.ai](https://spiceai.org), [email us](mailto:hey@spice.ai) "hey," get in touch on [Discord](https://discord.com/channels/803820740868571196/803820740868571199), or reach out on [Twitter](https://twitter.com/0xlukekim).

We are just getting started! 🚀

[Luke](https://twitter.com/0xlukekim), [Phillip](https://twitter.com/leblancphill), and [Lane](https://twitter.com/lanesharris) - Spice.ai project founders
