<script setup lang="ts">
const { data: site, error } = await useSiteConfig()
const menuOpen = ref(false)
const siteRef = computed(() => site.value)
const language = useLanguage(siteRef)
const theme = useTheme(siteRef)

useHead(() => ({
  htmlAttrs: {
    lang: language.value,
    'data-theme': theme.value
  },
  bodyAttrs: { class: menuOpen.value ? 'menu-is-open' : '' },
  meta: [{ name: 'theme-color', content: theme.value === 'dark' ? '#1b1c1e' : '#eeeae1' }]
}))
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
