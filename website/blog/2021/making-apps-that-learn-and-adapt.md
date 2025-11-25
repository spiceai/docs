---
date: 2021-11-05
title: 'Making Apps That Learn And Adapt'
type: blog
linkTitle: 'Making Apps That Learn And Adapt'
authors: [lukekim]
categories: [applications, learn-and-adapt]
---

In the [Spice.ai announcement blog post](https://blog.spiceai.org/posts/2021/09/07/introducing-spice.ai-open-source-time-series-ai-for-developers/), we shared some of the inspiration for the project stemming from challenges in applying and integrating AI/ML into a neurofeedback application. Building upon those ideas, in this post, we explore the shift in approach from a focus of data science and machine learning (ML) to apps that learn and adapt.

As a developer, I've followed the AI/ML space with keen interest and been impressed with the advances and announcements that only seem to be increasing. [stateof.ai](https://stateof.ai) recently published its 2021 report, and once again, it's been another great year of progress. At the same time, it's still more challenging than ever for mainstream developers to integrate AI/ML into their applications. For most developers, where AI/ML is not their full-time job, and without the support of a dedicated ML team, creating and developing an intelligent application that learns and adapts is still too hard.

Most solutions on the market, even those that claim they are for developers, focus on helping make ML easier instead of making it easier to build applications. These solutions have been great for advancing ML itself but have not helped developers leverage ML in their apps to make them intelligent. Even when a developer successfully integrates ML into an application, it might make that application smart, but often does not help the app continue to learn and adapt over time.

Traditionally, the industry has viewed AI/ML as separate from the application. A pipeline, service, or team is provided with data, which trains on that data, and can then provide answers or insights. These solutions are often created with a waterfall-like approach, gathering and defining requirements, designing, implementing, testing, and deploying. Sometimes this process can take months or even years.

With Spice.ai, we propose a new approach to building applications. By bringing AI/ML alongside your compute and data and incorporating it as part of your application, the app can incrementally adopt recommendations from the AI engine and in addition the AI engine can learn from the application's data and actions. This approach shifts from waterfall-like to agile-like, where the AI engine ingests streams of application and external data, along with the results of the application's actions, to continuously learn. This virtuous feedback cycle from the app to the AI engine and back again enables the app to get smarter and adapt over time. In this approach, building your application _is_ developing the ML.

Being part of the application is not just conceptual. Development teams deploy the Spice.ai runtime and AI engine with the application as a sidecar or microservice, enabling the app services and runtime to work together and for data to be kept application local. A developer teaches the AI engine how to learn by defining application goals and rewards for actions the application takes. The AI Engine observes the application and the consequences of its actions, which feeds into its experience. As the AI engine learns, the application can adapt.

![Diagram](https://user-images.githubusercontent.com/80174/140449760-97974f3c-8a78-4ea2-9ec5-843dc3cff5b6.png)

As developers shift from thinking about disparate applications and ML to building applications where AI that learns and adapts is integrated as a core part of the application logic, a new class of intelligent applications will emerge. And as technical talent becomes even more scarce, applications built this way will be necessary, not just to be competitive but to be even built at all.

In the next post, I'll discuss the concept of Spicepods, bundles of configuration that describes how the application should learn, and how the Spice.ai runtime hosts and uses them to help developers make applications that learn.

### Learn more and contribute

Building intelligent apps that leverage AI is still way too hard, even for advanced developers. Our mission is to make this as easy as creating a modern web page. If the vision resonates with you, join us!

Our [Spice.ai Roadmap](https://github.com/spiceai/spiceai/blob/trunk/docs/ROADMAP.md) is public, and now that we have launched, the project and work are open for collaboration.

If you are interested in partnering, we'd love to talk. Try out [Spice.ai](https://spiceai.org), [email us](mailto:hey@spice.ai) "hey," get in touch on [Slack](https://spiceai.org/slack), or reach out on [Twitter](https://twitter.com/spice_ai).

We are just getting started! 🚀

Luke
