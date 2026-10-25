---
title: 'Models Grade Report'
description: 'Spice AI graded Large-Language-Model (LLM) evaluation report'
sidebar_label: 'Models Grade Report'
sidebar_position: 4
hide_table_of_contents: true
---

This document presents the evaluation report for various Large-Language-Models (LLMs) graded by Spice AI. The models are assessed based on their basic capabilities, quality of tool calls, and accuracy of output when integrated with Spice.

For more details on how model grades are evaluated in Spice, refer to the [model grading criteria](https://github.com/spiceai/spiceai/blob/f6039123028209e20469b342791fa85d52b7771e/docs/criteria/models/grading).

| Model                                           | Spice Grade | Model Provider | Context Window<br/ >Max Output Tokens | Chat Completion | Response Format<br />(Structued Outputs) | Tools | Recursive<br />Tool Calling | Reasoning | Streaming | Model Release Date | Spice Version |
| ----------------------------------------------- | ----------- | -------------- | ------------------------------------- | --------------- | ---------------------------------------- | ----- | --------------------------- | --------- | --------- | ------------------ | ------------- |
| `o3-mini-2025-01-31 (Reasoning effort: high)`   | **A**       | `openai`       | 200k tokens<br/ >100k tokens          | ✅              | ✅                                       | ✅    | ✅                          | ✅        | ✅        | 2025-01-31         | v1.0.2        |
| `o3-mini-2025-01-31 (Reasoning effort: medium)` | **B**       | `openai`       | 200k tokens<br/ >100k tokens          | ✅              | ✅                                       | ✅    | ✅                          | ✅        | ✅        | 2025-01-31         | v1.0.2        |
| `o3-mini-2025-01-31 (Reasoning effort: low)`    | **C**       | `openai`       | 200k tokens<br/ >100k tokens          | ✅              | ✅                                       | ✅    | ✅                          | ✅        | ✅        | 2025-01-31         | v1.0.2        |
| `o1-2024-12-17 (Reasoning effort: high)`        | **C**       | `openai`       | 200k tokens<br/ >100k tokens          | ✅              | ✅                                       | ✅    | ✅                          | ✅        | ❌        | 2024-12-17         | v1.0.2        |
| `o1-2024-12-17 (Reasoning effort: medium)`      | **C**       | `openai`       | 200k tokens<br/ >100k tokens          | ✅              | ✅                                       | ✅    | ✅                          | ✅        | ❌        | 2024-12-17         | v1.0.2        |
| `o1-2024-12-17 (Reasoning effort: low)`         | **C**       | `openai`       | 200k tokens<br/ >100k tokens          | ✅              | ✅                                       | ✅    | ✅                          | ✅        | ❌        | 2024-12-17         | v1.0.2        |
| `gpt-4o-2024-08-06`                             | **B**       | `openai`       | 128k tokens<br/ >16384 tokens         | ✅              | ✅                                       | ✅    | ✅                          | ❌        | ✅        | 2024-08-06         | v1.0.2        |
| `claude-3-5-sonnet-20241022`                    | **C**       | `anthropic`    | 200k tokens<br/ >8192 tokens          | ✅              | ❌                                       | ✅    | ✅                          | ❌        | ✅        | 2024-10-22         | v1.0.2        |
| `grok-4.3`                                      | Ungraded    | `xai`          | 1M tokens<br/ >−                      | ✅              | −                                        | −     | −                           | ✅        | −         | 2026               | v2.1          |
| `deepseek-ai/DeepSeek-R1-Distill-Llama-8B`      | Ungraded    | `huggingface`  | −                                     | ✅              | −                                        | −     | −                           | ✅        | −         | Not Available      | v1.0.2        |
| `meta-llama/Llama-3.2-3B-Instruct`              | Ungraded    | `huggingface`  | −                                     | ✅              | −                                        | −     | −                           | ❌        | −         | Not Available      | v1.0.2        |
| `deepseek-reasoner`                             | Ungraded    | `openai`       | 64k tokens<br/ >8k tokens             | ✅              | −                                        | −     | −                           | ✅        | ✅        | 2025/01/20         | v1.0.4        |
