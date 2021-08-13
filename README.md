# What is Spice AI?

Powerful and easy-to-use AI for developers.
 
Spice AI is the best developer experience for continuous, time series AI. Bringing the frontend development lifecycle to training and using deep reinforcement learning, Spice AI enables teams to quickly and intelligently solve business problems using their existing skillset… writing code in the language of their choice.

## Getting started with Spice AI <!-- {docsify-ignore} -->

Follow this guide to get started quickly with Spice AI.

It might also be helpful to review the [Core Concepts](concepts/README.md) of Spice AI to familiarize yourself with Spice AI terminology as you proceed.

## Installation

Follow the [installation instructions](install.md) to install Spice AI.

## Create your first Spice AI Pod and train it

A [Spice AI Pod](https://laughing-doodle-19648c61.pages.github.io/#/Concepts?id=pod) is simply a collection of configuration and data that you use to train and deploy your own AI.

The first Spice AI Pod you will create and train is based off an [Open AI gym](https://gym.openai.com/) example called [CartPole-v1](https://gym.openai.com/envs/CartPole-v1/).

Create a directory for the CartPole where you would normally put your code. E.g.

```bash
cd $HOME
mkdir cartpole
cd cartpole
```

In a new terminal window or tab, navigate to the directory and start the Spice runtime in development mode with `spice run`.

```bash
cd $HOME\cartpole
spice run
```

In the original terminal instance, add the CartPole-v1 sample:

```bash
spice pod add samples/CartPole-v1
```

The Spice CLI will download the CartPole-v1 sample pod manifest and add it to your project at `.spice/pods/cartpole-v1.yaml`.

The Spice Runtime will automatically detect the manifest and start your first training run!

## Observe your pod training

Navigate to [http://localhost:8000](http://localhost:8000) in your favorite browser. You will see an overview of your pods. From here, you can click on `cartpole-v1` Pod to see a chart of your training progress.

## Retrain your pod

The runtime will automatically detect changes to your pod manifest and start training. In addition, you can trigger training by using the Spice CLI from within your app directory.

```bash
spice pod train cartpole-v1
```

## Get a recommendation from your pod

After training your pod, you can now get a recommendation for an action from it!

```bash
curl http://localhost:8000/api/v0.1/pods/cartpole-v1/inference
```

## Conclusion and next steps

Congratulations! In just a few minutes you downloaded and installed the Spice AI CLI and runtime, created your first Spice AI Pod, trained it, and got a recommendation from it.

This is just the start of the journey with AI. Next try one of the quickstart tutorials for creating intelligent applications with Spice AI.

**Quickstarts:**

- [Trader](https://github.com/spiceai/quickstarts/tree/trunk/trader) - a basic Bitcoin trading bot
