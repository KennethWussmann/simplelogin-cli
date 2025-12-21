import {Flags} from '@oclif/core'
import {input, password} from '@inquirer/prompts'
import {AccountApi, Configuration, SimpleLoginConfig} from 'simplelogin-client'
import {BaseCommand} from './base.js'
import {readConfig, redactApiKey, writeConfig} from '../utils/config.js'

export default class Login extends BaseCommand<typeof Login> {
  static description = 'Authenticate with SimpleLogin and store credentials'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --url https://app.simplelogin.io',
    '<%= config.bin %> <%= command.id %> --key api-key',
  ]

  static flags = {
    ...BaseCommand.baseFlags,
    device: Flags.string({
      description: 'Device name for the API key',
      default: 'simplelogin-cli',
    }),
    key: Flags.string({
      description: 'API key (prefer interactive prompt for security)',
    }),
    url: Flags.string({
      description: 'SimpleLogin instance URL (e.g., https://app.simplelogin.io)',
    }),
  }

  async run(): Promise<void> {
    try {
      // Get or prompt for URL
      let url = this.flags.url
      if (!url) {
        const config = readConfig(this.flags.config)
        url = config.url
      }

      if (!url) {
        url = await input({
          message: 'Enter SimpleLogin instance URL:',
          default: 'https://app.simplelogin.io',
          validate: (value) => {
            if (!value) return 'URL is required'
            try {
              new URL(value)
              return true
            } catch {
              return 'Please enter a valid URL'
            }
          },
        })
      }

      // Ensure URL doesn't end with trailing slash
      url = url.replace(/\/$/, '')

      // Get or prompt for api key
      let key = this.flags.key
      if (!key) {
        key = await password({
          message: 'Enter your API key:',
          mask: '*',
          validate: (value) => {
            if (!value) return 'API key is required'
            return true
          },
        })
      }

      const basePath = `${url}/api`
      const slConfig = new SimpleLoginConfig({ apiKey: key, basePath })
      const accountApi = new AccountApi(slConfig)
      const info = await accountApi.getUserInfo()

      // Store configuration
      writeConfig(
        {
          apiKey: key,
          url,
        },
        this.flags.config,
      )

      // Output success message
      const format = this.getFormat()

      if (format === 'json' || format === 'yaml') {
        this.output({
          success: true,
          config: {
            apiKey: redactApiKey(key),
            url:basePath,
          },
          data: info
        })
      } else {
        this.log(`Hello ${info.name}! Your login was successful.`)
        this.log(`URL: ${basePath}`)
        this.log(`API Key: ${redactApiKey(key)}`)
        this.log(`Email: ${info.email}`)
        this.log(`Premium: ${info.isPremium ? "Yes" : "No"}`)
        this.log(`\nConfiguration saved to: ${this.getConfigPath()}`)
      }
    } catch (error) {
      if (error instanceof Error) {
        this.outputError(error.message, 'LOGIN_ERROR')
      } else {
        this.outputError('An unknown error occurred during login', 'LOGIN_ERROR')
      }

      this.exit(1)
    }
  }
}
