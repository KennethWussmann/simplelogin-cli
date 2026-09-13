import type {Alias, AliasModelArray} from 'simplelogin-client'

import {Command, Flags} from '@oclif/core'
import {AliasApi} from 'simplelogin-client'
import YAML from 'yaml'

import {getSimpleLoginConfig} from '../../utils/simplelogin-client.js'

/**
 * Abstract base class for alias list and search commands
 * Provides shared logic for pagination, filtering, and output formatting
 */
export abstract class AliasListBase extends Command {
  static flags = {
    all: Flags.boolean({
      default: false,
      description: 'Fetch all pages automatically',
    }),
    config: Flags.string({
      default: undefined,
      description: 'Path to config file containing credentials',
      env: 'SIMPLELOGIN_CONFIG',
    }),
    disabled: Flags.boolean({
      description: 'Show only disabled aliases',
      exclusive: ['pinned', 'enabled'],
    }),
    enabled: Flags.boolean({
      description: 'Show only enabled aliases',
      exclusive: ['pinned', 'disabled'],
    }),
    format: Flags.string({
      default: 'plain',
      description: 'Output format',
      options: ['plain', 'json', 'yaml'],
    }),
    page: Flags.integer({
      default: 0,
      description: 'Page number (20 aliases per page)',
      min: 0,
    }),
    pinned: Flags.boolean({
      description: 'Show only pinned aliases',
      exclusive: ['disabled', 'enabled'],
    }),
  }
static hidden = true

  /**
   * Main execution logic
   */
  protected async executeList(
    format: 'json' | 'plain' | 'yaml',
    flags: {all?: boolean; config?: string; disabled?: boolean; enabled?: boolean; page?: number; pinned?: boolean},
  ): Promise<void> {
    await this.requireAuth(flags.config)

    const config = await getSimpleLoginConfig(flags.config)
    const api = new AliasApi(config)

    // Build filter object
    const filters: {disabled?: boolean; enabled?: boolean; pinned?: boolean;} = {}
    if (flags.pinned) filters.pinned = true
    if (flags.disabled) filters.disabled = true
    if (flags.enabled) filters.enabled = true

    const currentPage = flags.page ?? 0
    const allAliases: Alias[] = flags.all
      ? await this.fetchAllAliases(api, currentPage, filters, format)
      : (await this.fetchAliases(api, currentPage, filters)).aliases || []

    // Output results
    this.outputAliases(allAliases, format)
  }

  /**
   * Abstract method to fetch aliases - implemented by subclasses
   */
  protected abstract fetchAliases(
    api: AliasApi,
    pageId: number,
    filters: {disabled?: boolean; enabled?: boolean; pinned?: boolean;}
  ): Promise<AliasModelArray>

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
   * Require authentication for this command
   */
  protected async requireAuth(configPath?: string): Promise<void> {
    // Import and use the requireAuth from simplelogin-client utils
    const {requireAuth} = await import('../../utils/simplelogin-client.js')
    await requireAuth(configPath)
  }

  private async fetchAllAliases(
    api: AliasApi,
    pageId: number,
    filters: {disabled?: boolean; enabled?: boolean; pinned?: boolean},
    format: 'json' | 'plain' | 'yaml',
  ): Promise<Alias[]> {
    if (format === 'plain') {
      this.log(`Fetching page ${pageId}...`)
    }

    const result = await this.fetchAliases(api, pageId, filters)
    const aliases = result.aliases || []

    // If we got less than 20 items, we're done
    if (aliases.length < 20) {
      return aliases
    }

    return [...aliases, ...(await this.fetchAllAliases(api, pageId + 1, filters, format))]
  }

  /**
   * Format and output aliases based on output format
   */
  private outputAliases(aliases: Alias[], format: 'json' | 'plain' | 'yaml'): void {
    if (format === 'json' || format === 'yaml') {
      // Return structured data
      this.outputData(aliases, format)
    } else {
      // Plain format - display as table
      if (aliases.length === 0) {
        this.log('No aliases found.')
        return
      }

      // Create table header
      const header = 'ID'.padEnd(8) +
                     'Email'.padEnd(40) +
                     'Enabled'.padEnd(10) +
                     'Pinned'.padEnd(10) +
                     'Mailboxes'
      this.log(header)
      this.log('-'.repeat(100))

      // Display each alias
      for (const alias of aliases) {
        const id = String(alias.id).padEnd(8)
        const email = alias.email.padEnd(40).slice(0, 40)
        const enabled = (alias.enabled ? 'Yes' : 'No').padEnd(10)
        const pinned = (alias.pinned ? 'Yes' : 'No').padEnd(10)
        const mailboxes = alias.mailboxes.map(m => m.email).join(', ')

        this.log(`${id}${email}${enabled}${pinned}${mailboxes}`)
      }

      this.log('')
      this.log(`Total: ${aliases.length} alias${aliases.length === 1 ? '' : 'es'}`)
    }
  }
}
