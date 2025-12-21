# SimpleLogin CLI Design

## Overview

The SimpleLogin CLI (`sl`) is a command-line interface for managing SimpleLogin aliases, mailboxes, and account settings. It's designed as a system tool optimized for scripting and automation, following modern CLI patterns similar to Docker CLI and the Hugging Face CLI.

## Tech Stack

- TypeScript
- Oclif Framework
- simplelogin-client SDK

## Global Flags

All commands support these global flags:

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--format` | `plain\|json\|yaml` | `plain` | Output format. Plain is human-readable, JSON/YAML for scripting |
| `--config` | `string` | `~/.config/simplelogin-cli/config.yaml` | Path to config file containing credentials |

## Command Structure

```
sl <resource> <action> [options]
```

Docker-style aliases are supported (e.g., `rm` for `delete`, `ls` for `list`).

---

# Base Commands

## `sl login`

Authenticate with SimpleLogin and store credentials.

**SDK Reference:** `AccountApi.login()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `--url` | string | - | No | SimpleLogin instance URL (e.g., https://app.simplelogin.io) |
| `--email` | string | - | No | Email address for login |
| `--password` | string | - | No | Password (prefer interactive prompt for security) |
| `--device` | string | `simplelogin-cli` | No | Device name for the API key |

### Acceptance Criteria

- If `--url` is not provided and not in config, prompt for URL
- If `--email` is not provided, prompt for email
- If `--password` is not provided, prompt for password (hidden input)
- Validate connection by calling API with credentials
- If MFA is enabled, prompt for MFA token using `AccountApi.mfa()`
- Store API key in config file at `--config` path
- Create config directory if it doesn't exist
- Config file permissions should be 600 (user read/write only)
- Output success message with redacted API key in plain format
- In JSON/YAML format, return `{success: true, url: string, email: string}`

**Authorization:** None (this command establishes authorization)

---

## `sl logout`

Remove API credentials from config.

**SDK Reference:** `AccountApi.logout()`

### Parameters

No command-specific parameters.

### Acceptance Criteria

- Call `AccountApi.logout()` to invalidate the API key
- Remove API key from config file, keep URL
- Output confirmation message
- In JSON/YAML format, return `{success: true}`

**Authorization:** Required

---

## `sl config`

Display current configuration.

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `--show-key` | boolean | false | No | Show full API key (default: redacted) |

### Acceptance Criteria

- Read and display config from `--config` path
- Redact API key by default (show only first 8 chars)
- If `--show-key`, display full API key
- In plain format, display as key-value pairs
- In JSON/YAML format, return config object
- If config doesn't exist, show empty/default values

**Authorization:** None

---

# Account Commands

## `sl account info`

Get account information.

**SDK Reference:** `AccountApi.getUserInfo()`

### Parameters

No command-specific parameters.

### Acceptance Criteria

- Call `AccountApi.getUserInfo()`
- In plain format, display user info as formatted key-value pairs
- In JSON/YAML format, return full UserInfo object
- Show: name, email, premium status, trial status, max aliases

**Authorization:** Required

---

## `sl account stats`

Get account statistics.

**SDK Reference:** `AccountApi.getStats()`

### Parameters

No command-specific parameters.

### Acceptance Criteria

- Call `AccountApi.getStats()`
- In plain format, display stats in table format
- Show: number of aliases, forwarded emails, replied emails, blocked emails
- In JSON/YAML format, return full UserStats object

**Authorization:** Required

---

## `sl account update`

Update account information.

**SDK Reference:** `AccountApi.updateUserInfo()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `--name` | string | - | No | New display name |
| `--profile-picture` | string | - | No | Path to image file or "none" to remove |

### Acceptance Criteria

- At least one parameter must be provided
- If `--profile-picture` is a file path, read and encode as base64
- If `--profile-picture` is "none", set to null
- Call `AccountApi.updateUserInfo()`
- Output success confirmation
- In JSON/YAML format, return updated UserInfo object

**Authorization:** Required

---

## `sl account register`

Register a new account.

**SDK Reference:** `AccountApi.registerAccount()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `--email` | string | - | No | Email address (will prompt if not provided) |
| `--password` | string | - | No | Password (will prompt if not provided) |

### Acceptance Criteria

- Prompt for email and password if not provided
- Password should be hidden input
- Call `AccountApi.registerAccount()`
- Output instructions to check email for activation code
- In JSON/YAML format, return `{success: true, email: string}`

**Authorization:** None

---

## `sl account activate`

Activate a registered account.

**SDK Reference:** `AccountApi.activateAccount()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `--email` | string | - | Yes | Email address |
| `--code` | string | - | Yes | Activation code from email |

### Acceptance Criteria

- Call `AccountApi.activateAccount()`
- Output success message
- In JSON/YAML format, return `{success: true}`

**Authorization:** None

---

## `sl account delete`

Delete account (requires sudo mode).

**SDK Reference:** `AccountApi.deleteUser()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `--password` | string | - | No | Password for sudo mode confirmation |
| `--confirm` | boolean | false | No | Skip interactive confirmation |

### Acceptance Criteria

- If `--confirm` is not set, prompt user with "Are you sure?" warning
- Prompt for password if not provided
- Call `AccountApi.enableSudoMode()` first
- Call `AccountApi.deleteUser()`
- Output deletion confirmation
- In JSON/YAML format, return `{success: true}`

**Authorization:** Required

---

# Alias Commands

## `sl alias list` / `sl alias ls`

List all aliases with pagination.

**SDK Reference:** `AliasApi.getAliases()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `--page` | number | 0 | No | Page number (20 aliases per page) |
| `--pinned` | boolean | - | No | Show only pinned aliases |
| `--disabled` | boolean | - | No | Show only disabled aliases |
| `--enabled` | boolean | - | No | Show only enabled aliases |
| `--all` | boolean | false | No | Fetch all pages automatically |

### Acceptance Criteria

- Call `AliasApi.getAliases()` with pagination
- If `--all` is set, fetch all pages and combine results
- Only one of `--pinned`, `--disabled`, `--enabled` can be set
- In plain format, display as table with columns: ID, Email, Enabled, Pinned, Mailboxes
- In JSON/YAML format, return array of Alias objects
- Show total count

**Authorization:** Required

---

## `sl alias search`

Search aliases by email address.

**SDK Reference:** `AliasApi.searchAliases()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `<query>` | string | - | Yes | Search query for alias email |
| `--page` | number | 0 | No | Page number |
| `--pinned` | boolean | - | No | Show only pinned aliases |
| `--disabled` | boolean | - | No | Show only disabled aliases |
| `--enabled` | boolean | - | No | Show only enabled aliases |
| `--all` | boolean | false | No | Fetch all pages automatically |

### Acceptance Criteria

- Query is a positional argument
- Call `AliasApi.searchAliases()`
- Same filtering logic as `list` command
- Same output format as `list` command

**Authorization:** Required

---

## `sl alias get`

Get details of a specific alias.

**SDK Reference:** `AliasApi.getAlias()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `<alias-id>` | number | - | Yes | Alias ID |

### Acceptance Criteria

- Alias ID is a positional argument
- Call `AliasApi.getAlias()`
- In plain format, display all alias details as formatted key-value pairs
- In JSON/YAML format, return full Alias object
- Show: ID, email, enabled status, mailboxes, note, creation date, activity counts

**Authorization:** Required

---

## `sl alias create`

Create a new random alias.

**SDK Reference:** `AliasApi.createRandomAlias()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `--note` | string | - | No | Note/description for the alias |
| `--hostname` | string | - | No | Associated hostname |
| `--mode` | `uuid\|word` | - | No | Generation mode (uuid or word-based) |

### Acceptance Criteria

- Call `AliasApi.createRandomAlias()`
- Output created alias email and ID
- In plain format, show key details
- In JSON/YAML format, return full Alias object

**Authorization:** Required

---

## `sl alias create-custom`

Create a custom alias with specific prefix and suffix.

**SDK Reference:** `AliasApi.createCustomAlias()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `<prefix>` | string | - | Yes | Alias prefix (local part) |
| `<suffix>` | string | - | Yes | Signed suffix from alias options |
| `--mailbox-ids` | string | - | Yes | Comma-separated mailbox IDs |
| `--note` | string | - | No | Note/description |
| `--name` | string | - | No | Display name |
| `--hostname` | string | - | No | Associated hostname |

### Acceptance Criteria

- Prefix and suffix are positional arguments
- `--mailbox-ids` should be parsed as comma-separated numbers
- Call `AliasApi.createCustomAlias()`
- Output created alias details
- In JSON/YAML format, return full Alias object

**Authorization:** Required

---

## `sl alias update`

Update alias settings.

**SDK Reference:** `AliasApi.updateAlias()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `<alias-id>` | number | - | Yes | Alias ID |
| `--note` | string | - | No | Update note |
| `--name` | string | - | No | Update display name |
| `--mailbox-id` | number | - | No | Change primary mailbox |
| `--mailbox-ids` | string | - | No | Comma-separated mailbox IDs |
| `--pinned` | boolean | - | No | Pin/unpin alias |
| `--disable-pgp` | boolean | - | No | Disable/enable PGP |

### Acceptance Criteria

- Alias ID is positional argument
- At least one optional parameter must be provided
- Call `AliasApi.updateAlias()`
- Output success confirmation
- In JSON/YAML format, return `{success: true}`

**Authorization:** Required

---

## `sl alias delete` / `sl alias rm`

Delete an alias.

**SDK Reference:** `AliasApi.deleteAlias()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `<alias-id>` | number | - | Yes | Alias ID to delete |
| `--confirm` | boolean | false | No | Skip confirmation prompt |

### Acceptance Criteria

- Alias ID is positional argument
- If `--confirm` is not set, prompt for confirmation
- Call `AliasApi.deleteAlias()`
- Output deletion confirmation
- In JSON/YAML format, return `{success: true, deleted: true}`

**Authorization:** Required

---

## `sl alias toggle`

Enable or disable an alias.

**SDK Reference:** `AliasApi.toggleAlias()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `<alias-id>` | number | - | Yes | Alias ID |

### Acceptance Criteria

- Alias ID is positional argument
- Call `AliasApi.toggleAlias()` to toggle current state
- Output new state (enabled/disabled)
- In plain format, show "Alias {id} is now {enabled/disabled}"
- In JSON/YAML format, return `{success: true, enabled: boolean}`

**Authorization:** Required

---

## `sl alias enable`

Enable a specific alias.

**SDK Reference:** `AliasApi.toggleAlias()`, `AliasApi.getAlias()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `<alias-id>` | number | - | Yes | Alias ID |

### Acceptance Criteria

- Alias ID is positional argument
- Call `AliasApi.getAlias()` to check current state
- If already enabled, skip API call
- If disabled, call `AliasApi.toggleAlias()`
- Output confirmation
- In JSON/YAML format, return `{success: true, enabled: true}`

**Authorization:** Required

---

## `sl alias disable`

Disable a specific alias.

**SDK Reference:** `AliasApi.toggleAlias()`, `AliasApi.getAlias()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `<alias-id>` | number | - | Yes | Alias ID |

### Acceptance Criteria

- Alias ID is positional argument
- Call `AliasApi.getAlias()` to check current state
- If already disabled, skip API call
- If enabled, call `AliasApi.toggleAlias()`
- Output confirmation
- In JSON/YAML format, return `{success: true, enabled: false}`

**Authorization:** Required

---

## `sl alias activities`

Get activity log for an alias.

**SDK Reference:** `AliasApi.getActivities()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `<alias-id>` | number | - | Yes | Alias ID |
| `--page` | number | 0 | No | Page number |
| `--all` | boolean | false | No | Fetch all pages |

### Acceptance Criteria

- Alias ID is positional argument
- Call `AliasApi.getActivities()`
- If `--all`, fetch all pages
- In plain format, display as table with columns: Action, From, To, Timestamp
- In JSON/YAML format, return array of activity objects
- Show most recent first

**Authorization:** Required

---

## `sl alias options`

Get available options for creating aliases.

**SDK Reference:** `AliasApi.getAliasOptions()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `--hostname` | string | - | No | Get options for specific hostname |

### Acceptance Criteria

- Call `AliasApi.getAliasOptions()`
- In plain format, display prefix suggestion and available suffixes
- Show whether user can create new aliases
- In JSON/YAML format, return full AliasOptions object

**Authorization:** Required

---

# Contact Commands

## `sl contact list` / `sl contact ls`

List contacts for an alias.

**SDK Reference:** `AliasApi.getContacts()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `<alias-id>` | number | - | Yes | Alias ID |
| `--page` | number | 0 | No | Page number |
| `--all` | boolean | false | No | Fetch all pages |

### Acceptance Criteria

- Alias ID is positional argument
- Call `AliasApi.getContacts()`
- If `--all`, fetch all pages
- In plain format, display as table with columns: ID, Contact Email, Reverse Alias, Creation Date
- In JSON/YAML format, return array of contact objects

**Authorization:** Required

---

## `sl contact create`

Create a new contact for an alias.

**SDK Reference:** `AliasApi.createContact()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `<alias-id>` | number | - | Yes | Alias ID |
| `<email>` | string | - | Yes | Contact email address |

### Acceptance Criteria

- Alias ID and email are positional arguments
- Validate email format
- Call `AliasApi.createContact()`
- Output created contact details including reverse alias
- In JSON/YAML format, return full contact object
- Handle case where contact already exists (200 response)

**Authorization:** Required

---

# Mailbox Commands

## `sl mailbox list` / `sl mailbox ls`

List all mailboxes.

**SDK Reference:** `MailboxApi.getMailboxes()`

### Parameters

No command-specific parameters.

### Acceptance Criteria

- Call `MailboxApi.getMailboxes()`
- In plain format, display as table with columns: ID, Email, Default, Verified, Aliases Count
- In JSON/YAML format, return array of mailbox objects
- Highlight default mailbox

**Authorization:** Required

---

## `sl mailbox create`

Create a new mailbox.

**SDK Reference:** `MailboxApi.createMailbox()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `<email>` | string | - | Yes | Mailbox email address |

### Acceptance Criteria

- Email is positional argument
- Validate email format
- Call `MailboxApi.createMailbox()`
- Output creation confirmation with verification instructions
- In JSON/YAML format, return full Mailbox object
- Note that verification email will be sent

**Authorization:** Required

---

## `sl mailbox update`

Update mailbox settings.

**SDK Reference:** `MailboxApi.updateMailbox()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `<mailbox-id>` | number | - | Yes | Mailbox ID |
| `--email` | string | - | No | New email address |
| `--default` | boolean | - | No | Set as default mailbox |
| `--cancel-email-change` | boolean | false | No | Cancel pending email change |

### Acceptance Criteria

- Mailbox ID is positional argument
- At least one optional parameter must be provided
- Call `MailboxApi.updateMailbox()`
- If email is changed, note that verification is required
- Output success confirmation
- In JSON/YAML format, return `{success: true}`

**Authorization:** Required

---

## `sl mailbox delete` / `sl mailbox rm`

Delete a mailbox.

**SDK Reference:** `MailboxApi.deleteMailbox()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `<mailbox-id>` | number | - | Yes | Mailbox ID |
| `--confirm` | boolean | false | No | Skip confirmation prompt |

### Acceptance Criteria

- Mailbox ID is positional argument
- If `--confirm` is not set, prompt for confirmation
- Warn if deleting default mailbox
- Call `MailboxApi.deleteMailbox()`
- Output deletion confirmation
- In JSON/YAML format, return `{success: true}`

**Authorization:** Required

---

# Custom Domain Commands

## `sl domain list` / `sl domain ls`

List custom domains.

**SDK Reference:** `CustomDomainApi.getCustomDomains()`

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `<alias-id>` | number | - | Yes | Alias ID (per API spec) |

### Acceptance Criteria

- Alias ID is positional argument
- Call `CustomDomainApi.getCustomDomains()`
- In plain format, display as table with columns: ID, Domain, Verified, Catch-all, Aliases Count
- In JSON/YAML format, return custom domain object
- Show verification status prominently

**Authorization:** Required

---

# Output Format Examples

## Plain Format

```
Alias created successfully
ID:      12345
Email:   random_word@slmail.me
Enabled: true
Note:    Created from CLI
```

## JSON Format

```json
{
  "success": true,
  "data": {
    "id": 12345,
    "email": "random_word@slmail.me",
    "enabled": true,
    "note": "Created from CLI",
    "creation_date": "2025-12-21 10:30:00+00:00",
    "mailbox": {
      "id": 1,
      "email": "user@example.com"
    }
  }
}
```

## YAML Format

```yaml
success: true
data:
  id: 12345
  email: random_word@slmail.me
  enabled: true
  note: Created from CLI
  creation_date: '2025-12-21 10:30:00+00:00'
  mailbox:
    id: 1
    email: user@example.com
```

---

# Configuration File Format

## Location

Default: `~/.config/simplelogin-cli/config.yaml`

## Schema

```yaml
url: https://app.simplelogin.io
apiKey: sl_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Security

- File permissions: 600 (read/write for owner only)
- API key stored in plaintext (secured by file permissions)
- Config directory created with 700 permissions

---

# Error Handling

## Plain Format

```
Error: Unauthorized
Please run 'sl login' to authenticate
```

## JSON/YAML Format

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Please run 'sl login' to authenticate"
  }
}
```

---

# Authorization Requirements

Commands marked with **Authorization: Required** must:

1. Check for API key in config file
2. If missing, output error and suggest running `sl login`
3. Exit with non-zero status code

Commands marked with **Authorization: None** can run without authentication.

---

# Pagination Handling

For commands with `--all` flag:

- Make initial request with page 0
- If results returned < 20 items, stop
- Otherwise, increment page and continue
- Combine all results before outputting
- Show progress indicator in plain format (e.g., "Fetching page 2...")
- No progress indicator in JSON/YAML format

---

# Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 3 | Authentication required |
| 4 | API error |
| 5 | Network error |

---

# Future Enhancements

These features are not in the current SDK but could be added later:

- `sl notification list` - List notifications
- `sl settings get/update` - Manage account settings
- `sl export` - Export aliases and settings
- `sl import` - Import aliases from file
- `sl contact block/unblock` - Block/unblock contacts
- `sl domain create/update/delete` - Full domain management
