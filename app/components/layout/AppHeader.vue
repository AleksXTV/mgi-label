<script setup lang="ts">
import type { SiteConfig } from '#shared/types'
import { localize } from '~/utils/content'

const props = defineProps<{ site: SiteConfig }>()
const emit = defineEmits<{ menu: [] }>()
const siteRef = computed(() => props.site)
const language = useLanguage(siteRef)
const theme = useTheme(siteRef)
const languages = computed(() => [...props.site.languages].filter(x => x.enabled).sort((a,b) => a.order - b.order))
const themes = computed(() => [...props.site.themes].filter(x => x.enabled).sort((a,b) => a.order - b.order))
</script>

<template>
  <header class="site-header">
    <button class="menu-trigger" type="button" aria-label="Open menu" @click="emit('menu')">
      <span></span><span></span><span></span>
    </button>

    <NuxtLink to="/" class="brand-lockup" aria-label="M.G.I. Records home">
      <img src="/brand/logo.svg" alt="" class="brand-mark" />
      <span>M.G.I. Records</span>
    </NuxtLink>

    <div class="header-controls">
      <label class="compact-select language-select">
        <span class="sr-only">Language</span>
        <select v-model="language" aria-label="Language">
          <option v-for="item in languages" :key="item.code" :value="item.code">{{ item.flag }} {{ item.label }}</option>
        </select>
      </label>

      <label class="compact-select theme-select">
        <span class="sr-only">Theme</span>
        <select v-model="theme" aria-label="Theme">
          <option v-for="item in themes" :key="item.id" :value="item.id">
            {{ item.icon === 'sun' ? '☀' : item.icon === 'moon' ? '☾' : '◐' }} {{ localize(item.name, language, props.site.defaultLanguage).toUpperCase() }}
          </option>
        </select>
      </label>
    </div>
  </header>
</template>
