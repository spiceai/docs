

# Security at Spice AI

**Last updated:** December 18, 2024

Spice AI's approach to security when providing services including Spice.ai Cloud, data.spiceai.io, and spicerack.org.

To report a vulnerability, see: [report.md](report.md "mention")

### Principles

Spice AI takes a principled approach to security. These principles include:

* **Compliance**: Certified SOC 2 Type II compliance.
* **Secure-Access-Control:** All Spice AI systems are protected by Secure-Access-Controls including Authentication (AuthN), Authorization (AuthZ), and RBAC (Role-Based-Access-Control).
* **Data Protection:** All secret and sensitive information is encrypted in-transit and at-rest.
* **Multi-Factor-Authentication (MFA):** All authentication systems require and enforce Multi-Factor-Authentication (MFA).
* **Least Privilege:** Least-Privilege-Access is employed so that users, employees, and contractors do not have greater access than necessary.
* **Defense-in-Depth:** Multiple security controls in depth.
* **Auditable:** Access and usage are logged and auditable.
* **Secure Code:** Code is scanned and tested for secrets and vulnerabilities.
* **Code Audits**: Codebases are audited by internal and external experts to identify and address vulnerabilities, maintain best practices, and ensure adherence to security standards.
* **Just-In-Time Access:** Access is given only when it's required.

### Compliance

Spice AI, Inc. has achieved SOC 2 Type II compliance in accordance with American Institute of Certified Public Accountants (AICPA) standards for SOC for Service Organizations also known as SSAE 18. Achieving this standard with an unqualified opinion serves as third-party industry validation that Spice AI, Inc. provides enterprise-level security for customer’s data secured in the Spice AI, Inc. System.

Spice AI, Inc. was audited by [Prescient Assurance](http://www.prescientassurance.com/) , a leader in security and compliance attestation for B2B, SAAS companies worldwide. Prescient Assurance is a registered public accounting in the US and Canada and provides risk management and assurance services which includes but is not limited to SOC 2, PCI, ISO, NIST, GDPR, CCPA, HIPAA, and CSA STAR. For more information about Prescient Assurance, you may reach out them at [info@prescientassurance.com](mailto:info@prescientassurance.com).

A copy of the SOC 2 Audit Report is available to customers subscribed to the [Spice.ai Enterprise plan](../pricing/plans.md) upon request.

![image](/img/cloud/SOC 2.png)

### Secure Access Control

Spice AI corporate, development, and production systems are protected by Single-Sign-On (SSO) Secure-Access-Controls. This includes secure Authentication (AuthN) and role/group based Authorization (AuthZ).

### Data Protection

Corporate and production secrets are encrypted at-rest and in-transit. Corporate secrets are stored and managed in a enterprise-grade password manager with SSO access. Service secrets are stored and managed in platform specific secure key vaults and key stores. A minimum of TLS 1.2+ is employed for encrypted transmission.

### Multi-Factor-Authentication (MFA)

All all access requires and enforces Multi-Factor-Authentication (MFA) where possible.

### Least Privilege

Least-Privilege-Access is employed so that users and employees do not have greater access than necessary.

### Defense-in-Depth

Spice AI employs multiple levels of security, including Firewalls and Bastions for access into private networks, user, service, and machine authentication and authorization.

### Deployment Environments and Controls

Deployment environments, such as Development, Production, etc. are utilized and segregated. Controls including approvals for deploying to Production environments are used, enforced, and logged.

### Auditable

Access is logged and auditable.

### Secure Code & Patch Management

Code is scanned and tested for secrets and vulnerabilities during Continuous Integration (CI) systems, using [GitHub Security](https://docs.github.com/en/code-security) features like Dependabot, CodeQL, and Secrets Scanner. Base level operating systems and container images are monitored, upgraded, and updated on regular cycles.

### Code Audits

Spice AI conducts regular code audits, leveraging both internal expertise and independent third-party security firms. These audits identify potential vulnerabilities, validate compliance with industry standards, and ensure that best practices for secure software development are consistently followed.

### Just-In-Time Access

No-standing-access is enforced, with users only given access when required (JIT) and for a limited period of time.
