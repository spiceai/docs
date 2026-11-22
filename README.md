# Spice.ai OSS Documentation

This repository contains the source files for the Spice.ai OSS documentation website.

To view the published documentation, visit [**https://docs.spiceai.org**](https://docs.spiceai.org).

To contribute to the documentation, follow the instructions below to set up a local development environment.

## Overview

The Spice docs are built with [Docusaurus](https://docusaurus.io/) and hosted on [Cloudflare Pages](https://pages.cloudflare.com/). The [Deployment](#deployment) section describes how changes are published.

The [website](./website) directory contains the Docusaurus project, markdown files, and theme configurations.

## Prerequisites

- [Node.js](https://nodejs.org/en/) 26 or later (the version in [`website/.nvmrc`](website/.nvmrc))
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
6. GitHub Actions builds the pull request. For a pull request from a branch in this repository, Cloudflare Pages also deploys a preview site and links it in a pull request comment. Pull requests from forks are built but not deployed (see [Deployment](#deployment)).

## Deployment

Cloudflare Pages builds and deploys the site through its [GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/). The `spiceai-org` Pages project is connected to this repository. It runs `npm run build` in the `website` [root directory](https://developers.cloudflare.com/pages/configuration/build-configuration/) with the Node.js version in [`website/.nvmrc`](website/.nvmrc) and publishes `website/build`. A push to `trunk` deploys to production at [spiceai.org](https://spiceai.org). A push to any other branch in this repository deploys a [preview](https://developers.cloudflare.com/pages/configuration/preview-deployments/), and Cloudflare comments the preview URL on the branch's pull request. Cloudflare does not create previews for pull requests from forks. Each build reports a `Cloudflare Pages` check run on its commit, which links to the build log.

GitHub stores no Cloudflare credential. The [`build`](.github/workflows/build.yml) workflow builds every pull request without secrets, including pull requests from forks, and its `Build` check must pass before a pull request merges into `trunk`. Like the Cloudflare build, it fails on broken links.

The [`Trigger Algolia Search Reindex`](.github/workflows/trigger_search_reindex.yml) workflow starts an Algolia crawler reindex when the `Cloudflare Pages` check run for a `trunk` commit completes successfully, so the crawler reads the site that was just published. It reads the Algolia credentials from the `production` environment, which only `trunk` can use. It can also be run manually.
