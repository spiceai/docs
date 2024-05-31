---
title: 'GraphQL Data Connector'
sidebar_label: 'GraphQL Data Connector'
description: 'GraphQL Data Connector Documentation'
---

## Federated SQL query

To connect to any [GraphQL](https://graphql.org/) endpoint as connector for federated SQL query, specify `graphql` as the selector in the `from` value for the dataset.

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

:::warning[Limitations]

- The GraphQL data connector does not support pagination.
- The GraphQL data connector does not support variables in the query.
- Acceleration only works with `arrow` engine. Support for other engines is in progress.
- Object or array handling in the response is required by using the `json_path` parameter.

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

Example using github graphql API using Bearer Auth:
```yaml
from: graphql:https://api.github.com/graphql
name: stars
params:
  auth_token: [your_github_token>]
  json_path: data.viewer.starredRepositories.nodes
  query: |
    {
      viewer {
        starredRepositories {
          nodes {
            name
            stargazerCount
            languages (first: 10) {
              nodes {
                name
              }
            }
          }
        }
      }
    }

```
You can query nested structures as well. Here is an example of querying a nested structure:
<img width="500" src="/img/graphql/stars-query.png" />

Example using Basic Auth:
```yaml
from: graphql:https://your-site.com/graphql
name: your_dataset
params:
  auth_user: [your_user]
  auth_pass: [your_password]
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
