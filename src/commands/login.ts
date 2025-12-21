import {Flags} from '@oclif/core'
import {input, password} from '@inquirer/prompts'
import {AccountApi, Configuration, SimpleLoginConfig} from 'simplelogin-client'
import {BaseCommand} from './base.js'
import {readConfig, redactApiKey, writeConfig} from '../utils/config.js'
import { getAuthenticatedUser, isAuthenticated } from '../utils/simplelogin-client.js'

export default class Login extends BaseCommand<typeof Login> {
  static override hidden = false
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
    const format = this.getFormat()
    const config = readConfig(this.flags.config)
    const user = await getAuthenticatedUser(this.flags.config)
    if (user) {
      const error = "You are already logged in. Use 'sl logout' to log out or 'sl whoami' for more details."
      if (format === 'json' || format === 'yaml') {
        this.output({
          success: false,
          error,
          data: user,
        })
      } else {
        this.log(error)
        this.log(`Email: ${user.email}`)
        this.log(`Premium: ${user.isPremium ? "Yes" : "No"}`)
      }
      this.exit(1)
    }
    try {
      // Get or prompt for URL
      let url = this.flags.url
      if (!url) {
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
          url: basePath,
        },
        this.flags.config,
      )


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
