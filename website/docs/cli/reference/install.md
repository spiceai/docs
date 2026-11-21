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

#### Download verification

Before it extracts a release download, `spice install` checks its sha256 against the one the release records. [`spice upgrade`](./upgrade) and the runtime download that [`spice run`](./run) starts use the same check:

- The expected sha256 comes from the release's `SHA256SUMS` asset. A download that `SHA256SUMS` does not list is refused. When a release lists `SHA256SUMS` but it cannot be downloaded, the install stops instead of using another source.
- A release published without `SHA256SUMS` is checked against the sha256 that GitHub recorded when the asset was uploaded.
- When the release records no sha256 for the download, the install stops, unless `SPICE_INSTALL_ALLOW_UNVERIFIED=1` is set. That setting installs such a download with a warning. It never installs a download whose sha256 does not match.
- For a release with `SHA256SUMS`, when the [GitHub CLI](https://cli.github.com/) is installed and logged in, `spice` also runs [`gh attestation verify`](https://cli.github.com/manual/gh_attestation_verify) on the download and accepts only an attestation signed by the Spice release workflow. Without a logged-in `gh`, it skips the attestation check and logs that it did.

A download whose sha256 does not match is not installed:

```text
Checksum mismatch for <asset>: expected sha256 <expected> (SHA256SUMS of release <tag>), downloaded <actual>. The download is corrupt or was altered, so it was not installed.
```

To install a release that records no sha256:

```shell
SPICE_INSTALL_ALLOW_UNVERIFIED=1 spice install <version>
```

In v2.4.3 and earlier, `spice install`, `spice upgrade`, and `spice run` checked only the size of a release download.

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
