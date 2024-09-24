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
>>> spice search --limit 2
```

```shell
search> artificial intelligence


Rank 1, Score: 20.6, Datasets [pdf]
Undergraduate Texts in Mathematics Editors: F. W. Gehring P. R.
Halmos ·
Advisory Board: C. DePrima
I. Herstein J. Kiefer W. LeVeque Kai Lai Chung
Elementary Probability
Theory with Stochastic Processes Springer Science+Business Media, LLC
...

Rank 2, Score: 17.8, Datasets [pdf]
Forecasting at Scale Sean J. Taylor  y Facebook, Menlo Park, California, United States sjt@fb.com and Benjamin Letham y Facebook, Menlo Park, California, United States bletham@fb.com Abstract Forecasting is a common data science...
```
