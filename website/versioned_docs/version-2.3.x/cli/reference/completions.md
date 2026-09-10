---
title: "completions"
sidebar_label: "completions"
pagination_prev: null
pagination_next: null
---

Generate shell completions for the Spice CLI.

By default, `spice completions` auto-detects the user's shell and writes the completion script to the standard completion directory for that shell. If the shell cannot be detected, specify it as an argument.

### Usage

```shell
spice completions [shell] [flags]
```

`shell` - the shell to generate completions for. Supported values: `bash`, `zsh`, `fish`, `elvish`, `powershell`. If omitted, the shell is detected from the `$SHELL` environment variable.

#### Flags

- `--stdout`  Print completions to stdout instead of writing to a file (useful for piping)
- `-h`, `--help`   Print this help message

### Default completion directories

When writing to a file, `spice completions` uses the following directories by default:

| Shell      | Directory                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------- |
| bash       | `~/.local/share/bash-completion/completions/spice` (Homebrew on macOS if available)               |
| zsh        | `~/.local/share/zsh/site-functions/_spice` (Homebrew on macOS if available)                       |
| fish       | `~/.config/fish/completions/spice.fish`                                                           |
| elvish     | `~/.config/elvish/lib/spice.elv`                                                                  |
| powershell | `~/.config/powershell/completions/spice.ps1`                                                      |

Parent directories are created automatically if they do not exist.

### Examples

#### Auto-detect shell and install completions

```shell
spice completions
```

#### Generate completions for a specific shell

```shell
spice completions zsh
```

#### Print completions to stdout

```shell
spice completions bash --stdout
```

#### Pipe completions to a custom file

```shell
spice completions zsh --stdout > ~/.zfunc/_spice
```
