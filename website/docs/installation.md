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

**Prerequisites:**

- macOS 14+ (Apple Silicon), or Linux (x86_64 or aarch64) with glibc 2.39+, such as Ubuntu 24.04+ or Debian 13+. See [System Requirements](./reference/system_requirements.md).
- Windows: use [WSL 2](https://learn.microsoft.com/windows/wsl/install) with Ubuntu 24.04 (`wsl --install -d Ubuntu-24.04`), then follow the Linux steps, or run the runtime in Docker. The Spice runtime does not run natively on Windows.
- `curl`, used by the install script. Minimal Linux images and containers often don't include it. On Ubuntu or Debian, install it with `sudo apt-get install -y curl`.

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
    To run the Spice runtime locally on Windows, use WSL 2 and follow the **macOS, Linux, and WSL** tab from the WSL terminal, or run the runtime in Docker. The PowerShell script below installs only the native `spice` CLI.

    ### PowerShell Install Script

    ```bash
    iex ((New-Object System.Net.WebClient).DownloadString("https://install.spiceai.org/Install.ps1"))
    ```

    ### Runtime in Docker

    From the directory that holds `spicepod.yaml`, start the runtime in Docker on its default ports:

    ```powershell
    docker run -p 8090:8090 -p 50051:50051 -v "${PWD}:/app" spiceai/spiceai --http 0.0.0.0:8090 --flight 0.0.0.0:50051
    ```

    The native `spice` CLI connects to a runtime in WSL or Docker on the default ports, so commands such as `spice sql` and `spice status` work from PowerShell. On native Windows, `spice run`, `spice install`, and `spice upgrade` stop with an error that points to WSL.

  </TabItem>
</Tabs>

On macOS, Linux, and WSL, the install script does not use `sudo` to install the `spice` CLI into `~/.spice/bin`, so it also runs without a terminal, such as in a CI job.

## Direct Download

Binaries for Linux and macOS, and the `spice` CLI for Windows, are available for download from GitHub at [github.com/spiceai/spiceai/releases](https://github.com/spiceai/spiceai/releases). No release includes a native Windows runtime.

**Verify the installation:**

After installing, verify Spice is installed correctly:

```bash
spice version
```

Expected output (the runtime is downloaded on the first `spice run`):

```
CLI version:     v2.x.x
Runtime version: not installed
```

If the command is not found, the current terminal hasn't picked up the updated `PATH` yet. Open a new terminal, or add the Spice binary directory to the `PATH` of the current shell:

```bash
export PATH="$HOME/.spice/bin:$PATH"
```

On Linux, the install script can add the `PATH` entry to `~/.profile`, which some terminals don't read. If `spice` still isn't found in new terminals, add the line above to `~/.bashrc` (or `~/.zshrc` for zsh).

## What's Next?

After installing, follow the [Getting Started guide](./getting-started) to initialize a Spice app, connect to a dataset, and run your first query in under 5 minutes.

## Building from Source

To build Spice from source, including CUDA and Metal hardware acceleration options, see [CONTRIBUTING.md](https://github.com/spiceai/spiceai/blob/trunk/CONTRIBUTING.md) in the Spice.ai GitHub repository.
