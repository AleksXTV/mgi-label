<script setup lang="ts">
import { absoluteMediaUrl } from '~/utils/content'

const { data: site, error } = await useSiteConfig()
const menuOpen = ref(false)
const siteRef = computed(() => site.value)
const language = useLanguage(siteRef)
const theme = useTheme(siteRef)

function imageMime(filename: string): string | undefined {
  const ext = filename.split('.').pop()?.toLowerCase()
  const mime: Record<string, string> = {
    svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    webp: 'image/webp', avif: 'image/avif', gif: 'image/gif', apng: 'image/apng'
  }
  return ext ? mime[ext] : undefined
}

useHead(() => {
  const favicon = site.value?.branding?.favicon
  return {
    htmlAttrs: {
      lang: language.value,
      'data-theme': theme.value
    },
    bodyAttrs: { class: menuOpen.value ? 'menu-is-open' : '' },
    meta: [{ name: 'theme-color', content: theme.value === 'dark' ? '#202126' : '#eeeae1' }],
    link: favicon
      ? [{ key: 'mgi-favicon', rel: 'icon', type: imageMime(favicon), href: absoluteMediaUrl(favicon) }]
      : [{ key: 'mgi-favicon', rel: 'icon', type: 'image/svg+xml', href: '/brand/favicon.svg' }]
  }
})
</script>

<template>
  <div v-if="site" class="site-shell">
    <AppHeader :site="site" @menu="menuOpen = true" />
    <SideMenu :site="site" :open="menuOpen" @close="menuOpen = false" />
    <main class="site-main"><slot /></main>
  </div>
  <div v-else class="fatal-content-error">
    <p>Unable to load site configuration.</p>
    <pre v-if="error">{{ error.message }}</pre>
  </div>
</template>
