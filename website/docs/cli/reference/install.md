---
title: "install"
sidebar_label: "install"
pagination_prev: null
pagination_next: null
---
Install or reinstall the Spice runtime.

### Usage

```shell
spice install [version] [flavor] [flags]
spice install nightly [date] [flags]
```

#### version

A release to install, such as `v1.8.3`. Without a version, the latest release is installed.

#### flavor

- ``     Install the core runtime that only includes data components
- `cuda` Install the runtime with CUDA GPU acceleration (Linux only)

Metal/CUDA acceleration is auto-detected by default.

#### nightly

`nightly` installs the `spice` CLI and the `spiced` runtime of a nightly build: the binaries the `build_nightly` workflow in [spiceai/spiceai](https://github.com/spiceai/spiceai/actions/workflows/build_nightly.yml) builds from `trunk` each day. Without a date, it installs the newest nightly build that has binaries for this machine. With a date, such as `2026-11-10` or `20261110`, it installs the build that ran on that UTC date.

The runtime is installed where `spice install` puts it (`~/.spice/bin/spiced`), and the CLI replaces the running `spice`, as [`spice upgrade`](./upgrade) does. Each download is checked against the sha256 that GitHub publishes for it before it is installed.

Nightly builds are published for Linux x86_64, Linux aarch64, and macOS aarch64, and have no CUDA flavor. GitHub serves workflow artifacts only to signed-in users, so `spice install nightly` needs a GitHub token: it reads `GH_TOKEN` or `GITHUB_TOKEN`, and otherwise asks the [GitHub CLI](https://cli.github.com/) (`gh auth token`). Without a token, it stops before downloading:

```text
Failed to install the Spice nightly build: GitHub serves nightly builds only to signed-in users. Sign in with `gh auth login`, or set GITHUB_TOKEN to a GitHub token, then rerun the command.
```

GitHub deletes a nightly build's binaries after the workflow's retention period. When no build ran on the requested date, or its binaries have expired, the error lists dates that can still be installed.

#### Flags

- `-h`, `--help`   Print this help message
- `-f`, `--force`  Install even if the requested build is already installed

### Examples

```shell
spice install
```

### Additional Examples

```shell
spice install cuda
```

```shell
spice install v1.8.3
```

```shell
spice install nightly
```

```shell
spice install nightly 2026-11-10
```
