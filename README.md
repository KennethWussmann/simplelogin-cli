<div align="center">
  <h1><code>simplelogin-cli</code></h1>
  <p>
    <strong>Lightweight CLI tool to interact with the <a href="https://simplelogin.io">SimpleLogin.io</a> API <br/>for Windows, macOS and Linux.</strong>
  </p>
</div>

SimpleLogin is an e-mail aliasing service by Proton. This is a third-party CLI tool using [simplelogin-client](https://github.com/KennethWussmann/simplelogin-client) under the hood.

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
* [`sl alias create`](#sl-alias-create)
* [`sl alias create-custom PREFIX SUFFIX`](#sl-alias-create-custom-prefix-suffix)
* [`sl alias custom PREFIX SUFFIX`](#sl-alias-custom-prefix-suffix)
* [`sl alias delete ALIAS-ID`](#sl-alias-delete-alias-id)
* [`sl alias list`](#sl-alias-list)
* [`sl alias ls`](#sl-alias-ls)
* [`sl alias rm ALIAS-ID`](#sl-alias-rm-alias-id)
* [`sl alias search QUERY`](#sl-alias-search-query)
* [`sl config`](#sl-config)
* [`sl help [COMMAND]`](#sl-help-command)
* [`sl login`](#sl-login)
* [`sl logout`](#sl-logout)
* [`sl whoami`](#sl-whoami)

## `sl alias create`

Create a new random alias

```
USAGE
  $ sl alias create [--config <value>] [--format plain|json|yaml] [--note <value>] [--hostname <value>] [--mode
    uuid|word]

FLAGS
  --config=<value>    [env: SIMPLELOGIN_CONFIG] Path to config file containing credentials
  --format=<option>   [default: plain] Output format
                      <options: plain|json|yaml>
  --hostname=<value>  Associated hostname
  --mode=<option>     Generation mode (uuid or word-based)
                      <options: uuid|word>
  --note=<value>      Note/description for the alias

DESCRIPTION
  Create a new random alias

EXAMPLES
  $ sl alias create

  $ sl alias create --note "My test alias"

  $ sl alias create --hostname example.com

  $ sl alias create --mode uuid

  $ sl alias create --mode word --note "Shopping" --format json
```

_See code: [src/commands/alias/create.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.1.0/src/commands/alias/create.ts)_

## `sl alias create-custom PREFIX SUFFIX`

Create a custom alias with specific prefix and suffix

```
USAGE
  $ sl alias create-custom PREFIX SUFFIX --mailbox-ids <value> [--config <value>] [--format plain|json|yaml] [--note
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
  $ sl alias create-custom myprefix signed_suffix --mailbox-ids 1,2

  $ sl alias create-custom john suffix123 --mailbox-ids 1 --note "Work email"

  $ sl alias create-custom support suffix456 --mailbox-ids 1 --name "Support" --hostname example.com

  $ sl alias create-custom custom suffix789 --mailbox-ids 1,2,3 --format json
```

_See code: [src/commands/alias/create-custom.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.1.0/src/commands/alias/create-custom.ts)_

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

## `sl alias delete ALIAS-ID`

Delete an alias by ID

```
USAGE
  $ sl alias delete ALIAS-ID [--config <value>] [--format plain|json|yaml] [--confirm]

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
  $ sl alias delete 123

  $ sl alias delete 123 --confirm

  $ sl alias delete 123 --format json

  $ sl alias rm 123 --confirm
```

_See code: [src/commands/alias/delete.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.1.0/src/commands/alias/delete.ts)_

## `sl alias list`

List all aliases with pagination

```
USAGE
  $ sl alias list [--config <value>] [--format plain|json|yaml] [--page <value>] [--pinned | --disabled |
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
  $ sl alias list

  $ sl alias list --page 1

  $ sl alias list --pinned

  $ sl alias list --disabled

  $ sl alias list --enabled

  $ sl alias list --all

  $ sl alias list --format json
```

_See code: [src/commands/alias/list.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.1.0/src/commands/alias/list.ts)_

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

## `sl alias search QUERY`

Search aliases by email address

```
USAGE
  $ sl alias search QUERY [--config <value>] [--format plain|json|yaml] [--page <value>] [--pinned | --disabled |
    --enabled] [--all]

ARGUMENTS
  QUERY  Search query for alias email

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
  Search aliases by email address

EXAMPLES
  $ sl alias search myalias

  $ sl alias search "john@" --page 1

  $ sl alias search example --pinned

  $ sl alias search test --all

  $ sl alias search search --format json
```

_See code: [src/commands/alias/search.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.1.0/src/commands/alias/search.ts)_

## `sl config`

Display current configuration

```
USAGE
  $ sl config [--config <value>] [--format plain|json|yaml] [--show-key]

FLAGS
  --config=<value>   [env: SIMPLELOGIN_CONFIG] Path to config file containing credentials
  --format=<option>  [default: plain] Output format
                     <options: plain|json|yaml>
  --show-key         Show full API key (default: redacted)

DESCRIPTION
  Display current configuration

EXAMPLES
  $ sl config

  $ sl config --show-key

  $ sl config --format json
```

_See code: [src/commands/config.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.1.0/src/commands/config.ts)_

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

## `sl login`

Authenticate with SimpleLogin and store credentials

```
USAGE
  $ sl login [--config <value>] [--format plain|json|yaml] [--device <value>] [--key <value>] [--url
    <value>]

FLAGS
  --config=<value>   [env: SIMPLELOGIN_CONFIG] Path to config file containing credentials
  --device=<value>   [default: simplelogin-cli] Device name for the API key
  --format=<option>  [default: plain] Output format
                     <options: plain|json|yaml>
  --key=<value>      API key (prefer interactive prompt for security)
  --url=<value>      SimpleLogin instance URL (e.g., https://app.simplelogin.io)

DESCRIPTION
  Authenticate with SimpleLogin and store credentials

EXAMPLES
  $ sl login

  $ sl login --url https://app.simplelogin.io

  $ sl login --key api-key
```

_See code: [src/commands/login.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.1.0/src/commands/login.ts)_

## `sl logout`

Remove API credentials from config

```
USAGE
  $ sl logout [--config <value>] [--format plain|json|yaml]

FLAGS
  --config=<value>   [env: SIMPLELOGIN_CONFIG] Path to config file containing credentials
  --format=<option>  [default: plain] Output format
                     <options: plain|json|yaml>

DESCRIPTION
  Remove API credentials from config

EXAMPLES
  $ sl logout

  $ sl logout --format json
```

_See code: [src/commands/logout.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.1.0/src/commands/logout.ts)_

## `sl whoami`

Check the authenticated user

```
USAGE
  $ sl whoami [--config <value>] [--format plain|json|yaml]

FLAGS
  --config=<value>   [env: SIMPLELOGIN_CONFIG] Path to config file containing credentials
  --format=<option>  [default: plain] Output format
                     <options: plain|json|yaml>

DESCRIPTION
  Check the authenticated user

EXAMPLES
  $ sl whoami

  $ sl whoami --format json
```

_See code: [src/commands/whoami.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.1.0/src/commands/whoami.ts)_
<!-- commandsstop -->
