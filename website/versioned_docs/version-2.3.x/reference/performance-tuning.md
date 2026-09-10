---
title: 'Performance Tuning'
sidebar_label: 'Performance Tuning'
sidebar_position: 33
description: 'Comprehensive guide to optimizing query performance, acceleration, storage, spill-to-disk, and resource utilization in Spice deployments.'
keywords:
  - performance
  - tuning
  - optimization
  - cayenne
  - duckdb
  - acceleration
  - storage
  - nvme
  - ebs
  - spill
pagination_prev: null
pagination_next: null
---

This guide provides recommendations for optimizing Spice performance across data acceleration, storage, query execution, caching, and resource allocation.

## Quick Recommendations

The settings that matter most, in the order they are usually worth checking:

| Concern                                  | Recommendation                                                                                                                                     | Details                                                                        |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Accelerator choice                       | `cayenne` for datasets of 10 GB and above; `duckdb` (file mode) for 1–10 GB with complex SQL; `arrow` for small, latency-critical data              | [Accelerator Selection](#accelerator-selection)                                |
| Where acceleration data lives            | **Local NVMe or SSD**, for its per-I/O latency above all. Network block storage (EBS and equivalents) is a durable fallback. NAS, NFS, and SMB shares are not recommended. | [Storage](#storage)                                                            |
| Where queries spill                      | Set `runtime.query.temp_directory` to a directory on local NVMe/SSD with ample free space, never the root volume or a RAM-backed mount              | [Spill-to-Disk and the Temporary Directory](#spill-to-disk-and-the-temporary-directory) |
| Memory                                   | Leave `runtime.query.memory_limit` unset and size the container; bound bursts with `runtime.query.max_concurrent_queries`                          | [Query Memory Management](#query-memory-management)                            |
| CPU                                      | Set a CPU request and no CPU limit; use `runtime.cpu.cores` to bound thread pools without throttling                                                | [Resource Allocation](#resource-allocation)                                    |
| Repeated queries                         | Enable the SQL results cache with `tiny_lfu` eviction and a `stale_while_revalidate_ttl`                                                            | [Caching Configuration](#caching-configuration)                                |
| Data layout                              | Sort accelerated data by the columns queries filter on so zone maps and segment statistics prune scans                                             | [File Format Filtering and Optimization](#file-format-filtering-and-optimization) |
| Refresh cost                             | Prefer `append` or `changes` over `full` for large datasets; set `time_column` and `time_partition_column`                                          | [Data Refresh Optimization](#data-refresh-optimization)                        |
| Observability                            | Capture plans for slow queries with task history; watch the query pool, resident memory, storage, and cache metrics                                 | [Monitoring and Profiling](#monitoring-and-profiling)                          |

## Accelerator Selection

Choose the appropriate [Data Accelerator](../components/data-accelerators) based on dataset characteristics and query patterns.

| Scenario                                 | Recommended Accelerator    | Key Configuration                                                     |
| ---------------------------------------- | -------------------------- | --------------------------------------------------------------------- |
| Small datasets (under 1 GB), low latency | `arrow`                    | Default in-memory                                                     |
| Small datasets (1-10 GB), complex SQL    | `duckdb` with `mode: file` | Set `duckdb_memory_limit`; place `duckdb_file` on local NVMe/SSD      |
| Datasets 10 GB and above (up to 1+ TB)   | `cayenne`                  | Place data files on local NVMe/SSD; tune cache parameters; needs 1/3 to 1/2 the memory of `duckdb` |
| Write-heavy workloads                    | `cayenne` with `zstd`      | Set `cayenne_compression_strategy: zstd`                              |
| Point lookups, large datasets            | `cayenne`                  | Vortex provides [100x faster random access](https://bench.vortex.dev) |
| Point lookups, small-medium datasets     | `arrow` with hash index    | Set a `primary_key` to auto-enable the hash index (experimental, v1.11.0-rc.2+) |
| Point lookups with explicit indexes      | `duckdb` or `sqlite`       | Configure indexes                                                     |

Every file-mode engine — Cayenne, DuckDB, SQLite, and Turso — is only as fast as the storage its files sit on. Decide where those files and the query spill directory live before tuning anything else; see [Storage](#storage).

## Storage

Spice is an in-process engine: accelerated data, the metadata that indexes it, and the intermediate results of queries that outgrow memory all live on whatever storage the process can reach. That storage is on the critical path of every query that is not served from RAM, and of every refresh, compaction, and spill.

**Recommendation: store acceleration data and temporary/spill files on local NVMe or SSD.** Network-attached block storage (Amazon EBS, Azure Managed Disks, GCP Persistent Disk and Hyperdisk) works as a durable fallback with tuning; network file systems (NAS, NFS, SMB, EFS, Azure Files) are not recommended for either.

### Why storage matters

Each engine has a different I/O profile, and none of them is friendly to high-latency storage:

| Component                          | I/O pattern                                                                                                                                                           | Sensitive to                          |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Spice Cayenne (Vortex data files)  | Random reads of individual segments — Vortex is built for random access, so a selective query issues many small reads rather than one sequential scan. Compaction rewrites files in the background. | Read latency, IOPS, write bandwidth   |
| Cayenne metastore (SQLite)         | Many small synchronous writes with `fsync` on every commit; read on every plan.                                                                                        | Write latency                         |
| DuckDB (`mode: file`)              | Buffer-managed block reads and writes; checkpoints and index serialization; its own spill files for sorts, joins, and aggregates.                                      | Latency and throughput                |
| SQLite and Turso (`mode: file`)    | Page-cache misses become synchronous reads; WAL writes with `fsync`; a single writer per file.                                                                          | Latency, locking semantics            |
| DataFusion spill (all engines)     | Large sequential writes and reads of Arrow IPC batches while a sort, aggregate, or sort-merge join runs beyond `runtime.query.memory_limit`.                             | Throughput, free space                |
| Snapshots                          | Whole-file copies to and from object storage on bootstrap and after refreshes.                                                                                        | Throughput                            |

**Latency matters more than IOPS.** A query's critical path is a chain of dependent I/Os — read a footer, then the segments it points to, then the next batch; write a spill batch, wait for it, write the next — and each one waits for the device before the operator can continue. Per-I/O latency therefore sets how long a single query, refresh, or spill takes; IOPS and bandwidth only set how many can proceed at once before they start queueing behind each other. A volume with generous provisioned IOPS but millisecond latency still runs a dependent read chain an order of magnitude slower than NVMe, and no amount of additional IOPS closes that gap.

| Medium                                                     | Typical per-I/O latency                    |
| ---------------------------------------------------------- | ------------------------------------------ |
| Local NVMe / SSD                                           | ~100 µs                                    |
| `io2` Block Express, Premium SSD v2, Hyperdisk Extreme     | Under 1 ms                                 |
| `gp3` / `gp2`, standard managed disks                      | Single-digit milliseconds                  |
| S3 Express One Zone                                        | Single-digit milliseconds                  |
| NFS, SMB, EFS, Azure Files                                 | Milliseconds plus protocol overhead, highly variable |

Segment and page caches absorb some of the difference for hot data, but cold scans, refreshes, and spills run at the latency of the medium.

### Recommended layout

Put every locally stored artifact on one local NVMe/SSD file system, in separate directories, and point the runtime at them explicitly rather than relying on the defaults (the working directory's `.spice/data` for acceleration files, and the operating system's temporary directory for spill):

```text
/nvme/spice/
├── data/        # acceleration files: duckdb_file, sqlite_file, turso_file, cayenne_file_path
├── metadata/    # Cayenne metastore (cayenne_metadata_dir)
└── tmp/         # runtime.query.temp_directory — query, compaction, and DuckDB spill
```

```yaml
runtime:
  query:
    temp_directory: /nvme/spice/tmp

datasets:
  - from: postgres:public.orders
    name: orders
    acceleration:
      engine: cayenne
      mode: file
      params:
        cayenne_file_path: /nvme/spice/data/orders/
        cayenne_metadata_dir: /nvme/spice/metadata

  - from: postgres:public.customers
    name: customers
    acceleration:
      engine: duckdb
      mode: file
      params:
        duckdb_file: /nvme/spice/data/customers.duckdb
```

Keep spill and data on the **same fast device** rather than moving spill to a slower one to "protect" the data volume — a spill that runs slowly holds the query's memory reservation for longer and delays every query behind it. When a host has two NVMe devices, put spill on one and data on the other so a large spill does not compete with scans for the device's queue.

### Storage tiers compared

| Tier                                                                   | Typical latency          | Durability                                                   | Acceleration data                        | Spill / temp                              |
| ---------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------ | ---------------------------------------- | ----------------------------------------- |
| **Local NVMe instance store** (AWS `i`/`d` families, Azure Lsv3, GCP Local SSD) | ~100 µs                  | Lost when the instance stops, is replaced, or its disk fails | **Recommended**                          | **Recommended**                           |
| **Local SSD, bare metal**                                              | ~100 µs                  | Survives restarts; single host                               | **Recommended**                          | **Recommended**                           |
| **RAM-backed (`tmpfs`)**                                               | Memory speed             | Lost on restart                                              | Only when data is small and RAM abundant | Not recommended — defeats the point of spilling |
| **Network block storage** (EBS, Azure Managed Disks, GCP PD/Hyperdisk) | Sub-millisecond (`io2`, Premium SSD v2, Hyperdisk Extreme) to single-digit ms (`gp3`) | Survives instance replacement            | Acceptable with provisioned IOPS; Spice adapts | Acceptable; never the small root volume |
| **Network file systems** (NFS, SMB/CIFS, EFS, Azure Files, Filestore)  | Milliseconds, variable   | Shared and durable                                           | **Not recommended**                      | **Not recommended**                       |
| **Object storage**                                                     | Single-digit ms (S3 Express One Zone) to tens of ms (S3 Standard) | Durable, shared                          | Cayenne data files on S3 Express only; cold tier and snapshots on standard S3 | Not supported |
| **HDD**                                                                | ~10 ms seeks             | Survives restarts                                            | Not recommended                          | Not recommended                           |

### How Spice adapts to the storage medium

File-mode accelerators detect the class of storage behind their file path at registration and tune themselves for it. The result is the acceleration's [`storage_profile`](spicepod/datasets#accelerationstorage_profile), which defaults to `auto`:

- **`auto`** reads `/proc/self/mountinfo` on Linux, finds the mount that holds the (nearest existing ancestor of the) file path, and classifies it: `tmpfs`/`ramfs` mounts resolve to `tmpfs`; `nfs`, `nfs4`, `cifs`, `smbfs`, and `smb3` mounts resolve to `ebs` (the network-attached tier); block devices that identify as Amazon Elastic Block Store or as Microsoft/Azure virtual disks resolve to `ebs`; devices that identify as Amazon EC2 NVMe instance storage, NVMe devices in general, and any non-rotational device resolve to `local_ssd`. Device-mapper, LVM, and software-RAID volumes are resolved through their underlying devices. Anything else — including rotating disks and every platform other than Linux — resolves to `unknown`, which applies the engine defaults.
- **`local_ssd`**, **`ebs`**, and **`tmpfs`** override detection. Set one when detection cannot see the device: a network block device that is not EBS or an Azure disk (GCP Persistent Disk and Hyperdisk, Ceph RBD, SAN LUNs, OpenStack Cinder, and similar volumes present as ordinary non-rotational disks and resolve to `local_ssd`), a container runtime that hides `/sys` block metadata, or a non-Linux host.

Each engine applies its own adjustments to the resolved profile:

| Engine  | `ebs` (network-attached block storage, NFS, SMB)                                                                                                                                                    | `tmpfs`                                              | `local_ssd` / `unknown`   |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------- |
| Cayenne | Target file size pinned at 256 MB; the tuner treats the medium as the slow tier — it flushes larger inline batches to amortize metastore commits, classifies the table as I/O-bound at half the latency, drains memory buffers earlier, and withholds write shards sooner; compaction output is written with `O_DIRECT`, preallocation, and a final `fsync`, bypassing the page cache; the aggregate encode concurrency across tables is capped from the volume's write bandwidth (the instance's EBS baseline on EC2, otherwise the measured throughput) | Target file size 64 MB; no slow-tier bias           | Engine defaults; no bias  |
| DuckDB  | Connection pool floor of 4 (instead of 10); `checkpoint_threshold` raised to 256 MiB so each checkpoint amortizes more I/O                                                                          | `checkpoint_threshold` raised to 1 GiB              | Engine defaults           |
| SQLite  | `busy_timeout` 15 s (instead of 5 s); page cache ~200 MB (instead of ~20 MB); 256 MiB of memory-mapped I/O                                                                                          | Engine defaults                                      | Engine defaults           |
| Turso   | Page cache ~200 MB                                                                                                                                                                                  | Engine defaults                                      | Engine defaults           |

Within the network-attached tier, Cayenne also measures the medium rather than treating every volume alike. At registration it writes an 8 MiB probe file to the data directory and to the metastore directory, syncs it, and records the sequential write throughput, once per distinct volume. A volume that measures at or below roughly 125 MiB/s (a baseline `gp3` volume) receives the full slow-tier bias; one that measures at or above roughly 1 GiB/s (local NVMe, or a heavily provisioned `io2` volume) receives none, with a linear scale in between. On AWS EC2 it also queries the instance metadata service once to learn whether the instance is a burstable T-family type and what its baseline EBS bandwidth is, and caps the process-wide encode concurrency so parallel writers cannot oversubscribe the instance's EBS pipe. See [Storage](../components/data-accelerators/cayenne/performance#storage) in the Cayenne performance guide.

The detected tier is observable. Cayenne reports `cayenne_data_storage_class` and `cayenne_metastore_storage_class` per table (`0` local SSD, `1` network-attached, `2` tmpfs, `3` unknown) and the probe results as `cayenne_data_storage_write_mibps` and `cayenne_metastore_storage_write_mibps`. A table that reports `1` on a host you believe has local NVMe — or `0` on one you know is on Persistent Disk — is the signal to set `storage_profile` explicitly.

### Local NVMe and SSD

Local NVMe is the recommended medium for both acceleration data and spill. It delivers the lowest latency and highest IOPS available on any platform, it is included in the instance price on the cloud families that offer it, and it is the only tier on which Cayenne's random-access reads and DuckDB's buffer manager run at their design speed.

**It is ephemeral.** Cloud instance storage is physically attached to the host and lives only as long as the instance does:

- On AWS, data on an [instance store volume](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-store-lifetime.html) persists across a reboot but is cryptographically erased when the instance is stopped, hibernated, or terminated, when its instance type changes, and when the underlying disk fails. Instance store volumes cannot be attached after launch or moved between instances.
- On Azure, the VM's temporary disk and the local NVMe on [Lsv3 / Lasv3 and the `d`-suffixed families](../deployment/azure) are lost on stop-deallocate, resize, and host redeployment.
- On GCP, [Local SSD](https://cloud.google.com/compute/docs/disks/local-ssd) data is lost when the VM is stopped or deleted.
- On Kubernetes, a node replacement — a scale-down, an upgrade, a spot reclamation — takes every local volume on that node with it.

Plan for the loss rather than trying to prevent it:

| Strategy                                                                                                  | When to use                                                                                                          |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Re-materialize from the source on restart**                                                              | Refresh from the source is fast enough for the recovery objective. The default behavior; nothing to configure.         |
| **[Acceleration snapshots](../features/data-acceleration/snapshots)** (Spice.ai Enterprise)                | Restarts must be fast and the source is slow or expensive to re-read. A new pod bootstraps from the latest snapshot in object storage instead of refreshing. Designed for exactly this pairing. |
| **[Read/write separation](../deployment/read-write-separation)**                                           | Many read replicas on ephemeral storage bootstrapped from snapshots written by one ingesting cluster.                   |
| **Cayenne data on [S3 Express One Zone](../components/data-accelerators/cayenne#aws-s3-express-one-zone-storage)** | Cayenne accelerations that must survive instance replacement without a snapshot round trip. Adds single-digit-millisecond latency per cold read; metadata stays local. |
| **Cayenne [cold object-store tier](../components/data-accelerators/cayenne#cold-object-store-tier)**        | Tables larger than local NVMe capacity: recent data stays on NVMe, older data graduates to standard S3.                |

**Capacity planning.** Size the volume for the data, its transient copies, and spill together:

| Item                                   | Planning figure                                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Cayenne data files                     | 0.25–0.5× raw data size (Vortex with `btrblocks`), plus room for a compaction pass to hold the old and new copies of a file set at once |
| Cayenne metastore                      | ~10 MB per 1,000 files, plus its WAL                                                                                                        |
| DuckDB file                            | Roughly the compressed data size, plus the previous copy of the data on every `refresh_mode: full` until [`on_full_refresh`](../components/data-accelerators/duckdb#bounding-acceleration-file-growth) reclaims it |
| SQLite / Turso file                    | 1.2–1.5× raw data size (row-oriented, little compression)                                                                                   |
| Query spill (`runtime.query.temp_directory`) | 2–4× the largest join or sort input that can exceed memory; DataFusion stops spilling at 100 GB in total, see [Spill-to-Disk](#spill-to-disk-and-the-temporary-directory) |
| DuckDB spill                           | DuckDB caps its own temporary files at 90% of the volume's free space; budget for the largest out-of-core sort or join                      |
| Headroom                               | Keep at least 20% free. Cayenne warns at startup when a data or metastore volume has under 10% or under 2 GiB free, because a full volume fails CDC ingestion. |

**File system and mount guidance.** Use `ext4` or `xfs` (DuckDB [performs best on XFS](https://duckdb.org/docs/stable/guides/performance/environment)). Mount with `noatime`. Mount the device at its own path rather than sharing the root file system: the root volume on a cloud instance is usually a small network-attached disk, and a spill directory that silently lands there is the most common cause of a large query failing with `ResourcesExhausted` while memory was still available. When an instance has several NVMe devices, either dedicate one to spill or stripe them (RAID 0) for capacity and throughput — the array is no less durable than its members, which are ephemeral anyway.

### Amazon EBS and network block storage

Amazon EBS, Azure Managed Disks, and GCP Persistent Disk and Hyperdisk are block devices reached over the network. They survive instance replacement, can be snapshotted, and can be detached and reattached elsewhere, which makes them the right choice when an acceleration must outlive its host and a snapshot-based bootstrap is not available. The cost is latency first — every cache miss and every synchronous write is a network round trip of a millisecond or more, against tens of microseconds on NVMe — and, second, the throughput ceilings that both the volume and the instance impose.

**Characteristics that affect Spice**, using EBS as the reference:

- **Per-volume limits.** A [`gp3`](https://docs.aws.amazon.com/ebs/latest/userguide/general-purpose.html) volume includes a baseline of 3,000 IOPS and 125 MiB/s regardless of size, and can be provisioned up to 80,000 IOPS and 2,000 MiB/s for an additional cost. A `gp2` volume earns 3 IOPS per GiB and bursts to 3,000 IOPS on I/O credits — a 100 GiB `gp2` volume runs at 300 IOPS once its credits are spent. `gp3` does not burst, so it sustains its provisioned figures indefinitely.
- **Latency.** `gp3` and `gp2` deliver single-digit millisecond latency. [`io2` Block Express](https://docs.aws.amazon.com/ebs/latest/userguide/provisioned-iops.html) is designed for an average under 500 µs for 16 KiB I/O with far fewer outliers; Azure Premium SSD v2 and GCP Hyperdisk Extreme are the equivalents.
- **Per-instance limits.** Each [EBS-optimized instance type](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-optimized.html) has a baseline and a maximum EBS bandwidth, and many smaller sizes can sustain the maximum for only 30 minutes at least once every 24 hours before dropping to the baseline. A large provisioned volume behind a small instance is throttled by the instance, not the volume. The same applies to Azure VM-level disk throughput caps.
- **Shared pipe.** Every volume attached to an instance shares that instance's EBS bandwidth. Spill, data, and the root volume compete for it.

**What Spice does on the `ebs` profile** is summarized in [How Spice adapts to the storage medium](#how-spice-adapts-to-the-storage-medium): fewer pooled connections and larger checkpoints for DuckDB, larger page caches and longer lock waits for SQLite and Turso, and for Cayenne a slow-tier tuning bias, an `O_DIRECT` compaction writer that keeps rewritten files out of the page cache, and an encode-concurrency cap derived from the instance's EBS bandwidth.

**Guidance:**

- **Choose the tier for its latency first.** `io2` Block Express, Premium SSD v2, and Hyperdisk Extreme are the sub-millisecond tiers and the right default for accelerations; `gp3` with provisioned IOPS and throughput is the economical fallback for data that is mostly served from cache. Provisioned IOPS stop queueing from adding to the latency; they do not reduce it. Do not run accelerations on `gp2`, whose burst credits are exhausted by exactly the sustained scans and refreshes an accelerator performs.
- **Choose the instance for its EBS bandwidth, not just its cores and memory.** Check the instance type's baseline EBS bandwidth against the volume's provisioned throughput, and prefer types that sustain their maximum rather than burst to it. Cayenne's startup log reports the cap it derived (`Capping global encode-concurrency budget to the instance EBS write-bandwidth ceiling`) when the instance bandwidth binds.
- **Keep spill off the root volume.** Set `runtime.query.temp_directory` to a directory on the data volume or on a dedicated volume. When Cayenne is active and the setting is unset, the runtime logs a reminder at startup.
- **Prefer local NVMe for spill even when data is on EBS.** Many EBS-backed instance families also carry instance store (the `d`-suffixed types); a spill that runs at NVMe speed holds memory reservations for a fraction of the time, and spill has no durability requirement.
- **Set `storage_profile: ebs` explicitly** on GCP Persistent Disk and Hyperdisk, on Ceph, SAN, and other network block devices that auto-detection resolves to `local_ssd`, and on any platform where detection returns `unknown` but the storage is network-attached.
- **Do not share a volume between Spice instances.** DuckDB, SQLite, Turso, and the Cayenne metastore each allow one writer per file. Multi-attach `io2` volumes provide no file-system coordination and will corrupt these files.
- **Monitor the volume and the instance.** On AWS, watch `VolumeQueueLength`, `VolumeReadOps`/`VolumeWriteOps` against the provisioned IOPS, `BurstBalance` on `gp2`, and the instance-level `EBSIOBalance%` and `EBSByteBalance%` — see [Amazon EBS CloudWatch metrics](https://docs.aws.amazon.com/ebs/latest/userguide/using_cloudwatch_ebs.html). A queue length that grows while IOPS plateau is a saturated volume; a balance that trends to zero is an instance about to be throttled to its baseline.

On Azure, prefer [Premium SSD v2 or Ultra Disk](https://learn.microsoft.com/azure/virtual-machines/disks-types) with explicit IOPS and throughput; on GCP prefer [Hyperdisk Balanced or Extreme](https://cloud.google.com/compute/docs/disks/hyperdisks) over `pd-ssd`. The platform-specific StorageClass recommendations are in the [AWS](../deployment/aws#4-storage-and-ingress), [Azure](../deployment/azure), [GCP](../deployment/gcp), and [Helm](../deployment/kubernetes/helm#storage-class-recommendations) deployment guides.

### Network file systems: NAS, NFS, SMB, EFS, Azure Files

Network file systems — on-premises NAS appliances exported over NFS or SMB, Amazon EFS, Azure Files, Google Cloud Filestore, and similar — are **not recommended** for acceleration files or for the spill directory, and the limitation is not only speed:

- **Latency and protocol overhead.** Every uncached read, every write, and every metadata operation (open, stat, rename, lock) is a network round trip through a file-sharing protocol. Vortex's random-access reads, SQLite's per-commit `fsync`, and DuckDB's checkpoints all issue these operations in volume. Throughput on managed offerings is also metered per file system or per share, and shared with every other client.
- **Locking semantics.** SQLite's documentation is explicit that lock implementations on network file systems are unreliable: *"This is especially true of network filesystems and NFS in particular. If SQLite is used on a filesystem where the locking primitives contain bugs, and if two or more threads or processes try to access the same database at the same time, then database corruption might result."* ([How To Corrupt An SQLite Database File](https://www.sqlite.org/howtocorrupt.html), section 2.1). This applies to the SQLite and Turso accelerators and to the Cayenne metastore, which is a SQLite database.
- **DuckDB's own guidance.** DuckDB recommends avoiding its native database format in read-write mode on network-attached storage, noting that it *"can result in slow and unpredictable performance, as well as spurious errors caused by the underlying file system"* — see [DuckDB's environment guide](https://duckdb.org/docs/stable/guides/performance/environment). The same page notes that network-backed cloud block disks such as EBS are fine for read-write use; the distinction is block device versus shared file system.
- **What Spice does.** Auto-detection classifies `nfs`, `nfs4`, `cifs`, `smbfs`, and `smb3` mounts as the network-attached (`ebs`) tier, so the adjustments above apply, including Cayenne's `O_DIRECT` compaction writer. Those adjustments amortize the latency; they do not remove it, and they cannot make a file-sharing protocol's locks trustworthy.

If a network file system is unavoidable — a regulated environment that provides nothing else, for example — limit the exposure:

- Run exactly **one Spice instance per exported directory**, with no other NFS/SMB clients touching the files.
- Keep the **Cayenne metastore on local disk** (`cayenne_metadata_dir` on a local volume) even when data files are on the share, and keep **spill local** (`runtime.query.temp_directory`).
- Prefer **Cayenne** over DuckDB, SQLite, or Turso for data on the share: its data files are immutable once written, so the share sees whole-file writes and renames rather than in-place page updates.
- Set `storage_profile: ebs` explicitly if the share is mounted through a user-space client that does not appear in `/proc/self/mountinfo` with one of the file-system types above.
- Mount NFS with `hard`, a generous `timeo`, and `nconnect` where the client supports it; mount SMB with the 3.1.1 dialect and the largest `rsize`/`wsize` the server allows.
- Expect refresh and compaction to run several times slower than on local storage, and load-test the cold-cache case rather than the warm one.

Using NAS as a **data source** is a different matter. The [NFS](../components/data-connectors/nfs) and [SMB](../components/data-connectors/smb) data connectors read Parquet, CSV, and JSON from shares as a federated source; accelerating that data onto local NVMe is the recommended pattern, and it moves the share off the query path entirely.

### RAM-backed storage (tmpfs)

A `tmpfs` or `ramfs` mount — including a Kubernetes `emptyDir` with `medium: Memory` — is the fastest medium available, and the runtime recognizes it (Cayenne switches to 64 MB files, DuckDB raises its checkpoint threshold to 1 GiB). It is rarely the right choice:

- **It is memory.** Files on `tmpfs` are charged to the process's cgroup. On Kubernetes, *"files you write count against the memory limit of the container that wrote them"* ([Kubernetes volumes](https://kubernetes.io/docs/concepts/storage/volumes/#emptydir)). A spill directory on `tmpfs` therefore cannot relieve memory pressure: a query that spills to it consumes the same memory it was trying to release, and the container is OOM-killed instead of the query slowing down.
- **It competes with the page cache and the accelerator caches** for the same RAM, so the data it holds is not "free" relative to simply keeping the dataset in an in-memory accelerator.
- It is lost on every restart, like instance store, but without instance store's capacity.

Use it only when the dataset is small relative to RAM and the workload genuinely needs the last few microseconds of read latency — and never for `runtime.query.temp_directory`.

### Object storage

Object storage is not a file system and is used in three specific ways:

- **Cayenne data files on [S3 Express One Zone](../components/data-accelerators/cayenne#aws-s3-express-one-zone-storage)** — single-digit-millisecond object storage that persists Cayenne accelerations independently of the instance. The metastore stays on local disk; only data files move. Standard S3 buckets are not supported for the warm tier.
- **Cayenne [cold tier](../components/data-accelerators/cayenne#cold-object-store-tier)** on standard S3, for tables larger than local capacity.
- **[Snapshots](../features/data-acceleration/snapshots)** and [read/write separation](../deployment/read-write-separation) — whole acceleration files copied to and from S3, Azure ADLS, or GCS to bootstrap ephemeral local storage.

Spill cannot be directed at object storage, and acceleration files other than Cayenne's cannot be placed on it.

### Storage on Kubernetes

Kubernetes adds a layer between the pod and the disk, and the defaults are wrong for Spice in two ways: the pod's writable layer and a plain `emptyDir` live on the node's ephemeral storage, which is usually the root disk; and the default StorageClass on every managed cloud is a network block volume.

**Follow the step-by-step guide: [Local NVMe Storage on Kubernetes](../deployment/kubernetes/local-nvme).** It covers choosing NVMe node types on EKS, GKE, AKS, and self-hosted clusters, mounting the disks, publishing them as PersistentVolumes with the Local Volume Static Provisioner, deploying the Helm chart with `stateful.enabled: true` on a `local-storage` class, and verifying that Spice detected local SSD. The short version:

- **Acceleration data** goes on a local NVMe PersistentVolume, with the pod pinned to its node and [snapshots](../features/data-acceleration/snapshots) to bootstrap a replacement pod. Network block storage (`io2`/`gp3` via the EBS CSI driver, Premium SSD v2 via the Azure Disk CSI driver, Hyperdisk via the GCE PD CSI driver) is the fallback when the volume must follow the pod between nodes; set `storage_profile: ebs` on GCP, where auto-detection cannot identify the device. Never use a `ReadWriteMany` file-system volume (EFS, Azure Files, Filestore, an NFS provisioner) — see [Network file systems](#network-file-systems-nas-nfs-smb-efs-azure-files).
- **Spill** (`runtime.query.temp_directory`) goes in a subdirectory of the same volume, such as `/data/tmp`. A plain `emptyDir` is acceptable only when the node's ephemeral storage is itself on NVMe (Karpenter's `instanceStorePolicy: RAID0`, GKE's `--ephemeral-storage-local-ssd`), with a `sizeLimit`. Never `emptyDir` with `medium: Memory` — see [RAM-backed storage](#ram-backed-storage-tmpfs).

```yaml
# values.yaml for the Spice Helm chart
stateful:
  enabled: true
  storageClass: local-storage # nvme-ssd-block on GKE
  size: 800Gi
  mountPath: /data
nodeSelector:
  local-nvme: 'true'
spicepod:
  runtime:
    query:
      temp_directory: /data/tmp # acceleration files under /data, spill under /data/tmp
```

The [Helm chart's storage class recommendations](../deployment/kubernetes/helm#storage-class-recommendations) list the per-cloud StorageClasses in order of preference.

### Storage on Docker and bare metal

Bind-mount a directory on local NVMe into the container and point the accelerators and `runtime.query.temp_directory` at it — see [Docker persistence](../deployment/docker#persistence). Without a mount, acceleration files land in the container's writable layer (on the host's root disk, through the storage driver) and spill lands in the container's `/tmp`, which is the same place. Avoid Docker's `--tmpfs` for either, for the reasons in [RAM-backed storage](#ram-backed-storage-tmpfs).

On a bare-metal or VM host, set the same two things — acceleration paths and `runtime.query.temp_directory` — to the NVMe mount. The runtime does not read `TMPDIR` for anything other than the spill fallback, and it does not relocate the default `.spice/data` directory, so the paths must be explicit.

## Spice Cayenne Performance Optimization

[Spice Cayenne](../components/data-accelerators/cayenne) uses the [Vortex](https://github.com/vortex-data/vortex) columnar format for high-performance analytics on large datasets. Cayenne is self-tuning by default and adapts to the detected storage medium; the sections below cover the knobs that are still worth setting by hand. For the full reference — self-tuning modes, goal-driven SLOs, the storage tier, write-path and compaction tuning — see the [Cayenne performance guide](../components/data-accelerators/cayenne/performance).

### Storage

Store Cayenne data files and the metastore on local NVMe. Vortex's random-access encodings turn a selective query into many small reads, and the metastore commits with `fsync` on every write; both run at the latency of the medium. On network block storage Cayenne biases its tuner, caps its write concurrency, and bypasses the page cache for compaction output automatically — see [How Spice adapts to the storage medium](#how-spice-adapts-to-the-storage-medium) — but every cache miss still pays the volume's per-read latency, and provisioned IOPS only keep queueing from adding to it. Keep the metastore (`cayenne_metadata_dir`) on local disk in every configuration, including S3 Express and network file systems, and keep it [outside the data directory](../components/data-accelerators/cayenne#metastore-location).

### Point Lookups and Random Access

Vortex provides [100x faster random access](https://bench.vortex.dev) compared to Apache Parquet through:

- **Segment statistics**: Per-segment min/max/null_count for predicate pushdown (zone-map equivalent)
- **Fast random access encodings**: [FSST](https://www.vldb.org/pvldb/vol13/p2649-boncz.pdf), [FastLanes](https://www.vldb.org/pvldb/vol16/p2132-afroozeh.pdf), and [ALP](https://ir.cwi.nl/pub/33334/33334.pdf) support O(1) or near-O(1) random access
- **Compute push-down**: Filter execution on compressed data without full decompression
- **Array statistics**: `is_sorted`, `is_constant`, `min`, `max` for query optimization

For point lookups on large datasets, Spice Cayenne often matches or exceeds the performance of traditional B-tree indexes while consuming no additional memory for index structures.

### Cache Configuration

Spice Cayenne maintains two in-memory caches that significantly impact query performance. Both are engine-global and set under `runtime.params` — one segment cache serves every Cayenne table in the process, so a `cayenne_segment_cache_mb` set under a dataset's `acceleration.params` is reported at startup and otherwise ignored:

```yaml
runtime:
  params:
    cayenne_footer_cache_mb: 256   # Engine-global; increase for many files
    cayenne_segment_cache_mb: 512  # Process-wide; increase for hot data patterns

datasets:
  - from: s3://bucket/data/
    name: analytics
    acceleration:
      engine: cayenne
      mode: file
```

**Footer Cache Sizing:**

The footer cache stores file metadata. Size based on file count:

- 1-10 KB per file
- Default: unset — when omitted, DataFusion's 50 MB file-metadata-cache limit applies
- Increase for datasets with more files

**Segment Cache Sizing:**

The segment cache stores decompressed data. Size based on working set:

- Default: unset — derived as ~1/64 of the process's memory entitlement, clamped to 256 MB–2 GB; `0` disables it
- Estimate the volume of frequently accessed data across every Cayenne table, since they share one budget
- Cache hits avoid decompression overhead and, on network storage, the round trip
- Monitor the hit rate as `rate(cayenne_segment_cache_hits[5m]) / rate(cayenne_segment_cache_accesses[5m])` — see [segment cache metrics](../components/data-accelerators/cayenne/deployment#segment-cache-metrics)

The slower the storage, the more a larger segment cache pays back: on network block storage or S3 Express, size it to the hot working set rather than leaving the derived default.

### Compression Strategy

| Strategy              | Read Performance | Write Performance | Compression Ratio |
| --------------------- | ---------------- | ----------------- | ----------------- |
| `btrblocks` (default) | Fastest          | Moderate          | Higher            |
| `zstd`                | Moderate         | Faster            | High              |

Choose `btrblocks` for read-heavy analytics workloads. Use `zstd` only when size on disk is the primary concern—setting `zstd` trades query performance for reduced storage size.

### Sorted Data

Set `sort_columns` to the columns queries filter on most. Sorted files have tight per-segment `min`/`max` ranges, so segment pruning skips most of the table for a selective predicate, and `is_sorted` enables binary search for point lookups. For CDC datasets the adaptive layout also clusters compacted files by the filter columns it observes on scans; an explicit `sort_columns` outranks that observation. See [Sorted data and zone maps](../components/data-accelerators/cayenne/performance#sorted-data-and-segment-pruning) in the Cayenne guide.

## DuckDB Performance Optimization

[DuckDB](../components/data-accelerators/duckdb) provides mature SQL support with sophisticated query optimization.

:::tip[Datasets 10 GB or larger]

For any dataset of **10 GB or larger**, [Spice Cayenne](../components/data-accelerators/cayenne) is recommended over DuckDB, because of DuckDB's memory requirements. Cayenne typically needs **one-third to one-half** the memory of the DuckDB accelerator for the same dataset. See [Spice Cayenne Performance Optimization](#spice-cayenne-performance-optimization).

:::

### Storage

Put the `duckdb_file` on local NVMe or SSD. DuckDB's own guidance is that its disk-based mode *"is designed to work best with SSD and NVMe disks"* and that HDDs give low performance, especially for writes; it also recommends against its native format in read-write mode on network-attached file systems (NAS, NFS, SMB) while confirming that network block disks such as EBS work — see [DuckDB's environment guide](https://duckdb.org/docs/stable/guides/performance/environment) and [Storage](#storage) above.

DuckDB spills its own sorts, joins, and aggregates to a temporary directory. The Spice runtime passes `runtime.query.temp_directory` to every DuckDB instance it opens, so the one setting covers both engines; when it is unset, DuckDB uses a `.tmp` directory next to the database file (and `.tmp` under the working directory for the in-memory instance). DuckDB stops spilling when its temporary files reach 90% of the volume's free space. See [Temporary Directory](../components/data-accelerators/duckdb#temporary-directory).

On the `ebs` storage profile the runtime raises DuckDB's `checkpoint_threshold` to 256 MiB and lowers the connection pool floor to 4; on `tmpfs` the threshold rises to 1 GiB. Set [`storage_profile`](spicepod/datasets#accelerationstorage_profile) explicitly when the device cannot be auto-detected.

### Memory Configuration

```yaml
datasets:
  - from: postgres:schema.table
    name: orders
    acceleration:
      engine: duckdb
      mode: file
      params:
        duckdb_memory_limit: 4GB
        duckdb_file: /nvme/spice/data/orders.duckdb
```

**Guidelines:**

- Set `duckdb_memory_limit` to control memory per instance
- Left to itself DuckDB sizes its limit at 80% of **host** memory per instance; when the parameter is unset the runtime caps each instance from a [coordinated memory budget](../components/data-accelerators/duckdb#coordinated-memory-budget) instead
- Reserve 30% of container memory for the runtime
- Multiple datasets using the same `duckdb_file` share a connection pool

### Connection Pool Tuning

```yaml
acceleration:
  engine: duckdb
  params:
    connection_pool_size: 20  # Default: 10 (4 on the ebs storage profile), or the number of datasets sharing the file if larger
```

Increase `connection_pool_size` for high-concurrency workloads. Each connection consumes memory.

### Index Configuration

DuckDB supports [ART (Adaptive Radix Tree) indexes](https://duckdb.org/docs/stable/guides/performance/indexing) for faster point lookups:

```yaml
datasets:
  - from: postgres:schema.orders
    name: orders
    acceleration:
      engine: duckdb
      mode: file
      indexes:
        order_id: enabled
        '(customer_id, created_at)': enabled
```

Indexes consume memory and [do not spill to disk](https://duckdb.org/docs/stable/guides/performance/indexing#indexes-and-memory). Creating an index requires the entire dataset to be loaded into memory. Monitor memory usage when adding indexes. For more details on ART index performance, see the [ART paper](https://db.in.tum.de/~leis/papers/ART.pdf).

### Zone-Maps and Sorted Data

DuckDB automatically creates [zone-maps](https://duckdb.org/docs/stable/guides/performance/indexing#zonemaps) (min/max statistics) for each row group, enabling efficient predicate pushdown. In practice, zone-maps on sorted data often outperform ART indexes for range and equality queries while consuming no additional memory.

**Why Zone-Maps Outperform Indexes:**

- Zero memory overhead (statistics stored with data)
- No index maintenance during writes
- Automatic predicate pushdown during scans
- Effective when data is sorted by query filter columns

**Optimization Pattern: Sorted Views**

Accelerate a view with `ORDER BY` to create sorted physical data, then set `duckdb_preserve_insertion_order: true` to maintain sort order:

```yaml
datasets:
  - from: iceberg:catalog/namespace/table
    name: raw_data_by_arrival
    time_column: processed_time
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      refresh_mode: append
      primary_key: id
      on_conflict:
        id: upsert
      params:
        duckdb_memory_limit: 12GiB
        duckdb_preserve_insertion_order: false  # Raw data doesn't need order

views:
  - name: data_sorted
    sql: |
      SELECT id, account_id, pool_id, value, created_at
      FROM raw_data_by_arrival
      WHERE __deleted = 'false'
      ORDER BY account_id, pool_id
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      refresh_check_interval: 210s
      params:
        duckdb_file: data_sorted.duckdb
        duckdb_memory_limit: 6GiB
        duckdb_preserve_insertion_order: true  # Maintains ORDER BY sort
```

**Key Configuration:**

| Parameter                         | Value                   | Purpose                                       |
| --------------------------------- | ----------------------- | --------------------------------------------- |
| `duckdb_preserve_insertion_order` | `true` on sorted view   | Maintains physical sort order from `ORDER BY` |
| `duckdb_preserve_insertion_order` | `false` on source table | Faster writes without order guarantees        |
| Separate `duckdb_file`            | Per view                | Isolates sorted data from source tables       |

Queries filtering on `account_id` or `(account_id, pool_id)` benefit from zone-map pruning, skipping entire row groups that don't match the filter predicates.

For a table rather than a view, `on_refresh_sort_columns` sorts the data after each refresh for the same effect; note that it currently drops indexes and constraints on that table.

### Aggregate Pushdown

Enable aggregate pushdown for improved performance on supported aggregate queries:

```yaml
acceleration:
  engine: duckdb
  params:
    optimizer_duckdb_aggregate_pushdown: enabled
```

Requires `query_federation` to be disabled. Supports `count`, `sum`, `avg`, `min`, and `max` functions.

### Bounding File Growth

A repeatedly full-refreshed DuckDB file grows without bound because bulk loads bypass the WAL-triggered checkpoint that would reclaim the previous copy of the data. Set [`on_full_refresh`](../components/data-accelerators/duckdb#bounding-acceleration-file-growth) to `replace_file` (readers never interrupted, file can shrink) or `checkpoint_file` (lighter, file plateaus) so the acceleration volume is sized for the data rather than for its history.

## SQLite and Turso

[SQLite](../components/data-accelerators/sqlite) and [Turso](../components/data-accelerators/turso) are row-oriented engines suited to small and medium datasets with simple queries and point lookups. Their performance characteristics are dominated by two things:

- **Storage latency.** Both serve page-cache misses with synchronous reads and commit with `fsync`, and both are the engines most exposed to the [locking problems of network file systems](#network-file-systems-nas-nfs-smb-efs-azure-files). Keep their files on local NVMe/SSD. On the `ebs` profile the runtime raises SQLite's page cache to ~200 MB and enables 256 MiB of memory-mapped I/O, and raises Turso's page cache to ~200 MB, to absorb per-I/O latency.
- **A single writer per file.** Refreshes serialize on the file's write lock. Many datasets with short refresh intervals in one file contend; give write-heavy datasets their own file, raise `busy_timeout` (SQLite; 5 s by default, 15 s on `ebs`) if `database is locked` appears, or move the workload to DuckDB or Cayenne.

Neither engine spills intermediate results to disk; SQLite keeps temporary tables and indices in memory (`temp_store = memory`). Queries that join or aggregate beyond RAM belong on DuckDB or Cayenne, where DataFusion and DuckDB spill.

## DataFusion Query Engine

Spice uses [Apache DataFusion](https://datafusion.apache.org/) as its query execution engine for Arrow and Spice Cayenne accelerators. DataFusion provides vectorized, multi-threaded query execution with automatic memory management and spilling.

### Query Parallelism

DataFusion automatically parallelizes queries across available CPU cores. By default, the number of partitions equals the runtime's [CPU entitlement](spicepod/runtime#runtimecpu) in whole cores, providing maximum parallelism. Override it with `runtime.query.target_partitions`, or state the entitlement itself with `runtime.cpu.cores` to size partitions and every other CPU-derived pool together.

DataFusion's [GreedyMemoryPool](https://docs.rs/datafusion/latest/datafusion/execution/memory_pool/struct.GreedyMemoryPool.html) allows memory reservations on a first-come, first-served basis up to the configured `memory_limit`. This approach improves throughput for high-concurrency queries with many partitions compared to dividing memory evenly.

### Join Algorithm Selection

DataFusion supports multiple join algorithms and automatically selects the best one based on query statistics:

| Algorithm        | Memory Usage | Best For                                         |
| ---------------- | ------------ | ------------------------------------------------ |
| Hash Join        | Higher       | Fast execution with sufficient memory (default)  |
| Sort-Merge Join  | Lower        | Memory-constrained environments, pre-sorted data |
| Nested Loop Join | Variable     | Cross joins, non-equi joins                      |

DataFusion prefers hash joins by default for equi-joins. Hash joins do not currently support spilling, so memory-constrained environments may benefit from sort-merge joins for large datasets.

### Dynamic Filter Pushdown

DataFusion pushes filters from operators (TopK, Join, Aggregate) into file scans to prune data early. This optimization is enabled by default and can skip entire row groups or files based on statistics. For example, a `SELECT * FROM t ORDER BY timestamp DESC LIMIT 10` query pushes timestamp filters down to file scans, pruning files that cannot contain top-10 candidates.

### Parquet Read Optimizations

Spice uses DataFusion's Parquet reader, which applies several optimizations automatically when reading Parquet files from S3, file, Iceberg, and Delta Lake connectors:

- **Row group pruning**: Skips entire row groups (typically 128 MB) based on min/max statistics in Parquet metadata
- **Page Index filtering**: Uses page-level min/max statistics (typically 8 KB chunks) for finer-grained pruning
- **Bloom filter evaluation**: Checks bloom filters for equality predicates when available in Parquet files
- **Projection pushdown**: Reads only the columns referenced in the query

These optimizations are applied automatically and require no configuration. The effectiveness depends on data layout—sorting data by frequently filtered columns maximizes row group pruning.

## File Format Filtering and Optimization

Spice connects to various file formats (Parquet, Iceberg, Delta Lake) and uses DataFusion's query execution engine to push down predicates and prune data at the file, row group, and page level. Understanding these optimizations helps when designing data layouts for optimal query performance.

### Parquet

Apache Parquet stores data in row groups with per-column statistics. DataFusion uses these statistics to skip row groups that cannot contain matching rows.

**Row Group Pruning:**

Each Parquet row group contains min/max statistics for each column. When a query includes a `WHERE` clause, DataFusion evaluates whether each row group could contain matching rows based on these statistics. Row groups that cannot match are skipped entirely.

For example, with a predicate `WHERE timestamp > '2024-01-01'`, DataFusion skips row groups where the maximum timestamp is before 2024-01-01.

**Page Index:**

Parquet's [Page Index](https://parquet.apache.org/docs/file-format/data-pages/) provides finer-grained statistics at the page level within row groups. DataFusion uses the Page Index to skip individual pages, reducing I/O for selective queries.

**Bloom Filters:**

Parquet files can include bloom filters for membership testing. For equality predicates like `WHERE user_id = 'abc123'`, DataFusion checks the bloom filter before reading column data. If the bloom filter indicates the value is not present, the row group is skipped.

**Late Materialization (Filter Pushdown):**

DataFusion supports applying filters during Parquet decoding rather than after. This optimization, called late materialization, filters rows before materializing all columns, reducing memory usage for selective queries.

### Iceberg

[Apache Iceberg](https://iceberg.apache.org/) provides hidden partitioning and multi-level metadata filtering that simplifies query optimization.

**Hidden Partitioning:**

Iceberg automatically derives partition values from source columns using transforms like `day(timestamp)`, `month(timestamp)`, or `bucket(user_id, 16)`. Queries filter on the source column directly (e.g., `WHERE timestamp > '2024-01-01'`), and Iceberg automatically prunes partitions without requiring users to specify partition columns in predicates.

**Two-Level Metadata Filtering:**

Iceberg uses a hierarchical metadata structure that enables filtering at multiple levels:

1. **Manifest list filtering**: The manifest list contains partition value ranges for each manifest file. Manifests that cannot contain matching rows are skipped entirely.
2. **Manifest filtering**: Each manifest file contains per-file column statistics (min/max, null counts, value counts). Data files that cannot contain matching rows are skipped.

This two-level approach can eliminate entire groups of files before reading any data, providing significant performance benefits for large tables.

**Column-Level Statistics:**

Iceberg manifests store column-level statistics including:

- `lower_bound` and `upper_bound` for min/max filtering
- `null_count` for null handling optimization
- `value_count` for cardinality estimation

**Partition Evolution:**

Iceberg supports changing partition schemes without rewriting existing data. Historical data retains its original partitioning while new data uses the updated scheme. Queries automatically account for both partition layouts.

### Delta Lake

[Delta Lake](https://delta.io/) provides data skipping and Z-ordering for query optimization.

**Data Skipping:**

Delta Lake collects column statistics (min, max, null counts) during writes. The `delta.dataSkippingNumIndexedCols` table property controls how many columns have statistics collected (counted from the first column in the schema). Queries filter using these statistics to skip files that cannot contain matching rows.

**Generated Columns:**

Delta Lake supports generated columns that derive values from other columns. When partitioned by a generated column (e.g., `eventDate` generated from `CAST(eventTime AS DATE)`), queries filtering on the source column automatically benefit from partition pruning.

**Z-Ordering:**

[Z-ordering](https://docs.delta.io/latest/optimizations-oss.html#z-ordering-multi-dimensional-clustering) colocates related data in the same files by clustering on specified columns. After running `OPTIMIZE ... ZORDER BY (column)`, queries filtering on the Z-ordered columns benefit from improved data skipping.

**Compaction:**

Delta Lake's `OPTIMIZE` command compacts small files into larger ones, reducing the number of files to scan and improving query performance through better I/O patterns.

### Vortex (Spice Cayenne)

Spice Cayenne uses [Vortex](https://github.com/vortex-data/vortex), which provides segment-level statistics and compute push-down on compressed data.

**Segment Statistics:**

Vortex's ChunkedLayout maintains per-segment statistics including `min`, `max`, `null_count`, `is_sorted`, and `is_constant` for each column. These statistics function similarly to DuckDB's zone-maps, enabling segment pruning during query execution.

**Compute Push-Down:**

Vortex supports executing filter operations directly on compressed data. For encodings like FSST (strings), FastLanes (integers), and ALP (floats), predicates can be evaluated without full decompression, reducing CPU and memory usage.

**Encoding-Aware Optimization:**

Vortex tracks encoding metadata that enables additional optimizations:

- `is_sorted`: Enables binary search for point lookups
- `is_constant`: Returns values immediately without scanning
- Encoding-specific optimizations based on data characteristics

See [Spice Cayenne Performance Optimization](#spice-cayenne-performance-optimization) for cache tuning and other Cayenne-specific settings.

### Performance Implications

| Optimization               | Parquet | Iceberg         | Delta Lake      | Vortex            |
| -------------------------- | ------- | --------------- | --------------- | ----------------- |
| Row group/file pruning     | ✅       | ✅               | ✅               | ✅                 |
| Page-level filtering       | ✅       | ✅ (via Parquet) | ✅ (via Parquet) | ✅ (segment-level) |
| Bloom filters              | ✅       | ✅ (via Parquet) | ❌               | ❌                 |
| Hidden partitioning        | ❌       | ✅               | ❌               | ❌                 |
| Manifest-level filtering   | ❌       | ✅               | ❌               | ❌                 |
| Compute on compressed data | ❌       | ❌               | ❌               | ✅                 |
| Z-ordering                 | ❌       | ✅               | ✅               | ❌                 |

**Optimization Recommendations:**

- **Sort data by filter columns**: Row group and segment statistics are most effective when data is sorted by commonly filtered columns
- **Use appropriate file sizes**: Larger row groups (128 MB+) provide better compression but reduce pruning granularity
- **Collect statistics on filter columns**: Ensure filter columns are within the statistics collection limit (e.g., `delta.dataSkippingNumIndexedCols`)
- **Consider Z-ordering for multi-column filters**: When queries filter on multiple columns, Z-ordering colocates related data

## Query Memory Management

Configure DataFusion query memory limits to prevent out-of-memory errors:

```yaml
runtime:
  query:
    memory_limit: 8GiB
    temp_directory: /nvme/spice/tmp
    spill_compression: zstd
```

### Memory Limit

If not specified, `memory_limit` defaults to 90% of the memory the process may use — its cgroup memory limit when one binds (a container, a `systemd` unit's `MemoryMax=`, a capped parent slice, or a Kubernetes pod cgroup), otherwise total system memory; when a Cayenne acceleration can reach the in-memory CDC tier (`refresh_mode: changes` or `caching`, or `append` with `refresh_check_interval` ≤ 5m), the default is 70% instead, reserving headroom for Cayenne's compaction memory pool and in-memory CDC tier. A pod whose Cayenne accelerations only bulk-write — `refresh_mode: full`, or `append` on a slower cadence — cannot fill that tier and keeps the 90% base, reduced by the off-pool per-table scan caches Cayenne holds for each accelerated table. Datasets, views and [catalogs](./spicepod/catalogs#acceleration) are all classified this way; because `changes` is the only refresh mode catalog acceleration accepts, an accelerated catalog always reaches the tier, and it contributes one table's worth of off-pool reservation however many tables it goes on to discover (see [Accelerated catalogs](./memory#accelerated-catalogs)). Either way the derived limit is floored at 50% of the same memory. For deployments with co-located accelerators, set an explicit limit based on available memory:

```text
runtime memory_limit = Total Memory - Accelerator Memory - OS/Runtime Overhead (30%)
```

Accelerator memory in that expression is **per dataset**, not per deployment: each accelerated dataset holds its own caches, sized as a fraction of total memory but clamped to a floor that does not shrink with the container. The limit therefore has to be derived for the dataset count, and the ratio that works in a small environment does not carry to a large one. See [How Spice Uses Memory](./memory#how-spice-uses-memory) and [Sizing a Non-Production Environment](./memory#sizing-a-non-production-environment).

Note also that this limit bounds the query execution pool, not the process. Serialization buffers, accelerator caches, and allocator retention sit outside it, which is why lowering it does not always reduce resident memory — see [What the Memory Limit Does Not Cover](./memory#what-the-memory-limit-does-not-cover).

When the goal is to reduce peak memory, prefer bounding concurrency over lowering this limit:

| Intent                                          | Setting                                                                                     |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Reduce peak memory under burst                    | `runtime.query.max_concurrent_queries` (defaults to 4× the CPU entitlement's cores, not from memory) |
| Reduce per-plan fan-out and its reservations      | `runtime.query.target_partitions` (defaults to the CPU entitlement's cores)                   |
| Change how much memory a single query may reserve | `runtime.query.memory_limit`                                                                  |

Lowering `max_concurrent_queries` reduces peak **memory** usage directly, by bounding how many plans hold reservations at once. The trade-off is latency: excess queries wait for admission rather than being refused, so peak end-to-end query time rises with the time spent queueing. Tune it against the workload's tolerance for wait, and watch total query duration — not just execution time — when you change it.

Lowering `memory_limit` shrinks the pool each query draws from without reducing how many run concurrently, and on a Cayenne CDC deployment it can leave resident memory unchanged because the in-memory CDC tier expands into the freed budget — see [Tuning the Memory Limit Safely](./memory#tuning-the-memory-limit-safely).

### Spill-to-Disk and the Temporary Directory

When a sort, aggregation, or sort-merge join cannot reserve more memory from the pool, DataFusion writes its intermediate batches to disk as [Arrow IPC Stream](https://arrow.apache.org/docs/format/Columnar.html#ipc-streaming-format) files and reads them back in a merge pass. Spilling turns an out-of-memory refusal into a slower query — but only if the spill directory is fast enough and large enough to take it.

**Where spill goes.** `runtime.query.temp_directory` names the directory; DataFusion creates a uniquely named subdirectory beneath it for each runtime and removes the files when the query completes. The one setting covers every consumer of temporary space:

| Consumer                                                    | Uses `runtime.query.temp_directory`                                                                                  |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| DataFusion query execution (Arrow and Cayenne accelerators, federated and file sources) | Yes — spill for sort, aggregate, and sort-merge join                                          |
| Cayenne background compaction                               | Yes — its dedicated runtime environment spills to the same directory                                                 |
| DuckDB accelerator instances                                | Yes — passed through as DuckDB's `temp_directory`; without it DuckDB uses a `.tmp` directory beside the database file |
| Cluster-mode executors                                      | Yes — the default local working directory for shuffle data                                                           |
| Cayenne in-memory CDC tier under memory pressure            | No — checkpoints to the table's **data** directory, which is why that volume needs free space too                     |
| SQLite and Turso                                            | No — they do not spill; temporary tables are held in memory                                                          |

**The default is the operating system's temporary directory** (`$TMPDIR`, otherwise `/tmp`). On most hosts that is the root volume: on a cloud instance a small network-attached disk, in a container the writable layer. Both are the wrong place — slow, small, and shared with logs and images — and a spill that fails for lack of space does not fall back to memory; the query fails with a `ResourcesExhausted` error, indistinguishable at first glance from an ordinary out-of-memory refusal. When Cayenne acceleration is active and the setting is unset, the runtime logs this at startup:

```text
Cayenne acceleration is active but runtime.query.temp_directory is unset: large analytical queries spill to the OS temp directory. If your data is on a separate volume (e.g. EBS) and the root volume is small, set runtime.query.temp_directory to a path with ample free space so large queries can spill instead of failing.
```

**Set it explicitly, on local NVMe or SSD:**

```yaml
runtime:
  query:
    temp_directory: /nvme/spice/tmp
```

Guidance for the directory:

- **Local NVMe/SSD.** Each spilled batch is a synchronous write the operator waits on, and the merge pass reads the batches back the same way, so per-I/O latency accumulates along the query's critical path while the query holds its memory reservation. On NVMe a spill is a modest slowdown; on a `gp3` volume each of those waits is a millisecond or more, and the spill is additionally bounded by the volume's throughput and competes with data reads for the instance's EBS bandwidth; on a network file system it is slower still. See [Storage](#storage).
- **Never RAM-backed.** A `tmpfs` spill directory charges the spilled bytes to the same memory the query was trying to free — see [RAM-backed storage](#ram-backed-storage-tmpfs).
- **Size it for 2–4× the largest input** that can exceed memory, and account for concurrent spilling queries.
- **Know the cap.** DataFusion refuses to spill more than **100 GB in total** per runtime environment; a query whose spill would exceed it fails with `The used disk space during the spilling process has exceeded the allowable limit`. The cap is not configurable in the current release: there is no `runtime.query` setting for it, and `SET datafusion.runtime.max_temp_directory_size` is rejected because Spice's query APIs do not accept `SET` statements. Queries and compaction have separate environments, so each has its own 100 GB. A workload that approaches the cap needs more memory, fewer concurrent queries, or a smaller working set (more selective predicates, sorted data, `sort_columns`), not a larger volume.
- **Watch free space.** Monitor the volume's free bytes; DuckDB stops spilling at 90% of the volume's free space, and a full volume fails Cayenne ingestion.

**Not every operator spills.** Hash joins, the external sort's final merge, and repartition merges cannot spill; a query that exceeds memory in one of those fails regardless of the temporary directory. See [Spill Limitations](./memory#spill-limitations).

### Spill Compression

| Compression      | Disk Usage | CPU Overhead | Best on                                   |
| ---------------- | ---------- | ------------ | ----------------------------------------- |
| `zstd` (default) | Lowest     | Moderate     | Network block storage, bandwidth-limited volumes, small volumes |
| `lz4_frame`      | Medium     | Lowest       | Local NVMe, CPU-constrained hosts         |
| `uncompressed`   | Highest    | None         | Local NVMe when CPU is the bottleneck and space is abundant; debugging |

Compression trades CPU for bytes. On a volume whose throughput is the constraint (EBS at its provisioned MiB/s, an instance near its EBS bandwidth cap), `zstd` writes fewer bytes and usually finishes sooner. On local NVMe, which can absorb several GB/s, the compression itself can become the bottleneck, and `lz4_frame` or `uncompressed` is often faster end-to-end. Measure with the actual spill-heavy query rather than assuming; the difference shows in total query duration.

### Batch Processing

DataFusion processes data in batches of 8192 rows by default. This batch size balances memory usage with vectorized execution efficiency. Larger batches improve CPU cache utilization and SIMD operations but consume more memory per partition.

## Caching Configuration

Spice supports multiple caching layers for query acceleration.

### SQL Results Cache

Cache query results for repeated queries:

```yaml
runtime:
  caching:
    sql_results:
      enabled: true
      max_size: 512MiB
      item_ttl: 5m
      eviction_policy: tiny_lfu  # Higher hit rate than lru
      cache_key_type: plan       # Matches semantically equivalent queries
```

**Cache Key Types:**

| Type             | Behavior                | Use Case                   |
| ---------------- | ----------------------- | -------------------------- |
| `plan` (default) | Uses query logical plan | Varied query formatting    |
| `sql`            | Uses exact SQL string   | Identical repeated queries |

Use `sql` for lowest latency with identical queries. Use `plan` for semantic query matching.

### Stale-While-Revalidate

Serve stale cached results while refreshing in the background:

```yaml
runtime:
  caching:
    sql_results:
      enabled: true
      item_ttl: 1m
      stale_while_revalidate_ttl: 5m  # Serve stale for 5m while refreshing
```

This pattern reduces query latency spikes during cache refresh.

## Data Refresh Optimization

### Refresh Mode Selection

| Mode      | Memory Impact | Use Case                                |
| --------- | ------------- | --------------------------------------- |
| `full`    | 2.5x dataset  | Small-medium datasets, complete updates |
| `append`  | Minimal       | Time-series, logs, immutable data       |
| `changes` | Minimal       | CDC-enabled sources                     |
| `caching` | Minimal       | Dynamic content, API data               |

A full refresh also rewrites the acceleration file, so its cost scales with the storage medium: on network block storage a full refresh of a large DuckDB or Cayenne table is bounded by the volume's write throughput, and a DuckDB file grows by the whole table on every cycle until [`on_full_refresh`](../components/data-accelerators/duckdb#bounding-acceleration-file-growth) reclaims the space. Prefer `append` or `changes` for anything large.

### Append Mode Optimization

Use `time_column` for efficient incremental updates:

```yaml
datasets:
  - from: s3://bucket/events/
    name: events
    time_column: event_time
    acceleration:
      engine: cayenne
      mode: file
      refresh_mode: append
      refresh_check_interval: 5m
```

### Partitioned Data

For data that has a granular time column and a separate column for partitioning (i.e. day buckets), set `time_partition_column` to the partitioning column based on time:

```yaml
datasets:
  - from: s3://bucket/events/
    name: events
    time_column: event_time
    time_partition_column: event_date  # Physical partition column
    acceleration:
      refresh_mode: append
```

In this scenario, `event_date` is the day bucket used for physical partitioning (e.g., s3://bucket/events/event_date=2025-10-01/), while event_time provides the granular timestamp for precise filtering.

| event_id | event_time (time_column) | event_date (time_partition_column) | event_type | user_id |
| -------- | ------------------------ | ---------------------------------- | ---------- | ------- |
| 8f2a-1   | 2025-10-01 08:14:22.123  | 2025-10-01                         | page_view  | u_442   |
| 8f2a-2   | 2025-10-01 22:01:05.884  | 2025-10-01                         | click      | u_901   |
| 9c11-a   | 2025-10-02 01:12:44.001  | 2025-10-02                         | purchase   | u_442   |
| 9c11-b   | 2025-10-02 14:30:12.550  | 2025-10-02                         | page_view  | u_118   |

### Last-Modified Optimization

For object storage with append-only files, use `last_modified` to skip unchanged files:

```yaml
datasets:
  - from: s3://bucket/logs/
    name: logs
    time_column: last_modified  # Special value using file metadata
    acceleration:
      refresh_mode: append
```

### Fast Cold Starts

On ephemeral storage every restart is a cold start. [Acceleration snapshots](../features/data-acceleration/snapshots) (Spice.ai Enterprise) upload the acceleration file after each refresh and download the newest one on boot when the local file is missing, so a replacement pod on fresh NVMe serves queries in the time it takes to copy the file rather than the time it takes to re-read the source. Enable `snapshots_compaction` for DuckDB so the uploaded file is compact.

## Resource Allocation

### Kubernetes

Configure resource requests and limits based on workload:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: spice
spec:
  containers:
    - name: spice
      image: spiceai/spiceai:latest
      resources:
        requests:
          memory: '8Gi'
          cpu: '4'
        limits:
          memory: '12Gi'
          # Do not set CPU limits - can cause throttling
      volumeMounts:
        - name: data
          mountPath: /data # acceleration files and spill (runtime.query.temp_directory: /data/tmp)
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: spice-data # local NVMe PersistentVolume; see Local NVMe Storage on Kubernetes
```

For the volume itself — node types with NVMe, mounting the disks, and publishing them as PersistentVolumes — follow [Local NVMe Storage on Kubernetes](../deployment/kubernetes/local-nvme).

:::tip[CPU Limits]

Avoid setting CPU limits. CPU limits can cause [throttling](https://home.robusta.dev/blog/stop-using-cpu-limits) even when CPU is available, degrading query performance. Set CPU requests to guarantee scheduling.

To bound how wide Spice builds its thread pools without imposing a CFS quota, use [`runtime.cpu.cores`](spicepod/runtime#runtimecpucores) rather than `resources.limits.cpu`. It caps how much machine the runtime organizes itself around; it does not cap how much CPU the process may consume, so there is no throttling.

:::

Do not back the data or spill volume with `emptyDir: { medium: Memory }` — the files count against the container's memory limit, so a spill cannot relieve memory pressure and a large acceleration file becomes an OOM kill. See [Storage on Kubernetes](#storage-on-kubernetes) for the volume options.

#### Sizing the Runtime for its CPU Entitlement

The runtime sizes its thread pools, query fan-out, and accelerator concurrency from one CPU entitlement. Every CPU-derived pool scales with that number, and so does memory: worker threads, partitions, and per-plan operator reservations all grow with it, roughly linearly. A value far above the cores actually available buys nothing and costs both scheduling overhead and memory.

**A pod that follows the advice above — requests, no limits — is sized for a bounded multiple of its CPU request**, not for the whole node. A `requests.cpu: 4` pod on a 64-core node sizes for 8 cores. This is the default and needs no configuration: the Spice Helm chart and the Spice Kubernetes Operator both pass the pod's CPU request through automatically whenever one is set.

That default suits the common case — a pod scheduled against a request, sharing a node. Two deployments want something else:

| Intent                                                                                      | Configuration                            |
| ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Pack many mostly-idle instances on a node, each free to burst across the whole machine        | `runtime.cpu.cores: all`, small request  |
| Size for a specific number regardless of what the pod requests                                | `runtime.cpu.cores: 6`                   |
| Hard-cap CPU consumption because cluster policy requires it                                   | `resources.limits.cpu` (accepts throttling) |

```yaml
runtime:
  cpu:
    cores: all # every available core, regardless of the CPU request
               # (a CPU limit, if one is set, is still respected)
```

A hand-written pod spec that sets a CPU request but does not pass it through gets neither behavior — it falls back to sizing for the machine, and the runtime warns at startup naming the variable to set. See [Sizing from a CPU request](spicepod/runtime#sizing-from-a-cpu-request).

Compare `spiced_cpu_budget_cores` against `spiced_cpu_request_millicores` and `spiced_cpu_limit_millicores` to see what a pod sized for and what it was chosen against; the `source` label says which rung produced it. See [`runtime.cpu`](spicepod/runtime#runtimecpu).

### Storage Recommendations

| Storage Type                                        | Acceleration data files                      | Query spill files (`runtime.query.temp_directory`) |
| --------------------------------------------------- | -------------------------------------------- | -------------------------------------------------- |
| Local NVMe / SSD (instance store, bare metal)       | **Recommended**                              | **Recommended**                                    |
| Network block storage (EBS, Azure Disk, PD/Hyperdisk) | Durable fallback; provision IOPS; `storage_profile: ebs` where undetected | Acceptable; not the root volume  |
| RAM-backed (`tmpfs`, `emptyDir` `medium: Memory`)   | Small datasets only                          | Never                                              |
| Network file systems (NFS, SMB, EFS, Azure Files)   | Not recommended                              | Not recommended                                    |
| Object storage                                      | Cayenne on S3 Express One Zone; snapshots and the Cayenne cold tier on standard S3 | Not supported |
| HDD                                                 | Cold archives only                           | Not recommended                                    |

See [Storage](#storage) for the reasoning, the per-engine adjustments, and the platform specifics.

## Monitoring and Profiling

### Task History

Enable query plan capture for slow query analysis:

```yaml
runtime:
  task_history:
    enabled: true
    captured_plan: explain analyze
    min_sql_duration: 1s  # Only capture plans for queries >1s
```

### Metrics

Monitor key performance metrics:

- `query_duration_ms` - Query execution time
- `query_executions` - Query throughput
- `query_failures` with `err_code="ResourcesExhausted"` - Memory refusals and failed spills
- `query_memory_pool_used_bytes` against `process_resident_anon_bytes` - Pool usage versus off-pool memory
- `dataset_load_state` - Acceleration status
- Cache hit rates — SQL results, and `cayenne_segment_cache_hits` / `cayenne_segment_cache_accesses` for Cayenne

Storage-related metrics:

- `cayenne_data_storage_class` and `cayenne_metastore_storage_class` — the detected storage tier per table (`0` local SSD, `1` network-attached, `2` tmpfs, `3` unknown); `cayenne_data_storage_write_mibps` and `cayenne_metastore_storage_write_mibps` — the measured write throughput
- `cayenne_storage_bytes`, `cayenne_data_dir_bytes`, and `cayenne_metastore_db_bytes` / `cayenne_metastore_wal_bytes` — the on-disk footprint, see [storage footprint metrics](../components/data-accelerators/cayenne/deployment#storage-footprint-metrics)
- `cayenne_write_phase_duration_ms` by `phase` and `cayenne_compaction_duration_ms` — where write and compaction time goes; a rising `vortex_write` or `publish_commit` phase on an unchanged workload is the storage slowing down
- Host and cloud counters — device `await` and queue depth from `iostat`, free space on the data and spill volumes, and on AWS the EBS `VolumeQueueLength`, `BurstBalance`, `EBSIOBalance%`, and `EBSByteBalance%` metrics

See [Observability](../features/observability) for metric configuration.

## Performance Checklist

Use this checklist when optimizing Spice deployments:

- [ ] Select appropriate accelerator based on dataset size and query patterns
- [ ] Place acceleration files (`duckdb_file`, `sqlite_file`, `turso_file`, `cayenne_file_path`, `cayenne_metadata_dir`) on local NVMe/SSD, not the root volume, a network file system, or a RAM-backed mount
- [ ] Set `runtime.query.temp_directory` to a directory on local NVMe/SSD with 2–4× the largest spillable input free
- [ ] Set `storage_profile` explicitly where auto-detection cannot see the device (GCP Persistent Disk, SAN, non-Linux hosts)
- [ ] On network block storage, prefer a sub-millisecond tier (`io2` Block Express, Premium SSD v2, Hyperdisk Extreme), provision IOPS and throughput, and choose an instance whose EBS bandwidth sustains them; plan for instance-store data loss with snapshots or re-materialization
- [ ] Configure memory limits for DuckDB and/or Spice Cayenne caches
- [ ] Bound peak memory with `runtime.query.max_concurrent_queries` before lowering `runtime.query.memory_limit`
- [ ] Enable caching for repeated queries
- [ ] Use `refresh_mode: append` or `changes` for large and time-series data; set `on_full_refresh` on full-refreshed DuckDB files
- [ ] Sort accelerated data by filter columns (`sort_columns`, `on_refresh_sort_columns`, sorted views)
- [ ] Configure indexes for point lookup queries (DuckDB/SQLite)
- [ ] Set resource requests in Kubernetes; no CPU limit; `runtime.cpu.cores` to bound thread pools
- [ ] Enable observability for monitoring, including storage tier, footprint, and free-space metrics

## Related Documentation

**Spice Documentation:**

- [Managing Memory Usage](./memory) - Memory configuration reference
- [`acceleration.storage_profile`](spicepod/datasets#accelerationstorage_profile) - Storage profile reference
- [`runtime.query.temp_directory`](spicepod/runtime#runtimequerytemp_directory) - Temporary directory reference
- [Data Accelerators](../components/data-accelerators) - Accelerator documentation
- [Spice Cayenne Performance Tuning](../components/data-accelerators/cayenne/performance) - Spice Cayenne-specific tuning, including the storage tier
- [DuckDB Data Accelerator](../components/data-accelerators/duckdb) - DuckDB-specific tuning
- [Acceleration Snapshots](../features/data-acceleration/snapshots) - Fast cold starts on ephemeral storage
- [Read/Write Separation](../deployment/read-write-separation) - Read replicas on ephemeral storage
- [Kubernetes Deployment](../deployment/kubernetes) and [Helm storage class recommendations](../deployment/kubernetes/helm#storage-class-recommendations)
- [AWS](../deployment/aws), [Azure](../deployment/azure), and [GCP](../deployment/gcp) deployment guides - Platform-specific storage options
- [Caching](../features/caching) - Cache configuration
- [Observability](../features/observability) - Metrics and monitoring

**External References:**

- [Apache DataFusion](https://datafusion.apache.org/) - Query execution engine for Arrow and Spice Cayenne
- [DataFusion Configuration](https://datafusion.apache.org/user-guide/configs.html) - DataFusion configuration settings
- [DataFusion Tuning Guide](https://datafusion.apache.org/user-guide/configs.html#tuning-guide) - Performance tuning for DataFusion
- [DuckDB Environment Guide](https://duckdb.org/docs/stable/guides/performance/environment) - Disk, file system, and network storage guidance for DuckDB
- [DuckDB Indexing](https://duckdb.org/docs/stable/guides/performance/indexing) - Zone-maps and ART index documentation
- [How To Corrupt An SQLite Database File](https://www.sqlite.org/howtocorrupt.html) - SQLite on network file systems
- [Amazon EBS General Purpose volumes](https://docs.aws.amazon.com/ebs/latest/userguide/general-purpose.html), [Provisioned IOPS volumes](https://docs.aws.amazon.com/ebs/latest/userguide/provisioned-iops.html), and [EBS-optimized instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-optimized.html)
- [Amazon EC2 instance store data persistence](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-store-lifetime.html)
- [Azure managed disk types](https://learn.microsoft.com/azure/virtual-machines/disks-types) and [Google Cloud Local SSD](https://cloud.google.com/compute/docs/disks/local-ssd)
- [Kubernetes volumes](https://kubernetes.io/docs/concepts/storage/volumes/) - `emptyDir`, `local`, and memory-backed volumes
- [Vortex](https://github.com/vortex-data/vortex) - Columnar format used by Spice Cayenne
- [Vortex Benchmarks](https://bench.vortex.dev) - Performance benchmarks for Vortex
- [Apache Parquet File Format](https://parquet.apache.org/docs/file-format/) - Row groups, statistics, and Page Index
- [Iceberg Partitioning](https://iceberg.apache.org/docs/latest/partitioning/) - Hidden partitioning and partition evolution
- [Iceberg Performance](https://iceberg.apache.org/docs/latest/performance/) - Metadata filtering and column statistics
- [Delta Lake Optimizations](https://docs.delta.io/latest/optimizations-oss.html) - Data skipping, Z-ordering, and compaction
