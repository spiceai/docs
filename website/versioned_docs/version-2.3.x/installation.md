---
title: 'Install Spice.ai OSS'
sidebar_label: 'Installation'
sidebar_position: 0
description: 'Install Spice.ai OSS on macOS, Linux, Windows, or WSL using the install script, Homebrew, PowerShell, or direct download from GitHub releases.'
keywords: [spice.ai, install, installation, macos, linux, windows, wsl, homebrew, download]
image: /img/og/spiceai.png
pagination_next: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Installation options for Spice.ai OSS

**Prerequisites:** macOS (Apple Silicon), Linux (x86_64 or aarch64), or Windows 10+/WSL. No other dependencies are required for the pre-built binary.

For deployment options, such as to Kubernetes, see [`Deployment`](./deployment).

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
    iex ((New-Object System.Net.WebClient).DownloadString("https://install.spiceai.org/Install.ps1"))
    ```

  </TabItem>
</Tabs>

## Direct Download

Binaries for Linux, Windows, and macOS are available for download from GitHub at [github.com/spiceai/spiceai/releases](https://github.com/spiceai/spiceai/releases).

**Verify the installation:**

After installing, verify Spice is installed correctly:

```bash
spice version
```

Expected output:

```
CLI version:     1.x.x
Runtime version: 1.x.x
```

If the command is not found, ensure the Spice binary directory is in your `PATH`.

## What's Next?

After installing, follow the [Getting Started guide](./getting-started) to initialize a Spice app, connect to a dataset, and run your first query in under 5 minutes.

## Building from Source

To build Spice from source, including CUDA and Metal hardware acceleration options, see [CONTRIBUTING.md](https://github.com/spiceai/spiceai/blob/trunk/CONTRIBUTING.md) in the Spice.ai GitHub repository.
