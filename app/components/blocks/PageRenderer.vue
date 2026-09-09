<script setup lang="ts">
import type { ContentPage, MenuItem, SiteConfig } from '#shared/types'
import { absoluteMediaUrl, localize } from '~/utils/content'

const props = defineProps<{ routePath: string }>()
const key = computed(() => `mgi-page:${props.routePath}`)
const { data, error } = await useAsyncData(key.value, () => $fetch<{ site: SiteConfig, menuItem: MenuItem, page: ContentPage }>('/api/content/page', { query: { route: props.routePath } }), { watch: [() => props.routePath] })

if (error.value) {
  throw createError({ statusCode: (error.value as any)?.statusCode || 404, statusMessage: (error.value as any)?.statusMessage || 'Page not found' })
}

const site = computed(() => data.value?.site)
const page = computed(() => data.value?.page)
const language = useLanguage(site)
const fallback = computed(() => site.value?.defaultLanguage || 'en')
const siteUrl = useRuntimeConfig().public.siteUrl as string
const requestUrl = useRequestURL()
const canonicalOrigin = computed(() => siteUrl || requestUrl.origin)

useSeoMeta(() => {
  const p = page.value
  const title = localize(p?.seo?.title, language.value, fallback.value) || 'M.G.I. Records'
  const description = localize(p?.seo?.description, language.value, fallback.value)
  const image = p?.seo?.image ? absoluteMediaUrl(p.seo.image) : ''
  const absoluteImage = image ? new URL(image, canonicalOrigin.value).toString() : ''
  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: absoluteImage || undefined,
    ogType: 'website',
    twitterCard: image ? 'summary_large_image' : 'summary'
  }
})

useHead(() => ({
  link: [{ rel: 'canonical', href: new URL(props.routePath, canonicalOrigin.value).toString() }]
}))
</script>

<template>
  <div v-if="page && site" class="page-composition">
    <BlockRenderer
      v-for="(block, index) in page.blocks.filter(x => x.enabled)"
      :key="block.id"
      :block="block"
      :language="language"
      :fallback="fallback"
      :index="index"
    />
  </div>
</template>
