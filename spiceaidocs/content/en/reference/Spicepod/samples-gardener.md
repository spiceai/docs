---
type: docs
title: "Gardener"
linkTitle: "Example - Gardener"
weight: 60
---

From: https://github.com/spiceai/samples/blob/trunk/gardener/README.md

```yaml
name: gardener
params:
  epoch_time: 1612557000
  granularity: 10m
  interval: 1h
  period: 720h
dataspaces:
  - from: sensors
    name: garden
    measurements:
      - name: temperature
      - name: moisture
    data:
      connector:
        name: file
        params:
          path: data/garden_data.csv
      processor:
        name: csv

actions:
  - name: close_valve
  - name: open_valve_half
  - name: open_valve_full

training:
  rewards:
    - reward: close_valve
      # Reward keeping moisture content above 25%
      with: |
        if next_state["sensors_garden_moisture"] > 0.25:
          reward = 200

        # Penalize low moisture content depending on how far the garden has dried out
        else:
          reward = -100 * (0.25 - next_state["sensors_garden_moisture"])

          # Penalize especially heavily if the drying trend is continuing (next_state is drier than current_state)
          if next_state["sensors_garden_moisture"] < current_state["sensors_garden_moisture"]:
            reward = reward * 2

    - reward: open_valve_half
      # Reward watering when needed, more heavily if the garden is more dried out
      with: |
        if next_state["sensors_garden_moisture"] < 0.25:
          reward = 100 * (0.25 - next_state["sensors_garden_moisture"])

        # Penalize wasting water
        # Penalize overwatering depending on how overwatered the garden is
        else:
          reward = -50 * (next_state["sensors_garden_moisture"] - 0.25)

    - reward: open_valve_full
      # Reward watering when needed, more heavily if the garden is more dried out
      with: |
        if next_state["sensors_garden_moisture"] < 0.25:
          reward = 200 * (0.25 - next_state["sensors_garden_moisture"])

        # Penalize wasting water more heavily with valve fully open
        # Penalize overwatering depending on how overwatered the garden is
        else:
          reward = -100 * (next_state["sensors_garden_moisture"] - 0.25)
```
