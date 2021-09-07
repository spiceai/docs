---
type: docs
title: "Create your first Spice.ai pod and train it"
linkTitle: "Train a Spice.ai pod"
weight: 10
---

A [Spice.ai Pod]({{<ref concepts>}}#pod) is simply a collection of configuration and data that is used to train and deploy your own AI.

We will add intelligence to a sample application, **ServerOps**, by creating and training a Spice.ai pod that offers recommendations to the application for different server operations, such as performing server maintenance.

If you are using GitHub Codespaces, skip Step 1. and continue with Step 2., as the repository will already be cloned.

Step 1. Clone the Spice.ai quickstarts repository:

```bash
cd $HOME
git clone https://github.com/spiceai/quickstarts
cd quickstarts/serverops
```

Step 2. Start the Spice runtime with `spice run`:

```bash
cd $HOME/quickstarts/serverops
spice run
```

Step. 3. In a new terminal, add the ServerOps sample pod:

So that we can leave Spice.ai runing, add the sample pod in a new terminal tab or window. If you are running in GitHub Codespaces, you an open a new terminal by clicking the split-terminal button in VS Code.

```bash
spice add samples/serverops
```

The Spice.ai CLI will download the ServerOps sample pod and add the pod manifest to your project at `spicepods/serverops.yaml`.

The Spice runtime will then automatically detect the pod and start your first training run!

> Note, automatic training relies on your system's filewatcher. In some cases, this might be disabled or not work as expected. If training does not start, follow the command to [retrain the pod](#retrain-the-pod) below.

### Observe the pod training

Navigate to [http://localhost:8000](http://localhost:8000) in your favorite browser. You will see an overview of your pods. From here, you can click on the `serverops` pod to see a chart of the pod's training progress.

### Retrain the pod

In addition to automatic training upon manifest changes, training can be started by using the Spice CLI from within your app directory.

```bash
spice train serverops
```

### Get a recommendation

After training the pod, you can now get a recommendation for an action from it!

```bash
curl http://localhost:8000/api/v0.1/pods/serverops/recommendation
```

{{< button text="Next steps >>" page="next-steps" >}}
