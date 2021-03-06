---
type: docs
title: "Reward Function Files"
linkTitle: "Reward Function Files"
weight: 15
---

Reward functions may be defined in a single Python (.py) file.

This file may be authored in standard Python3.8+ code and the file may define global functions and import packages.

The packages that can be imported are limited to what is [imported by the AI Engine](https://github.com/spiceai/spiceai/blob/trunk/ai/src/requirements/common.txt).

## Action Reward

For each action defined in the Spicepod manifest, a corresponding function (i.e. action reward) should be defined in the Python file. The mapping of action to function name is specified in the manifest using the `with` node.

Each reward function should match the following function signature, with the function name matching that defined in the Spicepod manifest.

```python
def reward_for_action(current_state: dict, current_state_interpretations: list, next_state: dict, next_state_interpretations: list) -> float:
    """
    Returns a reward given the action and observation space

    Args:
        action_name: The name of the action to generate a reward for
        current_state: Value of the observation state when the action was recommended
        current_state_interpretations: Array of interpretations for current_state
        next_state: Value of the observation state that immediately follows current_state
        next_state_interpretations: Array of interpretations for next_state

            Note: As interactive environments are not fully supported, it may not make sense to use
                    next_state when calculating the reward

    Returns:
        (float): The reward that the agent should receive for taking this action.
    """
```

Learn more about interpretations [here]({{<ref "concepts/interpretations">}}).

### Example

For the following manifest:

```yaml
training:
  reward_funcs: my_reward.py
  rewards:
    - reward: buy
      with: buy_reward
    - reward: sell
      with: sell_reward
    - reward: hold
      with: hold_reward
```

Author a Python file with the following content to define the reward functions:

`my_reward.py`

```python
def buy_reward(current_state: dict, current_state_interps, next_state: dict, next_state_interps) -> float:
    return complex_calculation(current_state)

def sell_reward(current_state: dict, current_state_interps, next_state: dict, next_state_interps) -> float:
    return current_state["price"] - next_state["price"]

def hold_reward(current_state: dict, current_state_interps, next_state: dict, next_state_interps) -> float:
    return 1
```
