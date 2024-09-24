---
title: "search"
sidebar_label: "search"
pagination_prev: null
pagination_next: null
---

Performs embeddings-based searches across search configured datasets. Note: Search requires the `ai` feature to be installed.

### Usage

```shell
spice search [query] [flags]
```

`query` - a search query

#### Flags

- `--cloud`  Whether to use cloud instance for search (default: false)
- `--limit`  Limit number of search results
- `--model`  Model to use for search
- `--http-endpoint`  HTTP endpoint for search (default: http://localhost:8090).

### Examples

```shell
>>> spice search
```

```shell
```