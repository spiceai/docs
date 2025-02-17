---
title: 'IMAP Data Connector'
sidebar_label: 'IMAP Data Connector'
description: 'IMAP Data Connector Documentation'
pagination_prev: null
---

The IMAP Data Connector enables federated SQL query across your emails stored in an IMAP email server.

```yaml
datasets:
  - from: imap:myawesomeemail@outlook.com
    name: emails
    params:
      imap_access_token: ${secrets:IMAP_ACCESS_TOKEN}
```

## Configuration

### `from`

The `from` field must contain the email address for the mailbox to connect to. For example, `me@outlook.com`, or `jsmith@example.com`.

### `name`

The dataset name. This will be used as the table name within Spice.

Example:

```yaml
datasets:
  - from: imap:jsmith@example.com
    name: emails
    params: ...
```

```sql
SELECT COUNT(*) FROM emails;
```

```shell
+----------+
| count(*) |
+----------+
| 1234     |
+----------+
```

### `params`

The IMAP connector supports the following connection and authentication parameters:

| Parameter Name      | Description                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| `imap_username`     | Optional. The username to use for the IMAP connection. Defaults to the value of the `from:` mailbox field. |
| `imap_access_token` | Optional. The OAuth access token to use for the IMAP connection, to connect to OAuth-enabled IMAP servers (like Outlook, or Gmail). |
| `imap_password`     | Optional. The password to use for the IMAP connection, in plaintext authentication mode. |
| `imap_host`         | Optional. The host or IP address of the IMAP server to connect to. Not required for known connections like Outlook or Gmail. |
| `imap_port`         | Optional. The port of the IMAP server to connect to. |
| `imap_mailbox`      | Optional. The mailbox to read mail from. Defaults to `INBOX`, the standard email inbox. |
| `imap_ssl_mode`     | Optional. The IMAP SSL mode to use. Defaults to `tls`, permitted values of `tls`, `starttls`, `disabled` or `auto`. |

## Examples

### Basic example

```yaml
datasets:
  - from: imap:jsmith@example.com
    name: emails
    params:
      imap_host: mail.example.com
      imap_password: ${ secrets:IMAP_PASSWORD }
```

### Using OAuth authentication

```yaml
datasets:
  - from: imap:jsmith@outlook.com
    name: emails
    params:
      imap_access_token: ${ secrets:IMAP_ACCESS_TOKEN }
```

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](/docs/components/secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](/docs/components/secret-stores#using-secrets).

## Cookbook

- A cookbook recipe to configure IMAP as a data connector in Spice. [IMAP Data Connector](https://github.com/spiceai/cookbook/tree/trunk/imap/#readme)
- A cookbook recipe to configure IMAP with Outlook using OAuth authentication as a data connector in Spice. [Connecting to an Outlook mailbox](https://github.com/spiceai/cookbook/tree/trunk/imap/outlook.md)
