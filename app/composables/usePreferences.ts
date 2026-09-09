import type { SiteConfig } from '#shared/types'

export function useLanguage(site: Ref<SiteConfig | null | undefined> | ComputedRef<SiteConfig | null | undefined>) {
  const cookie = useCookie<string | null>('mgi-language', { sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  const state = useState<string | null>('mgi-language-state', () => cookie.value || null)
  const fallback = computed(() => site.value?.defaultLanguage || 'en')
  return computed({
    get() {
      const enabled = site.value?.languages?.filter((x) => x.enabled).map((x) => x.code) || []
      const candidate = state.value || cookie.value
      return candidate && enabled.includes(candidate) ? candidate : fallback.value
    },
    set(value: string) {
      state.value = value
      cookie.value = value
    }
  })
}

export function useTheme(site: Ref<SiteConfig | null | undefined> | ComputedRef<SiteConfig | null | undefined>) {
  const cookie = useCookie<string | null>('mgi-theme', { sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  const state = useState<string | null>('mgi-theme-state', () => cookie.value || null)
  const fallback = computed(() => site.value?.defaultTheme || 'dark')
  return computed({
    get() {
      const enabled = site.value?.themes?.filter((x) => x.enabled).map((x) => x.id) || []
      const candidate = state.value || cookie.value
      return candidate && enabled.includes(candidate) ? candidate : fallback.value
    },
    set(value: string) {
      state.value = value
      cookie.value = value
    }
  })
}
