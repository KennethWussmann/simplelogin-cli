import {input, password} from '@inquirer/prompts'
import {Flags} from '@oclif/core'
import {AccountApi, SimpleLoginConfig} from 'simplelogin-client'

import {readConfig, redactApiKey, writeConfig} from '../utils/config.js'
import { getAuthenticatedUser } from '../utils/simplelogin-client.js'
import {BaseCommand} from './base.js'

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
      default: 'simplelogin-cli',
      description: 'Device name for the API key',
    }),
    key: Flags.string({
      description: 'API key (prefer interactive prompt for security)',
    }),
    url: Flags.string({
      description: 'SimpleLogin instance URL (e.g., https://app.simplelogin.io)',
    }),
  }
static override hidden = false

  async run(): Promise<void> {
    const format = this.getFormat()
    const config = readConfig(this.flags.config)
    const user = await getAuthenticatedUser(this.flags.config)
    if (user) {
      const error = "You are already logged in. Use 'sl logout' to log out or 'sl whoami' for more details."
      if (format === 'json' || format === 'yaml') {
        this.output({
          data: user,
          error,
          success: false,
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
      let {url} = this.flags
      if (!url) {
        url = config.url
      }

      if (!url) {
        url = await input({
          default: 'https://app.simplelogin.io',
          message: 'Enter SimpleLogin instance URL:',
          validate(value) {
            if (!value) return 'URL is required'
            try {
              return Boolean(new URL(value))
            } catch {
              return 'Please enter a valid URL'
            }
          },
        })
      }

      // Ensure URL doesn't end with trailing slash
      url = url.replace(/\/$/, '')

      // Get or prompt for api key
      let {key} = this.flags
      if (!key) {
        key = await password({
          mask: '*',
          message: 'Enter your API key:',
          validate(value) {
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
          config: {
            apiKey: redactApiKey(key),
            url:basePath,
          },
          data: info,
          success: true
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
