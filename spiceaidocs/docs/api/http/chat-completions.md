---
title: 'POST /v1/chat/completions'
sidebar_label: 'POST /v1/chat/completions'
description: ''
sidebar_position: 6
---

Chat completions is an OpenAI compatible endpoint.

Specify the model by providing the component name in the `model` key. For example:

```shell
curl http://localhost:8090/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "my_language_model",
    "messages": [
      {
        "role": "system",
        "content": "I am just like any other OpenAI server!"
      },
      {
        "role": "user",
        "content": "That\'s cool!"
      }
    ]
  }'
```
