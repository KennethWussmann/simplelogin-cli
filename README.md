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
* [Configuration](#configuration)
* [Fetch available signed suffix for the domain](#fetch-available-signed-suffix-for-the-domain)
* [Create the alias](#create-the-alias)
* [Export all enabled aliases to a CSV file](#export-all-enabled-aliases-to-a-csv-file)
* [Create account with unique alias in 1Password](#create-account-with-unique-alias-in-1password)
* [Generate a new alias](#generate-a-new-alias)
* [Create password manager entry with the alias](#create-password-manager-entry-with-the-alias)
* [Commands](#commands)
<!-- tocstop -->

# Installation

Installing the CLI is done via the [Node Package Manager](https://nodejs.org/en).

```sh
## Install with NPM
$ npm install -g @ketrwu/simplelogin-cli

## or install with PNPM
$ pnpm add -g @ketrwu/simplelogin-cli
...
```

# Usage

> Requires a SimpleLogin API key

The CLI provides a streamlined interface for managing your SimpleLogin aliases directly from the terminal. All commands support multiple output formats and are designed for both interactive use and automation.

```sh
## 1. Authenticate with your SimpleLogin account
$ sl login
? Enter SimpleLogin URL (default: https://app.simplelogin.io):
? Enter your API key: ************************************

## 2. Create aliases on-demand
$ sl alias create --note "Newsletter subscriptions"
Alias created successfully
ID:      245
Email:   silently.ancient846@simplelogin.co
Enabled: true
Mailboxes: sarah.chen@protonmail.com

## 3. Search and filter your aliases
$ sl alias search "github" --enabled
ID      Email                                   Enabled   Pinned    Mailboxes
----------------------------------------------------------------------------------------------------
10      github@example.com                      Yes       No        kenneth@wussmann.net

Total: 1 alias

## 4. Create custom aliases with specific prefixes. Note that you have to use a suffix (.w9k2@example.com) from the "sl alias options"
$ sl alias custom netflix .w9k2@example.com --note "Streaming services"
Alias created successfully
ID:      246
Email:   netflix.w9k2@example.com
Enabled: true
Mailboxes: sarah.chen@protonmail.com

## 5. View configuration and verify authentication
$ sl whoami
Email:   sarah.chen@protonmail.com
Name:    Sarah Chen
Premium: true

## 6. Access comprehensive help for any command
$ sl alias create --help
```

## Automation & Scripting

The true power of `simplelogin-cli` lies in its automation capabilities. Every command supports structured output formats (`json`, `yaml`, `plain`), making it seamless to integrate SimpleLogin into your workflows, scripts, and toolchains.

### Why This Matters

- **Password Manager Integration**: Automatically generate unique aliases during account registration workflows
- **Batch Operations**: Process, filter, or modify hundreds of aliases programmatically
- **CI/CD Pipelines**: Provision aliases for testing environments or service accounts
- **Monitoring & Analytics**: Extract alias metrics and usage patterns
- **Cross-Tool Integration**: Pipe data between `sl` and other CLI tools like `jq`, `fzf`, or custom scripts

### Output Format Control

Every command accepts the `--format` flag to control output structure:

```sh
## Human-readable output (default)
$ sl alias ls --page 0
ID      Email                                   Enabled   Pinned    Mailboxes
----------------------------------------------------------------------------------------------------
100     youtube@example.com                     Yes       No        private@example.com
101     netflix@example.com                     Yes       No        private@example.com
102     work@example.com                        Yes       No        private@example.com

Total: 3 aliases

## JSON for programmatic processing
$ sl alias ls --page 0 --format json
[
  {
    "id": 100,
    "email": "youtube@example.com",
    // ...
  },
  {
    "id": 101,
    "email": "netflix@example.com",
    // ...
  },
  {
    "id": 102,
    "email": "work@example.com",
    // ...
  }
]

## YAML for configuration or human-readable structured data
$ sl alias ls --page 0 --format yaml
```

### Practical Automation Examples

#### Extract All Alias Emails

Transform alias data with `jq` for downstream processing:

```sh
$ sl alias ls --all --format json | jq -r 'map(.email) | .[]'
github-notifications.w9k2@example.com
github-sponsors.w9k2@example.com
silently.ancient846@simplelogin.co
netflix.w9k2@example.com
amazon-shopping.w9k2@example.com
linkedin-jobs.w9k2@example.com
```

#### Automated Alias Generation Script

Create service-specific aliases programmatically. This example demonstrates fetching available options and creating a custom alias in a single workflow:

**`generate-alias.sh`**
```sh
#!/bin/bash
set -euo pipefail

# Configuration
SERVICE_NAME="${1:?Usage: $0 <service-name>}"
DOMAIN="example.com"
NOTE="${2:-Auto-generated for $SERVICE_NAME}"

# Fetch available signed suffix for the domain
echo "Fetching alias options for domain: $DOMAIN"
SUFFIX=$(sl alias options --domain "$DOMAIN" --prefix --format json | jq -r '.suffixes[0].signedSuffix')

if [ -z "$SUFFIX" ]; then
  echo "Error: No valid suffix found for domain $DOMAIN" >&2
  exit 1
fi

# Create the alias
echo "Creating alias: ${SERVICE_NAME}${SUFFIX}"
sl alias custom "$SERVICE_NAME" "$SUFFIX" --note "$NOTE" --format json

echo "✓ Alias created successfully!"
```

**Usage:**
```sh
$ ./generate-alias.sh spotify "Music streaming service"
✓ Alias created successfully!
```

#### Filter and Export Specific Aliases

Extract aliases matching specific criteria for reporting or backup:

```sh
#!/bin/bash
# Export all enabled aliases to a CSV file

echo "id,email,note" > aliases_backup.csv
sl alias ls --all --enabled --format json | \
  jq -r '.[] | [.id, .email, .note] | @csv' >> aliases_backup.csv

echo "✓ Backup complete: aliases_backup.csv"
```

**Output:**
```csv
id,email,note
198,"github-notifications.w9k2@example.com","Development notifications"
203,"github-sponsors.w9k2@example.com","Sponsorship updates"
245,"silently.ancient846@simplelogin.co","Newsletter subscriptions"
246,"netflix.w9k2@example.com","Streaming services"
247,"spotify.w9k2@example.com","Music streaming service"
```

#### Password Manager Integration

Integrate with password managers to automatically generate unique aliases during account creation:

```sh
#!/bin/bash
# Create account with unique alias in 1Password
SERVICE="Spotify Premium"
NOTE="Music streaming service"

# Generate a new alias
ALIAS_EMAIL=$(sl alias create --mode word --note "$NOTE" --format json | jq -r '.email')

# Create password manager entry with the alias
op item create --category=login \
  --title="$SERVICE" \
  --username="$ALIAS_EMAIL" \
  --password="$(op generate --length=32)"

echo "✓ Created $SERVICE account with alias: $ALIAS_EMAIL"
```

### Integration Benefits

The CLI's structured output enables integration with:

- **Password Managers**: 1Password, Bitwarden, pass, KeePassXC
- **Terminal Tools**: fzf (fuzzy finder), rofi (application launcher)
- **Automation Frameworks**: Ansible, Terraform, custom deployment scripts
- **Monitoring Systems**: Export metrics, track alias usage
- **Development Workflows**: Pre-commit hooks, test environment setup

# Commands
<!-- commands -->
* [`sl alias create`](#sl-alias-create)
* [`sl alias create-custom PREFIX SUFFIX`](#sl-alias-create-custom-prefix-suffix)
* [`sl alias custom PREFIX SUFFIX`](#sl-alias-custom-prefix-suffix)
* [`sl alias delete ALIAS-ID`](#sl-alias-delete-alias-id)
* [`sl alias list`](#sl-alias-list)
* [`sl alias ls`](#sl-alias-ls)
* [`sl alias options`](#sl-alias-options)
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

_See code: [src/commands/alias/create.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.1.1/src/commands/alias/create.ts)_

## `sl alias create-custom PREFIX SUFFIX`

Create a custom alias with specific prefix and suffix

```
USAGE
  $ sl alias create-custom PREFIX SUFFIX [--config <value>] [--format plain|json|yaml] [--note <value>] [--hostname
    <value>] [--mailbox-ids <value>] [--name <value>]

ARGUMENTS
  PREFIX  Alias prefix (local part)
  SUFFIX  Signed suffix from alias options

FLAGS
  --config=<value>       [env: SIMPLELOGIN_CONFIG] Path to config file containing credentials
  --format=<option>      [default: plain] Output format
                         <options: plain|json|yaml>
  --hostname=<value>     Associated hostname
  --mailbox-ids=<value>  Comma-separated mailbox IDs. Default if not specified.
  --name=<value>         Display name
  --note=<value>         Note/description for the alias

DESCRIPTION
  Create a custom alias with specific prefix and suffix

ALIASES
  $ sl alias custom

EXAMPLES
  $ sl alias create-custom myprefix signed_suffix --mailbox-ids 1,2

  $ sl alias create-custom john suffix123 --note "Work email to my default mailbox"

  $ sl alias create-custom support suffix456 --mailbox-ids 1 --name "Support" --hostname example.com

  $ sl alias create-custom custom suffix789 --mailbox-ids 1,2,3 --format json
```

_See code: [src/commands/alias/create-custom.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.1.1/src/commands/alias/create-custom.ts)_

## `sl alias custom PREFIX SUFFIX`

Create a custom alias with specific prefix and suffix

```
USAGE
  $ sl alias custom PREFIX SUFFIX [--config <value>] [--format plain|json|yaml] [--note <value>] [--hostname
    <value>] [--mailbox-ids <value>] [--name <value>]

ARGUMENTS
  PREFIX  Alias prefix (local part)
  SUFFIX  Signed suffix from alias options

FLAGS
  --config=<value>       [env: SIMPLELOGIN_CONFIG] Path to config file containing credentials
  --format=<option>      [default: plain] Output format
                         <options: plain|json|yaml>
  --hostname=<value>     Associated hostname
  --mailbox-ids=<value>  Comma-separated mailbox IDs. Default if not specified.
  --name=<value>         Display name
  --note=<value>         Note/description for the alias

DESCRIPTION
  Create a custom alias with specific prefix and suffix

ALIASES
  $ sl alias custom

EXAMPLES
  $ sl alias custom myprefix signed_suffix --mailbox-ids 1,2

  $ sl alias custom john suffix123 --note "Work email to my default mailbox"

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

_See code: [src/commands/alias/delete.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.1.1/src/commands/alias/delete.ts)_

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

_See code: [src/commands/alias/list.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.1.1/src/commands/alias/list.ts)_

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

## `sl alias options`

Get available options for creating aliases

```
USAGE
  $ sl alias options [--config <value>] [--format plain|json|yaml] [--hostname <value>] [--domain <value>]
    [--custom] [--premium] [--prefix]

FLAGS
  --config=<value>    [env: SIMPLELOGIN_CONFIG] Path to config file containing credentials
  --custom            Filter options for custom ones
  --domain=<value>    Filter options for specific mail domain
  --format=<option>   [default: plain] Output format
                      <options: plain|json|yaml>
  --hostname=<value>  Get options for specific hostname
  --prefix            Filter options for those that have a prefix in front of their suffix before the @
  --premium           Filter options for premium ones

DESCRIPTION
  Get available options for creating aliases

EXAMPLES
  $ sl alias options

  $ sl alias options --hostname example.com

  $ sl alias options --domain mydomain.com

  $ sl alias options --custom

  $ sl alias options --premium

  $ sl alias options --prefix

  $ sl alias options --custom --domain mydomain.com

  $ sl alias options --format json
```

_See code: [src/commands/alias/options.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.1.1/src/commands/alias/options.ts)_

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

_See code: [src/commands/alias/search.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.1.1/src/commands/alias/search.ts)_

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

_See code: [src/commands/config.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.1.1/src/commands/config.ts)_

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

_See code: [src/commands/login.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.1.1/src/commands/login.ts)_

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

_See code: [src/commands/logout.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.1.1/src/commands/logout.ts)_

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

_See code: [src/commands/whoami.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.1.1/src/commands/whoami.ts)_
<!-- commandsstop -->
