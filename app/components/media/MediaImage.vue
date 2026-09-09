<script setup lang="ts">
import type { MediaItem } from '#shared/types'
import { absoluteMediaUrl, localize } from '~/utils/content'

const props = defineProps<{ item: MediaItem, language: string, fallback: string }>()
const open = ref(false)
const src = computed(() => absoluteMediaUrl(props.item.source))
const alt = computed(() => localize(props.item.alt, props.language, props.fallback) || localize(props.item.title, props.language, props.fallback))
</script>

<template>
  <figure class="media-image-wrap">
    <button type="button" class="media-image-button" @click="open = true">
      <img :src="src" :alt="alt" loading="lazy" decoding="async" />
      <span class="media-expand" aria-hidden="true">＋</span>
    </button>
    <figcaption v-if="item.title || item.description" class="media-caption">
      <strong v-if="item.title">{{ localize(item.title, language, fallback) }}</strong>
    </figcaption>
    <ImageLightbox :open="open" :src="src" :alt="alt" :target="item.target" @close="open = false" />
  </figure>
</template>
