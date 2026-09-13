import {Args, Flags} from '@oclif/core'
import {type Alias, type AliasApi} from 'simplelogin-client'

import {AliasCreateBase} from './alias-create-base.js'

export default class AliasCreateCustom extends AliasCreateBase {
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

static description = 'Create a custom alias with specific prefix and suffix'
static examples = [
    '<%= config.bin %> <%= command.id %> myprefix signed_suffix --mailbox-ids 1,2',
    '<%= config.bin %> <%= command.id %> john suffix123 --note "Work email to my default mailbox"',
    '<%= config.bin %> <%= command.id %> support suffix456 --mailbox-ids 1 --name "Support" --hostname example.com',
    '<%= config.bin %> <%= command.id %> custom suffix789 --mailbox-ids 1,2,3 --format json',
  ]

static flags = {
    ...AliasCreateBase.flags,
    'mailbox-ids': Flags.string({
      description: 'Comma-separated mailbox IDs. Default if not specified.',
    }),
    name: Flags.string({
      description: 'Display name',
    }),
  }

static override hidden = false
private mailboxIds!: number[]
  private name?: string
  private prefix!: string
  private suffix!: string

  protected async createAlias(
    api: AliasApi,
    params: {hostname?: string; note?: string;}
  ): Promise<Alias> {
    return api.createCustomAlias({
      aliasCustomNewPost: {
        aliasPrefix: this.prefix,
        mailboxIds: this.mailboxIds,
        name: this.name,
        note: params.note,
        signedSuffix: this.suffix,
      },
      hostname: params.hostname,
    })
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(AliasCreateCustom)
    const format = (flags.format as 'json' | 'plain' | 'yaml') || 'plain'

    // Store args and additional flags for use in createAlias
    this.prefix = args.prefix
    this.suffix = args.suffix
    this.name = flags.name

    // Parse mailbox IDs
    try {
      const mailboxIdStr = flags['mailbox-ids']
      this.mailboxIds = mailboxIdStr ? mailboxIdStr.split(',').map(id => {
          const parsed = Number(id.trim())
          if (Number.isNaN(parsed)) {
            throw new TypeError(`Invalid mailbox ID: ${id}`)
          }

          return parsed
        }) : [(await this.getDefaultMailbox()).id];

      if (this.mailboxIds.length === 0) {
        throw new Error('At least one mailbox ID is required')
      }
    } catch (error) {
      this.outputError(error instanceof Error ? error.message : 'Invalid mailbox IDs', 'INVALID_ARGUMENTS', format)
      this.exit(2)
    }

    await this.executeCreate(format, flags)
  }
}
