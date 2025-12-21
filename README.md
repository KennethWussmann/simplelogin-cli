@ketrwu/simplelogin-cli
=================

Unofficial SimpleLogin CLI


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@ketrwu/simplelogin-cli.svg)](https://npmjs.org/package/@ketrwu/simplelogin-cli)
[![Downloads/week](https://img.shields.io/npm/dw/@ketrwu/simplelogin-cli.svg)](https://npmjs.org/package/@ketrwu/simplelogin-cli)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @ketrwu/simplelogin-cli
$ sl COMMAND
running command...
$ sl (--version)
@ketrwu/simplelogin-cli/0.0.6 linux-x64 node-v24.11.1
$ sl --help [COMMAND]
USAGE
  $ sl COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`sl alias custom PREFIX SUFFIX`](#sl-alias-custom-prefix-suffix)
* [`sl alias ls`](#sl-alias-ls)
* [`sl hello PERSON`](#sl-hello-person)
* [`sl hello world`](#sl-hello-world)
* [`sl help [COMMAND]`](#sl-help-command)
* [`sl plugins`](#sl-plugins)
* [`sl plugins add PLUGIN`](#sl-plugins-add-plugin)
* [`sl plugins:inspect PLUGIN...`](#sl-pluginsinspect-plugin)
* [`sl plugins install PLUGIN`](#sl-plugins-install-plugin)
* [`sl plugins link PATH`](#sl-plugins-link-path)
* [`sl plugins remove [PLUGIN]`](#sl-plugins-remove-plugin)
* [`sl plugins reset`](#sl-plugins-reset)
* [`sl plugins uninstall [PLUGIN]`](#sl-plugins-uninstall-plugin)
* [`sl plugins unlink [PLUGIN]`](#sl-plugins-unlink-plugin)
* [`sl plugins update`](#sl-plugins-update)

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

## `sl hello PERSON`

Say hello

```
USAGE
  $ sl hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ sl hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.0.6/src/commands/hello/index.ts)_

## `sl hello world`

Say hello world

```
USAGE
  $ sl hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ sl hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/KennethWussmann/simplelogin-cli/blob/v0.0.6/src/commands/hello/world.ts)_

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

## `sl plugins`

List installed plugins.

```
USAGE
  $ sl plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ sl plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/index.ts)_

## `sl plugins add PLUGIN`

Installs a plugin into sl.

```
USAGE
  $ sl plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into sl.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the SL_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the SL_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ sl plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ sl plugins add myplugin

  Install a plugin from a github url.

    $ sl plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ sl plugins add someuser/someplugin
```

## `sl plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ sl plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ sl plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/inspect.ts)_

## `sl plugins install PLUGIN`

Installs a plugin into sl.

```
USAGE
  $ sl plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into sl.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the SL_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the SL_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ sl plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ sl plugins install myplugin

  Install a plugin from a github url.

    $ sl plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ sl plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/install.ts)_

## `sl plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ sl plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ sl plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/link.ts)_

## `sl plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ sl plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ sl plugins unlink
  $ sl plugins remove

EXAMPLES
  $ sl plugins remove myplugin
```

## `sl plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ sl plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/reset.ts)_

## `sl plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ sl plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ sl plugins unlink
  $ sl plugins remove

EXAMPLES
  $ sl plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/uninstall.ts)_

## `sl plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ sl plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ sl plugins unlink
  $ sl plugins remove

EXAMPLES
  $ sl plugins unlink myplugin
```

## `sl plugins update`

Update installed plugins.

```
USAGE
  $ sl plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/update.ts)_
<!-- commandsstop -->
