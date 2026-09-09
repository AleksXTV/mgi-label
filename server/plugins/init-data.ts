import { mkdir, access } from 'node:fs/promises'
import { dataPath, getDataDir } from '../utils/paths'
import { atomicWriteJson } from '../utils/files'

async function ensureJson(file: string, value: unknown) {
  try { await access(file) } catch { await atomicWriteJson(file, value) }
}

export default defineNitroPlugin(async () => {
  await mkdir(getDataDir(), { recursive: true })
  await mkdir(dataPath('pages'), { recursive: true })
  await mkdir(dataPath('images'), { recursive: true })
  await mkdir(dataPath('config'), { recursive: true })
  await ensureJson(dataPath('config', 'admin.json'), { username: 'Admin', password: '12345' })
  await ensureJson(dataPath('config', 'telegram.json'), { botToken: '', recipients: [] })
  await ensureJson(dataPath('messages.json'), [])
})
