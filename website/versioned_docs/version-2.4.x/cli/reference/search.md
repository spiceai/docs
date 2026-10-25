---
title: 'search'
sidebar_label: 'search'
pagination_prev: null
pagination_next: null
---

Performs embeddings-based searches across search-configured datasets.

### Usage

```shell
spice search [query] [flags]
```

`query` - a search query

#### Flags

- `--limit`, `-l` Limit number of search results. Default: `10`.
- `--cache-control <value>` Control whether the results cache is used for searches. Values: `cache` (default), `no-cache`.
- `--model <string>` Model to use for search.
- `--endpoint <endpoint>` Specifies the remote Spice instance HTTP endpoint (e.g., `http://localhost:8090`).
- `--headers <KEY:VALUE>` Custom HTTP headers in format `Key:Value` (can be specified multiple times).
- `-o`, `--output <format>` Output format: `table` (default) or `json`.

### Examples

```shell
>>> spice search --limit 2
```

#### Remote Example

```shell
# Search with a remote spiced instance
spice search --endpoint http://my-remote-host:8090
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

### Additional Example

```shell
>>> spice search --model gpt-3 --limit 1
```

```shell
search> machine learning


Rank 1, Score: 25.4, Datasets [pdf]
Machine Learning Yearning by Andrew Ng
Machine Learning Yearning is a technical book by Andrew Ng that provides practical advice on how to structure machine learning projects.
...
```
