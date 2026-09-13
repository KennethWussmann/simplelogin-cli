import {confirm} from '@inquirer/prompts'
import {Args, Flags} from '@oclif/core'
import {AliasApi} from 'simplelogin-client'

import {getSimpleLoginConfig} from '../../utils/simplelogin-client.js'
import {BaseCommand} from '../base.js'

export default class AliasDelete extends BaseCommand<typeof AliasDelete> {
  static aliases = ['alias:rm']
  static args = {
    'alias-id': Args.integer({
      description: 'Alias ID to delete',
      required: true,
    }),
  }
static description = 'Delete an alias by ID'
static examples = [
    '<%= config.bin %> <%= command.id %> 123',
    '<%= config.bin %> <%= command.id %> 123 --confirm',
    '<%= config.bin %> <%= command.id %> 123 --format json',
    '<%= config.bin %> alias rm 123 --confirm',
  ]
static flags = {
    ...BaseCommand.baseFlags,
    confirm: Flags.boolean({
      default: false,
      description: 'Skip confirmation prompt',
    }),
  }
static override hidden = false

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
        const confirmed = await confirm({
          default: false,
          message: `Are you sure you want to delete alias ${aliasId}?`,
        })

        if (!confirmed) {
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
          deleted: result.deleted || true,
          success: true,
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
