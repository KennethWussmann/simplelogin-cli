import type {AliasApi, AliasModelArray} from 'simplelogin-client'

import {AliasListBase} from './alias-list-base.js'

export default class AliasList extends AliasListBase {
  static aliases = ['alias:ls']
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

static override hidden = false

  protected async fetchAliases(
    api: AliasApi,
    pageId: number,
    filters: {disabled?: boolean; enabled?: boolean; pinned?: boolean;}
  ): Promise<AliasModelArray> {
    return api.getAliases({
      pageId,
      ...filters,
    })
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(AliasList)
    const format = (flags.format as 'json' | 'plain' | 'yaml') || 'plain'
    await this.executeList(format, flags)
  }
}
