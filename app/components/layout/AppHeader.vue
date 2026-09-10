<script setup lang="ts">
import type { SiteConfig } from '#shared/types'
import { absoluteMediaUrl, localize } from '~/utils/content'

const props = defineProps<{ site: SiteConfig }>()
const emit = defineEmits<{ menu: [] }>()
const siteRef = computed(() => props.site)
const language = useLanguage(siteRef)
const theme = useTheme(siteRef)

const languages = computed(() => [...props.site.languages]
  .filter((item) => item.enabled)
  .sort((a, b) => a.order - b.order)
  .map((item) => ({ value: item.code, label: item.label, icon: item.flag })))

const themes = computed(() => [...props.site.themes]
  .filter((item) => item.enabled)
  .sort((a, b) => a.order - b.order)
  .map((item) => ({
    value: item.id,
    label: localize(item.name, language.value, props.site.defaultLanguage).toUpperCase(),
    icon: item.icon === 'sun' ? '☀' : item.icon === 'moon' ? '☾' : '◐'
  })))

const logoSrc = computed(() => props.site.branding?.logo
  ? absoluteMediaUrl(props.site.branding.logo)
  : '/brand/logo.svg')
</script>

<template>
  <header class="site-header">
    <button class="menu-trigger" type="button" aria-label="Open menu" @click="emit('menu')">
      <span></span><span></span><span></span>
    </button>

    <NuxtLink to="/" class="brand-lockup" aria-label="M.G.I. Records home">
      <img :src="logoSrc" alt="" class="brand-mark" />
      <span>M.G.I. Records</span>
    </NuxtLink>

    <div class="header-controls">
      <CompactDropdown v-model="language" :options="languages" aria-label="Language" />
      <CompactDropdown v-model="theme" :options="themes" aria-label="Theme" />
    </div>
  </header>
</template>
