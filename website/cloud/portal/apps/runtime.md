---
description: Configuring Spice.ai runtime for your Spice application
---

# Runtime

![image](/img/cloud/CleanShot 2026-01-06 at 07.10.14@2x.png)

Navigate to `Settings` -> `Runtime` to configure the runtime settings for your Spice application.

### Runtime Version

The runtime version determines the Spice.ai Open Source version for your Spice application. Each new deployment automatically adopts the latest stable version of the Spice runtime to ensure access to the most recent features and optimizations.

![image](/img/cloud/CleanShot 2026-01-06 at 07.10.46@2x.png)

### Runtime Region

The runtime region specifies the geographic location of the data center hosting your Spice application. Region selection optimizes latency, compliance, and performance based on your business needs.

* **Availability**: Region selection is exclusive to Enterprise plan customers.
* **Supported Regions**:
  * **North America**:
    * **US East (N. Virginia)** - `us-east-1` (AWS)
    * **US West (Oregon)** - `us-west-2` (AWS)

![image](/img/cloud/CleanShot 2026-01-06 at 07.10.28@2x.png)

### Compute

Compute settings define the resource allocation for your Spice application, balancing performance and cost.

**Standard Compute Instances**:

* **Developer**: 2 CPU / 4 GB
* **Pro for Teams**: 4 CPU / 8 GB
* **Enterprise**: Dedicated Instances with multiple high-availability replicas

![image](/img/cloud/Screenshot 2025-07-08 at 21.15.52.png)

### Storage

Provides a persistent storage for the runtime to save data acceleration files. Data remains intact across restarts and redeployments.

* **Availability**: Storage is exclusive to Enterprise plan customers.
* **Mount Path**: `/data`.
* **Size**: Configured per request. Contact your account executive to set or update capacity.

![app runtime storage settings](/img/cloud/CleanShot 2025-08-11 at 19.42.22@2x.png)
