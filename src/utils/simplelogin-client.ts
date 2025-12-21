
import { AccountApi, SimpleLoginConfig, UserInfo } from 'simplelogin-client'
import { readConfig } from './config.js'

let simpleLoginConfig: SimpleLoginConfig | null = null


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

export async function getAuthenticatedUser(configPath?: string): Promise<UserInfo| null> {
    try {
        const client = new AccountApi(await getSimpleLoginConfig(configPath))
        return await client.getUserInfo()
    } catch (e) {
        console.error(e)
        return null
    }
} 


export async function isAuthenticated(configPath?: string): Promise<boolean> {
    try {
        const user = await getAuthenticatedUser(configPath)
        if (user) {
            return true
        }
        return false
    } catch {
        return false
    }
}

export async function requireAuth(configPath?: string): Promise<void> {
    if (!(await isAuthenticated(configPath))) {
        throw new Error("User unauthenticated. Use sl login to authenticate.")
    }
} 

