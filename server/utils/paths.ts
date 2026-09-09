import { resolve, join } from 'node:path'

export function getDataDir(): string {
  return process.env.MGI_DATA_DIR ? resolve(process.env.MGI_DATA_DIR) : resolve(process.cwd(), 'data')
}

export function dataPath(...parts: string[]): string {
  return join(getDataDir(), ...parts)
}
