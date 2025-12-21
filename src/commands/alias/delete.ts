import {Args, Flags} from '@oclif/core'
import {BaseCommand} from '../base.js'
import {AliasApi} from 'simplelogin-client'
import {getSimpleLoginConfig} from '../../utils/simplelogin-client.js'
import * as readline from 'node:readline/promises'
import {stdin as input, stdout as output} from 'node:process'

export default class AliasDelete extends BaseCommand<typeof AliasDelete> {
  static description = 'Delete an alias by ID'

  static examples = [
    '<%= config.bin %> <%= command.id %> 123',
    '<%= config.bin %> <%= command.id %> 123 --confirm',
    '<%= config.bin %> <%= command.id %> 123 --format json',
    '<%= config.bin %> alias rm 123 --confirm',
  ]

  static aliases = ['alias:rm']

  static args = {
    'alias-id': Args.integer({
      description: 'Alias ID to delete',
      required: true,
    }),
  }

  static flags = {
    ...BaseCommand.baseFlags,
    confirm: Flags.boolean({
      description: 'Skip confirmation prompt',
      default: false,
    }),
  }

  async run(): Promise<void> {
    try {
      const {args, flags} = await this.parse(AliasDelete)
      const aliasId = args['alias-id'] as number
      const format = this.getFormat()
      const shouldConfirm = flags.confirm as boolean

      // Require authentication
      await this.requireAuth(flags.config as string | undefined)

      // If not confirmed, prompt for confirmation (skip in json/yaml mode)
      if (!shouldConfirm && format === 'plain') {
        const rl = readline.createInterface({input, output})
        const answer = await rl.question(`Are you sure you want to delete alias ${aliasId}? (y/N): `)
        rl.close()

        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
          this.log('Deletion cancelled.')
          return
        }
      }

      // Initialize API client
      const config = await getSimpleLoginConfig(flags.config as string | undefined)
      const api = new AliasApi(config)

      // Delete the alias
      const result = await api.deleteAlias({
        aliasId,
      })

      // Output result
      if (format === 'json' || format === 'yaml') {
        this.output({
          success: true,
          deleted: result.deleted || true,
        })
      } else {
        this.log(`Alias ${aliasId} deleted successfully.`)
      }
    } catch (error) {
      if (error instanceof Error) {
        this.outputError(error.message, 'API_ERROR')
      } else {
        this.outputError('An unknown error occurred', 'API_ERROR')
      }

      this.exit(4)
    }
  }
}
