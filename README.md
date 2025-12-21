<div align="center">
  <h1><code>simplelogin-cli</code></h1>
  <p>
    <strong>Lightweight CLI tool to interact with the <a href="https://simplelogin.io">SimpleLogin.io</a> API <br/>for Windows, macOS and Linux.</strong>
  </p>
</div>

SimpleLogin is an e-mail aliasing service by Proton. This CLI tool allows to manage aliases via the terminal or in scripts.

<!-- toc -->
* [Installation](#installation)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Installation

Installing the CLI is done via the [Node Package Manager](https://nodejs.org/en).

```sh-session
## Install with NPM
$ npm install -g @ketrwu/simplelogin-cli

## or install with PNPM
$ pnpm add -g @ketrwu/simplelogin-cli
...
```

# Usage

> Requires a SimpleLogin API key

```sh-session
## 1. Login to your SimpleLogin account via API key
$ sl login

## 2. Create a new random alias
$ sl alias create
Alias created successfully
ID:      100
Email:   thirty_cheese123@example.com
Enabled: true
Mailboxes: user@example.com

## 3. Use the help documentation for more details 
$ sl --help [COMMAND]
USAGE
  $ sl COMMAND
...
```

The CLI is fully scriptable. You can control the output format with the `--format <plain|json|yaml>` flag. This is helpful to work with the data in other tools, for example:

```sh-session
## Get all email aliases and transform them with jq
$ sl alias ls --format json | jq "map(.email)"  
```

# Commands
<!-- commands -->
* [`sl alias custom PREFIX SUFFIX`](#sl-alias-custom-prefix-suffix)
* [`sl alias ls`](#sl-alias-ls)
* [`sl alias rm ALIAS-ID`](#sl-alias-rm-alias-id)
* [`sl help [COMMAND]`](#sl-help-command)

## `sl alias custom PREFIX SUFFIX`

Create a custom alias with specific prefix and suffix

```
USAGE
  $ sl alias custom PREFIX SUFFIX --mailbox-ids <value> [--config <value>] [--format plain|json|yaml] [--note
    <value>] [--hostname <value>] [--name <value>]

ARGUMENTS
  PREFIX  Alias prefix (local part)
  SUFFIX  Signed suffix from alias options

FLAGS
  --config=<value>       [env: SIMPLELOGIN_CONFIG] Path to config file containing credentials
  --format=<option>      [default: plain] Output format
                         <options: plain|json|yaml>
  --hostname=<value>     Associated hostname
  --mailbox-ids=<value>  (required) Comma-separated mailbox IDs
  --name=<value>         Display name
  --note=<value>         Note/description for the alias

DESCRIPTION
  Create a custom alias with specific prefix and suffix

ALIASES
  $ sl alias custom

EXAMPLES
  $ sl alias custom myprefix signed_suffix --mailbox-ids 1,2

  $ sl alias custom john suffix123 --mailbox-ids 1 --note "Work email"

  $ sl alias custom support suffix456 --mailbox-ids 1 --name "Support" --hostname example.com

  $ sl alias custom custom suffix789 --mailbox-ids 1,2,3 --format json
```

## `sl alias ls`

List all aliases with pagination

```
USAGE
  $ sl alias ls [--config <value>] [--format plain|json|yaml] [--page <value>] [--pinned | --disabled |
    --enabled] [--all]

FLAGS
  --all              Fetch all pages automatically
  --config=<value>   [env: SIMPLELOGIN_CONFIG] Path to config file containing credentials
  --disabled         Show only disabled aliases
  --enabled          Show only enabled aliases
  --format=<option>  [default: plain] Output format
                     <options: plain|json|yaml>
  --page=<value>     Page number (20 aliases per page)
  --pinned           Show only pinned aliases

DESCRIPTION
  List all aliases with pagination

ALIASES
  $ sl alias ls

EXAMPLES
  $ sl alias ls

  $ sl alias ls --page 1

  $ sl alias ls --pinned

  $ sl alias ls --disabled

  $ sl alias ls --enabled

  $ sl alias ls --all

  $ sl alias ls --format json
```

## `sl alias rm ALIAS-ID`

Delete an alias by ID

```
USAGE
  $ sl alias rm ALIAS-ID [--config <value>] [--format plain|json|yaml] [--confirm]

ARGUMENTS
  ALIAS-ID  Alias ID to delete

FLAGS
  --config=<value>   [env: SIMPLELOGIN_CONFIG] Path to config file containing credentials
  --confirm          Skip confirmation prompt
  --format=<option>  [default: plain] Output format
                     <options: plain|json|yaml>

DESCRIPTION
  Delete an alias by ID

ALIASES
  $ sl alias rm

EXAMPLES
  $ sl alias rm 123

  $ sl alias rm 123 --confirm

  $ sl alias rm 123 --format json

  $ sl alias rm 123 --confirm
```

## `sl help [COMMAND]`

Display help for sl.

```
USAGE
  $ sl help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for sl.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.36/src/commands/help.ts)_
<!-- commandsstop -->
