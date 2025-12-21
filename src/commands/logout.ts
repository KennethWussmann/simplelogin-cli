import {BaseCommand} from './base.js'
import {writeConfig} from '../utils/config.js'

export default class Logout extends BaseCommand<typeof Logout> {
  static override hidden = false
  static description = 'Remove API credentials from config'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --format json',
  ]

  static flags = {
    ...BaseCommand.baseFlags,
  }

  async run(): Promise<void> {
    try {
      // Require authentication before logging out
      await this.requireAuth(this.flags.config as string | undefined)

      // Read current config
      const config = this.readConfig()

      // Remove API key but keep URL
      const newConfig = {
        url: config.url,
      }

      // Write updated config
      writeConfig(newConfig, this.flags.config as string | undefined)

      const format = this.getFormat()

      if (format === 'json' || format === 'yaml') {
        this.output({
          success: true,
        })
      } else {
        this.log('Successfully logged out. API key removed from config.')
      }
    } catch (error) {
      if (error instanceof Error) {
        this.outputError(error.message, 'LOGOUT_ERROR')
      } else {
        this.outputError('An unknown error occurred', 'LOGOUT_ERROR')
      }

      this.exit(1)
    }
  }
}
