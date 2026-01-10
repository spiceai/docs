---
description: AI Gateway documentation
---

# AI Gateway

Spice provides a high-performance, OpenAI API-compatible AI Gateway optimized for managing and scaling large language models (LLMs). Additionally, Spice offers tools for Enterprise Retrieval-Augmented Generation (RAG), such as SQL query across federated datasets and an advanced search feature (see [Search](https://docs.spiceai.org/features/search)).

Spice supports **full OpenTelemetry observability**, enabling detailed tracking of data flows and requests for full transparency and easier debugging.

### Supported Models[​](https://docs.spiceai.org/features/large-language-models#configuring-language-models) <a href="#configuring-language-models" id="configuring-language-models"></a>

Spice supports a variety of LLMs, including OpenAI, Azure OpenAI, Anthropic, Groq, Hugging Face, and more (see [Model Providers](https://docs.spiceai.org/components/models) for all supported models).

### Core Features[​](https://docs.spiceai.org/features/large-language-models#core-features) <a href="#core-features" id="core-features"></a>

* **Custom Tools**: Equip models with tools to interact with the Spice runtime.
* **System Prompts**: Customize system prompts and override defaults for [`v1/chat/completion`](https://docs.spiceai.org/api/http/chat-completions).

For detailed configuration and API usage, refer to the [API Documentation](https://docs.spiceai.org/api).

### Example: Configuring an OpenAI Compatible Model[​](https://docs.spiceai.org/features/large-language-models#example-configuring-an-openai-model) <a href="#example-configuring-an-openai-model" id="example-configuring-an-openai-model"></a>

To use a language model hosted on OpenAI (or compatible), specify the `openai` path and model ID in `from`.

Example `spicepod.yml`:

```yaml
models:
  - from: openai:gpt-4o-mini
    name: openai
    params:
      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }

  - from: openai:llama3-groq-70b-8192-tool-use-preview
    name: groq-llama
    params:
      endpoint: https://api.groq.com/openai/v1
      openai_api_key: ${ secrets:SPICE_GROQ_API_KEY }
```

For details, see [OpenAI (or Compatible) Language Models](https://docs.spiceai.org/components/models/openai).
