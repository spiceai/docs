---
type: docs
title: "Interpretations"
linkTitle: "Interpretations"
weight: 15
description: "Reference documentation for Spice.ai Intepretations"
---

- [API Reference]({{<ref "api#interpretations">}})

Interpretations provide a way to define meaning for a time range within a pod period. For example, for a stock trading pod with a period of Monday to Friday, an interpretation of that time range could be, from Tuesday to Wednesday is a good time to buy.

An example interpretation defined in JSON is as follows:

```json
{
    "start": 1605333600,
    "end": 1605333601,
    "name": "e2e-test-interpretation",
    "actions": [
      "small_buy",
    ],
    "tags": [
      "mytag",
    ]
  },
```

The interpretation is defined as a time range from `start` to `end`, with a `name` and a list of `actions` and `tags`.

Interpretations can be used to provide hints to the reward function on how to reward a time step. In the above example, when the training reaches Tuesday, the reward function author might choose to reward buys even higher based on that expert input.

When the action specific reward function is called, if there is an interpretation in that time range, it will be provided to the reward function in `[state].interpretations`. E.g. if an interpretation overlapped with new state then `next_state.interpretations` would contain a list of the overlapping interpretations.

Comparing Spice.ai recommendations to interpretations is also one way of testing Spice.ai recommendations against expected actions for input data.
