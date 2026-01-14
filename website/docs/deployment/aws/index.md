---
title: 'AWS Deployment Options'
description: 'Guide to deploying Spice.ai applications on Amazon Web Services (AWS)'
sidebar_label: 'Deployment'
sidebar_position: 1
pagination_next: null
---

Spice.ai provides multiple deployment options on Amazon Web Services (AWS), enabling data and AI applications to run on AWS's elastic infrastructure. Whether using virtual machines, container orchestration, or managed services, Spice deploys to meet requirements for performance, scalability, and cost efficiency.

For a complete list of AWS-compatible data connectors, AI models, vector stores, and secret management, see [AWS Integrations](./integrations.md).

## Benefits of Deploying on AWS

- **Scalability**: Easily scale your Spice.ai applications with AWS's elastic infrastructure.
- **Global Reach**: Deploy across AWS's [worldwide regions](https://aws.amazon.com/about-aws/global-infrastructure/) for low-latency access.
- **Integration**: Connect with other AWS services like [Amazon S3](https://aws.amazon.com/s3/), [Amazon RDS](https://aws.amazon.com/rds/), and [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/).
- **Cost Control**: Optimize expenses with various [instance types](https://aws.amazon.com/ec2/instance-types/) and [pricing models](https://aws.amazon.com/pricing/).
- **Security and Compliance**: Deploy Spice.ai within your AWS security perimeter using features like [VPC](https://aws.amazon.com/vpc/) isolation, [security groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html), [IAM roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) to meet organizational compliance requirements.

## Deployment Options

### Amazon EKS (Elastic Kubernetes Service)

Leverage [Kubernetes](https://kubernetes.io/) orchestration with [Amazon EKS](https://aws.amazon.com/eks/) for containerized Spice.ai deployments.

1. **Create an EKS Cluster**:
   - Use the [AWS Management Console](https://console.aws.amazon.com/eks/), [AWS CLI](https://docs.aws.amazon.com/cli/latest/reference/eks/), or [eksctl](https://eksctl.io/) to create your cluster
   - Configure [node groups](https://docs.aws.amazon.com/eks/latest/userguide/managed-node-groups.html) according to your workload requirements
   - (Optional) Use [EKS Fargate profiles](https://docs.aws.amazon.com/eks/latest/userguide/fargate.html) for serverless container deployment

2. **Deploy Spice.ai on EKS**:
   - Apply Spice.ai Kubernetes manifests via [Helm chart](https://spiceai.org/docs/deployment/kubernetes)
   - Configure persistent storage using [Amazon EBS](https://aws.amazon.com/ebs/) or [Amazon EFS](https://aws.amazon.com/efs/)
   - Set up ingress with the [AWS Network Load Balancer (NLB)](https://docs.aws.amazon.com/eks/latest/userguide/network-load-balancing.html)
   - (Optional) Automate cluster and resource provisioning with Infrastructure as Code (IaC) tools such as [AWS CloudFormation](https://aws.amazon.com/cloudformation/) or [Terraform](https://www.terraform.io/) for consistent, repeatable deployments

For comprehensive instructions and advanced configuration options, refer to the [Amazon EKS User Guide](https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html), [EKS Best Practices Guide](https://aws.github.io/aws-eks-best-practices/), and [Spice.ai Kubernetes Deployment Guide](https://spiceai.org/docs/deployment/kubernetes).

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

Deploy Spice.ai as containerized tasks on [Amazon ECS](https://aws.amazon.com/ecs/) for easy container management and flexible scaling.

1. **Create an ECS Cluster**:
    - Choose a launch type: [EC2](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html#ec2-launch-type) (manage your own EC2 instances) or [Fargate](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html#fargate-launch-type) (serverless).
    - Create the ECS cluster using the [AWS Console](https://console.aws.amazon.com/ecs/), [CLI](https://docs.aws.amazon.com/cli/latest/reference/ecs/), or Infrastructure as Code ([CloudFormation](https://aws.amazon.com/cloudformation/), [Terraform](https://www.terraform.io/)).

2. **Define a Task Definition**:
    - Specify the [Spice.ai Docker image](https://hub.docker.com/r/spiceai/spiceai), resource needs, networking, environment variables, and storage in a [Task Definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html).
    - (Optional) Use [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) or [Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) to inject secrets securely.
    - Enable logging with [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/).

3. **Deploy Spice.ai on ECS**:
    - Create an [ECS Service](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs_services.html) to run and manage Spice.ai tasks.
    - Set up load balancing with [NLB](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html).
    - (Optional) Configure [auto-scaling](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-auto-scaling.html) based on resource usage or CloudWatch metrics.
    - (Optional) Use [CI/CD pipelines](https://aws.amazon.com/devops/continuous-delivery/) for automated updates. Manage infrastructure with CloudFormation, Terraform, or the AWS CLI.

For more details, see the [Amazon ECS Developer Guide](https://docs.aws.amazon.com/ecs/latest/developerguide/Welcome.html) and [Spice.ai Docker Deployment Guide](https://spiceai.org/docs/deployment/docker).

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

- [AWS Integrations](./integrations.md) - Complete list of AWS data connectors, AI models, vector stores, and secrets
- [AWS Secrets Manager Secret Store](/docs/components/secret-stores/aws-secrets-manager)

### AWS Blog Posts

- [Architecting High-Performance AI-Driven Data Applications with Spice.ai and AWS](https://aws.amazon.com/blogs/storage/architecting-high-performance-ai-driven-data-applications-with-spice-ai-and-aws/) - AWS Storage Blog

### Spice.ai Blog Posts

- [Amazon S3 Vectors](https://spice.ai/blog/amazon-s3-vectors) - Overview of S3 Vectors integration
- [Getting Started with Amazon S3 Vectors and Spice](https://spice.ai/blog/getting-started-with-amazon-s3-vectors-and-spice) - Step-by-step tutorial

### Videos

- [Getting started with Amazon S3 Vectors and Spice](https://www.youtube.com/watch?v=KuWI0yDOnIU) - YouTube walkthrough

### Marketplace

- [Spice.ai on AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-jmf6jskjvnq7i) - Deploy Spice.ai from AWS Marketplace
