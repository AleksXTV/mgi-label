import { readBody } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { validateEditable } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody<{ file?: string, content?: string }>(event)
  const file = String(body?.file || '')
  const content = String(body?.content || '')
  try {
    const parsed = JSON.parse(content)
    const issues = validateEditable(file, parsed)
    return { valid: issues.length === 0, issues }
  } catch (error: any) {
    return { valid: false, issues: [{ path: '$', message: error?.message || 'Invalid JSON' }] }
  }
})
