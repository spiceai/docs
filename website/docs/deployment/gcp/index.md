---
title: 'Google Cloud Deployment Options'
description: 'Guide to deploying Spice.ai applications on Google Cloud Platform (GCP).'
sidebar_label: 'GCP'
sidebar_position: 3
pagination_next: null
keywords:
  [
    spice.ai,
    gcp,
    google cloud,
    gke,
    cloud run,
    compute engine,
    workload identity,
    bigquery,
    cloud sql,
    alloydb,
    terraform
  ]
---

Spice.ai runs on Google Cloud Platform (GCP) on Kubernetes, serverless containers, or virtual machines. The container image and Helm chart are the same artefacts used in every other environment, so the choice of GCP service is a matter of operational fit rather than packaging.

For a complete list of GCP-compatible data connectors, AI models, and supported services, see [GCP Integrations](gcp/integrations).

## Benefits of deploying on GCP

- **Scalability**: Scale Spice with [GKE node auto-provisioning](https://cloud.google.com/kubernetes-engine/docs/concepts/node-auto-provisioning), [GKE Autopilot](https://cloud.google.com/kubernetes-engine/docs/concepts/autopilot-overview), and [Cloud Run](https://cloud.google.com/run).
- **Global reach**: Deploy across [GCP regions](https://cloud.google.com/about/locations) for low-latency access close to data sources.
- **Integration**: Connect to [BigQuery](https://cloud.google.com/bigquery), [Cloud Storage](https://cloud.google.com/storage), [Cloud SQL](https://cloud.google.com/sql), [AlloyDB](https://cloud.google.com/alloydb), and [Secret Manager](https://cloud.google.com/secret-manager).
- **Cost control**: Choose from [machine types](https://cloud.google.com/compute/docs/machine-resource), [committed use discounts](https://cloud.google.com/compute/docs/instances/signing-up-committed-use-discounts), and [Spot VMs](https://cloud.google.com/compute/docs/instances/spot).
- **Security**: Run inside a VPC with [Private Google Access](https://cloud.google.com/vpc/docs/private-google-access), [VPC Service Controls](https://cloud.google.com/vpc-service-controls), and short-lived credentials via [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation).

## Deployment options

### Google Kubernetes Engine (GKE)

Run Spice on [GKE](https://cloud.google.com/kubernetes-engine) when the workload benefits from Kubernetes orchestration, multi-replica scale, or shared cluster tenancy. GKE pairs with the [Spice Helm chart](https://spiceai.org/docs/deployment/kubernetes/helm) and the [Argo CD](https://spiceai.org/docs/deployment/kubernetes/argocd) or [Flux](https://spiceai.org/docs/deployment/kubernetes/flux) GitOps workflows.

#### 1. Provision the cluster

The fastest path is `gcloud`. The example below creates a regional Standard cluster with [Workload Identity](https://cloud.google.com/kubernetes-engine/docs/concepts/workload-identity) enabled — required for federated credentials to GCP services.

```bash
PROJECT=my-project
REGION=us-central1
CLUSTER=spiceai-prod

gcloud container clusters create $CLUSTER \
  --project $PROJECT \
  --region $REGION \
  --release-channel regular \
  --machine-type e2-standard-4 \
  --num-nodes 1 \
  --enable-autoscaling --min-nodes 2 --max-nodes 6 \
  --workload-pool ${PROJECT}.svc.id.goog \
  --enable-ip-alias

gcloud container clusters get-credentials $CLUSTER --region $REGION --project $PROJECT
```

For burst or low-utilization workloads, use [GKE Autopilot](https://cloud.google.com/kubernetes-engine/docs/concepts/autopilot-overview) — Google manages the nodes, billing is per-pod, and Workload Identity is enabled by default. For production, prefer Terraform for repeatable provisioning. The [`terraform-google-modules/kubernetes-engine`](https://github.com/terraform-google-modules/terraform-google-kubernetes-engine) module is a common starting point.

#### 2. Configure Workload Identity for GCP access

Most Spice connectors (Cloud Storage via the [S3 connector](../components/data-connectors/s3) with HMAC, BigQuery via [ADBC](../components/data-connectors/adbc), Cloud SQL via [PostgreSQL](../components/data-connectors/postgres) or [MySQL](../components/data-connectors/mysql)) accept GCP credentials from [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials). Use Workload Identity so pods receive scoped, short-lived tokens without static keys:

```bash
# 1. Create a Google service account and grant it the roles the Spicepod needs
gcloud iam service-accounts create spiceai-runtime --project $PROJECT

gcloud projects add-iam-policy-binding $PROJECT \
  --member "serviceAccount:spiceai-runtime@${PROJECT}.iam.gserviceaccount.com" \
  --role roles/storage.objectViewer

gcloud projects add-iam-policy-binding $PROJECT \
  --member "serviceAccount:spiceai-runtime@${PROJECT}.iam.gserviceaccount.com" \
  --role roles/bigquery.dataViewer

# 2. Bind the Google service account to a Kubernetes ServiceAccount
gcloud iam service-accounts add-iam-policy-binding \
  spiceai-runtime@${PROJECT}.iam.gserviceaccount.com \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:${PROJECT}.svc.id.goog[spiceai/spiceai]"
```

Reference the service account from the Helm release so pods inherit federated tokens via the standard ADC chain:

```yaml
# values.yaml
serviceAccount:
  create: true
  name: spiceai
  annotations:
    iam.gke.io/gcp-service-account: spiceai-runtime@my-project.iam.gserviceaccount.com
```

#### 3. Install Spice.ai

```bash
helm repo add spiceai https://helm.spiceai.org
helm repo update

helm upgrade --install spiceai spiceai/spiceai \
  --namespace spiceai --create-namespace \
  --version 1.11.5 \
  -f values.yaml
```

For declarative GitOps, swap this command for an Argo CD `Application` or a Flux `HelmRelease` pointing at the same chart. See the [Argo CD](https://spiceai.org/docs/deployment/kubernetes/argocd) or [Flux](https://spiceai.org/docs/deployment/kubernetes/flux) guides for full manifests.

#### 4. Storage and ingress

For stateful acceleration (DuckDB, SQLite, Cayenne):

- **Local SSD (recommended)** — Spice acceleration is latency- and IOPS-sensitive, so the lowest-latency option is a node-local NVMe SSD on a machine type with attached [Local SSD](https://cloud.google.com/compute/docs/disks/local-ssd) (`n2-standard-*-lssd`, `c3-standard-*-lssd`, `z3` series). Expose Local SSDs through GKE's [Local SSD raw block / ephemeral storage](https://cloud.google.com/kubernetes-engine/docs/how-to/persistent-volumes/local-ssd) provisioner. Local SSDs do not survive node replacement, so pair with a refresh strategy or a re-hydration source.
- **Hyperdisk Extreme / Balanced** — when shared, replica-attachable persistence is required, [Hyperdisk](https://cloud.google.com/compute/docs/disks/hyperdisk) provides high IOPS and configurable throughput. Use the [Compute Engine persistent disk CSI driver](https://cloud.google.com/kubernetes-engine/docs/how-to/persistent-volumes/gce-pd-csi-driver) with a custom StorageClass (`type: hyperdisk-balanced` or `hyperdisk-extreme`).
- **Persistent Disk SSD (`pd-ssd`, `premium-rwo`)** — use the built-in `premium-rwo` storage class only when Hyperdisk is unavailable in a region.
- **Filestore (`filestore-csi`) — not recommended for acceleration** — use only for stateless shared artefacts that need `ReadWriteMany`. NFS latency negates the benefit of using a local accelerator.
- Set `stateful.enabled: true` and `stateful.storageClass: <chosen-class>` in `values.yaml`.

:::tip[Spice.ai Enterprise]
For production stateful workloads, the [Spice.ai Enterprise](https://spice.ai) Operator's [`SpicepodSet`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodset) provides per-replica `StatefulSet`s with automatic PVC resizing, Workload-Identity-aware ServiceAccount annotations, and configurable update strategies. For distributed query execution across scheduler/executor tiers backed by Cloud Storage, see [`SpicepodCluster`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodcluster).
:::

To expose Spice externally, install the [GKE Gateway controller](https://cloud.google.com/kubernetes-engine/docs/concepts/gateway-api) or use a [Cloud Load Balancer Service](https://cloud.google.com/kubernetes-engine/docs/how-to/exposing-apps):

```yaml
# values.yaml
service:
  type: LoadBalancer
  additionalAnnotations:
    networking.gke.io/load-balancer-type: 'Internal' # internal only
```

For internal-only deployments, set `Internal` to bind to the cluster's VPC rather than a public IP.

#### 5. Observability

The Spice Helm chart ships a `PodMonitor` resource for the [Prometheus Operator](https://prometheus-operator.dev/). On GKE, [Google Cloud Managed Service for Prometheus](https://cloud.google.com/stackdriver/docs/managed-prometheus) is the common target — it ingests `PodMonitor` resources directly when [managed collection](https://cloud.google.com/stackdriver/docs/managed-prometheus/setup-managed) is enabled. Set `monitoring.podMonitor.enabled: true` and import the [Spice Grafana dashboard](../monitoring/grafana) into [Cloud Monitoring](https://cloud.google.com/monitoring) or self-managed Grafana.

For comprehensive guidance, refer to the [GKE documentation](https://cloud.google.com/kubernetes-engine/docs), [GKE security best practices](https://cloud.google.com/kubernetes-engine/docs/concepts/security-overview), and the [Spice.ai Kubernetes Deployment Guide](https://spiceai.org/docs/deployment/kubernetes).

### Cloud Run

[Cloud Run](https://cloud.google.com/run) is a serverless container platform suitable for HTTP-driven Spice.ai workloads that benefit from scale-to-zero and request-based autoscaling. Use it when a single managed container is sufficient and operating Kubernetes is not desired.

#### 1. Configure a service account

Create a service account with the IAM roles the Spicepod requires. Cloud Run attaches it to the service so the runtime authenticates via [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials) without static keys:

```bash
gcloud iam service-accounts create spiceai-runtime --project $PROJECT

gcloud projects add-iam-policy-binding $PROJECT \
  --member "serviceAccount:spiceai-runtime@${PROJECT}.iam.gserviceaccount.com" \
  --role roles/storage.objectViewer

gcloud projects add-iam-policy-binding $PROJECT \
  --member "serviceAccount:spiceai-runtime@${PROJECT}.iam.gserviceaccount.com" \
  --role roles/secretmanager.secretAccessor
```

#### 2. Deploy Spice.ai

Cloud Run pulls the [Spice.ai container image](https://hub.docker.com/r/spiceai/spiceai) directly. Mount secrets from [Secret Manager](https://cloud.google.com/run/docs/configuring/secrets) and configure HTTP ingress on port `8090`:

```bash
gcloud run deploy spiceai \
  --project $PROJECT \
  --region $REGION \
  --image spiceai/spiceai:1.11.5-models \
  --port 8090 \
  --service-account spiceai-runtime@${PROJECT}.iam.gserviceaccount.com \
  --min-instances 1 --max-instances 5 \
  --cpu 1 --memory 2Gi \
  --set-env-vars SPICED_LOG=INFO \
  --set-secrets SPICEAI_API_KEY=spiceai-api-key:latest
```

To run multiple replicas with shared file-based acceleration, mount [Cloud Storage with FUSE](https://cloud.google.com/run/docs/configuring/services/cloud-storage-volume-mounts) and point file accelerators at the mount path (for example, `duckdb_file: /data/taxi_trips.db`). Cloud Storage volume latency is significantly higher than local SSD, so prefer GKE for latency-sensitive accelerated workloads.

#### 3. Scaling rules

Cloud Run scales by concurrent requests per instance ([default 80](https://cloud.google.com/run/docs/about-concurrency)). For background workloads (refresh schedules, ingestion) that should not scale to zero, set `--min-instances 1`. For workloads with long-running connections (Arrow Flight, streaming refresh), set `--no-cpu-throttling` and tune `--concurrency` to match the runtime's request profile.

#### 4. Health probes and revisions

Cloud Run uses [startup and liveness probes](https://cloud.google.com/run/docs/configuring/healthchecks) — point them at `/health` and `/v1/ready`. Each `gcloud run deploy` creates a new [revision](https://cloud.google.com/run/docs/managing/revisions); use [traffic splitting](https://cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration) for canary upgrades:

```bash
gcloud run services update-traffic spiceai \
  --region $REGION \
  --to-revisions spiceai-00010-abc=90,spiceai-00009-xyz=10
```

For more details, see the [Cloud Run documentation](https://cloud.google.com/run/docs) and the [Spice.ai Docker Deployment Guide](https://spiceai.org/docs/deployment/docker).

### Compute Engine

Deploy Spice directly on [Compute Engine](https://cloud.google.com/compute) for maximum control over the environment, GPU access, or large-memory machine types.

1. **Manual VM deployment**:
   - Provision a Linux VM (Ubuntu, Debian, or Container-Optimized OS) with an appropriate [machine type](https://cloud.google.com/compute/docs/machine-resource).
   - Install [Docker Engine](https://docs.docker.com/engine/install/) and run [Spice.ai as a Docker container](https://spiceai.org/docs/deployment/docker), or install the `spice` binary directly. See the [installation guide](https://spiceai.org/docs/installation).
   - Attach a [service account](https://cloud.google.com/compute/docs/access/service-accounts) so Spice can read from Cloud Storage, BigQuery, and Secret Manager without static credentials.

2. **Automated deployment with Terraform or Deployment Manager**:
   - Define infrastructure in a [Terraform configuration](https://registry.terraform.io/providers/hashicorp/google/latest), including the VM, network, firewall rules, and service account.
   - Use [startup scripts](https://cloud.google.com/compute/docs/instances/startup-scripts/linux) or [Container-Optimized OS with `cloud-init`](https://cloud.google.com/container-optimized-os/docs/how-to/run-container-instance) to install Docker, pull the [Spice.ai image](https://hub.docker.com/r/spiceai/spiceai), retrieve secrets from [Secret Manager](https://cloud.google.com/secret-manager), and start the runtime.
   - Use [managed instance groups](https://cloud.google.com/compute/docs/instance-groups) for horizontally scaled deployments fronted by an [external HTTP(S) load balancer](https://cloud.google.com/load-balancing/docs/https) or [internal load balancer](https://cloud.google.com/load-balancing/docs/internal).

For detailed guidance, refer to the [Compute Engine documentation](https://cloud.google.com/compute/docs), the [Container-Optimized OS guide](https://cloud.google.com/container-optimized-os/docs), and the [Google provider for Terraform](https://registry.terraform.io/providers/hashicorp/google/latest/docs).

## Authentication

Most GCP services that Spice connects to accept explicit credentials through component parameters (for example, `iceberg_gcs_credentials` on the [Iceberg connector](../components/data-connectors/iceberg)). When explicit credentials are not provided, Spice follows the standard [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials) chain:

1. **`GOOGLE_APPLICATION_CREDENTIALS`** — path to a service account JSON key file. Common in local development; not recommended for production.
2. **Attached service account** — the credential of the runtime environment:
   - Compute Engine, Cloud Run, GKE node default service account.
   - GKE pods configured with [Workload Identity](https://cloud.google.com/kubernetes-engine/docs/concepts/workload-identity) — federated tokens scoped to a namespaced Kubernetes ServiceAccount, with no static keys on the node.
3. **`gcloud` CLI credentials** — cached credentials from `gcloud auth application-default login`. Common during development.
4. **Workload Identity Federation** — federated identity for workloads running outside GCP (other clouds, on-premises, GitHub Actions). See [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation).

For services with explicit parameters (Cloud Storage HMAC, BigQuery service account JSON), prefer named credentials or Workload Identity over `GOOGLE_APPLICATION_CREDENTIALS` files in production.

:::note[IAM role bindings]
Regardless of the credential source, the principal must have the appropriate IAM role bindings (for example, `roles/storage.objectViewer` on a bucket, or `roles/bigquery.dataViewer` on a BigQuery dataset). When a Spicepod connects to multiple GCP services, the principal must have permissions across all of them.
:::

## Resources

### Documentation

- [GCP Integrations](gcp/integrations) — complete list of GCP data connectors, AI models, and supported services.
- [Spice.ai Kubernetes Deployment Guide](../deployment/kubernetes) — Helm, Argo CD, and Flux options for GKE.

### Google Cloud Marketplace

Spice.ai is not yet published to [Google Cloud Marketplace](https://console.cloud.google.com/marketplace) (coming soon). In the meantime, deploy using the [`spiceai/spiceai`](https://hub.docker.com/r/spiceai/spiceai) container image or the [Spice Helm chart](https://helm.spiceai.org).
