---
type: docs
title: "Deep Learning AI"
linkTitle: "Deep Learning AI"
weight: 40
---

Spice.ai uses deep reinforcement learning algorithms to train the neural networks that power the runtime.

Reinforcement learning (RL) is a general framework where agents learn to perform actions in an environment so as to maximize a reward.

The agent and environment continuously interact with each other. At each time step, the agent takes an action on the observation space based on its policy (aka brain), and receives a reward and the next observation from the environment. The goal is to improve the policy so as to maximize the sum of rewards (score).

Spice.ai provides a standard interface that any deep RL algorithm can be implemented with. At launch Spice.ai supports two deep RL algorithms and this list will grow over time.

By default, Spice.ai will use [Vanilla Policy Gradient]({{<ref "deep-learning-ai/vpg">}}). To use a different algorithm, set the environment variable `SPICE_DEEPRL_ALGORITHM` to one of the following values:

| SPICE_DEEPRL_ALGORITHM | Algorithm                                                   |
| ---------------------- | ----------------------------------------------------------- |
| vpg                    | [Vanilla Policy Gradient]({{<ref "deep-learning-ai/vpg">}}) |
| dql                    | [Deep Q-Learning]({{<ref "deep-learning-ai/dql">}})         |

**Example**

```bash
SPICE_DEEPRL_ALGORITHM=dql spice run
```
