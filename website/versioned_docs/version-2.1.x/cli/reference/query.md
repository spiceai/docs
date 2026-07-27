---
title: 'query'
sidebar_label: 'query'
pagination_prev: null
pagination_next: null
---

Submit an async query or start an interactive async query REPL against the Spice runtime's distributed query engine.

### Usage

```shell
spice query [flags] [SQL]
```

When invoked with a SQL statement, submits it as an async query and waits for the result. When invoked without arguments, starts an interactive REPL.

#### Flags

- `--no-wait` Submit the query and return immediately without waiting for results.
- `--timeout <DURATION>` Maximum client-side wait time (e.g., `30s`, `5m`). The query continues running on timeout.
- `-o`, `--output <FORMAT>` Output format: `table` (default) or `json`.
- `-h`, `--help` Print this help message.

#### Subcommands

| Subcommand                                  | Description                        |
| ------------------------------------------- | ---------------------------------- |
| `spice query list [--status X] [--limit N]` | List queries                       |
| `spice query status <query_id>`             | Check query status                 |
| `spice query results <query_id>`            | Fetch results of a completed query |
| `spice query cancel <query_id>`             | Cancel a running query             |

### Examples

#### Submit and Wait

```shell
$ spice query "SELECT * FROM orders WHERE total > 100 LIMIT 50;"
```

The CLI auto-polls with a spinner and displays results when ready. Press `Ctrl+C` to stop waiting — the query continues running in the background.

#### Submit Without Waiting

```shell
$ spice query "SELECT * FROM large_table;" --no-wait
```

#### Interactive REPL

```shell
$ spice query
query> SELECT COUNT(*)
     > FROM large_table
     > WHERE status = 'active';
Submitted query: 01ABC-DEF-456-7890AB (PENDING)
Press Ctrl+C to stop waiting (query continues in background)
⠹ RUNNING (2.3s)...
✓ SUCCEEDED (5.1s)
+----------+
| count(*) |
+----------+
| 42000    |
+----------+

Time: 5.10000000 seconds. 1 rows.
```

**REPL Commands**:

| Command                | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `.list`                | List all queries tracked in this REPL session  |
| `.status <id>`         | Show detailed status of a query                |
| `.results <id>`        | Fetch and display results of a completed query |
| `.wait <id>`           | Resume waiting for a query to complete         |
| `.cancel <id>`         | Cancel a running query                         |
| `.clear`               | Clear the local tracked queries list           |
| `.clear history`       | Clear command history                          |
| `.help`                | Show available commands                        |
| `.exit`, `.quit`, `.q` | Exit the REPL                                  |

Query IDs can be abbreviated if they uniquely identify a query within the tracked session.

:::note
The `spice query` command requires the runtime to be running in [cluster mode](/docs/features/distributed-query) with `--role scheduler` and `scheduler.state_location` configured.
:::
