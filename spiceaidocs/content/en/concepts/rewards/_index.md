---
type: docs
title: "Rewards"
linkTitle: "Rewards"
weight: 15
description: "Documentation for authoring Spice.ai rewards"
---

The Spice.ai engine learns and provides recommendations to your application using a type of AI called deep reinforcement learning. To learn more, see [Deep Learning AI]({{<ref "deep-learning-ai">}}).

A fundamental concept in deep reinforcement learning is to reward actions a learning agent takes during a training run. These rewards are numerical values and can be negative or positive.

In Spice.ai, developers define the rewards the AI engine uses in training runs through reward function definitions. Reward functions are Python functions (with more languages supported in the future) and can be authored either inline in the Spicepod manifest YAML or a separate Python `.py` file.
