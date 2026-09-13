import {Flags} from '@oclif/core'

import {redactApiKey} from '../utils/config.js'
import {BaseCommand} from './base.js'

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
      default: false,
      description: 'Show full API key (default: redacted)',
    }),
  }

static override hidden = false

  async run(): Promise<void> {
    try {
      // Read current config (doesn't require auth)
      const config = this.readConfig()
      const configPath = this.getConfigPath()
      const format = this.getFormat()
      const isShowKey = this.flags['show-key']

      // Prepare display config
      const displayConfig = {
        apiKey: config.apiKey
          ? (isShowKey ? config.apiKey : redactApiKey(config.apiKey))
          : '(not set)',
        url: config.url ?? '(not set)',
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
