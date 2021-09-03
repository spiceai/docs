---
type: docs
title: "Create your first Spice.ai pod and train it"
linkTitle: "Train Spice.ai pod"
weight: 10
---

A [Spice.ai Pod]({{<ref concepts>}}#pod--pod-manifest) is simply a collection of configuration and data that you use to train and deploy your own AI.

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

The Spice CLI will download the LogPruner sample pod manifest and add it to your project at `spicepods/logpruner.yaml`.

The Spice runtime will then automatically detect the manifest and start your first training run!

> Note, automatic training relies on your system's filewatcher. In some cases, this might be disabled or not work as expected, especially when using containers. If training does not start, follow the command to [retrain your pod](#retrain-your-pod) below.

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

{{< button text="Next steps >>" page="next-steps" >}}
