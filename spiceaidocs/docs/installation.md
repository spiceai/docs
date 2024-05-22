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
