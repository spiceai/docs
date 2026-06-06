---
title: 'Azure Deployment Options'
description: 'Guide to deploying Spice.ai applications on Microsoft Azure'
sidebar_label: 'Azure'
sidebar_position: 2
pagination_next: null
keywords:
  [
    spice.ai,
    azure,
    aks,
    azure container apps,
    azure container instances,
    azure virtual machines,
    azure kubernetes service,
    arm,
    bicep,
    terraform,
  ]
---

Spice.ai provides multiple deployment options on Microsoft Azure, enabling data and AI applications to run on Azure's global infrastructure. Whether using virtual machines, container orchestration, or serverless containers, Spice deploys to meet requirements for performance, scalability, and cost efficiency.

For a complete list of Azure-compatible data connectors, AI models, and integrations, see [Azure Integrations](azure/integrations).

## Benefits of Deploying on Azure

- **Scalability**: Scale Spice.ai workloads with [virtual machine scale sets](https://learn.microsoft.com/azure/virtual-machine-scale-sets/), [AKS](https://azure.microsoft.com/products/kubernetes-service), and [Container Apps](https://azure.microsoft.com/products/container-apps).
- **Global Reach**: Deploy across Azure's [worldwide regions](https://azure.microsoft.com/explore/global-infrastructure/geographies/) for low-latency access.
- **Integration**: Connect to other Azure services such as [Azure Blob Storage](https://azure.microsoft.com/products/storage/blobs), [Azure SQL Database](https://azure.microsoft.com/products/azure-sql/database/), [Azure Database for PostgreSQL](https://azure.microsoft.com/products/postgresql/), and [Azure Key Vault](https://azure.microsoft.com/products/key-vault).
- **Cost Control**: Choose from [VM sizes](https://learn.microsoft.com/azure/virtual-machines/sizes), [reserved instances](https://azure.microsoft.com/pricing/reserved-vm-instances/), and [spot pricing](https://azure.microsoft.com/products/virtual-machines/spot/) to match workload requirements.
- **Security and Compliance**: Run Spice.ai inside an Azure security perimeter using [Virtual Networks](https://azure.microsoft.com/products/virtual-network), [private endpoints](https://learn.microsoft.com/azure/private-link/private-endpoint-overview), [Microsoft Entra ID](https://learn.microsoft.com/entra/fundamentals/), and [managed identities](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview).

## Deployment Options

### Azure Kubernetes Service (AKS)

Run Spice.ai on [Azure Kubernetes Service](https://azure.microsoft.com/products/kubernetes-service) when the workload benefits from Kubernetes orchestration, multi-replica scale, declarative configuration, or shared cluster tenancy. AKS pairs well with the [Spice Helm chart](https://spiceai.org/docs/deployment/kubernetes/helm) and the [Argo CD](https://spiceai.org/docs/deployment/kubernetes/argocd) or [Flux](https://spiceai.org/docs/deployment/kubernetes/flux) GitOps workflows.

#### 1. Provision the cluster

Provision an AKS cluster with [workload identity](https://learn.microsoft.com/azure/aks/workload-identity-overview) and the [OIDC issuer](https://learn.microsoft.com/azure/aks/cluster-configuration#oidc-issuer) enabled — both are required for federated credentials to Azure services.

```bash
RG=spiceai-rg
CLUSTER=spiceai-prod
LOCATION=eastus

az group create --name $RG --location $LOCATION

az aks create \
  --resource-group $RG \
  --name $CLUSTER \
  --location $LOCATION \
  --kubernetes-version 1.31 \
  --node-count 3 \
  --node-vm-size Standard_D4s_v5 \
  --enable-cluster-autoscaler --min-count 2 --max-count 6 \
  --enable-oidc-issuer \
  --enable-workload-identity \
  --network-plugin azure \
  --generate-ssh-keys

az aks get-credentials --resource-group $RG --name $CLUSTER
```

For burst or low-utilization workloads, attach [virtual nodes](https://learn.microsoft.com/azure/aks/virtual-nodes) backed by Azure Container Instances. For production, prefer Bicep or Terraform for repeatable provisioning — the [Azure Verified Modules](https://azure.github.io/Azure-Verified-Modules/) library publishes a maintained AKS module.

#### 2. Configure workload identity for Azure access

Most Spice connectors (ABFS, Azure SQL, Key Vault, Azure OpenAI) accept Azure credentials from the environment. Use [workload identity](https://learn.microsoft.com/azure/aks/workload-identity-overview) so pods receive scoped, federated tokens without static secrets:

```bash
# 1. Create a user-assigned managed identity
az identity create --resource-group $RG --name spiceai-identity
CLIENT_ID=$(az identity show -g $RG -n spiceai-identity --query clientId -o tsv)
PRINCIPAL_ID=$(az identity show -g $RG -n spiceai-identity --query principalId -o tsv)

# 2. Grant the identity access to Azure resources the Spicepod needs
az role assignment create \
  --assignee-object-id $PRINCIPAL_ID --assignee-principal-type ServicePrincipal \
  --role "Storage Blob Data Reader" \
  --scope /subscriptions/<sub>/resourceGroups/$RG/providers/Microsoft.Storage/storageAccounts/<acct>

# 3. Federate the identity with the Kubernetes ServiceAccount
ISSUER=$(az aks show -g $RG -n $CLUSTER --query oidcIssuerProfile.issuerUrl -o tsv)
az identity federated-credential create \
  --name spiceai-fed \
  --identity-name spiceai-identity \
  --resource-group $RG \
  --issuer "$ISSUER" \
  --subject system:serviceaccount:spiceai:spiceai \
  --audiences api://AzureADTokenExchange
```

Reference the identity from the Helm release so Spice pods inherit federated tokens via the [DefaultAzureCredential](https://learn.microsoft.com/dotnet/api/azure.identity.defaultazurecredential) chain:

```yaml
# values.yaml
serviceAccount:
  create: true
  name: spiceai
  annotations:
    azure.workload.identity/client-id: "<CLIENT_ID>"
podLabels:
  azure.workload.identity/use: "true"
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

- **Local NVMe (recommended)** — Spice acceleration is latency- and IOPS-sensitive, so the lowest-latency option is a node-local NVMe SSD on an instance family with attached NVMe ([Lsv3 / Lasv3](https://learn.microsoft.com/azure/virtual-machines/lsv3-series), [Ddsv5 / Ddsv6](https://learn.microsoft.com/azure/virtual-machines/ddv5-ddsv5-series), [Edsv5 / Edsv6](https://learn.microsoft.com/azure/virtual-machines/edv5-edsv5-series)). Expose the local NVMe through the [Local Volume Static Provisioner](https://github.com/kubernetes-sigs/sig-storage-local-static-provisioner) as a `local-storage` StorageClass. Local NVMe does not survive node replacement, so pair with a refresh strategy or a re-hydration source.
- **Premium SSD v2** — when shared / replica-attachable persistence is required, [Premium SSD v2](https://learn.microsoft.com/azure/virtual-machines/disks-types#premium-ssd-v2) delivers up to 80,000 IOPS and sub-millisecond latency with independently configurable IOPS and throughput. Use the [Azure Disks CSI driver](https://learn.microsoft.com/azure/aks/azure-disk-csi) with a custom StorageClass (`skuName: PremiumV2_LRS`).
- **Premium SSD (`managed-csi-premium`)** — use the built-in `managed-csi-premium` storage class only when Premium SSD v2 is unavailable in a region.
- **Azure Files (`azurefile-csi`) — not recommended for acceleration** — use only for stateless shared artefacts that need `ReadWriteMany`. SMB/NFS latency negates the benefit of using a local accelerator.
- Set `stateful.enabled: true` and `stateful.storageClass: <chosen-class>` in `values.yaml`.

:::tip[Spice.ai Enterprise]
For production stateful workloads, the [Spice.ai Enterprise](https://spice.ai) Operator's [`SpicepodSet`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodset) provides per-replica `StatefulSet`s with automatic PVC resizing, workload-identity-aware ServiceAccount annotations, and configurable update strategies. For distributed query execution across scheduler/executor tiers backed by Azure Blob Storage, see [`SpicepodCluster`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodcluster).
:::

To expose Spice externally, install the [Application Gateway Ingress Controller (AGIC)](https://learn.microsoft.com/azure/application-gateway/ingress-controller-overview) or use a [Standard public Load Balancer](https://learn.microsoft.com/azure/aks/load-balancer-standard):

```yaml
# values.yaml
service:
  type: LoadBalancer
  additionalAnnotations:
    service.beta.kubernetes.io/azure-load-balancer-internal: "true" # internal only
```

For internal-only deployments, set `azure-load-balancer-internal: "true"` to bind to the cluster's VNet rather than a public IP.

#### 5. Observability

The Spice Helm chart ships a `PodMonitor` resource for the [Prometheus Operator](https://prometheus-operator.dev/). On AKS, the [Azure Monitor managed service for Prometheus](https://learn.microsoft.com/azure/azure-monitor/essentials/prometheus-metrics-overview) and [Container insights](https://learn.microsoft.com/azure/azure-monitor/containers/container-insights-overview) are the common targets. Set `monitoring.podMonitor.enabled: true` and import the [Spice Grafana dashboard](../monitoring/grafana) into [Azure Managed Grafana](https://azure.microsoft.com/products/managed-grafana).

For comprehensive guidance, refer to the [Azure Kubernetes Service documentation](https://learn.microsoft.com/azure/aks/), the [AKS baseline architecture](https://learn.microsoft.com/azure/architecture/reference-architectures/containers/aks/baseline-aks), and the [Spice.ai Kubernetes Deployment Guide](https://spiceai.org/docs/deployment/kubernetes).

### Azure Container Apps

[Azure Container Apps](https://azure.microsoft.com/products/container-apps) is a serverless container platform suitable for HTTP-driven Spice.ai workloads that benefit from scale-to-zero and request-based autoscaling. Use it when a single managed container is sufficient and operating Kubernetes is not desired.

#### 1. Create the environment

The environment is the security and networking boundary that hosts one or more container apps:

```bash
RG=spiceai-rg
ENV=spiceai-env
LOCATION=eastus

az group create --name $RG --location $LOCATION

az containerapp env create \
  --name $ENV \
  --resource-group $RG \
  --location $LOCATION \
  --logs-destination log-analytics
```

To reach Azure SQL, Storage, or Key Vault behind private endpoints, attach the environment to a [VNet-injected subnet](https://learn.microsoft.com/azure/container-apps/networking) by adding `--infrastructure-subnet-resource-id` and `--internal-only true`.

#### 2. Configure managed identity

Container Apps support both [system-assigned and user-assigned managed identities](https://learn.microsoft.com/azure/container-apps/managed-identity). A user-assigned identity is preferred so role assignments survive app recreation:

```bash
az identity create --resource-group $RG --name spiceai-identity
IDENTITY_ID=$(az identity show -g $RG -n spiceai-identity --query id -o tsv)
PRINCIPAL_ID=$(az identity show -g $RG -n spiceai-identity --query principalId -o tsv)

# Grant access to the resources the Spicepod connects to
az role assignment create \
  --assignee-object-id $PRINCIPAL_ID --assignee-principal-type ServicePrincipal \
  --role "Storage Blob Data Reader" \
  --scope /subscriptions/<sub>/resourceGroups/$RG/providers/Microsoft.Storage/storageAccounts/<acct>
```

#### 3. Deploy Spice.ai

Mount [Azure Files](https://learn.microsoft.com/azure/container-apps/storage-mounts-azure-files) for stateful acceleration, inject secrets from [Key Vault](https://learn.microsoft.com/azure/container-apps/manage-secrets#reference-secret-from-key-vault), and configure HTTP ingress on port `8090`:

```bash
az containerapp create \
  --name spiceai \
  --resource-group $RG \
  --environment $ENV \
  --image spiceai/spiceai:2.0.0 \
  --target-port 8090 \
  --ingress external \
  --transport http \
  --user-assigned $IDENTITY_ID \
  --min-replicas 1 --max-replicas 5 \
  --cpu 1.0 --memory 2.0Gi \
  --env-vars \
      SPICED_LOG=INFO \
      AZURE_CLIENT_ID=$(az identity show -g $RG -n spiceai-identity --query clientId -o tsv) \
  --secrets spiceai-key=keyvaultref:https://my-vault.vault.azure.net/secrets/spiceai-key,identityref:$IDENTITY_ID \
  --secret-volume-mount /mnt/secrets
```

To run multiple replicas with shared file-based acceleration, define an [Azure Files storage mount](https://learn.microsoft.com/azure/container-apps/storage-mounts-azure-files) and reference it from the app's revision template, then point file accelerators at the mount path (for example, `duckdb_file: /data/taxi_trips.db`).

#### 4. Scaling rules

Spice.ai is HTTP-driven, so the default [HTTP scale rule](https://learn.microsoft.com/azure/container-apps/scale-app) (concurrent requests per replica) is usually sufficient. For background workloads (refresh schedules, ingestion) that should not scale to zero, set `--min-replicas 1` and add a [custom scale rule](https://learn.microsoft.com/azure/container-apps/scale-app#custom) backed by a CPU or queue metric:

```bash
az containerapp update \
  --name spiceai --resource-group $RG \
  --scale-rule-name http-rule \
  --scale-rule-type http \
  --scale-rule-http-concurrency 50
```

#### 5. Health probes and revisions

Configure the [liveness and readiness probes](https://learn.microsoft.com/azure/container-apps/health-probes) to use `/health` and `/v1/ready`. Container Apps creates a new [revision](https://learn.microsoft.com/azure/container-apps/revisions) on each `update`, supporting traffic splitting between revisions for canary upgrades:

```bash
az containerapp revision set-mode --name spiceai --resource-group $RG --mode multiple
az containerapp ingress traffic set --name spiceai --resource-group $RG \
  --revision-weight latest=90 spiceai--prev=10
```

For more details, see the [Azure Container Apps documentation](https://learn.microsoft.com/azure/container-apps/) and the [Spice.ai Docker Deployment Guide](https://spiceai.org/docs/deployment/docker).

### Azure Container Instances (ACI)

Run Spice.ai as a single container without provisioning a cluster using [Azure Container Instances](https://azure.microsoft.com/products/container-instances). Suitable for development environments, scheduled jobs, and low-traffic deployments.

```bash
az container create \
  --resource-group my-rg \
  --name spiceai \
  --image spiceai/spiceai:latest \
  --cpu 2 --memory 4 \
  --ports 8090 50051 \
  --ip-address public \
  --environment-variables SPICED_LOG=INFO \
  --azure-file-volume-share-name spice-data \
  --azure-file-volume-account-name mystorageacct \
  --azure-file-volume-account-key "<key>" \
  --azure-file-volume-mount-path /data
```

Refer to the [Azure Container Instances documentation](https://learn.microsoft.com/azure/container-instances/) for advanced networking, [virtual network integration](https://learn.microsoft.com/azure/container-instances/container-instances-virtual-network-concepts), and [managed identity](https://learn.microsoft.com/azure/container-instances/container-instances-managed-identity) configuration.

### Azure Virtual Machines

Deploy Spice.ai directly on [Azure Virtual Machines](https://azure.microsoft.com/products/virtual-machines) for maximum control over the environment, GPU access, or large-memory instance types.

1. **Manual VM deployment**:
   - Provision a Linux VM (Ubuntu, Debian, or Azure Linux) with an appropriate [VM size](https://learn.microsoft.com/azure/virtual-machines/sizes).
   - Install [Docker Engine](https://docs.docker.com/engine/install/) and run [Spice.ai as a Docker container](https://spiceai.org/docs/deployment/docker), or install the `spice` binary directly. See the [installation guide](https://spiceai.org/docs/installation).
   - Attach a [managed identity](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview) so Spice can read from Blob Storage, Azure SQL, and Key Vault without static credentials.

2. **Automated deployment with Bicep or Terraform**:
   - Define infrastructure in a [Bicep template](https://learn.microsoft.com/azure/azure-resource-manager/bicep/) or [Terraform configuration](https://registry.terraform.io/providers/hashicorp/azurerm/latest), including the VM, NIC, NSG, virtual network, and managed identity.
   - Use [cloud-init](https://learn.microsoft.com/azure/virtual-machines/linux/using-cloud-init) or a [custom script extension](https://learn.microsoft.com/azure/virtual-machines/extensions/custom-script-linux) to install Docker, pull the [Spice.ai image](https://hub.docker.com/r/spiceai/spiceai), retrieve secrets from [Key Vault](https://azure.microsoft.com/products/key-vault), and start the runtime.
   - Use [VM scale sets](https://learn.microsoft.com/azure/virtual-machine-scale-sets/) for horizontally scaled deployments fronted by an [Azure Load Balancer](https://azure.microsoft.com/products/load-balancer) or [Application Gateway](https://azure.microsoft.com/products/application-gateway).

For detailed guidance, refer to the [Linux on Azure documentation](https://learn.microsoft.com/azure/virtual-machines/linux/), [Bicep documentation](https://learn.microsoft.com/azure/azure-resource-manager/bicep/), and [Azure provider for Terraform](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs).

## Authentication

Most Azure services that Spice connects to accept explicit credentials through component parameters (for example, an `azure_storage_account_key` on the [ABFS connector](../components/data-connectors/abfs)). When explicit credentials are not provided, Spice follows the standard [Azure Identity DefaultAzureCredential](https://learn.microsoft.com/dotnet/api/azure.identity.defaultazurecredential) chain, attempting credentials in this order:

1. **Environment variables**:
   - `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_CLIENT_SECRET` (service principal with secret)
   - `AZURE_CLIENT_CERTIFICATE_PATH` (service principal with certificate)
   - `AZURE_USERNAME`, `AZURE_PASSWORD` (resource owner password — not recommended)

2. **Workload Identity** (AKS): federated tokens injected via `AZURE_FEDERATED_TOKEN_FILE`, `AZURE_AUTHORITY_HOST`, `AZURE_CLIENT_ID`, and `AZURE_TENANT_ID`. See [Workload Identity for AKS](https://learn.microsoft.com/azure/aks/workload-identity-overview).

3. **Managed identity**: System-assigned or user-assigned identities on Azure VMs, AKS, Container Apps, and ACI. See [What are managed identities?](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview).

4. **Azure CLI**: Cached credentials from a local `az login` session. Common during development.

5. **Azure Developer CLI** (`azd`) and **Azure PowerShell**: Used when the corresponding CLI is signed in.

For services with explicit parameters (Blob Storage, Azure SQL, Cosmos DB, OpenAI), prefer named credentials or managed identity over environment variables in production.

:::note[Role assignments]
Regardless of the credential source, the principal must have the appropriate Azure role assignments (for example, `Storage Blob Data Reader` on a storage account, or `SQL DB Contributor` on Azure SQL). When a Spicepod connects to multiple Azure services, the principal must have permissions across all of them.
:::

## Resources

### Documentation

- [Azure Integrations](azure/integrations) — complete list of Azure data connectors, AI models, and supported services
- [Spice.ai Kubernetes Deployment Guide](../deployment/kubernetes) — Helm, Argo CD, and Flux options for AKS

### Azure Marketplace

Spice.ai is not yet published to the [Microsoft Azure Marketplace](https://azuremarketplace.microsoft.com/) (coming soon). In the meantime, deploy using the [`spiceai/spiceai`](https://hub.docker.com/r/spiceai/spiceai) container image or the [Spice Helm chart](https://helm.spiceai.org).
