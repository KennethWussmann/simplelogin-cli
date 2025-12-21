# How to Create a New Command

This guide walks you through creating new commands for the SimpleLogin CLI from scratch. It covers patterns, best practices, and the complete end-to-end process.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Understanding the Architecture](#understanding-the-architecture)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Pattern: Shared Base Classes](#pattern-shared-base-classes)
5. [SDK Integration](#sdk-integration)
6. [Testing and Validation](#testing-and-validation)
7. [Common Pitfalls](#common-pitfalls)

---

## Prerequisites

Before creating a new command, ensure you have:

1. **Read the CLI Design**: Review `CLI_DESIGN.md` for the command specification
2. **Understood Oclif**: Familiarize yourself with [Oclif v4 documentation](https://oclif.io/)
3. **Reviewed Existing Commands**: Look at similar commands in `src/commands/` for patterns
4. **SDK Knowledge**: Check the `simplelogin-client` SDK types in `node_modules/simplelogin-client/tscBuild/sdk/`

---

## Understanding the Architecture

### Directory Structure

```
src/
  commands/
    base.ts                    # Global base class with common flags
    alias/
      alias-list-base.ts       # Shared base for list/search commands
      alias-create-base.ts     # Shared base for create commands
      list.ts                  # Concrete command implementation
      create.ts                # Concrete command implementation
  utils/
    config.ts                  # Config file management
    simplelogin-client.ts      # SDK client initialization & auth helpers
```

### Command Hierarchy

```
BaseCommand (optional)
  └── SpecificBaseCommand (e.g., AliasCreateBase)
      └── ConcreteCommand (e.g., AliasCreate)
```

### Key Files

| File | Purpose |
|------|---------|
| `src/commands/base.ts` | Global base class with `--format` and `--config` flags |
| `src/utils/simplelogin-client.ts` | SDK client initialization, `requireAuth()`, `getSimpleLoginConfig()` |
| `src/utils/config.ts` | Config file reading and path resolution |
| `CLI_DESIGN.md` | Complete specification for all commands |

---

## Step-by-Step Implementation

### Step 1: Analyze Requirements from CLI_DESIGN.md

Read the specification for your command. Extract:

- **Command path**: e.g., `sl alias create`
- **Parameters**: Flags (options) and Args (positional)
- **SDK method**: e.g., `AliasApi.createRandomAlias()`
- **Authorization**: Whether auth is required
- **Output format**: Plain/JSON/YAML requirements
- **Exit codes**: Which error codes to use

**Example from CLI_DESIGN.md:**

```markdown
## `sl alias create`

Create a new random alias.

**SDK Reference:** `AliasApi.createRandomAlias()`

### Parameters
| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `--note` | string | - | No | Note/description for the alias |
| `--mode` | `uuid\|word` | - | No | Generation mode |

**Authorization:** Required
```

### Step 2: Research the SDK API

Before coding, understand the SDK method signature and request structure.

#### Finding SDK Types

```bash
# Search for the API method
grep -r "createRandomAlias" node_modules/simplelogin-client --include="*.d.ts" -A 5

# Find request parameter types
grep -r "CreateRandomAliasRequest" node_modules/simplelogin-client --include="*.d.ts" -A 10

# Find request body types
grep -r "AliasRandomNewPost" node_modules/simplelogin-client --include="*.d.ts" -A 20
```

#### Example SDK Structure Discovery

```typescript
// From node_modules/simplelogin-client/tscBuild/sdk/apis/AliasApi.d.ts
export interface CreateRandomAliasRequest {
    aliasRandomNewPost: AliasRandomNewPost;
    hostname?: string;
    mode?: CreateRandomAliasModeEnum;
}

// From node_modules/simplelogin-client/tscBuild/sdk/models/AliasRandomNewPost.d.ts
export interface AliasRandomNewPost {
    note?: string;
}
```

**Key Insight**: The SDK often has nested structures (e.g., `aliasRandomNewPost` wraps the body). Top-level parameters like `hostname` and `mode` are NOT inside the post body.

### Step 3: Determine if You Need a Base Class

Ask yourself:

- **Will multiple commands share logic?** (e.g., `alias create` and `alias create-custom`)
- **Do they have common flags?** (e.g., `--note`, `--hostname`)
- **Do they produce similar output?** (e.g., both return an Alias object)

**If YES to 2+ questions**: Create an abstract base class
**If NO**: Extend directly from `Command` or use existing base classes

#### Example: When to Create a Base Class

✅ **Create Base Class**:
- `alias list` and `alias search` → Both paginate and display alias tables → `AliasListBase`
- `alias create` and `alias create-custom` → Both create aliases with similar output → `AliasCreateBase`

❌ **Don't Create Base Class**:
- `alias delete` → Single unique command, no shared logic needed

### Step 4: Create the Abstract Base Class (If Needed)

**Location**: `src/commands/<resource>/<resource>-<action>-base.ts`
**Example**: `src/commands/alias/alias-create-base.ts`

#### Base Class Template

```typescript
import {Command, Flags} from '@oclif/core'
import {ResourceApi} from 'simplelogin-client'
import {getSimpleLoginConfig} from '../../utils/simplelogin-client.js'
import type {ResourceType} from 'simplelogin-client'
import YAML from 'yaml'

/**
 * Abstract base class for <description>
 * Provides shared logic for <what it does>
 */
export abstract class ResourceActionBase extends Command {
  // Hide base class from command list
  static hidden = true

  // Define common flags
  static flags = {
    config: Flags.string({
      description: 'Path to config file containing credentials',
      default: undefined,
      env: 'SIMPLELOGIN_CONFIG',
    }),
    format: Flags.string({
      description: 'Output format',
      options: ['plain', 'json', 'yaml'],
      default: 'plain',
    }),
    // Add command-specific common flags
    note: Flags.string({
      description: 'Note/description',
    }),
  }

  /**
   * Abstract method to be implemented by subclasses
   * This is where command-specific API calls happen
   */
  protected abstract performAction(
    api: ResourceApi,
    params: {/* common params */}
  ): Promise<ResourceType>

  /**
   * Require authentication for this command
   */
  protected async requireAuth(configPath?: string): Promise<void> {
    const {requireAuth} = await import('../../utils/simplelogin-client.js')
    await requireAuth(configPath)
  }

  /**
   * Output data in the appropriate format
   */
  protected outputData(data: unknown, format: 'plain' | 'json' | 'yaml'): void {
    switch (format) {
      case 'json': {
        this.log(JSON.stringify(data, null, 2))
        break
      }

      case 'yaml': {
        this.log(YAML.stringify(data))
        break
      }

      case 'plain':
      default: {
        if (typeof data === 'string') {
          this.log(data)
        } else {
          this.log(JSON.stringify(data, null, 2))
        }

        break
      }
    }
  }

  /**
   * Output error in the appropriate format
   */
  protected outputError(message: string, code: string, format: 'plain' | 'json' | 'yaml'): void {
    if (format === 'json' || format === 'yaml') {
      const errorData = {
        success: false,
        error: {
          code,
          message,
        },
      }
      this.outputData(errorData, format)
    } else {
      this.error(message)
    }
  }

  /**
   * Main execution logic
   * Handles auth, API calls, and output
   */
  protected async executeAction(format: 'plain' | 'json' | 'yaml', flags: any): Promise<void> {
    try {
      // Step 1: Authenticate
      await this.requireAuth(flags.config as string | undefined)

      // Step 2: Initialize SDK client
      const config = await getSimpleLoginConfig(flags.config as string | undefined)
      const api = new ResourceApi(config)

      // Step 3: Build parameters
      const params = {/* extract from flags */}

      // Step 4: Perform the action (implemented by subclass)
      const result = await this.performAction(api, params)

      // Step 5: Output results
      this.outputResult(result, format)
    } catch (error: any) {
      const message = error.message || 'An error occurred'
      this.outputError(message, 'API_ERROR', format)
      this.exit(4) // Exit code 4 for API errors
    }
  }

  /**
   * Format and output the result
   */
  protected outputResult(result: ResourceType, format: 'plain' | 'json' | 'yaml'): void {
    if (format === 'json' || format === 'yaml') {
      this.outputData(result, format)
    } else {
      // Plain format - custom formatting
      const lines = [
        'Action completed successfully',
        `Field: ${result.field}`,
      ]
      this.log(lines.join('\n'))
    }
  }
}
```

#### Key Patterns in Base Classes

1. **Mark as hidden**: `static hidden = true` prevents base class from appearing in command list
2. **Define common flags**: Flags shared across subcommands
3. **Abstract methods**: Force subclasses to implement specific logic
4. **Shared utilities**: Authentication, output formatting, error handling
5. **Template method pattern**: `executeAction()` orchestrates the flow, subclasses fill in details

### Step 5: Create the Concrete Command

**Location**: `src/commands/<resource>/<action>.ts`
**Example**: `src/commands/alias/create.ts`

#### Concrete Command Template

```typescript
import {Args, Flags} from '@oclif/core'
import {ResourceActionBase} from './resource-action-base.js'
import type {ResourceApi, ResourceType} from 'simplelogin-client'

export default class ResourceAction extends ResourceActionBase {
  // Command description (shows in help)
  static description = 'Brief description of what this command does'

  // Usage examples (shows in help)
  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --flag value',
    '<%= config.bin %> <%= command.id %> arg1 --format json',
  ]

  // Command aliases (optional)
  static aliases = ['resource:shortname']

  // Positional arguments (optional)
  static args = {
    myArg: Args.string({
      description: 'Argument description',
      required: true,
    }),
  }

  // Command-specific flags
  static flags = {
    ...ResourceActionBase.flags, // Inherit base flags
    myFlag: Flags.string({
      description: 'Flag description',
      required: false,
    }),
  }

  // Store parsed values for use in performAction
  private myValue!: string

  // Entry point
  public async run(): Promise<void> {
    const {args, flags} = await this.parse(ResourceAction)
    const format = (flags.format as 'plain' | 'json' | 'yaml') || 'plain'

    // Store values for later use
    this.myValue = args.myArg as string

    // Execute the action
    await this.executeAction(format, flags)
  }

  // Implement the abstract method
  protected async performAction(
    api: ResourceApi,
    params: {/* params from base */}
  ): Promise<ResourceType> {
    const {flags} = await this.parse(ResourceAction)

    // Make the SDK call with correct structure
    return api.sdkMethod({
      requestBody: {
        field: this.myValue,
        ...params,
      },
      otherParam: flags.myFlag,
    })
  }
}
```

#### Key Patterns in Concrete Commands

1. **Extend base class**: Inherit shared logic and flags
2. **Static properties**: Define `description`, `examples`, `aliases`, `args`, `flags`
3. **Spread base flags**: `...ResourceActionBase.flags` to inherit common flags
4. **Parse in run()**: Extract `args` and `flags` using `await this.parse(ClassName)`
5. **Store instance variables**: Save parsed values as instance properties for use in abstract methods
6. **Implement abstract methods**: Provide command-specific logic

### Step 6: Implement Without Base Class (Alternative)

If you don't need a base class, you can implement directly:

```typescript
import {Command, Flags} from '@oclif/core'
import {ResourceApi} from 'simplelogin-client'
import {getSimpleLoginConfig, requireAuth} from '../utils/simplelogin-client.js'

export default class ResourceAction extends Command {
  static description = 'Do something'

  static flags = {
    config: Flags.string({
      description: 'Path to config file containing credentials',
      default: undefined,
      env: 'SIMPLELOGIN_CONFIG',
    }),
    format: Flags.string({
      description: 'Output format',
      options: ['plain', 'json', 'yaml'],
      default: 'plain',
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(ResourceAction)

    try {
      // Auth
      await requireAuth(flags.config as string | undefined)

      // API call
      const config = await getSimpleLoginConfig(flags.config as string | undefined)
      const api = new ResourceApi(config)
      const result = await api.doSomething()

      // Output
      if (flags.format === 'json') {
        this.log(JSON.stringify(result, null, 2))
      } else {
        this.log(`Success: ${result.field}`)
      }
    } catch (error: any) {
      this.error(error.message)
    }
  }
}
```

### Step 7: Build and Test

```bash
# Compile TypeScript
pnpm run build

# Update manifest and README
pnpm run prepack

# Test the command
./bin/run.js <resource> <action> --help

# Test without auth (should fail gracefully)
./bin/run.js <resource> <action>

# Test with auth (if you have credentials)
./bin/run.js <resource> <action> --config ~/.config/simplelogin-cli/config.yaml
```

#### Build Error Resolution

If you encounter TypeScript errors:

1. **Check SDK types**: Verify parameter names match the SDK exactly
2. **Use correct structure**: Nested request bodies vs top-level parameters
3. **Import types**: Ensure you import types from `simplelogin-client`
4. **Check camelCase**: SDK uses camelCase (e.g., `aliasPrefix`, not `alias_prefix`)

### Step 8: Create Tests (Optional but Recommended)

**Location**: `test/commands/<resource>/<action>.test.ts`

```typescript
import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('resource:action', () => {
  it('shows help', async () => {
    const {stdout} = await runCommand('resource action --help')
    expect(stdout).to.contain('Do something')
  })

  it('requires authentication', async () => {
    try {
      await runCommand('resource action')
      expect.fail('Should have thrown')
    } catch (error: any) {
      expect(error.message).to.contain('login')
    }
  })
})
```

---

## Pattern: Shared Base Classes

### When to Create a Base Class

Create an abstract base class when you have **2 or more related commands** that share:

- Common flags (e.g., `--page`, `--all`, `--note`)
- Similar authentication requirements
- Similar output formatting
- Similar error handling
- Same resource type (e.g., both return `Alias` objects)

### Base Class Checklist

- [ ] Marked with `static hidden = true`
- [ ] Extends `Command` from `@oclif/core`
- [ ] Defines `static flags` with common flags
- [ ] Provides `requireAuth()` method
- [ ] Provides `outputData()` and `outputError()` methods
- [ ] Defines at least one `abstract` method for subclasses
- [ ] Has a main execution method (e.g., `executeAction()`)
- [ ] Handles errors and exit codes appropriately

### Examples in Codebase

| Base Class | Shared By | Common Logic |
|------------|-----------|--------------|
| `AliasListBase` | `list`, `search` | Pagination, filtering, table output |
| `AliasCreateBase` | `create`, `create-custom` | Auth, output formatting, error handling |

---

## SDK Integration

### Understanding SDK Structure

The `simplelogin-client` SDK follows OpenAPI-generated patterns:

```typescript
// Pattern 1: Simple request (just an ID)
await api.getResource({ resourceId: 123 })

// Pattern 2: Request with body
await api.createResource({
  resourcePostBody: {
    field1: 'value',
    field2: 123,
  }
})

// Pattern 3: Request with body + query params
await api.createResource({
  resourcePostBody: {
    field1: 'value',
  },
  queryParam: 'value', // NOT inside resourcePostBody!
})

// Pattern 4: Request with pagination
await api.listResources({
  pageId: 0,
  filter1: true,
})
```

### Common SDK Patterns

#### Authentication

All API classes require a `SimpleLoginConfig`:

```typescript
import {ResourceApi} from 'simplelogin-client'
import {getSimpleLoginConfig} from '../utils/simplelogin-client.js'

const config = await getSimpleLoginConfig(configPath)
const api = new ResourceApi(config)
```

#### Request Bodies

SDK methods often wrap request bodies:

```typescript
// ❌ WRONG - Direct object
await api.createAlias({
  note: 'My note',
  hostname: 'example.com',
})

// ✅ CORRECT - Wrapped in request body
await api.createRandomAlias({
  aliasRandomNewPost: {
    note: 'My note',
  },
  hostname: 'example.com', // Outside the body!
})
```

#### Field Naming

SDK uses **camelCase**, not snake_case:

```typescript
// ❌ WRONG
{
  alias_prefix: 'test',
  signed_suffix: 'abc',
  mailbox_ids: [1, 2, 3],
}

// ✅ CORRECT
{
  aliasPrefix: 'test',
  signedSuffix: 'abc',
  mailboxIds: [1, 2, 3],
}
```

### Discovering SDK APIs

```bash
# Find all API classes
ls node_modules/simplelogin-client/tscBuild/sdk/apis/

# Find methods in an API
grep "export interface\|^    [a-z].*(" node_modules/simplelogin-client/tscBuild/sdk/apis/AliasApi.d.ts

# Find request parameter structure
grep -A 20 "export interface CreateResourceRequest" node_modules/simplelogin-client/tscBuild/sdk/apis/

# Find response types
grep -A 20 "export interface Resource" node_modules/simplelogin-client/tscBuild/sdk/models/
```

---

## Testing and Validation

### Pre-Deployment Checklist

- [ ] **Build succeeds**: `pnpm run build` completes without errors
- [ ] **Manifest updated**: `pnpm run prepack` runs successfully
- [ ] **Help text works**: `./bin/run.js <command> --help` displays correctly
- [ ] **Command runs**: Basic execution doesn't crash (even if auth fails)
- [ ] **Auth required**: Commands with auth show appropriate error when not logged in
- [ ] **Format flags work**: Test `--format json` and `--format yaml`
- [ ] **Examples are valid**: Examples in `static examples` are actually runnable
- [ ] **Aliases work**: If defined, test command aliases (e.g., `sl alias ls`)
- [ ] **Exit codes**: Verify correct exit codes (0=success, 3=auth, 4=API error)

### Testing Output Formats

```bash
# Plain format (default)
./bin/run.js alias create --note "Test"

# JSON format
./bin/run.js alias create --note "Test" --format json

# YAML format
./bin/run.js alias create --note "Test" --format yaml
```

### Testing Error Cases

```bash
# Auth error (no config)
./bin/run.js alias create
# Should exit with code 3

# Invalid arguments
./bin/run.js alias create-custom
# Should exit with code 2

# API error (invalid data)
./bin/run.js alias create-custom invalid suffix --mailbox-ids 99999
# Should exit with code 4
```

---

## Common Pitfalls

### 1. Forgetting `.js` Extension in Imports

❌ **WRONG**:
```typescript
import {BaseCommand} from '../base'
```

✅ **CORRECT**:
```typescript
import {BaseCommand} from '../base.js'
```

**Why**: Node16 modules require explicit file extensions.

### 2. Incorrect SDK Request Structure

❌ **WRONG**:
```typescript
await api.createCustomAlias({
  customAliasPost: { /* ... */ }  // Wrong property name
})
```

✅ **CORRECT**:
```typescript
await api.createCustomAlias({
  aliasCustomNewPost: { /* ... */ }  // Matches SDK interface
})
```

**Fix**: Always check the SDK types in `node_modules/simplelogin-client/tscBuild/sdk/`

### 3. Mixing snake_case and camelCase

❌ **WRONG**:
```typescript
{
  alias_prefix: 'test',  // Python-style
}
```

✅ **CORRECT**:
```typescript
{
  aliasPrefix: 'test',  // JavaScript-style
}
```

**Fix**: SDK uses camelCase for all fields.

### 4. Not Running `pnpm prepack`

After creating a new command, you must run:

```bash
pnpm run prepack
```

This updates:
- `oclif.manifest.json` - Command registry
- `README.md` - Auto-generated command documentation

**Symptom**: Command doesn't show up in `sl --help` or can't be executed.

### 5. Forgetting `await this.parse()`

❌ **WRONG**:
```typescript
public async run(): Promise<void> {
  this.flags.format  // undefined!
}
```

✅ **CORRECT**:
```typescript
public async run(): Promise<void> {
  const {flags} = await this.parse(MyCommand)
  flags.format  // 'plain'
}
```

### 6. Not Handling Errors Properly

❌ **WRONG**:
```typescript
const result = await api.createAlias({...})  // Throws, crashes CLI
```

✅ **CORRECT**:
```typescript
try {
  const result = await api.createAlias({...})
  this.outputResult(result, format)
} catch (error: any) {
  this.outputError(error.message, 'API_ERROR', format)
  this.exit(4)
}
```

### 7. Incorrect Exit Codes

Use the correct exit codes from CLI_DESIGN.md:

| Code | When to Use |
|------|-------------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments (user input error) |
| 3 | Authentication required |
| 4 | API error (server/network error) |

### 8. Not Testing All Output Formats

Always test:
- `--format plain` (default)
- `--format json`
- `--format yaml`

Error output should also respect the format flag.

---

## Quick Reference

### File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Abstract base | `<resource>-<action>-base.ts` | `alias-create-base.ts` |
| Concrete command | `<action>.ts` | `create.ts` |
| Test file | `<action>.test.ts` | `create.test.ts` |

### Import Patterns

```typescript
// Oclif
import {Command, Flags, Args} from '@oclif/core'

// SDK
import {ResourceApi} from 'simplelogin-client'
import type {ResourceType} from 'simplelogin-client'

// Utils
import {getSimpleLoginConfig, requireAuth} from '../../utils/simplelogin-client.js'
import YAML from 'yaml'
```

### Common Flag Definitions

```typescript
static flags = {
  config: Flags.string({
    description: 'Path to config file containing credentials',
    default: undefined,
    env: 'SIMPLELOGIN_CONFIG',
  }),
  format: Flags.string({
    description: 'Output format',
    options: ['plain', 'json', 'yaml'],
    default: 'plain',
  }),
  page: Flags.integer({
    description: 'Page number',
    default: 0,
    min: 0,
  }),
  all: Flags.boolean({
    description: 'Fetch all pages automatically',
    default: false,
  }),
}
```

### Build and Test Commands

```bash
# Build
pnpm run build

# Update docs
pnpm run prepack

# Test
./bin/run.js <command> --help
pnpm run test
```

---

## Example: Complete Workflow

Let's create `sl mailbox list` from scratch:

### 1. Check CLI_DESIGN.md

```markdown
## `sl mailbox list`
**SDK Reference:** `MailboxApi.getMailboxes()`
**Authorization:** Required
```

### 2. Research SDK

```bash
grep -A 10 "getMailboxes" node_modules/simplelogin-client/tscBuild/sdk/apis/MailboxApi.d.ts
```

Result: `getMailboxes(): Promise<MailboxArray>`

### 3. Create Command

```typescript
// src/commands/mailbox/list.ts
import {Command, Flags} from '@oclif/core'
import {MailboxApi} from 'simplelogin-client'
import {getSimpleLoginConfig, requireAuth} from '../../utils/simplelogin-client.js'
import YAML from 'yaml'

export default class MailboxList extends Command {
  static description = 'List all mailboxes'
  static aliases = ['mailbox:ls']

  static flags = {
    config: Flags.string({
      description: 'Path to config file containing credentials',
      default: undefined,
      env: 'SIMPLELOGIN_CONFIG',
    }),
    format: Flags.string({
      description: 'Output format',
      options: ['plain', 'json', 'yaml'],
      default: 'plain',
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(MailboxList)

    try {
      await requireAuth(flags.config as string | undefined)

      const config = await getSimpleLoginConfig(flags.config as string | undefined)
      const api = new MailboxApi(config)
      const result = await api.getMailboxes()

      if (flags.format === 'json') {
        this.log(JSON.stringify(result.mailboxes, null, 2))
      } else if (flags.format === 'yaml') {
        this.log(YAML.stringify(result.mailboxes))
      } else {
        this.log('ID'.padEnd(8) + 'Email'.padEnd(40) + 'Verified')
        this.log('-'.repeat(60))
        for (const mb of result.mailboxes || []) {
          this.log(
            String(mb.id).padEnd(8) +
            mb.email.padEnd(40) +
            (mb.verified ? 'Yes' : 'No')
          )
        }
      }
    } catch (error: any) {
      this.error(error.message)
    }
  }
}
```

### 4. Build and Test

```bash
pnpm run build
pnpm run prepack
./bin/run.js mailbox list --help
```

Done! 🎉

---

## Additional Resources

- [Oclif Documentation](https://oclif.io/)
- [CLI_DESIGN.md](./CLI_DESIGN.md) - Complete command specifications
- [CLAUDE.md](./CLAUDE.md) - Project overview and architecture
- [simplelogin-client SDK](https://github.com/simple-login/SimpleLogin-Client) - API client library

---

**Pro Tip**: When in doubt, look at existing commands in `src/commands/` that are similar to what you're building. The patterns are consistent across the codebase.
