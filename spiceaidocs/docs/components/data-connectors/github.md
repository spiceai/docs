---
title: 'GitHub Data Connector'
sidebar_label: 'GitHub Data Connector'
description: 'GitHub Data Connector Documentation'
---

GitHub is a web-based platform for version control and collaborative software development using Git, enabling developers to host, review, and manage code repositories.

The GitHub Data Connector enables federated SQL queries on various GitHub resources such as files, issues, pull requests, and commits.

```yaml
datasets:
  - from: github:github.com/<owner>/<repo>/files/<ref>
    name: spiceai.files
    params:
      github_token: ${secrets:GITHUB_TOKEN}
      include: "**/*.json; **/*.yaml"
    acceleration:
      enabled: true
```

## Configuration

### `from`

The `from` field for the GitHub connector takes the form `github:host/owner/repo/type/ref` where:

| Parameter Name | Description                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------- |
| `host`         | This is the base host for the GitHub instance, usually `github.com`                             |
| `owner`        | The name of the owner of the repository                                                         |
| `repo`         | The repository name                                                                             |
| `type`         | The type of data to fetch. Can be one of: `files`, `issues`, `pulls`, `commits` or `stargazers` |
| `ref`          | Commit SHA to use as the version of the files to read from. Required when `type` set to `files` |

### `name`

The dataset name. This will be used as the table name within Spice.

Example:
```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/commits
    name: cool_dataset
    params:
      ...
```

```sql
SELECT COUNT(*) FROM cool_dataset;
```

```shell
+----------+
| count(*) |
+----------+
| 6001215  |
+----------+
```

### `params`

The GitHub data connector can be configured by providing the following `params`. Use the [secret replacement syntax](../secret-stores/index.md) to load the access token from a secret store, e.g. `${secrets:GITHUB_TOKEN}`.

| Parameter Name      | Description                                                                                                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `github_token`      | Required. GitHub personal access token to use to connect to the GitHub API. [Learn more](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).                        |
| `github_query_mode` | Optional. Specifies whether the connector should use the GitHub [search API](https://docs.github.com/en/graphql/reference/queries#search) for improved filter performance. Defaults to `auto`, possible values of `auto` or `search`. |
| `owner`             | Required. Specifies the owner of the GitHub repository.                                                                                                                                                                               |
| `repo`              | Required. Specifies the name of the GitHub repository.                                                                                                                                                                                |

## Filter Push Down

GitHub queries support a `github_query_mode` parameter

| Type                      | Description                                                                                                                                                                                                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Issues (`issues`)         | Defaults to `auto`. Query filters are only pushed down to the GitHub API in `search` mode.                                                                                                                                                                                                                                |
| Pull Requests (`pulls`)   | Defaults to `auto`. Query filters are only pushed down to the GitHub API in `search` mode.                                                                                                                                                                                                                                |
| Commits (`commits`)       | Only supports `auto` mode. Query with filter push down is only enabled for the `committed_date` column. `committed_date` supports exact matches, or greater/less than matches for dates provided in [ISO8601](https://www.iso.org/iso-8601-date-and-time-format.html) format, like `WHERE committed_date > '2024-09-24'`. |
| Stargazers (`stargazers`) | Only supports `auto` mode. Querying with filters using date columns requires the use of [ISO8601 formatted dates](https://www.iso.org/iso-8601-date-and-time-format.html). For example, `WHERE starred_at > '2024-09-24'`.                                                                                                |

When set to `search`, Issues and Pull Requests will use the GitHub [Search API](https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests) for improved filter performance when querying against the columns:

| Column Names                                         | Match Support                                                                                                                                                                                         |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `author`, `state`                                    | Supports exact matches, or NOT matches. For example, `WHERE author = 'peasee'` or `WHERE author <> 'peasee'`.                                                                                         |
| `body`, `title`                                      | Supports exact matches, or LIKE matches. For example, `WHERE body LIKE '%duckdb%'`.                                                                                                                   |
| `updated_at`, `created_at`, `merged_at`, `closed_at` | Supports exact matches, or greater/less than matches with dates provided in [ISO8601](https://www.iso.org/iso-8601-date-and-time-format.html) format. For example, `WHERE created_at > '2024-09-24'`. |

All other filters are supported when `github_query_mode` is set to `search`, but cannot be pushed down to the GitHub API for improved performance.

:::warning[Limitations]

- GitHub has a limitation in the Search API where it may return more stale data than the standard API used in the default query mode.

:::

## Examples

### Querying GitHub Files

:::warning[Limitations]

- `content` column is fetched only when [acceleration](/components/data-accelerators/index.md) is enabled.
- Querying GitHub files does not support filter push down, which may result in long query times when [acceleration](/components/data-accelerators/index.md) is disabled.
- Setting `github_query_mode` to `search` is not supported.

:::

```yaml
datasets:
  - from: github:github.com/<owner>/<repo>/files/<ref>
    name: spiceai.files
    params:
      github_token: ${secrets:GITHUB_TOKEN}
      include: "**/*.json; **/*.yaml"
    acceleration:
      enabled: true
```


The following parameter must be included in the `from` field:
| Path Parameter Name | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| `ref`               | Required. Specifies the GitHub branch or tag to fetch files from. |

The following parameter is included in the `params` field:

| Parameter Name | Description                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `include`      | Optional. Specifies a pattern to include specific files. Supports glob patterns. If not specified, all files are included by default. |

#### Schema

| Column Name  | Data Type | Is Nullable |
| ------------ | --------- | ----------- |
| name         | Utf8      | YES         |
| path         | Utf8      | YES         |
| size         | Int64     | YES         |
| sha          | Utf8      | YES         |
| mode         | Utf8      | YES         |
| url          | Utf8      | YES         |
| download_url | Utf8      | YES         |
| content      | Utf8      | YES         |

#### Example Usage

```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/files/v0.17.2-beta
    name: spiceai.files
    params:
      github_token: ${secrets:GITHUB_TOKEN}
      include: "**/*.txt" # include txt files only
    acceleration:
      enabled: true
```

```console
sql> select * from spiceai.files;
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
| assignees       | List(Utf8)   | YES         |
| author          | Utf8         | YES         |
| body            | Utf8         | YES         |
| closed_at       | Timestamp    | YES         |
| comments        | List(Struct) | YES         |
| created_at      | Timestamp    | YES         |
| id              | Utf8         | YES         |
| labels          | List(Utf8)   | YES         |
| milestone_id    | Utf8         | YES         |
| milestone_title | Utf8         | YES         |
| comments_count  | Int64        | YES         |
| number          | Int64        | YES         |
| state           | Utf8         | YES         |
| title           | Utf8         | YES         |
| updated_at      | Timestamp    | YES         |
| url             | Utf8         | YES         |

#### Example usage

```yaml
datasets:
  - from: github:github.com/spiceai/spiceai/issues
    name: spiceai.issues
    params:
      github_token: ${secrets:GITHUB_TOKEN}
```

```console
sql> select title, state, labels from spiceai.issues where title like '%duckdb%';
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
```

#### Schema

| Column Name    | Data Type  | Is Nullable |
| -------------- | ---------- | ----------- |
| additions      | Int64      | YES         |
| assignees      | List(Utf8) | YES         |
| author         | Utf8       | YES         |
| body           | Utf8       | YES         |
| changed_files  | Int64      | YES         |
| closed_at      | Timestamp  | YES         |
| comments_count | Int64      | YES         |
| commits_count  | Int64      | YES         |
| created_at     | Timestamp  | YES         |
| deletions      | Int64      | YES         |
| hashes         | List(Utf8) | YES         |
| id             | Utf8       | YES         |
| labels         | List(Utf8) | YES         |
| merged_at      | Timestamp  | YES         |
| number         | Int64      | YES         |
| reviews_count  | Int64      | YES         |
| state          | Utf8       | YES         |
| title          | Utf8       | YES         |
| url            | Utf8       | YES         |

#### Example Usage

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
sql> select title, url, state from spiceai.pulls where title like '%GitHub connector%';
+---------------------------------------------------------------------+----------------------------------------------+--------+
| title                                                               | url                                          | state  |
+---------------------------------------------------------------------+----------------------------------------------+--------+
| GitHub connector: convert `labels` and `hashes` to primitive arrays | https://github.com/spiceai/spiceai/pull/2452 | MERGED |
+---------------------------------------------------------------------+----------------------------------------------+--------+

Time: 0.034996667 seconds. 1 rows.
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

| Column Name       | Data Type | Is Nullable |
| ----------------- | --------- | ----------- |
| additions         | Int64     | YES         |
| author_email      | Utf8      | YES         |
| author_name       | Utf8      | YES         |
| committed_date    | Timestamp | YES         |
| deletions         | Int64     | YES         |
| id                | Utf8      | YES         |
| message           | Utf8      | YES         |
| message_body      | Utf8      | YES         |
| message_head_line | Utf8      | YES         |
| sha               | Utf8      | YES         |

#### Example Usage

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
sql> select sha, message_head_line from spiceai.commits limit 10;
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

#### Example Usage

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
sql> select starred_at, login from spiceai.stargazers order by starred_at DESC limit 10;
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

## Using secrets

There are currently three supported [secret stores](/components/secret-stores/index.md):

* [Environment variables](/components/secret-stores/env)
* [Kubernetes Secret Store](/components/secret-stores/kubernetes)
* [Keyring Secret Store](/components/secret-stores/keyring)
