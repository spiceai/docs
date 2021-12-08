---
type: docs
title: "Deep Learning AI"
linkTitle: "Deep Learning AI"
weight: 40
---

The Spice.ai engine learns and provides recommendations to your application using a type of AI called deep reinforcement learning.

Reinforcement learning (RL) is a general framework where agents learn to perform actions in an environment so as to maximize a reward according to a policy. In deep reinforcement learning, the policy is trained by a neural network based on a deep learning algorithm.

The agent and environment continuously interact with each other. At each time step, the agent takes an action on the observation space based on its policy (aka brain), and receives a reward and the next observation from the environment. The goal is to improve the policy so as to maximize the sum of rewards (score).

Spice.ai provides a standard interface that a deep learning algorithm can be implemented with. At launch Spice.ai supports two deep learning algorithms and more will be added over time.

By default, Spice.ai will use [Deep Q-Learning]({{<ref "deep-learning-ai/dql">}}). To use a different algorithm, call `spice train` with the parameter `--learning-algorithm` set to one of the following values:

| --learning-algorithm | Algorithm                                                   |
| -------------------- | ----------------------------------------------------------- |
| dql                  | [Deep Q-Learning]({{<ref "deep-learning-ai/dql">}})         |
| sac                  | [Soft Actor Critic]({{<ref "deep-learning-ai/sac">}}) |
| vpg                  | [Vanilla Policy Gradient]({{<ref "deep-learning-ai/vpg">}}) |

**Example**

```bash
spice train --learning-algorithm vpg
```
