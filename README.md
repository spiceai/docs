# What is Spice.ai?

Powerful and easy-to-use AI for developers.

Spice.ai is the best developer experience for continuous, time series AI. Bringing the frontend development lifecycle to training and using deep reinforcement learning, Spice.ai enables teams to quickly and intelligently solve business problems using their existing skillset… writing code in the language of their choice.

## Getting started with Spice.ai <!-- {docsify-ignore} -->

Follow this guide to get started quickly with Spice.ai.

It might also be helpful to review the [Core Concepts](concepts/README.md) of Spice.ai to familiarize yourself with Spice.ai terminology as you proceed.

### Current Limitations

- Running in Docker is required. We will support a baremetal experience at launch.
- Only macOS and Linux are natively supported. [WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install-win10) is required for Windows.
- arm64 is not yet supported (i.e. Apple's M1 Macs). We use M1s ourselves, so we hope to support this very soon :-)

## Installation

Follow the [installation instructions](install.md) to install Spice.ai.

### Create your first Spice.ai Pod and train it

A [Spice.ai Pod](https://crispy-dollop-c329115a.pages.github.io/#/concepts/README?id=pod-pod-manifest) is simply a collection of configuration and data that you use to train and deploy your own AI.

The first Spice.ai Pod you will create and train is based off of a problem that many system administrators are familiar with: **server maintenance**. Application and system logging is critical part of running a production service, but letting those logs build up can cause other issues, especially if those logs end up filling the entire disk! It is simple enough to run a utility at a certain time every day to ensure this doesn't happen, but what if we choose to run the cleanup in the middle of peak traffic to the server?

We will use Spice.ai to train a pod that can intelligently learn when the best times are to run a cleanup job on a server. Let's call this example the `LogPruner`.

Clone the Spice.ai quickstarts repo in a directory where you would normally put your code. E.g.

```bash
cd $HOME
git clone https://github.com/spiceai/quickstarts
cd quickstarts/logpruner
```

In a new terminal window or tab, navigate to the directory and start the Spice runtime in development mode with `spice run`.

```bash
cd $HOME/quickstarts/logpruner
spice run
```

In the original terminal instance, add the LogPruner sample pod:

```bash
spice add samples/LogPruner
```

The Spice CLI will download the LogPruner sample pod manifest and add it to your project at `.spice/pods/logpruner.yaml`.

The Spice runtime will then automatically detect the manifest and start your first training run!

> Note, automatic training relies on your system's filewatcher. In some cases, this might be disabled or not work as expected, especially when using containers. If training does not start, follow the command to [retrain your pod](https://github.com/spiceai/spiceai#retrain-your-pod) below.

### Observe your pod training

Navigate to [http://localhost:8000](http://localhost:8000) in your favorite browser. You will see an overview of your pods. From here, you can click on the `logpruner` pod to see a chart of the pod's training progress.

### Retrain your pod

The runtime will automatically detect changes to your pod manifest and start training. In addition, you can trigger training by using the Spice CLI from within your app directory.

```bash
spice train logpruner
```

### Get a recommendation from your pod

After training your pod, you can now get a recommendation for an action from it!

```bash
curl http://localhost:8000/api/v0.1/pods/logpruner/recommendation
```

### Conclusion and next steps

Congratulations! In just a few minutes you downloaded and installed the Spice.ai CLI and runtime, created your first Spice.ai Pod, trained it, and got a recommendation from it.

This is just the start of your journey with AI. Next, try one of the quickstart tutorials or in-depth samples for creating intelligent applications with Spice.ai.

**Try:**

- [Log Pruner sample](https://github.com/spiceai/samples/tree/trunk/logpruner) - a more in-depth version of the quickstart you just completed, using CPU metrics from your own machine
- [Trader](https://github.com/spiceai/quickstarts/tree/trunk/trader) - a basic Bitcoin trading bot

**Kubernetes:**

Spice.ai can be deployed to Kubernetes! Try out the [Kubernetes sample](https://github.com/spiceai/samples/tree/trunk/kubernetes).

## Community

Spice.ai started with the vision to make AI easy for developers. We are building Spice.ai in the open and with the community. Reach out on Discord or by email to get involved. We will be starting a community call series soon!

- Discord: [![Discord Banner](https://discord.com/api/guilds/803820740868571196/widget.png?style=shield)](https://discord.com/channels/803820740868571196/803820740868571199)
- Reddit: [![Subreddit subscribers](https://img.shields.io/reddit/subreddit-subscribers/spiceai?style=social)](https://www.reddit.com/r/spiceai/)
- Twitter: [@SpiceAIHQ](https://twitter.com/spiceaihq)
- Email: [team@spiceai.io](mailto:team@spiceai.io)
