---
title: 'AWS Deployment Options'
description: 'Guide to deploying Spice.ai applications on Amazon Web Services (AWS)'
sidebar_label: 'AWS'
sidebar_position: 1
pagination_next: null
---

Spice.ai provides multiple deployment options on Amazon Web Services (AWS), enabling data and AI applications to run on AWS's elastic infrastructure. Whether using virtual machines, container orchestration, or managed services, Spice deploys to meet requirements for performance, scalability, and cost efficiency.

For a complete list of AWS-compatible data connectors, AI models, vector stores, and secret management, see [AWS Integrations](aws/integrations).

## Benefits of Deploying on AWS

- **Scalability**: Easily scale your Spice.ai applications with AWS's elastic infrastructure.
- **Global Reach**: Deploy across AWS's [worldwide regions](https://aws.amazon.com/about-aws/global-infrastructure/) for low-latency access.
- **Integration**: Connect with other AWS services like [Amazon S3](https://aws.amazon.com/s3/), [Amazon RDS](https://aws.amazon.com/rds/), and [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/).
- **Cost Control**: Optimize expenses with various [instance types](https://aws.amazon.com/ec2/instance-types/) and [pricing models](https://aws.amazon.com/pricing/).
- **Security and Compliance**: Deploy Spice.ai within your AWS security perimeter using features like [VPC](https://aws.amazon.com/vpc/) isolation, [security groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html), [IAM roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) to meet organizational compliance requirements.

## Deployment Options

### Amazon EKS (Elastic Kubernetes Service)

Run Spice.ai on [Amazon EKS](https://aws.amazon.com/eks/) when the workload benefits from Kubernetes orchestration, multi-replica scale, declarative configuration, or shared cluster tenancy. EKS pairs well with the [Spice Helm chart](https://spiceai.org/docs/deployment/kubernetes/helm) and the [Argo CD](https://spiceai.org/docs/deployment/kubernetes/argocd) or [Flux](https://spiceai.org/docs/deployment/kubernetes/flux) GitOps workflows.

#### 1. Provision the cluster

The fastest path is [`eksctl`](https://eksctl.io/), which provisions the VPC, IAM roles, and node groups in a single command:

```bash
eksctl create cluster \
  --name spiceai-prod \
  --region us-east-1 \
  --version 1.31 \
  --nodegroup-name workers \
  --node-type m6i.xlarge \
  --nodes 3 --nodes-min 2 --nodes-max 6 \
  --managed \
  --with-oidc
```

`--with-oidc` enables the [OIDC provider](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html) required for IAM Roles for Service Accounts (IRSA). For production, prefer Terraform or CloudFormation for repeatable provisioning. The community [`terraform-aws-modules/eks`](https://github.com/terraform-aws-modules/terraform-aws-eks) module is a common starting point.

For burst or low-utilization workloads, attach an [EKS Fargate profile](https://docs.aws.amazon.com/eks/latest/userguide/fargate-profile.html) so Spice pods run on serverless capacity instead of managed nodes.

#### 2. Configure IRSA for AWS access

Most Spice connectors (S3, DynamoDB, Bedrock, Glue) accept AWS credentials from the environment. Use IRSA so pods receive scoped, short-lived credentials without static keys:

```bash
# 1. Create an IAM policy with the permissions the Spicepod needs
aws iam create-policy \
  --policy-name SpiceAIRuntime \
  --policy-document file://spiceai-policy.json

# 2. Bind the policy to a Kubernetes ServiceAccount via IRSA
eksctl create iamserviceaccount \
  --name spiceai \
  --namespace spiceai \
  --cluster spiceai-prod \
  --attach-policy-arn arn:aws:iam::123456789012:policy/SpiceAIRuntime \
  --approve
```

Reference the service account from the Helm release so Spice pods inherit the role:

```yaml
# values.yaml
serviceAccount:
  create: false
  name: spiceai
```

For [EKS Pod Identity](https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html) (the newer alternative to IRSA), associate the role with `aws eks create-pod-identity-association` and skip the OIDC setup step.

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

- **Local NVMe (recommended)** — Spice acceleration is latency- and IOPS-sensitive, so the lowest-latency option is a node-local NVMe SSD on an instance-store-backed family (`i4i`, `i7ie`, `m6id`, `m7gd`, `c7gd`, `r7gd` and other `d`-suffixed instances). Provision the [NVMe local volume](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-store-volumes.html) with the [Local Volume Static Provisioner](https://github.com/kubernetes-sigs/sig-storage-local-static-provisioner) or use [Bottlerocket's `local-volume-provisioner`](https://github.com/bottlerocket-os/bottlerocket) to expose it as a `local-storage` StorageClass. Note that local volumes do not survive node replacement, so pair with a refresh strategy or a re-hydration source.
- **Amazon EBS io2 Block Express** — when shared / replica-attachable persistence is required and node-local capacity is insufficient, [`io2`](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html#io2-bx) delivers up to 256K IOPS and sub-millisecond latency. Use the [Amazon EBS CSI driver](https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html) and a custom StorageClass with `type: io2` and a provisioned `iops` value.
- **Amazon EBS gp3** — use `gp3` (with provisioned IOPS bumped above the 3,000 baseline) only when `io2` is unavailable in a region or when cost outweighs the latency improvement.
- **Amazon S3 Express One Zone (Cayenne only)** — for Cayenne acceleration that needs to be shared across replicas or persisted independently of the pod lifecycle, [S3 Express One Zone](https://aws.amazon.com/s3/storage-classes/express-one-zone/) provides single-digit-millisecond latency single-AZ object storage. Configure Cayenne to point at an S3 Express directory bucket — see the [Cayenne acceleration documentation](../../components/data-accelerators/cayenne).
- Set `stateful.enabled: true` and `stateful.storageClass: <chosen-class>` in `values.yaml`.

:::tip
Amazon EFS works for sharing data across replicas but is not recommended for accelerations: NFS-style latency negates the benefit of using an accelerator. Reserve EFS for stateless artefacts that need to survive pod replacement.
:::

:::tip[Spice.ai Enterprise]
For production stateful workloads, the [Spice.ai Enterprise](https://spice.ai) Operator's [`SpicepodSet`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodset) provides per-replica `StatefulSet`s with automatic PVC resizing, IRSA-aware ServiceAccount annotations, and configurable update strategies. For distributed query execution across scheduler/executor tiers backed by S3, see [`SpicepodCluster`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodcluster).
:::

To expose Spice externally, install the [AWS Load Balancer Controller](https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html) and front the Spice Service with a [Network Load Balancer](https://docs.aws.amazon.com/eks/latest/userguide/network-load-balancing.html):

```yaml
# values.yaml
service:
  type: LoadBalancer
  additionalAnnotations:
    service.beta.kubernetes.io/aws-load-balancer-type: external
    service.beta.kubernetes.io/aws-load-balancer-nlb-target-type: ip
    service.beta.kubernetes.io/aws-load-balancer-scheme: internal
```

#### 5. Observability

The Spice Helm chart ships a `PodMonitor` resource for the [Prometheus Operator](https://prometheus-operator.dev/). For EKS, the [`kube-prometheus-stack`](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) chart and [Amazon Managed Service for Prometheus](https://aws.amazon.com/prometheus/) are common targets. Set `monitoring.podMonitor.enabled: true` and import the [Spice Grafana dashboard](../monitoring/grafana).

For comprehensive guidance, refer to the [Amazon EKS User Guide](https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html), the [EKS Best Practices Guide](https://aws.github.io/aws-eks-best-practices/), and the [Spice.ai Kubernetes Deployment Guide](https://spiceai.org/docs/deployment/kubernetes).

### EC2 / AWS CloudFormation

Deploy Spice.ai directly on [Amazon EC2](https://aws.amazon.com/ec2/) instances for maximum control over the environment.

1. **Manual EC2 Deployment**:
   - Launch an [EC2 instance](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html) with your preferred Linux distribution
   - Install [Docker](https://docs.docker.com/engine/install/)
   - Run [Spice.ai as a Docker Container](https://spiceai.org/docs/deployment/docker#running-spiceai-as-a-docker-container) on your EC2 instance
   - (Optional) Use Infrastructure as Code (IaC) tools like [AWS CloudFormation](https://aws.amazon.com/cloudformation/) or [Terraform](https://www.terraform.io/) to automate the provisioning, configuration, and management of EC2 resources for repeatable and consistent deployments

2. **Automated EC2 Deployment with CloudFormation**:
    - Define your infrastructure in a [CloudFormation template](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-guide.html), including EC2 instances (using a [Linux AMI](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html)), security groups, IAM roles, VPC, and subnets
    - Use EC2 [`UserData`](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html) to automate Docker installation, pull the [Spice.ai Docker image](https://hub.docker.com/r/spiceai/spiceai), retrieve configuration or secrets from [AWS Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) or [Secrets Manager](https://aws.amazon.com/secrets-manager/), and run the container with required environment variables
    - (Optional) Add [parameters](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/parameters-section-structure.html) to your template for VPC ID, Subnet ID, [KeyPair](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html), instance type, and secret names to enable flexible deployments
    - (Optional) Store sensitive data such as API keys in [Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) or [Secrets Manager](https://aws.amazon.com/secrets-manager/) and reference them securely in `UserData`
    - (Optional) Deploy and manage your CloudFormation stack using the [AWS Console](https://console.aws.amazon.com/cloudformation/), [CLI](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/), or [CI/CD pipelines](https://aws.amazon.com/devops/continuous-delivery/) for repeatable, version-controlled infrastructure

For detailed guidance and best practices, refer to the [AWS CloudFormation User Guide](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html), [EC2 User Guide for Linux Instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/), and [AWS Systems Manager Parameter Store Documentation](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).

### Amazon ECS (Elastic Container Service)

Run Spice.ai on [Amazon ECS](https://aws.amazon.com/ecs/) when a single managed container is sufficient and operating Kubernetes is not desired. ECS Fargate provides serverless capacity; ECS on EC2 provides full control over the host. Both consume the same task definition.

#### 1. Define the task

Create a task definition for the [`spiceai/spiceai` image](https://hub.docker.com/r/spiceai/spiceai), exposing port `8090` (HTTP) and, optionally, `50051` (Arrow Flight) and `9090` (Prometheus). Inject secrets from [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) or [SSM Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) instead of baking them into the image.

`spiceai-task.json`:

```json
{
  "family": "spiceai",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/SpiceAITaskRole",
  "containerDefinitions": [
    {
      "name": "spiceai",
      "image": "spiceai/spiceai:1.11.5",
      "essential": true,
      "portMappings": [
        { "containerPort": 8090, "protocol": "tcp" },
        { "containerPort": 50051, "protocol": "tcp" }
      ],
      "environment": [
        { "name": "SPICED_LOG", "value": "INFO" }
      ],
      "secrets": [
        {
          "name": "SPICE_SECRET_SPICEAI_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:spiceai/api-key"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "wget -q --spider http://localhost:8090/health || exit 1"],
        "interval": 10,
        "timeout": 3,
        "retries": 5,
        "startPeriod": 30
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/spiceai",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "spiceai"
        }
      }
    }
  ]
}
```

Register the task:

```bash
aws ecs register-task-definition --cli-input-json file://spiceai-task.json
```

The `executionRoleArn` (typically `ecsTaskExecutionRole`) needs `secretsmanager:GetSecretValue` and `ssm:GetParameters` permissions to inject secrets. The `taskRoleArn` is the role Spice itself assumes at runtime — grant it the AWS permissions the Spicepod needs (for example, `s3:GetObject` on referenced buckets, `bedrock:InvokeModel` for Bedrock models).

#### 2. Create the service

```bash
aws ecs create-service \
  --cluster spiceai-cluster \
  --service-name spiceai \
  --task-definition spiceai \
  --launch-type FARGATE \
  --desired-count 2 \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-aaa,subnet-bbb],securityGroups=[sg-xxx],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/spiceai/abc,containerName=spiceai,containerPort=8090" \
  --health-check-grace-period-seconds 60
```

Front the service with a [Network Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html) (low-latency TCP) or an [Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html) (HTTP routing, TLS termination). For internal-only deployments, place the service in private subnets and set `assignPublicIp=DISABLED`.

#### 3. Persistent storage

Spice accelerations are latency- and IOPS-sensitive. Choose the storage type based on launch type and sharing requirements:

- **ECS on EC2 with local NVMe (recommended for accelerations)** \u2014 launch the cluster on an instance-store-backed family (`i4i`, `i7ie`, `m6id`, `m7gd`, `c7gd`, `r7gd`, etc.) and bind-mount the NVMe device into the task. This delivers the lowest latency and highest IOPS available on AWS but does not survive instance replacement, so pair with a refresh strategy.\n- **Amazon EBS volume attached to an ECS service (EC2 launch type)** \u2014 use the [EBS volume task configuration](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ebs-volumes.html) with `volumeType: io2` for high-IOPS, low-latency block storage that survives task restarts. Fall back to `gp3` (with provisioned IOPS) when `io2` is unavailable in the region.\n- **Amazon S3 Express One Zone (Cayenne only)** \u2014 for Cayenne acceleration that needs to be shared across tasks or persisted independently of task lifecycle, [S3 Express One Zone](https://aws.amazon.com/s3/storage-classes/express-one-zone/) provides single-digit-millisecond latency. Configure Cayenne against an S3 Express directory bucket \u2014 see the [Cayenne acceleration documentation](../../components/data-accelerators/cayenne).\n- **Amazon EFS (Fargate-only fallback)** \u2014 EFS is the only persistent storage option supported by Fargate, but its NFS-style latency is not recommended for accelerations. Use it only for stateless artefacts that must survive task replacement, or switch to the EC2 launch type when low-latency local storage is required.

```json
"volumes": [
  {
    "name": "spice-data",
    "efsVolumeConfiguration": {
      "fileSystemId": "fs-0123456789abcdef0",
      "rootDirectory": "/spiceai",
      "transitEncryption": "ENABLED"
    }
  }
],
"containerDefinitions": [
  {
    "name": "spiceai",
    "mountPoints": [
      { "sourceVolume": "spice-data", "containerPath": "/data" }
    ]
  }
]
```

In the Spicepod, point file accelerators at `/data`, for example `duckdb_file: /data/taxi_trips.db`.

#### 4. Auto-scaling

Configure [service auto-scaling](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-auto-scaling.html) on average CPU or on custom CloudWatch metrics derived from the Spice `/v1/metrics` endpoint:

```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/spiceai-cluster/spiceai \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 --max-capacity 10
```

For comprehensive details, see the [Amazon ECS Developer Guide](https://docs.aws.amazon.com/ecs/latest/developerguide/Welcome.html) and the [Spice.ai Docker Deployment Guide](https://spiceai.org/docs/deployment/docker).

## Authentication

Most AWS services that Spice connects to have explicit parameters for configuring authentication (usually by setting an `access_key_id` and `secret_access_key`). If explicit credentials are not provided, Spice follows the standard AWS SDK behavior for loading credentials from the environment based on the following sources in order:

1. **Environment Variables**:
   - `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
   - `AWS_SESSION_TOKEN` (if using temporary credentials)

2. **Shared AWS Config/Credentials Files**:
   - Config file: `~/.aws/config` (Linux/Mac) or `%UserProfile%\.aws\config` (Windows)
   - Credentials file: `~/.aws/credentials` (Linux/Mac) or `%UserProfile%\.aws\credentials` (Windows)
   - The `AWS_PROFILE` environment variable can be used to specify a named profile, otherwise the `[default]` profile is used.
   - Supports both static credentials and SSO sessions
   - Example credentials file:

     ```ini
     # Static credentials
     [default]
     aws_access_key_id = YOUR_ACCESS_KEY
     aws_secret_access_key = YOUR_SECRET_KEY

     # SSO profile
     [profile sso-profile]
     sso_start_url = https://my-sso-portal.awsapps.com/start
     sso_region = us-west-2
     sso_account_id = 123456789012
     sso_role_name = MyRole
     region = us-west-2
     ```

   :::tip
   To set up SSO authentication:
   1. Run `aws configure sso` to configure a new SSO profile
   2. Use the profile by setting `AWS_PROFILE=sso-profile`
   3. Run `aws sso login --profile sso-profile` to start a new SSO session
   :::

3. **AWS STS Web Identity Token Credentials**:
   - Used primarily with OpenID Connect (OIDC) and OAuth
   - Common in Kubernetes environments using IAM roles for service accounts (IRSA)

4. **ECS Container Credentials**:
   - Used when running in Amazon ECS containers
   - Automatically uses the task's IAM role
   - Retrieved from the ECS credential provider endpoint
   - Relies on the environment variable `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` or `AWS_CONTAINER_CREDENTIALS_FULL_URI` which are automatically injected by ECS.

5. **AWS EC2 Instance Metadata Service (IMDSv2)**:
   - Used when running on EC2 instances.
   - Automatically uses the instance's IAM role.
   - Retrieved securely using [IMDSv2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html).

The connector will try each source in order until valid credentials are found. If no valid credentials are found, an authentication error will be returned.

:::note[IAM Permissions]
Regardless of the credential source, the IAM role or user must have appropriate permissions (e.g., `s3:ListBucket`, `s3:GetObject`) to access the service. If the Spicepod connects to multiple different AWS services, the permissions should cover all of them.
:::

## Resources

### Documentation

- [AWS Integrations](aws/integrations) - Complete list of AWS data connectors, AI models, vector stores, and secrets
- [AWS Secrets Manager Secret Store](../components/secret-stores/aws-secrets-manager)

### AWS Blog Posts

- [Architecting High-Performance AI-Driven Data Applications with Spice.ai and AWS](https://aws.amazon.com/blogs/storage/architecting-high-performance-ai-driven-data-applications-with-spice-ai-and-aws/) - AWS Storage Blog

### Spice.ai Blog Posts

- [Amazon S3 Vectors](https://spice.ai/blog/amazon-s3-vectors) - Overview of S3 Vectors integration
- [Getting Started with Amazon S3 Vectors and Spice](https://spice.ai/blog/getting-started-with-amazon-s3-vectors-and-spice) - Step-by-step tutorial

### Videos

- [Getting started with Amazon S3 Vectors and Spice](https://www.youtube.com/watch?v=KuWI0yDOnIU) - YouTube walkthrough

### Marketplace

- [Spice.ai on AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-jmf6jskjvnq7i) - Deploy Spice.ai from AWS Marketplace
