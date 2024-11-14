---
title: 'Spice.ai OSS Installation'
sidebar_label: 'Installation'
sidebar_position: 0
description: 'Instructions for installing Spice.ai OSS'
pagination_next: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Installation options for Spice.ai OSS

For deployment options, such as to Kubernetes, see [`Deployment`](./deployment/index.md).

<Tabs>
  <TabItem value="default" label="macOS, Linux, and WSL" default>
    ### Install Script

    ```bash
    curl https://install.spiceai.org | /bin/bash
    ```

    ### Homebrew

    ```bash
    brew install spiceai/spiceai/spice
    ```

  </TabItem>
  <TabItem value="windows" label="Windows" default>
    ### PowerShell Install Script

    ```bash
    curl -L "https://install.spiceai.org/Install.ps1" -o Install.ps1 && PowerShell -ExecutionPolicy Bypass -File ./Install.ps1
    ```

  </TabItem>
</Tabs>

## Direct Download

x86_x64 and ARM binaries for linux, Windows, and macOS are available for download from GitHub at [github.com/spiceai/spiceai/releases](https://github.com/spiceai/spiceai/releases).

## Building Spice from Source

### Build prerequisites

<Tabs>
  <TabItem value="default" label="macOS" default>
  1. If you don't already have it installed, install Homebrew:

    ```shell
    # Note: Be sure to follow the steps in the Homebrew installation output to add Homebrew to your PATH.
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```

  2. Install the Xcode Command Line tools
    ```shell
      xcode-select --install
    ```

  3. Install dependencies
    ```shell
    brew install rust
    brew install go
    brew install cmake
    brew install protobuf
    ```
  </TabItem>
  <TabItem value="linux" label="Linux (Ubuntu)">
  1. Install system dependencies
    ```shell
    sudo apt update
    sudo apt install build-essential curl openssl libssl-dev pkg-config protobuf-compiler cmake
    ```

  2. Install Go
    ```shell
    export GO_VERSION="1.22.4"
    rm -rf /tmp/spice
    mkdir -p /tmp/spice
    cd /tmp/spice
    wget https://go.dev/dl/go$GO_VERSION.linux-amd64.tar.gz
    tar xvfz go$GO_VERSION.linux-amd64.tar.gz
    sudo mv ./go /usr/local/go
    echo 'export PATH=$PATH:/usr/local/go/bin' >> $HOME/.profile
    source $HOME/.profile
    cd $HOME
    rm -rf /tmp/spice
    ```

  3. Install Rust
    ```shell
      curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y # install unattended
      source $HOME/.cargo/env
    ```
  </TabItem>
</Tabs>

### Build Spice OSS

```shell
# Clone SpiceAI OSS Repo
git clone https://github.com/spiceai/spiceai.git
cd spiceai

# Build and install OSS project in release mode
make install

# Build and install OSS project in dev mode
make install-dev

# Build and install OSS project with models
make install-with-models

# Also you can specify specific features
SPICED_CUSTOM_FEATURES="postgres sqlite" make install

# Run the following to temporarily add spice to your PATH.
# Add it to the end of your .bashrc or .zshrc to permanently add spice to your PATH.
export PATH="$PATH:$HOME/.spice/bin"
```

### Build with Hardware Acceleration
Spice OSS supports running both local language models and embedding models on dedicated hardware. This is for models from either Huggingface or models located locally.

Currently, neither CUDA nor metal have dedicated Dockerfiles or release binaries.

#### CUDA Support

**Steps**:
1. GPUs with Cuda compute capabilities < 7.5 are not supported (V100, Titan V, GTX 1000 series, ...).
1. Ensure both Cuda and associated Nvidia drivers are installed. Requires CUDA version 12.2 or higher
1. Ensure Nvidia binaries are in your path:
```shell
export PATH=$PATH:/usr/local/cuda/bin
```
1. Build Spice OSS with CUDA support:
```shell
make install-with-models-cuda
```

This ensures CUDA devices are selected on model load, and CUDA-specifiy kernels used when possible.

#### Metal Support

**Steps**:
1. Ensure you have Xcode installed.
```shell
xcode-select --install
```

1. Build Spice OSS with Metal support:
```shell
make install-with-models-metal
```

Similarily, this ensures Metal devices are selected on model load, and Metal-specific kernels used when possible.
