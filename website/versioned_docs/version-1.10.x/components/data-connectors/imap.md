---
title: 'IMAP Data Connector'
sidebar_label: 'IMAP Data Connector'
description: 'IMAP Data Connector Documentation'
pagination_prev: null
---

The IMAP Data Connector enables federated SQL query across emails stored in an IMAP email server.

```yaml
datasets:
  - from: imap:myawesomeemail@example.com
    name: emails
    params:
      imap_password: ${secrets:IMAP_PASSWORD}
```

## Schema

| Field Name    | Data Type    | Nullable | Description                                                                      |
| ------------- | ------------ | -------- | -------------------------------------------------------------------------------- |
| `date`        | `Date64`     | No       | The date and time when the email was sent.                                       |
| `subject`     | `Utf8`       | Yes      | The subject line of the email.                                                   |
| `from`        | `List<Utf8>` | Yes      | The sender(s) of the email.                                                      |
| `to`          | `List<Utf8>` | Yes      | The primary recipient(s) of the email.                                           |
| `cc`          | `List<Utf8>` | Yes      | The carbon copy recipient(s) of the email.                                       |
| `bcc`         | `List<Utf8>` | Yes      | The blind carbon copy recipient(s) of the email.                                 |
| `reply_to`    | `List<Utf8>` | Yes      | The email address(es) to which replies should be sent.                           |
| `message_id`  | `Utf8`       | Yes      | A unique identifier for the email message.                                       |
| `in_reply_to` | `Utf8`       | Yes      | The `message_id` of the email this message is replying to, if applicable.        |
| `content`     | `Utf8`       | Yes      | The raw email body of this message. Not retrieved when acceleration is disabled. |

If a MIME-encoded value is retrieved for a field, it is not decoded and the MIME-encoded value is returned in SQL queries.

Most fields are optional, and depend on the implementation of the specific IMAP server being connected to. For example, the IMAP RFC specifies the `message_id` field SHOULD be supplied but the field is an optional field.

For more information, refer to the [IMAP RFC 2822 - Section 3.6](https://www.rfc-editor.org/rfc/rfc2822#section-3.6).

## Retrieving email body contents

When the IMAP Data Connector is used without acceleration, the email body will not be retrieved - only header/subject values. To load the email body contents, specify an acceleration:

```yaml
datasets:
  - from: imap:myawesomeemail@example.com
    name: emails
    params:
      imap_password: ${secrets:IMAP_PASSWORD}
    acceleration:
      enabled: true
```

With an acceleration enabled, the `content` field will be populated with the complete email body including headers, without any decoding applied. This field could be used for post-processing the email, like retrieving custom header values or decoding MIME-encoded content.

:::warning[Limitations]

- Email attachments are currently not parsed from the email body into separate dataset fields. To read email attachments, parse the multipart encodings from the `content` field.

:::

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

The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords).

### `params`

The IMAP connector supports the following connection and authentication parameters:

| Parameter Name  | Description                                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `imap_username` | Optional. The username to use for the IMAP connection. Defaults to the value of the `from:` mailbox field.                   |
| `imap_password` | Required. The password to use for the IMAP connection, in plaintext authentication mode.                                     |
| `imap_host`     | Optional. The host or IP address of the IMAP server to connect to. Not required for known connections like Outlook or Gmail. |
| `imap_port`     | Optional. The port of the IMAP server to connect to. Defaults to `993`.                                                                         |
| `imap_mailbox`  | Optional. The mailbox to read mail from. Defaults to `INBOX`, the standard email inbox.                                      |
| `imap_ssl_mode` | Optional. The IMAP SSL mode to use. Defaults to `auto`, permitted values of `tls`, `starttls`, `disabled` or `auto`.          |

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

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores#using-secrets).

## Cookbook

- A cookbook recipe to configure IMAP as a data connector in Spice. [IMAP Data Connector](https://github.com/spiceai/cookbook/tree/trunk/imap/#readme)
