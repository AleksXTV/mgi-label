import { createError, getQuery } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { readText } from '../../utils/files'
import { dataPath } from '../../utils/paths'

function resolveFile(name: string): string {
  if (name === 'site.json') return dataPath('site.json')
  const match = /^pages\/([a-z0-9_-]+)\.json$/.exec(name)
  if (match) return dataPath('pages', `${match[1]}.json`)
  throw createError({ statusCode: 400, statusMessage: 'File is not editable' })
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const file = String(getQuery(event).file || '')
  return { file, content: await readText(resolveFile(file)) }
})
