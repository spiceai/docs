---
title: 'HuggingFace'
description: 'Instructions for using machine learning models hosted on HuggingFace with Spice.'
sidebar_label: 'HuggingFace'
sidebar_position: 4
---

To use a model hosted on HuggingFace, specify the `huggingface.co` path in the `from` field and, when needed, the files to include.

## Configuration

### `from`

The `from` key takes the form of `huggingface:model_path`. Below shows 2 common example of `from` key configuration.

- `huggingface:username/modelname`: Implies the latest version of `modelname` hosted by `username`.
- `huggingface:huggingface.co/username/modelname:revision`: Specifies a particular `revision` of `modelname` by `username`, including the optional domain.

The `from` key follows the following regex format.

```regex
\A(huggingface:)(huggingface\.co\/)?(?<org>[\w\-]+)\/(?<model>[\w\-]+)(:(?<revision>[\w\d\-\.]+))?\z
```

The `from` key consists of five components:

1. **Prefix:** The value must start with `huggingface:`.
2. **Domain (Optional):** Optionally includes `huggingface.co/` immediately after the prefix. To read through a mirror or proxy of the Hub, set [`hf_endpoint`](#endpoint).
3. **Organization/User:** The HuggingFace organization (`org`).
4. **Model Name:** After a `/`, the model name (`model`).
5. **Revision (Optional):** A colon (`:`) followed by the git-like revision identifier (`revision`).

### `name`

The model name. This will be used as the model ID within Spice and Spice's endpoints (i.e. `http://localhost:8090/v1/models`). This can be set to the same value as the model ID in the `from` field.

### `params`

| Param           | Description                                                                                                                                                                               | Default |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `hf_token`      | The Huggingface access token. `huggingface_token` is accepted as an alias. See [access tokens](#access-tokens).                                                                            | -       |
| `hf_endpoint`   | The Hugging Face Hub endpoint to download the model from, to read through a mirror or proxy of the Hub. See [endpoint](#endpoint).                                                         | `HF_ENDPOINT`, then `https://huggingface.co` |
| `model_type`    | The architecture to load the model as. Supported text architectures: `mistral`, `gemma`, `mixtral`, `llama`, `phi2`, `phi3`, `qwen2`, `gemma2`, `starcoder2`, `phi3.5moe`, `deepseekv2`, `deepseekv3`, `qwen3`, `glm4`, `glm4moelite`, `glm4moe`, `qwen3moe`, `smollm3`, `granitemoehybrid`, `gpt_oss`, `qwen3next`. Supported multimodal architectures: `phi3v`, `idefics2`, `llava_next`, `llava`, `vllama`, `qwen2vl`, `idefics3`, `minicpmo`, `phi4mm`, `qwen2_5vl`, `gemma3`, `mistral3`, `llama4`, `gemma3n`, `gemma4`, `qwen3vl`, `qwen3vlmoe`, `qwen3_5`, `qwen3_5moe`, `voxtral`. | -       |
| `tools`         | Which [tools] should be made available to the model. Set to `auto` to use all available tools.                                                                                            | -       |
| `system_prompt` | An additional system prompt used for all chat completions to this model.                                                                                                                  | -       |
| `hf_reasoning_effort` | The default `reasoning_effort` for every chat completion to this model. See [Reasoning effort for local models](../index.md#reasoning-effort-for-local-models). | - |

### `files`

The specific file path for Huggingface model. For example, GGUF model formats require a specific file path, other varieties (e.g. `.safetensors`) are inferred.

#### Example

```yaml
models:
  - from: huggingface:huggingface.co/lmstudio-community/Qwen2.5-Coder-3B-Instruct-GGUF
    name: sloth-gguf
    files:
      - path: Qwen2.5-Coder-3B-Instruct-Q3_K_L.gguf
```

## Hugging Face Hub

Spice reads from the Hugging Face Hub the way the `hf` CLI does, so a token, mirror, cache or offline mode set up for the `hf` CLI works for Spice too. The [access token](#access-tokens) and [endpoint](#endpoint) settings apply to every Hugging Face component: models, [embedding models](../embeddings/huggingface), [Model2Vec models](../embeddings/model2vec), rerankers, tokenizer `files:`, and [datasets](../data-connectors/huggingface). The [cache](#cache), [offline](#offline-use-and-outages) and [download](#downloads) settings apply to the components that Spice downloads: models, embedding models, Model2Vec models, rerankers and tokenizer `files:`. A dataset reads its files from the Hub and not from the cache, so `HF_HUB_OFFLINE` and the fallback to the cache during an outage do not apply to it.

### Access Tokens

A private or gated repository needs a [User Access Token](https://huggingface.co/settings/tokens) of an account that can read it. For a gated repository, first accept its access conditions on the repository's page with that account. Spice uses the first token it finds:

1. `hf_token` in the component's [params](#params).
1. For an embedding model, a Model2Vec model, a reranker or a dataset that does not set `hf_token`: a secret named `hf_token` in the configured [secret stores](../secret-stores). A model used for chat does not read this secret.
1. The `HF_TOKEN` environment variable, then `HUGGING_FACE_HUB_TOKEN`.
1. The token `hf auth login` saves, in the file at `HF_TOKEN_PATH` (by default `$HF_HOME/token`, that is `~/.cache/huggingface/token`).

```yaml
models:
  - name: llama_3.2_1B
    from: huggingface:huggingface.co/meta-llama/Llama-3.2-1B
    params:
      hf_token: ${ secrets:HF_TOKEN }
```

A token from the environment, the token file, or a secret store that the Spicepod does not name is sent only to the public Hub or to `HF_ENDPOINT`, never to an `hf_endpoint` set in the Spicepod. To read a private repository through a mirror, set `hf_token` in the component's `params`.

`HF_HUB_TOKEN`, which earlier releases read for models, is still read after `HUGGING_FACE_HUB_TOKEN`, with a warning. It is deprecated: use `HF_TOKEN`.

### Endpoint

Spice downloads from `hf_endpoint` when a component sets it, else from `HF_ENDPOINT`, else from `https://huggingface.co`. The endpoint must be an `https://` URL; `http://` is accepted only for a loopback address.

### Cache

Downloads go to the standard Hugging Face cache: `HF_HUB_CACHE`, else `HUGGINGFACE_HUB_CACHE`, else `$HF_HOME/hub`. `HF_HOME` defaults to `$XDG_CACHE_HOME/huggingface` when `XDG_CACHE_HOME` is set, else to `~/.cache/huggingface`. A model downloaded with `hf download` is not downloaded again, and the `hf` CLI reads what Spice downloads.

Each load resolves the revision (`main` by default) to a commit, and downloads only the files of that commit the cache lacks. A commit hash as the revision pins the files.

### Offline Use and Outages

With `HF_HUB_OFFLINE=1` (or `TRANSFORMERS_OFFLINE=1`), Spice never contacts the Hub, and loads each repository from the cache. A repository the cache lacks fails to load, with an error that names the cache and the `hf download` command that fills it.

When the Hub cannot be reached, or fails for any reason but a missing repository, revision or file, Spice loads the revision from the cache and logs a warning. Changes to the revision are not seen until the Hub is reachable again.

### Downloads

Up to 8 files of a repository download at once. Each file is checked against the Hub's checksum before it is used, and an interrupted download resumes where it stopped. Processes that share a cache wait for each other rather than download a file twice. A long download logs its progress every 30 seconds:

```text
INFO Downloading 10 files (16.4 GB) for model 'qwen' from Hugging Face repo 'Qwen/Qwen3-8B' at commit b968826 (revision 'main').
INFO Downloading model 'qwen': 6.1 of 16.4 GB (37%) at 52 MB/s, about 3 min left.
INFO Downloaded model 'qwen' from Hugging Face repo 'Qwen/Qwen3-8B' in 5 min 12 s.
```

## Examples

### Load a LLM model to generate text

```yaml
models:
  - from: huggingface:huggingface.co/microsoft/Phi-3.5-mini-instruct
    name: phi
```

### Load a private model

```yaml
models:
  - name: llama_3.2_1B
    from: huggingface:huggingface.co/meta-llama/Llama-3.2-1B
    params:
      hf_token: ${ secrets:HF_TOKEN }
```

For more details on authentication, see [access tokens](#access-tokens).

:::warning[Limitations]

- The throughput, concurrency & latency of a locally hosted model will vary based on the underlying hardware and model size. Spice supports Apple Metal and CUDA for accelerated inference. See [CONTRIBUTING.md](https://github.com/spiceai/spiceai/blob/trunk/CONTRIBUTING.md) for build instructions.

:::

## Cookbook

- Use the Llama family of models locally from HuggingFace using Spice. [Running Llama3 Locally](https://github.com/spiceai/cookbook/blob/trunk/llama/README.md)
