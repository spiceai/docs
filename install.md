# Install Spice AI

## Prerequisites (Developer Preview only)

The developer preview of Spice AI has a few extra requirements that won't be needed for the public release.

Currently, macOS and Linux are natively supported. [WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install-win10) is required for Windows.

1. Install Docker
2. Generate and export a GitHub PAT

**Step 1. Install Docker**: While self-hosting on baremetal hardware will be supported, the Developer Preview currently requires Docker. To install Docker, please follow [these instructions](https://docs.docker.com/get-docker/).

**Step 2. Generate and export a GitHub PAT**: To access private repositories and resources, you will need to generate a [GitHub Personal Access Token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) with `repo` and `read:packages` scopes.

Once you have created a token, use it to log in to the Spice AI Docker Repository:

```bash
docker login ghcr.io/spiceai
Username: <your GitHub username>
Password: <your token>
```

Add the token to an environment variable named SPICE_GH_TOKEN:

```bash
export SPICE_GH_TOKEN=<your token>
```

You may want to add to your terminal configuration, E.g. `.bashrc` or `.zshrc`.

## Installation

Install the Spice CLI by running the following `curl` command in your terminal.

```bash
curl https://raw.githubusercontent.com/spiceai/spiceai/trunk/install/install.sh\?token\=AAKTKO3WFSKCDXVQOJM6P63BC2PM4 | /bin/bash
```

The installation path is not currently added to your PATH, so we recommend to add it manually with the following command which you may want to add to your terminal configuration, E.g. `.bashrc` or `.zshrc`.

```bash
export PATH="$HOME/.spice/bin:$PATH"
```
