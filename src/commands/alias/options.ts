import {Command, Flags} from '@oclif/core'
import {AliasApi, AliasOptions} from 'simplelogin-client'
import {getSimpleLoginConfig} from '../../utils/simplelogin-client.js'
import YAML from 'yaml'

export default class AliasOptionsCommand extends Command {
  static override hidden = false
  static description = 'Get available options for creating aliases'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --hostname example.com',
    '<%= config.bin %> <%= command.id %> --domain mydomain.com',
    '<%= config.bin %> <%= command.id %> --custom',
    '<%= config.bin %> <%= command.id %> --premium',
    '<%= config.bin %> <%= command.id %> --prefix',
    '<%= config.bin %> <%= command.id %> --custom --domain mydomain.com',
    '<%= config.bin %> <%= command.id %> --format json',
  ]

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
    hostname: Flags.string({
      description: 'Get options for specific hostname',
    }),
    domain: Flags.string({
      description: 'Filter options for specific mail domain',
    }),
    custom: Flags.boolean({
      description: 'Filter options for custom ones',
    }),
    premium: Flags.boolean({
      description: 'Filter options for premium ones',
    }),
    prefix: Flags.boolean({
      description: 'Filter options for those that have a prefix in front of their suffix before the @',
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(AliasOptionsCommand)
    const format = (flags.format as 'plain' | 'json' | 'yaml') || 'plain'

    try {
      // Require authentication
      await this.requireAuth(flags.config as string | undefined)

      // Get API client
      const config = await getSimpleLoginConfig(flags.config as string | undefined)
      const api = new AliasApi(config)

      // Fetch alias options
      let options = await api.getAliasOptions({
        hostname: flags.hostname as string | undefined,
      })

      // Apply client-side filtering
      let filteredSuffixes = options.suffixes

      // Filter by domain if specified
      if (flags.domain) {
        const domainFilter = flags.domain as string
        filteredSuffixes = filteredSuffixes.filter((suffix) => suffix.suffix.endsWith(`@${domainFilter}`))
      }

      // Filter by custom if specified
      if (flags.custom) {
        filteredSuffixes = filteredSuffixes.filter((suffix) => suffix.isCustom === true)
      }

      // Filter by premium if specified
      if (flags.premium) {
        filteredSuffixes = filteredSuffixes.filter((suffix) => suffix.isPremium === true)
      }

      // Filter by prefix if specified
      if (flags.prefix) {
        filteredSuffixes = filteredSuffixes.filter((suffix) => {
          // Check if suffix has a dot before the @ (e.g., ".something@domain.com")
          const atIndex = suffix.suffix.indexOf('@')
          if (atIndex > 0) {
            const beforeAt = suffix.suffix.substring(0, atIndex)
            return beforeAt.includes('.')
          }

          return false
        })
      }

      // Update options with filtered suffixes
      options = {
        ...options,
        suffixes: filteredSuffixes,
      }

      // Output results
      this.outputOptions(options, format)
    } catch (error: any) {
      const message = error.message || 'An error occurred while fetching alias options'
      this.outputError(message, 'API_ERROR', format)
      this.exit(4)
    }
  }

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
   * Format and output alias options based on output format
   */
  protected outputOptions(options: AliasOptions, format: 'plain' | 'json' | 'yaml'): void {
    if (format === 'json' || format === 'yaml') {
      // Return full AliasOptions object
      this.outputData(options, format)
    } else {
      // Plain format - display key details
      const lines = ['Alias Options']

      // Show whether user can create new aliases
      lines.push(`Can Create: ${options.canCreate ? 'Yes' : 'No'}`)

      // Show prefix suggestion
      lines.push(`\nPrefix Suggestion: ${options.prefixSuggestion}`)

      // Show available suffixes
      if (options.suffixes && options.suffixes.length > 0) {
        lines.push('\nAvailable Suffixes:')
        for (const suffix of options.suffixes) {
          const tags: string[] = []
          if (suffix.isCustom) tags.push('custom')
          if (suffix.isPremium) tags.push('premium')
          const tagString = tags.length > 0 ? ` (${tags.join(', ')})` : ''
          lines.push(`  ${suffix.suffix}${tagString}`)
        }
      } else {
        lines.push('\nNo suffixes available')
      }

      this.log(lines.join('\n'))
    }
  }
}
