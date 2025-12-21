# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an unofficial SimpleLogin CLI (`sl`) built with the Oclif framework. It's a command-line tool for managing SimpleLogin aliases, mailboxes, and account settings, designed for scripting and automation.

**Key Technologies:**

- TypeScript (ES2022, Node16 modules)
- Oclif v4 framework for CLI structure
- simplelogin-client SDK for API interactions
- Mocha + Chai for testing
- ESLint for linting
- Package manager: pnpm

## Build and Development Commands

```bash
# Install dependencies
pnpm install

# Build the project (cleans dist/ and compiles TypeScript)
pnpm run build

# Run tests (includes linting post-test)
pnpm run test

# Run linting only
pnpm run lint

# Run a single test file
pnpm run test -- test/commands/hello/index.test.ts

# Package for distribution
pnpm run prepack  # Generates oclif.manifest.json and updates README
pnpm run pack:tarballs  # Creates distribution tarballs

# Test CLI locally
./bin/run.js <command>
# or after npm link:
sl <command>
```

Important: Run pnpm prepack when creating new Oclif commands so that metadata is updated and the command can be executed

## Project Structure

```
src/
  commands/          # Oclif command files (one file per command/subcommand)
    hello/
      index.ts       # Example: 'sl hello' command
      world.ts       # Example: 'sl hello world' subcommand
  index.ts           # Entry point (re-exports @oclif/core)

test/
  commands/          # Mirrors src/commands structure
    hello/
      index.test.ts  # Tests for hello command

bin/
  run.js             # CLI entry point
```

## Architecture

### Oclif Command Pattern

This project uses Oclif's class-based command structure. Each command is a TypeScript class that:

1. **Extends `Command`** from `@oclif/core`
2. **Defines static properties** for configuration:
   - `description`: Command description
   - `examples`: Usage examples
   - `flags`: Command-line flags using `Flags.*`
   - `args`: Positional arguments using `Args.*`
3. **Implements `run()` method**: Main command logic

Example structure:

```typescript
import {Command, Flags, Args} from '@oclif/core'

export default class MyCommand extends Command {
  static description = 'Command description'

  static flags = {
    myFlag: Flags.string({description: 'Flag description'}),
  }

  static args = {
    myArg: Args.string({description: 'Argument description', required: true}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(MyCommand)
    // Command logic here
  }
}
```

### Command Organization

- Commands are organized in `src/commands/` with directory structure defining the command hierarchy
- `src/commands/hello/index.ts` → `sl hello`
- `src/commands/hello/world.ts` → `sl hello world`
- Oclif automatically discovers commands based on file structure

### Testing Pattern

Tests use `@oclif/test` and Chai for assertions:

```typescript
import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('command-name', () => {
  it('runs command', async () => {
    const {stdout} = await runCommand('command-name args --flags')
    expect(stdout).to.contain('expected output')
  })
})
```

## CLI Design Reference

The `CLI_DESIGN.md` file contains the complete specification for all commands to be implemented. Key architectural decisions from the design:

### Global Architecture

- **Resource-Action Pattern**: Commands follow `sl <resource> <action>` structure (e.g., `sl alias list`, `sl mailbox create`)
- **Docker-style aliases**: Support short aliases like `ls` for `list`, `rm` for `delete`
- **Global Flags**: All commands support `--format` (plain/json/yaml) and `--config` (path to config file)

### Configuration Management

- **Default config location**: `~/.config/simplelogin-cli/config.yaml`
- **Config format**: YAML with `url` and `apiKey` fields
- **Security**: Config file must have 600 permissions, directory 700 permissions
- **API Key storage**: Plaintext in config, secured by file permissions

### SDK Integration

All commands interact with the SimpleLogin API via the `simplelogin-client` package:

- `AccountApi` - User account operations
- `AliasApi` - Alias management
- `MailboxApi` - Mailbox operations
- `CustomDomainApi` - Domain management

### Output Formatting

Commands must support three output formats via `--format` flag:

- **plain** (default): Human-readable tables and key-value pairs
- **json**: Structured JSON for scripting
- **yaml**: YAML format for readability and scripting

### Error Handling & Exit Codes

Standard exit codes:

- 0: Success
- 1: General error
- 2: Invalid arguments
- 3: Authentication required
- 4: API error
- 5: Network error

## Implementation Guidelines

### When Adding New Commands

1. Create file in `src/commands/` following the directory structure for your command path
2. Extend `Command` class from `@oclif/core`
3. Define `static description`, `static flags`, `static args`, and `static examples`
4. Implement `async run()` method
5. Use `await this.parse(ClassName)` to get parsed args and flags
6. Refer to `CLI_DESIGN.md` for the command's specification
7. Create corresponding test file in `test/commands/` with same structure
8. After implementation, run `pnpm run prepack` to update README with command documentation

### Oclif-Specific Patterns

- Use `this.log()` for output (not `console.log`)
- Use `this.error()` for errors (automatically sets exit code)
- Use `this.warn()` for warnings
- Flags are defined with `Flags.string()`, `Flags.boolean()`, etc.
- Args are defined with `Args.string()`, `Args.integer()`, etc.
- For required flags/args, use `{required: true}`
- For flag aliases, use `{char: 'f'}` for short form

### Testing Conventions

- Test files mirror command structure in `test/commands/`
- Use `runCommand()` from `@oclif/test` to execute commands
- Tests run with Mocha (`pnpm run test`)
- Linting runs automatically after tests via `posttest` script

### TypeScript Configuration

- **Module system**: ES modules (Node16 module resolution)
- **Target**: ES2022
- **Strict mode**: Enabled
- **Output**: `dist/` directory
- Use `.js` extensions in imports when referencing other project files (Node16 modules requirement)
