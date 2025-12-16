# Spice.ai OSS Documentation

This repository contains the source files for the Spice.ai OSS documentation website.

To view the published documentation, visit [**https://docs.spiceai.org**](https://docs.spiceai.org).

To contribute to the documentation, follow the instructions below to set up a local development environment.

## Overview

The Spice docs are built using [Docusaurus](https://docusaurus.io/) hosted on [GitHub Pages](https://pages.github.com/).

The [website](./website) directory contains the Docusaurus project, markdown files, and theme configurations.

## Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later recommended)
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
6. A staging site is automatically generated and linked in the pull request for review.
