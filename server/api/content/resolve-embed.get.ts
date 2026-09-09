import { createError, getQuery } from 'h3'

function hostAllowed(host: string) {
  return host === 'bandcamp.com' || host.endsWith('.bandcamp.com')
}

export default defineEventHandler(async (event) => {
  const raw = String(getQuery(event).url || '')
  let url: URL
  try { url = new URL(raw) } catch { throw createError({ statusCode: 400, statusMessage: 'Invalid URL' }) }
  if (!hostAllowed(url.hostname)) throw createError({ statusCode: 400, statusMessage: 'Only Bandcamp URLs are supported by this resolver' })
  try {
    const html = await $fetch<string>(url.toString(), { responseType: 'text', timeout: 5000, headers: { 'user-agent': 'M.G.I. Records embed resolver/1.0' } })
    const tralbum = html.match(/data-tralbum="([^"]+)"/i)?.[1]
    if (!tralbum) throw new Error('Bandcamp metadata not found')
    const decoded = tralbum.replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    const data = JSON.parse(decoded)
    const current = data.current || {}
    const id = current.id || data.id
    const type = current.type || data.item_type
    if (!id || !['album', 'track'].includes(type)) throw new Error('Unsupported Bandcamp item')
    return { provider: 'bandcamp', embedUrl: `https://bandcamp.com/EmbeddedPlayer/${type}=${id}/size=large/bgcol=ffffff/linkcol=333333/transparent=true/` }
  } catch {
    return { provider: 'bandcamp', embedUrl: null }
  }
})
