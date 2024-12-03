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
      json_pointer: /data/some/nodes
      graphql_query: |
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
- Filter pushdown, with the exclusion of `LIMIT`, is not currently supported. Using a `LIMIT` will reduce the amount of data requested from the GraphQL server.

:::

## Configuration

The GraphQL data connector can be configured by providing the following `params`. Use the [secret replacement syntax](../secret-stores/index.md) to load the password from a secret store, e.g. `${secrets:my_graphql_auth_token}`.

- `unnest_depth`: Depth level to automatically unnest objects to. By default, disabled if unspecified or `0`.
- `graphql_auth_token`: The authentication token to use to connect to the GraphQL server. Uses bearer authentication.
- `graphql_auth_user`: The username to use for basic auth. E.g. `graphql_auth_user: my_user`
- `graphql_auth_pass`: The password to use for basic auth. E.g. `graphql_auth_pass: ${secrets:my_graphql_auth_pass}`
- `graphql_query`: The GraphQL query to execute. E.g.

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

- `json_pointer`: The [JSON pointer](https://datatracker.ietf.org/doc/html/rfc6901) into the response body. When `graphql_query` is [paginated](#pagination), the `json_pointer` can be inferred.

### Examples

Example using the GitHub GraphQL API and Bearer Auth. The following will use `json_pointer` to retrieve all of the nodes in starredRepositories:

```yaml
from: graphql:https://api.github.com/graphql
name: stars
params:
  graphql_auth_token: ${env:GITHUB_TOKEN}
  graphql_auth_user: ${env:GRAPHQL_USER}                                                                                            ...
  graphql_auth_pass: ${env:GRAPHQL_PASS}
  json_pointer: /data/viewer/starredRepositories/nodes
  graphql_query: |
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

## Pagination

The GraphQL Data Connector supports automatic pagination of the response for queries using [cursor pagination](https://graphql.org/learn/pagination/).

The `graphql_query` must include the `pageInfo` field as per [spec](https://relay.dev/graphql/connections.htm#sec-undefined.PageInfo). The connector will parse the `graphql_query`, and when `pageInfo` is present, will retrieve data until pagination completes.

The query must have the correct pagination arguments in the associated paginated field.

### Example

**Forward Pagination:**

```graphql
{
  something_paginated(first: 100) {
    nodes {
      foo
      bar
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
```

**Backward Pagination:**

```graphql
{
  something_paginated(last: 100) {
    nodes {
      foo
      bar
    }
    pageInfo {
      startCursor
      hasPreviousPage
    }
  }
}
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
  json_pointer: /data/continents
  graphql_query: |
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
  graphql_auth_token: ${env:GITHUB_TOKEN}
  unnest_depth: 2
  json_pointer: /data/repository/stargazers/edges
  graphql_query: |
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
  json_pointer: /data/users
  graphql_query: |
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
  json_pointer: /data/people
  graphql_query: |
    query {
      users {
        name
        emergency_contact {
          emergencyContactName: name
        }
      }
    }
```
