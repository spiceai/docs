# Spice.ai documentation

If you are looking to explore the Spice.ai documentation, please go to the documentation website:

[**https://docs.spiceai.org**](https://docs.spiceai.org)

This repo contains the markdown files which generate the above website. See below for guidance on running with a local environment to contribute to the docs.

## Overview

The Spice.ai docs are built using [Hugo](https://gohugo.io/) with the [Docsy](https://docsy.dev) theme, hosted on [GitHub Pages](https://pages.github.com/).

The [spiceaidocs](./spiceaidocs) directory contains the hugo project, markdown files, and theme configurations.

## Pre-requisites

- [Hugo extended version](https://gohugo.io/getting-started/installing)
- [Node.js](https://nodejs.org/en/)

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

4. Update submodules:

```sh
git submodule update --init --recursive
```

5. Install npm packages:

```sh
npm install
cd themes/docsy && npm install
```

## Run local server

1. Make sure you're still in the `spiceaidocs` directory
2. Run

```sh
hugo server
```

3. Navigate to `http://localhost:1313/`

## Update docs

1. Fork repo into your account
1. Create new branch
1. Commit and push changes to forked branch
1. Submit pull request from downstream branch to the upstream branch for the correct version you are targeting
1. Staging site will automatically get created and linked to PR to review and test
