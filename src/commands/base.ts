import {Command, Flags, type Interfaces} from '@oclif/core'
import YAML from 'yaml'

import {type Config, getConfigPath, readConfig} from '../utils/config.js'
import { isAuthenticated } from '../utils/simplelogin-client.js'

export type OutputFormat = 'json' | 'plain' | 'yaml'

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<(typeof BaseCommand)['baseFlags'] & T['flags']>
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T['args']>

export abstract class BaseCommand<T extends typeof Command> extends Command {
  static baseFlags = {
    config: Flags.string({
      default: undefined,
      description: 'Path to config file containing credentials',
      env: 'SIMPLELOGIN_CONFIG',
    }),
    format: Flags.string({
      default: 'plain',
      description: 'Output format',
      options: ['plain', 'json', 'yaml'],
    }),
  }

// Disable this from being a runnable command
  static hidden = true
protected args!: Args<T>
  protected flags!: Flags<T>

  /**
   * Get the config file path from flags
   */
  protected getConfigPath(): string {
    return getConfigPath(this.flags.config)
  }

  /**
   * Get the output format from flags
   */
  protected getFormat(): OutputFormat {
    return (this.flags.format as OutputFormat) || 'plain'
  }

  public async init(): Promise<void> {
    await super.init()
    const {args, flags} = await this.parse({
      args: this.ctor.args,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      flags: this.ctor.flags,
      strict: this.ctor.strict,
    })
    this.flags = flags as Flags<T>
    this.args = args as Args<T>
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

      case 'plain': {
        // For plain format, data should be a string
        if (typeof data === 'string') {
          this.log(data)
        } else {
          this.log(JSON.stringify(data, null, 2))
        }

        break
      }

      case 'yaml': {
        this.log(YAML.stringify(data))
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
        error: {
          code: code ?? 'ERROR',
          message,
        },
        success: false,
      }
      this.output(errorData)
    } else {
      this.error(message)
    }
  }

  /**
   * Read the configuration file
   */
  protected readConfig(): Config {
    return readConfig(this.flags.config)
  }

  /**
   * Require authentication for this command
   * Throws an error if not authenticated
   */
  protected async requireAuth(configPath?: string): Promise<void> {
    if ((await isAuthenticated(configPath))) {
    	return;
    }

    this.outputError('Please run \'sl login\' to authenticate', 'UNAUTHORIZED')
    this.exit(3)
  }
}
