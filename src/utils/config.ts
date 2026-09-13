import {chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {homedir} from 'node:os'
import nodePath from 'node:path'
import YAML from 'yaml'

export type Config = {
  apiKey?: string
  url?: string
}

export const DEFAULT_CONFIG_PATH = nodePath.join(homedir(), '.config', 'simplelogin-cli', 'config.yaml')


/**
 * Get the config file path, using the provided path or the default
 */
export function getConfigPath(configPath?: string): string {
  return configPath ?? DEFAULT_CONFIG_PATH
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
    return (YAML.parse(content) as Config | undefined  ) ?? {}
  } catch (error) {
    throw new Error(`Failed to read config file: ${error instanceof Error ? error.message : String(error)}`, {cause: error})
  }
}

/**
 * Write configuration to the config file
 * Creates the directory if it doesn't exist and sets proper permissions
 */
export function writeConfig(config: Config, configPath?: string): void {
  const path = getConfigPath(configPath)
  const dir = nodePath.dirname(path)

  // Create directory if it doesn't exist
  if (!existsSync(dir)) {
    mkdirSync(dir, {mode: 0o700, recursive: true})
  }

  try {
    const content = YAML.stringify(config)
    writeFileSync(path, content, {mode: 0o600})

    // Ensure permissions are set correctly even if file already existed
    chmodSync(path, 0o600)
  } catch (error) {
    throw new Error(`Failed to write config file: ${error instanceof Error ? error.message : String(error)}`, {cause: error})
  }
}

/**
 * Redact an API key for display (show only first 8 characters)
 */
export function redactApiKey(_apiKey: string): string {
  return "******"
}