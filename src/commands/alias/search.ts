import {Args} from '@oclif/core'
import {AliasListBase} from './alias-list-base.js'
import type {AliasApi, AliasModelArray} from 'simplelogin-client'

export default class AliasSearch extends AliasListBase {
  static override hidden = false
  static description = 'Search aliases by email address'

  static examples = [
    '<%= config.bin %> <%= command.id %> myalias',
    '<%= config.bin %> <%= command.id %> "john@" --page 1',
    '<%= config.bin %> <%= command.id %> example --pinned',
    '<%= config.bin %> <%= command.id %> test --all',
    '<%= config.bin %> <%= command.id %> search --format json',
  ]

  static args = {
    query: Args.string({
      description: 'Search query for alias email',
      required: true,
    }),
  }

  private query!: string

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(AliasSearch)
    const format = (flags.format as 'plain' | 'json' | 'yaml') || 'plain'
    // Store query for use in fetchAliases
    this.query = args.query as string
    await this.executeList(format, flags)
  }

  protected async fetchAliases(
    api: AliasApi,
    pageId: number,
    filters: {pinned?: boolean; disabled?: boolean; enabled?: boolean}
  ): Promise<AliasModelArray> {
    return api.searchAliases({
      pageId,
      ...filters,
      aliasSearchPost: {
        query: this.query,
      },
    })
  }
}
