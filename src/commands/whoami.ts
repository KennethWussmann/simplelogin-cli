import {BaseCommand} from './base.js'
import {getAuthenticatedUser} from '../utils/simplelogin-client.js'

export default class Whoami extends BaseCommand<typeof Whoami> {
  static description = 'Check the authenticated user'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --format json',
  ]

  static flags = {
    ...BaseCommand.baseFlags,
  }

  async run(): Promise<void> {
    try {
      const user = await getAuthenticatedUser(this.flags.config)

      if (!user) {
        this.outputError('User unauthenticated. Use sl login to authenticate.', 'UNAUTHORIZED')
        this.exit(3)
      }

      const format = this.getFormat()

      if (format === 'json' || format === 'yaml') {
        this.output({
          data: user,
          success: true,
        })
      } else {
        this.log(`Name: ${user.name || '(not set)'}`)
        this.log(`Email: ${user.email}`)
        this.log(`Premium: ${user.isPremium ? 'Yes' : 'No'}`)
        if (user.inTrial !== undefined) {
          this.log(`Trial: ${user.inTrial ? 'Yes' : 'No'}`)
        }

        if (user.maxAliasFreePlan !== undefined) {
          this.log(`Max aliases (free plan): ${user.maxAliasFreePlan}`)
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        this.outputError(error.message, 'WHOAMI_ERROR')
      } else {
        this.outputError('An unknown error occurred', 'WHOAMI_ERROR')
      }

      this.exit(1)
    }
  }
}
