---
title: 'GraphQL Data Connector'
sidebar_label: 'GraphQL Data Connector'
description: 'GraphQL Data Connector Documentation'
---


The [GraphQL](https://graphql.org/) Data Connector enables federated SQL queries on any GraphQL endpoint by specifying `graphql` as the selector in the `from` value for the dataset.

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
- Acceleration of response nested data only works with `arrow` engine. Support for other engines is in progress.
:::
## Configuration

The GraphQL data connector can be configured by providing the following `params`:

- `auth_token`: The authentication token to use to connect to the GraphQL server. Uses bearer authentication. E.g. `auth_token: my_secret_token`
- `auth_token_key`: The secret key containing the authentication token to use to connect to the GraphQL server. Can be used instead of `auth_token`.
E.g. `auth_token_key: my_secret_token_key`
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

Example using GitHub GraphQL API using Bearer Auth:
```yaml
from: graphql:https://api.github.com/graphql
name: stars
params:
  auth_token: [github_token]
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
Nested structures can be queried as well. The following is an example of querying a nested structure:
<img width="500" src="/img/graphql/stars-query.png" />

Example using Basic Auth:
```yaml
from: graphql:https://my-site.com/graphql
name: my_dataset
params:
  auth_user: [my_user]
  auth_pass: [my_password]
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
