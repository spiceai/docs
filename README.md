# Spice.ai OSS Documentation

This repository contains the source files for the Spice.ai OSS documentation website.

To view the published documentation, visit [**https://docs.spiceai.org**](https://docs.spiceai.org).

To contribute to the documentation, follow the instructions below to set up a local development environment.

## Overview

The Spice docs are built with [Docusaurus](https://docusaurus.io/) and hosted on [Cloudflare Pages](https://pages.cloudflare.com/). The [Deployment](#deployment) section describes how changes are published.

The [website](./website) directory contains the Docusaurus project, markdown files, and theme configurations.

## Prerequisites

- [Node.js](https://nodejs.org/en/) 24 or later
- npm (included with Node.js)

Docusaurus is installed as a project dependency and does not need to be installed globally.

## Environment setup

1. Ensure pre-requisites are installed
2. Clone this repository

```sh
git clone https://github.com/spiceai/docs.git
```

3. Change to website directory:

```sh
cd ./docs/website
```

4. Install npm packages:

```sh
npm install
```

## Run Local Server

1. Ensure you are in the `website` directory.
2. Start the development server:

```sh
npm start
```

3. Open `http://localhost:3000/` in a browser. The local documentation site should appear, and changes to markdown files are reflected automatically.

## Contributing to the Docs

1. Fork this repository to your GitHub account.
2. Clone your fork and create a new branch:

   ```sh
   git checkout -b my-docs-update
   ```

3. Make changes to the markdown files in `website/docs/`.
4. Commit and push your changes:

   ```sh
   git add .
   git commit -m "docs: describe your change"
   git push origin my-docs-update
   ```

5. Open a pull request from your branch to the `trunk` branch of the upstream repository.
6. GitHub Actions builds the pull request. For a pull request from a branch in this repository, it also deploys a preview site and links it in a pull request comment. Pull requests from forks are built but not deployed (see [Deployment](#deployment)).

## Deployment

The [`build_and_publish`](.github/workflows/build_and_publish.yml) workflow builds the site in GitHub Actions and uploads `website/build` to the `spiceai-org-website` Cloudflare Pages project with [`wrangler pages deploy`](https://developers.cloudflare.com/pages/get-started/direct-upload/). A push to `trunk` deploys to production at [spiceai.org](https://spiceai.org) and starts an Algolia search reindex. For a pull request, the workflow deploys a preview and comments its URL on the pull request. Pull requests from forks are built but not deployed, because [GitHub does not pass secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets), such as the Cloudflare API token, to workflows triggered from a fork.

The repository is also connected to the Cloudflare Pages project, but Cloudflare's [automatic Git deployments](https://developers.cloudflare.com/pages/configuration/branch-build-controls/) are turned off (the project's `deployments_enabled` setting is `false`), so GitHub Actions is the only deploy path. If automatic deployments are turned back on, every Cloudflare build fails with `ENOENT: no such file or directory, open '/opt/buildhome/repo/package.json'`, because the project's [root directory](https://developers.cloudflare.com/pages/configuration/build-configuration/) is empty and the Docusaurus project is in `website/`.

To build in Cloudflare instead, set the project's root directory to `website` and its [`NODE_VERSION`](https://developers.cloudflare.com/pages/configuration/build-image/) environment variable to `24`, and turn automatic Git deployments back on. Then change the workflow:

- Remove the deploy step, so each push deploys once.
- Remove the pull request comment step, which posts the deploy step's URL.
- Start the Algolia reindex only after Cloudflare finishes a successful production deployment. Without the deploy step, the current reindex step would run right after the workflow's build, before Cloudflare publishes the new site.
