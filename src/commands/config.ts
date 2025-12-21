import {Flags} from '@oclif/core'
import {BaseCommand} from './base.js'
import {redactApiKey} from '../utils/config.js'

export default class Config extends BaseCommand<typeof Config> {
  static description = 'Display current configuration'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --show-key',
    '<%= config.bin %> <%= command.id %> --format json',
  ]

  static flags = {
    ...BaseCommand.baseFlags,
    'show-key': Flags.boolean({
      description: 'Show full API key (default: redacted)',
      default: false,
    }),
  }

  async run(): Promise<void> {
    try {
      // Read current config (doesn't require auth)
      const config = this.readConfig()
      const configPath = this.getConfigPath()
      const format = this.getFormat()
      const showKey = this.flags['show-key'] as boolean

      // Prepare display config
      const displayConfig = {
        url: config.url || '(not set)',
        apiKey: config.apiKey
          ? (showKey ? config.apiKey : redactApiKey(config.apiKey))
          : '(not set)',
      }

      if (format === 'json' || format === 'yaml') {
        this.output(displayConfig)
      } else {
        this.log(`Config file: ${configPath}`)
        this.log(`URL: ${displayConfig.url}`)
        this.log(`API Key: ${displayConfig.apiKey}`)
      }
    } catch (error) {
      if (error instanceof Error) {
        this.outputError(error.message, 'CONFIG_ERROR')
      } else {
        this.outputError('An unknown error occurred', 'CONFIG_ERROR')
      }

      this.exit(1)
    }
  }
}
