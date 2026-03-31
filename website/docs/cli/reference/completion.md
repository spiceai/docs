---
title: "Completions"
sidebar_label: "completions"
pagination_prev: null
pagination_next: null
---

Generate shell completion scripts for the Spice CLI.

### Usage

```shell
spice completions [shell]
```

The `shell` argument specifies which shell to generate completions for. If omitted, the shell is auto-detected from the `$SHELL` environment variable.

Available shells:

- `bash`
- `zsh`
- `fish`
- `elvish`
- `powershell`

The completion script is written to stdout, allowing it to be piped or redirected to a file.

### Examples

```shell
# Generate bash completions
spice completions bash > /etc/bash_completion.d/spice

# Generate zsh completions
spice completions zsh > ~/.zfunc/_spice

# Generate fish completions
spice completions fish > ~/.config/fish/completions/spice.fish

# Auto-detect shell
spice completions
```

#### Flags

- `-h`, `--help`   Print this help message
  