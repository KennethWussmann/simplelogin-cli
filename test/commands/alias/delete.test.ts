import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('alias:delete', () => {
  it('shows help', async () => {
    const {stdout} = await runCommand('alias delete --help')
    expect(stdout).to.contain('Delete an alias by ID')
  })

  it('requires alias-id argument', async () => {
    try {
      await runCommand('alias delete')
      expect.fail('Should have thrown an error for missing alias-id argument')
    } catch (error: any) {
      expect(error.message).to.contain('Missing required arg')
    }
  })

  it('requires authentication', async () => {
    try {
      await runCommand('alias delete 123 --confirm --config /nonexistent/config.yaml')
      expect.fail('Should have thrown an error for missing authentication')
    } catch (error: any) {
      // Should fail with auth error or config file not found
      expect(error.message).to.match(/login|config|not found/i)
    }
  })

  it('works with alias rm', async () => {
    const {stdout} = await runCommand('alias rm --help')
    expect(stdout).to.contain('Delete an alias by ID')
  })
})
