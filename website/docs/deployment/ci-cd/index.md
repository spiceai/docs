---
title: 'CI/CD Deployment'
sidebar_label: 'CI/CD'
sidebar_position: 8
description: 'Deploy Spice.ai applications using continuous integration and delivery pipelines, including Helm, Kubernetes GitOps with Argo CD or Flux, GitHub Actions, and the Spice Cloud deploy action.'
keywords:
  [
    spice.ai,
    deployment,
    ci/cd,
    cicd,
    helm,
    kubernetes,
    github actions,
    gitops,
    argo cd,
    flux,
    spicepod,
    spice cloud,
  ]
tags:
  - deployment
  - helm
  - kubernetes
  - github
  - gitops
---

Spice deployments can be automated through continuous integration and delivery (CI/CD) pipelines. The recommended approach for self-hosted, open-source deployments is the [Spice Helm chart](https://github.com/spiceai/helm-charts), driven either directly from a pipeline runner or declaratively through a GitOps controller. Container and cloud-VM workflows are also supported, as is a managed deploy action for the Spice Cloud Platform.

The sections below cover, in order:

- [Helm in CI pipelines](#helm-in-ci-pipelines) — push-based deployment from GitHub Actions, GitLab CI, or any runner.
- [Kubernetes GitOps](#kubernetes-gitops) — pull-based reconciliation with Argo CD or Flux.
- [Containers and cloud VMs](#containers-and-cloud-vms) — Docker, AWS, and Azure pipelines.
- [Spice Cloud Platform](#spice-cloud-platform) — Connect Repository from the portal, or the `spicehq/spice-cloud-deploy-action` GitHub Action.

:::tip Self-hosted enterprise deployments
For production self-hosted deployments, the [Spice.ai Enterprise Kubernetes Operator](https://docs.spice.ai/docs/enterprise/kubernetes-operator/kubernetes) is the recommended approach. The operator provides per-replica StatefulSets, automatic PVC resizing, configurable update strategies, crashloop protection, and distributed query execution through `SpicepodSet` and `SpicepodCluster` custom resources, all reconcilable from Git through the same GitOps tooling described below.
:::

## Helm in CI pipelines

The [Spice Helm chart](https://github.com/spiceai/helm-charts) is the primary deployment artifact for self-hosted clusters. Any CI runner with `kubectl` and `helm` installed can roll out a release by checking out the repository, authenticating to the target cluster, and running `helm upgrade --install`.

The chart loads the Spicepod from a `spicepod` key in the values file. A typical layout keeps a single `values.yaml` that contains both chart configuration and the Spicepod definition:

```yaml
# values.yaml
image:
  repository: spiceai/spiceai
  tag: '1.10.0'

spicepod:
  name: cayenne
  version: v1
  kind: Spicepod
  datasets:
    - from: s3://spiceai-demo-datasets/taxi_trips/2024/
      name: taxi_trips
      params:
        file_format: parquet
      acceleration:
        enabled: true
        engine: duckdb
```

For details on chart values, see the [Helm deployment guide](https://spiceai.org/docs/deployment/kubernetes/helm).

### GitHub Actions example

The workflow below deploys the chart to a Kubernetes cluster on every push to `main`. Cluster credentials are provided through a base64-encoded kubeconfig stored in the `KUBE_CONFIG` repository secret.

```yaml
name: Deploy Spice
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: azure/setup-helm@v4
        with:
          version: v3.14.0

      - name: Configure kubectl
        run: |
          mkdir -p "$HOME/.kube"
          echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > "$HOME/.kube/config"

      - name: Deploy Spice
        run: |
          helm repo add spiceai https://helm.spiceai.org
          helm repo update
          helm upgrade --install spiceai spiceai/spiceai \
            --namespace spiceai \
            --create-namespace \
            --values values.yaml \
            --atomic \
            --wait \
            --timeout 5m
```

`--atomic` rolls back on failure, and `--wait` blocks until the release is healthy, so a failed deploy fails the pipeline.

### GitLab CI example

The same pattern works in GitLab CI. The job uses the official `alpine/helm` image and reads cluster credentials from a CI/CD variable.

```yaml
deploy:
  image: alpine/helm:3.14.0
  stage: deploy
  before_script:
    - apk add --no-cache curl
    - curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    - install -m 0755 kubectl /usr/local/bin/kubectl
    - mkdir -p ~/.kube && echo "$KUBE_CONFIG" | base64 -d > ~/.kube/config
  script:
    - helm repo add spiceai https://helm.spiceai.org
    - helm repo update
    - helm upgrade --install spiceai spiceai/spiceai
        --namespace spiceai --create-namespace
        --values values.yaml
        --atomic --wait --timeout 5m
  only:
    - main
```

### Pinning the chart and runtime versions

Production pipelines should pin both the chart and the Spice runtime image to specific versions. Pass `--version` to `helm upgrade` to pin the chart, and set `image.tag` in `values.yaml` to pin the runtime image:

```bash
helm upgrade --install spiceai spiceai/spiceai \
  --version 1.10.0 \
  --values values.yaml
```

Available chart versions are listed in the [helm-charts repository](https://github.com/spiceai/helm-charts/releases). Runtime image tags are published on [GitHub Container Registry](https://github.com/spiceai/spiceai/pkgs/container/spiceai).

### Promoting across environments

To promote the same artifact across environments, keep a base `values.yaml` and add per-environment overlays such as `values.staging.yaml` and `values.prod.yaml`. Helm merges multiple `-f` flags in order:

```bash
helm upgrade --install spiceai spiceai/spiceai \
  --values values.yaml \
  --values values.prod.yaml
```

Each environment can target a different cluster, namespace, or image tag while sharing the same Spicepod definition.

## Kubernetes GitOps

GitOps controllers reconcile cluster state from a Git repository, removing the need for the pipeline to hold cluster credentials. The controller runs inside the cluster and pulls changes as they are committed.

- [Argo CD](https://spiceai.org/docs/deployment/kubernetes/argocd) — `Application` manifests reconciled by the Argo CD controller.
- [Flux](https://spiceai.org/docs/deployment/kubernetes/flux) — `HelmRelease` resources reconciled by the Flux toolkit.

Both guides include end-to-end manifests targeting the official chart, including upgrade and rollback patterns. GitOps is the recommended approach for multi-cluster or multi-environment deployments.

## Containers and cloud VMs

For deployments that target a container runtime or a cloud VM rather than Kubernetes, invoke the standard provider tooling from any pipeline runner:

- [Docker](https://spiceai.org/docs/deployment/docker) — build, push, and run the `spiceai/spiceai` image. Pipelines typically run `docker build` and `docker push` against a registry, then `docker compose up -d` or `docker run` on the target host.
- [AWS](https://spiceai.org/docs/deployment/aws) — deploy the published CloudFormation template through the AWS CLI or any CloudFormation-aware action.
- [Azure](https://spiceai.org/docs/deployment/azure) — deploy through ARM/Bicep templates or the Azure CLI.

Each provider guide includes the deployment artifact (image, template, or script) that the pipeline invokes.

## Spice Cloud Platform

Deployments targeting the [Spice Cloud Platform](https://spiceai.org/docs/deployment/cloud) can be automated two ways:

- **Connect Repository** — link a GitHub repository to a Spice Cloud app from the portal. The app redeploys automatically on each push to the connected branch, with no pipeline configuration required. See [Connect GitHub](https://docs.spice.ai/docs/portal/apps/connect-github).
- **GitHub Actions** — use the [`spicehq/spice-cloud-deploy-action`](https://github.com/spicehq/spice-cloud-deploy-action) to deploy from a custom workflow. Use this when the pipeline needs to run tests, build artifacts, or set secrets and tags before deploying.

### GitHub Actions

The `spicehq/spice-cloud-deploy-action` deploys a Spicepod manifest to a Spice Cloud app on each pipeline run.

#### Prerequisites

- A [Spice Cloud account](https://spice.ai/login).
- An OAuth client created from the Spice Cloud Portal. Two repository secrets — `SPICE_CLIENT_ID` and `SPICE_CLIENT_SECRET` — store its credentials.
- A `spicepod.yaml` checked into the repository.

#### Minimal workflow

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

#### Common options

| Input                                  | Purpose                                                                                |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| `app-name` or `app-id`                 | Target Spice Cloud app. One is required.                                               |
| `spicepod`                             | Path to the Spicepod manifest. Defaults to `spicepod.yaml`.                            |
| `region`                               | Required when `create-app-if-missing` provisions a new app (for example, `us-east-1`). |
| `create-app-if-missing`                | Boolean. Creates the app on first deploy.                                              |
| `secrets`                              | YAML or JSON map of app-level secrets to set on the deployment.                        |
| `tags`                                 | YAML or JSON map of metadata labels.                                                   |
| `test-sql`, `test-chat`, `test-search` | Post-deploy smoke checks against the deployed app.                                     |
| `wait-for-completion`                  | Poll until the deployment finishes. Defaults to `true`.                                |
| `timeout-seconds`                      | Maximum time to wait when polling. Defaults to `600`.                                  |

The action emits `app-id`, `app-url`, `deployment-id`, `deployment-status`, and `test-results` outputs that downstream steps can consume. For the full input and output reference, see the [action's README](https://github.com/spicehq/spice-cloud-deploy-action).

## Related

- [Helm Deployment Guide](https://spiceai.org/docs/deployment/kubernetes/helm)
- [Kubernetes Deployment Guide](https://spiceai.org/docs/deployment/kubernetes)
- [Argo CD Guide](https://spiceai.org/docs/deployment/kubernetes/argocd)
- [Flux Guide](https://spiceai.org/docs/deployment/kubernetes/flux)
- [Spice Cloud Platform Deployment](https://spiceai.org/docs/deployment/cloud)
- [Spice Helm Chart](https://github.com/spiceai/helm-charts)
- [Spice Cloud Deploy Action](https://github.com/spicehq/spice-cloud-deploy-action)
