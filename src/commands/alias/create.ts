import {Flags} from '@oclif/core'
import {AliasCreateBase} from './alias-create-base.js'
import type {AliasApi, Alias} from 'simplelogin-client'

export default class AliasCreate extends AliasCreateBase {
  static description = 'Create a new random alias'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --note "My test alias"',
    '<%= config.bin %> <%= command.id %> --hostname example.com',
    '<%= config.bin %> <%= command.id %> --mode uuid',
    '<%= config.bin %> <%= command.id %> --mode word --note "Shopping" --format json',
  ]

  static flags = {
    ...AliasCreateBase.flags,
    mode: Flags.string({
      description: 'Generation mode (uuid or word-based)',
      options: ['uuid', 'word'],
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(AliasCreate)
    const format = (flags.format as 'plain' | 'json' | 'yaml') || 'plain'
    await this.executeCreate(format, flags)
  }

  protected async createAlias(
    api: AliasApi,
    params: {note?: string; hostname?: string}
  ): Promise<Alias> {
    const {flags} = await this.parse(AliasCreate)

    return api.createRandomAlias({
      aliasRandomNewPost: {
        note: params.note,
      },
      hostname: params.hostname,
      mode: flags.mode as 'uuid' | 'word' | undefined,
    })
  }
}
