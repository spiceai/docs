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
- The GraphQL data connector does not support variables in the query.
- Filter pushdown is not currently supported; however, when using the limit, the connector will request only the necessary data.
- Acceleration of response nested data only works with `arrow` engine. Support for other engines is in progress.
:::
## Configuration

The GraphQL data connector can be configured by providing the following `params`:

- `unnest_depth`: Depth level to automatically unnest objects to. By default, disabled if unspecified or `0`.
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

## Pagination

The GraphQL Data Connector supports automatic pagination of the response for queries using [cursor pagination](https://graphql.org/learn/pagination/).

In order to enable pagination you need to specify `first` and `pageInfo` with both `endCursor` and `hasNextPage` fields. The `json_path` must point to the field which is the child of the paginated resource.

Example:
```yaml
from: graphql:https://api.github.com/graphql
name: stargazers
params:
  auth_token: [github_token]
  json_path: data.repository.stargazers.edges
  query: |
    {
      repository(name: "spiceai", owner: "spiceai") {
        id
        name
        stargazers(first: 100) {
          edges {
            node {
              id
              name
              login
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }

      }
    }
description: spiceai stargazers
acceleration:
  enabled: true
  refresh_mode: full
  refresh_check_interval: 30m
```

## Working with JSON Data

Tips for working with JSON data. For more information see [Datafusion Docs](https://datafusion.apache.org/user-guide/sql/scalar_functions.html#array-functions).

### Accessing objects fields

You can access the fields of the object using the square bracket notation.
Arrays are indexed from 1.

Example for the stargazers query from [pagination section](#pagination):
```bash
sql> select node['login'] as login, node['name'] as name from stargazers limit 5;
+--------------+----------------------+
| login        | name                 |
+--------------+----------------------+
| simsieg      | Simon Siegert        |
| davidmathers | David Mathers        |
| ahmedtadde   | Ahmed Tadde          |
| lordhamlet   | Shih-Fen Cheng       |
| thinmy       | Thinmy Patrick Alves |
+--------------+----------------------+
```

### Piping array into rows

You can use Datafusion `unnest` function to pipe values from array into rows.
We'll be using [countries GraphQL api](https://countries.trevorblades.com) as an example.

```yaml
from: graphql:https://countries.trevorblades.com
name: countries
params:
  json_path: data.continents
  query: |
    {
      continents {
        name
        countries {
          name
          capital
        }
      }
    }

description: countries
acceleration:
  enabled: true
  refresh_mode: full
  refresh_check_interval: 30m
```

Example query:
```bash
sql> select continent, country['name'] as country, country['capital'] as capital
from (select name as continent, unnest(countries) as country from countries)
where continent = 'North America' limit 5;
+---------------+---------------------+--------------+
| continent     | country             | capital      |
+---------------+---------------------+--------------+
| North America | Antigua and Barbuda | Saint John's |
| North America | Anguilla            | The Valley   |
| North America | Aruba               | Oranjestad   |
| North America | Barbados            | Bridgetown   |
| North America | Saint Barthélemy    | Gustavia     |
+---------------+---------------------+--------------+
```

### Unnesting object properties

You can also use the `unnest_depth` parameter to control automatic unnesting of objects from GraphQL responses.

This examples uses the GitHub stargazers endpoint:
```yaml
from: graphql:https://api.github.com/graphql
name: stargazers
params:
  auth_token: [github_token]
  unnest_depth: 2
  json_path: data.repository.stargazers.edges
  query: |
    {
      repository(name: "spiceai", owner: "spiceai") {
        id
        name
        stargazers(first: 100) {
          edges {
            node {
              id
              name
              login
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }

      }
    }
```

If `unnest_depth` is set to 0, or unspecified, object unnesting is disabled. When enabled, unnesting automatically moves nested fields to the parent level.

Without unnesting, stargazers data looks like this in a query:
```bash
sql> select node from stargazers limit 1;
+------------------------------------------------------------+
| node                                                       |
+------------------------------------------------------------+
| {id: MDQ6VXNlcjcwNzIw, login: ashtom, name: Thomas Dohmke} |
+------------------------------------------------------------+
```

With unnesting, these properties are automatically placed into their own columns:
```bash
sql> select node from stargazers limit 1;
+------------------+--------+---------------+
| id               | login  | name          |
+------------------+--------+---------------+
| MDQ6VXNlcjcwNzIw | ashtom | Thomas Dohmke |
+------------------+--------+---------------+
```

#### Unnesting Duplicate Columns

By default, the Spice Runtime will error when a duplicate column is detected during unnesting.

For example, this example `spicepod.yml` query would fail due to `name` fields:
```yaml
from: graphql:https://localhost
name: stargazers
params:
  unnest_depth: 2
  json_path: data.users
  query: |
    query {
      users {
        name
        emergency_contact {
          name
        }
      }
    }
```

This example would fail with a runtime error:
```bash
WARN runtime: GraphQL Data Connector Error: Invalid object access. Column 'name' already exists in the object.
```

Avoid this error by [using aliases in the query](https://www.apollographql.com/docs/kotlin/advanced/using-aliases/) where possible. In the example above, a duplicate error was introduced from `emergency_contact { name }`.

The example below uses a GraphQL alias to rename `emergency_contact.name` as `emergencyContactName`.
```yaml
from: graphql:https://localhost
name: stargazers
params:
  unnest_depth: 2
  json_path: data.people
  query: |
    query {
      users {
        name
        emergency_contact {
          emergencyContactName: name
        }
      }
    }
```
