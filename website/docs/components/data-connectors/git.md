---
title: 'Git Data Connector'
sidebar_label: 'Git Data Connector'
description: 'Git Data Connector Documentation'
tags:
  - data-connectors
  - sql
  - component-metrics
---

The Git Data Connector enables federated SQL queries on the files in a Git repository. Spice clones the repository into a local cache, resolves a branch, tag, or commit, and returns one row per file in that commit's tree, with optional file content. It works with any Git remote reachable over HTTPS, SSH, or the `git://` protocol, and with local repositories through `file://` URLs.

```yaml
datasets:
  - from: git:https://github.com/spiceai/cookbook.git@trunk
    name: cookbook_docs
    params:
      include: '**/*.md'
      fetch_content: true
    acceleration:
      enabled: true
```

```sql
SELECT path, size, updated_at FROM cookbook_docs ORDER BY size DESC LIMIT 5;
```

To query issues, pull requests, commits, or other GitHub API resources, use the [GitHub Data Connector](./github/) instead.

## Configuration

### `from`

The `from` field takes the form `git:<repository_url>[@<reference>]`.

`<repository_url>` accepts these forms:

| Form                    | Example                                       |
| ----------------------- | --------------------------------------------- |
| HTTPS or HTTP           | `git:https://github.com/spiceai/cookbook.git` |
| SSH (`ssh://` or `git+ssh://`) | `git:ssh://git@github.com/spiceai/cookbook.git` |
| SSH shorthand           | `git:git@github.com:spiceai/cookbook.git`     |
| Git protocol            | `git:git://example.com/project.git`           |
| Local repository        | `git:file:///srv/repos/project`               |

Any other URL scheme is rejected with an error. A `file://` URL must contain an absolute path, and its host, if present, must be `localhost`.

`<reference>` is optional and selects the commit to read. It can be a branch name, a tag name, a full commit SHA, or a full reference name such as `refs/heads/main`. When it is omitted, the connector reads the repository's `HEAD`. The connector treats the last `@` after the host as the reference separator, so a user name in the URL (such as the `git@` in the SSH shorthand) is not mistaken for a reference.

### `name`

The dataset name. This will be used as the table name within Spice. The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords).

### `params`

| Parameter Name               | Description                                                                                                                                                                                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `include`                    | Optional. Glob patterns that select which files to return, matched against each file's path from the repository root. Separate multiple patterns with `,` or `;`. For example, `**/*.yaml;src/**/*.json`. When unset, every file is returned. |
| `fetch_content`              | Optional. When `true`, adds a `content` column with each file's text. Default: `false`.                                                                                                                                                            |
| `max_files`                  | Optional. The maximum number of files to return per scan. Default: `5000`. Values above `50000` are clamped to `50000`.                                                                                                                            |
| `max_file_bytes`             | Optional. The maximum size of a file in bytes. Files larger than this are left out of the results. Default: `524288` (512 KiB). Values above `5242880` (5 MiB) are clamped to `5242880`.                                                        |
| `cache_path`                 | Optional. The directory to clone the repository into. Default: a directory under the system temporary directory named `spice_git_cache/<sanitized_repository_url>`.                                                                             |
| `enable_lfs`                 | Optional. When `true`, fetches and checks out [Git LFS](https://git-lfs.com) objects after each clone or fetch, so `size` and `content` reflect the LFS object instead of its pointer file. Requires the `git-lfs` CLI on the `PATH`. Default: `false`. |
| `git_username`               | Optional. The user name for HTTP(S) or SSH authentication.                                                                                                                                                                                         |
| `git_password`               | Optional. The password for HTTP(S) basic authentication. Use the [secret replacement syntax](../secret-stores/) to reference a secret.                                                                                                             |
| `git_token`                  | Optional. A personal access token for HTTP(S) authentication. When `git_username` is unset, the token is sent with the user name `x-access-token`. Takes precedence over `git_password`. Use the [secret replacement syntax](../secret-stores/).    |
| `git_ssh_key`                | Optional. The absolute path to an SSH private key file.                                                                                                                                                                                            |
| `git_ssh_passphrase`         | Optional. The passphrase for the SSH private key. Use the [secret replacement syntax](../secret-stores/) to reference a secret.                                                                                                                     |
| `git_ssh_use_agent`          | Optional. When `true` and `git_ssh_key` is unset, authenticates SSH remotes through the running `ssh-agent`. Default: `true`.                                                                                                                      |
| `max_concurrent_requests`    | Optional. The maximum number of concurrent network operations (clone or fetch) against the same repository URL. Datasets that share a repository URL share this limit, and the first value configured wins. Default: `4`.                       |
| `git_max_retries`            | Optional. The maximum number of retries for a transient clone or fetch error. Default: `3`.                                                                                                                                                         |
| `backoff_method`             | Optional. The delay strategy between retries: `exponential` or `fibonacci`. Default: `exponential`.                                                                                                                                                 |
| `disable_on_permanent_error` | Optional. When `true`, a permanent error from the remote, such as an authentication or certificate failure or an HTTP `403`, disables the connector for that repository URL until Spice restarts. Default: `true`.                                 |

The parameters `git_include`, `git_fetch_content`, `git_cache_path`, `git_max_files`, `git_max_file_bytes`, and `git_enable_lfs` are deprecated aliases of the unprefixed parameters above. They still work, and Spice logs a deprecation warning that names the replacement.

Retries start with a 500 ms delay and never wait longer than 30 seconds between attempts.

## Schema

| Column Name  | Data Type                      | Description                                                                                         |
| ------------ | ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `name`       | `Utf8`                         | The file name.                                                                                      |
| `path`       | `Utf8`                         | The file path from the repository root.                                                             |
| `size`       | `Int64`                        | The file size in bytes.                                                                             |
| `sha`        | `Utf8`                         | The blob SHA of the file.                                                                           |
| `mode`       | `Utf8`                         | The file mode in octal, such as `100644`.                                                           |
| `tree_sha`   | `Utf8`                         | The SHA of the commit's root tree.                                                                  |
| `commit_sha` | `Utf8`                         | The SHA of the resolved commit.                                                                     |
| `version`    | `Utf8`                         | The first seven characters of `commit_sha`.                                                         |
| `created_at` | `Timestamp(Millisecond, None)` | The commit time of the oldest commit in the reference's history that contains this path.             |
| `updated_at` | `Timestamp(Millisecond, None)` | The commit time of the newest commit in the reference's history that contains this path, which is the resolved commit. |
| `content`    | `Utf8`                         | The file content. Present only when `fetch_content` is `true`, and `NULL` for files that are not valid UTF-8. |

Only files (Git blobs) are returned; directories and submodules are not.

## Authentication

For a public repository over HTTPS, no credentials are needed. For a private repository over HTTPS, set `git_token`, or `git_username` and `git_password`:

```yaml
datasets:
  - from: git:https://github.com/my-org/private-repo.git@main
    name: private_files
    params:
      git_token: ${secrets:GIT_TOKEN}
      include: 'docs/**'
```

For SSH remotes, the connector uses `git_ssh_key` when it is set, and otherwise the running `ssh-agent`. Set `git_ssh_use_agent: false` to require an explicit key:

```yaml
datasets:
  - from: git:git@github.com:my-org/private-repo.git@v1.2.0
    name: private_files
    params:
      git_ssh_key: /home/spice/.ssh/id_ed25519
      git_ssh_passphrase: ${secrets:SSH_KEY_PASSPHRASE}
      git_ssh_use_agent: false
```

## Metrics

The connector exposes the following [component metric](../../features/observability/component_metrics). It is auto-registered, so it exports without any `metrics` configuration.

| Metric Name           | Type  | Description                                                              |
| --------------------- | ----- | ------------------------------------------------------------------------ |
| `inflight_operations` | Gauge | The current number of Git network operations holding a concurrency permit. |

## Performance

Every scan opens the cached repository, fetches the latest branches and tags from the remote, and walks the commit's tree. Without [acceleration](../../features/data-acceleration/), each query repeats that network fetch. Enable acceleration so queries read the accelerated copy and the repository is fetched only on refresh.

Computing `created_at` and `updated_at` walks the reference's commit history once for each returned file, so scans of repositories with long histories or many files take longer. Narrow the results with `include` and `max_files` to reduce scan time.

:::warning[Limitations]

- `max_files` stops the tree walk once that many files have matched, so later files are not returned. No error is raised when the limit is reached.
- Filters on `path`, `name`, `sha`, and `version` are applied after the tree walk; they do not reduce the files the connector reads. Use `include` to limit the walk.
- The first clone downloads the full repository history into `cache_path`. Datasets that use the same repository URL and `cache_path` share one clone.

:::
