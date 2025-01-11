---
date: 2021-11-18
title: "Spice.ai's approach to Time-Series AI"
type: blog
linkTitle: "Spice.ai's approach to Time-Series AI"
authors: [Corentin-pro]
categories: [time-series ai, reinforcement learning]
---

The Spice.ai project strives to help developers build applications that leverage new AI advances which can be easily trained, deployed, and integrated. [A previous blog post](/posts/2021/11/15/teaching-apps-how-to-learn-with-spicepods/) introduced Spicepods: a declarative way to create AI applications with Spice.ai technology. While there are many libraries and platforms in the space, Spice.ai is focused on time-series data aligning to application-centric and frequently time-dependent data, and a [Reinforcement Learning](https://en.wikipedia.org/wiki/Reinforcement_learning) approach, which can be more developer-friendly than expensive, labeled [supervised learning](https://en.wikipedia.org/wiki/Supervised_learning).

This post will discuss some of the challenges and directions for the technology we are developing.

### Time Series

![Time Series processing visualization: a time window is usually chosen to process part of the data stream](https://user-images.githubusercontent.com/19952490/142404970-de910848-cdb4-451b-a0d5-302c90215216.png)
*Figure 1. Time Series processing visualization: a time window is usually chosen to process part of the data stream*

Time series AI has become more popular over recent years, and there is extensive literature on the subject, including time-series-focused neural networks. Research in this space points to the likelihood that there is no silver bullet, and a single approach to time series AI will not be sufficient. However, for developers, this can make building a product complex, as it comes with the challenge of exploring and evaluating many algorithms and approaches.

A fundamental challenge of time series is the data itself. The shape and length are usually variable and can even be infinite (real-time streams of data). The volume of data required is often too much for simple and efficient machine learning algorithms such as [Decision Trees](https://en.wikipedia.org/wiki/Decision_tree). This challenge makes Deep Learning popular to process such data. There are several types of neural networks that have been shown to work well with time series so let's review some of the common classes:

- [Convolutional Neural Networks (CNN)](https://en.wikipedia.org/wiki/Convolutional_neural_network): CNN's can only accept data with fixed lengths: even with the ability to pad the data, this is a major drawback for time-series data as a specific time window needs to be decided. Despite this limitation, they are the most efficient network to train (computation, data needed, time) and usually the smallest storage. CNN's are very robust and used in image/video processing, making them a very good baseline to start with while also benefiting from refined and mature development over the years, such as with the very efficient MobileNet with depth-wise convolutions.
- [Recurrent Neural Networks (RNN)](https://en.wikipedia.org/wiki/Recurrent_neural_network): RNNs have been researched for several decades, and while they aren't as fast to train as CNNs, they can be faster to apply as there is no need to feed a time window like CNNs if the desired input/output is in real-time (in a continuous fashion, also called 'online). RNNs are proven to be very good in some situations, and many new models are being discovered.
- [Transformers](<https://en.wikipedia.org/wiki/Transformer_(machine_learning_model)>): Most of the state-of-the-art results today have been made from transformers and their variations. They are very good at correlating sparse information. Popularized in the famous paper [Attention is all you need](https://arxiv.org/pdf/1706.03762.pdf), transformers are proven to be flexible with high-performance in many classes (Vision Transformers, Perceiver, etc.). They suffer the same limitation as CNNs for the length of their input (fixed at training time), but they also have a disadvantage of not scaling well with the size of the data (quadratic growth with the length of the time series). They are also the most expensive network to train in general.

While not a complete representation of classes of neural networks, this list represents the areas of the most potential for Spice.ai's time-series AI technology. We also see other interesting paradigms to explore when improving the core technology like Memory Augmented Neural Networks (MANN) or neural network-based Genetical Algorithms.

### Reinforcement Learning

Reinforcement Learning (RL) has grown steadily, especially in fields like robotics. Usually, RL doesn't require as much data processing as Supervised Learning, where large datasets can be demanding for hardware and people alike. RL is more dynamic: agents aren't trained to replicate a specific behaviors/output but explore and 'exploit' their environment to maximize a given reward.

Most of today's research is based on environments the agent can interact with during the training process, known as online learning. Usually, efficient training processes have multiple agent/environment pairs training together and sharing their experiences. Having an environment for agents to interact enables different actions from the actual historical state known as **on-policy learning**, and using only past experiences without an environment is **off-policy learning**.

![AI training without interacting with the environment](https://user-images.githubusercontent.com/19952490/142404987-cc6f0654-d2bd-496a-b6a4-52da19b9f912.png)
*Figure 2. AI training without interacting with the environment (real world nor simulation). Only gathered data is used for training.*

Spice.ai is initially taking an off-policy approach, where an environment (either pre-made or given by the user) is not required. Despite limiting the exploration of agents, this aligns to an application-centric approach as:

- Creating a real-world model or environment can be difficult and expensive to create, arguably even impossible.
- Off-policy learning is normally more efficient than on-policy (time/data and computation).

The Spice.ai approach to time series AI can be described as 'Data-Driven' Reinforcement Learning. This domain is very exciting, and we are building upon excellent research that is being published. The [Berkeley Artificial Intelligence Research](https://bair.berkeley.edu/)'s blog shows the potential of this field and many other research entities that have made great discoveries like [DeepMind](https://deepmind.com/), [Open AI](https://openai.com/), [Facebook AI](https://ai.facebook.com/) and [Google AI](https://ai.google/) (among many others). We are inspired and are building upon all the research in Reinforcement Learning to develop core Spice.ai technology.

If you are interested in Reinforcement Learning, we recommend following these blogs, and if you'd like to partner with us on the mission of making it easier to build intelligent applications by leveraging RL, we invite you to discuss with us on [Discord](https://discord.gg/kZnTfneP5u), reach out on [Twitter](https://twitter.com/spice_ai) or [email us](mailto:hey@spice.ai).

Corentin
