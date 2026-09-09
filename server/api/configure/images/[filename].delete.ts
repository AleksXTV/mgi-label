import { unlink } from 'node:fs/promises'
import { createError, getQuery, getRouterParam } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { dataPath } from '../../../utils/paths'
import { imageUsages } from '../../../utils/images'
import { isSafeImageFilename } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const filename = decodeURIComponent(getRouterParam(event, 'filename') || '')
  if (!isSafeImageFilename(filename)) throw createError({ statusCode: 400, statusMessage: 'Invalid filename' })
  const usages = await imageUsages(filename)
  const force = String(getQuery(event).force || '') === '1'
  if (usages.length && !force) return { ok: false, requiresConfirmation: true, usages }
  try { await unlink(dataPath('images', filename)) } catch { throw createError({ statusCode: 404, statusMessage: 'Image not found' }) }
  return { ok: true, usages }
})
