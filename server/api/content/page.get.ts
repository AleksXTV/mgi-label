import { existsSync } from 'node:fs'
import { createError, getQuery, setHeader } from 'h3'
import type { ContentPage, SiteConfig } from '../../../shared/types'
import { readJsonCached } from '../../utils/files'
import { dataPath } from '../../utils/paths'

export default defineEventHandler(async (event) => {
  const route = String(getQuery(event).route || '/')
  const site = await readJsonCached<SiteConfig>(dataPath('site.json'))
  const item = site.menu.find((x) => x.route === route)
  if (!item) throw createError({ statusCode: 404, statusMessage: 'Page not found' })
  const file = dataPath('pages', `${item.page}.json`)
  if (!existsSync(file)) throw createError({ statusCode: 404, statusMessage: 'Page content not found' })
  const page = await readJsonCached<ContentPage>(file)
  if (!page.enabled) throw createError({ statusCode: 404, statusMessage: 'Page disabled' })
  setHeader(event, 'Cache-Control', 'no-cache')
  return { site, menuItem: item, page }
})
