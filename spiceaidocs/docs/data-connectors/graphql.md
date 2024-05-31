---
title: 'GraphQL Data Connector'
sidebar_label: 'GraphQL Data Connector'
description: 'GraphQL Data Connector Documentation'
---

## Federated SQL query

To connect to any GraphQL endpoint as connector for federated SQL query, specify `graphql` as the selector in the `from` value for the dataset.

```yaml
datasets:
  - from: graphql:your-graphql-endpoint
    name: my_dataset
    params:
      json_path: data.some.nodes
      query: |
        {
          some {
            nodes {
              field1
              field2
            }
          }
        }
```

## Configuration

The GraphQL data connector can be configured by providing the following `params`:

- `auth_token`: The authentication token to use to connect to the GraphQL server. Uses bearer authentication. E.g. `auth_token: github_pat_...`
- `auth_token_key`: The secret key containing the authentication token to use to connect to the GraphQL server. Can be used instead of `auth_token`.
E.g. `auth_token_key: github_token`
- `auth_user`: The username to use for basic auth. E.g. `auth_user: my_user`
- `auth_user_key`: The secret key containing the user to use for basic auth. Can be used instead of `auth_user`. E.g. `auth_user_key: my_secret_user`
- `auth_pass`: The password to use for basic auth. E.g. `auth_pass: my_password`
- `auth_pass_key`: The secret key containing the password to use for basic auth. Can be used instead of `auth_pass`. E.g. `auth_pass_key: my_secret_password`
- `query`: The GraphQL query to execute. E.g.
```yaml
query: |
  {
    some {
      nodes {
        field1
        field2
      }
    }
  }
```
- `json_path`: The path to the JSON data in the response. E.g. `json_path: data.some.nodes`

Configuration `params` are provided either in the top level `dataset` for a dataset source and federated SQL query.

Example using github graphql API:
```yaml
from: graphql:https://api.github.com/graphql
name: repos
params:
  auth_token: <your_github_token>
  json_path: data.viewer.repositories.nodes
  query: |
    {
      viewer {
        repositories(first: 100) {
          nodes {
            id
            name
            watchers (first: 10) {
              nodes {
                name
              }
            }
          }
        }
      }
    }
```
