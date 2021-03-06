---
type: docs
title: "Vanilla Policy Gradient"
linkTitle: "Vanilla Policy Gradient"
weight: 40
description: Spice.ai implementation of the Vanilla Policy Gradient algorithm (VPG)
---

The key idea underlying policy gradients is to push up the probabilities of
actions that lead to higher return, and push down the probabilities of actions
that lead to lower return, until you arrive at the optimal policy.

## Exploration vs. Exploitation

VPG trains a stochastic policy in an on-policy way. This means that it explores
by sampling actions according to the latest version of its stochastic policy.
The amount of randomness in action selection depends on both initial conditions
and the training procedure. Over the course of training, the policy typically
becomes progressively less random, as the update rule encourages it to exploit
rewards that it has already found. This may cause the policy to get trapped in local optima.

Learn more about the Vanilla Policy Gradient algorithm at https://spinningup.openai.com/en/latest/algorithms/vpg.html
