import { readdir, stat } from 'node:fs/promises'
import { requireAdmin } from '../../utils/auth'
import { dataPath } from '../../utils/paths'
import { imageUsages } from '../../utils/images'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const dir = dataPath('images')
  const names = await readdir(dir)
  const items = []
  for (const name of names.sort()) {
    const info = await stat(dataPath('images', name))
    if (!info.isFile()) continue
    items.push({ name, size: info.size, usages: await imageUsages(name) })
  }
  return items
})
