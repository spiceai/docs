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

To see how to define reward functions using an external file, click [here]({{<ref "concepts/rewards/external">}}).

## Rewards in YAML

To define the reward functions in the YAML directly, put the Python code fragment in the `with` node.

The reward function must assign a value to `reward` for it to be valid.

The following variables are available to be used in the reward function:

| variable   | Type                                                                                  | Description                                                    |
| ---------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| prev_state | [SimpleNamespace](https://docs.python.org/3/library/types.html#types.SimpleNamespace) | The observation state when the action was taken                |
| new_state  | [SimpleNamespace](https://docs.python.org/3/library/types.html#types.SimpleNamespace) | The observation state from directly after the action was taken |

### Example

See the full example manifest [here]({{<ref "reference/pod/samples-gardener">}}).

```yaml
training:
  rewards:
    - reward: close_valve
      # Reward keeping moisture content above 25%
      with: |
        if new_state.sensors_garden_moisture > 0.25:
          reward = 200

        # Penalize low moisture content depending on how far the garden has dried out
        else:
          reward = -100 * (0.25 - new_state.sensors_garden_moisture)

          # Penalize especially heavily if the drying trend is continuing (new_state is drier than prev_state)
          if new_state.sensors_garden_moisture < prev_state.sensors_garden_moisture:
            reward = reward * 2

    - reward: open_valve_half
      # Reward watering when needed, more heavily if the garden is more dried out
      with: |
        if new_state.sensors_garden_moisture < 0.25:
          reward = 100 * (0.25 - new_state.sensors_garden_moisture)

        # Penalize wasting water
        # Penalize overwatering depending on how overwatered the garden is
        else:
          reward = -50 * (new_state.sensors_garden_moisture - 0.25)

    - reward: open_valve_full
      # Reward watering when needed, more heavily if the garden is more dried out
      with: |
        if new_state.sensors_garden_moisture < 0.25:
          reward = 200 * (0.25 - new_state.sensors_garden_moisture)

        # Penalize wasting water more heavily with valve fully open
        # Penalize overwatering depending on how overwatered the garden is
        else:
          reward = -100 * (new_state.sensors_garden_moisture - 0.25)
```
