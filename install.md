# Install Spice AI

### Current Limitations

- Running in Docker is required. We will support a baremetal experience at launch.
- Only macOS and Linux are natively supported. [WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install-win10) is required for Windows.
- arm64 is not yet supported (i.e. Apple's M1 Macs). We use M1s ourselves, so we hope to support this very soon :-)

### Prerequisites (Developer Preview only)

We highly recommend using [GitHub Codespaces](https://github.com/features/codespaces) to get started. Codespaces enables you to run Spice AI in a virtual environment in the cloud. If you use Codespaces, the following prerequisites are not required and you may skip to the [Getting Started with Codespaces](https://github.com/spiceai/spiceai#getting-started-with-codespaces) section.

To continue with installation on your local machine, follow these steps:

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

You will need to set the SPICE_GH_TOKEN in each terminal you use, so you may want to add to your terminal configuration, E.g. `.bashrc` or `.zshrc`. You can manually edit the file or use a command like:

```bash
cat "export SPICE_GH_TOKEN=<your token>" >> ~/.bashrc
```

These steps won't be required after public release.

### Installation (local machine)

Install the Spice CLI by running the following `curl` command in your terminal.

```bash
curl https://raw.githubusercontent.com/spiceai/spiceai/trunk/install/install.sh\?token\=AAATSLSSFWUX6ZVJ6LZI4XDBFRYHC | /bin/bash
```

The installation path is not currently added to your PATH, so we recommend to add it manually with the following command which you may want to add to your terminal configuration, E.g. `.bashrc` or `.zshrc`. This step won't be required after public release.

```bash
export PATH="$HOME/.spice/bin:$PATH"
```

You can also add to your `.bashrc`

```bash
cat "export PATH="$HOME/.spice/bin:$PATH" >> ~/.bashrc
```
