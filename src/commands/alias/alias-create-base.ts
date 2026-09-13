import type {Alias, Mailbox} from 'simplelogin-client'

import {Command, Flags} from '@oclif/core'
import {AliasApi, MailboxApi} from 'simplelogin-client'
import YAML from 'yaml'

import {getSimpleLoginConfig} from '../../utils/simplelogin-client.js'

/**
 * Abstract base class for alias creation commands
 * Provides shared logic for authentication, output formatting, and common flags
 */
export abstract class AliasCreateBase extends Command {
  static flags = {
    config: Flags.string({
      default: undefined,
      description: 'Path to config file containing credentials',
      env: 'SIMPLELOGIN_CONFIG',
    }),
    format: Flags.string({
      default: 'plain',
      description: 'Output format',
      options: ['plain', 'json', 'yaml'],
    }),
    hostname: Flags.string({
      description: 'Associated hostname',
    }),
    note: Flags.string({
      description: 'Note/description for the alias',
    }),
  }
static hidden = true

  /**
   * Abstract method to create alias - implemented by subclasses
   */
  protected abstract createAlias(
    api: AliasApi,
    params: {hostname?: string; note?: string;}
  ): Promise<Alias>

  /**
   * Main execution logic
   */
  protected async executeCreate(
    format: 'json' | 'plain' | 'yaml',
    flags: {config?: string; hostname?: string; note?: string},
  ): Promise<void> {
    try {
      await this.requireAuth(flags.config)

      const config = await getSimpleLoginConfig(flags.config)
      const api = new AliasApi(config)

      // Build params object
      const params: {hostname?: string; note?: string;} = {}
      if (flags.note) params.note = flags.note
      if (flags.hostname) params.hostname = flags.hostname

      // Create the alias
      const alias = await this.createAlias(api, params)

      // Output results
      this.outputAlias(alias, format)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred while creating the alias'
      this.outputError(message, 'API_ERROR', format)
      this.exit(4)
    }
  }

  protected async getDefaultMailbox(configPath?: string): Promise<Mailbox> {
    const api = new MailboxApi(await getSimpleLoginConfig(configPath))
    const { mailboxes } = await api.getMailboxes()
    const mailbox = mailboxes?.find(box => box._default) ?? mailboxes?.find(box => box.verified) ?? mailboxes?.at(0)

    if (!mailbox) {
      throw new Error("Failed to find default mailbox")
    }

    return mailbox
  }

  /**
   * Format and output alias based on output format
   */
  protected outputAlias(alias: Alias, format: 'json' | 'plain' | 'yaml'): void {
    if (format === 'json' || format === 'yaml') {
      // Return full Alias object
      this.outputData(alias, format)
    } else {
      // Plain format - display key details
      const lines = [
        'Alias created successfully',
        `ID:      ${alias.id}`,
        `Email:   ${alias.email}`,
        `Enabled: ${alias.enabled}`,
      ]

      if (alias.note) {
        lines.push(`Note:    ${alias.note}`)
      }

      if (alias.mailboxes && alias.mailboxes.length > 0) {
        const mailboxEmails = alias.mailboxes.map(m => m.email).join(', ')
        lines.push(`Mailboxes: ${mailboxEmails}`)
      }

      this.log(lines.join('\n'))
    }
  }

  /**
   * Output data in the appropriate format
   */
  protected outputData(data: unknown, format: 'json' | 'plain' | 'yaml'): void {
    switch (format) {
      case 'json': {
        this.log(JSON.stringify(data, null, 2))
        break
      }

      case 'yaml': {
        this.log(YAML.stringify(data))
        break
      }

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
  protected outputError(message: string, code: string, format: 'json' | 'plain' | 'yaml'): void {
    if (format === 'json' || format === 'yaml') {
      const errorData = {
        error: {
          code,
          message,
        },
        success: false,
      }
      this.outputData(errorData, format)
    } else {
      this.error(message)
    }
  }


  /**
   * Require authentication for this command
   */
  protected async requireAuth(configPath?: string): Promise<void> {
    const {requireAuth} = await import('../../utils/simplelogin-client.js')
    await requireAuth(configPath)
  }
}
