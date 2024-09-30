---
title: 'POST /v1/search'
sidebar_label: 'POST /v1/search'
description: ''
sidebar_position: 7
pagination_prev: null
pagination_next: null
---

Performs a basic vector similarity search from one or more dataset(s).

Request Body
 - `datasets` (array of strings): Dataset component names to perform similarity search against. Each dataset is expected to have one and only one column augmented with an embedding.
 - `text` (string): Query plaintext used to retrieve similar rows from the underlying datasets listed in the `from` request key.
 - `limit` (integer): The number of rows to return, per `from` dataset. Default: 3.
 - `where` (string): An SQL filter predicate to apply within the search.
 - `additional_columns` (array of strings): Additional columns, from the datasets, to return in the response (under `.matches[*].metadata`).

#### Example

Spicepod
```yaml
embeddings:
  - name: embedding_maker
    from: openai
datasets:
  - name: app_messages
    from: file://my.csv
    embeddings:
      - column: document_text
        use: embedding_maker
```

Request
```shell
curl -XPOST http://localhost:3000/v1/search \
  -d '{
    "datasets": ["app_messages"],
    "text": "Tokyo plane tickets",
    "where": 'user=1234321',
    "additional_columns": ["timestamp"],
    "limit": 3
  }'
```

Response
```json
{
  "matches": [{
    "value": "I booked use some tickets",
    "dataset": "app_messages",
    "primary_key": {"id": "6fd5a215-0881-421d-ace0-b293b83452b5"},
    "metadata": {"timestamp": 1724716542}
   },
   {
    "value": "direct to Narata",
    "dataset": "app_messages",
    "primary_key": {"id": "8a25595f-99fb-4404-8c82-e1046d8f4c4b"},
    "metadata": {"timestamp": 1724715881}
   },
   {
    "value": "Yes, we're sitting together",
    "dataset": "app_messages",
    "primary_key": {"id": "8421ed84-b86d-4b10-b4da-7a432e8912c0"},
    "metadata": {"timestamp": 1724716123}
   }],
  "duration_ms": 42,
}
```

### Chunking

Datasets with chunking [enabled](/reference/spicepod/datasets.md) only return the most relevant chunk for each match.

To retrieve the entire column, provide the embedding column into the `additional_columns` list. For example:

```shell
curl -XPOST http://localhost:3000/v1/search \
  -d '{
    "datasets": ["support_tickets"],
    "text": "password reset issues",
    "where": "status='open'",
    "additional_columns": ["ticket_id", "timestamp", "conversation_history"],
    "limit": 3
  }'
```

Response
```json
{
  "matches": [
    {
      "value": "I've tried resetting my password multiple times, but it's not working",
      "dataset": "support_tickets",
      "primary_key": {
        "ticket_id": "T-1234"
      },
      "metadata": {
        "timestamp": 1724716542,
        "conversation_history": "Customer: Hi, I'm having trouble logging into my account.\nAgent: Hello! I'd be happy to help. Can you describe the issue in more detail?\nCustomer: I've tried resetting my password multiple times, but it's not working. I click the reset link, enter a new password, but when I try to log in, it says the password is incorrect.\nAgent: I see, that sounds frustrating. Let's try to troubleshoot this step by step. First, are you receiving the password reset email promptly after requesting it?\nCustomer: Yes, the email comes through right away.\nAgent: Okay, good. When you set the new password, are there any specific requirements that might not be met? For example, minimum length or special characters?\nCustomer: I'm pretty sure I'm meeting all the requirements, but let me double-check..."
      }
    },
    {
      "value": "The password reset link in the email is expired",
      "dataset": "support_tickets",
      "primary_key": {
        "ticket_id": "T-5678"
      },
      "metadata": {
        "timestamp": 1724715881,
        "conversation_history": "Customer: Hello, I need help with resetting my password.\nAgent: Hi there! I'd be glad to assist you with resetting your password. Can you tell me what steps you've taken so far?\nCustomer: I requested a password reset and got an email, but when I click the link, it says it's expired.\nAgent: I see. Password reset links typically expire after a certain period for security reasons. Let's try generating a new reset link. Can you please go to the login page and request another password reset?\nCustomer: Okay, I've done that. I got a new email right away.\nAgent: Excellent! Please try using this new link to reset your password. Make sure to use it within the next 30 minutes to ensure it doesn't expire again.\nCustomer: It worked! I was able to set a new password. Thank you so much for your help.\nAgent: You're welcome! I'm glad we could resolve the issue. Is there anything else I can help you with today?"
      }
    },
    {
      "value": "two-factor authentication is preventing password reset",
      "dataset": "support_tickets",
      "primary_key": {
        "ticket_id": "T-9101"
      },
      "metadata": {
        "timestamp": 1724714123
        "conversation_history": "Customer: I'm locked out of my account and can't reset my password.\nAgent: I'm sorry to hear that. Let's see how we can help. What happens when you try to reset your password?\nCustomer: I get to the reset page, but then it asks for a code from my authenticator app. I've gotten a new phone since I set up the account, so I don't have access to that anymore.\nAgent: Ah, I understand. It sounds like two-factor authentication is preventing the password reset. In this case, we'll need to verify your identity through alternative means. Can you please provide your full name and the email address associated with the account?\nCustomer: Sure, it's John Doe and johndoe@email.com.\nAgent: Thank you, Mr. Doe. I've located your account. For security purposes, I'm going to need to ask you a few verification questions before we proceed with disabling two-factor authentication..."
      }
    }
  ],
  "duration_ms": 45
}
```
