import {Args, Flags} from '@oclif/core'
import {AliasCreateBase} from './alias-create-base.js'
import type {AliasApi, Alias} from 'simplelogin-client'

export default class AliasCreateCustom extends AliasCreateBase {
  static override hidden = false
  static description = 'Create a custom alias with specific prefix and suffix'

  static examples = [
    '<%= config.bin %> <%= command.id %> myprefix signed_suffix --mailbox-ids 1,2',
    '<%= config.bin %> <%= command.id %> john suffix123 --mailbox-ids 1 --note "Work email"',
    '<%= config.bin %> <%= command.id %> support suffix456 --mailbox-ids 1 --name "Support" --hostname example.com',
    '<%= config.bin %> <%= command.id %> custom suffix789 --mailbox-ids 1,2,3 --format json',
  ]

  static aliases = ['alias:custom']

  static args = {
    prefix: Args.string({
      description: 'Alias prefix (local part)',
      required: true,
    }),
    suffix: Args.string({
      description: 'Signed suffix from alias options',
      required: true,
    }),
  }

  static flags = {
    ...AliasCreateBase.flags,
    'mailbox-ids': Flags.string({
      description: 'Comma-separated mailbox IDs',
      required: true,
    }),
    name: Flags.string({
      description: 'Display name',
    }),
  }

  private prefix!: string
  private suffix!: string
  private mailboxIds!: number[]
  private name?: string

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(AliasCreateCustom)
    const format = (flags.format as 'plain' | 'json' | 'yaml') || 'plain'

    // Store args and additional flags for use in createAlias
    this.prefix = args.prefix as string
    this.suffix = args.suffix as string
    this.name = flags.name as string | undefined

    // Parse mailbox IDs
    try {
      const mailboxIdStr = flags['mailbox-ids'] as string
      this.mailboxIds = mailboxIdStr.split(',').map(id => {
        const parsed = Number.parseInt(id.trim(), 10)
        if (Number.isNaN(parsed)) {
          throw new Error(`Invalid mailbox ID: ${id}`)
        }

        return parsed
      })

      if (this.mailboxIds.length === 0) {
        throw new Error('At least one mailbox ID is required')
      }
    } catch (error: any) {
      this.outputError(error.message || 'Invalid mailbox IDs', 'INVALID_ARGUMENTS', format)
      this.exit(2)
    }

    await this.executeCreate(format, flags)
  }

  protected async createAlias(
    api: AliasApi,
    params: {note?: string; hostname?: string}
  ): Promise<Alias> {
    return api.createCustomAlias({
      aliasCustomNewPost: {
        aliasPrefix: this.prefix,
        signedSuffix: this.suffix,
        mailboxIds: this.mailboxIds,
        note: params.note,
        name: this.name,
      },
      hostname: params.hostname,
    })
  }
}
