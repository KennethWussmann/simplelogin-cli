import {Command, Flags} from '@oclif/core'
import {AliasApi} from 'simplelogin-client'
import {getSimpleLoginConfig} from '../../utils/simplelogin-client.js'
import type {Alias} from 'simplelogin-client'
import YAML from 'yaml'

/**
 * Abstract base class for alias creation commands
 * Provides shared logic for authentication, output formatting, and common flags
 */
export abstract class AliasCreateBase extends Command {
  static hidden = true

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
    note: Flags.string({
      description: 'Note/description for the alias',
    }),
    hostname: Flags.string({
      description: 'Associated hostname',
    }),
  }

  /**
   * Abstract method to create alias - implemented by subclasses
   */
  protected abstract createAlias(
    api: AliasApi,
    params: {note?: string; hostname?: string}
  ): Promise<Alias>

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
   */
  protected async executeCreate(format: 'plain' | 'json' | 'yaml', flags: any): Promise<void> {
    try {
      await this.requireAuth(flags.config as string | undefined)

      const config = await getSimpleLoginConfig(flags.config as string | undefined)
      const api = new AliasApi(config)

      // Build params object
      const params: {note?: string; hostname?: string} = {}
      if (flags.note) params.note = flags.note as string
      if (flags.hostname) params.hostname = flags.hostname as string

      // Create the alias
      const alias = await this.createAlias(api, params)

      // Output results
      this.outputAlias(alias, format)
    } catch (error: any) {
      const message = error.message || 'An error occurred while creating the alias'
      this.outputError(message, 'API_ERROR', format)
      this.exit(4)
    }
  }

  /**
   * Format and output alias based on output format
   */
  protected outputAlias(alias: Alias, format: 'plain' | 'json' | 'yaml'): void {
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
}
