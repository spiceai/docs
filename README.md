# Spice.ai documentation

If you are looking to explore the Spice.ai documentation, please go to the documentation website:

[**https://docs.spiceai.org**](https://docs.spiceai.org)

This repo contains the markdown files which generate the above website. See below for guidance on running with a local environment to contribute to the docs.

## Overview

The Spice.ai docs are built using [Docusaurus](https://docusaurus.io/) hosted on [GitHub Pages](https://pages.github.com/).

The [spiceaidocs](./spiceaidocs) directory contains the Docusaurus project, markdown files, and theme configurations.

## Pre-requisites

- [Node.js](https://nodejs.org/en/)
- [Docusaurus](https://docusaurus.io/docs/installation)

## Environment setup

1. Ensure pre-requisites are installed
2. Clone this repository

```sh
git clone https://github.com/spiceai/docs.git
```

3. Change to spiceaidocs directory:

```sh
cd ./docs/spiceaidocs
```

4. Install npm packages:

```sh
npm install
```

## Run local server

1. Make sure you're still in the `spiceaidocs` directory
2. Run

```sh
npm start
```

3. Navigate to `http://localhost:3000/`

## Update docs

1. Fork repo into your account
1. Create new branch
1. Commit and push changes to forked branch
1. Submit pull request from downstream branch to the upstream branch for the correct version you are targeting
1. Staging site will automatically get created and linked to PR to review and test
