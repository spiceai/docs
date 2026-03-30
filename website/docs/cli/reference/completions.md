---
title: "Completions"
sidebar_label: "completions"
pagination_prev: null
pagination_next: null
---

Generate shell completion scripts for the Spice CLI.

When the shell argument is omitted, it is auto-detected from the `SHELL` environment variable.

### Usage

```shell
spice completions [shell]
```

Available shells:

- bash
- elvish
- fish
- powershell
- zsh

### Examples

```shell
# Generate completions for the current shell
spice completions

# Generate Bash completions
spice completions bash

# Install completions for Zsh (example)
spice completions zsh > ~/.zfunc/_spice
```

#### Flags

- `-h`, `--help`   Print this help message
