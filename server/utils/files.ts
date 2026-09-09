import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

const cache = new Map<string, { mtimeMs: number, value: unknown }>()
const locks = new Map<string, Promise<void>>()

export async function ensureParent(file: string): Promise<void> {
  await mkdir(dirname(file), { recursive: true })
}

export async function readJsonCached<T>(file: string): Promise<T> {
  const info = await stat(file)
  const found = cache.get(file)
  if (found && found.mtimeMs === info.mtimeMs) return found.value as T
  const value = JSON.parse(await readFile(file, 'utf8')) as T
  cache.set(file, { mtimeMs: info.mtimeMs, value })
  return value
}

export async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, 'utf8')) as T
}

export async function readText(file: string): Promise<string> {
  return readFile(file, 'utf8')
}

export async function atomicWrite(file: string, content: string): Promise<void> {
  await ensureParent(file)
  const temp = `${file}.tmp-${process.pid}-${Date.now()}`
  await writeFile(temp, content, 'utf8')
  await rename(temp, file)
  cache.delete(file)
}

export async function atomicWriteJson(file: string, value: unknown): Promise<void> {
  await atomicWrite(file, `${JSON.stringify(value, null, 2)}\n`)
}

export async function withFileLock<T>(file: string, action: () => Promise<T>): Promise<T> {
  const previous = locks.get(file) || Promise.resolve()
  let release!: () => void
  const current = new Promise<void>((resolve) => { release = resolve })
  const queued = previous.then(() => current)
  locks.set(file, queued)
  await previous
  try {
    return await action()
  } finally {
    release()
    if (locks.get(file) === queued) locks.delete(file)
  }
}
