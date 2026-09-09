import { access, writeFile } from 'node:fs/promises'
import { createError, readMultipartFormData } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { dataPath } from '../../utils/paths'
import { imageExtensions } from '../../utils/validation'
import { normalizeUploadName, validateSvg } from '../../utils/images'

const MAX_BYTES = 10 * 1024 * 1024

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const parts = await readMultipartFormData(event)
  const file = parts?.find((part) => part.name === 'file' && part.filename)
  if (!file?.filename || !file.data) throw createError({ statusCode: 400, statusMessage: 'Image file is required' })
  if (file.data.length > MAX_BYTES) throw createError({ statusCode: 413, statusMessage: 'Maximum image size is 10 MB' })
  let name: string
  try { name = normalizeUploadName(file.filename) } catch (error: any) { throw createError({ statusCode: 400, statusMessage: error?.message || 'Invalid filename' }) }
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (!imageExtensions.has(ext)) throw createError({ statusCode: 415, statusMessage: 'Unsupported image format' })
  if (ext === 'svg') {
    const checked = validateSvg(file.data)
    if (!checked.ok) throw createError({ statusCode: 400, statusMessage: checked.reason || 'Unsafe SVG' })
  }
  const target = dataPath('images', name)
  try {
    await access(target)
    throw createError({ statusCode: 409, statusMessage: `File "${name}" already exists` })
  } catch (error: any) {
    if (error?.statusCode === 409) throw error
    if (error?.code && error.code !== 'ENOENT') throw error
  }
  await writeFile(target, file.data, { flag: 'wx' })
  return { ok: true, name }
})
