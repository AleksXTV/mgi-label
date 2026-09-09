import { createError, readBody } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { atomicWrite } from '../../utils/files'
import { dataPath } from '../../utils/paths'
import { validateEditable } from '../../utils/validation'

function resolveFile(name: string): string {
  if (name === 'site.json') return dataPath('site.json')
  const match = /^pages\/([a-z0-9_-]+)\.json$/.exec(name)
  if (match) return dataPath('pages', `${match[1]}.json`)
  throw createError({ statusCode: 400, statusMessage: 'File is not editable' })
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody<{ file?: string, content?: string }>(event)
  const file = String(body?.file || '')
  const content = String(body?.content || '')
  let parsed: unknown
  try { parsed = JSON.parse(content) } catch (error: any) { throw createError({ statusCode: 400, statusMessage: error?.message || 'Invalid JSON' }) }
  const issues = validateEditable(file, parsed)
  if (issues.length) throw createError({ statusCode: 400, statusMessage: 'Validation failed', data: { issues } })
  await atomicWrite(resolveFile(file), `${JSON.stringify(parsed, null, 2)}\n`)
  return { ok: true }
})
