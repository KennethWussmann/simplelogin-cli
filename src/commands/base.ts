import {Command, Flags, Interfaces} from '@oclif/core'
import YAML from 'yaml'
import {readConfig, Config, getConfigPath} from '../utils/config.js'
import { isAuthenticated } from '../utils/simplelogin-client.js'

export type OutputFormat = 'plain' | 'json' | 'yaml'

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<(typeof BaseCommand)['baseFlags'] & T['flags']>
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T['args']>

export abstract class BaseCommand<T extends typeof Command> extends Command {
  // Disable this from being a runnable command
  static hidden = true

  static baseFlags = {
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
  }

  protected flags!: Flags<T>
  protected args!: Args<T>

  public async init(): Promise<void> {
    await super.init()
    const {args, flags} = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      args: this.ctor.args,
      strict: this.ctor.strict,
    })
    this.flags = flags as Flags<T>
    this.args = args as Args<T>
  }

  /**
   * Get the output format from flags
   */
  protected getFormat(): OutputFormat {
    return (this.flags.format as OutputFormat) || 'plain'
  }

  /**
   * Get the config file path from flags
   */
  protected getConfigPath(): string {
    return getConfigPath(this.flags.config as string | undefined)
  }

  /**
   * Read the configuration file
   */
  protected readConfig(): Config {
    return readConfig(this.flags.config as string | undefined)
  }

  /**
   * Output data in the appropriate format
   */
  protected output(data: unknown): void {
    const format = this.getFormat()

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
        // For plain format, data should be a string
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
   * Output an error in the appropriate format
   */
  protected outputError(message: string, code?: string): void {
    const format = this.getFormat()

    if (format === 'json' || format === 'yaml') {
      const errorData = {
        success: false,
        error: {
          code: code || 'ERROR',
          message,
        },
      }
      this.output(errorData)
    } else {
      this.error(message)
    }
  }

  /**
   * Require authentication for this command
   * Throws an error if not authenticated
   */
  protected async requireAuth(configPath?: string): Promise<void> {
    if (!(await isAuthenticated(configPath))) {
      this.outputError('Please run \'sl login\' to authenticate', 'UNAUTHORIZED')
      this.exit(3)
    }
  }
}
