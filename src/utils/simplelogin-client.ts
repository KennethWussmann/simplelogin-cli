
import { AccountApi, SimpleLoginConfig, type UserInfo } from 'simplelogin-client'

import { readConfig } from './config.js'

let simpleLoginConfig: SimpleLoginConfig | undefined


export async function getSimpleLoginConfig(configPath?: string): Promise<SimpleLoginConfig> {
  if (simpleLoginConfig) {
    return simpleLoginConfig
  }

  const config = readConfig(configPath)
  if (!config.apiKey) {
    throw new Error("User unauthenticated. Use sl login to authenticate.")
  }

  simpleLoginConfig = new SimpleLoginConfig({
    apiKey: config.apiKey,
    basePath: config.url
  })
  return simpleLoginConfig
}

export async function getAuthenticatedUser(configPath?: string): Promise<undefined| UserInfo> {
    try {
        const client = new AccountApi(await getSimpleLoginConfig(configPath))
        return await client.getUserInfo()
    } catch (error) {
        console.error(error)
        return undefined
    }
} 


export async function isAuthenticated(configPath?: string): Promise<boolean> {
    try {
        const user = await getAuthenticatedUser(configPath)
        return Boolean(user);
    } catch {
        return false
    }
}

export async function requireAuth(configPath?: string): Promise<void> {
    if (!(await isAuthenticated(configPath))) {
        throw new Error("User unauthenticated. Use sl login to authenticate.")
    }
} 

