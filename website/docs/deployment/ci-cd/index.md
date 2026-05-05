---
title: 'CI/CD Deployment'
sidebar_label: 'CI/CD'
sidebar_position: 6
description: 'Deploy Spice.ai applications using continuous integration and delivery pipelines, including GitHub Actions and Kubernetes GitOps with Argo CD or Flux.'
keywords:
  [
    spice.ai,
    deployment,
    ci/cd,
    cicd,
    github actions,
    gitops,
    argo cd,
    flux,
    spicepod,
    spice cloud,
  ]
tags:
  - deployment
  - github
  - gitops
---

Spice deployments can be automated through continuous integration and delivery (CI/CD) pipelines. The right approach depends on the target environment:

- **Spice Cloud Platform** — use the [`spicehq/spice-cloud-deploy-action`](https://github.com/spicehq/spice-cloud-deploy-action) GitHub Action to deploy a Spicepod from a repository directly to a Spice Cloud app.
- **Self-hosted Kubernetes** — use [Argo CD](https://spiceai.org/docs/deployment/kubernetes/argocd) or [Flux](https://spiceai.org/docs/deployment/kubernetes/flux) to reconcile cluster state from a Git repository against the [Spice Helm chart](https://github.com/spiceai/helm-charts).
- **Cloud VMs / containers (AWS, Azure, Docker)** — invoke the standard provider tooling (CloudFormation, ARM/Bicep, `docker run`/Compose) from any pipeline runner. See the [AWS](https://spiceai.org/docs/deployment/aws), [Azure](https://spiceai.org/docs/deployment/azure), or [Docker](https://spiceai.org/docs/deployment/docker) guides for the deployment artifacts to invoke.

## Deploy a Spicepod with GitHub Actions

The `spicehq/spice-cloud-deploy-action` GitHub Action deploys a Spicepod manifest to a Spice Cloud Platform app on each pipeline run.

### Prerequisites

- A [Spice Cloud account](https://spice.ai/login).
- An OAuth client created from the Spice Cloud Portal. Two repository secrets — `SPICE_CLIENT_ID` and `SPICE_CLIENT_SECRET` — store its credentials.
- A `spicepod.yaml` checked into the repository.

### Minimal workflow

```yaml
name: Deploy Spicepod
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: spicehq/spice-cloud-deploy-action@v1
        with:
          client-id: ${{ secrets.SPICE_CLIENT_ID }}
          client-secret: ${{ secrets.SPICE_CLIENT_SECRET }}
          app-name: my-app
          spicepod: spicepod.yaml
```

### Common options

| Input | Purpose |
| --- | --- |
| `app-name` or `app-id` | Target Spice Cloud app. One is required. |
| `spicepod` | Path to the Spicepod manifest. Defaults to `spicepod.yaml`. |
| `region` | Required when `create-app-if-missing` provisions a new app (for example, `us-east-1`). |
| `create-app-if-missing` | Boolean. Creates the app on first deploy. |
| `secrets` | YAML or JSON map of app-level secrets to set on the deployment. |
| `tags` | YAML or JSON map of metadata labels. |
| `test-sql`, `test-chat`, `test-search` | Post-deploy smoke checks against the deployed app. |
| `wait-for-completion` | Poll until the deployment finishes. Defaults to `true`. |
| `timeout-seconds` | Maximum time to wait when polling. Defaults to `600`. |

The action emits `app-id`, `app-url`, `deployment-id`, `deployment-status`, and `test-results` outputs that downstream steps can consume.

For the full input and output reference, see the [action's README](https://github.com/spicehq/spice-cloud-deploy-action).

## Kubernetes GitOps

For Spice deployments on a self-hosted Kubernetes cluster, manage the [Spice Helm chart](https://github.com/spiceai/helm-charts) declaratively from a Git repository:

- [Argo CD](https://spiceai.org/docs/deployment/kubernetes/argocd) — `Application` manifests reconciled by the Argo CD controller.
- [Flux](https://spiceai.org/docs/deployment/kubernetes/flux) — `HelmRelease` resources reconciled by the Flux toolkit.

Both guides include end-to-end manifests targeting the official chart, including upgrade and rollback patterns.

## Related

- [Kubernetes Deployment Guide](https://spiceai.org/docs/deployment/kubernetes)
- [Spice Cloud Platform Deployment](https://spiceai.org/docs/deployment/cloud)
- [Spice Helm Chart](https://github.com/spiceai/helm-charts)
- [Spice Cloud Deploy Action](https://github.com/spicehq/spice-cloud-deploy-action)
