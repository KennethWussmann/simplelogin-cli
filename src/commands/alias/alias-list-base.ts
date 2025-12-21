import {Command, Flags} from '@oclif/core'
import {BaseCommand} from '../base.js'
import {AliasApi} from 'simplelogin-client'
import {getSimpleLoginConfig} from '../../utils/simplelogin-client.js'
import type {Alias, AliasModelArray} from 'simplelogin-client'

/**
 * Abstract base class for alias list and search commands
 * Provides shared logic for pagination, filtering, and output formatting
 */
export abstract class AliasListBase extends Command {
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
    page: Flags.integer({
      description: 'Page number (20 aliases per page)',
      default: 0,
      min: 0,
    }),
    pinned: Flags.boolean({
      description: 'Show only pinned aliases',
      exclusive: ['disabled', 'enabled'],
    }),
    disabled: Flags.boolean({
      description: 'Show only disabled aliases',
      exclusive: ['pinned', 'enabled'],
    }),
    enabled: Flags.boolean({
      description: 'Show only enabled aliases',
      exclusive: ['pinned', 'disabled'],
    }),
    all: Flags.boolean({
      description: 'Fetch all pages automatically',
      default: false,
    }),
  }

  /**
   * Abstract method to fetch aliases - implemented by subclasses
   */
  protected abstract fetchAliases(
    api: AliasApi,
    pageId: number,
    filters: {pinned?: boolean; disabled?: boolean; enabled?: boolean}
  ): Promise<AliasModelArray>

  /**
   * Get the output format from flags
   */
  protected getFormat(): 'plain' | 'json' | 'yaml' {
    const format = (this.parse().then(p => p.flags.format).catch(() => 'plain'))
    return 'plain' // Will be overridden in actual implementation
  }

  /**
   * Require authentication for this command
   */
  protected async requireAuth(configPath?: string): Promise<void> {
    // Import and use the requireAuth from simplelogin-client utils
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
        const YAML = require('yaml')
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
   * Main execution logic
   */
  protected async executeList(format: 'plain' | 'json' | 'yaml', flags: any): Promise<void> {
    await this.requireAuth(flags.config as string | undefined)

    const config = await getSimpleLoginConfig(flags.config as string | undefined)
    const api = new AliasApi(config)

    // Build filter object
    const filters: {pinned?: boolean; disabled?: boolean; enabled?: boolean} = {}
    if (flags.pinned) filters.pinned = true
    if (flags.disabled) filters.disabled = true
    if (flags.enabled) filters.enabled = true

    let allAliases: Alias[] = []
    let currentPage = flags.page as number

    if (flags.all) {
      // Fetch all pages
      let hasMore = true
      while (hasMore) {
        if (format === 'plain') {
          this.log(`Fetching page ${currentPage}...`)
        }

        const result = await this.fetchAliases(api, currentPage, filters)
        const aliases = result.aliases || []
        allAliases.push(...aliases)

        // If we got less than 20 items, we're done
        if (aliases.length < 20) {
          hasMore = false
        } else {
          currentPage++
        }
      }
    } else {
      // Fetch single page
      const result = await this.fetchAliases(api, currentPage, filters)
      allAliases = result.aliases || []
    }

    // Output results
    this.outputAliases(allAliases, format)
  }

  /**
   * Format and output aliases based on output format
   */
  private outputAliases(aliases: Alias[], format: 'plain' | 'json' | 'yaml'): void {
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
