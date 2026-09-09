import { readFile } from 'node:fs/promises'
import { createError, getRouterParam, setHeader } from 'h3'
import { dataPath } from '../../utils/paths'
import { isSafeImageFilename } from '../../utils/validation'

const MIME: Record<string, string> = {
  avif: 'image/avif', webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  apng: 'image/apng', gif: 'image/gif', svg: 'image/svg+xml', mp3: 'audio/mpeg', ogg: 'audio/ogg',
  wav: 'audio/wav', m4a: 'audio/mp4', aac: 'audio/aac', flac: 'audio/flac'
}

export default defineEventHandler(async (event) => {
  const filename = decodeURIComponent(getRouterParam(event, 'filename') || '')
  if (!filename || filename.includes('/') || filename.includes('\\') || filename.includes('..')) throw createError({ statusCode: 400, statusMessage: 'Invalid filename' })
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  if (!MIME[ext]) throw createError({ statusCode: 415, statusMessage: 'Unsupported media type' })
  try {
    const buffer = await readFile(dataPath('images', filename))
    setHeader(event, 'Content-Type', MIME[ext])
    setHeader(event, 'Cache-Control', 'public, max-age=3600, must-revalidate')
    return buffer
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Media not found' })
  }
})
