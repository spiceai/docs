---
title: 'GitHub Data Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the GitHub data connector in production: PATs, rate limits, pagination, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - github
  - observability
---

Production operating guide for the GitHub data connector covering authentication, GitHub API rate limits, and operational tuning.

## Authentication & Secrets

The GitHub connector uses the GitHub REST and GraphQL APIs with a personal access token (PAT) or GitHub App installation token.

| Parameter       | Description                                                                     |
| --------------- | ------------------------------------------------------------------------------- |
| `github_token`  | PAT or installation token. Use `${secrets:...}` to resolve from a secret store. |

Tokens must be sourced from a [secret store](../../secret-stores/) in production. Scope the PAT to the minimum required permissions:

- Public repo data only: no token required, but see the rate-limit note below.
- Private repos: `repo` scope.
- Issues/PRs: `repo` (private) or `public_repo` (public).
- Org-level data: `read:org`.

For long-running deployments, prefer GitHub App tokens (installation tokens) over user PATs — they have higher rate limits (15,000/hr vs 5,000/hr per authenticated user) and are not tied to a specific user account.

## Resilience Controls

### Rate Limiting

GitHub's REST API rate limits:

| Auth mode                   | Limit                 |
| --------------------------- | --------------------- |
| Unauthenticated             | 60 requests/hr per IP |
| Authenticated (PAT)         | 5,000 requests/hr     |
| GitHub App installation     | 15,000 requests/hr    |
| Enterprise Server (typical) | Configurable          |

The connector respects GitHub's `Retry-After` and `X-RateLimit-Reset` headers and backs off accordingly. When the remaining budget falls below a small threshold, requests pause until the next reset window.

### Pagination

GitHub paginates at 100 items per page. Datasets backed by high-volume endpoints (e.g., `repos.commits` on a monorepo) may require many hours to initially hydrate. Use incremental acceleration with a `since` filter where possible.

### Retry Behavior

Transient 5xx responses are retried with exponential backoff up to a bounded retry count. Permanent errors (401 Unauthorized, 404 Not Found, 422 Validation Failed) surface immediately.

## Capacity & Sizing

- **Throughput**: Bounded by the rate limit, not network or CPU. Plan dataset refresh intervals to stay within the hourly budget.
- **Latency**: Expect ~100-500ms per paginated request against `github.com`; lower for GitHub Enterprise Server on the same network.
- **Initial bootstrap**: For high-volume datasets (e.g., all commits in a busy monorepo), the first materialization may exhaust the hourly budget across several runs. Plan staged ingestion if needed.

## Metrics

The GitHub connector does not register connector-specific dataset-level instruments in the current release. Monitor via:

- Spice query execution metrics (`query_duration_ms`, `query_returned_rows`, `query_failures_total`) from `runtime.metrics`.
- HTTP response status distribution via the shared `resilient_http` instrumentation.
- GitHub's own rate-limit UI at `/settings/tokens` for token-level quota tracking.

See [Component Metrics](../../../features/observability/component_metrics) for general configuration.

## Task History

GitHub API calls participate in [task history](../../../reference/task_history) through the HTTP client's span. Each page fetch is a child of the enclosing `sql_query` or `accelerated_table_refresh` task.

## Known Limitations

- **Read-only**: The connector is read-only; writes (issue creation, PR comments) are not supported.
- **GraphQL-only endpoints**: Some GitHub data (e.g., discussions, project v2) requires GraphQL; check the connector's documented supported endpoints.
- **GitHub Enterprise Cloud with IP allowlisting**: The Spice runtime's outbound IP must be allow-listed.
- **Secondary rate limits**: GitHub enforces abuse-detection "secondary" rate limits on concentrated bursts, independent of the hourly primary limit. If hit, the connector backs off.

## Troubleshooting

| Symptom                                          | Likely cause                                          | Resolution                                                                                                |
| ------------------------------------------------ | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `401 Bad credentials`                            | PAT expired / revoked / wrong value.                  | Rotate the PAT; update the secret store.                                                                  |
| `403 rate limit exceeded`                        | Primary hourly rate limit hit.                        | Increase refresh interval; switch to GitHub App auth for higher quota; use incremental refresh with `since`. |
| `403 Secondary rate limit`                       | Burst of concurrent requests tripped abuse detection. | Reduce concurrent refresh; connector will back off automatically.                                         |
| `404 Not Found` on a private repo                | Token lacks `repo` scope.                             | Regenerate PAT with `repo` scope.                                                                         |
| Very slow initial hydration                      | Large dataset + strict rate limit.                    | Run first refresh off-peak; use `since`/`updated_since` for incremental refreshes.                        |
