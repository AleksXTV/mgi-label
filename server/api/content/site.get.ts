import type { SiteConfig } from '../../../shared/types'
import { readJsonCached } from '../../utils/files'
import { dataPath } from '../../utils/paths'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-cache')
  return readJsonCached<SiteConfig>(dataPath('site.json'))
})
