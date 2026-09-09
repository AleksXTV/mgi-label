import { readdir, readFile } from 'node:fs/promises'
import { dataPath } from './paths'

export function normalizeUploadName(name: string): string {
  if (!name || name.includes('/') || name.includes('\\') || name.includes('..')) throw new Error('Invalid filename')
  const lastDot = name.lastIndexOf('.')
  if (lastDot <= 0) throw new Error('File extension is required')
  const base = name.slice(0, lastDot).trim().toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\p{L}\p{N}._-]+/gu, '_')
    .replace(/_+/g, '_')
    .replace(/^[_\.]+|[_\.]+$/g, '')
  const ext = name.slice(lastDot + 1).trim().toLowerCase()
  if (!base || !ext) throw new Error('Invalid filename')
  return `${base}.${ext}`
}

export function validateSvg(buffer: Buffer): { ok: boolean, reason?: string } {
  const text = buffer.toString('utf8')
  const dangerous = [
    /<script\b/i,
    /\bon[a-z]+\s*=/i,
    /javascript\s*:/i,
    /<foreignObject\b/i,
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i
  ]
  for (const pattern of dangerous) if (pattern.test(text)) return { ok: false, reason: 'SVG contains active or unsafe content' }
  if (!/<svg\b/i.test(text)) return { ok: false, reason: 'Invalid SVG document' }
  return { ok: true }
}

export async function imageUsages(filename: string): Promise<Array<{ file: string, block?: string }>> {
  const result: Array<{ file: string, block?: string }> = []
  try {
    const siteText = await readFile(dataPath('site.json'), 'utf8')
    if (siteText.includes(filename)) result.push({ file: 'site.json' })
  } catch {}
  try {
    const files = (await readdir(dataPath('pages'))).filter((x) => x.endsWith('.json'))
    for (const file of files) {
      try {
        const page = JSON.parse(await readFile(dataPath('pages', file), 'utf8'))
        if (page?.seo?.image === filename) result.push({ file, block: 'seo' })
        for (const block of page?.blocks || []) {
          if ((block.media || []).some((media: any) => media?.source === filename)) result.push({ file, block: block.id })
        }
      } catch {}
    }
  } catch {}
  return result
}
