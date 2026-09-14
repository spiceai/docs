---
title: 'GitHub Data Connector'
sidebar_label: 'GitHub Data Connector'
description: 'GitHub Data Connector Documentation'
tags: ['data-connectors', 'github', 'sql', 'api', 'integration']
---

The GitHub Data Connector enables federated SQL queries on various GitHub resources such as files, issues, pull requests, and commits by specifying `github` as the selector in the `from` value for the dataset.

## Common Configuration

## Configuration

### `from`

The `from` field specifies the GitHub resource to query. The owner and repository name are extracted from the path (e.g., `github:github.com/spiceai/spiceai/issues` targets the `spiceai/spiceai` repository). It supports the following formats:

| Format                                         | Description                                               |
| ---------------------------------------------- | --------------------------------------------------------- |
| `github:github.com/<owner>/<repo>/files/<ref>` | Query files from a repository at a specific branch or tag |
| `github:github.com/<owner>/<repo>/issues`      | Query issues from a repository                            |
| `github:github.com/<owner>/<repo>/pulls`       | Query pull requests from a repository                     |
| `github:github.com/<owner>/<repo>/commits`     | Query commits from a repository                           |
| `github:github.com/<owner>/<repo>/stargazers`  | Query stargazers from a repository                        |
| `github:github.com/<owner>/<repo>/reviews`     | Query pull request reviews from a repository              |
| `github:github.com/<owner>/<repo>/review_threads` | Query pull request review threads from a repository    |
| `github:github.com/<owner>/<repo>/releases`    | Query releases from a repository                          |
| `github:github.com/<owner>/<repo>/release_assets` | Query release assets from a repository                 |
| `github:github.com/<owner>/<repo>/milestones`  | Query milestones from a repository                        |
| `github:github.com/<owner>/<repo>/repo`        | Query one row of repository metadata                      |
| `github:github.com/<organization>/members`     | Query members from an organization                        |
| `github:github.com/<owner>/repos`              | Query every repository an owner has (an organization or a user) |
| `github:github.com/<login>/user`               | Query the public profile of one login                     |

### `name`

The dataset name. This will be used as the table name within Spice. The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords).

### `params`

#### Personal Access Token

| Parameter Name | Description                                                                                                                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `github_token` | Required. GitHub personal access token to use to connect to the GitHub API. [Learn more](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens). |

#### GitHub App Installation

GitHub Apps provide a secure and scalable way to integrate with GitHub's API, and works well when interacting with one or more GitHub organizations. [Learn more](https://docs.github.com/en/apps).

| Parameter Name           | Description                                                                    |
| ------------------------ | ------------------------------------------------------------------------------ |
| `github_client_id`       | Required. Specifies the client ID for GitHub App Installation auth mode.       |
| `github_private_key`     | Required. Specifies the private key for GitHub App Installation auth mode.     |
| `github_installation_id` | Required. Specifies the installation ID for GitHub App Installation auth mode. |

The client ID and private key are generated when creating the GitHub app. 

**Getting the Installation ID**

If the app is installed on a GitHub organization:
- Visit the settings page for the organization (`https://github.com/organizations/<ORG>/settings/installations`)
- Click "Configure" on the app
- The URL of the page will be of the form `https://github.com/organizations/<ORG>/settings/installations/<INSTALLATION_ID>`

If the app is installed on a GitHub user:
- Visit [the settings page](https://github.com/settings/installations)
- Click "Configure" on the app
- The URL of the page will be of the form `https://github.com/settings/installations/<INSTALLATION_ID>`


:::note[Limitations]

With GitHub App Installation authentication, the connector's functionality depends on the permissions and scope of the GitHub App. Ensure that the app is installed on the repositories and configured with content, commits, issues and pull permissions to allow the corresponding datasets to work.

:::

#### Common Parameters

| Parameter Name                | Description                                                                                                                                                                                                                                                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `github_query_mode`           | Optional. Specifies whether the connector should use the GitHub [search API](https://docs.github.com/en/graphql/reference/queries#search) for improved filter performance. Defaults to `auto`, possible values of `auto` or `search`.                                                                                 |
| `github_endpoint`             | Optional. Base URL of the GitHub API. Defaults to `https://api.github.com`. Override to target a GitHub Enterprise Server instance (e.g., `https://github.example.com/api/v3`).                                                                                                                                       |
| `github_include_comments`     | Optional. Pull-request connector only. Specifies the types of comments to fetch: `all`, `review`, `discussion`, or `none`. Defaults to `none`. See [Comments Example](#comments-example).                                                                                                                             |
| `github_max_comments_fetched` | Optional. Pull-request connector only. Maximum number of comments to fetch per review thread (when `github_include_comments` is set to `review` or `all`) or per pull-request discussion (when set to `discussion` or `all`). Defaults to `25`, and is capped at `75` to protect against GitHub secondary rate limits. |
| `github_include_commits`      | Optional. Files connector only. Whether to fetch commit metadata (adds the `created_at` and `updated_at` timestamp columns) for each file. Set to `true` to enable. Defaults to `false`.                                                                                                                                                    |
| `github_workflow_logs`        | Optional. Workflow-runs connector only (`github.com/<owner>/<repo>/workflows/<workflow_file.yml>/runs`). Set to `enabled` to download and include the workflow run logs for each row. Defaults to `disabled`.                                                                                                         |

## Identity Columns

Every GitHub table carries an `owner` column, and every table whose rows belong to a repository also carries a `repo` column. Both are non-nullable.

| Column  | Type | Description                                                                                                          |
| ------- | ---- | -------------------------------------------------------------------------------------------------------------------- |
| `owner` | Utf8 | The login of the user or organization that owns the row's repository. On an owner-scoped table (`members`, `repos`, `user`) it is the owner the dataset names. |
| `repo`  | Utf8 | The name of the repository the row came from, without the owner prefix. Absent from `members` and `user`, whose rows do not belong to a repository. On `repos` it is the repository each row describes. |

GitHub scopes a response by owner and repository *above* the row array, so without these columns a query that unions several repositories cannot tell the rows apart. They are stamped onto each row from the dataset path rather than requested from GitHub, so they cost nothing against the API rate limit.

Both values are stored **lowercased**. GitHub treats owner and repository names as case-insensitive and will answer a dataset path spelled `SpiceAI/spiceai` with rows it calls `spiceai/spiceai`; SQL equality is not case-insensitive, so folding the value is what keeps a join across datasets matching. Where GitHub's own spelling matters, use `name_with_owner` on the `repo` / `repos` tables.

```sql
SELECT owner, repo, COUNT(*) AS open_pulls
FROM (
  SELECT owner, repo, state FROM spiceai.pulls
  UNION ALL
  SELECT owner, repo, state FROM cookbook.pulls
)
WHERE state = 'OPEN'
GROUP BY owner, repo;
```

## Advanced Configuration

### Rate Limiting

When using multiple GitHub datasets sharing the same GitHub token or GitHub app credentials, it is possible to exceed GitHub's primary and secondary rate limits. To mitigate this, use the `github_concurrent_connections_limit` setting under [`runtime.source_rate_control`](../../reference/spicepod/runtime#runtimesource_rate_control). This connections limit applies per GitHub token and per GitHub app installation, following GitHub's rate limit policy.

:::warning[Deprecated]
`runtime.params.github_max_concurrent_connections` is deprecated. Use `runtime.source_rate_control.github_concurrent_connections_limit` instead.
:::

Example Configuration:

```yaml
# ... other configuration ...
runtime:
  source_rate_control:
    github_concurrent_connections_limit: 5 # Defaults to 10

datasets:
  - from: github:github.com/spiceai/spiceai/files/v0.17.2-beta
    name: spiceai.files
    params:
      github_token: ${secrets:GITHUB_TOKEN}
      include: '**/*.txt'
    acceleration:
      enabled: true
  - from: github:github.com/<owner>/<repo>/issues
    name: spiceai.issues
    params:
      github_token: ${secrets:GITHUB_TOKEN}
    acceleration:
      enabled: true
# ... other configuration ...
```

The GitHub connector runs its own concurrency limiter, separate from the [shared HTTP rate control](../https/index.md#rate-control-parameters) used by the HTTP/HTTPS, GraphQL and Databricks connectors. It reads a single parameter:

| Parameter Name              | Description                                                                                                                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `max_concurrent_requests`   | Maximum number of concurrent GitHub HTTP requests for this authentication context. When unset, the connector falls back to `runtime.source_rate_control.github_concurrent_connections_limit`, then to the deprecated `runtime.params.github_max_concurrent_connections`, and finally to the connector default of `10`. The GitHub connector does **not** read `runtime.params.http_max_concurrent_requests`, and concurrency limiting is never disabled. |

The GitHub connector uses its own rate limiter based on GitHub API `X-RateLimit-*` response headers. Multiple datasets targeting the same GitHub endpoint share this rate limiter.

## Filter Push Down

GitHub queries support a `github_query_mode` parameter, which can be set to either `auto` or `search` for the following types:

- **Issues**: Defaults to `auto`. Query filters are only pushed down to the GitHub API in `search` mode.
- **Pull Requests**: Defaults to `auto`. Query filters are only pushed down to the GitHub API in `search` mode.

Commits only supports `auto` mode. Query with filter push down is only enabled for the `committed_date` column. `committed_date` supports exact matches, or greater/less than matches for dates provided in [ISO8601](https://www.iso.org/iso-8601-date-and-time-format.html) format, like `WHERE committed_date > '2024-09-24'`.

When set to `search`, Issues and Pull Requests will use the GitHub [Search API](https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests) for improved filter performance when querying against the columns:

- `author` and `state`; supports exact matches, or NOT matches. For example, `WHERE author = 'peasee'` or `WHERE author <> 'peasee'`.
- `body` and `title`; supports exact matches, or LIKE matches. For example, `WHERE body LIKE '%duckdb%'`.
- `updated_at`, `created_at`, `merged_at` and `closed_at`; supports exact matches, or greater/less than matches with dates provided in [ISO8601](https://www.iso.org/iso-8601-date-and-time-format.html) format. For example, `WHERE created_at > '2024-09-24'`.

All other filters are supported when `github_query_mode` is set to `search`, but cannot be pushed down to the GitHub API for improved performance.

:::warning[Limitations]

- GitHub has a limitation in the Search API where it may return more stale data than the standard API used in the default query mode.
- GitHub has a limitation in the Search API where it only returns a maximum of 1000 results for a query. Use [append mode acceleration](../../features/data-acceleration/data-refresh) to retrieve more results over time. See the [append example](#append-example) for pull requests.

:::

## Examples

### Querying GitHub Files

:::warning[Limitations]

- `content` column is fetched only when acceleration is enabled.
- Querying GitHub files does not support filter push down, which may result in long query times when acceleration is disabled.
- Setting `github_query_mode` to `search` is not supported.

:::

- `ref` - Required. Specifies the GitHub branch or tag to fetch files from.
- `include` - Optional. Specifies a pattern to include specific files. Supports glob patterns. If not specified, all files are included by default.

```yaml
datasets:
  - from: github:github.com/<owner>/<repo>/files/<ref>
    name: spiceai.files
    params:
      github_token: ${secrets:GITHUB_TOKEN}
      include: '**/*.json; **/*.yaml'
    acceleration:
      enabled: true
```

#### Schema

| Column Name  | Data Type | Is Nullable |
| ------------ | --------- | ----------- |
| name         | Utf8      | YES         |
| path         | Utf8      | YES         |
| ref          | Utf8      | NO          |
| size         | Int64     | YES         |
| sha          | Utf8      | YES         |
| mode         | Utf8      | YES         |
| url          | Utf8      | YES         |
| download_url | Utf8      | YES         |
| created_at   | Timestamp | YES         |
| updated_at   | Timestamp | YES         |
| content      | Utf8      | YES         |
| owner        | Utf8      | NO          |
| repo         | Utf8      | NO          |

`created_at` and `updated_at` are present only when `github_include_commits` is set to `true`.

#### Example

```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/files/v0.17.2-beta
    name: spiceai.files
    params:
      github_token: ${secrets:GITHUB_TOKEN}
      include: '**/*.txt' # include txt files only
    acceleration:
      enabled: true
```

```console
sql> select * from spiceai.files
+-------------+-------------+------+------------------------------------------+--------+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------------+-------------+
| name        | path        | size | sha                                      | mode   | url                                                                                             | download_url                                                               | content     |
+-------------+-------------+------+------------------------------------------+--------+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------------+-------------+
| version.txt | version.txt | 12   | ee80f747038c30e776eecb2c2ae155dec9a68187 | 100644 | https://api.github.com/repos/spiceai/spiceai/git/blobs/ee80f747038c30e776eecb2c2ae155dec9a68187 | https://raw.githubusercontent.com/spiceai/spiceai/v0.17.2-beta/version.txt | 0.17.2-beta |
|             |             |      |                                          |        |                                                                                                 |                                                                            |             |
+-------------+-------------+------+------------------------------------------+--------+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------------+-------------+

Time: 0.005067 seconds. 1 rows.
```

### Querying GitHub Issues

:::warning[Limitations]

- Querying with filters using date columns requires the use of [ISO8601 formatted dates](https://www.iso.org/iso-8601-date-and-time-format.html). For example, `WHERE created_at > '2024-09-24'`.

:::

```yaml
datasets:
  - from: github:github.com/<owner>/<repo>/issues
    name: spiceai.issues
    params:
      github_token: ${secrets:GITHUB_TOKEN}
    acceleration:
      enabled: true
```

#### Schema

| Column Name     | Data Type    | Is Nullable |
| --------------- | ------------ | ----------- |
| assignees       | List(Struct(login: Utf8)) | YES         |
| author          | Utf8         | YES         |
| body            | Utf8         | YES         |
| closed_at       | Timestamp    | YES         |
| closed_by       | Utf8         | YES         |
| comments        | List(Struct) | YES         |
| comments_count  | Int64        | YES         |
| created_at      | Timestamp    | YES         |
| id              | Utf8         | YES         |
| labels          | List(Struct(name: Utf8)) | YES         |
| milestone_id    | Utf8         | YES         |
| milestone_title | Utf8         | YES         |
| number          | Int64        | YES         |
| owner           | Utf8         | NO          |
| reactions_count | Int64        | YES         |
| repo            | Utf8         | NO          |
| state           | Utf8         | YES         |
| state_reason    | Utf8         | YES         |
| title           | Utf8         | YES         |
| type            | Utf8         | YES         |
| type_color      | Utf8         | YES         |
| updated_at      | Timestamp    | YES         |
| url             | Utf8         | YES         |

#### Example

```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/issues
    name: spiceai.issues
    params:
      github_token: ${secrets:GITHUB_TOKEN}
```

```console
sql> select title, state, labels from spiceai.issues where title like '%duckdb%'
+-----------------------------------------------------------------------------------------------------------+--------+----------------------+
| title                                                                                                     | state  | labels               |
+-----------------------------------------------------------------------------------------------------------+--------+----------------------+
| Limitation documentation duckdb accelerator about nested struct and decimal256                            | CLOSED | [kind/documentation] |
| Inconsistent duckdb connector params: `params.open` and `params.duckdb_file`                              | CLOSED | [kind/bug]           |
| federation across multiple duckdb acceleration tables.                                                    | CLOSED | []                   |
| Integration tests to cover "On Conflict" behaviors for duckdb accelerator                                 | CLOSED | [kind/task]          |
| Permission denied issue while using duckdb data connector with spice using HELM for Kubernetes deployment | CLOSED | [kind/bug]           |
+-----------------------------------------------------------------------------------------------------------+--------+----------------------+

Time: 0.011877542 seconds. 5 rows.
```

### Querying GitHub Pull Requests

:::warning[Limitations]

- Querying with filters using date columns requires the use of [ISO8601 formatted dates](https://www.iso.org/iso-8601-date-and-time-format.html). For example, `WHERE created_at > '2024-09-24'`.

:::

```yaml
datasets:
  - from: github:github.com/<owner>/<repo>/pulls
    name: spiceai.pulls
    params:
      github_token: ${secrets:GITHUB_TOKEN}
      # Specifies the types of comments to fetch: 'all', 'review', 'discussion', or 'none'. Defaults to 'none'.
      github_include_comments: none
      # Number of comments to fetch per discussion or review thread.
      # Defaults to 25, and is capped at 75
      github_max_comments_fetched: 50
```

#### Schema

| Column Name     | Data Type                                                     | Is Nullable |
| --------------- | ------------------------------------------------------------- | ----------- |
| additions                  | Int64                                                         | YES         |
| assignees                  | List(Struct(login: Utf8))                                     | YES         |
| author                     | Utf8                                                          | YES         |
| base_ref                   | Utf8                                                          | YES         |
| body                       | Utf8                                                          | YES         |
| changed_files              | Int64                                                         | YES         |
| closed_at                  | Timestamp                                                     | YES         |
| closed_by                  | Utf8                                                          | YES         |
| closing_issues_count       | Int64                                                         | YES         |
| closing_issues_references  | List(Struct(number: Int64))                                   | YES         |
| comments_count             | Int64                                                         | YES         |
| commits_count              | Int64                                                         | YES         |
| created_at                 | Timestamp                                                     | YES         |
| deletions                  | Int64                                                         | YES         |
| discussion                 | List(Struct(body: Utf8, author: Utf8, created_at: Timestamp)) | YES         |
| hashes                     | List(Struct(id: Utf8))                                        | YES         |
| head_ref                   | Utf8                                                          | YES         |
| head_sha                   | Utf8                                                          | YES         |
| id                         | Utf8                                                          | YES         |
| is_draft                   | Boolean                                                       | YES         |
| labels                     | List(Struct(name: Utf8))                                      | YES         |
| merge_queue_position       | Int64                                                         | YES         |
| merge_queue_state          | Utf8                                                          | YES         |
| merge_state_status         | Utf8                                                          | YES         |
| mergeable                  | Utf8                                                          | YES         |
| merged_at                  | Timestamp                                                     | YES         |
| merged_by                  | Utf8                                                          | YES         |
| milestone_id               | Utf8                                                          | YES         |
| milestone_title            | Utf8                                                          | YES         |
| number                     | Int64                                                         | YES         |
| owner                      | Utf8                                                          | NO          |
| reactions_count            | Int64                                                         | YES         |
| repo                       | Utf8                                                          | NO          |
| review_comments            | List(Struct(body: Utf8, author: Utf8, created_at: Timestamp)) | YES         |
| review_decision            | Utf8                                                          | YES         |
| reviews_count              | Int64                                                         | YES         |
| state                      | Utf8                                                          | YES         |
| status_check_rollup        | Utf8                                                          | YES         |
| title                      | Utf8                                                          | YES         |
| updated_at                 | Timestamp                                                     | YES         |
| url                        | Utf8                                                          | YES         |

**Note**: The `discussion` and `review_comments` columns are only included in the schema when the `github_include_comments` parameter is set accordingly.

#### Example

```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/pulls
    name: spiceai.pulls
    params:
      github_token: ${secrets:GITHUB_TOKEN}
    acceleration:
      enabled: true
```

```console
sql> select title, url, state from spiceai.pulls where title like '%GitHub connector%'
+---------------------------------------------------------------------+----------------------------------------------+--------+
| title                                                               | url                                          | state  |
+---------------------------------------------------------------------+----------------------------------------------+--------+
| GitHub connector: convert `labels` and `hashes` to primitive arrays | https://github.com/spiceai/spiceai/pull/2452 | MERGED |
+---------------------------------------------------------------------+----------------------------------------------+--------+

Time: 0.034996667 seconds. 1 rows.
```

#### Append Example

```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/pulls
    name: spiceai.pulls
    params:
      github_token: ${secrets:GITHUB_TOKEN}
      github_query_mode: search
    time_column: created_at
    acceleration:
      enabled: true
      refresh_mode: append
      refresh_check_interval: 6h # check for new results every 6 hours
      refresh_data_window: 90d # at initial load, load the last 90 days of pulls
```


#### Comments Example
```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/pulls
    name: spiceai.pulls
    params:
      github_token: ${secrets:GITHUB_TOKEN}
      github_include_comments: all
      github_max_comments_fetched: 75
    acceleration:
      enabled: true
```

```console
sql> select unnest(unnest(review_comments)) from spiceai.pulls where number = 6 limit 1;
+------------------------------------------------------------------+------------------------------------------------------------------------+--------------------------------------------------------------------+
| __unnest_placeholder(UNNEST(spiceai.pulls.review_comments)).body | __unnest_placeholder(UNNEST(spiceai.pulls.review_comments)).created_at | __unnest_placeholder(UNNEST(spiceai.pulls.review_comments)).author |
+------------------------------------------------------------------+------------------------------------------------------------------------+--------------------------------------------------------------------+
| Nitpick - extra space.                                           | 2021-08-11T17:36:23                                                    | haardvark                                                          |
+------------------------------------------------------------------+------------------------------------------------------------------------+--------------------------------------------------------------------+

Time: 0.034283334 seconds. 1 rows.
```

```console
sql> select unnest(unnest(discussion)) from spiceai.pulls where number = 148 limit 1;
+-------------------------------------------------------------+-------------------------------------------------------------------+---------------------------------------------------------------+
| __unnest_placeholder(UNNEST(spiceai.pulls.discussion)).body | __unnest_placeholder(UNNEST(spiceai.pulls.discussion)).created_at | __unnest_placeholder(UNNEST(spiceai.pulls.discussion)).author |
+-------------------------------------------------------------+-------------------------------------------------------------------+---------------------------------------------------------------+
| Do not merge until after repo goes public.                  | 2021-09-06T08:00:45                                               | lukekim                                                       |
+-------------------------------------------------------------+-------------------------------------------------------------------+---------------------------------------------------------------+

Time: 0.036530584 seconds. 1 rows.
```

### Querying GitHub Commits

:::warning[Limitations]

- Querying with filters using date columns requires the use of [ISO8601 formatted dates](https://www.iso.org/iso-8601-date-and-time-format.html). For example, `WHERE committed_date > '2024-09-24'`.
- Setting `github_query_mode` to `search` is not supported.

:::

```yaml
datasets:
  - from: github:github.com/<owner>/<repo>/commits
    name: spiceai.commits
    params:
      github_token: ${secrets:GITHUB_TOKEN}
```

#### Schema

| Column Name                    | Data Type | Is Nullable |
| ------------------------------ | --------- | ----------- |
| additions                      | Int64     | YES         |
| associated_pull_request_number | Int64     | YES         |
| author_email                   | Utf8      | YES         |
| author_name                    | Utf8      | YES         |
| changed_files                  | Int64     | YES         |
| committed_date                 | Timestamp | YES         |
| committer_date                 | Timestamp | YES         |
| committer_email                | Utf8      | YES         |
| committer_name                 | Utf8      | YES         |
| deletions                      | Int64     | YES         |
| id                             | Utf8      | YES         |
| message                        | Utf8      | YES         |
| message_body                   | Utf8      | YES         |
| message_head_line              | Utf8      | YES         |
| ref                            | Utf8      | YES         |
| sha                            | Utf8      | YES         |
| status                         | Utf8      | YES         |
| owner                          | Utf8      | NO          |
| repo                           | Utf8      | NO          |

#### Example

```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/commits
    name: spiceai.commits
    params:
      github_token: ${secrets:GITHUB_TOKEN}
    acceleration:
      enabled: true
```

```console
sql> select sha, message_head_line from spiceai.commits limit 10
+------------------------------------------+------------------------------------------------------------------------+
| sha                                      | message_head_line                                                      |
+------------------------------------------+------------------------------------------------------------------------+
| 2a9fab7905737e1af182e17f40aecc5c4b5dd236 |  wait 2 seconds for the status to turn ready in refreshing status tes… |
| b9c210a818abeaf14d2493fde5227781f47faed8 | Update README.md - Remove bigquery from tablet of connectors (#1434)   |
| d61e1af61ebf826f83703b8dd939f19e8b2ba426 | Add databricks_use_ssl parameter (#1406)                               |
| f1ec55c5986e3e5d57eff94197182ffebbae1045 | wording and logs change reflected on readme (#1435)                    |
| bfc74185584d1e048ef66c72ce3572a0b652bfd9 | Update acknowledgements (#1433)                                        |
| 0d870f1791d456e7924b4ecbbda5f3b762db1e32 | Update helm version and use v0.13.0-alpha (#1436)                      |
| 12f930cbad69833077bd97ea43599a75cff985fc | Enable push-down federation by default (#1429)                         |
| 6e4521090aaf39664bd61d245581d34398ce77db | Add functional tests for federation push-down (#1428)                  |
| fa3279b7d9fcaa5e8baaa2425f69b556bb30e309 | Add LRU cache support for http-based sql queries (#1410)               |
| a3f93dde9d1312bfbf14f7ae3b75bdc468289212 | Add guides and examples about error handling (#1427)                   |
+------------------------------------------+------------------------------------------------------------------------+

Time: 0.0065395 seconds. 10 rows.
```

### Querying GitHub stars (Stargazers)

:::warning[Limitations]

- Querying with filters using date columns requires the use of [ISO8601 formatted dates](https://www.iso.org/iso-8601-date-and-time-format.html). For example, `WHERE starred_at > '2024-09-24'`.
- Setting `github_query_mode` to `search` is not supported.

:::

```yaml
datasets:
  - from: github:github.com/<owner>/<repo>/stargazers
    name: spiceai.stargazers
    params:
      github_token: ${secrets:GITHUB_TOKEN}
```

#### Schema

| Column Name | Data Type | Is Nullable |
| ----------- | --------- | ----------- |
| starred_at  | Timestamp | YES         |
| login       | Utf8      | YES         |
| email       | Utf8      | YES         |
| name        | Utf8      | YES         |
| company     | Utf8      | YES         |
| x_username  | Utf8      | YES         |
| location    | Utf8      | YES         |
| avatar_url  | Utf8      | YES         |
| bio         | Utf8      | YES         |
| owner       | Utf8      | NO          |
| repo        | Utf8      | NO          |

#### Example

```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/stargazers
    name: spiceai.stargazers
    params:
      github_token: ${secrets:GITHUB_TOKEN}
    acceleration:
      enabled: true
```

```console
sql> select starred_at, login from spiceai.stargazers order by starred_at DESC limit 10
+----------------------+----------------------+
| starred_at           | login                |
+----------------------+----------------------+
| 2024-09-15T13:22:09Z | cisen                |
| 2024-09-14T18:04:22Z | tyan-boot            |
| 2024-09-13T10:38:01Z | yofriadi             |
| 2024-09-13T10:01:33Z | FourSpaces           |
| 2024-09-13T04:02:11Z | d4x1                 |
| 2024-09-11T18:10:28Z | stephenakearns-insta |
| 2024-09-09T22:17:42Z | Lrs121               |
| 2024-09-09T19:56:26Z | jonathanfinley       |
| 2024-09-09T07:02:10Z | leookun              |
| 2024-09-09T03:04:27Z | royswale             |
+----------------------+----------------------+

Time: 0.0088075 seconds. 10 rows.
```

### Querying Members of a GitHub Organization

:::warning[Limitations]

- Querying with filters using date columns requires the use of [ISO8601 formatted dates](https://www.iso.org/iso-8601-date-and-time-format.html). For example, `WHERE created_at > '2024-09-24'`.
- Setting `github_query_mode` to `search` is not supported.

:::

```yaml
datasets:
  - from: github:github.com/<organization>/members
    name: members
    params:
      github_token: ${secrets:GITHUB_TOKEN}
```

#### Schema

| Column Name | Data Type | Is Nullable |
| ----------- | --------- | ----------- |
| username    | Utf8      | YES         |
| name        | Utf8      | YES         |
| avatar_url  | Utf8      | YES         |
| url         | Utf8      | YES         |
| email       | Utf8      | YES         |
| location    | Utf8      | YES         |
| company     | Utf8      | YES         |
| created_at  | Timestamp | YES         |
| bio         | Utf8      | YES         |
| owner       | Utf8      | NO          |

#### Example

```yaml
datasets:
  - from: github:github.com/apache/members
    name: apache.members
    params:
      github_token: ${secrets:GITHUB_TOKEN}
    acceleration:
      enabled: true
```

```
sql> select created_at, username from apache.members order by created_at desc limit 10;
+---------------------+-------------------+
| created_at          | username          |
+---------------------+-------------------+
| 2023-10-09T13:14:13 | heliang666s       |
| 2023-04-14T11:26:44 | cortlepp          |
| 2023-02-16T08:28:58 | ChengJie1053      |
| 2023-02-11T03:51:52 | FinalT            |
| 2022-11-20T12:12:56 | Yanshuming1       |
| 2022-10-10T23:29:29 | bernardodemarco   |
| 2022-10-07T05:06:37 | coldgust          |
| 2022-09-06T14:38:44 | No-SilverBullet   |
| 2022-08-18T13:31:44 | harshithasudhakar |
| 2022-07-05T10:44:08 | bearslyricattack  |
+---------------------+-------------------+

Time: 0.054390375 seconds. 10 rows.
```

### Querying Pull Request Reviews

`pulls.reviews_count` is a bare count and `pulls.review_comments` records only inline comments, so an approval left without an inline comment is invisible in SQL. The `reviews` table carries one row per review, with its state, reviewer and submission time.

```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/reviews
    name: spiceai.reviews
    params:
      github_token: ${secrets:GITHUB_TOKEN}
    acceleration:
      enabled: true
```

#### Schema

| Column Name         | Data Type | Is Nullable |
| ------------------- | --------- | ----------- |
| id                  | Utf8      | YES         |
| pull_request_id     | Utf8      | YES         |
| pull_request_number | Int64     | YES         |
| author              | Utf8      | YES         |
| state               | Utf8      | YES         |
| body                | Utf8      | YES         |
| submitted_at        | Timestamp | YES         |
| commit_sha          | Utf8      | YES         |
| author_association  | Utf8      | YES         |
| url                 | Utf8      | YES         |
| owner               | Utf8      | NO          |
| repo                | Utf8      | NO          |

Join back to `pulls` on `pull_request_number`:

```sql
SELECT p.number, p.title, r.author, r.state, r.submitted_at
FROM spiceai.pulls p
JOIN spiceai.reviews r ON r.pull_request_number = p.number
WHERE r.state = 'APPROVED';
```

:::note[Limit pushdown is disabled on this table]
One pull request fans out into many review rows, so a row limit cannot bound how many pull requests must be fetched. A pull request with more than 100 reviews has reviews the scan cannot reach — a nested GraphQL connection cannot be paginated — and the scan fails naming that pull request rather than returning a partial set.
:::

### Querying Pull Request Review Threads

One row per resolvable review thread, which is what "which pull requests are blocked on unresolved feedback" is computed from.

```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/review_threads
    name: spiceai.review_threads
    params:
      github_token: ${secrets:GITHUB_TOKEN}
```

#### Schema

| Column Name         | Data Type | Is Nullable |
| ------------------- | --------- | ----------- |
| id                  | Utf8      | YES         |
| pull_request_id     | Utf8      | YES         |
| pull_request_number | Int64     | YES         |
| is_resolved         | Boolean   | YES         |
| is_outdated         | Boolean   | YES         |
| is_collapsed        | Boolean   | YES         |
| path                | Utf8      | YES         |
| line                | Int64     | YES         |
| start_line          | Int64     | YES         |
| diff_side           | Utf8      | YES         |
| resolved_by         | Utf8      | YES         |
| comments_count      | Int64     | YES         |
| owner               | Utf8      | NO          |
| repo                | Utf8      | NO          |

### Querying Releases and Release Assets

```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/releases
    name: spiceai.releases
    params:
      github_token: ${secrets:GITHUB_TOKEN}
  - from: github:github.com/spiceai/spiceai/release_assets
    name: spiceai.release_assets
    params:
      github_token: ${secrets:GITHUB_TOKEN}
```

#### `releases` Schema

| Column Name          | Data Type | Is Nullable |
| -------------------- | --------- | ----------- |
| id                   | Utf8      | YES         |
| tag_name             | Utf8      | YES         |
| name                 | Utf8      | YES         |
| body                 | Utf8      | YES         |
| author               | Utf8      | YES         |
| tag_sha              | Utf8      | YES         |
| is_draft             | Boolean   | YES         |
| is_prerelease        | Boolean   | YES         |
| is_latest            | Boolean   | YES         |
| created_at           | Timestamp | YES         |
| published_at         | Timestamp | YES         |
| updated_at           | Timestamp | YES         |
| url                  | Utf8      | YES         |
| assets_count         | Int64     | YES         |
| total_download_count | Int64     | YES         |
| owner                | Utf8      | NO          |
| repo                 | Utf8      | NO          |

#### `release_assets` Schema

| Column Name      | Data Type | Is Nullable |
| ---------------- | --------- | ----------- |
| id               | Utf8      | YES         |
| release_id       | Utf8      | YES         |
| release_tag_name | Utf8      | YES         |
| name             | Utf8      | YES         |
| download_count   | Int64     | YES         |
| size             | Int64     | YES         |
| content_type     | Utf8      | YES         |
| url              | Utf8      | YES         |
| created_at       | Timestamp | YES         |
| updated_at       | Timestamp | YES         |
| owner            | Utf8      | NO          |
| repo             | Utf8      | NO          |

### Querying Milestones

```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/milestones
    name: spiceai.milestones
    params:
      github_token: ${secrets:GITHUB_TOKEN}
```

#### Schema

| Column Name          | Data Type | Is Nullable |
| -------------------- | --------- | ----------- |
| id                   | Utf8      | YES         |
| number               | Int64     | YES         |
| title                | Utf8      | YES         |
| description          | Utf8      | YES         |
| state                | Utf8      | YES         |
| creator              | Utf8      | YES         |
| due_on               | Timestamp | YES         |
| created_at           | Timestamp | YES         |
| updated_at           | Timestamp | YES         |
| closed_at            | Timestamp | YES         |
| open_issues_count    | Int64     | YES         |
| closed_issues_count  | Int64     | YES         |
| progress_percentage  | Float64   | YES         |
| url                  | Utf8      | YES         |
| owner                | Utf8      | NO          |
| repo                 | Utf8      | NO          |

`pulls.milestone_id` and `issues.milestone_id` join to `milestones.id`.

### Querying Repository Metadata

`github:github.com/<owner>/<repo>/repo` returns one row of metadata for the repository the path names; `github:github.com/<owner>/repos` returns one row per repository an owner has. Both resolve an organization and a user alike, and both share the same schema.

```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/repo
    name: spiceai.repo
    params:
      github_token: ${secrets:GITHUB_TOKEN}
  - from: github:github.com/spiceai/repos
    name: spiceai.repos
    params:
      github_token: ${secrets:GITHUB_TOKEN}
```

#### Schema

| Column Name              | Data Type       | Is Nullable |
| ------------------------ | --------------- | ----------- |
| id                       | Utf8            | YES         |
| owner                    | Utf8            | NO          |
| repo                     | Utf8            | NO          |
| name_with_owner          | Utf8            | YES         |
| description              | Utf8            | YES         |
| url                      | Utf8            | YES         |
| homepage_url             | Utf8            | YES         |
| default_branch           | Utf8            | YES         |
| license                  | Utf8            | YES         |
| primary_language         | Utf8            | YES         |
| is_archived              | Boolean         | YES         |
| is_private               | Boolean         | YES         |
| is_fork                  | Boolean         | YES         |
| is_template              | Boolean         | YES         |
| is_disabled              | Boolean         | YES         |
| is_locked                | Boolean         | YES         |
| created_at               | Timestamp       | YES         |
| updated_at               | Timestamp       | YES         |
| pushed_at                | Timestamp       | YES         |
| disk_usage               | Int64           | YES         |
| stargazers_count         | Int64           | YES         |
| forks_count              | Int64           | YES         |
| watchers_count           | Int64           | YES         |
| open_issues_count        | Int64           | YES         |
| open_pull_requests_count | Int64           | YES         |
| topics_count             | Int64           | YES         |
| topics                   | List(Utf8)      | YES         |

`name_with_owner` keeps GitHub's own capitalization; `owner` and `repo` are lowercased for joining (see [Identity Columns](#identity-columns)).

### Querying a User Profile

`github:github.com/<owner>/user` returns the public profile of one login.

```yaml
datasets:
  - from: github:github.com/spiceai/user
    name: spiceai.user
    params:
      github_token: ${secrets:GITHUB_TOKEN}
```

#### Schema

| Column Name      | Data Type | Is Nullable |
| ---------------- | --------- | ----------- |
| id               | Utf8      | YES         |
| login            | Utf8      | YES         |
| name             | Utf8      | YES         |
| company          | Utf8      | YES         |
| bio              | Utf8      | YES         |
| blog             | Utf8      | YES         |
| twitter_username | Utf8      | YES         |
| location         | Utf8      | YES         |
| avatar_url       | Utf8      | YES         |
| url              | Utf8      | YES         |
| is_hireable      | Boolean   | YES         |
| followers        | Int64     | YES         |
| following        | Int64     | YES         |
| public_repos     | Int64     | YES         |
| created_at       | Timestamp | YES         |
| updated_at       | Timestamp | YES         |
| owner            | Utf8      | NO          |

## Cookbook

- A cookbook recipe to configure Github as a data connector in Spice. [GitHub Data Connector](https://github.com/spiceai/cookbook/tree/trunk/github#readme)
