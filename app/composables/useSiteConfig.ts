import type { SiteConfig } from '#shared/types'

export function useSiteConfig() {
  return useAsyncData<SiteConfig>('mgi-site-config', () => $fetch('/api/content/site'))
}
