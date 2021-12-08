---
type: docs
title: "Soft Actor-Critic"
linkTitle: "Soft Actor-Critic"
weight: 50
description: Spice.ai implementation of the Soft Actor-Critic algorithm (SAC)
---

The SAC (Soft Actor-Critic) algorithm was developed in 2018. It is a off-policy, model-free reinforcement learning algorithm that aims not only at maximizing the reward but also the entropy (acting as randomly as possible). The entropy maximization helps exploring possibilities and trying actions that seems to be equally rewarding.

The Spice.ai implementation of Soft Actor-Critic has been modified to work for discrete action sets.

Berkeley AI Research blog: https://bair.berkeley.edu/blog/2018/12/14/sac/
Arxiv paper: https://arxiv.org/abs/1801.01290
