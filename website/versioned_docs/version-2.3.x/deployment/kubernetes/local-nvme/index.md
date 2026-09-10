---
title: 'Kubernetes - Local NVMe Storage'
sidebar_label: 'Local NVMe Storage'
sidebar_position: 4
description: 'Step-by-step guide to giving Spice acceleration files and query spill a local NVMe volume on Kubernetes — EKS, GKE, AKS, and self-hosted clusters.'
tags:
  - deployment
  - kubernetes
  - spiceai
---

Spice accelerations and query spill run at the per-I/O latency of the disk beneath them, and the fastest disk a Kubernetes node has is its **local NVMe**. This guide walks through giving a Spice deployment a local NVMe volume: which nodes to use, how to mount the disk, how to turn it into a PersistentVolume, and how to point the Helm chart and the Spicepod at it. When you are done, `/data` inside the Spice container is a directory on the node's NVMe, and both acceleration files and spill live there.

Why this matters — and what to do when a node's NVMe is not available — is covered in [Storage](../../../reference/performance-tuning.md#storage) in the Performance Tuning guide. This page is the how-to.

:::tip[Quick path]

| Where Spice runs                    | Fastest route                                                                                                                                                              |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GKE**                             | Create the node pool with `--local-nvme-ssd-block`, apply Google's two provisioner manifests, then deploy Spice with `stateful.storageClass: nvme-ssd-block` ([Step 2](#google-gke), [Step 4](#step-4--deploy-spice-on-the-volume)). |
| **EKS with Karpenter**              | Set `instanceStorePolicy: RAID0` on the `EC2NodeClass` and use an [`emptyDir` on NVMe-backed ephemeral storage](#alternative-a--emptydir-on-nvme-backed-ephemeral-storage). |
| **EKS managed or self-managed nodes** | Mount the disks with `nodeadm` (`localStorage.strategy: Mount`), install the static provisioner, deploy with `stateful.storageClass: local-storage` ([Step 2](#amazon-eks), [Step 3](#step-3--install-the-local-volume-static-provisioner), [Step 4](#step-4--deploy-spice-on-the-volume)). |
| **AKS**                             | Use an NVMe VM size, mount the disks, install the static provisioner ([Step 2](#azure-aks), [Step 3](#step-3--install-the-local-volume-static-provisioner), [Step 4](#step-4--deploy-spice-on-the-volume)). |
| **Self-hosted / bare metal**        | Mount the NVMe under `/mnt/disks`, install the static provisioner, deploy with `stateful.storageClass: local-storage` ([Step 2](#self-hosted-and-bare-metal), [Step 3](#step-3--install-the-local-volume-static-provisioner), [Step 4](#step-4--deploy-spice-on-the-volume)). |
| **A single node, Kind, or a lab**   | Create one [hand-made local PersistentVolume](#alternative-b--a-hand-made-local-persistentvolume) and deploy with `stateful.storageClass: local-storage`.                     |

:::

## How local NVMe volumes work on Kubernetes

Four facts explain everything that follows:

1. **A local PersistentVolume is a directory on one node.** Kubernetes represents a mounted disk on a node as a PersistentVolume of type `local`, pinned to that node with a node affinity. Nothing can move it; a pod that uses it runs on that node.
2. **Binding waits for the pod.** The volume's StorageClass uses `volumeBindingMode: WaitForFirstConsumer`, so the scheduler first picks a node for the pod and then binds the claim to a free local volume on that node, instead of binding first and pinning the pod to wherever the volume happens to be.
3. **A StatefulSet gives each replica its own claim.** The Spice Helm chart's `stateful.enabled: true` renders a StatefulSet with one PersistentVolumeClaim per replica. The claim outlives pod restarts and rollouts, so the acceleration on the node survives them.
4. **The data is ephemeral.** When the node is replaced — a scale-down, an upgrade, a repair, a spot reclamation — its NVMe is wiped with it. The pod is recreated on another node with an empty volume, and Spice refreshes from the source or bootstraps from a [snapshot](../../../features/data-acceleration/snapshots.md). Plan for that from the start; see [Plan for the data being ephemeral](#plan-for-the-data-being-ephemeral).

Something has to turn a disk into a PersistentVolume. The [Local Volume Static Provisioner](https://github.com/kubernetes-sigs/sig-storage-local-static-provisioner) is the standard tool: a DaemonSet that watches a directory on each node (`/mnt/disks` by convention) and publishes every filesystem mounted beneath it as one PersistentVolume. GKE and Azure ship their own variants of the same idea.

## Step 1 — Pick nodes with local NVMe and label them

Local NVMe is a property of the instance type, not something a cluster adds later:

| Platform         | Instance types with local NVMe                                                                                                                                                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AWS**          | Storage-optimized `i4i`, `i7ie`, `i8g`, and the `d`-suffixed general-purpose, compute, and memory families (`m6id`, `m7gd`, `c7gd`, `r7gd`, …). The [instance store](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html) volumes arrive unformatted at launch.                     |
| **Azure**        | Storage-optimized [Lsv3 / Lasv3](https://learn.microsoft.com/azure/virtual-machines/lsv3-series) (`Standard_L8s_v3` and larger) and the v6 families with ephemeral NVMe data disks. Prefer a size with two or more NVMe disks, or a managed OS disk, so the OS does not claim the only NVMe — see [AKS NVMe best practices](https://learn.microsoft.com/azure/aks/best-practices-storage-nvme). |
| **GCP**          | Machine types with [Local SSD](https://cloud.google.com/compute/docs/disks/local-ssd): the `-lssd` variants (`c3-standard-*-lssd`, `n2-standard-*-lssd`) and the `z3` series. Local SSD needs `n1-standard-1` or larger; the default `e2-medium` does not support it.                                     |
| **Self-hosted**  | Any node with an NVMe device (`lsblk` shows it as `nvme0n1`, `nvme1n1`, …).                                                                                                                                                                                                                             |

Give those nodes a label so Spice — and only Spice — schedules onto them. The examples below use `local-nvme=true`; add a taint as well if the node pool should be reserved:

```bash
# Node pools usually take labels and taints at creation time:
#   eksctl / EKS managed node groups: --node-labels local-nvme=true
#   gcloud container node-pools create: --node-labels=local-nvme=true (GKE also sets cloud.google.com/gke-local-nvme-ssd=true)
#   az aks nodepool add: --labels local-nvme=true
# On an existing node:
kubectl label node <node-name> local-nvme=true
kubectl taint node <node-name> local-nvme=true:NoSchedule   # optional
```

## Step 2 — Format and mount the NVMe on each node

The provisioner in Step 3 publishes **mounted filesystems**, so each node needs its NVMe formatted (`ext4` or `xfs`) and mounted under a discovery directory, one mount point per volume — `/mnt/disks/nvme0`, `/mnt/disks/nvme1`, and so on. Mount with `noatime`. How to arrange that depends on the platform.

### Amazon EKS

**Karpenter.** Set the instance store policy on the `EC2NodeClass`:

```yaml
apiVersion: karpenter.k8s.aws/v1
kind: EC2NodeClass
spec:
  instanceStorePolicy: RAID0
```

Karpenter formats the instance store volumes as a RAID 0 array, mounts it at `/mnt/k8s-disks/0`, and uses it as the filesystem for the kubelet and containerd, so the node's allocatable `ephemeral-storage` becomes the size of the instance store — see [`spec.instanceStorePolicy`](https://karpenter.sh/docs/concepts/nodeclasses/#specinstancestorepolicy). With the disks serving as ephemeral storage, the simplest way to use them is an `emptyDir` — skip to [Alternative A](#alternative-a--emptydir-on-nvme-backed-ephemeral-storage). To publish PersistentVolumes instead, bind-mount a subdirectory of `/mnt/k8s-disks/0` into `/mnt/disks` from user data and continue with Step 3.

**Managed and self-managed node groups (Amazon Linux 2023).** `nodeadm` mounts the instance store for you. In the node's `NodeConfig` user data:

```yaml
apiVersion: node.eks.aws/v1alpha1
kind: NodeConfig
spec:
  instance:
    localStorage:
      strategy: Mount # one filesystem per disk, mounted at /mnt/k8s-disks/0, /1, ...
```

`Mount` formats each instance store volume and mounts it under `/mnt/k8s-disks/`; use that path as the provisioner's `hostDir` in Step 3. The `RAID0` strategy instead combines the disks into one filesystem for the kubelet and containerd, which is the `emptyDir` route of Alternative A. See the [`nodeadm` API reference](https://awslabs.github.io/amazon-eks-ami/nodeadm/doc/api/).

**Bottlerocket.** Bottlerocket's bootstrap commands `apiclient ephemeral-storage init` and `apiclient ephemeral-storage bind --dirs /var/lib/containerd /var/lib/kubelet /var/log/pods` put the kubelet and containerd directories on the instance store, which is again the `emptyDir` route; Karpenter's `RAID0` policy does the same on Bottlerocket nodes. See [Bottlerocket bootstrap commands](https://bottlerocket.dev/en/os/1.47.x/concepts/bootstrap-commands/).

### Google GKE

Create the node pool with Local SSD attached as raw block devices:

```bash
gcloud container node-pools create spice-nvme \
  --cluster CLUSTER_NAME --location LOCATION \
  --machine-type c3-standard-8-lssd \
  --local-nvme-ssd-block \
  --node-labels=local-nvme=true
```

First- and second-generation machine types take a disk count (`--local-nvme-ssd-block count=N`); third- and fourth-generation types carry a fixed number of Local SSDs, so the flag stands alone. GKE labels the nodes `cloud.google.com/gke-local-nvme-ssd=true`.

Then apply the two manifests from Google's [raw block Local SSD guide](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/persistent-volumes/local-ssd-raw): `gke-daemonset-raid-disks.yaml` assembles the Local SSDs into a RAID 0 array, formats it, and mounts it; `gke-nvme-ssd-block-raid.yaml` installs the static provisioner and a StorageClass named **`nvme-ssd-block`** with `WaitForFirstConsumer` binding. That covers Step 3, so continue with [Step 4](#step-4--deploy-spice-on-the-volume) using `stateful.storageClass: nvme-ssd-block`.

:::warning
GKE node upgrades and auto-repair delete the underlying VM, and Local SSD data with it. Treat every upgrade as a node replacement — see [Plan for the data being ephemeral](#plan-for-the-data-being-ephemeral).
:::

### Azure AKS

Add a node pool on an NVMe VM size:

```bash
az aks nodepool add --resource-group RG --cluster-name CLUSTER \
  --name spicenvme --node-vm-size Standard_L16s_v3 \
  --labels local-nvme=true
```

AKS does not format the ephemeral NVMe disks. Two ways to make them usable:

- **Static provisioner (works with the Helm chart).** Run a privileged DaemonSet on the pool that formats the NVMe devices and mounts them under `/mnt/disks` — Google's [`gke-daemonset-raid-disks.yaml`](https://github.com/kubernetes-sigs/sig-storage-local-static-provisioner/blob/master/examples/gke-daemonset-raid-disks.yaml) is a good template (it finds the NVMe devices, builds a RAID 0 array, runs `mkfs.ext4`, and mounts the result). Then continue with [Step 3](#step-3--install-the-local-volume-static-provisioner).
- **Azure Container Storage.** [Azure Container Storage](https://learn.microsoft.com/azure/storage/container-storage/use-container-storage-with-local-disk) (version 2) exposes local NVMe through a StorageClass named `local-csi` (provisioner `localdisk.csi.acstor.io`, `WaitForFirstConsumer`), striped across the VM's NVMe disks. It hands out generic ephemeral volumes by default; a PersistentVolumeClaim needs the annotation `localdisk.csi.acstor.io/accept-ephemeral-storage: "true"` on its claim template. The Spice Helm chart's claim template cannot carry that annotation, so use `local-csi` with a StatefulSet you write yourself or with the Spice.ai Enterprise Operator's [`SpicepodSet`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodset), or mount it through the chart's `volumes` as a generic ephemeral volume (pod-lifetime, like Alternative A).

### Self-hosted and bare metal

On each NVMe node, once per disk:

```bash
sudo mkfs.ext4 -F /dev/nvme1n1
sudo mkdir -p /mnt/disks/nvme1
echo '/dev/nvme1n1 /mnt/disks/nvme1 ext4 defaults,noatime,nofail 0 2' | sudo tee -a /etc/fstab
sudo mount /mnt/disks/nvme1
```

Use `lsblk -o NAME,SIZE,MODEL,MOUNTPOINT` to identify the device and make sure it is not the root disk. To split one large NVMe into several PersistentVolumes, mount it once elsewhere and bind-mount subdirectories into `/mnt/disks` — the provisioner accepts bind mounts, though volumes sharing a disk do not get capacity isolation from each other.

## Step 3 — Install the Local Volume Static Provisioner

Skip this step on GKE (Google's manifest includes it) and for the `emptyDir` route.

**Create the StorageClass.** `kubernetes.io/no-provisioner` means "volumes are created out of band"; `WaitForFirstConsumer` is required for local volumes:

```yaml
# local-storage-class.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-storage
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Delete
```

```bash
kubectl apply -f local-storage-class.yaml
```

**Install the provisioner** with values that name the class and the discovery directory from Step 2:

```yaml
# local-static-provisioner-values.yaml
classes:
  - name: local-storage # must match the StorageClass name
    hostDir: /mnt/disks # each filesystem mounted under this directory becomes one PersistentVolume
    volumeMode: Filesystem
    fsType: ext4
    namePattern: '*'
nodeSelector:
  local-nvme: 'true' # run the discovery DaemonSet only on the NVMe nodes
tolerations: # add if the pool is tainted
  - key: local-nvme
    operator: Exists
    effect: NoSchedule
```

```bash
helm repo add sig-storage-local-static-provisioner \
  https://kubernetes-sigs.github.io/sig-storage-local-static-provisioner
helm repo update
helm install local-static-provisioner sig-storage-local-static-provisioner/local-static-provisioner \
  --namespace local-static-provisioner --create-namespace \
  -f local-static-provisioner-values.yaml
```

On EKS nodes mounted by `nodeadm`, set `hostDir: /mnt/k8s-disks`.

**Check that the volumes appeared** — one `Available` PersistentVolume per mounted disk, each pinned to its node:

```bash
kubectl get pv -o custom-columns=NAME:.metadata.name,CAP:.spec.capacity.storage,STATUS:.status.phase,CLASS:.spec.storageClassName,NODE:.spec.nodeAffinity.required.nodeSelectorTerms[0].matchExpressions[0].values[0]
```

If nothing shows up, check the provisioner's DaemonSet logs on an NVMe node: the usual causes are a disk that is not mounted under `hostDir`, or a `nodeSelector` that does not match the node's labels.

With `reclaimPolicy: Delete`, deleting a claim makes the provisioner wipe the volume's contents and publish the PersistentVolume again for the next claim.

## Step 4 — Deploy Spice on the volume

Enable the StatefulSet in the Helm chart, name the StorageClass, pin the pods to the NVMe nodes, and put every acceleration path plus the spill directory under the mount:

```yaml
# values.yaml
stateful:
  enabled: true
  storageClass: local-storage # nvme-ssd-block on GKE
  size: 800Gi # the claim must fit inside one NVMe volume — check the PV capacity from Step 3
  mountPath: /data

nodeSelector:
  local-nvme: 'true' # or cloud.google.com/gke-local-nvme-ssd: 'true' on GKE
tolerations: # only if the node pool is tainted
  - key: local-nvme
    operator: Exists
    effect: NoSchedule

spicepod:
  name: app
  version: v1
  kind: Spicepod
  runtime:
    query:
      temp_directory: /data/tmp # query, compaction, and DuckDB spill on the same NVMe
  datasets:
    - from: postgres:public.orders
      name: orders
      acceleration:
        engine: cayenne
        mode: file
        refresh_mode: changes
        primary_key: id
        params:
          cayenne_file_path: /data/orders/
          cayenne_metadata_dir: /data/metadata
    - from: postgres:public.customers
      name: customers
      acceleration:
        engine: duckdb
        mode: file
        params:
          duckdb_file: /data/customers.duckdb
```

```bash
helm upgrade --install spiceai spiceai/spiceai -n spiceai --create-namespace -f values.yaml
```

Notes on the values:

- **One claim per replica, one volume per claim.** Running three replicas needs three local volumes on nodes that match the `nodeSelector`; a replica with nowhere to bind stays `Pending`.
- **`stateful.size` must fit the volume.** A local PersistentVolume's capacity is the size of the mounted filesystem; a claim larger than any free volume never binds.
- **The spill directory is a subdirectory of the same volume.** The runtime creates `runtime.query.temp_directory` at startup when its parent exists (`/data/tmp` under the `/data` mount needs no init container); keep it on the NVMe with the data rather than leaving it at the default, which lands on the node's root disk. Size the volume for the data plus 2–4× the largest spillable input — see [Spill-to-Disk](../../../reference/performance-tuning.md#spill-to-disk-and-the-temporary-directory).
- **Permissions.** The chart runs Spice as user `65534` with `fsGroup: 65534`, and local PersistentVolumes honor `fsGroup`, so the mount is writable without further setup. A `hostPath` volume does not apply `fsGroup`; if you use one, `chown 65534:65534` the directory on the node.
- **Spice.ai Enterprise.** The Operator's [`SpicepodSet`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodset) manages the per-replica StatefulSets and claims for you; give it the same StorageClass.

## Step 5 — Verify it is on NVMe

```bash
# Claims bound, each to a local volume
kubectl get pvc -n spiceai
kubectl get pv

# The mount inside the container is the NVMe filesystem, with the expected free space
kubectl exec -n spiceai spiceai-0 -- df -h /data
```

Spice detects the storage tier itself. For a Cayenne dataset, the `cayenne_data_storage_class` and `cayenne_metastore_storage_class` gauges report `0` for local SSD (`1` is network-attached, `2` tmpfs, `3` unknown), and the `Cayenne auto-tuned config` startup log line names the detected classes. If a table reports `3` on a node you know has NVMe — a container runtime that hides the block-device metadata, for example — set `storage_profile: local_ssd` on the acceleration; see [`acceleration.storage_profile`](../../../reference/spicepod/datasets.md#accelerationstorage_profile) and [Storage tier detection](../../../components/data-accelerators/cayenne/performance.md#storage-tier-detection).

## Plan for the data being ephemeral

A local volume lives exactly as long as its node. Decide up front how a replacement pod gets its data back:

- **Refresh from the source** — the default. Nothing to configure; the new pod re-materializes every dataset. Fine when a refresh is fast enough for your recovery objective.
- **Bootstrap from snapshots** (Spice.ai Enterprise) — the pattern this storage was designed for. Each refresh uploads the acceleration file to object storage, and a pod that starts with an empty `/data` downloads the newest snapshot instead of refreshing:

  ```yaml
  snapshots:
    enabled: true
    location: s3://my-bucket/spice-snapshots/
    params:
      s3_auth: iam_role

  datasets:
    - from: postgres:public.orders
      name: orders
      acceleration:
        engine: cayenne
        mode: file
        snapshots: enabled
        params:
          cayenne_file_path: /data/orders/
  ```

  See [Acceleration Snapshots](../../../features/data-acceleration/snapshots.md), and [Read/Write Separation](../../read-write-separation.md) for the pattern where one ingesting cluster writes snapshots that many read replicas on local NVMe bootstrap from.

- **Cayenne on S3 Express One Zone** — keeps Cayenne data files off the node entirely, at single-digit-millisecond latency; see [Storage](../../../reference/performance-tuning.md#object-storage).

Two operational details of local volumes on node replacement:

- **A claim bound to a vanished node keeps its pod `Pending`.** The StatefulSet's claim still references a PersistentVolume whose node no longer exists, so the replacement pod cannot schedule. Delete the claim (and the stale PersistentVolume) and the StatefulSet recreates the pod with a fresh claim on a live node. The provisioner project's [node cleanup controller](https://github.com/kubernetes-sigs/sig-storage-local-static-provisioner/tree/master/deployment/kubernetes/node-cleanup-controller) automates exactly this.
- **Scaling down or uninstalling leaves the claims behind.** StatefulSet claims are never deleted automatically; delete them yourself to release the volumes (with `reclaimPolicy: Delete`, the provisioner then wipes and republishes them).

## Alternative A — `emptyDir` on NVMe-backed ephemeral storage

When the node's own ephemeral storage is on the NVMe — Karpenter's `instanceStorePolicy: RAID0`, `nodeadm`'s `RAID0` strategy, Bottlerocket's `ephemeral-storage` bootstrap, or a GKE node pool created with `--ephemeral-storage-local-ssd` — a plain `emptyDir` already lands on NVMe, with no PersistentVolumes to manage. The trade-off is that the volume lives only as long as the **pod**: every restart or rollout starts from empty, so this route suits read replicas that bootstrap from snapshots, or datasets that refresh quickly.

Use the chart's `volumes` and `volumeMounts` passthroughs with `stateful.enabled` left at `false`:

```yaml
# values.yaml
nodeSelector:
  local-nvme: 'true'
volumes:
  - name: data
    emptyDir:
      sizeLimit: 500Gi # evicts the pod rather than filling the node's disk
volumeMounts:
  - name: data
    mountPath: /data
spicepod:
  runtime:
    query:
      temp_directory: /data/tmp
  # datasets with acceleration paths under /data, as in Step 4
```

Never use `emptyDir` with `medium: Memory` here: its files count against the container's memory limit, which turns a spill into an OOM kill.

## Alternative B — a hand-made local PersistentVolume

For a single node, a Kind cluster, or a lab, skip the provisioner and declare the volume yourself. The node affinity is mandatory:

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: spice-nvme-node1
spec:
  capacity:
    storage: 900Gi
  accessModes: ['ReadWriteOnce']
  persistentVolumeReclaimPolicy: Retain
  storageClassName: local-storage
  local:
    path: /mnt/disks/nvme1 # the mount from Step 2
  nodeAffinity:
    required:
      nodeSelectorTerms:
        - matchExpressions:
            - key: kubernetes.io/hostname
              operator: In
              values: ['node1']
```

Create the `local-storage` StorageClass from Step 3, apply this PersistentVolume, and deploy with the Step 4 values. With `Retain`, the volume is not reused after its claim is deleted until you clear the directory and remove the `claimRef` from the PersistentVolume.

## Troubleshooting

| Symptom                                                                 | Likely cause                                                                                   | Resolution                                                                                                                       |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Pod `Pending` with `didn't find available persistent volumes to bind`   | No free local volume on a node that matches the `nodeSelector`, or the claim is larger than every free volume | `kubectl get pv` — check capacity, status, and node; verify the disk is mounted under `hostDir` and the node carries the label.  |
| Pod `Pending` after a node was replaced                                 | The claim is bound to a volume on the vanished node.                                           | Delete the claim and stale volume; consider the node cleanup controller.                                                        |
| `permission denied` writing to `/data`                                  | `hostPath` volume, or a directory owned by root on a volume that does not apply `fsGroup`.      | Use a `local` PersistentVolume, or `chown 65534:65534` the directory on the node.                                                |
| PersistentVolume stuck in `Released`                                    | Cleanup is running, or the disk is gone (node replaced).                                       | Wait for the provisioner to republish it; if the node is gone, delete the PersistentVolume object.                                |
| `cayenne_data_storage_class` reports `3` (unknown) on an NVMe node      | The container cannot read the block-device metadata under `/sys`.                              | Set `storage_profile: local_ssd` on the acceleration.                                                                            |
| Volume fills during large queries                                       | Spill (`/data/tmp`) sharing the volume with the data, sized without spill headroom.            | Size the volume for data plus 2–4× the largest spillable input; a spill that runs out of space fails the query with `ResourcesExhausted`. |
| Data gone after a cluster upgrade                                       | Expected: upgrades replace nodes and their NVMe.                                               | Enable snapshots, or accept a refresh; on GKE, schedule upgrades deliberately.                                                   |

## Related Documentation

- [Kubernetes Deployment](../index.md) and [Helm](../helm/index.md#stateful-configuration) — the chart's stateful mode and [storage class recommendations](../helm/index.md#storage-class-recommendations)
- [AWS](../../aws/index.md), [Azure](../../azure/index.md), and [GCP](../../gcp/index.md) deployment guides — platform setup around this page
- [Storage](../../../reference/performance-tuning.md#storage) in the Performance Tuning guide — why local NVMe, and the fallbacks
- [Acceleration Snapshots](../../../features/data-acceleration/snapshots.md) — fast cold starts on ephemeral storage
- [Read/Write Separation](../../read-write-separation.md) — read replicas on local NVMe bootstrapped from snapshots
- [Local Volume Static Provisioner](https://github.com/kubernetes-sigs/sig-storage-local-static-provisioner) — upstream documentation, operations guide, and examples
