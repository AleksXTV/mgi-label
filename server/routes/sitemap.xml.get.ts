import { getRequestURL, setHeader } from 'h3'
import type { SiteConfig } from '../../shared/types'
import { readJsonCached } from '../utils/files'
import { dataPath } from '../utils/paths'

function esc(value: string) { return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

export default defineEventHandler(async (event) => {
  const origin = getRequestURL(event).origin
  const site = await readJsonCached<SiteConfig>(dataPath('site.json'))
  const urls = site.menu.filter((x) => x.enabled).sort((a,b) => a.order - b.order).map((x) => `<url><loc>${esc(origin + x.route)}</loc></url>`).join('')
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
})
