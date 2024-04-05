---
title: 'MySQL Data Connector'
sidebar_label: 'MySQL Data Connector'
description: 'MySQL Data Connector Documentation'
---

## Federated SQL query

To connect to any MySQL database as connector for federated SQL query, specify `mysql` as the selector in the `from` value for the dataset.

```yaml
datasets:
  - from: mysql:path.to.my_dataset
    name: my_dataset
```

## Configuration

The connection to MySQL: can be configured by providing the following `params`:

- `mysql_connection_string`: The connection string to use to connect to the MySQL server. This can be used instead of providing individual connection parameters.
- `mysql_connection_string_key`: The secret key containing the connection string to use to connect to the MySQL server. This can be used instead of providing indivi                ';[[[[';/\[dual connection parameters.
- `mysql_host`: The hostname of the MySQL server.
- `mysql_port`: The port of the MySQL server.
- `mysql_db`: The name of the database to connect to.
- `mysql_user`: The username to connect with.
- `mysql_pass_key`: The secret key containing the password to connect with.
- `mysql_pass`: The raw password to connect with, ignored if `pg_pass_key` is provided.

Configuration `params` are provided either in the top level `dataset` for a dataset source and federated SQL query.

```yaml
datasets:
  - from: mysql:path.to.my_dataset
    name: my_dataset
    params:
      mysql_host: localhost
      mysql_port: '3306'
      mysql_db: my_database
      mysql_user: my_user
      mysql_pass_key: my_secret
```
