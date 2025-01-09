---
date: 2021-11-15
title: 'Teaching Apps how to Learn with Spicepods'
type: blog
linkTitle: 'Teaching Apps how to Learn with Spicepods'
authors: [lukekim]
categories: [applications, learn-and-adapt]
---

The last post in this series, [Making Apps that Learn and Adapt](https://blog.spiceai.org/posts/2021/11/05/making-apps-that-learn-and-adapt/), described the shift from building AI/ML solutions to building apps that learn and adapt. But, how does the app learn? And as a developer, how do I teach it what it should learn?

With [Spice.ai](https://spiceai.org), we teach the app how to learn using a Spicepod.

Imagine you own a restaurant. You created a menu, hired staff, constructed the kitchen and dining room, and got off to a great start when it first opened. However, over the years, your customers' tastes changed, you've had to make compromises on ingredients, and there's a hot new place down the street... business is stagnating, and you know that you need to make some changes to stay competitive.

You have a few options. First, you could gather all the data, such as customer surveyss, seasonal produce metrics, and staff performance profiles. You may even hire outside consultants. You then take this data to your office, and after spending some time organizing, filtering, and collating it, you've discovered an insight! Your seafood dishes sell poorly and cost the most... you are losing money! You spend several weeks or months perfecting a new menu, which you roll out with much fanfare! And then… business is still poor. What!? How could this be? It was a data-driven approach! You start the process again. While this approach is a worthy option, it has long latency from data to learning to implementation.

Another option is to build real-time learning and adaption directly into the restaurant. Imagine a staff member whose sole job was learning and adapting how the restaurant should operate; lets name them Blue. You write a guide for Blue that defines certain goal metrics, like customer food ratings, staff happiness, and of course, profit. Blue tracks each dish served, from start to finish, from who prepared it to its temperature, its costs, and its final customer taste rating. Blue not only learns from each customer review as each dish is consumed but also how dish preparation affects other goal metrics, like profitability. The restaurant staff consults Blue to determine any adjustments to improve goal metrics as they work. The latency from data to learning, to adaption, has been reduced, from weeks or months to minutes. This option, of course, is not feasible for most restaurants, but software applications can use this approach. Blue and his instructions are analogous to the Spice.ai runtime and manifest.

In the Spice.ai model, developers teach the app how to learn by describing goals and rewarding its actions, much like how a parent might teach a child. As these rewards are applied in training, the app learns what actions maximize its rewards towards the defined goals.

Returning to the restaurant example, you can think of the Spice.ai runtime as Blue, and Spicepod manifests as the guide on how Blue should learn. Individual staff members would consult with Blue for ongoing recommendations on decisions to make and how to act. These goals and rewards are defined in **Spicepods** or "pods" for short. Spicepods are packages of configuration that describe the application's goals and how it should learn from data. Although it's not a direct analogy, Spicepods and their manifests can be conceptualized similar to Docker containers and Dockerfiles. In contrast, Dockerfiles define the packaging of your app, Spicepods specify the packaging of your app's learning and data.

**Anatomy of a Spicepod**

A Spicepod consists of:

- A required YAML manifest that describes how the pod should learn from data
- Optional seed data
- Learned model/state
- Performance telemetry and metrics

Developers author Spicepods using the `spice` CLI command such as with `spice pod init <name>` or simply by creating a manifest file such as `mypod.yaml` in the `spicepods` directory of their application.

Here's an example of the [Tweet Recommendation Quickstart](https://github.com/spiceai/quickstarts/tree/trunk/tweet-recommendation/README.md) Spicepod manifest.

![tweet-recommendation-manifest](https://user-images.githubusercontent.com/80174/141739579-9cf7b971-7637-43bc-b661-89115e3b1b59.png")

_A screenshot of the Spicepod manifest for the Tweet Recommendation Quickstart_

You can see the data definitions under `dataspaces`, the actions the application may take under `actions`, and their rewards when training.

In the next post, I'll walk through in detail each section of the pod manifest. In the meantime, you can review the documentation for a complete reference of the [Spicepod manifest syntax](https://docs.spiceai.org/reference/pod/).

**Spicepods as packages**

On disk, Spicepods are generally layouts of a manifest file, seed data, and trained models, but they can also be exported as zipped packages.

![spicepod-layout](https://user-images.githubusercontent.com/80174/141739662-7be361fe-aa79-4408-bb3d-311fd0f849eb.png")

_A screenshot of the Spicepod layout for the trader quickstart application_

When the runtime exports a Spicepod using the `spice export` command, it is saved with a `.spicepod` extension. It can then be shared, archived, or imported into another instance of the Spice.ai runtime.

Soon, we also expect to enable publishing of `.spicepods` to spicerack.org, from where community-created Spicepods can easily be added to your application using `spice add <pod name>` (currently, only Spice AI published pods are available on spicerack.org).

Treating Spicepods as packages and enabling their sharing and distribution through spicerack.org will help developers share their "restaurant guides" and build upon each other's work, much like they do with npmjs.org or pypi.org. In this way, developers can together build better and more intelligent applications.

In the next post, we'll dive deeper into authoring a Spicepod manifest to create an intelligent application. Follow [@spice_ai](https://twitter.com/spice_ai) on Twitter to get an update when we post.

If you haven't already, read the next the first post in the series, [Making Apps that Learn and Adapt](https://blog.spiceai.org/posts/2021/11/05/making-apps-that-learn-and-adapt/).

### Learn more and contribute

Building intelligent apps that leverage AI is still way too hard, even for advanced developers. Our mission is to make this as easy as creating a modern web page. If the vision resonates with you, join us!

Our [Spice.ai Roadmap](https://github.com/spiceai/spiceai/blob/trunk/docs/ROADMAP.md) is public, and now that we have launched, the project and work are open for collaboration.

If you are interested in partnering, we'd love to talk. Try out [Spice.ai](https://spiceai.org), [email us](mailto:hey@spice.ai) "hey," get in touch on [Discord](https://discord.gg/kZnTfneP5u), or reach out on [Twitter](https://twitter.com/spice_ai).

We are just getting started! 🚀

Luke
