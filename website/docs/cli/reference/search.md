---
title: 'search'
sidebar_label: 'search'
pagination_prev: null
pagination_next: null
---

Searches datasets that have embeddings, using the runtime's [`POST /v1/search`](../../api/HTTP/post-search) endpoint.

### Usage

```shell
spice search [QUERY] [flags]
```

`spice search` runs in one of three ways, depending on whether a query is given and where stdin comes from:

- **One query.** `spice search 'QUERY'` runs that query once and exits.
- **Piped queries.** With no query and piped stdin, `spice search` reads one query per line, skips empty lines, and runs each. With `-o json`, the output of several piped queries is one JSON array with a response per query.
- **Interactive.** With no query on a terminal, `spice search` opens an interactive `search>` prompt: type a query and press Enter to search. Type `exit` or `quit` to leave.

The word `help` is searched like any other query. Only `--help` and `-h` print help.

#### Flags

- `--limit`, `-l` Maximum number of results to return from each dataset. Default: `10`. A search over three datasets returns up to 30 results.
- `--datasets <DATASET>` Datasets to search. Repeat the flag or separate names with commas. Default: all searchable datasets.
- `--additional-columns <COLUMN>` Extra columns to return with each match. Repeat the flag or separate names with commas.
- `--where <FILTER>` SQL filter applied before ranking, written without the `WHERE` keyword, such as `--where "status = 'open'"`.
- `--keywords <KEYWORD>` Keywords that pre-filter the embedding column. Repeat the flag or separate keywords with commas.
- `--cache-control <value>` Control whether the results cache is used for searches. Values: `cache` (default), `no-cache`.
- `--endpoint <endpoint>` Specifies the remote Spice instance HTTP endpoint (e.g., `http://localhost:8090`).
- `--headers <KEY:VALUE>` Custom HTTP headers in format `Key:Value` (can be specified multiple times).
- `-o`, `--output <format>` Output format: `table` (default) or `json`.

`--limit`, `--datasets`, `--additional-columns`, `--where`, and `--keywords` are sent as the `limit`, `datasets`, `additional_columns`, `where`, and `keywords` fields of the `POST /v1/search` request body.

#### Scripting

Piped output and `-o json` output contain only the results: the progress spinner is shown only when stdout is a terminal. With `-o json`, a search with no matches prints a JSON object whose `results` array is empty.

An error is printed on stderr, and the command exits with a non-zero status:

| Condition | Exit status |
| --- | --- |
| An empty query, or piped stdin with no queries | `2` |
| The runtime returns an HTTP error, or cannot be reached | `1` |

In v2.4.x and earlier, `spice search` took no query argument and always opened the interactive prompt, and a `--model` flag was accepted and ignored. The `--model` flag is removed: a command that passes it fails with an unexpected-argument error.

### Examples

Run one query and print the matches as JSON:

```shell
spice search 'dolphins' -o json
```

Scope a query to one dataset, return an extra column, and filter rows before ranking:

```shell
spice search 'dolphins' --datasets docs --additional-columns title --where "status = 'open'" -o json
```

Run each line of a file as a query:

```shell
cat queries.txt | spice search -o json
```

#### Remote Example

```shell
# Search with a remote spiced instance
spice search 'artificial intelligence' --endpoint http://my-remote-host:8090
```

#### Interactive Example

```shell
spice search --limit 2
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
