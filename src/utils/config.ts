import {existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {homedir} from 'node:os'
import YAML from 'yaml'

export interface Config {
  url?: string
  apiKey?: string
}

export const DEFAULT_CONFIG_PATH = join(homedir(), '.config', 'simplelogin-cli', 'config.yaml')


/**
 * Get the config file path, using the provided path or the default
 */
export function getConfigPath(configPath?: string): string {
  return configPath || DEFAULT_CONFIG_PATH
}

/**
 * Read configuration from the config file
 */
export function readConfig(configPath?: string): Config {
  const path = getConfigPath(configPath)

  if (!existsSync(path)) {
    return {}
  }

  try {
    const content = readFileSync(path, 'utf8')
    return YAML.parse(content) || {}
  } catch (error) {
    throw new Error(`Failed to read config file: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Write configuration to the config file
 * Creates the directory if it doesn't exist and sets proper permissions
 */
export function writeConfig(config: Config, configPath?: string): void {
  const path = getConfigPath(configPath)
  const dir = dirname(path)

  // Create directory if it doesn't exist
  if (!existsSync(dir)) {
    mkdirSync(dir, {recursive: true, mode: 0o700})
  }

  try {
    const content = YAML.stringify(config)
    writeFileSync(path, content, {mode: 0o600})

    // Ensure permissions are set correctly even if file already existed
    chmodSync(path, 0o600)
  } catch (error) {
    throw new Error(`Failed to write config file: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Redact an API key for display (show only first 8 characters)
 */
export function redactApiKey(apiKey: string): string {
  return "******"
}