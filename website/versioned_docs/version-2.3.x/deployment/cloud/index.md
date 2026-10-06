---
title: 'Spice Cloud Platform'
description: 'Managed Spice.ai hosting, and connecting a self-hosted instance to it with Cloud Connect.'
sidebar_label: 'Spice Cloud Platform'
keywords: [spice.ai, spice cloud platform, managed, cloud connect]
sidebar_position: 6
---

The Spice Cloud Platform is managed hosting for data and AI applications, powered by Spice.ai OSS. It provides high-speed SQL queries, LLM inference, vector search, and retrieval-augmented generation without any infrastructure to operate.

An application can reach the platform two ways, and they are not exclusive:

| Approach                                  | Where the runtime runs         | Where the data goes             |
| ----------------------------------------- | ------------------------------ | ------------------------------- |
| Managed hosting                           | on Spice Cloud                 | to the platform's compute       |
| [Cloud Connect](./cloud-connect/index.md) | on a host an operator controls | nowhere — it stays on that host |

**Cloud Connect** is the second row: a self-hosted instance enrolls with the platform and becomes monitorable and configurable from the same portal, while its data never leaves the host. Spicepods and secrets are deployed to it from the portal, and it reports health, queries, and metrics back. See [Cloud Connect](./cloud-connect/index.md) for the connection methods — [a development machine](./cloud-connect/development.md), [a managed service](./cloud-connect/service.md), or [a container](./cloud-connect/headless.md).

## Managed hosting

1. **Sign up** at [spice.ai](https://spice.ai/login).
2. **Configure** datasets, models, and workflows in the portal.
3. **Deploy** applications and agents.
4. **Monitor** with the platform's built-in observability, and scale as required.

The [Spice.ai Cloud Platform documentation](https://docs.spice.ai/) covers the platform's own configuration in full.

## Security and compliance

The platform is SOC 2 Type II compliant. Sensitive data is encrypted in transit and at rest, access uses multi-factor authentication and role-based access control, access and usage are logged for audit, and least privilege is enforced. The [Spice.ai security documentation](https://docs.spice.ai/security/security) has the details.

A Cloud Connect instance narrows the surface further: the platform holds an issued instance identity rather than an operator's login, delivered secret values stay inside the runtime process, and the instance dials out — Spice Cloud never opens an inbound connection to it.
