---
date: 2022-01-12
title: 'Adding Soft Actor-Critic'
type: blog
linkTitle: 'Adding Soft Actor-Critic'
authors: [Corentin-pro]
categories: [reinforcement learning, deep learning]
---

Last month in the v0.5-alpha version, a new learning algorithm was added to Spice.ai: Soft Actor-Critic. This is a very popular algorithm in the Reinforcement Learning field. Let's see what it is and why this is an interesting addition.

The previous article [Understanding Q-learning: How a Reward Is All You Need](../2021/q-learning-reward-is-all-you-need.md) is not necessary but can be helpful to understand this article.

<!-- truncate -->

## What is Soft Actor-Critic

### Actor-Critic

Deepmind first introduced the actor-critic approach in deep learning in a [2016 paper](https://arxiv.org/abs/1602.01783). We can think of this approach as having 2 tasks:

- Choosing actions to take: giving probabilities for each possible action (the policy)
- Evaluating values for each action: the estimated reward from those actions (the Q-values)

Those tasks will be made by 2 different neural networks or a single network that branches out in 2 heads. The actor is the part that outputs the policy, while the critic outputs the values.

![Actor-Critic Diagram](https://user-images.githubusercontent.com/19952490/148524970-e5fab55c-7364-4cb9-870c-7f5b8b58cc6f.png")

In most cases, this model was proven to perform very well, better than Deep Q-Learning. The actor is trained to prefer actions associated with the best values from the critic. The critic is trained to correctly estimate rewards (current and future ones) of the actions.

Both will improve over time though we have to keep in mind that the critic is unlikely to evaluate all possible actions in the environment as it will only see actions from states that the actor is likely to take (the policy).

This bias of the system toward its policy is important: the algorithm is meant to train _on-policy_. The duo actor-critic works together: trying to train it with inputs and outputs from another system (humans or even itself in past iterations of its own training) will not work.

Multiple improvements were made to limit the bias of the actor-critic approach but the necessity to train on-policy remains. This is very limiting as being able to train from any experience can be very valuable for time and data efficiency.

### Soft Actor-Critic

Soft Actor-Critic allows an Actor-Critic network to train off-policy. It was introduced in [a paper](https://arxiv.org/abs/1801.01290) in 2018 and included multiple additions to improve its parent algorithm. The main difference is the introduction of the entropy of the actor outputs during the training phase.

The entropy measures the chaos/order of a system (or uncertainty). If a system always acts the same way, the entropy is minimal. Here the actor's entropy is maximum if all possible actions have the same weight (same probability) and minimum if the actor always chose only a single action with 100% confidence.

During the training phase, the actor is trained to maintain the entropy of its outputs at a specific value.

The introduction of the entropy changes the goal of the training not only to find the bests output but to keep exploring the other actions. The critic part will be trained on all actions, even if they may occur only in rare cases.

There are other essential parts, such as having 2 critics and being able to output continuous values, but the entropy is the crucial difference in this algorithm's training and potential.

## Adding choices to Spice.AI learning algorithms

As we saw above, the Actor-Critic algorithm is known to outperform Deep Q-Learning in most cases. If we also want to leverage previous data (off-policy training), Soft Actor-Critic is a natural choice. This approach is heavier despite better theoretical results, making it more suitable for complex tasks. For simpler tasks, Deep Q-Learning will still be an appealing option for its speed of training and its capability to quickly convergence to a good solution.

We can think of Soft Actor-Critic as a complex machine designed to take actions while keeping a variety of possibilities. Sometimes several options seem equally rewarding: a simpler algorithm would take what it evaluates as the best one even though the margin is small and the precision of its evaluation shouldn't be enough. This tendency to quickly convergence to a solution has its benefits and inconveniences.

## Implementation in the source code

Adding new algorithms is essential to Spice.ai, so the procedure was designed to be straightforward.

Looking a the [source code](https://github.com/spiceai/spiceai), the code related to training agents is in the `ai/src` folder. This part of the code uses the python language as most modern AI libraries are distributed in this language.

In this folder, every agent is in the `algorithms` folder, and each has its subfolder. There is an `agent_interface` file that defines the main class that the different agents should inherit from and a `factory` script responsible for creating instances of an agent from a given algorithm name.

Adding a new agent is simple:

- making a new folder in the `algorithms`
- adding a json file describing the `algorithm_id`, `name`, and `docs_link` (see other json as an example) in the folder
- adding a new python file with a class that would inherit from the `SpiceAIAgent` defined in the `agent_interface` script
- adding a line in the `factory` script to instantiate the new implementation when its name is called.

For the new agent, inheriting from the main `SpiceAIAgent` class, 5 functions need to be implemented:

- **add_experience**: storing inputs and outputs (used during the training)
- **act**: returning the action to be taken from a given input
- **save**: saving the agent to a given a path
- **load**: restoring the agent from a given path
- **learn**: train iteration (from the accumulated experiences)

## Conclusion

Soft Actor-Critic is a fascinating algorithm that performs well in complex environments. We now [support Soft Actor Critic](../releases/v0.5-alpha.md) in Spice.ai, which is another step forward in constantly improving the performance of the AI engine. Additionally, we'll continue improving existing algorithms and adding newer ones over time. We designed the platform for ease of implementation and experimentation so if you'd like to try building your own agent, you can get the source code on [Github](https://github.com/spiceai/spiceai) and contribute to the platform. Say hi on [Discord](https://discord.gg/kZnTfneP5u), reach out on [Twitter](https://twitter.com/spice_ai) or [email us](mailto:hey@spice.ai).

I hope you enjoy this post and something new.

Corentin
