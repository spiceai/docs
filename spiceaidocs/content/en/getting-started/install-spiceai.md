---
type: docs
title: "Install Spice.ai"
linkTitle: "Install Spice.ai"
weight: 5
---

{{% alert title="Current Limitations" color="primary" %}}

- Docker is required.
- Only macOS and Linux are natively supported. [WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install-win10) is required for Windows.
- arm64 is not yet supported (i.e. Apple's M1 Macs). We use M1s ourselves, so we hope to support this very soon :-)
  {{% /alert %}}

⭐️ We recommend using [GitHub Codespaces](https://github.com/features/codespaces) to get started. Codespaces enables you to run Spice.ai in a virtual environment in the cloud. If you use Codespaces, the install is not required and you may skip to the [Getting Started with Codespaces](#getting-started-with-codespaces) section.

### Docker installation

To continue with Docker installation on your local machine, please follow [these instructions](https://docs.docker.com/get-docker/).

### Spice.ai CLI Installation (local machine)

Install the Spice CLI by running the following `curl` command in your terminal.

```bash
curl https://install.spiceai.org | /bin/bash
```

You may need to restart your terminal for the `spice` command to be added to your PATH.

### Getting Started with Codespaces

Create a new GitHub Codespace in the `spiceai/quickstarts` repo at [github.com/spiceai/quickstarts/codespaces](https://github.com/spiceai/quickstarts/codespaces).

<img src="https://user-images.githubusercontent.com/80174/130397022-e882fc26-06fd-49da-ae35-03383221c63d.png" width="300">

Once you open the Codespace, Spice.ai and everything you need to get started will already be installed.

{{< button text="Create your first Spice.ai pod and train it >>" page="train-pod" >}}
