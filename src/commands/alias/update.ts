import {Args, Flags} from '@oclif/core'
import {BaseCommand} from '../base.js'
import {AliasApi} from 'simplelogin-client'
import {getSimpleLoginConfig} from '../../utils/simplelogin-client.js'

export default class AliasUpdate extends BaseCommand<typeof AliasUpdate> {
  static override hidden = false
  static description = 'Update alias settings'

  static examples = [
    '<%= config.bin %> <%= command.id %> 123 --note "Updated note"',
    '<%= config.bin %> <%= command.id %> 123 --name "My Alias"',
    '<%= config.bin %> <%= command.id %> 123 --mailbox-id 456',
    '<%= config.bin %> <%= command.id %> 123 --mailbox-ids "456,789"',
    '<%= config.bin %> <%= command.id %> 123 --pinned',
    '<%= config.bin %> <%= command.id %> 123 --disable-pgp',
    '<%= config.bin %> <%= command.id %> 123 --note "Shopping" --pinned --format json',
  ]

  static args = {
    'alias-id': Args.integer({
      description: 'Alias ID',
      required: true,
    }),
  }

  static flags = {
    ...BaseCommand.baseFlags,
    note: Flags.string({
      description: 'Update note',
    }),
    name: Flags.string({
      description: 'Update display name',
    }),
    'mailbox-id': Flags.integer({
      description: 'Change primary mailbox',
    }),
    'mailbox-ids': Flags.string({
      description: 'Comma-separated mailbox IDs',
    }),
    pinned: Flags.boolean({
      description: 'Pin/unpin alias',
    }),
    'disable-pgp': Flags.boolean({
      description: 'Disable/enable PGP',
    }),
  }

  async run(): Promise<void> {
    try {
      const {args, flags} = await this.parse(AliasUpdate)
      const aliasId = args['alias-id'] as number
      const format = this.getFormat()

      // Validate that at least one optional parameter is provided
      const hasOptionalParam =
        flags.note !== undefined ||
        flags.name !== undefined ||
        flags['mailbox-id'] !== undefined ||
        flags['mailbox-ids'] !== undefined ||
        flags.pinned !== undefined ||
        flags['disable-pgp'] !== undefined

      if (!hasOptionalParam) {
        this.outputError(
          'At least one optional parameter must be provided (--note, --name, --mailbox-id, --mailbox-ids, --pinned, or --disable-pgp)',
          'INVALID_ARGUMENTS'
        )
        this.exit(2)
      }

      // Require authentication
      await this.requireAuth(flags.config as string | undefined)

      // Initialize API client
      const config = await getSimpleLoginConfig(flags.config as string | undefined)
      const api = new AliasApi(config)

      // Build update payload
      const updatePayload: {
        note?: string
        name?: string
        mailboxId?: number
        mailboxIds?: number[]
        pinned?: boolean
        disablePgp?: boolean
      } = {}

      if (flags.note !== undefined) {
        updatePayload.note = flags.note as string
      }

      if (flags.name !== undefined) {
        updatePayload.name = flags.name as string
      }

      if (flags['mailbox-id'] !== undefined) {
        updatePayload.mailboxId = flags['mailbox-id'] as number
      }

      if (flags['mailbox-ids'] !== undefined) {
        const mailboxIdsStr = flags['mailbox-ids'] as string
        updatePayload.mailboxIds = mailboxIdsStr.split(',').map(id => Number.parseInt(id.trim(), 10))
      }

      if (flags.pinned !== undefined) {
        updatePayload.pinned = flags.pinned as boolean
      }

      if (flags['disable-pgp'] !== undefined) {
        updatePayload.disablePgp = flags['disable-pgp'] as boolean
      }

      // Update the alias
      await api.updateAlias({
        aliasId,
        aliasAliasIdPatch: updatePayload,
      })

      // Output result
      if (format === 'json' || format === 'yaml') {
        this.output({
          success: true,
        })
      } else {
        this.log(`Alias ${aliasId} updated successfully.`)
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
