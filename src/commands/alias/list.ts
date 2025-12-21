import {AliasListBase} from './alias-list-base.js'
import type {AliasApi, AliasModelArray} from 'simplelogin-client'

export default class AliasList extends AliasListBase {
  static description = 'List all aliases with pagination'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --page 1',
    '<%= config.bin %> <%= command.id %> --pinned',
    '<%= config.bin %> <%= command.id %> --disabled',
    '<%= config.bin %> <%= command.id %> --enabled',
    '<%= config.bin %> <%= command.id %> --all',
    '<%= config.bin %> <%= command.id %> --format json',
  ]

  static aliases = ['alias:ls']

  public async run(): Promise<void> {
    const {flags} = await this.parse(AliasList)
    const format = (flags.format as 'plain' | 'json' | 'yaml') || 'plain'
    await this.executeList(format, flags)
  }

  protected async fetchAliases(
    api: AliasApi,
    pageId: number,
    filters: {pinned?: boolean; disabled?: boolean; enabled?: boolean}
  ): Promise<AliasModelArray> {
    return api.getAliases({
      pageId,
      ...filters,
    })
  }
}
