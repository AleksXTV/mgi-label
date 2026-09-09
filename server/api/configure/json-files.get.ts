import type { SiteConfig } from '../../../shared/types'
import { requireAdmin } from '../../utils/auth'
import { readJsonCached } from '../../utils/files'
import { dataPath } from '../../utils/paths'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const site = await readJsonCached<SiteConfig>(dataPath('site.json'))
  const pages = [...new Set(site.menu.map((x) => x.page))].sort()
  return ['site.json', ...pages.map((page) => `pages/${page}.json`)]
})
