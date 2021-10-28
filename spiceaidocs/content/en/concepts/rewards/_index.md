---
type: docs
title: "Rewards"
linkTitle: "Rewards"
weight: 15
description: "Documentation for Spice.ai rewards"
---

# Reward Interface

The interface that all Spice.ai compatible external reward functions should comform to.

## Action Reward

The name of the function will be specified in the manifest, and there will be one function per action.

```python
def reward_for_action(current_state: Dict, next_state: Dict) -> float:
    """
    Returns an reward given the action and observation space

    Args:
        action_name: The name of the action to generate a reward for
        current_state: Value of the observation state when the action was recommended
        next_state: Value of the observation state that immediately follows current_state

            Note: As interactive environments are not fully supported, it may not make sense to use
                    next_state when calculating the reward

    Returns:
        (int): The reward that the agent should receive for taking this action.
    """
```

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

A python file with these contents would be used for the reward function:

`my_reward.py`

```python
def buy_reward(current_state: dict, next_state: dict) -> float:
    return complex_calculation(current_state)

def sell_reward(current_state: dict, next_state: dict) -> float:
    return current_state["price"] - next_state["price"]

def hold_reward(current_state: dict, next_state: dict) -> float:
    return 1
```
