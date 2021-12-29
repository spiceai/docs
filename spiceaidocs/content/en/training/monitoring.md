---
type: docs
title: "Monitoring Training"
linkTitle: "Monitoring Training"
weight: 31
---

Training runs may be monitored for progress, performance, and debugging in several ways.

The main mediums of monitoring are:

- Command Line
- Dashboard Monitoring
- Training Loggers

### Command Line

Training run progress is logged to the command line by default.

**_Example output from the Trader Quickstart:_**

```bash
2021/12/23 05:33:19 trader -> Starting training...
2021/12/23 05:33:19 trader -> Training 10 episodes...
2021/12/23 05:33:20 trader -> Episode 1 completed with score of -560.8.
2021/12/23 05:33:20 trader -> Action Counts: hold = 20, large_buy = 27, sell = 57, small_buy = 28.
2021/12/23 05:33:20 trader -> Episode 2 completed with score of -619.8.
2021/12/23 05:33:20 trader -> Action Counts: hold = 8, large_buy = 6, sell = 102, small_buy = 16.
2021/12/23 05:33:21 trader -> Episode 3 completed with score of -80.8.
2021/12/23 05:33:21 trader -> Action Counts: hold = 116, large_buy = 8, sell = 6, small_buy = 2.
2021/12/23 05:33:21 trader -> Episode 4 completed with score of -40.6.
2021/12/23 05:33:21 trader -> Action Counts: hold = 124, large_buy = 2, sell = 2, small_buy = 4.
2021/12/23 05:33:22 trader -> Episode 5 completed with score of -26.1.
2021/12/23 05:33:22 trader -> Action Counts: hold = 127, large_buy = 2, sell = 1, small_buy = 2.
2021/12/23 05:33:22 trader -> Episode 6 completed with score of -15.9.
2021/12/23 05:33:22 trader -> Action Counts: hold = 129, large_buy = 1, sell = 1, small_buy = 1.
2021/12/23 05:33:23 trader -> Episode 7 completed with score of -1.0.
2021/12/23 05:33:23 trader -> Action Counts: hold = 132, large_buy = 0, sell = 0, small_buy = 0.
2021/12/23 05:33:23 trader -> Episode 8 completed with score of -1.0.
2021/12/23 05:33:23 trader -> Action Counts: hold = 132, large_buy = 0, sell = 0, small_buy = 0.
2021/12/23 05:33:24 trader -> Episode 9 completed with score of -10.8.
2021/12/23 05:33:24 trader -> Action Counts: hold = 130, large_buy = 2, sell = 0, small_buy = 0.
2021/12/23 05:33:24 trader -> Episode 10 completed with score of -6.1.
2021/12/23 05:33:24 trader -> Action Counts: hold = 131, large_buy = 0, sell = 1, small_buy = 0.
2021/12/23 05:33:24 trader -> Max training episodes (10) reached!
```

### Dashboard Monitoring

Training run progress can also be visualized in the dashboard [http://localhost:8000](http://localhost:8000) after navigating to the pod view.

<img max-width="800" alt="dashboard-training-run" src="https://user-images.githubusercontent.com/80174/147209435-a56e99d5-cce7-45b3-95d9-2cccff0bdd86.png">

### Training Loggers

Spice.ai supports logging to monitoring tools like [TensorBoard](https://www.tensorflow.org/tensorboard/).

This logging can either be enabled at the pod level using the `training.loggers` Spicepod section or as a parameter to the `spice train` command. Once enabled, the runtime will log training metrics for that tool.

A button to open the tool will appear on the training run in the dashboard. Clicking the button will open the relevant monitoring tool.

**_Example for TensorBoard:_**

<video name="TensorBoard" width="800" height="600" src="https://user-images.githubusercontent.com/80174/146382503-2bb2570b-5111-4de0-9b80-a1dc4a5dcc35.mov" />

See documentation for:

- The Spicepod [training.loggers section]({{<ref "reference/pod#trainingloggers">}}).
- The [spice train]({{<ref "cli/reference/#train">}}) CLI command.
